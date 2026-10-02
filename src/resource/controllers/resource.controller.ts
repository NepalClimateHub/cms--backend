
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ResourceService } from "../services/resource.service";
import {
  CreateResourceDto,
  UpdateResourceDto,
  ResourceSearchInput,
  ResourceResponseDto,
  ResourceSummaryDto,
} from "../dto/resource.dto";
import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
  BaseApiErrorResponse,
} from "../../shared/dtos/base-api-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { ContentModerationDto } from "../../shared/dtos/moderation.dto";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";

@ApiTags("Resources")
@Controller("resources")
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Create a new resource" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(ResourceResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async createResource(
    @ReqContext() ctx: RequestContext,
    @Body() createResourceDto: CreateResourceDto
  ): Promise<BaseApiResponse<ResourceResponseDto>> {
    const resource = await this.resourceService.createResource(createResourceDto, ctx);
    return { data: resource, meta: {} };
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get all resources with search and pagination" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([ResourceResponseDto]),
  })
  async findAllResources(
    @Query() searchInput: ResourceSearchInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseApiResponse<(ResourceResponseDto | ResourceSummaryDto)[]> > {
    const isAnonymousSummary =
      searchInput.view === "summary" &&
      !request.headers.authorization &&
      !request.headers.cookie;

    response.setHeader(
      "Cache-Control",
      isAnonymousSummary
        ? "public, max-age=60, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400"
        : "private, no-store",
    );
    response.setHeader("Vary", "Accept-Encoding");

    const result = await this.resourceService.findAllResources(
      searchInput,
      isAnonymousSummary,
    );
    return { data: result.resources, meta: { count: result.total } };
  }

  @Get(":id")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a resource by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ResourceResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findResourceById(
    @Param("id") id: string
  ): Promise<BaseApiResponse<ResourceResponseDto>> {
    const resource = await this.resourceService.findResourceById(id);
    return { data: resource, meta: {} };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Update a resource" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ResourceResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateResource(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() updateResourceDto: UpdateResourceDto
  ): Promise<BaseApiResponse<ResourceResponseDto>> {
    const resource = await this.resourceService.updateResource(id, updateResourceDto, ctx);
    return { data: resource, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Delete a resource" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ResourceResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async deleteResource(@ReqContext() ctx: RequestContext, @Param("id") id: string): Promise<BaseApiResponse<void>> {
    await this.resourceService.deleteResource(id, ctx);
    return { data: undefined, meta: {} };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.CONTENT_ADMIN, ROLE.SUPER_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch("/:id/moderate")
  @ApiOperation({ summary: "Moderate a resource" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ResourceResponseDto),
  })
  async moderateResource(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() payload: ContentModerationDto
  ): Promise<BaseApiResponse<ResourceResponseDto>> {
    const resource = await this.resourceService.moderateResource(
      ctx,
      id,
      payload
    );
    return { data: resource, meta: {} };
  }
}
