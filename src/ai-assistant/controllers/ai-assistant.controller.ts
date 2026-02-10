import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AppLogger } from "../../shared/logger/logger.service";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../../shared/dtos/base-api-response.dto";
import { AiAssistantService } from "../services/ai-assistant.service";
import {
  CreateChatSessionDto,
  AddMessageDto,
  UpdateSessionTitleDto,
  CreateDocumentDto,
  CreateChunkDto,
  GetChunksDto,
  ChatRequestDto,
} from "../dtos";

@ApiTags("ai-assistant")
@Controller("ai-assistant")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiAssistantController {
  constructor(
    private readonly logger: AppLogger,
    private readonly aiAssistantService: AiAssistantService
  ) {
    this.logger.setContext(AiAssistantController.name);
  }

  @Post("sessions")
  @ApiOperation({ summary: "Create a new chat session" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Chat session created successfully",
  })
  async createSession(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateChatSessionDto
  ): Promise<BaseApiResponse<any>> {
    const session = await this.aiAssistantService.createChatSession(
      ctx,
      dto.title
    );
    return { data: session, meta: {} };
  }

  @Get("sessions")
  @ApiOperation({ summary: "Get all chat sessions for the current user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns list of user chat sessions",
  })
  async getSessions(
    @ReqContext() ctx: RequestContext
  ): Promise<BaseApiResponse<any>> {
    const sessions = await this.aiAssistantService.getUserChatSessions(ctx);
    return { data: sessions, meta: {} };
  }

  @Get("sessions/:sessionId/messages")
  @ApiOperation({ summary: "Get all messages for a chat session" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns list of messages in the session",
  })
  async getMessages(
    @ReqContext() ctx: RequestContext,
    @Param("sessionId") sessionId: string
  ): Promise<BaseApiResponse<any>> {
    const messages = await this.aiAssistantService.getSessionMessages(
      ctx,
      sessionId
    );
    return { data: messages, meta: {} };
  }

  @Post("sessions/:sessionId/messages")
  @ApiOperation({ summary: "Add a message to a chat session" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Message added successfully",
  })
  async addMessage(
    @ReqContext() ctx: RequestContext,
    @Param("sessionId") sessionId: string,
    @Body() dto: AddMessageDto
  ): Promise<BaseApiResponse<any>> {
    const message = await this.aiAssistantService.addMessage(
      ctx,
      sessionId,
      dto.role,
      dto.content
    );
    return { data: message, meta: {} };
  }

  @Patch("sessions/:sessionId")
  @ApiOperation({ summary: "Update chat session title" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Session title updated successfully",
  })
  async updateSession(
    @ReqContext() ctx: RequestContext,
    @Param("sessionId") sessionId: string,
    @Body() dto: UpdateSessionTitleDto
  ): Promise<BaseApiResponse<any>> {
    const session = await this.aiAssistantService.updateSessionTitle(
      ctx,
      sessionId,
      dto.title
    );
    return { data: session, meta: {} };
  }

  @Delete("sessions/:sessionId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a chat session" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Session deleted successfully",
  })
  async deleteSession(
    @ReqContext() ctx: RequestContext,
    @Param("sessionId") sessionId: string
  ): Promise<BaseApiResponse<any>> {
    const result = await this.aiAssistantService.deleteSession(ctx, sessionId);
    return { data: result, meta: {} };
  }

  // ============== Document/Chunk Endpoints ==============

  @Post("documents")
  @ApiOperation({ summary: "Create a document in corpus" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Document created successfully",
  })
  async createDocument(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateDocumentDto
  ): Promise<BaseApiResponse<any>> {
    const document = await this.aiAssistantService.createDocument(
      ctx,
      dto.title,
      dto.sourceUrl,
      dto.totalPages,
      dto.mediaType
    );
    return { data: document, meta: {} };
  }

  @Get("documents/by-source/:sourceUrl")
  @ApiOperation({ summary: "Get document by source URL" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns document if found",
  })
  async getDocumentBySource(
    @ReqContext() ctx: RequestContext,
    @Param("sourceUrl") sourceUrl: string
  ): Promise<BaseApiResponse<any>> {
    const document = await this.aiAssistantService.getDocumentBySource(
      ctx,
      decodeURIComponent(sourceUrl)
    );
    return { data: document, meta: {} };
  }

  @Delete("documents")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete all documents and chunks" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "All documents deleted successfully",
  })
  async deleteAllDocuments(
    @ReqContext() ctx: RequestContext
  ): Promise<BaseApiResponse<any>> {
    const result = await this.aiAssistantService.deleteAllDocuments(ctx);
    return { data: result, meta: {} };
  }

  @Post("chunks")
  @ApiOperation({ summary: "Create a chunk with embeddings" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Chunk created successfully",
  })
  async createChunk(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateChunkDto
  ): Promise<BaseApiResponse<any>> {
    const chunk = await this.aiAssistantService.createChunk(
      ctx,
      dto.documentId,
      dto.chunkIndex,
      dto.text,
      dto.vector,
      dto.pageStart,
      dto.pageEnd,
      dto.meta,
      dto.collection,
      dto.embedModel
    );
    return { data: chunk, meta: {} };
  }

  @Post("chunks/batch")
  @ApiOperation({ summary: "Get chunks by IDs" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns chunks with document metadata",
  })
  async getChunksByIds(
    @ReqContext() ctx: RequestContext,
    @Body() dto: GetChunksDto
  ): Promise<BaseApiResponse<any>> {
    const chunks = await this.aiAssistantService.getChunksByIds(
      ctx,
      dto.chunkIds
    );
    return { data: chunks, meta: {} };
  }

  // ============== Chat Proxy (API Gateway) ==============

  @Post("chat")
  @ApiOperation({ summary: "Chat with AI Assistant (proxies to RAG service)" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Returns AI response with sources and session ID",
  })
  async chat(
    @ReqContext() ctx: RequestContext,
    @Body() dto: ChatRequestDto
  ): Promise<BaseApiResponse<any>> {
    const result = await this.aiAssistantService.chat(
      ctx,
      dto.query,
      dto.conversation_id,
      dto.conversation_history,
      dto.top_k
    );
    return { data: result, meta: {} };
  }
}
