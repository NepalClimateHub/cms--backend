import { Injectable } from "@nestjs/common";
import { plainToClass, plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { TagOutputDto } from "../dto/tags-output.dto";
import { AddTagDto, TagSearchInput } from "../dto/tags-input.dto";
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

    const { whereBuilder: orgWhereQuery } =
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
        },
      });

    const tags = await this.prismaService.tags.findMany({
      where: {
        AND: [orgWhereQuery],
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const tagsCount = await this.prismaService.tags.count({
      where: {
        AND: [orgWhereQuery],
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
}
