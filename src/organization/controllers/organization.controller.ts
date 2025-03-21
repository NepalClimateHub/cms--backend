import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ROLE } from "../../auth/constants/role.constant";
import { Roles } from "../../auth/decorators/role.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../../shared/dtos/base-api-response.dto";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { AppLogger } from "../../shared/logger/logger.service";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { OrganizationService } from "../services/organization.service";
import { SingleOrganizationDto } from "../dto/organization-output.dto";
import { OrganizationSearchInput } from "../dto/organization-input.dto";

@ApiTags("organizations")
@Controller("organizations")
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(OrganizationController.name);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: "Get organizations API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([SingleOrganizationDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getOrgs(
    @ReqContext() ctx: RequestContext,
    @Query() query: OrganizationSearchInput
  ): Promise<BaseApiResponse<SingleOrganizationDto[]>> {
    this.logger.log(ctx, `${this.getOrgs.name} was called`);

    const { organizations, count } =
      await this.organizationService.getOrganizations(ctx, query);
    return { data: organizations, meta: { count } };
  }
}
