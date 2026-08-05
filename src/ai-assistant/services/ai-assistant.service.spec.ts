import { of } from "rxjs";
import { ClimateRolloutStage, UserType } from "@prisma/client";
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
      count: jest.fn().mockResolvedValue(0),
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
  const regularUserCtx = {
    user: { id: "user-1", userType: UserType.INDIVIDUAL },
  } as any;
  const visualDecision = {
    status: "generated",
    attempted: true,
    category: "metrics",
    reason: null,
    repairAttempted: false,
    evidenceCount: 8,
  };

  const makeSources = () =>
    Array.from({ length: 8 }, (_, index) => ({
      documentId: `document-${index + 1}`,
      chunkId: `chunk-${index + 1}`,
      title: `Climate Policy ${index + 1}`,
      url: `/api/v1/ai-assistant/documents/document-${index + 1}/file`,
      page: index + 1,
      score: 0.99 - index * 0.01,
    }));

  it("returns all saved sources and diagnostics to a superadmin", async () => {
    const sources = makeSources();
    const createdAt = new Date("2026-06-18T12:00:00.000Z");
    const { service, prismaService } = makeService();
    prismaService.chat_sessions.findUnique.mockResolvedValue({ id: "session-1", user_id: "user-1" });
    prismaService.chat_messages.findMany.mockResolvedValue([
      {
        id: "message-1",
        session_id: "session-1",
        role: "assistant",
        content: "Answer",
        sources,
        metadata: {
          visual: {
            version: 1,
            type: "sector_chips",
            items: [
              { label: "Energy", sourceIndex: 1 },
              { label: "Transport", sourceIndex: 1 },
            ],
          },
          visualDecision,
        },
        created_at: createdAt,
      },
    ]);

    const messages = await service.getSessionMessages(ctx, "session-1");

    expect(messages[0].sources).toEqual(sources);
    expect(messages[0].metadata).toEqual(
      expect.objectContaining({
        visual: expect.objectContaining({ type: "sector_chips" }),
        visualDecision,
      }),
    );
    expect(messages[0].createdAt).toBe(createdAt);
  });

  it("persists raw metadata while filtering regular-user live output", async () => {
    const sources = makeSources();
    const visual = {
      version: 2,
      type: "metric_strip",
      items: [
        { label: "Target", value: "45%", sourceIndex: 1 },
        { label: "Deadline", value: "2030", sourceIndex: 8 },
      ],
    };
    const rawMetadata = {
      num_sources: 8,
      visual,
      visualDecision,
    };
    const { service, prismaService, httpService } = makeService();
    httpService.post.mockReturnValue(of({
      data: {
        response: "Answer",
        sources,
        metadata: rawMetadata,
      },
    }));
    prismaService.chat_messages.create
      .mockResolvedValueOnce({ id: "user-message" })
      .mockResolvedValueOnce({ id: "assistant-message", created_at: new Date("2026-06-18T12:00:00.000Z") });
    prismaService.chat_sessions.update.mockResolvedValue({ id: "session-1" });

    const result = await service.chat(
      regularUserCtx,
      "What policy mentions solar?",
      "session-1",
    );

    expect(prismaService.chat_messages.create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        content: "Answer",
        sources,
        metadata: rawMetadata,
      }),
    });
    expect(httpService.post).toHaveBeenCalledWith(
      "http://rag-service/chat",
      expect.objectContaining({ enable_visuals: true, top_k: 8 }),
      { headers: { Authorization: "Bearer service-token" } },
    );
    expect(result.sources).toEqual(sources);
    expect(result.metadata).toEqual({ num_sources: 8, visual });
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

  it("strips diagnostics from regular-user saved history", async () => {
    const visual = {
      version: 2,
      type: "metric_strip",
      items: [
        { label: "Target", value: "45%", sourceIndex: 1 },
        { label: "Deadline", value: "2030", sourceIndex: 8 },
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
        sources: makeSources(),
        metadata: {
          num_sources: 8,
          visual,
          visualDecision,
        },
        created_at: new Date(),
      },
    ]);

    const messages = await service.getSessionMessages(
      regularUserCtx,
      "session-1",
    );

    expect(messages[0].metadata).toEqual({ num_sources: 8, visual });
    expect(messages[0].sources).toEqual(makeSources());
  });

  it("hides stored visuals but retains superadmin diagnostics when disabled", async () => {
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
          visualDecision: {
            ...visualDecision,
            status: "skipped",
            attempted: false,
            category: null,
            reason: "disabled",
            evidenceCount: 0,
          },
        },
        created_at: new Date(),
      },
    ]);

    const messages = await service.getSessionMessages(ctx, "session-1");

    expect(messages[0].metadata).toEqual({
      num_sources: 2,
      visualDecision: {
        ...visualDecision,
        status: "skipped",
        attempted: false,
        category: null,
        reason: "disabled",
        evidenceCount: 0,
      },
    });
  });

  it("persists disabled-path metadata while returning diagnostics to a superadmin", async () => {
    const disabledDecision = {
      ...visualDecision,
      status: "skipped",
      attempted: false,
      category: null,
      reason: "disabled",
      evidenceCount: 0,
    };
    const rawMetadata = {
      num_sources: 0,
      visual: { version: 2, type: "metric_strip", items: [] },
      visualDecision: disabledDecision,
    };
    const { service, prismaService, httpService } = makeService();
    prismaService.ai_assistant_settings.upsert.mockResolvedValue({
      id: 1,
      visual_responses_enabled: false,
      updated_at: new Date(),
      updated_by: null,
    });
    httpService.post.mockReturnValue(of({
      data: {
        response: "Answer",
        sources: [],
        metadata: rawMetadata,
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
    expect(prismaService.chat_messages.create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        metadata: rawMetadata,
      }),
    });
    expect(result.metadata).toEqual({
      num_sources: 0,
      visualDecision: disabledDecision,
    });
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
          visualDecision: {
            ...visualDecision,
            status: "skipped",
            attempted: false,
            category: null,
            reason: "disabled",
            evidenceCount: 0,
          },
        },
      },
    }));
    prismaService.chat_messages.create
      .mockResolvedValueOnce({ id: "user-message" })
      .mockResolvedValueOnce({ id: "assistant-message", created_at: new Date() });
    prismaService.chat_sessions.update.mockResolvedValue({ id: "session-1" });

    const result = await service.chat(
      regularUserCtx,
      "Question",
      "session-1",
    );

    expect(httpService.post).toHaveBeenCalledWith(
      "http://rag-service/chat",
      expect.objectContaining({ enable_visuals: false }),
      expect.anything(),
    );
    expect(result.metadata).toEqual({});
    expect(logger.error).toHaveBeenCalledWith(
      regularUserCtx,
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

  it("enforces administrator, internal, limited, and all rollout stages", () => {
    const { service } = makeService({
      configService: {
        get: jest.fn((key: string) => {
          if (key === "climate.internalUserIds") return ["internal-1"];
          if (key === "climate.limitedUserIds") return ["limited-1"];
          return undefined;
        }),
      },
    });
    const allows = (stage: ClimateRolloutStage, id: string, userType: UserType) =>
      (service as any).climateRolloutAllows(stage, { user: { id, userType } });
    expect(allows(ClimateRolloutStage.ADMIN, "admin-1", UserType.ADMIN)).toBe(true);
    expect(allows(ClimateRolloutStage.ADMIN, "person-1", UserType.INDIVIDUAL)).toBe(false);
    expect(allows(ClimateRolloutStage.INTERNAL, "internal-1", UserType.INDIVIDUAL)).toBe(true);
    expect(allows(ClimateRolloutStage.LIMITED, "limited-1", UserType.INDIVIDUAL)).toBe(true);
    expect(allows(ClimateRolloutStage.ALL, "person-1", UserType.INDIVIDUAL)).toBe(true);
    expect(allows(ClimateRolloutStage.DISABLED, "admin-1", UserType.SUPER_ADMIN)).toBe(false);
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
