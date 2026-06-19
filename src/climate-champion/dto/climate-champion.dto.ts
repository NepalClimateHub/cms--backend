import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { Expose, Type } from "class-transformer";

export class CreateClimateChampionDto {
  @ApiProperty({ description: "Full name of the Climate Champion" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: "Email address of the champion" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: "Location of the champion (e.g. Kathmandu, Nepal)" })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: "Biography of the champion" })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: "Profile photo URL" })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: "Profile photo asset ID" })
  @IsString()
  @IsOptional()
  photoId?: string;

  @ApiPropertyOptional({ description: "Causes/tags related to the champion", type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: "Website URL" })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: "Facebook profile URL" })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ description: "Instagram profile URL" })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ description: "LinkedIn profile URL" })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({ description: "Is active status", default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Order index for sorting", default: 0 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  order?: number;
}

export class UpdateClimateChampionDto extends CreateClimateChampionDto {}

export class ClimateChampionResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  email?: string;

  @ApiPropertyOptional()
  @Expose()
  location?: string;

  @ApiPropertyOptional()
  @Expose()
  bio?: string;

  @ApiPropertyOptional()
  @Expose()
  photoUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  photoId?: string;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  tags: string[];

  @ApiPropertyOptional()
  @Expose()
  website?: string;

  @ApiPropertyOptional()
  @Expose()
  facebook?: string;

  @ApiPropertyOptional()
  @Expose()
  instagram?: string;

  @ApiPropertyOptional()
  @Expose()
  linkedin?: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  order: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class ClimateChampionSearchInput extends PaginationParamsDto {
  @ApiPropertyOptional({ description: "Search by name or email" })
  @IsString()
  @IsOptional()
  search?: string;
}

export class ChampionOrderItem {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  order: number;
}

export class ReorderChampionsDto {
  @ApiProperty({ type: [ChampionOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChampionOrderItem)
  orders: ChampionOrderItem[];
}
