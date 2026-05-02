import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

import { ROLE } from "../../auth/constants/role.constant";

export class CreateUserInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 100)
  @IsAlphanumeric()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ROLE, { each: true })
  roles: ROLE[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty()
  @IsBoolean()
  isAccountDisabled: boolean;

  @ApiProperty({ enum: ROLE, default: ROLE.INDIVIDUAL })
  @IsEnum(ROLE)
  @IsOptional()
  role: ROLE = ROLE.INDIVIDUAL;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orgName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orgType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iAm?: string;
}
