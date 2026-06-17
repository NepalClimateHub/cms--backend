import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import { Response } from "express";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import {
  AiDocumentStatus,
  AiIndexJobStatus,
  AiIndexOperation,
  Prisma,
  UserType,
} from "@prisma/client";
import {
  AdminDocumentSearchDto,
  InternalIndexJobUpdateDto,
  InternalImportDocumentDto,
} from "../dtos/admin-document.dto";

const DAILY_PROMPT_LIMIT = 3;

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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

  private get ragServiceUrl(): string {
    return this.configService.get<string>("rag.serviceUrl") || "http://localhost:8000";
  }

  private get ragHeaders(): Record<string, string> {
    const token = this.configService.get<string>("rag.serviceToken");
    if (!token) {
      throw new Error("RAG_SERVICE_TOKEN is not configured");
    }
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Get how many prompts the user has used today (UTC midnight reset)
   */
  async getDailyUsage(ctx: RequestContext) {
    const userId = this.getUserId(ctx);
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const count = await this.prismaService.chat_messages.count({
      where: {
        role: 'user',
        created_at: { gte: todayStart },
        chat_sessions: { user_id: userId },
      },
    });

    return {
      used: count,
      limit: DAILY_PROMPT_LIMIT,
      remaining: Math.max(0, DAILY_PROMPT_LIMIT - count),
    };
  }

  /**
   * Create a new chat session for the current user
   */
  async createChatSession(ctx: RequestContext, title: string = "New Chat") {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Creating chat session for user ${userId}`);

    return this.prismaService.chat_sessions.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        title,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get all chat sessions for the current user
   */
  async getUserChatSessions(ctx: RequestContext) {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Fetching chat sessions for user ${userId}`);

    return this.prismaService.chat_sessions.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        updated_at: "desc",
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
    const session = await this.prismaService.chat_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException("Not authorized to access this session");
    }

    return this.prismaService.chat_messages.findMany({
      where: {
        session_id: sessionId,
      },
      orderBy: {
        created_at: "asc",
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
    const session = await this.prismaService.chat_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException("Not authorized to access this session");
    }

    // Create message
    const message = await this.prismaService.chat_messages.create({
      data: {
        id: uuidv4(),
        session_id: sessionId,
        role,
        content,
      },
    });

    // Update session's updatedAt timestamp
    await this.prismaService.chat_sessions.update({
      where: { id: sessionId },
      data: { updated_at: new Date() },
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
    const session = await this.prismaService.chat_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException("Not authorized to update this session");
    }

    return this.prismaService.chat_sessions.update({
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
    const session = await this.prismaService.chat_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException("Not authorized to delete this session");
    }

    // Delete session (messages cascade delete due to Prisma relation)
    await this.prismaService.chat_sessions.delete({
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

    return this.prismaService.documents.create({
      data: {
        id: uuidv4(),
        title,
        source_url: sourceUrl,
        total_pages: totalPages,
        media_type: mediaType || "text/plain",
      },
    });
  }

  /**
   * Get document by source URL
   */
  async getDocumentBySource(ctx: RequestContext, sourceUrl: string) {
    return this.prismaService.documents.findFirst({
      where: { source_url: sourceUrl },
    });
  }

  /**
   * Delete all documents and chunks
   */
  async deleteAllDocuments(ctx: RequestContext) {
    this.logger.log(ctx, "Deleting all documents and chunks");

    // Delete chunks first (foreign key constraint)
    await this.prismaService.chunks.deleteMany({});
    await this.prismaService.documents.deleteMany({});

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

    return this.prismaService.chunks.create({
      data: {
        id: uuidv4(),
        document_id: documentId,
        chunk_index: chunkIndex,
        text,
        vector: vector as any,
        page_start: pageStart,
        page_end: pageEnd,
        meta: meta || {},
        collection: collection || "nch_assistant_index",
        embed_model: embedModel || "intfloat/multilingual-e5-base",
      },
    });
  }

  /**
   * Get chunks by IDs
   */
  async getChunksByIds(ctx: RequestContext, chunkIds: string[]) {
    this.logger.log(ctx, `Fetching ${chunkIds.length} chunks`);

    const chunks = await this.prismaService.chunks.findMany({
      where: {
        id: { in: chunkIds },
      },
      include: {
        documents: true,
      },
    });

    return chunks.map((chunk) => ({
      id: chunk.id,
      documentId: chunk.document_id,
      chunkIndex: chunk.chunk_index,
      text: chunk.text,
      vector: Array.isArray(chunk.vector) ? chunk.vector : [],
      pageStart: chunk.page_start,
      pageEnd: chunk.page_end,
      meta: chunk.meta,
      collection: chunk.collection,
      embedModel: chunk.embed_model,
      document: chunk.documents ? {
        title: chunk.documents.title,
        sourceUrl: chunk.documents.source_url,
        mediaType: chunk.documents.media_type,
      } : undefined,
    }));
  }

  // ============== AI Document Administration ==============

  async uploadAdminDocument(ctx: RequestContext, file: any, requestedTitle?: string) {
    if (!file?.buffer || !file.originalname) {
      throw new BadRequestException("A PDF file is required");
    }
    if (
      file.originalname !== file.originalname.replace(/[\\/]/g, "") ||
      /[\u0000-\u001f\u007f]/.test(file.originalname)
    ) {
      throw new BadRequestException("The PDF filename contains unsafe characters");
    }
    const hasPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");
    const hasPdfSignature = file.buffer.subarray(0, 5).toString() === "%PDF-";
    if (!hasPdfExtension || !hasPdfSignature) {
      throw new BadRequestException("Only valid PDF files are accepted");
    }

    await this.recoverStaleIndexJobs();
    const activeRebuild = await this.prismaService.ai_index_jobs.findFirst({
      where: {
        operation: AiIndexOperation.FULL_REBUILD,
        status: { in: [AiIndexJobStatus.QUEUED, AiIndexJobStatus.RUNNING] },
      },
    });
    if (activeRebuild) {
      throw new ConflictException(`A full rebuild is active as job ${activeRebuild.id}`);
    }

    const checksum = createHash("sha256").update(file.buffer).digest("hex");
    const duplicate = await this.prismaService.documents.findFirst({
      where: { checksum, deleted_at: null, status: { not: AiDocumentStatus.DELETED } },
    });
    if (duplicate) {
      throw new ConflictException(`This PDF already exists as document ${duplicate.id}`);
    }

    const documentId = uuidv4();
    const jobId = uuidv4();
    const title = (requestedTitle || file.originalname.replace(/\.pdf$/i, "")).trim();

    const result = await this.prismaService.$transaction(async (tx) => {
      const document = await tx.documents.create({
        data: {
          id: documentId,
          title,
          original_filename: file.originalname,
          storage_name: `${documentId}.pdf`,
          checksum,
          file_size: file.size ?? file.buffer.length,
          media_type: "application/pdf",
          status: AiDocumentStatus.QUEUED,
          uploaded_by: this.getUserId(ctx),
        },
      });
      const job = await tx.ai_index_jobs.create({
        data: {
          id: jobId,
          document_id: documentId,
          operation: AiIndexOperation.ADD,
        },
      });
      return { document, job };
    });

    try {
      const form = new FormData();
      form.append(
        "file",
        new Blob([file.buffer as any], { type: "application/pdf" }),
        file.originalname,
      );
      form.append("document_id", documentId);
      form.append("job_id", jobId);
      form.append("title", title);
      form.append("version", "1");

      await firstValueFrom(
        this.httpService.post(`${this.ragServiceUrl}/admin/documents`, form, {
          headers: this.ragHeaders,
          timeout: 120000,
          maxBodyLength: 55 * 1024 * 1024,
        }),
      );
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || "RAG upload failed";
      await this.markDispatchFailure(jobId, documentId, message);
      throw new HttpException(`Failed to queue PDF processing: ${message}`, HttpStatus.BAD_GATEWAY);
    }

    return result;
  }

  async listAdminDocuments(query: AdminDocumentSearchDto) {
    await this.recoverStaleIndexJobs();
    const where: Prisma.documentsWhereInput = {
      deleted_at: null,
      status: { not: AiDocumentStatus.DELETED },
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { original_filename: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [documents, total] = await this.prismaService.$transaction([
      this.prismaService.documents.findMany({
        where,
        include: { index_jobs: { orderBy: { created_at: "desc" }, take: 1 } },
        orderBy: { created_at: "desc" },
        skip,
        take: query.limit,
      }),
      this.prismaService.documents.count({ where }),
    ]);
    return { documents, total, page: query.page, limit: query.limit };
  }

  async getAdminDocumentSummary() {
    const [documents, chunks, latestJob] = await Promise.all([
      this.prismaService.documents.groupBy({
        by: ["status"],
        where: { deleted_at: null },
        _count: true,
      }),
      this.prismaService.chunks.count(),
      this.prismaService.ai_index_jobs.findFirst({
        where: { status: AiIndexJobStatus.SUCCEEDED },
        orderBy: { completed_at: "desc" },
      }),
    ]);
    return { documents, totalChunks: chunks, lastSuccessfulJob: latestJob };
  }

  async getIndexJob(jobId: string) {
    const job = await this.prismaService.ai_index_jobs.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Index job ${jobId} not found`);
    return job;
  }

  async queueDocumentOperation(
    documentId: string,
    operation: AiIndexOperation,
    attempt = 1,
  ) {
    await this.recoverStaleIndexJobs();
    const document = await this.prismaService.documents.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundException(`Document ${documentId} not found`);
    if (document.status === AiDocumentStatus.DELETED || document.deleted_at) {
      if (operation === AiIndexOperation.DELETE) {
        return { documentId, alreadyDeleted: true };
      }
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    const active = await this.prismaService.ai_index_jobs.findFirst({
      where: {
        document_id: documentId,
        status: { in: [AiIndexJobStatus.QUEUED, AiIndexJobStatus.RUNNING] },
      },
      orderBy: { created_at: "desc" },
    });
    if (active) {
      if (operation === AiIndexOperation.DELETE && active.operation === AiIndexOperation.DELETE) {
        return { documentId, job: active };
      }
      throw new ConflictException(`Document already has active job ${active.id}`);
    }
    const activeRebuild = await this.prismaService.ai_index_jobs.findFirst({
      where: {
        operation: AiIndexOperation.FULL_REBUILD,
        status: { in: [AiIndexJobStatus.QUEUED, AiIndexJobStatus.RUNNING] },
      },
    });
    if (activeRebuild) {
      throw new ConflictException(`A full rebuild is active as job ${activeRebuild.id}`);
    }

    const nextVersion = operation === AiIndexOperation.REINDEX
      ? document.active_version + 1
      : document.active_version;
    const job = await this.prismaService.ai_index_jobs.create({
      data: { id: uuidv4(), document_id: documentId, operation, attempt },
    });

    await this.prismaService.documents.update({
      where: { id: documentId },
      data: {
        status: operation === AiIndexOperation.DELETE
          ? AiDocumentStatus.DELETE_QUEUED
          : AiDocumentStatus.QUEUED,
        index_error: null,
      },
    });

    try {
      const endpoint = `${this.ragServiceUrl}/admin/documents/${documentId}`;
      if (operation === AiIndexOperation.DELETE) {
        await firstValueFrom(this.httpService.delete(endpoint, {
          headers: this.ragHeaders,
          data: { job_id: job.id },
        }));
      } else {
        await firstValueFrom(this.httpService.post(`${endpoint}/reindex`, {
          job_id: job.id,
          title: document.title,
          version: nextVersion,
        }, { headers: this.ragHeaders }));
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || "RAG dispatch failed";
      await this.markDispatchFailure(job.id, documentId, message);
      throw new HttpException(`Failed to queue operation: ${message}`, HttpStatus.BAD_GATEWAY);
    }
    return { documentId, job };
  }

  async retryDocumentOperation(documentId: string) {
    const document = await this.prismaService.documents.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundException(`Document ${documentId} not found`);
    if (
      document.status !== AiDocumentStatus.FAILED &&
      document.status !== AiDocumentStatus.DELETE_CLEANUP_FAILED
    ) {
      throw new ConflictException("Only failed document operations can be retried");
    }
    const operation = document.status === AiDocumentStatus.DELETE_CLEANUP_FAILED
      ? AiIndexOperation.DELETE
      : document.chunk_count > 0
        ? AiIndexOperation.REINDEX
        : AiIndexOperation.ADD;
    const previous = await this.prismaService.ai_index_jobs.findFirst({
      where: { document_id: documentId },
      orderBy: { created_at: "desc" },
    });
    const nextAttempt = (previous?.attempt || 0) + 1;
    if (nextAttempt > 3) {
      throw new ConflictException("Maximum retry attempts reached");
    }
    return this.queueDocumentOperation(documentId, operation, nextAttempt);
  }

  async queueFullRebuild() {
    await this.recoverStaleIndexJobs();
    const active = await this.prismaService.ai_index_jobs.findFirst({
      where: {
        status: { in: [AiIndexJobStatus.QUEUED, AiIndexJobStatus.RUNNING] },
      },
    });
    if (active) throw new ConflictException(`An index mutation is active as job ${active.id}`);

    const job = await this.prismaService.ai_index_jobs.create({
      data: { id: uuidv4(), operation: AiIndexOperation.FULL_REBUILD },
    });
    const documents = await this.prismaService.documents.findMany({
      where: { status: AiDocumentStatus.READY, deleted_at: null },
      select: { id: true, title: true, active_version: true },
    });
    try {
      await firstValueFrom(this.httpService.post(`${this.ragServiceUrl}/admin/index/rebuild`, {
        job_id: job.id,
        documents,
      }, { headers: this.ragHeaders }));
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || "RAG rebuild dispatch failed";
      await this.prismaService.ai_index_jobs.update({
        where: { id: job.id },
        data: { status: AiIndexJobStatus.FAILED, stage: "dispatch", error: message, completed_at: new Date() },
      });
      throw new HttpException(`Failed to queue rebuild: ${message}`, HttpStatus.BAD_GATEWAY);
    }
    return { job };
  }

  async proxyDocumentFile(documentId: string, range: string | undefined, response: Response) {
    const document = await this.prismaService.documents.findFirst({
      where: { id: documentId, deleted_at: null, status: { not: AiDocumentStatus.DELETED } },
    });
    if (!document) throw new NotFoundException(`Document ${documentId} not found`);

    const upstream = await firstValueFrom(this.httpService.get(
      `${this.ragServiceUrl}/admin/documents/${documentId}/file`,
      {
        headers: { ...this.ragHeaders, ...(range ? { Range: range } : {}) },
        responseType: "stream",
        validateStatus: (status) => status === 200 || status === 206,
      },
    ));
    response.status(upstream.status);
    for (const header of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers[header];
      if (value) response.setHeader(header, value);
    }
    response.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(document.original_filename || `${document.id}.pdf`)}`,
    );
    upstream.data.pipe(response);
  }

  async updateIndexJobFromRag(jobId: string, dto: InternalIndexJobUpdateDto) {
    const job = await this.prismaService.ai_index_jobs.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Index job ${jobId} not found`);

    if (dto.status === AiIndexJobStatus.RUNNING) {
      await this.prismaService.$transaction(async (tx) => {
        await tx.ai_index_jobs.update({
          where: { id: jobId },
          data: {
            status: dto.status,
            stage: dto.stage,
            heartbeat_at: new Date(),
            started_at: job.started_at || new Date(),
            error: null,
          },
        });
        if (job.document_id) {
          await tx.documents.update({
            where: { id: job.document_id },
            data: {
              status: job.operation === AiIndexOperation.DELETE
                ? AiDocumentStatus.DELETING
                : AiDocumentStatus.INDEXING,
            },
          });
        }
      });
      return { success: true };
    }

    if (dto.status === AiIndexJobStatus.FAILED) {
      await this.prismaService.$transaction(async (tx) => {
        await tx.ai_index_jobs.update({
          where: { id: jobId },
          data: { status: dto.status, stage: dto.stage, error: dto.error, completed_at: new Date() },
        });
        if (job.document_id) {
          await tx.documents.update({
            where: { id: job.document_id },
            data: {
              status:
                job.operation === AiIndexOperation.DELETE && dto.stage === "cleanup"
                  ? AiDocumentStatus.DELETE_CLEANUP_FAILED
                  : AiDocumentStatus.FAILED,
              index_error: dto.error || "Indexing failed",
            },
          });
        }
      });
      return { success: true };
    }

    if (dto.status !== AiIndexJobStatus.SUCCEEDED) {
      throw new BadRequestException("Unsupported job status transition");
    }

    await this.prismaService.$transaction(async (tx) => {
      if (job.document_id && job.operation === AiIndexOperation.DELETE) {
        await tx.chunks.deleteMany({ where: { document_id: job.document_id } });
        await tx.documents.update({
          where: { id: job.document_id },
          data: {
            status: AiDocumentStatus.DELETED,
            chunk_count: 0,
            checksum: null,
            storage_name: null,
            source_url: null,
            deleted_at: new Date(),
            index_error: null,
          },
        });
      } else if (job.document_id && dto.chunks) {
        const version = dto.version || 1;
        await tx.chunks.deleteMany({ where: { document_id: job.document_id } });
        if (dto.chunks.length) {
          await tx.chunks.createMany({
            data: dto.chunks.map((chunk) => ({
              id: chunk.id,
              document_id: job.document_id!,
              version,
              chunk_index: chunk.chunkIndex,
              faiss_id: chunk.faissId,
              text: chunk.text,
              vector: chunk.vector as Prisma.InputJsonValue,
              page_start: chunk.pageStart,
              page_end: chunk.pageEnd,
              meta: (chunk.meta || {}) as Prisma.InputJsonValue,
              collection: chunk.collection || "nch_assistant_index",
              embed_model: chunk.embedModel || "intfloat/multilingual-e5-base",
            })),
          });
        }
        await tx.documents.update({
          where: { id: job.document_id },
          data: {
            status: AiDocumentStatus.READY,
            active_version: version,
            chunk_count: dto.chunks.length,
            total_pages: dto.totalPages,
            indexed_at: new Date(),
            index_error: null,
          },
        });
      }
      await tx.ai_index_jobs.update({
        where: { id: jobId },
        data: {
          status: AiIndexJobStatus.SUCCEEDED,
          stage: dto.stage,
          error: null,
          heartbeat_at: new Date(),
          completed_at: new Date(),
        },
      });
    });
    return { success: true };
  }

  async registerImportedDocument(dto: InternalImportDocumentDto) {
    const existing = await this.prismaService.documents.findFirst({
      where: { checksum: dto.checksum, deleted_at: null },
    });
    if (existing) {
      const active = await this.prismaService.ai_index_jobs.findFirst({
        where: {
          document_id: existing.id,
          status: { in: [AiIndexJobStatus.QUEUED, AiIndexJobStatus.RUNNING] },
        },
      });
      if (active) return { document: existing, job: active, created: false };
      const previous = await this.prismaService.ai_index_jobs.findFirst({
        where: { document_id: existing.id },
        orderBy: { created_at: "desc" },
      });
      const job = await this.prismaService.ai_index_jobs.create({
        data: {
          id: uuidv4(),
          document_id: existing.id,
          operation: AiIndexOperation.IMPORT,
          attempt: (previous?.attempt || 0) + 1,
        },
      });
      await this.prismaService.documents.update({
        where: { id: existing.id },
        data: { status: AiDocumentStatus.QUEUED, index_error: null },
      });
      return { document: existing, job, created: false };
    }

    const documentId = uuidv4();
    const result = await this.prismaService.$transaction(async (tx) => {
      const document = await tx.documents.create({
        data: {
          id: documentId,
          title: dto.title,
          original_filename: dto.originalFilename,
          storage_name: `${documentId}.pdf`,
          checksum: dto.checksum,
          file_size: dto.fileSize,
          media_type: "application/pdf",
          status: AiDocumentStatus.QUEUED,
        },
      });
      const job = await tx.ai_index_jobs.create({
        data: {
          id: uuidv4(),
          document_id: documentId,
          operation: AiIndexOperation.IMPORT,
        },
      });
      return { document, job };
    });
    return { ...result, created: true };
  }

  private async markDispatchFailure(jobId: string, documentId: string, message: string) {
    await this.prismaService.$transaction([
      this.prismaService.ai_index_jobs.update({
        where: { id: jobId },
        data: { status: AiIndexJobStatus.FAILED, stage: "dispatch", error: message, completed_at: new Date() },
      }),
      this.prismaService.documents.update({
        where: { id: documentId },
        data: { status: AiDocumentStatus.FAILED, index_error: message },
      }),
    ]);
  }

  private async recoverStaleIndexJobs() {
    const staleBefore = new Date(Date.now() - 45 * 60 * 1000);
    const staleJobs = await this.prismaService.ai_index_jobs.findMany({
      where: {
        status: { in: [AiIndexJobStatus.QUEUED, AiIndexJobStatus.RUNNING] },
        OR: [
          { heartbeat_at: { lt: staleBefore } },
          { heartbeat_at: null, created_at: { lt: staleBefore } },
        ],
      },
    });
    for (const job of staleJobs) {
      await this.prismaService.$transaction(async (tx) => {
        await tx.ai_index_jobs.update({
          where: { id: job.id },
          data: {
            status: AiIndexJobStatus.FAILED,
            stage: "stale",
            error: "Index worker heartbeat expired",
            completed_at: new Date(),
          },
        });
        if (job.document_id) {
          await tx.documents.update({
            where: { id: job.document_id },
            data: {
              status: AiDocumentStatus.FAILED,
              index_error: "Index worker heartbeat expired",
            },
          });
        }
      });
    }
  }

  // ============== Chat Proxy (API Gateway) ==============

  async chat(
    ctx: RequestContext,
    query: string,
    conversationId?: string,
    conversationHistory?: Array<{ role: string; content: string }>,
    topK?: number
  ) {
    const userId = this.getUserId(ctx);
    this.logger.log(ctx, `Chat request from user ${userId}: "${query.substring(0, 50)}..."`);

    // Rate-limit check: 3 prompts per day (admins exempt)
    const isAdmin = ctx.user?.userType === UserType.SUPER_ADMIN;
    if (!isAdmin) {
      const usage = await this.getDailyUsage(ctx);
      if (usage.remaining <= 0) {
        throw new HttpException(
          {
            message: `Daily prompt limit reached (${usage.limit}/${usage.limit}). Try again tomorrow!`,
            usage,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // Create or use existing session
    let sessionId = conversationId;
    if (!sessionId) {
      const session = await this.prismaService.chat_sessions.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          title: query.substring(0, 50),
          updated_at: new Date(),
        },
      });
      sessionId = session.id;
      this.logger.log(ctx, `Created new session ${sessionId}`);
    }

    // Call RAG service 
    let ragResponse: any;
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ragServiceUrl}/chat`, {
          query,
          conversation_history: conversationHistory,
          top_k: topK || 5,
        }, { headers: this.ragHeaders })
      );
      ragResponse = response.data;
    } catch (error: any) {
      this.logger.error(ctx, `RAG service error: ${error.message || error}`);
      throw new Error(`Failed to get response from AI service: ${error.message || 'Unknown error'}`);
    }

    //  Save user message to DB
    await this.prismaService.chat_messages.create({
      data: {
        id: uuidv4(),
        session_id: sessionId,
        role: "user",
        content: query,
      },
    });

    // Save assistant response to DB
    const assistantMessage = await this.prismaService.chat_messages.create({
      data: {
        id: uuidv4(),
        session_id: sessionId,
        role: "assistant",
        content: String(ragResponse.response || ""),
      },
    });

    // Update session timestamp
    await this.prismaService.chat_sessions.update({
      where: { id: sessionId },
      data: { updated_at: new Date() },
    });

    this.logger.log(ctx, `Chat completed for session ${sessionId}`);

    return {
      response: ragResponse.response,
      conversation_id: sessionId,
      sources: ragResponse.sources || [],
      metadata: ragResponse.metadata || {},
      createdAt: assistantMessage.created_at,
    };
  }
}
