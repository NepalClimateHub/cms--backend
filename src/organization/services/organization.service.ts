import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { SingleOrganizationDto } from "../dto/organization-output.dto";
import { OrganizationSearchInput } from "../dto/organization-input.dto";
import { applyFilters } from "../../shared/filters/prisma-filter.filter";
import { Prisma } from "@prisma/client";
import { createSearchKey } from "../../shared/utils/createSearchKey";

@Injectable()
export class OrganizationService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(OrganizationService.name);
  }

  async getOrganizations(
    ctx: RequestContext,
    query: OrganizationSearchInput
  ): Promise<{ organizations: SingleOrganizationDto[]; count: number }> {
    this.logger.log(ctx, `${this.getOrganizations.name} was called`);

    const { whereBuilder: orgWhereQuery } =
      await applyFilters<Prisma.OrganizationsWhereInput>({
        appliedFiltersInput: query,
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
        },
      });

    const organizations = await this.prismaService.organizations.findMany({
      where: {
        AND: [orgWhereQuery],
      },
    });
    const organizationCount = await this.prismaService.organizations.count({
      where: {
        AND: [orgWhereQuery],
      },
    });

    return {
      organizations: plainToInstance(SingleOrganizationDto, organizations, {
        excludeExtraneousValues: true,
      }),
      count: organizationCount,
    };
  }
}
