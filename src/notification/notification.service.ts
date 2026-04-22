import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../shared/prisma-module/prisma.service";
import { NotificationOutputDto } from "./dto/notification-output.dto";

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyBlogReview(
    authorId: string | null,
    blogId: string,
    blogTitle: string,
    action: "approve" | "reject",
  ): Promise<void> {
    if (!authorId) {
      return;
    }

    const approved = action === "approve";
    await this.prisma.notification.create({
      data: {
        userId: authorId,
        type: approved
          ? NotificationType.BLOG_APPROVED
          : NotificationType.BLOG_REJECTED,
        title: approved ? "Blog approved" : "Blog rejected",
        body: approved
          ? `Your blog "${blogTitle}" has been approved and published.`
          : `Your blog "${blogTitle}" was not approved. You can edit it and submit again.`,
        entityType: "BLOG",
        entityId: blogId,
      },
    });
  }

  async notifyOrganizationVerified(
    userId: string,
    organizationId: string,
    organizationName: string,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.ORGANIZATION_VERIFIED,
        title: "Organization verified",
        body: `Your organization "${organizationName}" has been verified by an administrator.`,
        entityType: "ORGANIZATION",
        entityId: organizationId,
      },
    });
  }

  async findForUser(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{
    items: NotificationOutputDto[];
    total: number;
    unreadCount: number;
  }> {
    const where = { userId };

    const [rows, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, read: false } }),
    ]);

    return {
      items: plainToInstance(NotificationOutputDto, rows, {
        excludeExtraneousValues: true,
      }),
      total,
      unreadCount,
    };
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    const n = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!n) {
      throw new NotFoundException("Notification not found");
    }
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
