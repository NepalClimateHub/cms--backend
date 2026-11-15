import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserType } from "@prisma/client";
import * as bcrypt from "bcrypt";

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

  it("validateUsernamePassword rejects a wrong password", async () => {
    const hash = await bcrypt.hash("Correct#123", 4);
    prisma.user.findUnique.mockResolvedValue(targetUser({ password: hash }));
    const ctx = new RequestContext();
    await expect(
      service.validateUsernamePassword(ctx, "test@example.com", "wrong"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.validateUsernamePassword(ctx, "test@example.com", "Correct#123"),
    ).resolves.toMatchObject({ id: "target-1" });
  });

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

describe("UserService — updateUser credentials", () => {
  let service: UserService;
  const users: Record<string, { id: string; userType: UserType }> = {
    super: { id: "super", userType: UserType.SUPER_ADMIN },
    admin: { id: "admin", userType: UserType.ADMIN },
    content: { id: "content", userType: UserType.CONTENT_ADMIN },
    indiv: { id: "indiv", userType: UserType.INDIVIDUAL },
  };
  const prisma = {
    user: {
      findUnique: jest.fn(({ where }) => Promise.resolve(users[where.id])),
      update: jest.fn(({ where }) => Promise.resolve(users[where.id])),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: AppLogger, useValue: { log: jest.fn(), setContext: jest.fn() } },
        { provide: PrismaService, useValue: prisma },
        { provide: ActivityLogService, useValue: { logActivity: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(UserService);
  });

  it.each([
    ["self password", "indiv", "indiv", { password: "x".repeat(8) }],
    ["self email verify", "indiv", "indiv", { isEmailVerified: true }],
    ["content admin on other", "content", "indiv", { password: "x".repeat(8) }],
    ["admin on super admin", "admin", "super", { password: "x".repeat(8) }],
  ])("forbids %s", async (_, actor, target, input) => {
    await expect(
      service.updateUser(ctxFor(actor, users[actor].userType), target, input),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it.each([
    ["super admin", "super", "admin"],
    ["admin", "admin", "indiv"],
  ])("lets %s reset another user's password", async (_, actor, target) => {
    await service.updateUser(ctxFor(actor, users[actor].userType), target, {
      password: "x".repeat(8),
    });
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it("allows self profile edits without credentials", async () => {
    await service.updateUser(ctxFor("indiv", UserType.INDIVIDUAL), "indiv", {
      name: "New",
    });
    expect(prisma.user.update).toHaveBeenCalled();
  });
});
