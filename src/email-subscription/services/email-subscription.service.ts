import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { ConflictException } from "@nestjs/common";

@Injectable()
export class EmailSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    try {
      return await this.prisma.subscribedEmailUser.create({
        data: { email },
      });
    } catch (error) {
      if ((error as any).code === "P2002") {
        // Prisma unique constraint failed
        throw new ConflictException("Email is already subscribed");
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.subscribedEmailUser.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async remove(id: string) {
    return this.prisma.subscribedEmailUser.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
