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
        created_at: createdAt,
      },
    ]);

    const messages = await service.getSessionMessages(ctx, "session-1");

    expect(messages[0].sources).toEqual([source]);
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
        metadata: { num_sources: 1 },
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
      }),
    });
    expect(result.sources).toEqual([source]);
  });
});
