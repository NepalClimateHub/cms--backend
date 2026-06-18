import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { AiAssistantService } from "../services/ai-assistant.service";
import {
  AdminDocumentSearchDto,
  AdminDocumentUploadDto,
  InternalIndexJobUpdateDto,
  InternalImportDocumentDto,
} from "../dtos/admin-document.dto";
import { RagServiceTokenGuard } from "../guards/rag-service-token.guard";

@ApiTags("ai-assistant-admin")
@ApiBearerAuth()
@Controller("ai-assistant/admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN)
export class AiDocumentAdminController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post("documents")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 50 * 1024 * 1024 } }))
  upload(
    @ReqContext() ctx: RequestContext,
    @UploadedFile() file: any,
    @Body() dto: AdminDocumentUploadDto,
  ) {
    return this.aiAssistantService.uploadAdminDocument(ctx, file, dto.title);
  }

  @Get("documents")
  list(@Query() query: AdminDocumentSearchDto) {
    return this.aiAssistantService.listAdminDocuments(query);
  }

  @Get("summary")
  summary() {
    return this.aiAssistantService.getAdminDocumentSummary();
  }

  @Get("jobs/:jobId")
  getJob(@Param("jobId") jobId: string) {
    return this.aiAssistantService.getIndexJob(jobId);
  }

  @Get("documents/:documentId/file")
  async viewFile(
    @Param("documentId") documentId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.aiAssistantService.proxyDocumentFile(
      documentId,
      request.headers.range,
      response,
    );
  }

  @Post("documents/:documentId/reindex")
  @HttpCode(HttpStatus.ACCEPTED)
  reindex(@Param("documentId") documentId: string) {
    return this.aiAssistantService.queueDocumentOperation(documentId, "REINDEX");
  }

  @Post("documents/:documentId/retry")
  @HttpCode(HttpStatus.ACCEPTED)
  retry(@Param("documentId") documentId: string) {
    return this.aiAssistantService.retryDocumentOperation(documentId);
  }

  @Delete("documents/:documentId")
  @HttpCode(HttpStatus.ACCEPTED)
  remove(@Param("documentId") documentId: string) {
    return this.aiAssistantService.queueDocumentOperation(documentId, "DELETE");
  }

  @Post("index/rebuild")
  @HttpCode(HttpStatus.ACCEPTED)
  rebuild() {
    return this.aiAssistantService.queueFullRebuild();
  }
}

@ApiTags("ai-assistant-internal")
@Controller("ai-assistant/internal")
@UseGuards(RagServiceTokenGuard)
export class AiDocumentInternalController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Patch("jobs/:jobId")
  updateJob(
    @Param("jobId") jobId: string,
    @Body() dto: InternalIndexJobUpdateDto,
  ) {
    return this.aiAssistantService.updateIndexJobFromRag(jobId, dto);
  }

  @Post("documents/import")
  importDocument(@Body() dto: InternalImportDocumentDto) {
    return this.aiAssistantService.registerImportedDocument(dto);
  }
}
