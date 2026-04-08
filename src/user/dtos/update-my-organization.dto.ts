import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateMyOrganizationInput {
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
