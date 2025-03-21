import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UserOutput {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  fullName: string;

  @Expose()
  @ApiProperty()
  isSuperAdmin: boolean;

  @Expose()
  @ApiProperty()
  isAccountVerified: boolean;

  @ApiProperty()
  @Expose()
  gender: string | null;

  @ApiProperty()
  @Expose()
  phoneCountryCode: string | null;

  @ApiProperty()
  @Expose()
  phoneNumber: string | null;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;
}
