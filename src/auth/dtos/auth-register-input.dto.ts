import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

import { ROLE } from '../constants/role.constant';
import { USER_TYPE } from '../constants/role.constant';

export class RegisterInput {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  name: string;

  @ApiProperty()
  @MaxLength(200)
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 100)
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ enum: USER_TYPE, default: USER_TYPE.INDIVIDUAL })
  @IsEnum(USER_TYPE)
  @IsOptional()
  userType: USER_TYPE = USER_TYPE.INDIVIDUAL;

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

  // These keys can only be set by ADMIN user.
  roles: ROLE[] = [ROLE.USER];
  isAccountDisabled: boolean;
}
