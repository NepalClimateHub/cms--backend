import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsObject, IsArray } from "class-validator";

export class CreateDocumentDto {
  @ApiProperty({ example: "Climate Change Report 2024" })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "https://example.com/report.pdf" })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  totalPages?: number;

  @ApiPropertyOptional({ example: "application/pdf" })
  @IsString()
  @IsOptional()
  mediaType?: string;
}
