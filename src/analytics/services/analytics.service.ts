import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { plainToClass } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { UserOutput } from "../../user/dtos/user-output.dto";
import { UserService } from "../../user/services/user.service";

import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { AdminAnalyticsOutput } from "../dtos/admin-analytics-output.dto";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(AnalyticsService.name);
  }

  async getAdminDashboardAnalytics(
    ctx: RequestContext
  ): Promise<AdminAnalyticsOutput> {
    this.logger.log(ctx, `${this.getAdminDashboardAnalytics.name} was called`);

    const res = Promise.all([
      this.prismaService.user.count(),
      this.prismaService.news.count(),
      this.prismaService.events.count(),
      this.prismaService.opportunity.count(),
    ]);

    console.log("res", await res);
    return plainToClass(
      AdminAnalyticsOutput,
      {
        userCount: (await res)[0],
        newsCount: (await res)[1],
        eventCount: (await res)[2],
        opportunityCount: (await res)[3],
      },

      {
        excludeExtraneousValues: true,
      }
    );
  }
}
