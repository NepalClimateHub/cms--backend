import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class AddressInput {
  @ApiPropertyOptional({
    description: "Street",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({
    description: "Country",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "City",
    required: false,
    example: "5551234567",
  })
  city?: string;

  @ApiPropertyOptional({
    description: "State",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: "Postcode",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  @IsString()
  postcode?: string;
}

export class AddressResponse {
  @ApiPropertyOptional({
    description: "Street",
    required: false,
    example: "5551234567",
  })
  @Expose()
  street?: string;

  @ApiPropertyOptional({
    description: "Street",
    required: false,
    example: "5551234567",
  })
  @Expose()
  country?: string;

  @ApiPropertyOptional({
    description: "Street",
    required: false,
    example: "5551234567",
  })
  city?: string;

  @ApiPropertyOptional({
    description: "Street",
    required: false,
    example: "5551234567",
  })
  @Expose()
  state?: string;

  @ApiPropertyOptional({
    description: "Street",
    required: false,
    example: "5551234567",
  })
  @Expose()
  postcode?: string;
}
