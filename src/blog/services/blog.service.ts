import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateBlogDto,
  UpdateBlogDto,
  BlogSearchInput,
  BlogResponseDto,
} from "../dto/blog.dto";
import { plainToInstance } from "class-transformer";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { NotificationService } from "../../notification/notification.service";
import { ContentStatus, UserType } from "@prisma/client";

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /** Staff roles that may edit/delete any blog. */
  private canManageAnyBlog(userType: UserType): boolean {
    return (
      userType === UserType.SUPER_ADMIN ||
      userType === UserType.ADMIN ||
      userType === UserType.CONTENT_ADMIN
    );
  }

  private assertCanModifyBlog(
    ctx: RequestContext,
    existingBlog: { authorId: string | null },
  ): void {
    if (!ctx.user?.id) {
      throw new ForbiddenException("Missing user context");
    }
    if (this.canManageAnyBlog(ctx.user.userType)) {
      return;
    }
    if (
      existingBlog.authorId != null &&
      existingBlog.authorId === ctx.user.id
    ) {
      return;
    }
    throw new ForbiddenException(
      "You can only edit or delete your own blog posts.",
    );
  }

  /**
   * Calculate reading time based on content length
   * Assumes average reading speed of 200 words per minute
   */
  private calculateReadingTime(content: string): string {
    // Strip HTML tags to get plain text
    const textContent = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Count words (split by spaces)
    const wordCount = textContent
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    // Calculate reading time (200 words per minute)
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return `${readingTimeMinutes} min read`;
  }

  async createBlog(
    createBlogDto: CreateBlogDto,
    ctx: RequestContext,
  ): Promise<BlogResponseDto> {
    const { tagIds, ...blogData } = createBlogDto;

    // Super admin and content admin publish directly unless saving as draft
    const canAutoPublish =
      ctx.user?.userType === UserType.SUPER_ADMIN ||
      ctx.user?.userType === UserType.CONTENT_ADMIN;
    const approvedByAdmin = canAutoPublish;

    let status: ContentStatus = ContentStatus.DRAFT;
    if (!blogData.isDraft) {
      if (canAutoPublish) {
        status = ContentStatus.PUBLISHED;
      } else {
        status = ContentStatus.UNDER_REVIEW;
      }
    }

    // Auto-calculate reading time from content
    const readingTime = this.calculateReadingTime(blogData.content);

    const blog = await this.prisma.blog.create({
      data: {
        ...blogData,
        readingTime,
        approvedByAdmin,
        status,
        authorId: ctx.user?.id,
        tags: tagIds
          ? {
              connect: tagIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        tags: true,
        authorUser: true,
        categoryData: true,
      },
    });

    return plainToInstance(BlogResponseDto, blog, {
      excludeExtraneousValues: true,
    });
  }

  async findAllBlogs(
    searchInput: BlogSearchInput,
    ctx?: RequestContext,
  ): Promise<{ blogs: BlogResponseDto[]; total: number }> {
    const { offset = 1, limit = 10, ...searchParams } = searchInput;

    const where: any = {
      deletedAt: null,
    };

    const staffSeesAll =
      ctx?.user &&
      (ctx.user.userType === UserType.SUPER_ADMIN ||
        ctx.user.userType === UserType.ADMIN ||
        ctx.user.userType === UserType.CONTENT_ADMIN);

    // Visibility logic
    if (!ctx?.user) {
      // Public API: only approved and published
      where.approvedByAdmin = true;
      where.status = ContentStatus.PUBLISHED;
      where.isDraft = false;
    } else if (!staffSeesAll) {
      // Regular user (Individual/Organization): only their own blogs
      where.authorId = ctx.user.id;
    }
    // Staff: sees all (including drafts and unapproved posts)
    // But we default to excluding drafts unless includeDrafts is true
    if (
      ctx?.user &&
      searchParams.isDraft === undefined &&
      !searchParams.includeDrafts
    ) {
      where.isDraft = false;
    }

    if (searchParams.title) {
      where.title = {
        contains: searchParams.title,
        mode: "insensitive",
      };
    }

    if (searchParams.category) {
      where.category = {
        contains: searchParams.category,
        mode: "insensitive",
      };
    }

    if (searchParams.author) {
      where.author = {
        contains: searchParams.author,
        mode: "insensitive",
      };
    }

    if (searchParams.isDraft !== undefined) {
      where.isDraft = searchParams.isDraft;
    }

    if (searchParams.isFeatured !== undefined) {
      where.isFeatured = searchParams.isFeatured;
    }

    if (searchParams.categoryId) {
      where.categoryId = searchParams.categoryId;
    }

    if (searchParams.tagIds && searchParams.tagIds.length > 0) {
      where.tags = {
        some: {
          id: {
            in: searchParams.tagIds,
          },
        },
      };
    }

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        include: {
          tags: true,
          authorUser: true,
          categoryData: true,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      blogs: plainToInstance(BlogResponseDto, blogs, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async findBlogById(
    id: string,
    ctx?: RequestContext,
  ): Promise<BlogResponseDto> {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        tags: true,
        authorUser: true,
        categoryData: true,
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    // Visibility check
    const isStaff =
      ctx?.user &&
      (ctx.user.userType === UserType.SUPER_ADMIN ||
        ctx.user.userType === UserType.ADMIN ||
        ctx.user.userType === UserType.CONTENT_ADMIN);
    const isAuthor = ctx?.user && blog.authorId === ctx.user.id;
    const isPubliclyVisible =
      blog.approvedByAdmin &&
      blog.status === ContentStatus.PUBLISHED &&
      !blog.isDraft;

    if (!isStaff && !isAuthor && !isPubliclyVisible) {
      throw new ForbiddenException(
        "You do not have permission to view this blog post.",
      );
    }

    return plainToInstance(BlogResponseDto, blog, {
      excludeExtraneousValues: true,
    });
  }

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDto,
    ctx: RequestContext,
  ): Promise<BlogResponseDto> {
    const { tagIds, ...blogData } = updateBlogDto;

    const existingBlog = await this.prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    this.assertCanModifyBlog(ctx, existingBlog);

    // Auto-calculate reading time if content is being updated
    const updatedData: any = { ...blogData };
    if (!this.canManageAnyBlog(ctx.user!.userType)) {
      delete updatedData.isFeatured;
      delete updatedData.isTopRead;
    }
    if (blogData.content) {
      updatedData.readingTime = this.calculateReadingTime(blogData.content);
    }

    if (blogData.isDraft === true) {
      updatedData.status = ContentStatus.DRAFT;
    }

    const blog = await this.prisma.blog.update({
      where: { id },
      data: {
        ...updatedData,
        tags: tagIds
          ? {
              set: tagIds.map((tagId) => ({ id: tagId })),
            }
          : undefined,
      },
      include: {
        tags: true,
        authorUser: true,
        categoryData: true,
      },
    });

    return plainToInstance(BlogResponseDto, blog, {
      excludeExtraneousValues: true,
    });
  }

  async deleteBlog(id: string, ctx: RequestContext): Promise<void> {
    const existingBlog = await this.prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    this.assertCanModifyBlog(ctx, existingBlog);

    await this.prisma.blog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async blogAction(
    id: string,
    action: "approve" | "reject",
  ): Promise<BlogResponseDto> {
    const existingBlog = await this.prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    if (action !== "approve" && action !== "reject") {
      throw new BadRequestException(
        `Invalid action. Action must be either "approve" or "reject"`,
      );
    }

    const blog = await this.prisma.blog.update({
      where: { id },
      data: {
        approvedByAdmin: action === "approve",
        status:
          action === "approve"
            ? ContentStatus.PUBLISHED
            : ContentStatus.REJECTED,
      },
      include: {
        tags: true,
        authorUser: true,
        categoryData: true,
      },
    });

    await this.notificationService.notifyBlogReview(
      existingBlog.authorId,
      blog.id,
      blog.title,
      action,
    );

    return plainToInstance(BlogResponseDto, blog, {
      excludeExtraneousValues: true,
    });
  }

  async getFeaturedBlogs(): Promise<BlogResponseDto[]> {
    const blogs = await this.prisma.blog.findMany({
      where: {
        isFeatured: true,
        isDraft: false,
        approvedByAdmin: true,
        deletedAt: null,
      },
      include: {
        tags: true,
        authorUser: true,
        categoryData: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return plainToInstance(BlogResponseDto, blogs, {
      excludeExtraneousValues: true,
    });
  }

  async getPublishedBlogs(): Promise<BlogResponseDto[]> {
    const blogs = await this.prisma.blog.findMany({
      where: {
        isDraft: false,
        approvedByAdmin: true,
        deletedAt: null,
      },
      include: {
        tags: true,
        authorUser: true,
        categoryData: true,
      },
      orderBy: {
        publishedDate: "desc",
      },
    });

    return plainToInstance(BlogResponseDto, blogs, {
      excludeExtraneousValues: true,
    });
  }
}
