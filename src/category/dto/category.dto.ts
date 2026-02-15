
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';

export enum CategoryType {
  BLOG = 'BLOG',
  NEWS = 'NEWS',
  EVENTS = 'EVENTS',
  OPPORTUNITY = 'OPPORTUNITY',
  PROJECT = 'PROJECT',
  RESOURCE = 'RESOURCE',
  ORGANIZATION = 'ORGANIZATION'
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tech News' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Latest news about technology' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.NEWS })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategorySearchInput extends PaginationParamsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}

export class CategoryResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiProperty({ enum: CategoryType })
  @Expose()
  type: CategoryType;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
