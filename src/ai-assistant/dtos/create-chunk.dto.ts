import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsObject, IsArray, IsUUID } from "class-validator";

export class CreateChunkDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  documentId: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  chunkIndex: number;

  @ApiProperty({ example: "Climate change is a pressing global issue..." })
  @IsString()
  text: string;

  @ApiProperty({ example: [0.1, 0.2, 0.3], description: "Embedding vector" })
  @IsArray()
  vector: number[];

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  pageStart?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  pageEnd?: number;

  @ApiPropertyOptional({ example: { section: "Introduction" } })
  @IsObject()
  @IsOptional()
  meta?: Record<string, any>;

  @ApiPropertyOptional({ example: "nch_assistant_index" })
  @IsString()
  @IsOptional()
  collection?: string;

  @ApiPropertyOptional({ example: "intfloat/multilingual-e5-base" })
  @IsString()
  @IsOptional()
  embedModel?: string;
}
