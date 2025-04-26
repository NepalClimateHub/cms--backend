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

export class EventsSearchInput extends PaginationParamsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tagIds: string[];
}

export class CreateEventDto {
  @ApiProperty({
    description: "Event name",
    example: "Tech Innovations",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "organizer",
  })
  @IsString()
  organizer: string;

  @ApiProperty({
    description: "Event description",
    example: "A leading technology company",
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: "location",
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: "location type",
  })
  @IsString()
  locationType: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  format: string;

  @ApiProperty({
    description: "Contributed by",
  })
  @IsString()
  contributedBy: string;

  @ApiPropertyOptional({
    description: "date",
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "date",
    required: false,
  })
  @IsOptional()
  @IsString()
  registrationDeadline?: string;

  @ApiPropertyOptional({
    description: "link",
    required: false,
  })
  @IsOptional()
  @IsString()
  registrationLink?: string;

  @ApiPropertyOptional({
    description: "email contact",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: "status",
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "cost",
    required: false,
  })
  @IsOptional()
  @IsString()
  cost?: string;

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

  @ApiProperty({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
  })
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  bannerImageId?: string;

  @ApiPropertyOptional({
    description: "Tags IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateEventDto {
  @ApiProperty({
    description: "Event name",
    example: "Tech Innovations",
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({
    description: "organizer",
  })
  @IsString()
  @IsOptional()
  organizer: string;

  @ApiProperty({
    description: "Event description",
    example: "A leading technology company",
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: "location",
  })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({
    description: "location type",
  })
  @IsString()
  @IsOptional()
  locationType: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  @IsOptional()
  format: string;

  @ApiProperty({
    description: "Contributed by",
  })
  @IsString()
  @IsOptional()
  contributedBy: string;

  @ApiPropertyOptional({
    description: "date",
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "date",
    required: false,
  })
  @IsOptional()
  @IsString()
  registrationDeadline?: string;

  @ApiPropertyOptional({
    description: "link",
    required: false,
  })
  @IsOptional()
  @IsString()
  registrationLink?: string;

  @ApiPropertyOptional({
    description: "email contact",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: "status",
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "cost",
    required: false,
  })
  @IsOptional()
  @IsString()
  cost?: string;

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

  @ApiProperty({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
  })
  @IsString()
  bannerImageUrl: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  bannerImageId?: string;

  @ApiPropertyOptional({
    description: "Tags IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  tagIds?: string[];
}

export class EventResponseDto {
  @ApiProperty({
    description: "Event name",
    example: "Tech Innovations",
  })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({
    description: "organizer",
  })
  @IsString()
  @Expose()
  organizer: string;

  @ApiProperty({
    description: "Event description",
    example: "A leading technology company",
  })
  @IsString()
  @Expose()
  description: string;

  @ApiProperty({
    description: "location",
  })
  @IsString()
  @Expose()
  location: string;

  @ApiProperty({
    description: "location type",
  })
  @IsString()
  @Expose()
  locationType: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  @Expose()
  type: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  @Expose()
  format: string;

  @ApiProperty({
    description: "Contributed by",
  })
  @IsString()
  @Expose()
  contributedBy: string;

  @ApiPropertyOptional({
    description: "date",
    required: false,
  })
  @IsString()
  @Expose()
  startDate?: string;

  @ApiPropertyOptional({
    description: "date",
    required: false,
  })
  @IsString()
  @Expose()
  registrationDeadline?: string;

  @ApiPropertyOptional({
    description: "link",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  registrationLink?: string;

  @ApiPropertyOptional({
    description: "email contact",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @Expose()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: "status",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  status?: string;

  @ApiPropertyOptional({
    description: "cost",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  cost?: string;

  @ApiProperty({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
  })
  @IsString()
  @Expose()
  bannerImageUrl: string;

  @ApiPropertyOptional({ description: "Banner image ID", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  bannerImageId?: string;

  @ApiPropertyOptional({
    description: "Address",
    required: false,
    example: "5551234567",
  })
  @Expose()
  address?: AddressResponse;

  @ApiPropertyOptional({ description: "Object of Socials ", required: false })
  @IsOptional()
  @Expose()
  socials?: any;

  @ApiProperty({ description: "Tags IDs", type: [String], required: false })
  @Expose()
  tags?: TagOutputDto[];

  @ApiProperty({ description: "Gallery", required: false })
  @Expose()
  eventGallery: GalleryResponse[];
}
