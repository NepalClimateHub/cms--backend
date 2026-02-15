import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

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
  isAccountVerified?: boolean;

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

  @ApiPropertyOptional({
    description: "User bio",
    example: "I am a climate enthusiast passionate about sustainability.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentRole?: string;
}
