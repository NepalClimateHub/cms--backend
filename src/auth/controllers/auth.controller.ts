import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../../shared/dtos/base-api-response.dto";
import { AppLogger } from "../../shared/logger/logger.service";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { LoginInput } from "../dtos/auth-login-input.dto";
import { RefreshTokenInput } from "../dtos/auth-refresh-token-input.dto";
import { RegisterInput } from "../dtos/auth-register-input.dto";
import { RegisterOutput } from "../dtos/auth-register-output.dto";
import { AuthTokenOutput } from "../dtos/auth-token-output.dto";
import { ResendVerificationInput } from "../dtos/auth-resend-verification-input.dto";
import { ChangePasswordInput } from "../dtos/auth-change-password-input.dto";
import { JwtRefreshGuard } from "../guards/jwt-refresh.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { LocalAuthGuard } from "../guards/local-auth.guard";
import { AuthService } from "../services/auth.service";
import { EmailType, sendEmail } from "src/utils/email.util";
import { JwtService } from "@nestjs/jwt";
import { RolesGuard } from "../guards/roles.guard";
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Get("public-key")
  @ApiOperation({ summary: "Get JWT public key for token verification" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns the public key used for JWT verification",
  })
  getPublicKey(): BaseApiResponse<{ publicKey: string }> {
    const publicKey = this.configService.get<string>("jwt.publicKey") || "";
    return { data: { publicKey }, meta: {} };
  }

  @Post("login")
  @ApiOperation({
    summary: "User login API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  login(
    @ReqContext() ctx: RequestContext,
    @Body() _: LoginInput
  ): BaseApiResponse<AuthTokenOutput> {
    this.logger.log(ctx, `${this.login.name} was called`);
    const authToken = this.authService.login(ctx);
    return { data: authToken, meta: {} };
  }

  @Post("register")
  @ApiOperation({
    summary: "User registration API",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(RegisterOutput), // RegisterOutput now includes userType
  })
  async registerLocal(
    @ReqContext() ctx: RequestContext,
    @Body() input: RegisterInput // RegisterInput now includes userType
  ): Promise<BaseApiResponse<RegisterOutput>> {
    const registeredUser = await this.authService.register(ctx, input);

    // Send welcome email
    await sendEmail(EmailType.WELCOME_EMAIL, {
      to: registeredUser.email,
      fullName: registeredUser.name,
    });

    const jwtService = new JwtService();

    const accountVerificationToken = jwtService.sign(
      { email: registeredUser.email },
      { secret: "temp-secret-key", expiresIn: "10m" }
    );
    // Send verification email
    await sendEmail(EmailType.EMAIL_VERIFICATION, {
      to: registeredUser.email,
      fullName: registeredUser.name,
      verificationCode: accountVerificationToken,
    });

    return { data: registeredUser, meta: {} };
  }

  @Post("resend-verification")
  @ApiOperation({
    summary: "Resend email verification API",
    description: "Resends email verification to the specified email address",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Verification email sent successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found",
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid email or user already verified",
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @ReqContext() ctx: RequestContext,
    @Body() input: ResendVerificationInput
  ): Promise<BaseApiResponse<{ message: string }>> {
    this.logger.log(ctx, `${this.resendVerification.name} was called`);

    const result = await this.authService.resendVerification(ctx, input.email);

    return {
      data: { message: result.message },
      meta: {},
    };
  }

  @Get("verify-email")
  @ApiOperation({
    summary: "Verify email address API",
    description:
      "Verifies user email address using JWT token from verification link",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Email verified successfully",
    type: BaseApiResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid or expired token",
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found",
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @ReqContext() ctx: RequestContext,
    @Query("token") token: string
  ): Promise<
    BaseApiResponse<{ message: string; email: string; status: string }>
  > {
    this.logger.log(ctx, `${this.verifyEmail.name} was called`);

    const result = await this.authService.verifyEmail(ctx, token);

    // send email verified email
    await sendEmail(EmailType.EMAIL_VERIFIED, {
      to: result.email,
      fullName: result.email,
    });

    return {
      data: {
        message: "Email Verified Successfully",
        email: result.email,
        status: "EMAIL_VERIFIED",
      },
      meta: {},
    };
  }

  @Post("change-password")
  @ApiOperation({
    summary: "Change user password API",
    description:
      "Changes the user's password after verifying the current password",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Password changed successfully",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid current password or authentication required",
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid password format",
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async changePassword(
    @ReqContext() ctx: RequestContext,
    @Body() input: ChangePasswordInput
  ): Promise<BaseApiResponse<{ message: string }>> {
    this.logger.log(ctx, `${this.changePassword.name} was called`);

    const result = await this.authService.changePassword(ctx, input);

    return {
      data: { message: result.message },
      meta: {},
    };
  }

  @Post("refresh-token")
  @ApiOperation({
    summary: "Refresh access token API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: RefreshTokenInput
  ): Promise<BaseApiResponse<AuthTokenOutput>> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const authToken = await this.authService.refreshToken(ctx);
    return { data: authToken, meta: {} };
  }
}
