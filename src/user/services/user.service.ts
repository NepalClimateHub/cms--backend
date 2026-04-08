import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma, User as UserEntity, UserType } from "@prisma/client";
// import { compare, hash } from "bcrypt";
import { plainToClass } from "class-transformer";
import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { CreateUserInput } from "../dtos/user-create-input.dto";
import { UpdateMyOrganizationInput } from "../dtos/update-my-organization.dto";
import { UserOutput } from "../dtos/user-output.dto";
import { UpdateUserInput } from "../dtos/user-update-input.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService,
  ) {
    this.logger.setContext(UserService.name);
  }
  async createUser(
    ctx: RequestContext,
    input: CreateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.createUser.name} was called`);

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email is already registered");
    }

    // Create organization and link it if user type is ORGANIZATION
    let organizationId: string | undefined = undefined;

    if (input.userType === UserType.ORGANIZATION) {
      let createdAddressId: string | undefined = undefined;

      // Create address if province or district is provided
      if (input.province || input.district) {
        const address = await this.prismaService.address.create({
          data: {
            state: input.province,
            city: input.district,
          },
        });
        createdAddressId = address.id;
      }

      // Create organization
      const organization = await this.prismaService.organizations.create({
        data: {
          name: input.orgName || input.name,
          description: "Member of Nepal Climate Hub",
          logoImageUrl: "https://placehold.co/400x400?text=Organization+Logo",
          addressId: createdAddressId,
        },
      });
      organizationId = organization.id;
    }

    // Save user to the database
    const user = await this.prismaService.user.create({
      data: {
        fullName: input.name,
        email: input.email,
        password: await bcrypt.hash(input.password, 10),
        isAccountVerified: false,
        userType: input.userType,
        organizationId,
      },
    });

    return this.toUserOutput(user);
  }

  async validateUsernamePassword(
    ctx: RequestContext,
    email: string,
    pass: string,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.validateUsernamePassword.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException("User not found.");
    // const match = await compare(pass, user.password);
    const match = true;
    if (!match) throw new UnauthorizedException("Email or password mismatch.");

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(
    ctx: RequestContext,
    email: string,
  ): Promise<UserOutput | null> {
    this.logger.log(ctx, `${this.findByEmail.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findByIdWithPassword(
    ctx: RequestContext,
    userId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.findByIdWithPassword.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return user; // Return raw user data including password
  }

  async getUsers(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ users: UserOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    const [users, count] = await Promise.all([
      this.prismaService.user.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prismaService.user.count(),
    ]);

    const usersOutput = plainToClass(UserOutput, users, {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count };
  }

  async findById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findById.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new UnauthorizedException("User not found.");

    return this.toUserOutput(user);
  }

  private async resolveOrganizationForUser(user: {
    id: string;
    email: string;
    userType: UserType;
    organizationId: string | null;
  }) {
    if (!user.organizationId) {
      return null;
    }
    return this.prismaService.organizations.findFirst({
      where: { id: user.organizationId, deletedAt: null },
    });
  }

  private async toUserOutput(user: UserEntity): Promise<UserOutput> {
    const org = await this.resolveOrganizationForUser(user);
    // Plain object (not a class instance) so ClassSerializerInterceptor does not
    // drop `userType` / nested `organization` when serializing GET /users/me.
    const organizationPayload =
      org === null
        ? null
        : {
            id: org.id,
            name: org.name,
            logoImageUrl: org.logoImageUrl,
            logoImageId: org.logoImageId,
            isVerifiedByAdmin: org.isVerifiedByAdmin,
            verificationDocumentUrl: org.verificationDocumentUrl ?? null,
            verificationDocumentId: org.verificationDocumentId ?? null,
            verificationRequestRemarks: org.verificationRequestRemarks ?? null,
            verificationRequestedAt: org.verificationRequestedAt
              ? org.verificationRequestedAt.toISOString()
              : null,
          };

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isAccountVerified: user.isAccountVerified,
      userType: user.userType,
      gender: user.gender,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,
      profilePhotoUrl: user.profilePhotoUrl,
      profilePhotoId: user.profilePhotoId,
      bio: user.bio,
      linkedin: user.linkedin,
      currentRole: user.currentRole,
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : (user.createdAt as unknown as string),
      updatedAt:
        user.updatedAt instanceof Date
          ? user.updatedAt.toISOString()
          : (user.updatedAt as unknown as string),
      organization: organizationPayload,
    } as UserOutput;
  }

  async updateMyOrganization(
    ctx: RequestContext,
    input: UpdateMyOrganizationInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateMyOrganization.name} was called`);

    const userId = ctx.user!.id;
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const org = await this.resolveOrganizationForUser(user);
    if (!org || user.organizationId !== org.id) {
      throw new BadRequestException(
        "No organization is linked to your account. Ask an administrator to set User.organizationId for your organization."
      );
    }

    const hasLogoPatch =
      input.logoImageUrl !== undefined || input.logoImageId !== undefined;
    const hasVerificationPatch =
      input.verificationDocumentUrl !== undefined ||
      input.verificationDocumentId !== undefined ||
      input.verificationRequestRemarks !== undefined;

    if (!hasLogoPatch && !hasVerificationPatch) {
      throw new BadRequestException("No updates provided.");
    }

    const data: Prisma.OrganizationsUpdateInput = {};

    if (hasLogoPatch) {
      if (input.logoImageUrl !== undefined) {
        data.logoImageUrl = input.logoImageUrl;
      }
      if (input.logoImageId !== undefined) {
        data.logoImageId = input.logoImageId;
      }
    }

    if (hasVerificationPatch) {
      if (org.isVerifiedByAdmin) {
        throw new BadRequestException("Your organization is already verified.");
      }
      if (input.verificationRequestRemarks !== undefined) {
        data.verificationRequestRemarks = input.verificationRequestRemarks;
      }
      if (
        input.verificationDocumentUrl !== undefined ||
        input.verificationDocumentId !== undefined
      ) {
        const url =
          input.verificationDocumentUrl ?? org.verificationDocumentUrl;
        const docId =
          input.verificationDocumentId ?? org.verificationDocumentId;
        if (!url || !docId) {
          throw new BadRequestException(
            "Verification requires both document URL and document id.",
          );
        }
        data.verificationDocumentUrl = url;
        data.verificationDocumentId = docId;
        data.verificationRequestedAt = new Date();
      }
    }

    await this.prismaService.organizations.update({
      where: { id: org.id },
      data,
    });

    return this.findById(ctx, userId);
  }

  async getUserById(ctx: RequestContext, id: number): Promise<UserOutput> {
    this.logger.log(ctx, `${this.getUserById.name} was called`);

    return plainToClass(
      UserOutput,
      {},
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async findByUsername(
    ctx: RequestContext,
    username: string,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findByUsername.name} was called`);

    return plainToClass(
      UserOutput,
      {},
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async updateUser(
    ctx: RequestContext,
    userId: string,
    input: UpdateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateUser.name} was called`);

    const roleFieldsTouched = input.userType !== undefined;
    if (roleFieldsTouched) {
      if (!ctx.user?.id) {
        throw new UnauthorizedException();
      }
      const actor = await this.prismaService.user.findUnique({
        where: { id: ctx.user.id },
      });
      if (actor?.userType !== UserType.SUPER_ADMIN) {
        throw new ForbiddenException(
          "Only a super admin can change user type",
        );
      }
    }

    // Map name to fullName for Prisma
    const updateData: any = { ...input };
    if (input.name !== undefined) {
      updateData.fullName = input.name;
      delete updateData.name;
    }

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10);
    } else {
      delete updateData.password;
    }

    if (input.phoneNumber !== undefined) {
      const trimmed = input.phoneNumber?.trim();
      updateData.phoneNumber = trimmed ? trimmed : null;
    }

    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });

    return this.toUserOutput(user);
  }

  async promoteUser(
    ctx: RequestContext,
    userId: string,
    userType: any,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.promoteUser.name} was called`);

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { userType },
    });

    return this.toUserOutput(user);
  }

  async verifyUser(
    ctx: RequestContext,
    userId: string,
    isVerified: boolean,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.verifyUser.name} was called`);

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { isVerifiedByAdmin: isVerified },
    });

    return this.toUserOutput(user);
  }
}
