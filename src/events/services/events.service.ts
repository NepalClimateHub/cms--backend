import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToClass, plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateEventDto,
  EventResponseDto,
  EventSummaryDto,
  EventsSearchInput,
  UpdateEventDto,
} from "../dto/events.dto";
import { applyFilters } from "../../shared/filters/prisma-filter.filter";
import { ContentStatus, EventStatus, Prisma, PublicationStatus } from "@prisma/client";
import { applyComputedStatus, computeStatus } from "../../content-status/compute-status";
import { createSearchKey } from "../../shared/utils/createSearchKey";
import {
  ContentModerationDto,
  ModerationAction,
} from "../../shared/dtos/moderation.dto";
import { BadRequestException } from "@nestjs/common";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";

type EventListResult = {
  events: (EventResponseDto | EventSummaryDto)[];
  count: number;
};

@Injectable()
export class EventsService {
  private readonly publicSummaryCache = new Map<
    string,
    { expiresAt: number; value: EventListResult }
  >();
  private readonly publicSummaryCacheTtlMs = 5 * 60 * 1000;

  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService,
    private readonly activityLogService: ActivityLogService
  ) {
    this.logger.setContext(EventsService.name);
  }

  private getPublicSummaryCacheKey(query: EventsSearchInput): string {
    const { tagIds, ...filters } = query;

    return JSON.stringify({
      ...filters,
      tagIds: tagIds ? [...tagIds].sort() : undefined,
    });
  }

  private clearPublicSummaryCache(): void {
    this.publicSummaryCache.clear();
  }

  async getEvents(
    ctx: RequestContext,
    query: EventsSearchInput,
    usePublicCache = false,
  ): Promise<EventListResult> {
    this.logger.log(ctx, `${this.getEvents.name} was called`);
    const cacheKey = query.view === "summary" && usePublicCache
      ? this.getPublicSummaryCacheKey(query)
      : undefined;
    const cached = cacheKey ? this.publicSummaryCache.get(cacheKey) : undefined;

    if (cached && cached.expiresAt > Date.now()) {
      // Cached entries can outlive a deadline, so recompute on every hit.
      applyComputedStatus(cached.value.events);
      return cached.value;
    }

    const { limit, offset, view, ...restQuery } = query;
    const summary = view === "summary";

    const { whereBuilder: whereQuery } =
      await applyFilters<Prisma.EventsWhereInput>({
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
          publicationStatus: async ({ filter }) => {
            return {
              where: {
                publicationStatus: filter as PublicationStatus,
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

    const [events, eventCount] = await Promise.all([
      this.prismaService.events.findMany({
        where: {
          AND: [whereQuery],
        },
        ...(summary
          ? {
              select: {
                id: true, title: true, description: true, locationType: true,
                type: true, format: true, status: true, cost: true,
                bannerImageUrl: true, startDate: true, registrationDeadline: true,
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
      } as Prisma.EventsFindManyArgs),
      this.prismaService.events.count({
        where: {
          AND: [whereQuery],
        },
      }),
    ]);

    const result = {
      events: applyComputedStatus(
        plainToInstance(summary ? EventSummaryDto : EventResponseDto, events, {
          excludeExtraneousValues: true,
        })
      ),
      count: eventCount,
    };

    if (cacheKey) {
      this.publicSummaryCache.set(cacheKey, {
        expiresAt: Date.now() + this.publicSummaryCacheTtlMs,
        value: result,
      });
    }

    return result;
  }

  async getOneEvent(
    ctx: RequestContext,
    id: string
  ): Promise<EventResponseDto> {
    this.logger.log(ctx, `${this.getOneEvent.name} was called`);

    const event = await this.prismaService.events.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
        tags: true,
        eventGallery: true,
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    const result = plainToInstance(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
    result.status = computeStatus(result);
    return result;
  }

  async addEvent(
    ctx: RequestContext,
    payload: CreateEventDto
  ): Promise<EventResponseDto> {
    this.logger.log(ctx, `${this.addEvent.name} was called`);
    const { address, tagIds, gallery, bannerImageUrl, isDraft, ...restPayload } =
      payload;

    let publicationStatus = payload.publicationStatus;
    if (!publicationStatus && isDraft !== undefined) {
      publicationStatus = isDraft ? PublicationStatus.DRAFT : PublicationStatus.PUBLISHED;
    }

    const event = await this.prismaService.events.create({
      data: {
        contributedBy: ctx!.user!.id,
        ...restPayload,
        publicationStatus: publicationStatus ?? PublicationStatus.DRAFT,
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
              isEventTag: true,
            })),
          },
        }),
        ...(gallery && {
          eventGallery: {
            create: gallery,
          },
        }),
      },
    });

    const addResult = plainToClass(EventResponseDto, event, { excludeExtraneousValues: true });
    this.clearPublicSummaryCache();
    this.activityLogService.logActivity(ctx, ActivityAction.CREATE, ActivityEntity.EVENT, event.id, event.title);
    return addResult;
  }

  async deleteEvent(
    ctx: RequestContext,
    id: string
  ): Promise<EventResponseDto> {
    this.logger.log(ctx, `${this.deleteEvent.name} was called`);

    const event = await this.prismaService.events.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    await this.prismaService.events.delete({
      where: {
        id: event.id,
      },
    });

    const delResult = plainToInstance(EventResponseDto, event, { excludeExtraneousValues: true });
    this.clearPublicSummaryCache();
    this.activityLogService.logActivity(ctx, ActivityAction.DELETE, ActivityEntity.EVENT, event.id, event.title);
    return delResult;
  }

  async updateEvent(
    ctx: RequestContext,
    id: string,
    payload: UpdateEventDto
  ): Promise<EventResponseDto> {
    this.logger.log(ctx, `${this.updateEvent.name} was called`);
    const event = await this.prismaService.events.findUnique({
      where: {
        id,
      },
    });
    if (!event) {
      throw new NotFoundException("Event not found!");
    }

    const { address, tagIds, gallery, isDraft, ...restPayload } = payload;
    let publicationStatus = payload.publicationStatus;
    if (!publicationStatus && isDraft !== undefined) {
      publicationStatus = isDraft ? PublicationStatus.DRAFT : PublicationStatus.PUBLISHED;
    }

    // Filter out undefined fields to prevent null validation errors
    // const cleanPayload = Object.fromEntries(
    //   Object.entries(restPayload).filter(
    //     ([_, v]) => v !== undefined && v !== null
    //   )
    // );

    const eventUpdate = await this.prismaService.events.update({
      where: {
        id: event.id,
      },
      data: {
        ...restPayload,
        ...(publicationStatus && { publicationStatus }),
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
            //set empty then create new records
            // do not use deletemany here since it maybe used elsewhere
            set: [],
            connect: tagIds?.map((id) => ({
              id,
              isEventTag: true,
            })),
          },
        }),
        ...(gallery && {
          eventGallery: {
            deleteMany: {},
            create: gallery,
          },
        }),
      },
    });

    const updResult = plainToClass(EventResponseDto, eventUpdate, { excludeExtraneousValues: true });
    this.clearPublicSummaryCache();
    this.activityLogService.logActivity(ctx, ActivityAction.UPDATE, ActivityEntity.EVENT, eventUpdate.id, eventUpdate.title);
    return updResult;
  }

  async moderateEvent(
    ctx: RequestContext,
    id: string,
    payload: ContentModerationDto
  ): Promise<EventResponseDto> {
    this.logger.log(ctx, `${this.moderateEvent.name} was called`);

    if (
      payload.action === ModerationAction.REQUEST_IMPROVEMENTS &&
      !payload.feedback
    ) {
      throw new BadRequestException("Feedback is mandatory when requesting improvements");
    }

    const statusMap = {
      [ModerationAction.APPROVE]: ContentStatus.PUBLISHED,
      [ModerationAction.REQUEST_IMPROVEMENTS]: ContentStatus.IMPROVEMENT_REQUIRED,
      [ModerationAction.REJECT]: ContentStatus.REJECTED,
    };

    const event = await this.prismaService.events.update({
      where: { id },
      data: {
        moderationStatus: statusMap[payload.action],
        reviewFeedback: payload.feedback || null,
        publicationStatus:
          payload.action === ModerationAction.APPROVE
            ? PublicationStatus.PUBLISHED
            : PublicationStatus.DRAFT,
      },
    });
    this.clearPublicSummaryCache();

    return plainToClass(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }
}
