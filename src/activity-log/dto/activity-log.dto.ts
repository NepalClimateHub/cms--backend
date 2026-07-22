import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ActivityAction, ActivityEntity } from '@prisma/client';

export class ActivityLogResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  userEmail: string;

  @Expose()
  @ApiProperty()
  userName: string;

  @Expose()
  @ApiProperty()
  userRole: string;

  @Expose()
  @ApiProperty({ enum: ActivityAction })
  action: ActivityAction;

  @Expose()
  @ApiProperty({ enum: ActivityEntity })
  entity: ActivityEntity;

  @Expose()
  @ApiPropertyOptional()
  entityId?: string;

  @Expose()
  @ApiPropertyOptional()
  entityName?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

export class ActivityLogQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: ActivityAction })
  @IsOptional()
  @IsEnum(ActivityAction)
  action?: ActivityAction;

  @ApiPropertyOptional({ enum: ActivityEntity })
  @IsOptional()
  @IsEnum(ActivityEntity)
  entity?: ActivityEntity;

  @ApiPropertyOptional({ description: 'ISO date string (inclusive start)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'ISO date string (inclusive end)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
