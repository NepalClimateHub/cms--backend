import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";
import { ROLE } from "../../auth/constants/role.constant";

export class UpdateUserInput {
  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(100)
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(6, 100)
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    description: "Admin verification (super-admin only in practice)",
  })
  @IsOptional()
  @IsBoolean()
  isVerifiedByAdmin?: boolean;

  @ApiPropertyOptional({
    description: "Profile photo URL",
    example: "https://example.com/profile-photo.jpg",
  })
  @IsOptional()
  @IsString()
  profilePhotoUrl?: string;

  @ApiPropertyOptional({
    description: "Profile photo ID",
    example: "img_123456",
  })
  @IsOptional()
  @IsString()
  profilePhotoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentRole?: string;

  @ApiPropertyOptional({
    description: "Phone number (omit or null to clear)",
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneNumber?: string | null;

  @ApiPropertyOptional({ enum: ROLE })
  @IsOptional()
  @IsEnum(ROLE)
  role?: ROLE;

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
}
