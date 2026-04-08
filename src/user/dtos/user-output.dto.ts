import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { USER_TYPE } from "../../auth/constants/role.constant";
import { OrganizationProfileOutputDto } from "./organization-profile-output.dto";

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
  linkedin: string | null;

  @ApiProperty()
  @Expose()
  currentRole: string | null;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;

  @ApiPropertyOptional({ type: OrganizationProfileOutputDto, nullable: true })
  @Expose()
  @Type(() => OrganizationProfileOutputDto)
  organization?: OrganizationProfileOutputDto | null;
}
