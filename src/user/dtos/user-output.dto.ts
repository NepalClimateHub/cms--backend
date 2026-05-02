import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ROLE } from "../../auth/constants/role.constant";
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
  @ApiProperty({
    description: "True when the user has confirmed their email address",
  })
  isEmailVerified: boolean;

  @Expose()
  @ApiProperty({
    description:
      "Set when a platform admin has verified this account (e.g. organization profile)",
  })
  isVerifiedByAdmin: boolean;

  @Expose()
  @ApiProperty()
  isSuperAdmin: boolean;

  @Expose()
  @ApiProperty({ enum: ROLE })
  role: ROLE;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  gender: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  phoneCountryCode: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  phoneNumber: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  profilePhotoUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  profilePhotoId: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  bio: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  currentRole: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  iAm: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  bannerImageId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  bannerImageUrl: string | null;

  @ApiPropertyOptional({
    type: "object",
    nullable: true,
    additionalProperties: true,
  })
  @Expose()
  socials: any | null;

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
