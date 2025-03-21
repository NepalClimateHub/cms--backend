import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { PermissionActions } from "../../shared/constants/permissions";
import { SingleOrganizationDto } from "../../organization/dto/organization-output.dto";

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
