import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn } from "class-validator";

export class AddMessageDto {
  @ApiProperty({ example: "user", enum: ["user", "assistant"] })
  @IsIn(["user", "assistant"])
  role: string;

  @ApiProperty({ example: "What is climate change?" })
  @IsString()
  content: string;
}
