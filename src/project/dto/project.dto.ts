import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
} from "class-validator";
import { ProjectStatus } from "@prisma/client";
import { Type } from "class-transformer";

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  overview: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bannerImageId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateProjectDto extends CreateProjectDto {}

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  duration?: string;

  @ApiProperty()
  overview: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ProjectStatus })
  status: ProjectStatus;

  @ApiPropertyOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional()
  bannerImageId?: string;

  @ApiProperty()
  isDraft: boolean;

  @ApiPropertyOptional()
  tags?: any[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProjectSearchInput {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;
  
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDraft?: boolean;
}
