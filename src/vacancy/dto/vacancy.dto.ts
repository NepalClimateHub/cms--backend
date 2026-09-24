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
  IsEnum,
  IsUrl,
  MaxLength,
  ArrayMaxSize,
  ValidateNested,
  Allow,
} from "class-validator";
import { Type, Transform } from "class-transformer";

/** Question widget types. Uppercase, mirrored from the CMS contract. */
export enum VacancyQuestionType {
  TEXT = "TEXT",
  PARAGRAPH = "PARAGRAPH",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTI_CHOICE = "MULTI_CHOICE",
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER",
  DATE = "DATE",
  FILE = "FILE",
  URL = "URL",
}

/** Types whose `options` must carry at least two non-blank entries. */
export const CHOICE_QUESTION_TYPES = [
  VacancyQuestionType.SINGLE_CHOICE,
  VacancyQuestionType.MULTI_CHOICE,
];

export const MAX_QUESTIONS_PER_VACANCY = 50;
export const MAX_OPTIONS_PER_QUESTION = 100;
export const MAX_QUESTION_TEXT_LENGTH = 500;

export class VacancyQuestionDto {
  @ApiProperty({ example: "3f2a1b7c-9d4e-4f5a-8b6c-1d2e3f4a5b6c" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  id: string;

  @ApiProperty({ example: "Why this role?" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_QUESTION_TEXT_LENGTH)
  label: string;

  @ApiPropertyOptional({
    enum: VacancyQuestionType,
    default: VacancyQuestionType.TEXT,
  })
  @IsOptional()
  @IsEnum(VacancyQuestionType)
  type?: VacancyQuestionType = VacancyQuestionType.TEXT;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean = false;

  @ApiPropertyOptional({ example: "2-3 lines" })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_QUESTION_TEXT_LENGTH)
  helpText?: string;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(MAX_OPTIONS_PER_QUESTION)
  options?: string[] = [];

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number = 0;
}

export class VacancyAnswerDto {
  @ApiProperty({ example: "3f2a1b7c-9d4e-4f5a-8b6c-1d2e3f4a5b6c" })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  /** Snapshot of the question label at submit time - stored as sent. */
  @ApiProperty({ example: "Why this role?" })
  @IsString()
  @MaxLength(MAX_QUESTION_TEXT_LENGTH)
  label: string;

  /** Snapshot of the question type at submit time - stored as sent. */
  @ApiProperty({ enum: VacancyQuestionType })
  @IsEnum(VacancyQuestionType)
  type: VacancyQuestionType;

  /**
   * string | string[] | number | boolean | null, depending on `type`.
   * `@Allow()` keeps it past `whitelist: true` without constraining the shape;
   * per-type checking happens in the service against the vacancy's questions.
   */
  @ApiPropertyOptional()
  @Allow()
  value?: string | string[] | number | boolean | null;

  @ApiPropertyOptional({ example: "abc123", nullable: true })
  @IsOptional()
  @IsString()
  fileId?: string | null;
}

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

  /**
   * Full question set. Absent = leave untouched, [] = clear, [...] = replace.
   * Without @ValidateNested + @Type the global `whitelist: true` pipe strips
   * this before the service ever sees it.
   */
  @ApiPropertyOptional({ type: () => [VacancyQuestionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_QUESTIONS_PER_VACANCY)
  @ValidateNested({ each: true })
  @Type(() => VacancyQuestionDto)
  questions?: VacancyQuestionDto[];
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

  @ApiProperty({ example: "Kathmandu, Nepal" })
  @IsString()
  @IsNotEmpty()
  currentAddress: string;

  /**
   * Legacy fields. The CMS no longer sends either - free text is now a
   * PARAGRAPH question - so they must stay optional or every apply 400s.
   */
  @ApiPropertyOptional({ example: "+977 9801234567", deprecated: true })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({
    example: "I am passionate about climate action...",
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: "https://drive.google.com/file/x" })
  @IsUrl()
  @IsNotEmpty()
  cvUrl: string;

  @ApiPropertyOptional({ type: () => [VacancyAnswerDto], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_QUESTIONS_PER_VACANCY)
  @ValidateNested({ each: true })
  @Type(() => VacancyAnswerDto)
  answers?: VacancyAnswerDto[] = [];
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

  @ApiPropertyOptional()
  contact?: string;

  @ApiProperty()
  currentAddress: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  cvUrl: string;

  @ApiPropertyOptional()
  cvFileId?: string;

  @ApiProperty({ type: () => [VacancyAnswerDto] })
  answers: VacancyAnswerDto[];

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

  @ApiProperty({ type: () => [VacancyQuestionDto] })
  questions: VacancyQuestionDto[];

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
