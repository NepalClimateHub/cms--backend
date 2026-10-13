import { Test } from "@nestjs/testing";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { MediaKind, MediaStatus, UserType } from "@prisma/client";

import { BlogService } from "./blog.service";
import { BlogMediaService } from "./blog-media.service";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { NotificationService } from "../../notification/notification.service";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateBlogDto, UpdateBlogDto } from "../dto/blog.dto";

const WRITER = "writer-1";
const OTHER = "writer-2";
const ADMIN = "admin-1";
const IMG_A = "https://ik.imagekit.io/nch/a.jpg";
const IMG_B = "https://ik.imagekit.io/nch/b.jpg";
const BANNER = "https://ik.imagekit.io/nch/banner.jpg";

function ctxFor(id: string, userType: UserType): RequestContext {
  const ctx = new RequestContext();
  ctx.user = { id, userType } as RequestContext["user"];
  return ctx;
}

function figure(src: string, alt: string, caption?: string): string {
  const figcaption = caption ? `<figcaption>${caption}</figcaption>` : "";
  return `<figure><img src="${src}" alt="${alt}">${figcaption}</figure>`;
}

function createDto(content: string, bannerImageUrl?: string): CreateBlogDto {
  return Object.assign(new CreateBlogDto(), {
    title: "t",
    content,
    author: "W",
    category: "x",
    isDraft: false,
    bannerImageUrl,
    bannerImageId: bannerImageUrl ? "file_banner" : undefined,
  });
}

function updateDto(fields: Partial<UpdateBlogDto>): UpdateBlogDto {
  return Object.assign(new UpdateBlogDto(), fields);
}

