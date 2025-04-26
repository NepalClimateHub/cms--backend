import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../../shared/dtos/base-api-response.dto";
import { AppLogger } from "../../shared/logger/logger.service";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { EventsService } from "../services/events.service";
import {
  CreateEventDto,
  EventResponseDto,
  EventsSearchInput,
  UpdateEventDto,
} from "../dto/events.dto";

@ApiTags("events")
@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(EventsController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: "Get events API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([EventResponseDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getEvents(
    @ReqContext() ctx: RequestContext,
    @Query() query: EventsSearchInput
  ): Promise<BaseApiResponse<EventResponseDto[]>> {
    this.logger.log(ctx, `${this.getEvents.name} was called`);

    const { events, count } = await this.eventsService.getEvents(ctx, query);
    return { data: events, meta: { count } };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: "Add events API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(EventResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async addEvent(
    @ReqContext() ctx: RequestContext,
    @Body() payload: CreateEventDto
  ): Promise<BaseApiResponse<EventResponseDto>> {
    this.logger.log(ctx, `${this.addEvent.name} was called`);

    const event = await this.eventsService.addEvent(ctx, payload);
    return { data: event, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get("/:id")
  @ApiOperation({
    summary: "Get one events API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(EventResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getOneEvent(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<EventResponseDto>> {
    this.logger.log(ctx, `${this.getOneEvent.name} was called`);

    const event = await this.eventsService.getOneEvent(ctx, id);
    return { data: event, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("/:id")
  @ApiOperation({
    summary: "Delete one events API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(EventResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async deleteEvent(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<EventResponseDto>> {
    this.logger.log(ctx, `${this.deleteEvent.name} was called`);

    const event = await this.eventsService.deleteEvent(ctx, id);
    return { data: event, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch("/:id")
  @ApiOperation({
    summary: "Update one events API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(EventResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async updateEvent(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() payload: UpdateEventDto
  ): Promise<BaseApiResponse<EventResponseDto>> {
    this.logger.log(ctx, `${this.updateEvent.name} was called`);

    const event = await this.eventsService.updateEvent(ctx, id, payload);
    return { data: event, meta: {} };
  }
}
