import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
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
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  OrganizationSearchInput,
} from "../dto/organization.dto";

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
    type: SwaggerBaseApiResponse([OrganizationResponseDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getOrgs(
    @ReqContext() ctx: RequestContext,
    @Query() query: OrganizationSearchInput
  ): Promise<BaseApiResponse<OrganizationResponseDto[]>> {
    this.logger.log(ctx, `${this.getOrgs.name} was called`);

    const { organizations, count } =
      await this.organizationService.getOrganizations(ctx, query);
    return { data: organizations, meta: { count } };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("/:id")
  @ApiOperation({
    summary: "Get one organizations API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OrganizationResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getOneOrganization(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<OrganizationResponseDto>> {
    this.logger.log(ctx, `${this.getOrgs.name} was called`);

    const organization = await this.organizationService.getOneOrganization(
      ctx,
      id
    );
    return { data: organization, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: "Add organizations API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OrganizationResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async addOrg(
    @ReqContext() ctx: RequestContext,
    @Body() payload: CreateOrganizationDto
  ): Promise<BaseApiResponse<OrganizationResponseDto>> {
    this.logger.log(ctx, `${this.addOrg.name} was called`);

    const organization = await this.organizationService.addOrganization(
      ctx,
      payload
    );
    return { data: organization, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("/:id")
  @ApiOperation({
    summary: "Delete one organizations API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OrganizationResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async deleteOrganization(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<OrganizationResponseDto>> {
    this.logger.log(ctx, `${this.getOrgs.name} was called`);

    const organization = await this.organizationService.deleteOrganization(
      ctx,
      id
    );
    return { data: organization, meta: {} };
  }
}
