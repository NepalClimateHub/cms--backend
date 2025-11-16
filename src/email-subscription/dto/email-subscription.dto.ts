import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailSubscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
