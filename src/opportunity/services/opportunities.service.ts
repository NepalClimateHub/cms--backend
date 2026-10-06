import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToClass, plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateOpportunityDto,
  OpportunityResponseDto,
  OpportunitySummaryDto,
  OpportunitySearchInput,
  UpdateOpportunityDto,
} from "../dto/opportunities.dto";
import { applyFilters } from "../../shared/filters/prisma-filter.filter";
import { ContentStatus, EventStatus, Prisma } from "@prisma/client";
import { applyComputedStatus, computeStatus } from "../../content-status/compute-status";
import { createSearchKey } from "../../shared/utils/createSearchKey";
import {
  ContentModerationDto,
  ModerationAction,
} from "../../shared/dtos/moderation.dto";
import { BadRequestException } from "@nestjs/common";

import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";

type OpportunityListResult = {
  items: (OpportunityResponseDto | OpportunitySummaryDto)[];
  count: number;
};

@Injectable()
export class OpportunityService {
  private readonly publicSummaryCache = new Map<
    string,
    { expiresAt: number; value: OpportunityListResult }
  >();
  private readonly publicSummaryCacheTtlMs = 5 * 60 * 1000;

  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService,
    private readonly activityLogService: ActivityLogService
  ) {
    this.logger.setContext(OpportunityService.name);
  }

  private getPublicSummaryCacheKey(query: OpportunitySearchInput): string {
    const { tagIds, ...filters } = query;

    return JSON.stringify({
      ...filters,
      tagIds: tagIds ? [...tagIds].sort() : undefined,
    });
  }

  private clearPublicSummaryCache(): void {
    this.publicSummaryCache.clear();
  }

  async getOpportunities(
    ctx: RequestContext,
    query: OpportunitySearchInput,
    usePublicCache = false,
  ): Promise<OpportunityListResult> {
    this.logger.log(ctx, `${this.getOpportunities.name} was called`);
    const cacheKey = query.view === "summary" && usePublicCache
      ? this.getPublicSummaryCacheKey(query)
      : undefined;
    const cached = cacheKey ? this.publicSummaryCache.get(cacheKey) : undefined;

    if (cached && cached.expiresAt > Date.now()) {
      // Cached entries can outlive a deadline, so recompute on every hit.
      applyComputedStatus(cached.value.items);
      return cached.value;
    }

    const { limit, offset, view, ...restQuery } = query;
    const summary = view === "summary";

    const { whereBuilder: whereQuery } =
      await applyFilters<Prisma.OpportunityWhereInput>({
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
          status: async ({ filter }) => {
            return {
              where: {
                status: filter as EventStatus,
              },
            };
          },
          moderationStatus: async ({ filter }) => {
            return {
              where: {
                moderationStatus: filter as ContentStatus,
              },
            };
          },
        },
      });

    const [items, count] = await Promise.all([
      this.prismaService.opportunity.findMany({
        where: {
          AND: [whereQuery],
        },
        ...(summary
          ? {
              select: {
                id: true, title: true, description: true, locationType: true,
                type: true, format: true, status: true, cost: true,
                bannerImageUrl: true, applicationDeadline: true,
                address: { select: { state: true } },
                tags: { select: { tag: true } },
              },
            }
          : { include: { address: true, tags: true } }),
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      } as Prisma.OpportunityFindManyArgs),
      this.prismaService.opportunity.count({
        where: {
          AND: [whereQuery],
        },
      }),
    ]);
    const result = {
      items: applyComputedStatus(
        plainToInstance(summary ? OpportunitySummaryDto : OpportunityResponseDto, items, {
          excludeExtraneousValues: true,
        })
      ),
      count: count,
    };

    if (cacheKey) {
      this.publicSummaryCache.set(cacheKey, {
        expiresAt: Date.now() + this.publicSummaryCacheTtlMs,
        value: result,
      });
    }

    return result;
  }

  async getOneOpportunity(
    ctx: RequestContext,
    id: string
  ): Promise<OpportunityResponseDto> {
    this.logger.log(ctx, `${this.getOneOpportunity.name} was called`);

    const item = await this.prismaService.opportunity.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
        tags: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Opportunity not found");
    }

    const result = plainToInstance(OpportunityResponseDto, item, {
      excludeExtraneousValues: true,
    });
    result.status = computeStatus(result);
    return result;
  }

  async addOpportunity(
    ctx: RequestContext,
    payload: CreateOpportunityDto
  ): Promise<OpportunityResponseDto> {
    this.logger.log(ctx, `${this.addOpportunity.name} was called`);
    const { address, tagIds, socials, bannerImageUrl, ...restPayload } =
      payload;

    // Verify tags exist and are opportunity tags
    if (tagIds?.length) {
      const existingTags = await this.prismaService.tags.findMany({
        where: {
          id: {
            in: tagIds,
          },
          isOpportunityTag: true,
        },
      });

      if (existingTags.length !== tagIds.length) {
        throw new NotFoundException(
          "One or more tags not found or are not opportunity tags"
        );
      }
    }

    const item = await this.prismaService.opportunity.create({
      data: {
        ...restPayload,
        contributedBy: ctx!.user!.id,
        bannerImageUrl: bannerImageUrl ?? "",
        ...(address && {
          address: {
            create: {
              ...address,
            },
          },
        }),
        ...(tagIds && {
          tags: {
            connect: tagIds?.map((id) => ({
              id,
              isOpportunityTag: true,
            })),
          },
        }),
      },
    });

    const _cResult = plainToClass(OpportunityResponseDto, item, { excludeExtraneousValues: true });
    this.clearPublicSummaryCache();
    this.activityLogService.logActivity(ctx, ActivityAction.CREATE, ActivityEntity.OPPORTUNITY, _cResult.id, _cResult.title);
    return _cResult;
  }

  async deleteOpportunity(
    ctx: RequestContext,
    id: string
  ): Promise<OpportunityResponseDto> {
    this.logger.log(ctx, `${this.deleteOpportunity.name} was called`);

    const item = await this.prismaService.opportunity.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      throw new NotFoundException("Opportunity not found");
    }

    await this.prismaService.opportunity.delete({
      where: {
        id: item.id,
      },
    });

    const _dResult = plainToInstance(OpportunityResponseDto, item, { excludeExtraneousValues: true });
    this.clearPublicSummaryCache();
    this.activityLogService.logActivity(ctx, ActivityAction.DELETE, ActivityEntity.OPPORTUNITY, _dResult.id, _dResult.title);
    return _dResult;
  }

  async updateOpportunity(
    ctx: RequestContext,
    id: string,
    payload: UpdateOpportunityDto
  ): Promise<OpportunityResponseDto> {
    this.logger.log(ctx, `${this.updateOpportunity.name} was called`);
    const item = await this.prismaService.opportunity.findUnique({
      where: {
        id,
      },
    });
    if (!item) {
      throw new NotFoundException("Opportunity not found!");
    }

    const { address, tagIds, ...restPayload } = payload;

    const updatedItem = await this.prismaService.opportunity.update({
      where: {
        id: item.id,
      },
      data: {
        ...restPayload,
        ...(address && {
          address: {
            upsert: {
              create: address,
              update: address,
            },
          },
        }),
        ...(tagIds && {
          tags: {
            set: [],
            connect: tagIds?.map((id) => ({
              id,
              isOpportunityTag: true,
            })),
          },
        }),
      },
    });

    const _uResult = plainToClass(OpportunityResponseDto, updatedItem, { excludeExtraneousValues: true });
    this.clearPublicSummaryCache();
    this.activityLogService.logActivity(ctx, ActivityAction.UPDATE, ActivityEntity.OPPORTUNITY, _uResult.id, _uResult.title);
    return _uResult;
  }

  async moderateOpportunity(
    ctx: RequestContext,
    id: string,
    payload: ContentModerationDto
  ): Promise<OpportunityResponseDto> {
    this.logger.log(ctx, `${this.moderateOpportunity.name} was called`);

    if (
      payload.action === ModerationAction.REQUEST_IMPROVEMENTS &&
      !payload.feedback
    ) {
      throw new BadRequestException(
        "Feedback is mandatory when requesting improvements"
      );
    }

    const statusMap = {
      [ModerationAction.APPROVE]: ContentStatus.PUBLISHED,
      [ModerationAction.REQUEST_IMPROVEMENTS]:
        ContentStatus.IMPROVEMENT_REQUIRED,
      [ModerationAction.REJECT]: ContentStatus.REJECTED,
    };

    const item = await this.prismaService.opportunity.update({
      where: { id },
      data: {
        moderationStatus: statusMap[payload.action],
        reviewFeedback: payload.feedback || null,
        isDraft: payload.action !== ModerationAction.APPROVE,
      },
    });
    this.clearPublicSummaryCache();

    return plainToClass(OpportunityResponseDto, item, {
      excludeExtraneousValues: true,
    });
  }
}
