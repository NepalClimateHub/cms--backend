import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { createHash } from "crypto";

import { ActivityLogService } from "../../activity-log/activity-log.service";
import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { UserService } from "../../user/services/user.service";
import { sendEmail } from "../../utils/email.util";
import { AuthService } from "./auth.service";

jest.mock("../../utils/email.util", () => ({
  EmailType: {
    PASSWORD_RESET: "PASSWORD_RESET",
    PASSWORD_RESET_SUCCESS: "PASSWORD_RESET_SUCCESS",
  },
  sendEmail: jest.fn(),
}));

describe("AuthService password reset", () => {
  const ctx = new RequestContext();
  const sendEmailMock = sendEmail as jest.Mock;
  const userService = {
    setPasswordResetToken: jest.fn(),
    resetPasswordWithToken: jest.fn(),
  };
  let service: AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();
    sendEmailMock.mockResolvedValue({ success: true, message: "ok" });
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("https://cms.example.com/"),
          },
        },
        {
          provide: AppLogger,
          useValue: { setContext: jest.fn(), log: jest.fn(), error: jest.fn() },
        },
        { provide: ActivityLogService, useValue: {} },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  describe("requestPasswordReset", () => {
    it("stores a hashed token and emails a link containing the raw token", async () => {
      userService.setPasswordResetToken.mockResolvedValue({
        id: "1",
        email: "john@example.com",
        fullName: "John",
      });

      await service.requestPasswordReset(ctx, "John@Example.com");

      const [, email, hash, expiresAt] =
        userService.setPasswordResetToken.mock.calls[0];
      expect(email).toBe("john@example.com");
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

      const { resetLink } = sendEmailMock.mock.calls[0][1];
      const rawToken = new URL(resetLink).searchParams.get("token") as string;
      expect(
        resetLink.startsWith("https://cms.example.com/reset-password?"),
      ).toBe(true);
      expect(createHash("sha256").update(rawToken).digest("hex")).toBe(hash);
      expect(hash).not.toBe(rawToken);
    });

    it("sends nothing and does not throw for an unknown email", async () => {
      userService.setPasswordResetToken.mockResolvedValue(null);

      await expect(
        service.requestPasswordReset(ctx, "x@example.com"),
      ).resolves.toBeUndefined();
      expect(sendEmailMock).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("looks the user up by token hash and sends a confirmation", async () => {
      userService.resetPasswordWithToken.mockResolvedValue({
        email: "john@example.com",
        fullName: "John",
      });

      await service.resetPassword(ctx, "raw-token", "new-password");

      expect(userService.resetPasswordWithToken).toHaveBeenCalledWith(
        ctx,
        createHash("sha256").update("raw-token").digest("hex"),
        "new-password",
      );
      expect(sendEmailMock).toHaveBeenCalledWith(
        "PASSWORD_RESET_SUCCESS",
        expect.objectContaining({ to: "john@example.com" }),
      );
    });

    it("throws BadRequest for an invalid or expired token", async () => {
      userService.resetPasswordWithToken.mockResolvedValue(null);

      await expect(
        service.resetPassword(ctx, "bad", "new-password"),
      ).rejects.toThrow(BadRequestException);
      expect(sendEmailMock).not.toHaveBeenCalled();
    });
  });
});
