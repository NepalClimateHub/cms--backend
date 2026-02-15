import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { Expose, Type } from "class-transformer";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { TagOutputDto } from "../../tags/dto/tags-output.dto";

export enum ResourceType {
  DOCUMENTARY = "DOCUMENTARY",
  PODCASTS_AND_TELEVISION = "PODCASTS_AND_TELEVISION",
  COURSES = "COURSES",
  PLANS_AND_POLICIES = "PLANS_AND_POLICIES",
  DATA_RESOURCES = "DATA_RESOURCES",
  PLATFORMS = "PLATFORMS",
  RESEARCH_ARTICLES = "RESEARCH_ARTICLES",
  THESES_AND_DISSERTATIONS = "THESES_AND_DISSERTATIONS",
  CASE_STUDIES = "CASE_STUDIES",
  REPORTS = "REPORTS",
  TOOLKITS_AND_GUIDES = "TOOLKITS_AND_GUIDES",
}

export enum ResourceLevel {
  INTERNATIONAL = "INTERNATIONAL",
  REGIONAL = "REGIONAL",
  NATIONAL = "NATIONAL",
  PROVINCIAL = "PROVINCIAL",
  LOCAL = "LOCAL",
}

export class ResourceSearchInput extends PaginationParamsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, enum: ResourceType })
  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @ApiProperty({ required: false, enum: ResourceLevel })
  @IsEnum(ResourceLevel)
  @IsOptional()
  level?: ResourceLevel;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tagIds?: string[];
  
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

export class CreateResourceDto {
  @ApiProperty({
    description: "Resource title",
    example: "Climate Change Documentary",
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: "Resource overview/description",
    example: "A comprehensive documentary about climate change...",
  })
  @IsString()
  @IsOptional()
  overview?: string;

  @ApiProperty({
    description: "Resource type",
    enum: ResourceType,
    example: ResourceType.DOCUMENTARY,
  })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiPropertyOptional({
    description: "Resource level",
    enum: ResourceLevel,
    example: ResourceLevel.NATIONAL,
  })
  @IsEnum(ResourceLevel)
  @IsOptional()
  level?: ResourceLevel;

  @ApiPropertyOptional({
    description: "Link/Source/Website",
    example: "https://example.com/resource",
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({
    description: "Course provider",
    example: "Coursera",
  })
  @IsString()
  @IsOptional()
  courseProvider?: string;

  @ApiPropertyOptional({
    description: "Course platform",
    example: "Online",
  })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({
    description: "Course duration",
    example: "4 weeks",
  })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional({
    description: "Author",
    example: "John Doe",
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({
    description: "Publication Year",
    example: "2023",
  })
  @IsString()
  @IsOptional()
  publicationYear?: string;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/image.jpg",
  })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional({
    description: "Banner image ID",
    example: "img_123",
  })
  @IsString()
  @IsOptional()
  bannerImageId?: string;
  
  @ApiPropertyOptional({
    description: "Is draft",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiPropertyOptional({
    description: "Tags IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateResourceDto extends CreateResourceDto {}

export class ResourceResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  overview?: string;

  @ApiProperty({ enum: ResourceType })
  @Expose()
  type: ResourceType;

  @ApiPropertyOptional({ enum: ResourceLevel })
  @Expose()
  level?: ResourceLevel;

  @ApiPropertyOptional()
  @Expose()
  link?: string;

  @ApiPropertyOptional()
  @Expose()
  courseProvider?: string;

  @ApiPropertyOptional()
  @Expose()
  platform?: string;

  @ApiPropertyOptional()
  @Expose()
  duration?: string;

  @ApiPropertyOptional()
  @Expose()
  author?: string;

  @ApiPropertyOptional()
  @Expose()
  publicationYear?: string;

  @ApiPropertyOptional()
  @Expose()
  bannerImageUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  bannerImageId?: string;
  
  @ApiProperty()
  @Expose()
  isDraft: boolean;

  @ApiProperty({ description: "Tags", type: [TagOutputDto], required: false })
  @Expose()
  tags?: TagOutputDto[];
  
  @ApiProperty()
  @Expose()
  createdAt: Date;
  
  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
