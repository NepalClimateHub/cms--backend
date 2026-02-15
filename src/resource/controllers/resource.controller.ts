
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
} from "@nestjs/common";
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
    @Body() createResourceDto: CreateResourceDto
  ): Promise<BaseApiResponse<ResourceResponseDto>> {
    const resource = await this.resourceService.createResource(createResourceDto);
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
    @Query() searchInput: ResourceSearchInput
  ): Promise<BaseApiResponse<ResourceResponseDto[]>> {
    const result = await this.resourceService.findAllResources(searchInput);
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
    @Param("id") id: string,
    @Body() updateResourceDto: UpdateResourceDto
  ): Promise<BaseApiResponse<ResourceResponseDto>> {
    const resource = await this.resourceService.updateResource(id, updateResourceDto);
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
  async deleteResource(@Param("id") id: string): Promise<BaseApiResponse<void>> {
    await this.resourceService.deleteResource(id);
    return { data: undefined, meta: {} };
  }
}
