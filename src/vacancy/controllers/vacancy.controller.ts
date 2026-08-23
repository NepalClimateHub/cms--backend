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
import { VacancyService } from "../services/vacancy.service";
import {
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancySearchInput,
  VacancyResponseDto,
  CreateVacancyApplicationDto,
  VacancyApplicationResponseDto,
  UpdateApplicationStatusDto,
} from "../dto/vacancy.dto";
import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
  BaseApiErrorResponse,
} from "../../shared/dtos/base-api-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";

@ApiTags("Vacancies")
@Controller("vacancies")
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Create a new vacancy" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(VacancyResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async createVacancy(
    @ReqContext() ctx: RequestContext,
    @Body() createVacancyDto: CreateVacancyDto,
  ): Promise<BaseApiResponse<VacancyResponseDto>> {
    const vacancy = await this.vacancyService.createVacancy(
      createVacancyDto,
      ctx,
    );
    return { data: vacancy, meta: {} };
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get all vacancies with filters and pagination" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([VacancyResponseDto]),
  })
  async findAllVacancies(
    @Query() searchInput: VacancySearchInput,
  ): Promise<BaseApiResponse<VacancyResponseDto[]>> {
    const result = await this.vacancyService.findAllVacancies(searchInput);
    return { data: result.vacancies, meta: { count: result.total } };
  }

  @Get(":id")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a vacancy by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(VacancyResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findVacancyById(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<VacancyResponseDto>> {
    const vacancy = await this.vacancyService.findVacancyById(id);
    return { data: vacancy, meta: {} };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Update vacancy details" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(VacancyResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateVacancy(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ): Promise<BaseApiResponse<VacancyResponseDto>> {
    const vacancy = await this.vacancyService.updateVacancy(
      id,
      updateVacancyDto,
      ctx,
    );
    return { data: vacancy, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Delete a vacancy" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(VacancyResponseDto),
  })
  async deleteVacancy(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
  ): Promise<BaseApiResponse<void>> {
    await this.vacancyService.deleteVacancy(id, ctx);
    return { data: undefined, meta: {} };
  }

  @Post(":id/apply")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Submit candidate application for a vacancy" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(VacancyApplicationResponseDto),
  })
  async applyToVacancy(
    @Param("id") id: string,
    @Body() dto: CreateVacancyApplicationDto,
  ): Promise<BaseApiResponse<VacancyApplicationResponseDto>> {
    const application = await this.vacancyService.applyToVacancy(id, dto);
    return { data: application, meta: {} };
  }

  @Get(":id/applications")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get all candidate applications for a vacancy" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([VacancyApplicationResponseDto]),
  })
  async findVacancyApplications(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<VacancyApplicationResponseDto[]>> {
    const applications = await this.vacancyService.findVacancyApplications(id);
    return { data: applications, meta: {} };
  }

  @Patch("applications/:applicationId/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Update application status" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(VacancyApplicationResponseDto),
  })
  async updateApplicationStatus(
    @Param("applicationId") applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ): Promise<BaseApiResponse<VacancyApplicationResponseDto>> {
    const application = await this.vacancyService.updateApplicationStatus(
      applicationId,
      dto,
    );
    return { data: application, meta: {} };
  }

  @Delete("applications/:applicationId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Delete an application" })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async deleteApplication(
    @Param("applicationId") applicationId: string,
  ): Promise<BaseApiResponse<void>> {
    await this.vacancyService.deleteApplication(applicationId);
    return { data: undefined, meta: {} };
  }
}
