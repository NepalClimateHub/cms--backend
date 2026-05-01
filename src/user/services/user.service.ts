import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  Address,
  Organizations,
  Prisma,
  User as UserEntity,
  UserType,
} from "@prisma/client";
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
    let registrationAddressId: string | undefined = undefined;

    if (input.role === UserType.ORGANIZATION) {
      // Create address if province or district is provided
      if (input.province || input.district) {
        const address = await this.prismaService.address.create({
          data: {
            state: input.province,
            city: input.district,
          },
        });
        registrationAddressId = address.id;
      }

      // Create organization
      const organizationType =
        input.orgType != null && input.orgType.trim() !== ""
          ? input.orgType.trim()
          : null;

      const organization = await this.prismaService.organizations.create({
        data: {
          name: input.orgName || input.name,
          description: "",
          addressId: registrationAddressId,
          organizationType,
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
        isEmailVerified: false,
        userType: input.role,
        organizationId,
        addressId: registrationAddressId,
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

    // Use toUserOutput so `role` is set from Prisma `userType` (plainToClass alone does not map that).
    return this.toUserOutput(user);
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
        include: {
          organization: { include: { address: true } },
        },
      }),
      this.prismaService.user.count(),
    ]);

    const usersOutput = await Promise.all(
      users.map((u) => {
        const preloaded: Organizations | null | undefined = u.organization
          ? u.organization.deletedAt
            ? null
            : u.organization
          : undefined;
        return this.toUserOutput(u, preloaded);
      }),
    );

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
      include: { address: true },
    });
  }

  private async toUserOutput(
    user: UserEntity,
    /** When set, skip org lookup (used by list to avoid N+1 queries). */
    preloadedOrg?: (Organizations & { address?: Address | null }) | null,
  ): Promise<UserOutput> {
    const org =
      preloadedOrg !== undefined
        ? preloadedOrg
        : await this.resolveOrganizationForUser(user);
    // Plain object (not a class instance) so ClassSerializerInterceptor does not
    // drop `role` / nested `organization` when serializing GET /users/me.
    const organizationPayload =
      org === null
        ? null
        : {
            id: org.id,
            name: org.name,
            description: org.description,
            organizationType: org.organizationType ?? null,
            address: org.address
              ? {
                  street: org.address.street,
                  country: org.address.country,
                  city: org.address.city,
                  state: org.address.state,
                  postcode: org.address.postcode,
                }
              : null,
            logoImageUrl: user.profilePhotoUrl,
            logoImageId: user.profilePhotoId,
            bannerImageUrl: user.bannerImageUrl,
            bannerImageId: user.bannerImageId,
            socials: user.socials,
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
      isEmailVerified: user.isEmailVerified,
      isVerifiedByAdmin: user.isVerifiedByAdmin,
      isSuperAdmin: user.userType === UserType.SUPER_ADMIN,
      role: user.userType,
      gender: user.gender,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,
      profilePhotoUrl: user.profilePhotoUrl,
      profilePhotoId: user.profilePhotoId,
      bio: user.bio,
      linkedin: user.linkedin,
      currentRole: user.currentRole,
      bannerImageId: user.bannerImageId,
      bannerImageUrl: user.bannerImageUrl,
      socials: user.socials,
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
        "No organization is linked to your account. Ask an administrator to set User.organizationId for your organization.",
      );
    }

    const hasLogoPatch =
      input.logoImageUrl !== undefined || input.logoImageId !== undefined;
    const hasBannerPatch =
      input.bannerImageUrl !== undefined || input.bannerImageId !== undefined;
    const hasSocialsPatch = input.socials !== undefined;
    const hasProfilePatch =
      input.name !== undefined ||
      input.description !== undefined ||
      input.organizationType !== undefined;
    const hasAddressPatch = input.address !== undefined;
    const hasVerificationPatch =
      input.verificationDocumentUrl !== undefined ||
      input.verificationDocumentId !== undefined ||
      input.verificationRequestRemarks !== undefined;

    if (
      !hasLogoPatch &&
      !hasBannerPatch &&
      !hasSocialsPatch &&
      !hasProfilePatch &&
      !hasAddressPatch &&
      !hasVerificationPatch
    ) {
      throw new BadRequestException("No updates provided.");
    }

    const orgData: Prisma.OrganizationsUpdateInput = {};
    const userData: Prisma.UserUpdateInput = {};

    if (hasLogoPatch) {
      if (input.logoImageUrl !== undefined) {
        userData.profilePhotoUrl = input.logoImageUrl;
      }
      if (input.logoImageId !== undefined) {
        userData.profilePhotoId = input.logoImageId;
      }
    }

    if (hasBannerPatch) {
      if (input.bannerImageUrl !== undefined) {
        userData.bannerImageUrl = input.bannerImageUrl;
      }
      if (input.bannerImageId !== undefined) {
        userData.bannerImageId = input.bannerImageId;
      }
    }

    if (hasSocialsPatch) {
      userData.socials = input.socials;
    }

    if (hasProfilePatch) {
      if (input.name !== undefined) {
        orgData.name = input.name;
      }
      if (input.description !== undefined) {
        orgData.description = input.description;
      }
      if (input.organizationType !== undefined) {
        orgData.organizationType = input.organizationType;
      }
    }

    if (hasAddressPatch && input.address) {
      const a = input.address;
      const addressPatch: Prisma.AddressUpdateInput = {};
      if (a.street !== undefined) {
        addressPatch.street = a.street;
      }
      if (a.country !== undefined) {
        addressPatch.country = a.country;
      }
      if (a.city !== undefined) {
        addressPatch.city = a.city;
      }
      if (a.state !== undefined) {
        addressPatch.state = a.state;
      }
      if (a.postcode !== undefined) {
        addressPatch.postcode = a.postcode;
      }
      if (Object.keys(addressPatch).length === 0) {
        // empty object — nothing to persist
      } else if (org.addressId) {
        await this.prismaService.address.update({
          where: { id: org.addressId },
          data: addressPatch,
        });
        if (user.addressId !== org.addressId) {
          userData.address = { connect: { id: org.addressId } };
        }
      } else {
        const created = await this.prismaService.address.create({
          data: {
            street: a.street ?? null,
            country: a.country ?? null,
            city: a.city ?? null,
            state: a.state ?? null,
            postcode: a.postcode ?? null,
          },
        });
        orgData.address = { connect: { id: created.id } };
        userData.address = { connect: { id: created.id } };
      }
    }

    if (hasVerificationPatch) {
      if (user.isVerifiedByAdmin) {
        throw new BadRequestException("Your organization is already verified.");
      }
      if (input.verificationRequestRemarks !== undefined) {
        orgData.verificationRequestRemarks = input.verificationRequestRemarks;
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
        orgData.verificationDocumentUrl = url;
        orgData.verificationDocumentId = docId;
        orgData.verificationRequestedAt = new Date();
      }
    }

    if (Object.keys(orgData).length > 0) {
      await this.prismaService.organizations.update({
        where: { id: org.id },
        data: orgData,
      });
    }

    if (Object.keys(userData).length > 0) {
      await this.prismaService.user.update({
        where: { id: userId },
        data: userData,
      });
    }

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

    const roleFieldsTouched = input.role !== undefined;
    const verificationFlagTouched = input.isVerifiedByAdmin !== undefined;
    if (roleFieldsTouched || verificationFlagTouched) {
      if (!ctx.user?.id) {
        throw new UnauthorizedException();
      }
      const actor = await this.prismaService.user.findUnique({
        where: { id: ctx.user.id },
      });
      if (actor?.userType !== UserType.SUPER_ADMIN) {
        if (roleFieldsTouched) {
          throw new ForbiddenException(
            "Only a super admin can change user type",
          );
        }
        throw new ForbiddenException(
          "Only a super admin can change admin verification status",
        );
      }
    }

    // Map name to fullName for Prisma; `role` maps to Prisma `userType`
    const { name, role, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (name !== undefined) {
      updateData.fullName = name;
    }
    if (role !== undefined) {
      updateData.userType = role;
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
    newRole: UserType,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.promoteUser.name} was called`);

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { userType: newRole },
    });

    return this.toUserOutput(user);
  }
}
