import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";

export class TagSearchInput extends PaginationParamsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isUserTag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isOrganizationTag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isEventTag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isNewsTag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isOpportunityTag?: boolean;
}

export class AddTagDto {
  @ApiProperty({
    description: "The name of the tag",
    example: "Tech",
    required: true,
  })
  @IsString()
  tag: string;

  @ApiProperty({
    description: "Indicates if this is a user tag",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isUserTag?: boolean;

  @ApiProperty({
    description: "Indicates if this is an organization tag",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isOrganizationTag?: boolean;

  @ApiProperty({
    description: "Indicates if this is an event tag",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEventTag?: boolean;

  @ApiProperty({
    description: "Indicates if this is a news tag",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isNewsTag?: boolean;

  @ApiProperty({
    description: "Indicates if this is an opportunity tag",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isOpportunityTag?: boolean;
}
