import { of } from "rxjs";
import { UserType } from "@prisma/client";
import { AiAssistantService } from "./ai-assistant.service";

function makeService(overrides: Record<string, any> = {}) {
  const logger = {
    setContext: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  };
  const prismaService = {
    chat_sessions: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    chat_messages: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    ai_assistant_settings: {
      upsert: jest.fn().mockResolvedValue({
        id: 1,
        visual_responses_enabled: true,
        updated_at: new Date("2026-07-22T12:00:00.000Z"),
        updated_by: null,
      }),
    },
    ...overrides.prismaService,
  };
  const httpService = {
    post: jest.fn(),
    ...overrides.httpService,
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === "rag.serviceUrl") return "http://rag-service";
      if (key === "rag.serviceToken") return "service-token";
      return undefined;
    }),
    ...overrides.configService,
  };

  return {
    service: new AiAssistantService(
      logger as any,
      prismaService as any,
      httpService as any,
      configService as any,
    ),
    prismaService,
    httpService,
    logger,
  };
}

describe("AiAssistantService chat sources", () => {
  const ctx = {
    user: { id: "user-1", userType: UserType.SUPER_ADMIN },
  } as any;

  it("returns saved structured sources when loading session messages", async () => {
    const source = {
      documentId: "document-1",
      chunkId: "chunk-1",
      title: "Climate Policy",
      url: "/api/v1/ai-assistant/documents/document-1/file",
      page: 12,
      score: 0.91,
    };
    const createdAt = new Date("2026-06-18T12:00:00.000Z");
    const { service, prismaService } = makeService();
    prismaService.chat_sessions.findUnique.mockResolvedValue({ id: "session-1", user_id: "user-1" });
    prismaService.chat_messages.findMany.mockResolvedValue([
      {
        id: "message-1",
        session_id: "session-1",
        role: "assistant",
        content: "Answer",
        sources: [source],
        metadata: {
          visual: {
            version: 1,
            type: "sector_chips",
            items: [
              { label: "Energy", sourceIndex: 1 },
              { label: "Transport", sourceIndex: 1 },
            ],
          },
        },
        created_at: createdAt,
      },
    ]);

    const messages = await service.getSessionMessages(ctx, "session-1");

    expect(messages[0].sources).toEqual([source]);
    expect(messages[0].metadata).toEqual(
      expect.objectContaining({
        visual: expect.objectContaining({ type: "sector_chips" }),
      }),
    );
    expect(messages[0].createdAt).toBe(createdAt);
  });

  it("persists RAG sources with the assistant message", async () => {
    const source = {
      documentId: "document-1",
      chunkId: "chunk-1",
      title: "Climate Policy",
      url: "/api/v1/ai-assistant/documents/document-1/file",
      page: 5,
      score: 0.88,
    };
    const { service, prismaService, httpService } = makeService();
    httpService.post.mockReturnValue(of({
      data: {
        response: "Answer",
        sources: [source],
        metadata: {
          num_sources: 1,
          visual: {
            version: 1,
            type: "document_comparison",
            columns: [
              { label: "Reference", sourceIndex: 1 },
              { label: "Additional measures", sourceIndex: 1 },
            ],
            rows: [
              { label: "2030", values: ["34 mMtCO2", "zero"] },
              { label: "2050", values: ["79 mMtCO2", "net negative"] },
            ],
          },
        },
      },
    }));
    prismaService.chat_messages.create
      .mockResolvedValueOnce({ id: "user-message" })
      .mockResolvedValueOnce({ id: "assistant-message", created_at: new Date("2026-06-18T12:00:00.000Z") });
    prismaService.chat_sessions.update.mockResolvedValue({ id: "session-1" });

    const result = await service.chat(ctx, "What policy mentions solar?", "session-1");

    expect(prismaService.chat_messages.create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        content: "Answer",
        sources: [source],
        metadata: expect.objectContaining({
          visual: expect.objectContaining({ type: "document_comparison" }),
        }),
      }),
    });
    expect(httpService.post).toHaveBeenCalledWith(
      "http://rag-service/chat",
      expect.objectContaining({ enable_visuals: true }),
      { headers: { Authorization: "Bearer service-token" } },
    );
    expect(result.sources).toEqual([source]);
    expect(result.metadata).toEqual(
      expect.objectContaining({
        visual: expect.objectContaining({ type: "document_comparison" }),
      }),
    );
  });

  it("restores new process visual metadata without changing its payload", async () => {
    const visual = {
      version: 1,
      type: "process_stepper",
      items: [
        { step: 1, label: "Assess climate risks", sourceIndex: 1 },
        { step: 2, label: "Prepare adaptation actions", sourceIndex: 1 },
      ],
    };
    const { service, prismaService } = makeService();
    prismaService.chat_sessions.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "user-1",
    });
    prismaService.chat_messages.findMany.mockResolvedValue([
      {
        role: "assistant",
        content: "Answer",
        sources: [],
        metadata: { visual },
        created_at: new Date(),
      },
    ]);

    const messages = await service.getSessionMessages(ctx, "session-1");

    expect(messages[0].metadata).toEqual({ visual });
  });

  it("hides stored visual metadata while the global setting is disabled", async () => {
    const { service, prismaService } = makeService();
    prismaService.ai_assistant_settings.upsert.mockResolvedValue({
      id: 1,
      visual_responses_enabled: false,
      updated_at: new Date(),
      updated_by: null,
    });
    prismaService.chat_sessions.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "user-1",
    });
    prismaService.chat_messages.findMany.mockResolvedValue([
      {
        role: "assistant",
        content: "Answer",
        sources: [],
        metadata: {
          num_sources: 2,
          visual: { version: 1, type: "metric_strip", items: [] },
        },
        created_at: new Date(),
      },
    ]);

    const messages = await service.getSessionMessages(ctx, "session-1");

    expect(messages[0].metadata).toEqual({ num_sources: 2 });
  });

  it("fails closed when the visual setting cannot be read", async () => {
    const { service, prismaService, httpService, logger } = makeService();
    prismaService.ai_assistant_settings.upsert.mockRejectedValue(
      new Error("database unavailable"),
    );
    httpService.post.mockReturnValue(of({
      data: {
        response: "Answer",
        sources: [],
        metadata: {
          visual: { version: 1, type: "metric_strip", items: [] },
        },
      },
    }));
    prismaService.chat_messages.create
      .mockResolvedValueOnce({ id: "user-message" })
      .mockResolvedValueOnce({ id: "assistant-message", created_at: new Date() });
    prismaService.chat_sessions.update.mockResolvedValue({ id: "session-1" });

    const result = await service.chat(ctx, "Question", "session-1");

    expect(httpService.post).toHaveBeenCalledWith(
      "http://rag-service/chat",
      expect.objectContaining({ enable_visuals: false }),
      expect.anything(),
    );
    expect(result.metadata).toEqual({});
    expect(logger.error).toHaveBeenCalledWith(
      ctx,
      expect.stringContaining("continuing with visuals disabled"),
      expect.anything(),
    );
  });

  it("updates the singleton setting with the acting superadmin", async () => {
    const { service, prismaService } = makeService();
    prismaService.ai_assistant_settings.upsert.mockResolvedValue({
      id: 1,
      visual_responses_enabled: true,
      updated_at: new Date("2026-07-22T12:00:00.000Z"),
      updated_by: "user-1",
    });

    const settings = await service.updateAiAssistantSettings(ctx, true);

    expect(prismaService.ai_assistant_settings.upsert).toHaveBeenCalledWith({
      where: { id: 1 },
      create: expect.objectContaining({
        visual_responses_enabled: true,
        updated_by: "user-1",
      }),
      update: expect.objectContaining({
        visual_responses_enabled: true,
        updated_by: "user-1",
      }),
    });
    expect(settings.visualResponsesEnabled).toBe(true);
  });
});

