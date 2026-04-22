import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  OrganizationSearchInput,
  UpdateOrganizationDto,
} from "../dto/organization.dto";
import { applyFilters } from "../../shared/filters/prisma-filter.filter";
import { Prisma } from "@prisma/client";
import { createSearchKey } from "../../shared/utils/createSearchKey";
import { NotificationService } from "../../notification/notification.service";
import { EmailType, sendEmail } from "../../utils/email.util";

const linkedUserSelect = {
  select: {
    email: true,
    phoneCountryCode: true,
    phoneNumber: true,
    profilePhotoUrl: true,
    profilePhotoId: true,
    bannerImageUrl: true,
    bannerImageId: true,
    socials: true,
    isVerifiedByAdmin: true,
  },
} as const;

@Injectable()
export class OrganizationService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    this.logger.setContext(OrganizationService.name);
  }

  private toOrganizationResponseDto(
    org: Record<string, unknown>,
  ): OrganizationResponseDto {
    const u = org.linkedAccountUser as
      | {
          email: string | null;
          phoneCountryCode: string | null;
          phoneNumber: string | null;
          profilePhotoUrl: string | null;
          profilePhotoId: string | null;
          bannerImageUrl: string | null;
          bannerImageId: string | null;
          socials: any | null;
          isVerifiedByAdmin: boolean;
        }
      | null
      | undefined;
    const { linkedAccountUser: _lu, ...rest } = org;
    return plainToInstance(
      OrganizationResponseDto,
      {
        ...rest,
        isVerifiedByAdmin: u?.isVerifiedByAdmin ?? false,
        email: u?.email ?? null,
        phoneCountryCode: u?.phoneCountryCode ?? null,
        phoneNumber: u?.phoneNumber ?? null,
        logoImageUrl: u?.profilePhotoUrl ?? null,
        logoImageId: u?.profilePhotoId ?? null,
        bannerImageUrl: u?.bannerImageUrl ?? null,
        bannerImageId: u?.bannerImageId ?? null,
        socials: u?.socials ?? null,
      },
      { excludeExtraneousValues: true },
    );
  }

  async getOrganizations(
    ctx: RequestContext,
    query: OrganizationSearchInput,
  ): Promise<{ organizations: OrganizationResponseDto[]; count: number }> {
    this.logger.log(ctx, `${this.getOrganizations.name} was called`);
    const { limit, offset, ...restQuery } = query;

    const { whereBuilder: orgWhereQuery } =
      await applyFilters<Prisma.OrganizationsWhereInput>({
        appliedFiltersInput: restQuery,
        availableFilters: {
          name: async ({ filter }) => {
            const searchKey = createSearchKey(String(filter), "AND");
            return {
              where: {
                OR: [
                  {
                    name: {
                      search: searchKey,
                      mode: "insensitive",
                    },
                  },
                  {
                    name: {
                      contains: String(filter),
                      mode: "insensitive",
                    },
                  },
                ],
              },
            };
          },
          tagIds: async ({ filter }) => {
            return {
              where: {
                tags: {
                  some: {
                    id: {
                      in: filter as string[],
                    },
                  },
                },
              },
            };
          },
        },
      });

    const organizations = await this.prismaService.organizations.findMany({
      where: {
        AND: [orgWhereQuery],
      },
      include: {
        address: true,
        tags: true,
        linkedAccountUser: linkedUserSelect,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    const organizationCount = await this.prismaService.organizations.count({
      where: {
        AND: [orgWhereQuery],
      },
    });

    return {
      organizations: organizations.map((o) =>
        this.toOrganizationResponseDto(o as unknown as Record<string, unknown>),
      ),
      count: organizationCount,
    };
  }

  async getOneOrganization(
    ctx: RequestContext,
    id: string,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(ctx, `${this.getOneOrganization.name} was called`);

    const organization = await this.prismaService.organizations.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
        tags: true,
        organizationGallery: true,
        linkedAccountUser: linkedUserSelect,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return this.toOrganizationResponseDto(
      organization as unknown as Record<string, unknown>,
    );
  }

  async addOrganization(
    ctx: RequestContext,
    payload: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(ctx, `${this.addOrganization.name} was called`);
    const {
      address,
      tagIds,
      gallery,
      socials,
      bannerImageUrl,
      bannerImageId,
      logoImageUrl,
      logoImageId,
      ...restPayload
    } = payload;

    const created = await this.prismaService.organizations.create({
      data: {
        ...restPayload,
        ...(address && {
          address: {
            create: {
              ...address,
            },
          },
        }),

        ...(tagIds && {
          tags: {
            connect: tagIds?.map((id) => ({
              id,
              isOrganizationTag: true,
            })),
          },
        }),
        ...(gallery && {
          organizationGallery: {
            create: gallery,
          },
        }),
        ...(socials && {
          socials: {
            create: {
              data: JSON.parse(JSON.stringify(socials)),
            },
          },
        }),
      },
    });

    const organization = await this.prismaService.organizations.findUnique({
      where: { id: created.id },
      include: {
        address: true,
        tags: true,
        organizationGallery: true,
        linkedAccountUser: linkedUserSelect,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found after create");
    }

    return this.toOrganizationResponseDto(
      organization as unknown as Record<string, unknown>,
    );
  }

  async deleteOrganization(
    ctx: RequestContext,
    id: string,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(ctx, `${this.deleteOrganization.name} was called`);

    const organization = await this.prismaService.organizations.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
        tags: true,
        organizationGallery: true,
        linkedAccountUser: linkedUserSelect,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    const dto = this.toOrganizationResponseDto(
      organization as unknown as Record<string, unknown>,
    );

    await this.prismaService.organizations.delete({
      where: {
        id: organization.id,
      },
    });

    return dto;
  }

  async updateOrganization(
    ctx: RequestContext,
    id: string,
    payload: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(ctx, `${this.addOrganization.name} was called`);
    const org = await this.prismaService.organizations.findUnique({
      where: {
        id,
      },
    });
    if (!org) {
      throw new NotFoundException("Organization not found!");
    }

    const {
      address,
      tagIds,
      gallery,
      socials,
      bannerImageUrl,
      bannerImageId,
      logoImageUrl,
      logoImageId,
      ...restPayload
    } = payload;

    await this.prismaService.organizations.update({
      where: {
        id: org.id,
      },
      data: {
        ...restPayload,
        address: {
          upsert: {},
        },
        ...(socials && {
          socials: {
            upsert: {
              create: {
                data: JSON.parse(JSON.stringify(socials)),
              },
              update: {
                data: JSON.parse(JSON.stringify(socials)),
              },
            },
          },
        }),
        ...(address && {
          address: {
            upsert: {
              create: address,
              update: address,
            },
          },
        }),
        ...(tagIds && {
          tags: {
            set: [],
            connect: tagIds?.map((tid) => ({
              id: tid,
              isOrganizationTag: true,
            })),
          },
        }),
        ...(gallery && {
          organizationGallery: {
            deleteMany: {},
            create: gallery,
          },
        }),
      },
    });

    const organization = await this.prismaService.organizations.findUnique({
      where: { id: org.id },
      include: {
        address: true,
        tags: true,
        organizationGallery: true,
        linkedAccountUser: linkedUserSelect,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return this.toOrganizationResponseDto(
      organization as unknown as Record<string, unknown>,
    );
  }

  async verifyOrganization(
    ctx: RequestContext,
    id: string,
    isVerified: boolean,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(ctx, `${this.verifyOrganization.name} was called`);

    const org = await this.prismaService.organizations.findUnique({
      where: { id },
    });
    if (!org) {
      throw new NotFoundException("Organization not found!");
    }

    let usersToNotifyOnVerify: {
      id: string;
      email: string;
      fullName: string;
    }[] = [];
    if (isVerified) {
      usersToNotifyOnVerify = await this.prismaService.user.findMany({
        where: {
          organizationId: id,
          deletedAt: null,
          isVerifiedByAdmin: false,
        },
        select: { id: true, email: true, fullName: true },
      });
    }

    await this.prismaService.user.updateMany({
      where: { organizationId: id, deletedAt: null },
      data: { isVerifiedByAdmin: isVerified },
    });

    for (const u of usersToNotifyOnVerify) {
      await this.notificationService.notifyOrganizationVerified(
        u.id,
        id,
        org.name,
      );
      const mailResult = await sendEmail(EmailType.ORGANIZATION_VERIFIED, {
        to: u.email,
        userName: u.fullName,
        organizationName: org.name,
      });
      if (!mailResult?.success) {
        this.logger.log(
          ctx,
          `${this.verifyOrganization.name}: verification email not sent for ${u.email}`,
        );
      }
    }

    const organization = await this.prismaService.organizations.findUnique({
      where: { id },
      include: {
        address: true,
        tags: true,
        organizationGallery: true,
        linkedAccountUser: linkedUserSelect,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return this.toOrganizationResponseDto(
      organization as unknown as Record<string, unknown>,
    );
  }
}