describe("BlogService media ownership and cleanup", () => {
  let service: BlogService;
  const prisma = {
    blog: { create: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
    media: { findFirst: jest.fn(), upsert: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (tx: unknown) => unknown) => callback(prisma),
    );
    prisma.media.findFirst.mockResolvedValue(null);
    prisma.blog.create.mockImplementation(({ data }: { data: object }) => ({
      id: "blog-1",
      title: "t",
      ...data,
    }));
    prisma.blog.update.mockImplementation(({ data }: { data: object }) => ({
      id: "blog-1",
      title: "t",
      ...data,
    }));
    prisma.blog.findFirst.mockResolvedValue({
      id: "blog-1",
      authorId: WRITER,
      bannerImageUrl: BANNER,
      bannerImageId: "file_banner",
      approvedByAdmin: true,
      status: "PUBLISHED",
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        BlogService,
        BlogMediaService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: { notifyBlogReview: jest.fn() } },
        { provide: ActivityLogService, useValue: { logActivity: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(BlogService);
  });

  const writer = () => ctxFor(WRITER, UserType.INDIVIDUAL);

  describe("create", () => {
    it("upserts owned media rows for content images and the banner", async () => {
      const content = figure(IMG_A, "Alt A", "Caption A") + figure(IMG_B, "Alt B");

      await service.createBlog(createDto(content, BANNER), writer());

      expect(prisma.media.upsert).toHaveBeenCalledTimes(3);
      expect(prisma.media.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { url: IMG_A },
          create: expect.objectContaining({
            url: IMG_A,
            ownerId: WRITER,
            blogId: "blog-1",
            kind: MediaKind.INLINE,
            alt: "Alt A",
            caption: "Caption A",
            status: MediaStatus.ACTIVE,
          }),
        }),
      );
      expect(prisma.media.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { url: BANNER },
          create: expect.objectContaining({
            kind: MediaKind.BANNER,
            imageKitFileId: "file_banner",
            ownerId: WRITER,
          }),
        }),
      );
    });

    it("does not touch media when content has no tracked images", async () => {
      await service.createBlog(createDto("<p>text</p>"), writer());

      expect(prisma.media.upsert).not.toHaveBeenCalled();
      expect(prisma.media.findFirst).not.toHaveBeenCalled();
    });

    it("rejects content referencing media owned by another user", async () => {
      prisma.media.findFirst.mockResolvedValue({ id: "media-x" });

      await expect(
        service.createBlog(createDto(figure(IMG_A, "a")), writer()),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.blog.create).not.toHaveBeenCalled();
      expect(prisma.media.upsert).not.toHaveBeenCalled();
      expect(prisma.media.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { url: { in: [IMG_A] }, ownerId: { not: WRITER } },
        }),
      );
    });

    it.each([UserType.ADMIN, UserType.SUPER_ADMIN, UserType.CONTENT_ADMIN])(
      "lets %s reference media owned by others",
      async (role) => {
        prisma.media.findFirst.mockResolvedValue({ id: "media-x" });

        await service.createBlog(
          createDto(figure(IMG_A, "a")),
          ctxFor(ADMIN, role),
        );

        expect(prisma.media.findFirst).not.toHaveBeenCalled();
        expect(prisma.media.upsert).toHaveBeenCalledTimes(1);
      },
    );

    it("rejects invalid metadata without persisting", async () => {
      const content = figure(IMG_A, "a", "c".repeat(501));

      await expect(
        service.createBlog(createDto(content), writer()),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.blog.create).not.toHaveBeenCalled();
    });

    it("keeps the response shape", async () => {
      const result = await service.createBlog(
        createDto(figure(IMG_A, "a")),
        writer(),
      );

      expect(Object.keys(result)).not.toContain("media");
    });
  });

  describe("update", () => {
    it("marks media no longer referenced as ORPHANED", async () => {
      await service.updateBlog(
        "blog-1",
        updateDto({ content: figure(IMG_B, "b") }),
        writer(),
      );

      expect(prisma.media.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.media.updateMany).toHaveBeenCalledWith({
        where: {
          blogId: "blog-1",
          status: MediaStatus.ACTIVE,
          kind: { in: [MediaKind.INLINE, MediaKind.BANNER] },
          url: { notIn: [IMG_B, BANNER] },
        },
        data: { status: MediaStatus.ORPHANED },
      });
    });

    it("orphans the banner when it is cleared and leaves inline media alone", async () => {
      await service.updateBlog(
        "blog-1",
        updateDto({ bannerImageUrl: "" }),
        writer(),
      );

      expect(prisma.media.upsert).not.toHaveBeenCalled();
      expect(prisma.media.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          kind: { in: [MediaKind.BANNER] },
          url: { notIn: [] },
        }),
        data: { status: MediaStatus.ORPHANED },
      });
    });

    it("persists a null banner and orphans the banner media on explicit null", async () => {
      await service.updateBlog(
        "blog-1",
        updateDto({ bannerImageUrl: null, bannerImageId: null } as unknown as UpdateBlogDto),
        writer(),
      );

      const data = prisma.blog.update.mock.calls[0][0].data;
      expect(data.bannerImageUrl).toBeNull();
      expect(data.bannerImageId).toBeNull();
      expect(prisma.media.upsert).not.toHaveBeenCalled();
      expect(prisma.media.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ kind: { in: [MediaKind.BANNER] } }),
        data: { status: MediaStatus.ORPHANED },
      });
    });

    it("accepts null banner fields at DTO validation", async () => {
      const dto = plainToInstance(UpdateBlogDto, {
        bannerImageUrl: null,
        bannerImageId: null,
      });
      const errors = await validate(dto);
      expect(errors.map((error) => error.property)).not.toContain(
        "bannerImageUrl",
      );
      expect(errors.map((error) => error.property)).not.toContain(
        "bannerImageId",
      );
    });

    it("does not touch media when neither content nor banner changes", async () => {
      await service.updateBlog("blog-1", updateDto({ title: "new" }), writer());

      expect(prisma.media.upsert).not.toHaveBeenCalled();
      expect(prisma.media.updateMany).not.toHaveBeenCalled();
    });

    it("rejects cross-user media and does not mutate the blog", async () => {
      prisma.media.findFirst.mockResolvedValue({ id: "media-x" });

      await expect(
        service.updateBlog(
          "blog-1",
          updateDto({ content: figure(IMG_A, "a") }),
          writer(),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.blog.update).not.toHaveBeenCalled();
      expect(prisma.media.upsert).not.toHaveBeenCalled();
      expect(prisma.media.updateMany).not.toHaveBeenCalled();
    });

    it("attributes new media to the blog author when staff edit", async () => {
      await service.updateBlog(
        "blog-1",
        updateDto({ content: figure(IMG_A, "a") }),
        ctxFor(ADMIN, UserType.CONTENT_ADMIN),
      );

      expect(prisma.media.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ ownerId: WRITER }),
        }),
      );
      expect(prisma.media.findFirst).not.toHaveBeenCalled();
    });

    it("never rewrites the owner of an existing media row", async () => {
      await service.updateBlog(
        "blog-1",
        updateDto({ content: figure(IMG_A, "a") }),
        writer(),
      );

      const [{ update }] = prisma.media.upsert.mock.calls[0];
      expect(update).not.toHaveProperty("ownerId");
      expect(update.status).toBe(MediaStatus.ACTIVE);
    });
  });

  describe("delete", () => {
    it("soft deletes the blog and marks its media ORPHANED in one transaction", async () => {
      await service.deleteBlog("blog-1", writer());

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.media.updateMany).toHaveBeenCalledWith({
        where: { blogId: "blog-1", status: MediaStatus.ACTIVE },
        data: { status: MediaStatus.ORPHANED },
      });
    });

    it("does not orphan media when another user tries to delete", async () => {
      await expect(
        service.deleteBlog("blog-1", ctxFor(OTHER, UserType.INDIVIDUAL)),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.media.updateMany).not.toHaveBeenCalled();
    });
  });
});
