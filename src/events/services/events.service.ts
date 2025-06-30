import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToClass, plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateEventDto,
  EventResponseDto,
  EventsSearchInput,
  UpdateEventDto,
} from "../dto/events.dto";
import { applyFilters } from "../../shared/filters/prisma-filter.filter";
import { Prisma } from "@prisma/client";
import { createSearchKey } from "../../shared/utils/createSearchKey";

@Injectable()
export class EventsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(EventsService.name);
  }

  async getEvents(
    ctx: RequestContext,
    query: EventsSearchInput
  ): Promise<{ events: EventResponseDto[]; count: number }> {
    this.logger.log(ctx, `${this.getEvents.name} was called`);
    const { limit, offset, ...restQuery } = query;

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
        },
      });

    const events = await this.prismaService.events.findMany({
      where: {
        AND: [whereQuery],
      },
      include: {
        address: true,
        tags: true,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    const eventCount = await this.prismaService.events.count({
      where: {
        AND: [whereQuery],
      },
    });

    return {
      events: plainToInstance(EventResponseDto, events, {
        excludeExtraneousValues: true,
      }),
      count: eventCount,
    };
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

    return plainToInstance(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }

  async addEvent(
    ctx: RequestContext,
    payload: CreateEventDto
  ): Promise<EventResponseDto> {
    this.logger.log(ctx, `${this.addEvent.name} was called`);
    const { address, tagIds, gallery, bannerImageUrl, ...restPayload } =
      payload;

    const event = await this.prismaService.events.create({
      data: {
        contributedBy: ctx!.user!.id,
        ...restPayload,
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

    return plainToClass(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
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

    return plainToInstance(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
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

    const { address, tagIds, gallery, ...restPayload } = payload;

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

    return plainToClass(EventResponseDto, eventUpdate, {
      excludeExtraneousValues: true,
    });
  }
}
