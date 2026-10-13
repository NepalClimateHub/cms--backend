import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ContentStatus, UserType } from "@prisma/client";

import { BlogService } from "./blog.service";
import { BlogMediaService } from "./blog-media.service";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { NotificationService } from "../../notification/notification.service";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { CreateBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import {
  BLOG_CONTENT_MAX_IMAGES,
  BLOG_CONTENT_MAX_LENGTH,
} from "../blog-content.sanitizer";

const WRITER_ID = "writer-1";
const OTHER_WRITER_ID = "writer-2";
const ADMIN_ID = "admin-1";

function ctxFor(id: string, userType: UserType): RequestContext {
  const ctx = new RequestContext();
  ctx.user = { id, userType } as RequestContext["user"];
  return ctx;
}

const IMG = "https://ik.imagekit.io/nch/photo.jpg";
const TIPTAP_CONTENT = [
  "<h2>Heading</h2>",
  '<p style="text-align: center">Text with <strong>bold</strong> and <a href="https://example.org" target="_blank" rel="noopener noreferrer nofollow">a link</a><br>break</p>',
  "<ul><li><p>item</p></li></ul>",
  "<blockquote><p>quote</p></blockquote>",
  '<pre><code class="language-ts">const a = 1;</code></pre>',
  `<figure data-layout="wide"><img src="${IMG}" alt="Photo" width="1200" height="800"><figcaption>Caption<cite>Credit</cite></figcaption></figure>`,
  `<div data-layout="two-up"><figure><img src="${IMG}" alt="L" width="600" height="400"></figure><figure><img src="${IMG}" alt="R" width="600" height="400"></figure></div>`,
].join("");

const HOSTILE_CONTENT: [string, string, string][] = [
  ["script element", "<p>a</p><script>alert(1)</script>", "<p>a</p>"],
  ["event handler", '<p onclick="alert(1)">a</p>', "<p>a</p>"],
  [
    "img onerror",
    `<figure><img src="${IMG}" alt="x" onerror="alert(1)"></figure>`,
    `<figure><img src="${IMG}" alt="x"></figure>`,
  ],
  ["javascript href", '<a href="javascript:alert(1)">x</a>', "<a>x</a>"],
  ["data href", '<a href="data:text/html,x">x</a>', "<a>x</a>"],
  ["iframe", '<iframe src="https://evil.example"></iframe><p>a</p>', "<p>a</p>"],
  [
    "style url()",
    '<p style="background: url(https://evil.example/x.png)">a</p>',
    "<p>a</p>",
  ],
  [
    "style expression()",
    '<p style="width: expression(alert(1))">a</p>',
    "<p>a</p>",
  ],
  ["unapproved attributes", '<p class="x" id="y" data-x="1">a</p>', "<p>a</p>"],
  [
    "blob img src",
    '<figure><img src="blob:https://x/1" alt="x"></figure>',
    "<figure></figure>",
  ],
  [
    "data img src",
    '<figure><img src="data:text/html;base64,PHNjcmlwdD4=" alt="x"></figure>',
    "<figure></figure>",
  ],
];

function createDto(content: string): CreateBlogDto {
  return Object.assign(new CreateBlogDto(), {
    title: "t",
    content,
    author: "W",
    category: "x",
    isDraft: false,
  });
}

function updateDto(content: string): UpdateBlogDto {
  return Object.assign(new UpdateBlogDto(), { content });
}

describe("BlogService — approval workflow", () => {
  let service: BlogService;
  const prisma = {
    blog: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    media: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const notification = { notifyBlogReview: jest.fn() };
  const activity = { logActivity: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback: (tx: unknown) => unknown) =>
      callback(prisma),
    );
    prisma.media.findFirst.mockResolvedValue(null);
    // create/update echo back the data they were called with
    prisma.blog.create.mockImplementation(({ data }: any) => ({
      id: "blog-1",
      title: "t",
      ...data,
    }));
    prisma.blog.update.mockImplementation(({ data }: any) => ({
      id: "blog-1",
      title: "t",
      ...data,
    }));

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        BlogMediaService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notification },
        { provide: ActivityLogService, useValue: activity },
      ],
    }).compile();
    service = moduleRef.get(BlogService);
  });

  // ── Case 1: writer first submit → UNDER_REVIEW; admin approves → PUBLISHED ──
  it("writer submit (isDraft=false) goes UNDER_REVIEW, not approved", async () => {
    await service.createBlog(
      { title: "t", content: "c", author: "W", category: "x", isDraft: false } as any,
      ctxFor(WRITER_ID, UserType.INDIVIDUAL),
    );
    const data = prisma.blog.create.mock.calls[0][0].data;
    expect(data.status).toBe(ContentStatus.UNDER_REVIEW);
    expect(data.approvedByAdmin).toBe(false);
  });

  it("uses the existing content exclusion option and selects only serialized author/category fields", async () => {
    prisma.blog.findMany.mockResolvedValue([]);
    prisma.blog.count.mockResolvedValue(0);

    await service.findAllBlogs({ excludeContent: true } as any);

    const query = prisma.blog.findMany.mock.calls[0][0];
    expect(query.omit).toEqual({ content: true });
    expect(query.include.authorUser.select).toEqual({
      id: true,
      socials: true,
      currentRole: true,
      fullName: true,
      email: true,
      bio: true,
      profilePhotoUrl: true,
    });
    expect(query.include.categoryData.select).toEqual({
      id: true,
      name: true,
      description: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    });
  });

  it("uses the compact card projection for summary listings", async () => {
    prisma.blog.findMany.mockResolvedValue([
      {
        id: "blog-1",
        title: "A compact blog",
        excerpt: "Card text",
        author: "Writer",
        category: "Climate Science",
        readingTime: "3 min",
        publishedDate: new Date("2026-01-01"),
        isFeatured: false,
        isTopRead: true,
        bannerImageUrl: "https://images.example/blog.jpg",
        authorUser: {
          profilePhotoUrl: "https://images.example/author.jpg",
          email: "private@example.com",
          bio: "Private author bio",
        },
        content: "A full body must never escape through the summary DTO",
        tags: [{ tag: "Private tag metadata" }],
      },
    ]);
    prisma.blog.count.mockResolvedValue(0);

    const result = await service.findAllBlogs({ view: "summary" } as any);

    const query = prisma.blog.findMany.mock.calls[0][0];
    expect(query.select).toEqual({
      id: true,
      title: true,
      excerpt: true,
      author: true,
      category: true,
      readingTime: true,
      publishedDate: true,
      isFeatured: true,
      isTopRead: true,
      bannerImageUrl: true,
      authorUser: { select: { profilePhotoUrl: true } },
    });
    expect(query).not.toHaveProperty("include");
    expect(query).not.toHaveProperty("omit");
    expect(result.blogs[0]).toEqual({
      id: "blog-1",
      title: "A compact blog",
      excerpt: "Card text",
      author: "Writer",
      category: "Climate Science",
      readingTime: "3 min",
      publishedDate: new Date("2026-01-01"),
      isFeatured: false,
      isTopRead: true,
      bannerImageUrl: "https://images.example/blog.jpg",
      authorUser: { profilePhotoUrl: "https://images.example/author.jpg" },
    });
  });

  it("caches anonymous summary listings but not authenticated reads", async () => {
    prisma.blog.findMany.mockResolvedValue([]);
    prisma.blog.count.mockResolvedValue(0);

    await service.findAllBlogs({ view: "summary", limit: 12, offset: 0 } as any);
    await service.findAllBlogs({ view: "summary", limit: 12, offset: 0 } as any);
    await service.findAllBlogs(
      { view: "summary", limit: 12, offset: 0 } as any,
      ctxFor(ADMIN_ID, UserType.ADMIN),
      false,
    );

    expect(prisma.blog.findMany).toHaveBeenCalledTimes(2);
    expect(prisma.blog.count).toHaveBeenCalledTimes(2);
  });

  it("invalidates cached summaries after a blog update", async () => {
    prisma.blog.findMany.mockResolvedValue([]);
    prisma.blog.count.mockResolvedValue(0);
    prisma.blog.findFirst.mockResolvedValue({
      id: "blog-1",
      authorId: WRITER_ID,
      approvedByAdmin: true,
      status: ContentStatus.PUBLISHED,
    });
    prisma.blog.update.mockResolvedValue({
      id: "blog-1",
      title: "Updated title",
      author: "Writer",
      category: "Environment",
      content: "Body",
      isDraft: false,
      isFeatured: false,
      isTopRead: false,
      approvedByAdmin: true,
      status: ContentStatus.PUBLISHED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.findAllBlogs({ view: "summary", limit: 12, offset: 0 } as any);
    await service.updateBlog(
      "blog-1",
      { title: "Updated title" } as any,
      ctxFor(WRITER_ID, UserType.INDIVIDUAL),
    );
    await service.findAllBlogs({ view: "summary", limit: 12, offset: 0 } as any);

    expect(prisma.blog.findMany).toHaveBeenCalledTimes(2);
    expect(prisma.blog.count).toHaveBeenCalledTimes(2);
  });

  it("admin approves a blog → PUBLISHED + author notified", async () => {
    prisma.blog.findFirst.mockResolvedValue({ id: "blog-1", authorId: WRITER_ID });
    await service.blogAction(
      "blog-1",
      "approve",
      ctxFor(ADMIN_ID, UserType.CONTENT_ADMIN),
      "ok",
    );
    const data = prisma.blog.update.mock.calls[0][0].data;
    expect(data.status).toBe(ContentStatus.PUBLISHED);
    expect(data.approvedByAdmin).toBe(true);
    expect(notification.notifyBlogReview).toHaveBeenCalledWith(
      WRITER_ID,
      "blog-1",
      expect.any(String),
      "approve",
    );
  });

  // ── Case 2: writer edits own PUBLISHED blog → stays live, no reapproval ──
  it("writer editing own published blog stays PUBLISHED (no reapproval)", async () => {
    prisma.blog.findFirst.mockResolvedValue({
      id: "blog-1",
      authorId: WRITER_ID,
      approvedByAdmin: true,
      status: ContentStatus.PUBLISHED,
    });
    await service.updateBlog(
      "blog-1",
      { content: "new section", isDraft: false } as any,
      ctxFor(WRITER_ID, UserType.INDIVIDUAL),
    );
    const data = prisma.blog.update.mock.calls[0][0].data;
    expect(data.status).toBe(ContentStatus.PUBLISHED);
    expect(data.approvedByAdmin).toBe(true);
  });

  it("writer editing own NON-published blog goes UNDER_REVIEW", async () => {
    prisma.blog.findFirst.mockResolvedValue({
      id: "blog-1",
      authorId: WRITER_ID,
      approvedByAdmin: false,
      status: ContentStatus.REJECTED,
    });
    await service.updateBlog(
      "blog-1",
      { content: "c", isDraft: false } as any,
      ctxFor(WRITER_ID, UserType.INDIVIDUAL),
    );
    expect(prisma.blog.update.mock.calls[0][0].data.status).toBe(
      ContentStatus.UNDER_REVIEW,
    );
  });

  // ── Feature 1: admin edits writer's blog → stays published under writer ──
  it("admin editing another writer's blog keeps it PUBLISHED and cannot change author", async () => {
    prisma.blog.findFirst.mockResolvedValue({
      id: "blog-1",
      authorId: WRITER_ID,
      approvedByAdmin: true,
      status: ContentStatus.PUBLISHED,
    });
    await service.updateBlog(
      "blog-1",
      { content: "fixed typo", author: "Admin Name", isDraft: false } as any,
      ctxFor(ADMIN_ID, UserType.CONTENT_ADMIN),
    );
    const data = prisma.blog.update.mock.calls[0][0].data;
    expect(data.status).toBe(ContentStatus.PUBLISHED);
    expect(data.author).toBeUndefined(); // author name not overwritten
    expect(data.authorId).toBeUndefined(); // relation untouched
  });

  // ── Feature 2: content admin's own blog → directly published, no approval ──
  it("content admin create (isDraft=false) is directly PUBLISHED", async () => {
    await service.createBlog(
      { title: "t", content: "c", author: "A", category: "x", isDraft: false } as any,
      ctxFor(ADMIN_ID, UserType.CONTENT_ADMIN),
    );
    const data = prisma.blog.create.mock.calls[0][0].data;
    expect(data.status).toBe(ContentStatus.PUBLISHED);
    expect(data.approvedByAdmin).toBe(true);
  });

  it("content admin editing own draft (isDraft=false) is directly PUBLISHED", async () => {
    prisma.blog.findFirst.mockResolvedValue({
      id: "blog-1",
      authorId: ADMIN_ID,
      approvedByAdmin: false,
      status: ContentStatus.DRAFT,
    });
    await service.updateBlog(
      "blog-1",
      { content: "c", isDraft: false } as any,
      ctxFor(ADMIN_ID, UserType.CONTENT_ADMIN),
    );
    expect(prisma.blog.update.mock.calls[0][0].data.status).toBe(
      ContentStatus.PUBLISHED,
    );
  });

  // ── Guard: writer cannot edit someone else's blog ──
  it("writer cannot edit another writer's blog", async () => {
    prisma.blog.findFirst.mockResolvedValue({
      id: "blog-1",
      authorId: OTHER_WRITER_ID,
      approvedByAdmin: true,
      status: ContentStatus.PUBLISHED,
    });
    await expect(
      service.updateBlog(
        "blog-1",
        { content: "c" } as any,
        ctxFor(WRITER_ID, UserType.INDIVIDUAL),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  describe("rich content sanitization", () => {
    beforeEach(() => {
      prisma.blog.findFirst.mockResolvedValue({
        id: "blog-1",
        authorId: WRITER_ID,
        approvedByAdmin: true,
        status: ContentStatus.PUBLISHED,
      });
    });

    const writer = () => ctxFor(WRITER_ID, UserType.INDIVIDUAL);

    it("persists normal Tiptap content unchanged on create", async () => {
      await service.createBlog(createDto(TIPTAP_CONTENT), writer());
      expect(prisma.blog.create.mock.calls[0][0].data.content).toBe(
        TIPTAP_CONTENT,
      );
    });

    it("persists normal Tiptap content unchanged on update", async () => {
      await service.updateBlog("blog-1", updateDto(TIPTAP_CONTENT), writer());
      expect(prisma.blog.update.mock.calls[0][0].data.content).toBe(
        TIPTAP_CONTENT,
      );
    });

    it.each(HOSTILE_CONTENT)(
      "sanitizes hostile %s on create",
      async (_name, input, expected) => {
        await service.createBlog(createDto(input), writer());
        expect(prisma.blog.create.mock.calls[0][0].data.content).toBe(expected);
      },
    );

    it.each(HOSTILE_CONTENT)(
      "sanitizes hostile %s on update",
      async (_name, input, expected) => {
        await service.updateBlog("blog-1", updateDto(input), writer());
        expect(prisma.blog.update.mock.calls[0][0].data.content).toBe(expected);
      },
    );

    it("rejects oversize content on create without persisting", async () => {
      const content = "a".repeat(BLOG_CONTENT_MAX_LENGTH + 1);
      await expect(
        service.createBlog(createDto(content), writer()),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.blog.create).not.toHaveBeenCalled();
    });

    it("rejects oversize content on update without persisting", async () => {
      const content = "a".repeat(BLOG_CONTENT_MAX_LENGTH + 1);
      await expect(
        service.updateBlog("blog-1", updateDto(content), writer()),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.blog.update).not.toHaveBeenCalled();
    });

    it("leaves updates without content untouched", async () => {
      await service.updateBlog(
        "blog-1",
        Object.assign(new UpdateBlogDto(), { title: "new" }),
        writer(),
      );
      expect(prisma.blog.update.mock.calls[0][0].data.content).toBeUndefined();
    });
  });

  describe("draft → review → publication lifecycle", () => {
    it("moves a writer's blog through DRAFT, UNDER_REVIEW and PUBLISHED and keeps it live on edit", async () => {
      let stored: Record<string, unknown> = {};
      prisma.blog.create.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        stored = { id: "blog-1", title: "t", authorId: WRITER_ID, ...data };
        return stored;
      });
      prisma.blog.findFirst.mockImplementation(() => ({ ...stored }));
      prisma.blog.update.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        stored = { ...stored, ...data };
        return stored;
      });
      const writer = ctxFor(WRITER_ID, UserType.INDIVIDUAL);
      const admin = ctxFor(ADMIN_ID, UserType.CONTENT_ADMIN);

      await service.createBlog(
        Object.assign(createDto("<p>one</p>"), { isDraft: true }),
        writer,
      );
      expect(stored.status).toBe(ContentStatus.DRAFT);
      expect(stored.approvedByAdmin).toBe(false);

      await service.updateBlog(
        "blog-1",
        Object.assign(new UpdateBlogDto(), { content: "<p>two</p>", isDraft: true }),
        writer,
      );
      expect(stored.status).toBe(ContentStatus.DRAFT);

      await service.updateBlog(
        "blog-1",
        Object.assign(new UpdateBlogDto(), { isDraft: false }),
        writer,
      );
      expect(stored.status).toBe(ContentStatus.UNDER_REVIEW);
      expect(stored.approvedByAdmin).toBe(false);

      await service.blogAction("blog-1", "approve", admin, "ok");
      expect(stored.status).toBe(ContentStatus.PUBLISHED);
      expect(stored.approvedByAdmin).toBe(true);

      await service.updateBlog(
        "blog-1",
        Object.assign(new UpdateBlogDto(), {
          content: "<p>three</p>",
          isDraft: false,
        }),
        writer,
      );
      expect(stored.status).toBe(ContentStatus.PUBLISHED);
      expect(stored.approvedByAdmin).toBe(true);
      expect(stored.content).toBe("<p>three</p>");
    });

    it("updates without isDraft never change the persisted status", async () => {
      prisma.blog.findFirst.mockResolvedValue({
        id: "blog-1",
        authorId: WRITER_ID,
        approvedByAdmin: true,
        status: ContentStatus.PUBLISHED,
      });
      await service.updateBlog(
        "blog-1",
        Object.assign(new UpdateBlogDto(), { content: "<p>x</p>" }),
        ctxFor(WRITER_ID, UserType.INDIVIDUAL),
      );
      const data = prisma.blog.update.mock.calls[0][0].data;
      expect(data.status).toBeUndefined();
      expect(data.approvedByAdmin).toBeUndefined();
    });

    it("rejects more than the maximum images on create and update without persisting", async () => {
      const img = '<figure><img src="https://ik.imagekit.io/nch/a.jpg" alt="a"></figure>';
      const content = img.repeat(BLOG_CONTENT_MAX_IMAGES + 1);
      prisma.blog.findFirst.mockResolvedValue({
        id: "blog-1",
        authorId: WRITER_ID,
        approvedByAdmin: false,
        status: ContentStatus.DRAFT,
      });
      await expect(
        service.createBlog(createDto(content), ctxFor(WRITER_ID, UserType.INDIVIDUAL)),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.updateBlog(
          "blog-1",
          Object.assign(new UpdateBlogDto(), { content }),
          ctxFor(WRITER_ID, UserType.INDIVIDUAL),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.blog.create).not.toHaveBeenCalled();
      expect(prisma.blog.update).not.toHaveBeenCalled();
    });
  });
});
