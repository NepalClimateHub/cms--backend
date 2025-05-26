import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { AddressInput, AddressResponse } from "../../shared/dtos/address.dto";
import { Expose, Type } from "class-transformer";
import { TagOutputDto } from "../../tags/dto/tags-output.dto";
import { GalleryInput, GalleryResponse } from "../../shared/dtos/gallery.dto";

export class OrganizationSearchInput extends PaginationParamsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  tagIds: string[];
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

  @ApiPropertyOptional({
    description: "Phone country code",
    required: false,
    example: "+1",
  })
  @IsOptional()
  @IsString()
  phoneCountryCode?: string;

  @ApiPropertyOptional({
    description: "Phone number",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "Address",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  address?: AddressInput;

  @ApiPropertyOptional({
    description: "Gallery iamges",
    required: false,
    example: "5551234567",
  })
  @ValidateNested({ each: true })
  @Type(() => GalleryInput)
  @IsArray()
  @IsOptional()
  gallery?: GalleryInput[];

  @ApiPropertyOptional({ description: "Object of Socials ", required: false })
  @IsOptional()
  socials?: any;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
    required: false,
  })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  bannerImageId?: string;

  @ApiProperty({
    description: "Logo image URL",
    example: "https://example.com/org-logo.jpg",
  })
  @IsString()
  logoImageUrl: string;

  @ApiPropertyOptional({ description: "Logo image ID", required: false })
  @IsString()
  @IsOptional()
  logoImageId?: string;

  @ApiPropertyOptional({
    description: "Tags IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateOrganizationDto {
  @ApiProperty({
    description: "Organization name",
    example: "Tech Innovations Inc.",
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: "Organization description",
    example: "A leading technology company",
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: "Organization email",
    example: "contact@techinnovations.com",
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({
    description: "Phone country code",
    required: false,
    example: "+1",
  })
  @IsOptional()
  @IsString()
  phoneCountryCode?: string;

  @ApiPropertyOptional({
    description: "Phone number",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "Address",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  address?: AddressInput;

  @ApiPropertyOptional({
    description: "Gallery iamges",
    required: false,
    example: "5551234567",
  })
  @ValidateNested({ each: true })
  @Type(() => GalleryInput)
  @IsArray()
  @IsOptional()
  gallery?: GalleryInput[];

  @ApiProperty({ description: "Object of Socials ", required: false })
  @IsOptional()
  socials?: any;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
    required: false,
  })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  bannerImageId?: string;

  @ApiProperty({
    description: "Logo image URL",
    example: "https://example.com/org-logo.jpg",
  })
  @IsString()
  @IsOptional()
  logoImageUrl: string;

  @ApiProperty({ description: "Logo image ID", required: false })
  @IsString()
  @IsOptional()
  logoImageId?: string;

  @ApiProperty({ description: "Tags IDs", type: [String], required: false })
  @IsOptional()
  tagIds?: string[];
}

export class OrganizationResponseDto {
  @ApiProperty({
    description: "Organization id",
    example: "asdasd",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Organization name",
    example: "Tech Innovations Inc.",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "Organization description",
    example: "A leading technology company",
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: "Organization email",
    example: "contact@techinnovations.com",
  })
  @Expose()
  email: string;

  @ApiPropertyOptional({
    description: "Phone country code",
    required: false,
    example: "+1",
  })
  @Expose()
  phoneCountryCode?: string;

  @ApiPropertyOptional({
    description: "Phone number",
    required: false,
    example: "5551234567",
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "Address",
    required: false,
    example: "5551234567",
  })
  @Expose()
  address?: AddressResponse;

  @ApiProperty({ description: "Object of Socials ", required: false })
  @Expose()
  socials?: any;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
    required: false,
  })
  @IsOptional()
  @Expose()
  bannerImageUrl?: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsOptional()
  @Expose()
  bannerImageId?: string;

  @ApiProperty({
    description: "Logo image URL",
    example: "https://example.com/org-logo.jpg",
  })
  @Expose()
  logoImageUrl: string;

  @ApiProperty({ description: "Logo image ID", required: false })
  @Expose()
  logoImageId?: string;

  @ApiProperty({ description: "Tags IDs", type: [String], required: false })
  @Expose()
  tags?: TagOutputDto[];

  @ApiProperty({ description: "Gallery", required: false })
  @Expose()
  organizationGallery: GalleryResponse[];
}
