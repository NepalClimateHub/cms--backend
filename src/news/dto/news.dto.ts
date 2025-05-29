import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { Expose } from "class-transformer";
import { TagOutputDto } from "../../tags/dto/tags-output.dto";

export class NewsSearchInput extends PaginationParamsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tagIds?: string[];
}

export class CreateNewsDto {
  @ApiProperty({
    description: "News title",
    example: "New Technology Breakthrough",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "News source",
    example: "Tech News Portal",
  })
  @IsString()
  source: string;

  @ApiProperty({
    description: "News mode",
    example: "Online",
  })
  @IsString()
  mode: string;

  @ApiProperty({
    description: "Published date",
    example: "2025-04-15T00:00:00.000Z",
  })
  @IsDateString()
  publishedDate: Date;

  @ApiProperty({
    description: "News link",
    example: "https://example.com/news-article",
  })
  @IsUrl()
  newsLink: string;

  @ApiProperty({
    description: "Banner image URL",
    example: "https://example.com/news-banner.jpg",
  })
  @IsString()
  bannerImageUrl: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  bannerImageId?: string;

  @ApiPropertyOptional({
    description: "Tags IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateNewsDto {
  @ApiProperty({
    description: "News title",
    example: "New Technology Breakthrough",
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: "News source",
    example: "Tech News Portal",
  })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({
    description: "News mode",
    example: "Online",
  })
  @IsString()
  @IsOptional()
  mode?: string;

  @ApiPropertyOptional({
    description: "Published date",
  })
  @IsOptional()
  publishedDate?: Date;

  @ApiPropertyOptional({
    description: "Published year",
  })
  @IsOptional()
  publishedYear?: Date;

  @ApiProperty({
    description: "News link",
    example: "https://example.com/news-article",
  })
  @IsString()
  @IsOptional()
  newsLink?: string;

  @ApiProperty({
    description: "Banner image URL",
    example: "https://example.com/news-banner.jpg",
  })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  bannerImageId?: string;

  @ApiPropertyOptional({
    description: "Tags IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({
    description: "isDraft",
    example: "true",
  })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}

export class NewsResponseDto {
  @ApiProperty({
    description: "News ID",
    example: "clgf7xhig0000qof3m53ibdz1",
  })
  @IsString()
  @Expose()
  id: string;

  @ApiProperty({
    description: "News title",
    example: "New Technology Breakthrough",
  })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({
    description: "News source",
    example: "Tech News Portal",
  })
  @IsString()
  @Expose()
  source: string;

  @ApiProperty({
    description: "News mode",
    example: "Online",
  })
  @IsString()
  @Expose()
  mode: string;

  @ApiProperty({
    description: "Published date",
  })
  @Expose()
  publishedDate: Date;

  @ApiProperty({
    description: "Published year",
  })
  @Expose()
  publishedYear: Date;

  @ApiProperty({
    description: "News link",
    example: "https://example.com/news-article",
  })
  @IsString()
  @Expose()
  newsLink: string;

  @ApiProperty({
    description: "Banner image URL",
    example: "https://example.com/news-banner.jpg",
  })
  @IsString()
  @Expose()
  bannerImageUrl: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  bannerImageId?: string;

  @ApiProperty({ description: "Tags IDs", type: [String], required: false })
  @Expose()
  tags?: TagOutputDto[];

  @ApiProperty({
    description: "Contributed by",
    example: "admin",
  })
  @IsString()
  @Expose()
  contributedBy: string;

  @ApiProperty({
    description: "Created at",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Updated at",
  })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Deleted at",
  })
  @IsOptional()
  @Expose()
  deletedAt?: Date;

  @ApiProperty({
    description: "isDraft",
  })
  @IsOptional()
  @Expose()
  isDraft?: boolean;
}
