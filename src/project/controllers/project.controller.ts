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
import { ProjectService } from "../services/project.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectSearchInput,
  ProjectResponseDto,
} from "../dto/project.dto";
import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
  BaseApiErrorResponse,
} from "../../shared/dtos/base-api-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../../auth/guards/optional-jwt-auth.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { RolesGuard } from "../../auth/guards/roles.guard";

@ApiTags("Projects")
@Controller("projects")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Create a new project" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(ProjectResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async createProject(
    @Body() createProjectDto: CreateProjectDto
  ): Promise<BaseApiResponse<ProjectResponseDto>> {
    const project = await this.projectService.createProject(createProjectDto);
    return { data: project, meta: {} };
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get all projects with search and pagination" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([ProjectResponseDto]),
  })
  async findAllProjects(
    @Query() searchInput: ProjectSearchInput
  ): Promise<BaseApiResponse<ProjectResponseDto[]>> {
    const result = await this.projectService.findAllProjects(searchInput);
    return { data: result.projects, meta: { count: result.total } };
  }

  @Get(":id")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a project by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProjectResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findProjectById(
    @Param("id") id: string
  ): Promise<BaseApiResponse<ProjectResponseDto>> {
    const project = await this.projectService.findProjectById(id);
    return { data: project, meta: {} };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Update a project" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProjectResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateProject(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<BaseApiResponse<ProjectResponseDto>> {
    const project = await this.projectService.updateProject(id, updateProjectDto);
    return { data: project, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Delete a project" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProjectResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async deleteProject(@Param("id") id: string): Promise<BaseApiResponse<void>> {
    await this.projectService.deleteProject(id);
    return { data: undefined, meta: {} };
  }
}
