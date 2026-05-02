import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { plainToClass } from "class-transformer";
import { UserType } from "@prisma/client";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { UserOutput } from "../../user/dtos/user-output.dto";
import { UserService } from "../../user/services/user.service";

import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { AdminAnalyticsOutput } from "../dtos/admin-analytics-output.dto";
import {
  MonthlyUserStatsResponseDto,
  MonthlyUserStatsDto,
} from "../dtos/monthly-user-stats.dto";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService,
  ) {
    this.logger.setContext(AnalyticsService.name);
  }

  async getAdminDashboardAnalytics(
    ctx: RequestContext,
  ): Promise<AdminAnalyticsOutput> {
    this.logger.log(ctx, `${this.getAdminDashboardAnalytics.name} was called`);

    const res = Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.news.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.events.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.opportunity.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.blog.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = todayStart;
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return plainToClass(
      AdminAnalyticsOutput,
      {
        userCount: (await res)[0],
        newsCount: (await res)[1],
        eventCount: (await res)[2],
        opportunityCount: (await res)[3],
        blogCount: (await res)[4],
        projectCount: await this.prismaService.project.count({
          where: { deletedAt: null },
        }),
        adminCount: await this.prismaService.user.count({
          where: { deletedAt: null, userType: "ADMIN" },
        }),
        organizationCount: await this.prismaService.user.count({
          where: { deletedAt: null, userType: "ORGANIZATION" },
        }),
        individualCount: await this.prismaService.user.count({
          where: { deletedAt: null, userType: "INDIVIDUAL" },
        }),
        pendingOrganizationVerificationCount:
          await this.prismaService.user.count({
            where: {
              deletedAt: null,
              userType: "ORGANIZATION",
              isVerifiedByAdmin: false,
              organization: {
                deletedAt: null,
                OR: [
                  { verificationRequestedAt: { not: null } },
                  { verificationDocumentUrl: { not: null } },
                ],
              },
            },
          }),
        aiChatSessionsToday: await this.prismaService.chat_sessions.count({
          where: {
            created_at: { gte: todayStart },
          },
        }),
        aiChatSessionsYesterday: await this.prismaService.chat_sessions.count({
          where: {
            created_at: { gte: yesterdayStart, lt: yesterdayEnd },
          },
        }),
        aiChatSessionsThisMonth: await this.prismaService.chat_sessions.count({
          where: {
            created_at: { gte: thisMonthStart },
          },
        }),
        aiChatSessionsAllTime: await this.prismaService.chat_sessions.count(),
        aiChatMessagesToday: await this.prismaService.chat_messages.count({
          where: {
            created_at: { gte: todayStart },
          },
        }),
        aiChatMessagesYesterday: await this.prismaService.chat_messages.count({
          where: {
            created_at: { gte: yesterdayStart, lt: yesterdayEnd },
          },
        }),
        aiChatMessagesThisMonth: await this.prismaService.chat_messages.count({
          where: {
            created_at: { gte: thisMonthStart },
          },
        }),
        aiChatMessagesAllTime: await this.prismaService.chat_messages.count(),
      },

      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getTopBlogAuthors(
    ctx: RequestContext,
  ): Promise<
    Array<{ userId: string; name: string; email: string; blogCount: number }>
  > {
    this.logger.log(ctx, `${this.getTopBlogAuthors.name} was called`);

    const topAuthors = await this.prismaService.blog.groupBy({
      by: ["authorId"],
      where: {
        deletedAt: null,
        isDraft: false,
        authorId: { not: null },
      },
      _count: { authorId: true },
      orderBy: { _count: { authorId: "desc" } },
      take: 20,
    });

    const results = await Promise.all(
      topAuthors.map(async (entry) => {
        const user = await this.prismaService.user.findUnique({
          where: { id: entry.authorId! },
          select: { id: true, fullName: true, email: true },
        });
        return {
          userId: entry.authorId!,
          name: user?.fullName?.trim() || "Unknown",
          email: user?.email ?? "",
          blogCount: entry._count.authorId,
        };
      }),
    );

    return results;
  }

  async getNewJoinedUsers(ctx: RequestContext): Promise<
    Array<{
      userId: string;
      name: string;
      email: string;
      joinedAt: Date;
      role: string;
    }>
  > {
    this.logger.log(ctx, `${this.getNewJoinedUsers.name} was called`);

    const newestUsers = await this.prismaService.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        userType: true,
        profilePhotoUrl: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return newestUsers.map((user) => ({
      userId: user.id,
      name:
        user.userType === UserType.ORGANIZATION && user.organization?.name
          ? user.organization.name
          : user.fullName?.trim() || "Unknown",
      email: user.email,
      joinedAt: user.createdAt,
      role: user.userType,
      profilePhotoUrl: user.profilePhotoUrl,
    }));
  }

  async getMonthlyUserStats(
    ctx: RequestContext,
    year: number,
  ): Promise<MonthlyUserStatsResponseDto> {
    this.logger.log(ctx, `${this.getMonthlyUserStats.name} was called`);

    // Get all users for the specified year
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year + 1, 0, 1); // January 1st of next year

    const users = await this.prismaService.user.findMany({
      where: {
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Initialize monthly counts
    const monthlyCounts: { [key: number]: number } = {};
    for (let i = 0; i < 12; i++) {
      monthlyCounts[i] = 0;
    }

    // Count users by month
    users.forEach((user) => {
      const month = user.createdAt.getMonth();
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    // Convert to array format with month names
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyStats: MonthlyUserStatsDto[] = monthNames.map(
      (name, index) => ({
        month: name,
        count: monthlyCounts[index] || 0,
      }),
    );

    return plainToClass(
      MonthlyUserStatsResponseDto,
      {
        monthlyStats,
        year,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
