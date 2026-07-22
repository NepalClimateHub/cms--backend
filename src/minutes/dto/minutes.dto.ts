import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { Expose } from 'class-transformer';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';

export class CreateMinutesDto {
  @ApiProperty({ example: 'NCH Monthly Coordination Call' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: '2026-07-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: '10:00 AM' })
  @IsOptional()
  @IsString()
  meetingTime?: string;

  @ApiProperty({ example: 'Agenda of the meeting...' })
  @IsNotEmpty()
  @IsString()
  agenda: string;

  @ApiProperty({ example: 'Summary of discussion...' })
  @IsNotEmpty()
  @IsString()
  meetingSummary: string;
}

export class UpdateMinutesDto extends PartialType(CreateMinutesDto) { }

export class MinutesSearchInput extends PaginationParamsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}

export class MinutesResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  date?: Date;

  @ApiPropertyOptional()
  @Expose()
  meetingTime?: string;

  @ApiProperty()
  @Expose()
  agenda: string;

  @ApiProperty()
  @Expose()
  meetingSummary: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
