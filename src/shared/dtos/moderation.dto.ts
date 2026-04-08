import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum ModerationAction {
  APPROVE = "APPROVE",
  REQUEST_IMPROVEMENTS = "REQUEST_IMPROVEMENTS",
  REJECT = "REJECT",
}

export class ContentModerationDto {
  @ApiProperty({ enum: ModerationAction })
  @IsEnum(ModerationAction)
  @IsNotEmpty()
  action: ModerationAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}
