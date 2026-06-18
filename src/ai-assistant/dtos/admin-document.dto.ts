import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AiDocumentStatus, AiIndexJobStatus } from "@prisma/client";

export class AdminDocumentUploadDto {
  @ApiPropertyOptional({ description: "Display title; defaults to the original filename" })
  @IsOptional()
  @IsString()
  title?: string;
}

export class AdminDocumentSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AiDocumentStatus)
  status?: AiDocumentStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number(value))
  limit = 20;
}

export class InternalChunkDto {
  @IsUUID()
  id: string;

  @IsInt()
  chunkIndex: number;

  @IsString()
  faissId: string;

  @IsString()
  text: string;

  @IsArray()
  vector: number[];

  @IsOptional()
  @IsInt()
  pageStart?: number;

  @IsOptional()
  @IsInt()
  pageEnd?: number;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  collection?: string;

  @IsOptional()
  @IsString()
  embedModel?: string;
}

export class InternalIndexJobUpdateDto {
  @IsEnum(AiIndexJobStatus)
  status: AiIndexJobStatus;

  @IsString()
  stage: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalPages?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InternalChunkDto)
  chunks?: InternalChunkDto[];
}

export class InternalImportDocumentDto {
  @IsString()
  title: string;

  @IsString()
  originalFilename: string;

  @IsString()
  checksum: string;

  @IsInt()
  @Min(1)
  fileSize: number;
}
