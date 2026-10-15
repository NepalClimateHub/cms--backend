import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Optional,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import {
  ClimateIngestionMode,
  ClimateIngestionStatus,
  ClimateOntologyConceptType,
  Prisma,
} from "@prisma/client";
import { firstValueFrom } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import {
  InternalClimateBatchDto,
  InternalClimateQueryDto,
  InternalClimateRunUpdateDto,
  ClimateGrain,
  ClimateVisualType,
} from "../dtos/climate-data.dto";
import { ClimateOntologyService } from "./climate-ontology.service";

export const NOAA_GSOM_DATASET_CODE = "NOAA_GSOM";

const INDICATORS = [
  {
    code: "TAVG",
    name: "Average temperature",
    unit: "degC",
    aggregation: "mean",
    description: "Monthly mean air temperature reported by NOAA GSOM.",
  },
  {
    code: "TMIN",
    name: "Minimum temperature",
    unit: "degC",
    aggregation: "mean",
    description: "Monthly mean of daily minimum air temperature.",
  },
  {
    code: "TMAX",
    name: "Maximum temperature",
    unit: "degC",
    aggregation: "mean",
    description: "Monthly mean of daily maximum air temperature.",
  },
  {
    code: "PRCP",
    name: "Precipitation",
    unit: "mm",
    aggregation: "sum",
    description: "Monthly accumulated precipitation.",
  },
] as const;

const COUNTRY_ALIASES: Record<string, { code: string; name: string }> = {
  afghanistan: { code: "AF", name: "Afghanistan" },
  bangladesh: { code: "BG", name: "Bangladesh" },
  bhutan: { code: "BT", name: "Bhutan" },
  india: { code: "IN", name: "India" },
  maldives: { code: "MV", name: "Maldives" },
  nepal: { code: "NP", name: "Nepal" },
  pakistan: { code: "PK", name: "Pakistan" },
  "sri lanka": { code: "CE", name: "Sri Lanka" },
  af: { code: "AF", name: "Afghanistan" },
  bg: { code: "BG", name: "Bangladesh" },
  bt: { code: "BT", name: "Bhutan" },
  in: { code: "IN", name: "India" },
  mv: { code: "MV", name: "Maldives" },
  np: { code: "NP", name: "Nepal" },
  pk: { code: "PK", name: "Pakistan" },
  ce: { code: "CE", name: "Sri Lanka" },
};

