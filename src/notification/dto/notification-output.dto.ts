import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationType } from "@prisma/client";
import { Expose } from "class-transformer";

export class NotificationOutputDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  @Expose()
  type: NotificationType;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  body?: string | null;

  @ApiProperty()
  @Expose()
  read: boolean;

  @ApiPropertyOptional()
  @Expose()
  entityType?: string | null;

  @ApiPropertyOptional()
  @Expose()
  entityId?: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
