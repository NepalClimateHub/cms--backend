import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsBoolean,
  IsEmail,
  IsDateString,
} from "class-validator";
import { Type, Transform } from "class-transformer";

export class CreateVacancyDto {
  @ApiProperty({ example: "QA Engineer" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  openings?: number;

  @ApiPropertyOptional({ example: "6 months" })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: "5 hours/week" })
  @IsOptional()
  @IsString()
  hoursPerWeek?: string;

  @ApiPropertyOptional({
    example:
      "Help ensure Nepal Climate Hub delivers reliable, user-friendly, and high-quality digital products...",
  })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({
    type: [String],
    example: [
      "Develop and maintain QA processes, test plans, and testing documentation.",
      "Test our website and CMS for functionality, usability, accessibility, responsiveness, and performance.",
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: [
      "Experience with software testing, quality assurance, or a related field.",
      "Strong attention to detail and ability to identify edge cases and usability issues.",
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ example: "Kathmandu / Remote" })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: "Volunteer" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59Z" })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}

export class UpdateVacancyDto extends PartialType(CreateVacancyDto) {}

export class VacancySearchInput {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: "QA" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: "Volunteer" })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateVacancyApplicationDto {
  @ApiProperty({ example: "Ram Sharma" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: "ram.sharma@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "+977 9801234567" })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiPropertyOptional({ example: "Kathmandu, Nepal" })
  @IsOptional()
  @IsString()
  currentAddress?: string;

  @ApiPropertyOptional({
    example: "I am passionate about climate action and QA engineering...",
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: "https://ik.imagekit.io/nch/resumes/ram_cv.pdf" })
  @IsString()
  @IsNotEmpty()
  cvUrl: string;

  @ApiPropertyOptional({ example: "file_123456" })
  @IsOptional()
  @IsString()
  cvFileId?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ example: "SHORTLISTED" })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class VacancyApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  vacancyId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  contact: string;

  @ApiPropertyOptional()
  currentAddress?: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  cvUrl: string;

  @ApiPropertyOptional()
  cvFileId?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class VacancyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  openings: number;

  @ApiPropertyOptional()
  duration?: string;

  @ApiPropertyOptional()
  hoursPerWeek?: string;

  @ApiPropertyOptional()
  overview?: string;

  @ApiProperty()
  responsibilities: string[];

  @ApiProperty()
  requirements: string[];

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  deadline?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isDraft: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => [VacancyApplicationResponseDto] })
  applications?: VacancyApplicationResponseDto[];

  @ApiPropertyOptional()
  _count?: {
    applications: number;
  };
}
