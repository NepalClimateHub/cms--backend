import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { ActivityAction, ActivityEntity } from "@prisma/client";
import { PrismaService } from "../shared/prisma-module/prisma.service";
import { RequestContext } from "../shared/request-context/request-context.dto";
import {
  ActivityLogQueryDto,
  ActivityLogResponseDto,
} from "./dto/activity-log.dto";

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget activity logger.
   * Call without await — failures are swallowed so they never break the primary operation.
   */
  logActivity(
    ctx: RequestContext,
    action: ActivityAction,
    entity: ActivityEntity,
    entityId?: string,
    entityName?: string,
  ): void {
    if (!ctx?.user) return;
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"];
    if (!allowedRoles.includes(ctx.user.userType)) return;

    this.prisma.activityLog
      .create({
        data: {
          userId: ctx.user.id,
          userEmail: ctx.user.email,
          userName: ctx.user.fullName,
          userRole: ctx.user.userType,
          action,
          entity,
          entityId: entityId ?? null,
          entityName: entityName ?? null,
        },
      })
      .catch(() => {
        // Intentionally swallowed — logging must never break business logic
      });
  }

  async getActivities(
    query: ActivityLogQueryDto,
  ): Promise<{ data: ActivityLogResponseDto[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entity,
      startDate,
      endDate,
    } = query;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: plainToInstance(ActivityLogResponseDto, logs, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }
}
