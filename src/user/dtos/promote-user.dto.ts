import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ROLE } from "../../auth/constants/role.constant";

export class PromoteUserInput {
  @ApiProperty({ enum: ROLE })
  @IsNotEmpty()
  @IsEnum(ROLE)
  role: ROLE;
}
