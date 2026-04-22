import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { ROLE } from "../constants/role.constant";

export class RegisterOutput {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty({ example: [ROLE.INDIVIDUAL] })
  roles: ROLE[];

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  isAccountDisabled: boolean;

  @Expose()
  @ApiProperty({ enum: ROLE })
  role: ROLE;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}
