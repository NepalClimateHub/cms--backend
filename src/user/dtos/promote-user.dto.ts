import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { USER_TYPE } from "../../auth/constants/role.constant";

export class PromoteUserInput {
  @ApiProperty({ enum: USER_TYPE })
  @IsNotEmpty()
  @IsEnum(USER_TYPE)
  userType: USER_TYPE;
}

export class VerifyUserInput {
  @ApiProperty()
  @IsNotEmpty()
  isVerified: boolean;
}
