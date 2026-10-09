import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserType } from "@prisma/client";

import { UserService } from "./user.service";
import { AppLogger } from "../../shared/logger/logger.service";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";

function ctxFor(id: string, userType: UserType): RequestContext {
  const ctx = new RequestContext();
  ctx.user = { id, userType } as RequestContext["user"];
  return ctx;
}

function targetUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "target-1",
    fullName: "Test Org",
    email: "test@example.com",
    userType: UserType.ORGANIZATION,
    organizationId: "org-1",
    ...overrides,
  };
}

describe("UserService — deleteUser", () => {
  let service: UserService;
  const prisma = {
    user: { findUnique: jest.fn(), delete: jest.fn(), update: jest.fn() },
    blog: { updateMany: jest.fn() },
    organizations: { findFirst: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn(),
  };
  const activity = { logActivity: jest.fn() };
  const logger = { log: jest.fn(), setContext: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(targetUser());
    prisma.organizations.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockResolvedValue([]);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: AppLogger, useValue: logger },
        { provide: PrismaService, useValue: prisma },
        { provide: ActivityLogService, useValue: activity },
      ],
    }).compile();
    service = moduleRef.get(UserService);
  });

  it.each([UserType.CONTENT_ADMIN, UserType.ORGANIZATION, UserType.INDIVIDUAL])(
    "forbids %s from deleting users",
    async (role) => {
      await expect(
        service.deleteUser(ctxFor("actor-1", role), "target-1"),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it("rejects unauthenticated context", async () => {
    await expect(
      service.deleteUser(new RequestContext(), "target-1"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects self-deletion", async () => {
    await expect(
      service.deleteUser(ctxFor("target-1", UserType.SUPER_ADMIN), "target-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns not found for a missing user", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.deleteUser(ctxFor("actor-1", UserType.ADMIN), "missing"),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("prevents ADMIN from deleting a SUPER_ADMIN", async () => {
    prisma.user.findUnique.mockResolvedValue(
      targetUser({ userType: UserType.SUPER_ADMIN, organizationId: null }),
    );
    await expect(
      service.deleteUser(ctxFor("actor-1", UserType.ADMIN), "target-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("lets SUPER_ADMIN delete another SUPER_ADMIN", async () => {
    prisma.user.findUnique.mockResolvedValue(
      targetUser({ userType: UserType.SUPER_ADMIN, organizationId: null }),
    );
    await service.deleteUser(ctxFor("actor-1", UserType.SUPER_ADMIN), "target-1");
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "target-1" },
    });
  });

  it("hard-deletes the user (frees the email), detaches blogs, keeps the organization", async () => {
    const result = await service.deleteUser(
      ctxFor("actor-1", UserType.ADMIN),
      "target-1",
    );

    expect(prisma.blog.updateMany).toHaveBeenCalledWith({
      where: { authorId: "target-1" },
      data: { authorId: null },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "target-1" },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.organizations.delete).not.toHaveBeenCalled();
    expect(result.email).toBe("test@example.com");
    expect(activity.logActivity).toHaveBeenCalledTimes(1);
  });
});
