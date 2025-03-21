import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";

export class OrganizationSearchInput extends PaginationParamsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}

export class CreateOrganizationDto {
  @ApiProperty({
    description: "Organization name",
    example: "Tech Innovations Inc.",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Organization description",
    example: "A leading technology company",
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: "Organization email",
    example: "contact@techinnovations.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Phone country code",
    required: false,
    example: "+1",
  })
  phoneCountryCode?: string;

  @ApiProperty({
    description: "Phone number",
    required: false,
    example: "5551234567",
  })
  phoneNumber?: string;

  @ApiProperty({ description: "Address ID", required: false })
  addressId?: string;

  @ApiProperty({ description: "Socials ID", required: false })
  socialsId?: string;

  @ApiProperty({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
  })
  bannerImageUrl: string;

  @ApiProperty({ description: "Banner image ID", required: false })
  bannerImageId?: string;

  @ApiProperty({
    description: "Logo image URL",
    example: "https://example.com/org-logo.jpg",
  })
  logoImageUrl: string;

  @ApiProperty({ description: "Logo image ID", required: false })
  logoImageId?: string;

  @ApiProperty({ description: "Tags IDs", type: [String], required: false })
  tagIds?: string[];
}

export class UpdateOrganizationDto extends CreateOrganizationDto {}

export class OrganizationResponseDto extends CreateOrganizationDto {
  @ApiProperty({ description: "Organization ID" })
  id: string;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;

  @ApiProperty({ description: "Deletion timestamp", required: false })
  deletedAt?: Date;
}
