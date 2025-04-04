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
import { OpportunityService } from "../services/opportunities.service";
import {
  CreateOpportunityDto,
  OpportunityResponseDto,
  OpportunitySearchInput,
  UpdateOpportunityDto,
} from "../dto/opportunities.dto";

@ApiTags("opportunities")
@Controller("opportunities")
export class OpportunityController {
  constructor(
    private readonly service: OpportunityService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(OpportunityController.name);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: "Get opportunities API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([OpportunityResponseDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getOpportunities(
    @ReqContext() ctx: RequestContext,
    @Query() query: OpportunitySearchInput
  ): Promise<BaseApiResponse<OpportunityResponseDto[]>> {
    this.logger.log(ctx, `${this.getOpportunities.name} was called`);

    const { items, count } = await this.service.getOpportunities(ctx, query);

    return { data: items, meta: { count } };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: "Add opportunity API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OpportunityResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async addOpportutnity(
    @ReqContext() ctx: RequestContext,
    @Body() payload: CreateOpportunityDto
  ): Promise<BaseApiResponse<OpportunityResponseDto>> {
    this.logger.log(ctx, `${this.addOpportutnity.name} was called`);

    const item = await this.service.addOpportunity(ctx, payload);
    return { data: item, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("/:id")
  @ApiOperation({
    summary: "Get one opportunity API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OpportunityResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getOneOpportunity(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<OpportunityResponseDto>> {
    this.logger.log(ctx, `${this.getOneOpportunity.name} was called`);

    const item = await this.service.getOneOpportunity(ctx, id);
    return { data: item, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("/:id")
  @ApiOperation({
    summary: "Delete one opportunity API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OpportunityResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async deleteOpportunity(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<OpportunityResponseDto>> {
    this.logger.log(ctx, `${this.deleteOpportunity.name} was called`);

    const item = await this.service.deleteOpportunity(ctx, id);
    return { data: item, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch("/:id")
  @ApiOperation({
    summary: "Update one opportunity API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OpportunityResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async updateOpportunity(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() payload: UpdateOpportunityDto
  ): Promise<BaseApiResponse<OpportunityResponseDto>> {
    this.logger.log(ctx, `${this.updateOpportunity.name} was called`);

    const item = await this.service.updateOpportunity(ctx, id, payload);
    return { data: item, meta: {} };
  }
}
