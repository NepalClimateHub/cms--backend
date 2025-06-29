import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateBlogDto,
  UpdateBlogDto,
  BlogSearchInput,
  BlogResponseDto,
} from "../dto/blog.dto";
import { plainToInstance } from "class-transformer";
import { RequestContext } from "../../shared/request-context/request-context.dto";

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async createBlog(
    createBlogDto: CreateBlogDto,
    ctx: RequestContext
  ): Promise<BlogResponseDto> {
    const { tagIds, ...blogData } = createBlogDto;

    const blog = await this.prisma.blog.create({
      data: {
        ...blogData,
        contributedBy: ctx.user?.fullName || "Anonymous",
        tags: tagIds
          ? {
              connect: tagIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return plainToInstance(BlogResponseDto, blog, {
      excludeExtraneousValues: true,
    });
  }

  async findAllBlogs(
    searchInput: BlogSearchInput
  ): Promise<{ blogs: BlogResponseDto[]; total: number }> {
    const { offset = 1, limit = 10, ...searchParams } = searchInput;

    const where: any = {
      deletedAt: null,
    };

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

  async findBlogById(id: string): Promise<BlogResponseDto> {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        tags: true,
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return plainToInstance(BlogResponseDto, blog, {
      excludeExtraneousValues: true,
    });
  }

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDto
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

    const blog = await this.prisma.blog.update({
      where: { id },
      data: {
        ...blogData,
        tags: tagIds
          ? {
              set: tagIds.map((tagId) => ({ id: tagId })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return plainToInstance(BlogResponseDto, blog, {
      excludeExtraneousValues: true,
    });
  }

  async deleteBlog(id: string): Promise<void> {
    const existingBlog = await this.prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    await this.prisma.blog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getFeaturedBlogs(): Promise<BlogResponseDto[]> {
    const blogs = await this.prisma.blog.findMany({
      where: {
        isFeatured: true,
        isDraft: false,
        deletedAt: null,
      },
      include: {
        tags: true,
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
        deletedAt: null,
      },
      include: {
        tags: true,
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
