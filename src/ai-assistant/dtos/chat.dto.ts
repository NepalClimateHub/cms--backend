import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

class ChatMessageDto {
  @ApiProperty({ description: "Role: user or assistant" })
  @IsString()
  role: string;

  @ApiProperty({ description: "Message content" })
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ description: "User query about climate" })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: "Conversation history" })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  conversation_history?: ChatMessageDto[];

  @ApiPropertyOptional({ description: "Existing conversation/session ID" })
  @IsOptional()
  @IsString()
  conversation_id?: string;

  @ApiPropertyOptional({ description: "Number of documents to retrieve", default: 5 })
  @IsOptional()
  @IsNumber()
  top_k?: number;
}
