import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { USER_TYPE } from "../../auth/constants/role.constant";

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

  @Expose()
  @ApiProperty({ enum: USER_TYPE })
  userType: USER_TYPE;

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
  profilePhotoUrl: string | null;

  @ApiProperty()
  @Expose()
  profilePhotoId: string | null;

  @ApiProperty()
  @Expose()
  bio: string | null;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;
}