describe("AiAssistantService document chunk viewer", () => {
  it("returns paginated active-version chunks without embedding vectors", async () => {
    const documents = {
      findFirst: jest.fn().mockResolvedValue({
        id: "document-1",
        title: "Nepal Climate Policy",
        active_version: 2,
      }),
    };
    const chunks = {
      findMany: jest.fn().mockReturnValue("chunk-query"),
      count: jest.fn().mockReturnValue("count-query"),
    };
    const transaction = jest.fn().mockResolvedValue([
      [
        {
          id: "chunk-1",
          chunk_index: 4,
          page_start: 7,
          page_end: 8,
          text: "Adaptation priorities for Nepal.",
          meta: { section: "Adaptation" },
        },
      ],
      1,
    ]);
    const { service } = makeService({
      prismaService: {
        documents,
        chunks,
        $transaction: transaction,
      },
    });

    const result = await service.listAdminDocumentChunks("document-1", {
      page: 1,
      limit: 25,
      search: "adaptation",
    });

    expect(documents.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: "document-1" }) }),
    );
    expect(chunks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          document_id: "document-1",
          version: 2,
          text: { contains: "adaptation", mode: "insensitive" },
        }),
        take: 25,
      }),
    );
    expect(chunks.findMany.mock.calls[0][0].select).not.toHaveProperty("vector");
    expect(result).toEqual({
      document: {
        id: "document-1",
        title: "Nepal Climate Policy",
        version: 2,
      },
      chunks: [
        {
          id: "chunk-1",
          chunkIndex: 4,
          pageStart: 7,
          pageEnd: 8,
          text: "Adaptation priorities for Nepal.",
          meta: { section: "Adaptation" },
        },
      ],
      total: 1,
      page: 1,
      limit: 25,
    });
  });
});