type ClimateObservation = {
  station_id: string;
  indicator_code: string;
  period: Date;
  value: number;
  unit: string;
  station: {
    id: string;
    name: string;
    country_code: string;
    country_name: string;
    latitude: number;
    longitude: number;
    elevation_m: number | null;
  };
};

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function rounded(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function monthKey(period: Date) {
  return `${period.getUTCFullYear()}-${String(period.getUTCMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(period: Date) {
  return new Date(Date.UTC(period.getUTCFullYear(), period.getUTCMonth() + 1, 0)).getUTCDate();
}

function linearTrend(points: Array<{ period: string; value: number }>) {
  if (points.length < 20) return null;
  const values = points.map((point) => {
    const [year, month = "01"] = point.period.split("-");
    return { x: Number(year) + (Number(month) - 1) / 12, y: point.value };
  });
  const meanX = values.reduce((sum, point) => sum + point.x, 0) / values.length;
  const meanY = values.reduce((sum, point) => sum + point.y, 0) / values.length;
  const denominator = values.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (!denominator) return null;
  const slope =
    values.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) /
    denominator;
  return rounded(slope * 10, 3);
}

function correlation(points: Array<{ x: number; y: number }>) {
  if (points.length < 10) return null;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const numerator = points.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0,
  );
  const xVariance = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  const yVariance = points.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0);
  const denominator = Math.sqrt(xVariance * yVariance);
  return denominator ? rounded(numerator / denominator, 3) : null;
}

@Injectable()
export class ClimateDataService implements OnModuleInit {
  private readonly logger = new Logger(ClimateDataService.name);
  private readonly queryCache = new Map<string, { expiresAt: number; value: any }>();
  private activeQueries = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @Optional() private readonly ontology?: ClimateOntologyService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureReferenceData();
    } catch (error) {
      this.logger.warn(
        `Climate reference data is not ready: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private get ragServiceUrl() {
    return this.config.get<string>("rag.serviceUrl") || "http://localhost:8000";
  }

  private get ragHeaders() {
    const token = this.config.get<string>("rag.serviceToken");
    if (!token) throw new Error("RAG_SERVICE_TOKEN is not configured");
    return { Authorization: `Bearer ${token}` };
  }

  private get queryCacheTtlMs() {
    return Math.max(1_000, this.config.get<number>("climate.queryCacheTtlMs") || 300_000);
  }

  private get queryCacheMaxEntries() {
    return Math.max(1, this.config.get<number>("climate.queryCacheMaxEntries") || 200);
  }

  private get queryMaxConcurrency() {
    return Math.max(1, this.config.get<number>("climate.queryMaxConcurrency") || 20);
  }

  private get staleRunMinutes() {
    return Math.max(15, this.config.get<number>("climate.staleRunMinutes") || 60);
  }

  private clearQueryCache() {
    this.queryCache.clear();
  }

  private queryHash(dto: InternalClimateQueryDto) {
    const normalized = {
      ...dto,
      locations: [...dto.locations].map((value) => value.trim().toLowerCase()).sort(),
      stationIds: [...(dto.stationIds || [])].map((value) => value.trim().toUpperCase()).sort(),
      indicators: [...dto.indicators].map((value) => value.trim().toUpperCase()).sort(),
    };
    return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  }

  private async auditQuery(
    dto: InternalClimateQueryDto,
    requestHash: string,
    startedAt: number,
    options: {
      cacheHit: boolean;
      success: boolean;
      resultCount?: number;
      stationCount?: number;
      error?: string;
    },
  ) {
    const repository = (this.prisma as any).climate_query_audits;
    if (!repository?.create) return;
    try {
      await repository.create({
        data: {
          request_hash: requestHash,
          query_plan: dto as unknown as Prisma.InputJsonValue,
          cache_hit: options.cacheHit,
          success: options.success,
          duration_ms: Math.max(0, Date.now() - startedAt),
          result_count: options.resultCount || 0,
          station_count: options.stationCount || 0,
          visual_type: dto.visualType,
          error: options.error?.slice(0, 4000),
        },
      });
    } catch (error) {
      this.logger.warn(
        `Climate query audit failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async ensureReferenceData() {
    const dataset = await this.prisma.climate_datasets.upsert({
      where: { code: NOAA_GSOM_DATASET_CODE },
      create: {
        code: NOAA_GSOM_DATASET_CODE,
        name: "NOAA Global Summary of the Month",
        provider: "NOAA National Centers for Environmental Information",
        source_url: "https://www.ncei.noaa.gov/data/global-summary-of-the-month/access/",
      },
      update: {},
    });
    await Promise.all(
      INDICATORS.map((indicator) =>
        this.prisma.climate_indicators.upsert({
          where: { code: indicator.code },
          create: indicator,
          update: {
            name: indicator.name,
            unit: indicator.unit,
            aggregation: indicator.aggregation,
            description: indicator.description,
          },
        }),
      ),
    );
    return dataset;
  }

  async getStatus() {
    const auditRepository = (this.prisma as any).climate_query_audits;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [settings, latestRun, latestSuccess, stationCount, observationCount, manifestCount, countries, audits] =
      await Promise.all([
        this.prisma.ai_assistant_settings.upsert({
          where: { id: 1 },
          create: { id: 1 },
          update: {},
        }),
        this.prisma.climate_ingestion_runs.findFirst({ orderBy: { created_at: "desc" } }),
        this.prisma.climate_ingestion_runs.findFirst({
          where: { status: ClimateIngestionStatus.SUCCEEDED },
          orderBy: { completed_at: "desc" },
        }),
        this.prisma.climate_stations.count(),
        this.prisma.climate_monthly_observations.count(),
        this.prisma.climate_source_manifests.count(),
        this.prisma.climate_stations.groupBy({
          by: ["country_code", "country_name"],
          _count: { id: true },
          orderBy: { country_name: "asc" },
        }),
        auditRepository?.findMany
          ? auditRepository.findMany({
              where: { created_at: { gte: since } },
              select: {
                route: true,
                success: true,
                cache_hit: true,
                duration_ms: true,
                visual_type: true,
              },
            })
          : Promise.resolve([]),
      ]);

    const queryAudits = audits.filter((audit: any) => audit.route !== "client");
    const durations = queryAudits
      .map((audit: any) => audit.duration_ms)
      .sort((a: number, b: number) => a - b);
    const p95Index = durations.length ? Math.max(0, Math.ceil(durations.length * 0.95) - 1) : 0;
    const latestSuccessAt = latestSuccess?.completed_at?.getTime() || 0;
    const stale = !latestSuccessAt || Date.now() - latestSuccessAt > 45 * 24 * 60 * 60 * 1000;

    return {
      enabled: settings.climate_data_enabled,
      mapsEnabled: settings.climate_maps_enabled,
      graphRagEnabled: settings.graph_rag_enabled,
      rolloutStage: settings.climate_rollout_stage,
      latestRun,
      latestSuccessfulSync: latestSuccess?.completed_at || null,
      stale,
      stationCount,
      observationCount,
      manifestCount,
      countries: countries.map((country) => ({
        code: country.country_code,
        name: country.country_name,
        stations: country._count.id,
      })),
      operational: {
        queries24h: queryAudits.length,
        failures24h: queryAudits.filter((audit: any) => !audit.success).length,
        cacheHits24h: queryAudits.filter((audit: any) => audit.cache_hit).length,
        mapFallbacks24h: audits.filter(
          (audit: any) => audit.route === "client" && audit.visual_type === "station_map",
        ).length,
        p95QueryLatencyMs: durations.length ? durations[p95Index] : null,
        routes: audits.reduce((counts: Record<string, number>, audit: any) => {
          counts[audit.route] = (counts[audit.route] || 0) + 1;
          return counts;
        }, {}),
        queryCacheEntries: this.queryCache.size,
      },
    };
  }

  async recordClientMetric(userId: string | undefined, event: "map_fallback") {
    const repository = (this.prisma as any).climate_query_audits;
    if (!repository?.create) return { accepted: false };
    const requestHash = createHash("sha256")
      .update(`${event}:${userId || "anonymous"}:${new Date().toISOString().slice(0, 13)}`)
      .digest("hex");
    await repository.create({
      data: {
        request_hash: requestHash,
        route: "client",
        query_plan: { event },
        cache_hit: false,
        success: false,
        duration_ms: 0,
        result_count: 0,
        station_count: 0,
        visual_type: "station_map",
        error: event,
      },
    });
    return { accepted: true };
  }

  async recoverStaleRuns() {
    const repository = (this.prisma as any).climate_ingestion_runs;
    if (!repository?.updateMany) return 0;
    const cutoff = new Date(Date.now() - this.staleRunMinutes * 60 * 1000);
    const result = await repository.updateMany({
      where: {
        status: { in: [ClimateIngestionStatus.QUEUED, ClimateIngestionStatus.RUNNING] },
        OR: [
          { heartbeat_at: { lt: cutoff } },
          { heartbeat_at: null, created_at: { lt: cutoff } },
        ],
      },
      data: {
        status: ClimateIngestionStatus.FAILED,
        stage: "stale_timeout",
        completed_at: new Date(),
        error: `No heartbeat within ${this.staleRunMinutes} minutes`,
      },
    });
    if (result.count) this.logger.warn(`Marked ${result.count} stale climate runs as failed`);
    return result.count;
  }

  async queueSync(mode: ClimateIngestionMode, requestedBy?: string) {
    await this.recoverStaleRuns();
    const active = await this.prisma.climate_ingestion_runs.findFirst({
      where: {
        status: { in: [ClimateIngestionStatus.QUEUED, ClimateIngestionStatus.RUNNING] },
      },
      orderBy: { created_at: "desc" },
    });
    if (active) throw new ConflictException(`Climate synchronization ${active.id} is active`);

    const run = await this.prisma.climate_ingestion_runs.create({
      data: {
        id: uuidv4(),
        mode,
        requested_by: requestedBy,
      },
    });

    let dispatchError: any = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await firstValueFrom(
          this.http.post(
            `${this.ragServiceUrl}/climate-data/sync`,
            { run_id: run.id, mode: mode.toLowerCase() },
            { headers: this.ragHeaders, timeout: 15_000 },
          ),
        );
        dispatchError = null;
        break;
      } catch (error) {
        dispatchError = error;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 250));
      }
    }
    if (dispatchError) {
      const message =
        dispatchError?.response?.data?.detail ||
        dispatchError?.message ||
        "Climate worker dispatch failed";
      await this.prisma.climate_ingestion_runs.update({
        where: { id: run.id },
        data: {
          status: ClimateIngestionStatus.FAILED,
          stage: "dispatch",
          error: String(message),
          completed_at: new Date(),
        },
      });
      throw new BadGatewayException(`Failed to start climate synchronization: ${message}`);
    }

    return { ...run, accepted: true };
  }

  startAdminSync(ctx: RequestContext, mode: ClimateIngestionMode) {
    return this.queueSync(mode, ctx.user?.id);
  }

  async queueInitialBackfillIfNeeded() {
    const settings = await this.prisma.ai_assistant_settings.findUnique({ where: { id: 1 } });
    if (!settings?.climate_data_enabled) return null;
    const successful = await this.prisma.climate_ingestion_runs.count({
      where: { status: ClimateIngestionStatus.SUCCEEDED },
    });
    if (successful) return null;
    return this.queueSync(ClimateIngestionMode.BACKFILL, "scheduler:initial");
  }

  async queueMonthlyIncremental() {
    const settings = await this.prisma.ai_assistant_settings.findUnique({ where: { id: 1 } });
    if (!settings?.climate_data_enabled) return null;
    const successful = await this.prisma.climate_ingestion_runs.count({
      where: { status: ClimateIngestionStatus.SUCCEEDED },
    });
    return this.queueSync(
      successful ? ClimateIngestionMode.INCREMENTAL : ClimateIngestionMode.BACKFILL,
      "scheduler:monthly",
    );
  }

  async acceptBatch(dto: InternalClimateBatchDto) {
    const run = await this.prisma.climate_ingestion_runs.findUnique({ where: { id: dto.runId } });
    if (!run) throw new NotFoundException(`Climate ingestion run ${dto.runId} not found`);
    if (run.status === ClimateIngestionStatus.SUCCEEDED || run.status === ClimateIngestionStatus.FAILED) {
      throw new ConflictException("A completed climate ingestion run cannot accept batches");
    }

    const dataset = await this.ensureReferenceData();
    const stationMap = new Map(dto.stations.map((station) => [station.id, station]));
    const observations = new Map(
      dto.observations.map((item) => [
        `${item.stationId}:${item.indicatorCode}:${item.period.slice(0, 10)}`,
        item,
      ]),
    );

    for (const item of observations.values()) {
      if (!stationMap.has(item.stationId)) {
        const exists = await this.prisma.climate_stations.count({ where: { id: item.stationId } });
        if (!exists) throw new BadRequestException(`Unknown station ${item.stationId}`);
      }
      const expectedUnit = INDICATORS.find((indicator) => indicator.code === item.indicatorCode)?.unit;
      if (item.unit !== expectedUnit) {
        throw new BadRequestException(`${item.indicatorCode} must use ${expectedUnit}`);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      for (const station of stationMap.values()) {
        await tx.climate_stations.upsert({
          where: { id: station.id },
          create: {
            id: station.id,
            name: station.name,
            country_code: station.countryCode,
            country_name: station.countryName,
            latitude: station.latitude,
            longitude: station.longitude,
            elevation_m: station.elevationM,
            metadata: (station.metadata || {}) as Prisma.InputJsonValue,
          },
          update: {
            name: station.name,
            country_code: station.countryCode,
            country_name: station.countryName,
            latitude: station.latitude,
            longitude: station.longitude,
            elevation_m: station.elevationM,
            metadata: (station.metadata || {}) as Prisma.InputJsonValue,
            active: true,
          },
        });
      }

      for (const item of observations.values()) {
        const period = new Date(`${item.period.slice(0, 7)}-01T00:00:00.000Z`);
        await tx.climate_monthly_observations.upsert({
          where: {
            dataset_id_station_id_indicator_code_period: {
              dataset_id: dataset.id,
              station_id: item.stationId,
              indicator_code: item.indicatorCode,
              period,
            },
          },
          create: {
            dataset_id: dataset.id,
            station_id: item.stationId,
            indicator_code: item.indicatorCode,
            period,
            value: item.value,
            unit: item.unit,
            days_missing: item.daysMissing,
            quality_flag: item.qualityFlag,
            attributes: (item.attributes || {}) as Prisma.InputJsonValue,
            source_run_id: dto.runId,
          },
          update: {
            value: item.value,
            unit: item.unit,
            days_missing: item.daysMissing,
            quality_flag: item.qualityFlag,
            attributes: (item.attributes || {}) as Prisma.InputJsonValue,
            source_run_id: dto.runId,
          },
        });
      }

      if (dto.manifest) {
        await tx.climate_source_manifests.upsert({
          where: {
            run_id_checksum: { run_id: dto.runId, checksum: dto.manifest.checksum },
          },
          create: {
            run_id: dto.runId,
            dataset_id: dataset.id,
            checksum: dto.manifest.checksum,
            archive_path: dto.manifest.archivePath,
            request_url: dto.manifest.requestUrl,
            response_bytes: dto.manifest.responseBytes,
            row_count: dto.manifest.rowCount,
          },
          update: {},
        });
      }

      await tx.climate_ingestion_runs.update({
        where: { id: dto.runId },
        data: {
          status: ClimateIngestionStatus.RUNNING,
          stage: "importing",
          heartbeat_at: new Date(),
          started_at: run.started_at || new Date(),
          rows_processed: { increment: observations.size },
          station_count: { increment: stationMap.size },
          batch_count: { increment: 1 },
        },
      });
    });

    this.clearQueryCache();

    return { accepted: observations.size, stations: stationMap.size };
  }

  async updateRun(runId: string, dto: InternalClimateRunUpdateDto) {
    const existing = await this.prisma.climate_ingestion_runs.findUnique({ where: { id: runId } });
    if (!existing) throw new NotFoundException(`Climate ingestion run ${runId} not found`);

    if (dto.status === ClimateIngestionStatus.SUCCEEDED) {
      await this.rebuildNormals();
    }

    const completed =
      dto.status === ClimateIngestionStatus.SUCCEEDED ||
      dto.status === ClimateIngestionStatus.FAILED;
    const updated = await this.prisma.climate_ingestion_runs.update({
      where: { id: runId },
      data: {
        status: dto.status,
        stage: dto.stage,
        error: dto.error,
        failed_batches: dto.failedBatches,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        heartbeat_at: new Date(),
        started_at: existing.started_at || new Date(),
        completed_at: completed ? new Date() : null,
      },
    });
    if (dto.status === ClimateIngestionStatus.SUCCEEDED) {
      await this.prisma.climate_datasets.updateMany({
        where: { code: NOAA_GSOM_DATASET_CODE },
        data: { last_synced_at: new Date() },
      });
      this.clearQueryCache();
    }
    return updated;
  }

  async rebuildNormals() {
    await this.prisma.$executeRaw`
      INSERT INTO "climate_normals" (
        "id", "station_id", "indicator_code", "calendar_month",
        "baseline_start", "baseline_end", "value", "valid_years",
        "created_at", "updated_at"
      )
      SELECT
        md5("station_id" || ':' || "indicator_code" || ':' || EXTRACT(MONTH FROM "period")::text || ':1991:2020'),
        "station_id",
        "indicator_code",
        EXTRACT(MONTH FROM "period")::integer,
        1991,
        2020,
        AVG("value"),
        COUNT(DISTINCT EXTRACT(YEAR FROM "period"))::integer,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM "climate_monthly_observations"
      WHERE "period" >= DATE '1991-01-01'
        AND "period" < DATE '2021-01-01'
        AND ("days_missing" IS NULL OR "days_missing" <= 5)
      GROUP BY "station_id", "indicator_code", EXTRACT(MONTH FROM "period")
      HAVING COUNT(DISTINCT EXTRACT(YEAR FROM "period")) >= 24
      ON CONFLICT ("station_id", "indicator_code", "calendar_month", "baseline_start", "baseline_end")
      DO UPDATE SET
        "value" = EXCLUDED."value",
        "valid_years" = EXCLUDED."valid_years",
        "updated_at" = CURRENT_TIMESTAMP
    `;
  }

  async queryStructured(dto: InternalClimateQueryDto) {
    if (this.activeQueries >= this.queryMaxConcurrency) {
      throw new HttpException("Too many concurrent climate queries", HttpStatus.TOO_MANY_REQUESTS);
    }
    this.activeQueries += 1;
    const startedAt = Date.now();
    const requestHash = this.queryHash(dto);
    try {
      const cached = this.queryCache.get(requestHash);
      if (cached && cached.expiresAt > Date.now()) {
        const value = {
          ...cached.value,
          summary: { ...(cached.value.summary || {}), cacheHit: true },
        };
        await this.auditQuery(dto, requestHash, startedAt, {
          cacheHit: true,
          success: true,
          resultCount: value.summary?.observations,
          stationCount: value.summary?.stations,
        });
        return value;
      }
      if (cached) this.queryCache.delete(requestHash);
      const value = await this.executeStructuredQuery(dto);
      if (this.queryCache.size >= this.queryCacheMaxEntries) {
        const oldest = this.queryCache.keys().next().value;
        if (oldest) this.queryCache.delete(oldest);
      }
      this.queryCache.set(requestHash, { expiresAt: Date.now() + this.queryCacheTtlMs, value });
      await this.auditQuery(dto, requestHash, startedAt, {
        cacheHit: false,
        success: true,
        resultCount: value.summary?.observations,
        stationCount: value.summary?.stations,
      });
      return value;
    } catch (error) {
      await this.auditQuery(dto, requestHash, startedAt, {
        cacheHit: false,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      this.activeQueries -= 1;
    }
  }

  private async executeStructuredQuery(dto: InternalClimateQueryDto) {
    const indicators = await Promise.all(
      dto.indicators.map(async (indicator) => {
        const concept = await this.ontology?.resolve(indicator, [
          ClimateOntologyConceptType.INDICATOR,
        ]);
        const metadata = concept?.metadata as Record<string, unknown> | undefined;
        return String(metadata?.indicatorCode || indicator).toUpperCase();
      }),
    );
    const unsupported = indicators.filter(
      (indicator) => !INDICATORS.some((candidate) => candidate.code === indicator),
    );
    if (unsupported.length) {
      throw new BadRequestException(`Unsupported climate indicator: ${unsupported.join(", ")}`);
    }
    if (dto.visualType === ClimateVisualType.SCATTER && indicators.length !== 2) {
      throw new BadRequestException("Climate scatter plots require exactly two indicators");
    }
    if (dto.visualType !== ClimateVisualType.SCATTER && indicators.length > 2) {
      throw new BadRequestException("At most two indicators can be shown in one visual");
    }

    const countries = await Promise.all(
      dto.locations.map(async (location) => {
        const fallback = COUNTRY_ALIASES[location.trim().toLowerCase()];
        if (fallback) return fallback;
        const concept = await this.ontology?.resolve(location, [ClimateOntologyConceptType.LOCATION]);
        const metadata = concept?.metadata as Record<string, unknown> | undefined;
        const code = metadata?.countryCode;
        return code && concept
          ? { code: String(code), name: concept.canonical_name }
          : undefined;
      }),
    );
    if (countries.some((country) => !country)) {
      const invalid = dto.locations.filter((_location, index) => !countries[index]);
      throw new BadRequestException(`Unsupported climate location: ${invalid.join(", ")}`);
    }
    const uniqueCountries = [
      ...new Map(countries.map((country) => [country!.code, country!])).values(),
    ];
    const stationIds = await Promise.all(
      (dto.stationIds || []).map(async (station) => {
        const concept = await this.ontology?.resolve(station, [ClimateOntologyConceptType.STATION]);
        const metadata = concept?.metadata as Record<string, unknown> | undefined;
        return String(metadata?.stationId || station);
      }),
    );
    if (!uniqueCountries.length && !stationIds.length) {
      throw new BadRequestException("At least one SAARC country or station is required");
    }

    const start = new Date(`${dto.startPeriod}-01T00:00:00.000Z`);
    const end = new Date(`${dto.endPeriod}-01T00:00:00.000Z`);
    if (start > end) throw new BadRequestException("startPeriod must not be after endPeriod");
    const monthSpan =
      (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      end.getUTCMonth() -
      start.getUTCMonth() +
      1;
    if (monthSpan > 600) throw new BadRequestException("Climate queries are limited to 50 years");
    const endExclusive = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 1));

    const dataset = await this.ensureReferenceData();
    const observations = (await this.prisma.climate_monthly_observations.findMany({
      where: {
        dataset_id: dataset.id,
        indicator_code: { in: indicators },
        period: { gte: start, lt: endExclusive },
        ...(stationIds.length
          ? { station_id: { in: stationIds } }
          : { station: { country_code: { in: uniqueCountries.map((country) => country.code) } } }),
        OR: [{ days_missing: null }, { days_missing: { lte: 5 } }],
      },
      select: {
        station_id: true,
        indicator_code: true,
        period: true,
        value: true,
        unit: true,
        station: {
          select: {
            id: true,
            name: true,
            country_code: true,
            country_name: true,
            latitude: true,
            longitude: true,
            elevation_m: true,
          },
        },
      },
      orderBy: [{ period: "asc" }, { station_id: "asc" }],
    })) as ClimateObservation[];

    const source = {
      sourceType: "dataset",
      datasetId: dataset.id,
      title: dataset.name,
      url: dataset.source_url,
      coverageStart: dto.startPeriod,
      coverageEnd: dto.endPeriod,
      synchronizedAt: dataset.last_synced_at?.toISOString() || null,
    };

    if (!observations.length) {
      return {
        answer: `NOAA GSOM has no eligible ${indicators.join(" and ")} observations for ${uniqueCountries.map((country) => country.name).join(", ") || "the selected stations"} in this period.`,
        visual: null,
        source,
        summary: { observations: 0, stations: 0, coverageWarning: "no_data" },
      };
    }

    let normalMap = new Map<string, number>();
    if (dto.anomaly) {
      const normals = await this.prisma.climate_normals.findMany({
        where: {
          station_id: { in: [...new Set(observations.map((item) => item.station_id))] },
          indicator_code: { in: indicators },
          baseline_start: 1991,
          baseline_end: 2020,
          valid_years: { gte: 24 },
        },
      });
      normalMap = new Map(
        normals.map((normal) => [
          `${normal.station_id}:${normal.indicator_code}:${normal.calendar_month}`,
          normal.value,
        ]),
      );
    }

    const prepared = observations.flatMap((item) => {
      if (!dto.anomaly) return [item];
      const normal = normalMap.get(
        `${item.station_id}:${item.indicator_code}:${item.period.getUTCMonth() + 1}`,
      );
      return normal === undefined ? [] : [{ ...item, value: item.value - normal }];
    });
    const stationPeriods = this.aggregateStationPeriods(prepared, dto.grain);
    const visual =
      dto.visualType === ClimateVisualType.SCATTER
        ? this.buildScatter(stationPeriods, indicators, dto, source)
        : dto.visualType === ClimateVisualType.STATION_MAP
          ? this.buildStationMap(stationPeriods, indicators[0], dto, source)
          : this.buildTimeSeries(stationPeriods, indicators, dto, source);

    const stationCount = new Set(prepared.map((item) => item.station_id)).size;
    const stale =
      !dataset.last_synced_at || Date.now() - dataset.last_synced_at.getTime() > 45 * 24 * 60 * 60 * 1000;
    const trendSummary =
      visual?.type === "climate_timeseries"
        ? visual.series.map((series: any) => ({
            series: series.name,
            perDecade: linearTrend(series.points),
            unit: visual.yAxis.unit,
          }))
        : [];
    const placeLabel = uniqueCountries.map((country) => country.name).join(", ") || "selected stations";
    const visualLabel = dto.visualType.replace("climate_", "").replace("station_", "station ");
    const trendText = trendSummary
      .filter((trend: any) => trend.perDecade !== null)
      .map((trend: any) => `${trend.series}: ${trend.perDecade} ${trend.unit} per decade`)
      .join("; ");
    const answer = [
      `NOAA GSOM returned ${prepared.length.toLocaleString()} eligible monthly observations from ${stationCount} stations for ${placeLabel}.`,
      `The ${visualLabel} uses ${dto.aggregation === "median_station" ? "the median among eligible stations" : "station-level values"}; it is not an area-weighted national estimate.`,
      trendText ? `Eligible-series trends: ${trendText}.` : "A trend is reported only when at least 20 time points are available.",
      stale ? "The dataset is stale or has not completed its first synchronization." : "The dataset is within the 45-day freshness window.",
    ].join(" ");

    return {
      answer,
      visual,
      source,
      summary: {
        observations: prepared.length,
        stations: stationCount,
        aggregation: dto.aggregation,
        baseline: dto.anomaly ? "1991-2020" : null,
        trends: trendSummary,
        stale,
      },
    };
  }

  private aggregateStationPeriods(observations: ClimateObservation[], grain: ClimateGrain) {
    const groups = new Map<string, ClimateObservation[]>();
    for (const item of observations) {
      const period = grain === ClimateGrain.YEAR ? String(item.period.getUTCFullYear()) : monthKey(item.period);
      const key = `${item.station_id}:${item.indicator_code}:${period}`;
      groups.set(key, [...(groups.get(key) || []), item]);
    }

    return [...groups.entries()].flatMap(([key, values]) => {
      const [stationId, indicatorCode, period] = key.split(":");
      if (grain === ClimateGrain.YEAR && new Set(values.map((item) => item.period.getUTCMonth())).size !== 12) {
        return [];
      }
      const value =
        indicatorCode === "PRCP" && grain === ClimateGrain.YEAR
          ? values.reduce((sum, item) => sum + item.value, 0)
          : values.reduce((sum, item) => sum + item.value * daysInMonth(item.period), 0) /
            values.reduce((sum, item) => sum + daysInMonth(item.period), 0);
      return [
        {
          stationId,
          indicatorCode,
          period,
          value,
          unit: values[0].unit,
          station: values[0].station,
        },
      ];
    });
  }

  private buildTimeSeries(
    values: ReturnType<ClimateDataService["aggregateStationPeriods"]>,
    indicators: string[],
    dto: InternalClimateQueryDto,
    _source: Record<string, unknown>,
  ) {
    const groups = new Map<string, typeof values>();
    for (const item of values) {
      const label = dto.stationIds?.length
        ? `${item.station.name} - ${item.indicatorCode}`
        : `${item.station.country_name} - ${item.indicatorCode}`;
      groups.set(label, [...(groups.get(label) || []), item]);
    }
    const series = [...groups.entries()].map(([name, items]) => {
      const periods = new Map<string, number[]>();
      for (const item of items) {
        periods.set(item.period, [...(periods.get(item.period) || []), item.value]);
      }
      return {
        name,
        sourceIndex: 1,
        points: [...periods.entries()]
          .map(([period, periodValues]) => ({
            period,
            value: rounded(median(periodValues) as number),
            coverage: periodValues.length,
          }))
          .sort((a, b) => a.period.localeCompare(b.period))
          .slice(0, 500),
      };
    });
    return {
      version: 2,
      type: "climate_timeseries" as const,
      title: `${dto.anomaly ? "1991-2020 anomaly" : "Observed climate"} (${dto.startPeriod} to ${dto.endPeriod})`,
      grain: dto.grain,
      yAxis: {
        label: indicators.join(" / "),
        unit: dto.anomaly && indicators[0] === "PRCP" ? "mm anomaly" : values[0]?.unit || "",
      },
      series,
    };
  }

  private buildScatter(
    values: ReturnType<ClimateDataService["aggregateStationPeriods"]>,
    indicators: string[],
    dto: InternalClimateQueryDto,
    _source: Record<string, unknown>,
  ) {
    const stationValues = new Map<string, Map<string, number[]>>();
    const stations = new Map<string, (typeof values)[number]["station"]>();
    for (const item of values) {
      const byIndicator = stationValues.get(item.stationId) || new Map<string, number[]>();
      byIndicator.set(item.indicatorCode, [...(byIndicator.get(item.indicatorCode) || []), item.value]);
      stationValues.set(item.stationId, byIndicator);
      stations.set(item.stationId, item.station);
    }
    const points = [...stationValues.entries()].flatMap(([stationId, byIndicator]) => {
      const xValues = byIndicator.get(indicators[0]);
      const yValues = byIndicator.get(indicators[1]);
      if (!xValues?.length || !yValues?.length) return [];
      const station = stations.get(stationId)!;
      return [
        {
          label: station.name,
          x: rounded(xValues.reduce((sum, value) => sum + value, 0) / xValues.length),
          y: rounded(yValues.reduce((sum, value) => sum + value, 0) / yValues.length),
          group: station.country_name,
          coverage: Math.min(xValues.length, yValues.length),
          sourceIndex: 1,
        },
      ];
    });
    if (points.length > dto.limit) {
      throw new BadRequestException(`Scatter result has ${points.length} stations; narrow the location or period`);
    }
    return {
      version: 2,
      type: "climate_scatter" as const,
      title: `${indicators[0]} compared with ${indicators[1]}`,
      xAxis: { label: indicators[0], unit: values.find((item) => item.indicatorCode === indicators[0])?.unit || "" },
      yAxis: { label: indicators[1], unit: values.find((item) => item.indicatorCode === indicators[1])?.unit || "" },
      points,
      correlation: correlation(points),
    };
  }

  private buildStationMap(
    values: ReturnType<ClimateDataService["aggregateStationPeriods"]>,
    indicator: string,
    dto: InternalClimateQueryDto,
    _source: Record<string, unknown>,
  ) {
    const groups = new Map<string, typeof values>();
    for (const item of values.filter((candidate) => candidate.indicatorCode === indicator)) {
      groups.set(item.stationId, [...(groups.get(item.stationId) || []), item]);
    }
    if (groups.size > dto.limit) {
      throw new BadRequestException(`Station map has ${groups.size} points; narrow the location or period`);
    }
    const points = [...groups.entries()].map(([stationId, items]) => ({
      stationId,
      name: items[0].station.name,
      country: items[0].station.country_name,
      longitude: items[0].station.longitude,
      latitude: items[0].station.latitude,
      value: rounded(items.reduce((sum, item) => sum + item.value, 0) / items.length),
      coverage: items.length,
      sourceIndex: 1,
    }));
    const pointValues = points.map((point) => point.value);
    return {
      version: 2,
      type: "station_map" as const,
      title: `${indicator} station observations (${dto.startPeriod} to ${dto.endPeriod})`,
      indicator,
      unit: values[0]?.unit || "",
      scale: {
        min: rounded(Math.min(...pointValues)),
        max: rounded(Math.max(...pointValues)),
      },
      points,
    };
  }
}
