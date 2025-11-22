import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../../shared/dtos/base-api-response.dto";
import { AppLogger } from "../../shared/logger/logger.service";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { RegisterInput } from "../../auth/dtos/auth-register-input.dto";
import { AdminAnalyticsOutput } from "../dtos/admin-analytics-output.dto";
import { MonthlyUserStatsResponseDto } from "../dtos/monthly-user-stats.dto";
import { AnalyticsService } from "../services/analytics.service";
import { Query } from "@nestjs/common";

@ApiTags("analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(
    private readonly logger: AppLogger,
    private readonly analyticsService: AnalyticsService
  ) {
    this.logger.setContext(AnalyticsController.name);
  }

  @Get("/admin-dashboard")
  @ApiOperation({
    summary: "Get admin dashboard data",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AdminAnalyticsOutput),
  })
  async getAdminAnalytics(
    @ReqContext() ctx: RequestContext
  ): Promise<BaseApiResponse<AdminAnalyticsOutput>> {
    const res = await this.analyticsService.getAdminDashboardAnalytics(ctx);
    return { data: res, meta: {} };
  }

  @Get("/monthly-user-stats")
  @ApiOperation({
    summary: "Get monthly user statistics for a given year",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MonthlyUserStatsResponseDto),
  })
  async getMonthlyUserStats(
    @ReqContext() ctx: RequestContext,
    @Query("year") year?: string
  ): Promise<BaseApiResponse<MonthlyUserStatsResponseDto>> {
    const yearNumber = year ? parseInt(year, 10) : new Date().getFullYear();
    const res = await this.analyticsService.getMonthlyUserStats(
      ctx,
      yearNumber
    );
    return { data: res, meta: {} };
  }
}
