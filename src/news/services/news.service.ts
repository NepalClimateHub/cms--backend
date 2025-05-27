import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToClass, plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateNewsDto,
  NewsResponseDto,
  NewsSearchInput,
  UpdateNewsDto,
} from "../dto/news.dto";
import { applyFilters } from "../../shared/filters/prisma-filter.filter";
import { Prisma } from "@prisma/client";
import { createSearchKey } from "../../shared/utils/createSearchKey";

@Injectable()
export class NewsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(NewsService.name);
  }

  async getNews(
    ctx: RequestContext,
    query: NewsSearchInput
  ): Promise<{ news: NewsResponseDto[]; count: number }> {
    this.logger.log(ctx, `${this.getNews.name} was called`);
    const { limit, offset, ...restQuery } = query;

    const { whereBuilder: whereQuery } =
      await applyFilters<Prisma.NewsWhereInput>({
        appliedFiltersInput: restQuery,
        availableFilters: {
          title: async ({ filter }) => {
            const searchKey = createSearchKey(String(filter), "AND");
            return {
              where: {
                OR: [
                  {
                    title: {
                      search: searchKey,
                      mode: "insensitive",
                    },
                  },
                  {
                    title: {
                      contains: String(filter),
                      mode: "insensitive",
                    },
                  },
                ],
              },
            };
          },
          tagIds: async ({ filter }) => {
            return {
              where: {
                tags: {
                  some: {
                    id: {
                      in: filter as string[],
                    },
                  },
                },
              },
            };
          },
        },
      });

    const news = await this.prismaService.news.findMany({
      where: {
        AND: [whereQuery],
      },
      include: {
        tags: true,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    const newsCount = await this.prismaService.news.count({
      where: {
        AND: [whereQuery],
      },
    });

    return {
      news: plainToInstance(NewsResponseDto, news, {
        excludeExtraneousValues: true,
      }),
      count: newsCount,
    };
  }

  async getOneNews(ctx: RequestContext, id: string): Promise<NewsResponseDto> {
    this.logger.log(ctx, `${this.getOneNews.name} was called`);

    const news = await this.prismaService.news.findUnique({
      where: {
        id,
      },
      include: {
        tags: true,
      },
    });

    if (!news) {
      throw new NotFoundException("News not found");
    }

    return plainToInstance(NewsResponseDto, news, {
      excludeExtraneousValues: true,
    });
  }

  async addNews(
    ctx: RequestContext,
    payload: CreateNewsDto
  ): Promise<NewsResponseDto> {
    this.logger.log(ctx, `${this.addNews.name} was called`);
    const { tagIds, ...restPayload } = payload;

    const publishedYear = new Date(restPayload.publishedDate).getFullYear();
    const news = await this.prismaService.news.create({
      data: {
        ...restPayload,
        contributedBy: ctx!.user!.id,
        publishedYear: new Date(`${publishedYear}-01-01`).toISOString(),
        ...(tagIds && {
          tags: {
            connect: tagIds?.map((id) => ({
              id,
              isNewsTag: true,
            })),
          },
        }),
      },
    });

    return plainToClass(NewsResponseDto, news, {
      excludeExtraneousValues: true,
    });
  }

  async deleteNews(ctx: RequestContext, id: string): Promise<NewsResponseDto> {
    this.logger.log(ctx, `${this.deleteNews.name} was called`);

    const news = await this.prismaService.news.findUnique({
      where: {
        id,
      },
    });

    if (!news) {
      throw new NotFoundException("News not found");
    }

    await this.prismaService.news.delete({
      where: {
        id: news.id,
      },
    });

    return plainToInstance(NewsResponseDto, news, {
      excludeExtraneousValues: true,
    });
  }

  async updateNews(
    ctx: RequestContext,
    id: string,
    payload: UpdateNewsDto
  ): Promise<NewsResponseDto> {
    this.logger.log(ctx, `${this.updateNews.name} was called`);
    const news = await this.prismaService.news.findUnique({
      where: {
        id,
      },
    });
    if (!news) {
      throw new NotFoundException("News not found!");
    }

    const { tagIds, ...restPayload } = payload;

    const updatedNews = await this.prismaService.news.update({
      where: {
        id: news.id,
      },
      data: {
        ...restPayload,
        ...(tagIds && {
          tags: {
            // Set empty then create new records
            // Do not use deleteMany here since it maybe used elsewhere
            set: [],
            connect: tagIds?.map((id) => ({
              id,
              isNewsTag: true,
            })),
          },
        }),
      },
    });

    return plainToClass(NewsResponseDto, updatedNews, {
      excludeExtraneousValues: true,
    });
  }
}
