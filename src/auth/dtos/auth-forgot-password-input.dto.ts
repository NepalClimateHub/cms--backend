import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordInput {
  @ApiProperty({ example: "member@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
