import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsInt,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { ClimateIngestionMode, ClimateIngestionStatus } from "@prisma/client";

const INDICATORS = ["TAVG", "TMIN", "TMAX", "PRCP"] as const;

export class ClimateSyncDto {
  @IsEnum(ClimateIngestionMode)
  mode: ClimateIngestionMode = ClimateIngestionMode.INCREMENTAL;
}

export class ClimateClientMetricDto {
  @IsString()
  @IsIn(["map_fallback"])
  event: "map_fallback";
}

export class InternalClimateStationDto {
  @IsString()
  @Matches(/^[A-Z0-9-]{5,32}$/)
  id: string;

  @IsString()
  name: string;

  @IsString()
  @Matches(/^[A-Z]{2,3}$/)
  countryCode: string;

  @IsString()
  countryName: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  elevationM?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class InternalClimateObservationDto {
  @IsString()
  @Matches(/^[A-Z0-9-]{5,32}$/)
  stationId: string;

  @IsString()
  @Matches(/^(TAVG|TMIN|TMAX|PRCP)$/)
  indicatorCode: (typeof INDICATORS)[number];

  @IsISO8601({ strict: true })
  period: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  value: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  daysMissing?: number;

  @IsOptional()
  @IsString()
  qualityFlag?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}

export class InternalClimateManifestDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/)
  checksum: string;

  @IsString()
  archivePath: string;

  @IsString()
  requestUrl: string;

  @IsInt()
  @Min(0)
  responseBytes: number;

  @IsInt()
  @Min(0)
  rowCount: number;
}

export class InternalClimateBatchDto {
  @IsUUID()
  runId: string;

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => InternalClimateStationDto)
  stations: InternalClimateStationDto[];

  @IsArray()
  @ArrayMaxSize(2000)
  @ValidateNested({ each: true })
  @Type(() => InternalClimateObservationDto)
  observations: InternalClimateObservationDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => InternalClimateManifestDto)
  manifest?: InternalClimateManifestDto;
}

export class InternalClimateRunUpdateDto {
  @IsEnum(ClimateIngestionStatus)
  status: ClimateIngestionStatus;

  @IsString()
  stage: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  failedBatches?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export enum ClimateGrain {
  MONTH = "month",
  YEAR = "year",
}

export enum ClimateAggregation {
  MEDIAN_STATION = "median_station",
  STATION = "station",
}

export enum ClimateVisualType {
  TIMESERIES = "climate_timeseries",
  SCATTER = "climate_scatter",
  STATION_MAP = "station_map",
}

export class InternalClimateQueryDto {
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  locations: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  stationIds?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  indicators: string[];

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  startPeriod: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  endPeriod: string;

  @IsEnum(ClimateGrain)
  grain: ClimateGrain;

  @IsEnum(ClimateAggregation)
  aggregation: ClimateAggregation;

  @IsOptional()
  @IsString()
  comparison?: string;

  @IsEnum(ClimateVisualType)
  visualType: ClimateVisualType;

  @IsOptional()
  @IsBoolean()
  anomaly?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  limit = 500;
}
