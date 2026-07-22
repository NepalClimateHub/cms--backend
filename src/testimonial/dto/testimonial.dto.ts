import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { Expose, Type } from "class-transformer";

export class CreateTestimonialDto {
  @ApiProperty({ description: "Name of the person giving the testimonial" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: "Photo URL of the person" })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: "Photo asset ID" })
  @IsString()
  @IsOptional()
  photoId?: string;

  @ApiProperty({ description: "Testimonial description / content" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Rating in stars (1 to 5)", default: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  stars: number;

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

export class UpdateTestimonialDto extends CreateTestimonialDto { }

export class TestimonialResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  photoUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  photoId?: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  stars: number;

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

export class TestimonialSearchInput extends PaginationParamsDto {
  @ApiPropertyOptional({ description: "Search by name or description" })
  @IsString()
  @IsOptional()
  search?: string;
}

export class TestimonialOrderItem {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  order: number;
}

export class ReorderTestimonialsDto {
  @ApiProperty({ type: [TestimonialOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialOrderItem)
  orders: TestimonialOrderItem[];
}
