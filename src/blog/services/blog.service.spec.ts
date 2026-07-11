import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { ContentStatus, UserType } from "@prisma/client";

import { BlogService } from "./blog.service";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { NotificationService } from "../../notification/notification.service";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";

const WRITER_ID = "writer-1";
const OTHER_WRITER_ID = "writer-2";
const ADMIN_ID = "admin-1";

function ctxFor(id: string, userType: UserType): RequestContext {
  const ctx = new RequestContext();
  ctx.user = { id, userType } as RequestContext["user"];
  return ctx;
}

describe("BlogService — approval workflow", () => {
  let service: BlogService;
  const prisma = {
    blog: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  const notification = { notifyBlogReview: jest.fn() };
  const activity = { logActivity: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
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
});
