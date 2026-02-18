import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateSessionTitleDto {
  @ApiProperty({ example: "Updated Chat Title" })
  @IsString()
  title: string;
}
