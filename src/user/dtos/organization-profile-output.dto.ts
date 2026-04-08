import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class OrganizationProfileOutputDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  logoImageUrl: string;

  @Expose()
  @ApiPropertyOptional()
  logoImageId: string | null;

  @Expose()
  @ApiProperty()
  isVerifiedByAdmin: boolean;

  @Expose()
  @ApiPropertyOptional()
  verificationDocumentUrl: string | null;

  @Expose()
  @ApiPropertyOptional()
  verificationDocumentId: string | null;

  @Expose()
  @ApiPropertyOptional()
  verificationRequestRemarks: string | null;

  @Expose()
  @ApiPropertyOptional()
  verificationRequestedAt: Date | null;
}
