import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { Expose, Type } from "class-transformer";
import { TagOutputDto } from "../../tags/dto/tags-output.dto";

export class AuthorOutputDto {
  @ApiProperty({
    description: "Author ID",
    example: "clgf7xhig0000qof3m53ibdz1",
  })
  @IsString()
  @Expose()
  id: string;

  @ApiProperty({
    description: "Author full name",
    example: "John Doe",
  })
  @IsString()
  @Expose()
  fullName: string;

  @ApiProperty({
    description: "Author email",
    example: "john.doe@example.com",
  })
  @IsString()
  @Expose()
  email: string;

  @ApiPropertyOptional({
    description: "Author bio",
    example: "Climate scientist and researcher",
  })
  @IsString()
  @IsOptional()
  @Expose()
  bio?: string;

  @ApiPropertyOptional({
    description: "Author profile photo URL",
    example: "https://example.com/profile.jpg",
  })
  @IsString()
  @IsOptional()
  @Expose()
  profilePhotoUrl?: string;
}

export class BlogSearchInput extends PaginationParamsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class CreateBlogDto {
  @ApiProperty({
    description: "Blog title",
    example: "Climate Change Impact on Nepal",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Blog content",
    example: "This is the main content of the blog post...",
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: "Blog excerpt",
    example: "A brief summary of the blog post",
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({
    description: "Blog author",
    example: "John Doe",
  })
  @IsString()
  author: string;

  @ApiProperty({
    description: "Blog category",
    example: "Climate Science",
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: "Estimated reading time",
    example: "5 min read",
  })
  @IsString()
  @IsOptional()
  readingTime?: string;

  @ApiPropertyOptional({
    description: "Published date",
    example: "2025-04-15T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @ApiPropertyOptional({
    description: "Is draft",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiPropertyOptional({
    description: "Is featured",
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: "Is top read",
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isTopRead?: boolean;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/blog-banner.jpg",
  })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional({
    description: "Banner image ID",
    example: "img_123456",
  })
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

export class UpdateBlogDto {
  @ApiPropertyOptional({
    description: "Blog title",
    example: "Climate Change Impact on Nepal",
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: "Blog content",
    example: "This is the main content of the blog post...",
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: "Blog excerpt",
    example: "A brief summary of the blog post",
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({
    description: "Blog author",
    example: "John Doe",
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({
    description: "Blog category",
    example: "Climate Science",
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: "Estimated reading time",
    example: "5 min read",
  })
  @IsString()
  @IsOptional()
  readingTime?: string;

  @ApiPropertyOptional({
    description: "Published date",
    example: "2025-04-15T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @ApiPropertyOptional({
    description: "Is draft",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiPropertyOptional({
    description: "Is featured",
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: "Is top read",
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isTopRead?: boolean;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/blog-banner.jpg",
  })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional({
    description: "Banner image ID",
    example: "img_123456",
  })
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

export class BlogResponseDto {
  @ApiProperty({
    description: "Blog ID",
    example: "clgf7xhig0000qof3m53ibdz1",
  })
  @IsString()
  @Expose()
  id: string;

  @ApiProperty({
    description: "Blog title",
    example: "Climate Change Impact on Nepal",
  })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({
    description: "Blog content",
    example: "This is the main content of the blog post...",
  })
  @IsString()
  @Expose()
  content: string;

  @ApiPropertyOptional({
    description: "Blog excerpt",
    example: "A brief summary of the blog post",
  })
  @IsString()
  @IsOptional()
  @Expose()
  excerpt?: string;

  @ApiProperty({
    description: "Blog author",
    example: "John Doe",
  })
  @IsString()
  @Expose()
  author: string;

  @ApiProperty({
    description: "Blog category",
    example: "Climate Science",
  })
  @IsString()
  @Expose()
  category: string;

  @ApiPropertyOptional({
    description: "Estimated reading time",
    example: "5 min read",
  })
  @IsString()
  @IsOptional()
  @Expose()
  readingTime?: string;

  @ApiPropertyOptional({
    description: "Published date",
  })
  @IsOptional()
  @Expose()
  publishedDate?: Date;

  @ApiProperty({
    description: "Is draft",
    example: true,
  })
  @IsBoolean()
  @Expose()
  isDraft: boolean;

  @ApiProperty({
    description: "Is featured",
    example: false,
  })
  @IsBoolean()
  @Expose()
  isFeatured: boolean;

  @ApiProperty({
    description: "Is top read",
    example: false,
  })
  @IsBoolean()
  @Expose()
  isTopRead: boolean;

  @ApiProperty({
    description: "Approved by admin",
    example: false,
  })
  @IsBoolean()
  @Expose()
  approvedByAdmin: boolean;

  @ApiProperty({
    description: "Blog status",
    example: "DRAFT",
    enum: ["DRAFT", "UNDER_REVIEW", "PUBLISHED", "REJECTED"],
  })
  @IsString()
  @Expose()
  status: string;

  @ApiPropertyOptional({
    description: "Banner image URL",
    example: "https://example.com/blog-banner.jpg",
  })
  @IsString()
  @IsOptional()
  @Expose()
  bannerImageUrl?: string;

  @ApiPropertyOptional({
    description: "Banner image ID",
    example: "img_123456",
  })
  @IsString()
  @IsOptional()
  @Expose()
  bannerImageId?: string;

  @ApiProperty({ description: "Tags", type: [TagOutputDto], required: false })
  @Expose()
  tags?: TagOutputDto[];

  @ApiPropertyOptional({
    description: "Author details",
    type: AuthorOutputDto,
    required: false,
  })
  @Type(() => AuthorOutputDto)
  @Expose()
  authorUser?: AuthorOutputDto;

  @ApiProperty({
    description: "Created at",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Updated at",
  })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Deleted at",
  })
  @IsOptional()
  @Expose()
  deletedAt?: Date;
}
