import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AuthTokenOutput {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;
}

export class UserAccessTokenClaims {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  isSuperAdmin: boolean;

  @Expose()
  isAccountVerified: boolean;

  @Expose()
  gender: string | null;

  @Expose()
  phoneCountryCode: string | null;

  @Expose()
  phoneNumber: string | null;
}

export class UserRefreshTokenClaims {
  id: number;
}
