import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { LoginInput } from "../dtos/auth-login-input.dto";
import { RefreshTokenInput } from "../dtos/auth-refresh-token-input.dto";
import { RegisterInput } from "../dtos/auth-register-input.dto";
import { AuthTokenOutput } from "../dtos/auth-token-output.dto";
import { AuthService } from "../services/auth.service";
import { sendEmail } from "../../utils/email.util";
import { AuthController } from "./auth.controller";

jest.mock("../../utils/email.util", () => ({
  EmailType: { EMAIL_VERIFICATION: "EMAIL_VERIFICATION" },
  sendEmail: jest.fn(),
}));

const sendEmailMock = sendEmail as jest.Mock;

describe("AuthController", () => {
  let moduleRef: TestingModule;
  let authController: AuthController;

  const mockedAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockedLogger = { setContext: jest.fn(), log: jest.fn() };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockedAuthService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(authController).toBeDefined();
  });

  const ctx = new RequestContext();

  describe("registerLocal", () => {
    it("should register new user", async () => {
      const registerInputDto = new RegisterInput();
      registerInputDto.name = "John Doe";
      registerInputDto.username = "john@example.com";
      registerInputDto.password = "123123";

      const registeredUser = { email: "john@example.com" };
      jest
        .spyOn(mockedAuthService, "register")
        .mockImplementation(async () => registeredUser);
      sendEmailMock.mockResolvedValue({ success: true, message: "ok" });

      expect(await authController.registerLocal(ctx, registerInputDto)).toEqual(
        {
          data: registeredUser,
          meta: {},
        }
      );
    });
  });

  describe("login", () => {
    it("should login user", async () => {
      const loginInputDto = new LoginInput();
      loginInputDto.email = "john@example.com";
      loginInputDto.password = "123123";

      jest.spyOn(mockedAuthService, "login").mockImplementation(() => null);

      expect(await authController.login(ctx, loginInputDto)).toEqual({
        data: null,
        meta: {},
      });
    });
  });

  describe("forgotPassword", () => {
    it("requests a reset and returns a generic message", async () => {
      mockedAuthService.requestPasswordReset.mockResolvedValue(undefined);

      const response = await authController.forgotPassword(ctx, {
        email: "john@example.com",
      });

      expect(mockedAuthService.requestPasswordReset).toHaveBeenCalledWith(
        ctx,
        "john@example.com"
      );
      expect(response.data.message).toMatch(/if an account exists/i);
    });
  });

  describe("resetPassword", () => {
    it("resets the password with the token", async () => {
      mockedAuthService.resetPassword.mockResolvedValue(undefined);

      const response = await authController.resetPassword(ctx, {
        token: "raw-token",
        newPassword: "new-password",
      });

      expect(mockedAuthService.resetPassword).toHaveBeenCalledWith(
        ctx,
        "raw-token",
        "new-password"
      );
      expect(response.data.message).toBe("Password reset successfully");
    });
  });

  describe("refreshToken", () => {
    let refreshTokenInputDto: RefreshTokenInput;
    let authToken: AuthTokenOutput;

    beforeEach(() => {
      refreshTokenInputDto = {
        refreshToken: "refresh_token",
      };
      authToken = {
        accessToken: "new_access_token",
        refreshToken: "new_refresh_token",
      };

      jest
        .spyOn(mockedAuthService, "refreshToken")
        .mockImplementation(async () => authToken);
    });

    it("should generate refresh token", async () => {
      const response = await authController.refreshToken(
        ctx,
        refreshTokenInputDto
      );

      expect(mockedAuthService.refreshToken).toBeCalledWith(ctx);
      expect(response.data).toEqual(authToken);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });
});
