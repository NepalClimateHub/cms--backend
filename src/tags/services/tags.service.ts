import { Injectable } from "@nestjs/common";
import { plainToClass, plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { TagOutputDto } from "../dto/tags-output.dto";
import { AddTagDto, TagSearchInput, TagsType } from "../dto/tags-input.dto";
import { applyFilters } from "../../shared/filters/prisma-filter.filter";
import { Prisma } from "@prisma/client";
import { createSearchKey } from "../../shared/utils/createSearchKey";

@Injectable()
export class TagsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(TagsService.name);
  }

  async getTags(
    ctx: RequestContext,
    query: TagSearchInput
  ): Promise<{ tags: TagOutputDto[]; count: number }> {
    this.logger.log(ctx, `${this.getTags.name} was called`);
    const { limit, offset, ...restQuery } = query;

    const { whereBuilder: tagsWhereQuery } =
      await applyFilters<Prisma.TagsWhereInput>({
        appliedFiltersInput: restQuery,
        availableFilters: {
          tag: async ({ filter }) => {
            const searchKey = createSearchKey(String(filter), "AND");
            return {
              where: {
                OR: [
                  {
                    tag: {
                      search: searchKey,
                      mode: "insensitive",
                    },
                  },
                  {
                    tag: {
                      contains: String(filter),
                      mode: "insensitive",
                    },
                  },
                ],
              },
            };
          },
          isUserTag: async ({ filter }) => {
            return {
              where: {
                isUserTag: true,
              },
            };
          },
          isOrganizationTag: async ({ filter }) => {
            return {
              where: {
                isOrganizationTag: true,
              },
            };
          },

          isEventTag: async ({ filter }) => {
            return {
              where: {
                isEventTag: true,
              },
            };
          },

          isNewsTag: async ({ filter }) => {
            return {
              where: {
                isNewsTag: true,
              },
            };
          },
        },
      });

    const tags = await this.prismaService.tags.findMany({
      where: {
        AND: [tagsWhereQuery],
        deletedAt: null,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("==tags", tags);
    const tagsCount = await this.prismaService.tags.count({
      where: {
        AND: [tagsWhereQuery],
      },
    });

    return {
      tags: plainToInstance(TagOutputDto, tags, {
        excludeExtraneousValues: true,
      }),
      count: tagsCount,
    };
  }

  async getTagsByType(
    ctx: RequestContext,
    type: TagsType
  ): Promise<{ tags: TagOutputDto[]; count: number }> {
    this.logger.log(ctx, `${this.getTagsByType.name} was called`);
    const { whereBuilder: tagsWhereQuery } =
      await applyFilters<Prisma.TagsWhereInput>({
        appliedFiltersInput: {
          type,
        },
        availableFilters: {
          type: async ({ filter }) => {
            const tagType = filter as TagsType;
            if (tagType === "NEWS") {
              return {
                where: {
                  isNewsTag: true,
                },
              };
            }
            if (tagType === "EVENT") {
              return {
                where: {
                  isEventTag: true,
                },
              };
            }
            if (tagType === "OPPORTUNITY") {
              return {
                where: {
                  isOpportunityTag: true,
                },
              };
            }
            if (tagType === "ORGANIZATION") {
              return {
                where: {
                  isOrganizationTag: true,
                },
              };
            }
            if (tagType === "USER") {
              return {
                where: {
                  isUserTag: true,
                },
              };
            }
            if (tagType === "BLOG") {
              return {
                where: {
                  isBlogTag: true,
                },
              };
            }
            return {
              where: {},
            };
          },
        },
      });

    const tags = await this.prismaService.tags.findMany({
      where: {
        AND: [tagsWhereQuery],
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const tagsCount = await this.prismaService.tags.count({
      where: {
        AND: [tagsWhereQuery],
      },
    });

    return {
      tags: plainToInstance(TagOutputDto, tags, {
        excludeExtraneousValues: true,
      }),
      count: tagsCount,
    };
  }

  async addTag(ctx: RequestContext, payload: AddTagDto): Promise<TagOutputDto> {
    this.logger.log(ctx, `${this.addTag.name} was called`);
    const tag = await this.prismaService.tags.create({
      data: {
        ...payload,
      },
    });

    return plainToClass(TagOutputDto, tag, {
      excludeExtraneousValues: true,
    });
  }

  async deleteTag(ctx: RequestContext, id: string): Promise<TagOutputDto> {
    this.logger.log(ctx, `${this.deleteTag.name} was called`);
    const tag = await this.prismaService.tags.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return plainToClass(TagOutputDto, tag, {
      excludeExtraneousValues: true,
    });
  }
}
