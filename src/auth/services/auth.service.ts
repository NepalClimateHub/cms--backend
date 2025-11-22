import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { plainToClass } from "class-transformer";
import * as bcrypt from "bcrypt";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { UserOutput } from "../../user/dtos/user-output.dto";
import { UserService } from "../../user/services/user.service";
import { ROLE } from "../constants/role.constant";
import { RegisterInput } from "../dtos/auth-register-input.dto";
import { RegisterOutput } from "../dtos/auth-register-output.dto";
import {
  AuthTokenOutput,
  UserAccessTokenClaims,
} from "../dtos/auth-token-output.dto";
import { EmailType, sendEmail } from "../../utils/email.util";
import { getJWTTokenForEmailVerification } from "src/utils/jwt.util";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateUser(
    ctx: RequestContext,
    email: string,
    pass: string
  ): Promise<UserAccessTokenClaims> {
    this.logger.log(ctx, `${this.validateUser.name} was called`);

    // The userService will throw Unauthorized in case of invalid username/password.
    const user = await this.userService.validateUsernamePassword(
      ctx,
      email,
      pass
    );

    // Prevent disabled users from logging in.
    if (!user.isAccountVerified) {
      // send email to user to verify account
      await sendEmail(EmailType.EMAIL_VERIFICATION, {
        to: user.email,
        fullName: user.fullName,
        verificationCode: getJWTTokenForEmailVerification(user.email), // makes the url from this JWT token and sends email
      });

      throw new UnauthorizedException("This account is not verified!");
    }

    // Ensure userType is present in returned claims
    return user;
  }

  login(ctx: RequestContext): AuthTokenOutput {
    this.logger.log(ctx, `${this.login.name} was called`);
    return this.getAuthToken(ctx, ctx.user!);
  }

  async register(
    ctx: RequestContext,
    input: RegisterInput
  ): Promise<RegisterOutput> {
    this.logger.log(ctx, `${this.register.name} was called`);

    // Set default role and account status
    input.roles = [ROLE.USER];
    input.isAccountDisabled = false;

    // Pass userType from input
    const registeredUser = await this.userService.createUser(ctx, input);
    return plainToClass(RegisterOutput, registeredUser, {
      excludeExtraneousValues: true,
    });
  }

  async resendVerification(
    ctx: RequestContext,
    email: string
  ): Promise<{ message: string }> {
    this.logger.log(ctx, `${this.resendVerification.name} was called`);

    // Find user by email
    const user = await this.userService.findByEmail(ctx, email);

    if (!user) {
      throw new NotFoundException("User not found with this email address");
    }

    // Check if user is already verified
    if (user.isAccountVerified) {
      throw new BadRequestException("Account is already verified");
    }

    // Send verification email
    const emailSent = await sendEmail(EmailType.EMAIL_VERIFICATION, {
      to: user.email,
      userName: user.fullName,
      verificationCode: getJWTTokenForEmailVerification(user.email),
    });

    if (!emailSent) {
      throw new BadRequestException("Failed to send verification email");
    }

    return {
      message: "Verification email sent successfully",
    };
  }

  async verifyEmail(
    ctx: RequestContext,
    token: string
  ): Promise<{ email: string }> {
    this.logger.log(ctx, `${this.verifyEmail.name} was called`);

    try {
      // Verify and decode the JWT token
      const decoded = this.jwtService.verify(token, {
        secret: "temp-secret-key",
      });
      const email = decoded.email;

      if (!email) {
        throw new BadRequestException("Invalid token: email not found");
      }

      // Find the user by email
      const user = await this.userService.findByEmail(ctx, email);

      if (!user) {
        throw new NotFoundException("User not found with this email address");
      }

      if (user.isAccountVerified) {
        throw new BadRequestException("Account is already verified");
      }

      // Update user verification status
      await this.userService.updateUser(ctx, user.id, {
        isAccountVerified: true,
      });

      return {
        email: email,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // JWT verification errors (expired, invalid, etc.)
      throw new BadRequestException("Invalid or expired verification token");
    }
  }

  async changePassword(
    ctx: RequestContext,
    input: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string }> {
    this.logger.log(ctx, `${this.changePassword.name} was called`);

    this.logger.log(ctx, `user : {ctx.user}`);
    // Get the current user with password
    const user = await this.userService.findByIdWithPassword(ctx, ctx.user!.id);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Invalid current password");
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(input.newPassword, 10);

    // Update the password
    await this.userService.updateUser(ctx, user.id, {
      password: hashedNewPassword,
    });

    return {
      message: "Password changed successfully",
    };
  }

  async refreshToken(ctx: RequestContext): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const user = await this.userService.findById(ctx, ctx.user!.id);
    if (!user) {
      throw new UnauthorizedException("Invalid user id");
    }

    return this.getAuthToken(ctx, user);
  }

  getAuthToken(
    ctx: RequestContext,
    user: UserAccessTokenClaims | UserOutput
  ): AuthTokenOutput {
    this.logger.log(ctx, `${this.getAuthToken.name} was called`);

    const subject = { sub: user.id };
    const payload = {
      id: user.id,
      email: user.email,
      role: user.isSuperAdmin ? ROLE.ADMIN : ROLE.USER,
      fullName: user.fullName,
    };

    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        expiresIn: this.configService.get("jwt.refreshTokenExpiresInSec"),
      }),
      accessToken: this.jwtService.sign(
        { ...payload, ...subject },
        { expiresIn: this.configService.get("jwt.accessTokenExpiresInSec") }
      ),
    };
    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true,
    });
  }
}
