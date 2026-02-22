import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class CreateChatSessionDto {
  @ApiPropertyOptional({ example: "Climate Change Discussion" })
  @IsString()
  @IsOptional()
  title?: string;
}
