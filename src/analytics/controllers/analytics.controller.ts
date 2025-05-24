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
import { AnalyticsService } from "../services/analytics.service";

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
}
