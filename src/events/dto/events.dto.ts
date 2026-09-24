import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { ContentStatus, EventStatus, PublicationStatus } from "@prisma/client";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { AddressInput, AddressResponse } from "../../shared/dtos/address.dto";
import { Expose, Type } from "class-transformer";
import { TagOutputDto } from "../../tags/dto/tags-output.dto";
import { GalleryInput, GalleryResponse } from "../../shared/dtos/gallery.dto";

export class EventsSearchInput extends PaginationParamsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tagIds?: string[];

  @ApiPropertyOptional({
    description: "Event operational status (OPEN, UPCOMING, CLOSED)",
    enum: EventStatus,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: "Publication status (DRAFT, PUBLISHED)",
    enum: PublicationStatus,
  })
  @IsOptional()
  @IsEnum(PublicationStatus)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  moderationStatus?: ContentStatus;
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
  @IsOptional()
  location?: string;

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
    nullable: true,
  })
  @IsOptional()
  @IsString()
  registrationDeadline?: string | null;

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
    description: "Event operational status (OPEN, UPCOMING, CLOSED)",
    enum: EventStatus,
    required: false,
    example: EventStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: "Publication status (DRAFT, PUBLISHED)",
    enum: PublicationStatus,
    required: false,
    example: PublicationStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PublicationStatus)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional({
    description: "Legacy draft status flag (true = DRAFT, false = PUBLISHED)",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({
    description: "moderation status",
    enum: ContentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  moderationStatus?: ContentStatus;

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

  @ApiPropertyOptional({
    description: "website",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: "Object of Socials ", required: false })
  @IsOptional()
  socials?: any;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
    required: false,
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
  title?: string;

  @ApiProperty({
    description: "organizer",
  })
  @IsString()
  @IsOptional()
  organizer?: string;

  @ApiProperty({
    description: "Event description",
    example: "A leading technology company",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "location",
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: "location type",
  })
  @IsString()
  @IsOptional()
  locationType?: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: "event type",
  })
  @IsString()
  @IsOptional()
  format?: string;

  @ApiPropertyOptional({
    description: "website",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

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
    nullable: true,
  })
  @IsOptional()
  @IsString()
  registrationDeadline?: string | null;

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
    description: "Event operational status (OPEN, UPCOMING, CLOSED)",
    enum: EventStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: "moderation status",
    enum: ContentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  moderationStatus?: ContentStatus;

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

  @ApiPropertyOptional({
    description: "Tags IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({
    description: "Publication status (DRAFT, PUBLISHED)",
    enum: PublicationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PublicationStatus)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional({
    description: "Legacy draft status flag (true = DRAFT, false = PUBLISHED)",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

export class EventResponseDto {
  @ApiProperty({
    description: "Event id",
    example: "abcd",
  })
  @IsString()
  @Expose()
  id: string;

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
    description: "event website",
  })
  @IsUrl()
  @Expose()
  website: string;

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

  @ApiProperty({
    description: "Event operational status",
    enum: EventStatus,
  })
  @Expose()
  status: EventStatus;

  @ApiPropertyOptional({
    description: "moderation status",
    enum: ContentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  @Expose()
  moderationStatus?: ContentStatus;

  @ApiPropertyOptional({
    description: "cost",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  cost?: string;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/org-banner.jpg",
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  bannerImageUrl?: string;

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

  @ApiProperty({
    description: "Publication status",
    enum: PublicationStatus,
  })
  @Expose()
  publicationStatus: PublicationStatus;

  @ApiProperty({ description: "Legacy draft status" })
  @Expose()
  get isDraft(): boolean {
    return this.publicationStatus === PublicationStatus.DRAFT;
  }
}
