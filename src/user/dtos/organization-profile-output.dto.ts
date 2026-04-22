import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { AddressOutputDto } from "./address-output.dto";

export class OrganizationProfileOutputDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiPropertyOptional({ description: "Public category, e.g. NGO, private sector" })
  organizationType?: string | null;

  @Expose()
  @ApiPropertyOptional({ type: AddressOutputDto, nullable: true })
  @Type(() => AddressOutputDto)
  address: AddressOutputDto | null;

  @Expose()
  @ApiProperty()
  logoImageUrl: string;

  @Expose()
  @ApiPropertyOptional()
  logoImageId: string | null;

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
