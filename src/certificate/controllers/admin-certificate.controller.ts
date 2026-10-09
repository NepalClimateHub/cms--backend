import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
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
} from "../../shared/dtos/base-api-response.dto";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import {
  AdminCertificateResponseDto,
  CertificateLogDto,
  CertificateSearchInput,
  CreateCertificateDto,
  RevokeCertificateDto,
} from "../dto/certificate.dto";
import { CertificateService } from "../services/certificate.service";

@ApiTags("Admin Certificates")
@Controller("admin/certificates")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
@ApiBearerAuth()
export class AdminCertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ApiOperation({ summary: "Issue a new certificate" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Certificate created successfully",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async generateCertificate(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateCertificateDto,
  ): Promise<BaseApiResponse<AdminCertificateResponseDto>> {
    const cert = await this.certificateService.generateCertificate(dto, ctx);
    return { data: cert, meta: {} };
  }

  @Get()
  @ApiOperation({
    summary: "Get all certificates with search, filtering, and pagination",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Certificates retrieved successfully",
  })
  async findAllCertificates(
    @Query() searchInput: CertificateSearchInput,
  ): Promise<BaseApiResponse<AdminCertificateResponseDto[]>> {
    const result =
      await this.certificateService.findAllCertificates(searchInput);
    return { data: result.certificates, meta: { count: result.total } };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get certificate by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Certificate retrieved successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findCertificateById(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<AdminCertificateResponseDto>> {
    const cert = await this.certificateService.findCertificateById(id);
    return { data: cert, meta: {} };
  }

  @Post(":id/regenerate-code")
  @ApiOperation({
    summary:
      "Regenerate a certificate verification code (invalidates old code immediately)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Code regenerated successfully",
  })
  async regenerateCode(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
  ): Promise<
    BaseApiResponse<{
      certificateId: string;
      certificateNumber: string;
      verificationCode: string;
    }>
  > {
    const result = await this.certificateService.regenerateCode(id, ctx);
    return { data: result, meta: {} };
  }

  @Post(":id/revoke")
  @ApiOperation({ summary: "Revoke a certificate" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Certificate revoked successfully",
  })
  async revokeCertificate(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() dto: RevokeCertificateDto,
  ): Promise<BaseApiResponse<AdminCertificateResponseDto>> {
    const cert = await this.certificateService.revokeCertificate(
      id,
      dto.reason,
      ctx,
    );
    return { data: cert, meta: {} };
  }

  @Get(":id/logs")
  @ApiOperation({ summary: "Get verification audit logs for a certificate" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Logs retrieved successfully",
  })
  async getCertificateLogs(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<CertificateLogDto[]>> {
    const logs = await this.certificateService.getCertificateLogs(id);
    return { data: logs, meta: {} };
  }
}
