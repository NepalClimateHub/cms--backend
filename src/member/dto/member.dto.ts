import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  IsIn,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { Expose, Type } from "class-transformer";

export const MEMBER_TEAMS = [
  "Leadership",
  "Executive",
  "Tech",
  "Climate Communication",
  "Content",
  "Advisor",
] as const;

export const MEMBER_STATUSES = [
  "Staff",
  "Advisor",
  "Volunteer",
  "Board",
] as const;

export class CreateMemberDto {
  @ApiProperty({ description: "Full name of the NCH member" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Email address of the member" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: "Current address of the member" })
  @IsString()
  @IsOptional()
  currentAddress?: string;

  @ApiPropertyOptional({
    description: "Permanent address (Home) of the member",
  })
  @IsString()
  @IsOptional()
  permanentAddress?: string;

  @ApiPropertyOptional({ description: "Phone number of the member" })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: "LinkedIn profile URL of the member" })
  @IsString()
  @IsOptional()
  linkedinProfile?: string;

  @ApiPropertyOptional({ description: "Upload Photo URL" })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: "Upload Photo ImageKit Asset ID" })
  @IsString()
  @IsOptional()
  photoId?: string;

  @ApiPropertyOptional({ description: "A short biography (max 400 chars)" })
  @IsString()
  @IsOptional()
  @MaxLength(400)
  bio?: string;

  @ApiProperty({ description: "Role or position of the member at NCH" })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional({
    description: "Start date at NCH",
    example: "2023-01-15",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date at NCH (null if current member)",
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: "Is the member active", default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: "Team section of the member",
    enum: MEMBER_TEAMS,
  })
  @IsString()
  @IsIn(MEMBER_TEAMS)
  team: string;

  @ApiProperty({ description: "Status of the member", enum: MEMBER_STATUSES })
  @IsString()
  @IsIn(MEMBER_STATUSES)
  status: string;

  @ApiPropertyOptional({ description: "Order sorting weight", default: 0 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  order?: number;
}

export class UpdateMemberDto extends CreateMemberDto {}

export class MemberResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiPropertyOptional()
  @Expose()
  currentAddress?: string;

  @ApiPropertyOptional()
  @Expose()
  permanentAddress?: string;

  @ApiPropertyOptional()
  @Expose()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @Expose()
  linkedinProfile?: string;

  @ApiPropertyOptional()
  @Expose()
  photoUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  photoId?: string;

  @ApiPropertyOptional()
  @Expose()
  bio?: string;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiPropertyOptional()
  @Expose()
  startDate?: Date;

  @ApiPropertyOptional()
  @Expose()
  endDate?: Date;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  team: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  order: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class MemberSearchInput extends PaginationParamsDto {
  @ApiPropertyOptional({
    description: "Filter by name or email (partial search)",
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by team", enum: MEMBER_TEAMS })
  @IsString()
  @IsOptional()
  @IsIn(MEMBER_TEAMS)
  team?: string;

  @ApiPropertyOptional({
    description: "Filter by status",
    enum: MEMBER_STATUSES,
  })
  @IsString()
  @IsOptional()
  @IsIn(MEMBER_STATUSES)
  status?: string;
}

export class MemberOrderItem {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  order: number;
}

export class ReorderMembersDto {
  @ApiProperty({ type: [MemberOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberOrderItem)
  orders: MemberOrderItem[];
}
