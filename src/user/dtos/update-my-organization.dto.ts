import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { UpdateOrganizationAddressInput } from "./update-organization-address-input.dto";

export class UpdateMyOrganizationInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  description?: string;

  @ApiPropertyOptional({ description: "E.g. NGO, network, private sector" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  organizationType?: string | null;

  @ApiPropertyOptional({ type: UpdateOrganizationAddressInput })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateOrganizationAddressInput)
  address?: UpdateOrganizationAddressInput;

  @ApiPropertyOptional({
    description: "Organization logo URL (ImageKit or CDN)",
  })
  @IsOptional()
  @IsString()
  logoImageUrl?: string;

  @ApiPropertyOptional({ description: "Organization logo file id" })
  @IsOptional()
  @IsString()
  logoImageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerImageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  socials?: any;

  @ApiPropertyOptional({
    description: "Verification document image URL for admins to review",
  })
  @IsOptional()
  @IsString()
  verificationDocumentUrl?: string;

  @ApiPropertyOptional({ description: "Verification document file id" })
  @IsOptional()
  @IsString()
  verificationDocumentId?: string;

  @ApiPropertyOptional({
    description: "Message to admins with the verification request",
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  verificationRequestRemarks?: string;
}
