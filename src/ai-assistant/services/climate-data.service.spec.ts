import { ConflictException } from "@nestjs/common";
import { ClimateIngestionMode, ClimateIngestionStatus } from "@prisma/client";
import { of } from "rxjs";
import { ClimateDataService } from "./climate-data.service";

describe("ClimateDataService", () => {
  const dataset = { id: "dataset-1", code: "NOAA_GSOM" };

  function createService(overrides: Record<string, any> = {}) {
    const prisma: any = {
      climate_datasets: {
        upsert: jest.fn().mockResolvedValue(dataset),
        updateMany: jest.fn(),
      },
      climate_indicators: { upsert: jest.fn().mockResolvedValue({}) },
      climate_ingestion_runs: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, status: "QUEUED" })),
        update: jest.fn(),
      },
      ...overrides,
    };
    const http: any = { post: jest.fn().mockReturnValue(of({ data: { accepted: true } })) };
    const config: any = {
      get: jest.fn((key: string) =>
        key === "rag.serviceUrl" ? "http://rag" : key === "rag.serviceToken" ? "token" : undefined,
      ),
    };
    return { service: new ClimateDataService(prisma, http, config), prisma, http };
  }

  it("creates and dispatches an idempotent synchronization run", async () => {
    const { service, prisma, http } = createService();
    const result = await service.queueSync(ClimateIngestionMode.BACKFILL, "admin-1");
    expect(result.accepted).toBe(true);
    expect(prisma.climate_ingestion_runs.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ mode: ClimateIngestionMode.BACKFILL, requested_by: "admin-1" }),
    });
    expect(http.post).toHaveBeenCalledWith(
      "http://rag/climate-data/sync",
      expect.objectContaining({ mode: "backfill" }),
      expect.objectContaining({ headers: { Authorization: "Bearer token" } }),
    );
  });

  it("rejects a second sync while one is active", async () => {
    const { service } = createService({
      climate_ingestion_runs: {
        findFirst: jest.fn().mockResolvedValue({ id: "active", status: ClimateIngestionStatus.RUNNING }),
      },
    });
    await expect(service.queueSync(ClimateIngestionMode.INCREMENTAL)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("marks ingestion runs with expired heartbeats as failed", async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 2 });
    const { service } = createService({
      climate_ingestion_runs: { updateMany },
    });
    await expect(service.recoverStaleRuns()).resolves.toBe(2);
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: ClimateIngestionStatus.FAILED,
          stage: "stale_timeout",
        }),
      }),
    );
  });
});
