import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class GetChunksDto {
  @ApiProperty({ 
    example: ["550e8400-e29b-41d4-a716-446655440000"], 
    description: "Array of chunk UUIDs to fetch" 
  })
  @IsArray()
  @IsUUID(4, { each: true })
  chunkIds: string[];
}
