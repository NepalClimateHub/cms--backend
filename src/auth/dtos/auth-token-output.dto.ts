import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { UserType } from "@prisma/client";

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
  isEmailVerified: boolean;

  @Expose()
  gender: string | null;

  @Expose()
  phoneCountryCode: string | null;

  @Expose()
  phoneNumber: string | null;

  /** Prisma `User.userType` — same enum as application `ROLE`. */
  @ApiProperty({ enum: UserType })
  @Expose()
  userType: UserType;
}

export class UserRefreshTokenClaims {
  id: number;
}
