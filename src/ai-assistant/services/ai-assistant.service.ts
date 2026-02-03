import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(AiAssistantService.name);
  }

  /**
   * Get user ID from context with null check
   */
  private getUserId(ctx: RequestContext): string {
    if (!ctx.user?.id) {
      throw new UnauthorizedException("User not authenticated");
    }
    return ctx.user.id;
  }

  /**
   * Create a new chat session for the current user
   */
  async createChatSession(ctx: RequestContext, title: string = "New Chat") {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Creating chat session for user ${userId}`);

    return this.prismaService.nchChatSession.create({
      data: {
        userId,
        title,
      },
    });
  }

  /**
   * Get all chat sessions for the current user
   */
  async getUserChatSessions(ctx: RequestContext) {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Fetching chat sessions for user ${userId}`);

    return this.prismaService.nchChatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  /**
   * Get all messages for a specific chat session
   */
  async getSessionMessages(ctx: RequestContext, sessionId: string) {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Fetching messages for session ${sessionId}`);

    // Verify session exists and belongs to user
    const session = await this.prismaService.nchChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException("Not authorized to access this session");
    }

    return this.prismaService.nchChatMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Add a message to a chat session
   */
  async addMessage(
    ctx: RequestContext,
    sessionId: string,
    role: string,
    content: string
  ) {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Adding ${role} message to session ${sessionId}`);

    // Verify session exists and belongs to user
    const session = await this.prismaService.nchChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException("Not authorized to access this session");
    }

    // Create message
    const message = await this.prismaService.nchChatMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });

    // Update session's updatedAt timestamp
    await this.prismaService.nchChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Update a chat session's title
   */
  async updateSessionTitle(
    ctx: RequestContext,
    sessionId: string,
    title: string
  ) {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Updating session ${sessionId} title to "${title}"`);

    // Verify session exists and belongs to user
    const session = await this.prismaService.nchChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException("Not authorized to update this session");
    }

    return this.prismaService.nchChatSession.update({
      where: { id: sessionId },
      data: { title },
    });
  }

  /**
   * Delete a chat session and all its messages
   */
  async deleteSession(ctx: RequestContext, sessionId: string) {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Deleting session ${sessionId}`);

    // Verify session exists and belongs to user
    const session = await this.prismaService.nchChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException("Not authorized to delete this session");
    }

    // Delete session (messages cascade delete due to Prisma relation)
    await this.prismaService.nchChatSession.delete({
      where: { id: sessionId },
    });

    return { success: true, message: "Session deleted successfully" };
  }

  // ============== Document Management ==============

  /**
   * Create a document in the corpus
   */
  async createDocument(
    ctx: RequestContext,
    title: string,
    sourceUrl?: string,
    totalPages?: number,
    mediaType?: string
  ) {
    this.logger.log(ctx, `Creating document: ${title}`);

    return this.prismaService.nchDocument.create({
      data: {
        title,
        sourceUrl,
        totalPages,
        mediaType: mediaType || "text/plain",
      },
    });
  }

  /**
   * Get document by source URL
   */
  async getDocumentBySource(ctx: RequestContext, sourceUrl: string) {
    return this.prismaService.nchDocument.findFirst({
      where: { sourceUrl },
    });
  }

  /**
   * Delete all documents and chunks
   */
  async deleteAllDocuments(ctx: RequestContext) {
    this.logger.log(ctx, "Deleting all documents and chunks");

    // Delete chunks first (foreign key constraint)
    await this.prismaService.nchChunk.deleteMany({});
    await this.prismaService.nchDocument.deleteMany({});

    return { success: true, message: "All documents deleted" };
  }

  // ============== Chunk Management ==============

  /**
   * Create a chunk with embeddings
   */
  async createChunk(
    ctx: RequestContext,
    documentId: string,
    chunkIndex: number,
    text: string,
    vector: number[],
    pageStart?: number,
    pageEnd?: number,
    meta?: Record<string, any>,
    collection?: string,
    embedModel?: string
  ) {
    this.logger.log(ctx, `Creating chunk ${chunkIndex} for document ${documentId}`);

    return this.prismaService.nchChunk.create({
      data: {
        documentId,
        chunkIndex,
        text,
        vector,
        pageStart,
        pageEnd,
        meta: meta || {},
        collection: collection || "nch_assistant_index",
        embedModel: embedModel || "intfloat/multilingual-e5-base",
      },
    });
  }

  /**
   * Get chunks by IDs
   */
  async getChunksByIds(ctx: RequestContext, chunkIds: string[]) {
    this.logger.log(ctx, `Fetching ${chunkIds.length} chunks`);

    const chunks = await this.prismaService.nchChunk.findMany({
      where: {
        id: { in: chunkIds },
      },
      include: {
        document: true,
      },
    });

    return chunks.map((chunk) => ({
      id: chunk.id,
      documentId: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      vector: chunk.vector,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      meta: chunk.meta,
      collection: chunk.collection,
      embedModel: chunk.embedModel,
      document: {
        title: chunk.document.title,
        sourceUrl: chunk.document.sourceUrl,
        mediaType: chunk.document.mediaType,
      },
    }));
  }
}

