import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from "class-validator";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";

export class VerifyCertificateDto {
  @ApiProperty({
    description: "Certificate verification code (e.g. 7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42 or NCH-7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42)",
    example: "7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42",
  })
  @IsNotEmpty({ message: "Please enter a valid verification code." })
  @IsString()
  @Matches(
    /^(NCH-)?([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[a-zA-Z0-9]{16})$/i,
    { message: "Please enter a valid verification code." },
  )
  code: string;
}

export class CreateCertificateDto {
  @ApiPropertyOptional({
    description: "Optional ID of existing volunteer if already created",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsUUID()
  volunteerId?: string;

  @ApiPropertyOptional({
    description: "Full name of volunteer (required if volunteerId is not provided)",
    example: "Bibek Pant",
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: "Email address of volunteer (kept private, never exposed publicly)",
    example: "bibek@example.com",
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: "Profile picture URL of volunteer",
    example: "https://cdn.nepalclimatehub.org/profile/bibek.jpg",
  })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @ApiProperty({
    description: "Type of certificate",
    example: "VOLUNTEER",
    default: "VOLUNTEER",
  })
  @IsNotEmpty()
  @IsString()
  certificateType: string;

  @ApiProperty({
    description: "Role or title on certificate",
    example: "Volunteer",
  })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({
    description: "Joined date (YYYY-MM-DD)",
    example: "2024-06-07",
  })
  @IsNotEmpty()
  @IsString()
  dateJoined: string;

  @ApiPropertyOptional({
    description: "End or completion date (YYYY-MM-DD)",
    example: "2026-07-09",
  })
  @IsOptional()
  @IsString()
  dateEnded?: string;

  @ApiPropertyOptional({
    description: "Team name (manually entered by admin)",
    example: "Advocacy & Communications",
  })
  @IsOptional()
  @IsString()
  teamName?: string;

  @ApiPropertyOptional({
    description: "Issue date (YYYY-MM-DD)",
    example: "2026-10-11",
  })
  @IsOptional()
  @IsString()
  issuedAt?: string;
}

export class RevokeCertificateDto {
  @ApiProperty({
    description: "Reason for certificate revocation",
    example: "Certificate issued in error",
  })
  @IsNotEmpty({ message: "Revocation reason is required" })
  @IsString()
  reason: string;
}

export class CertificateSearchInput extends PaginationParamsDto {
  @ApiPropertyOptional({
    description: "Search by volunteer name or certificate number",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by status: ACTIVE, REVOKED, EXPIRED",
    example: "ACTIVE",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Filter by certificate type",
    example: "VOLUNTEER",
  })
  @IsOptional()
  @IsString()
  certificateType?: string;
}

export class PublicCertificateDetailsDto {
  @ApiProperty({ example: "NCH-CERT-2026-000184" })
  certificateNumber: string;

  @ApiProperty({ example: "Bibek Pant" })
  name: string;

  @ApiProperty({ example: "Volunteer" })
  role: string;

  @ApiProperty({ example: "2024-06-07" })
  dateJoined: string;

  @ApiProperty({ example: "2026-07-09", nullable: true })
  dateEnded: string | null;

  @ApiProperty({ example: "2 years, 1 month" })
  duration: string;

  @ApiProperty({ example: "Volunteer Certificate" })
  certificateType: string;

  @ApiProperty({ example: "https://cdn.nepalclimatehub.org/profile/bibek.jpg", nullable: true })
  profilePicture: string | null;

  @ApiPropertyOptional({ example: "Advocacy & Communications", nullable: true })
  teamName: string | null;

  @ApiProperty({ example: "2026-10-11" })
  issuedAt: string;

  @ApiProperty({ example: "Nepal Climate Hub" })
  organization: string;
}

export class PublicCertificateResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: "VERIFIED" })
  status: "VERIFIED" | "NOT_FOUND" | "REVOKED";

  @ApiPropertyOptional({
    example: "This record doesn't exist. Please email us if you are concerned about the legitimacy of this certificate.",
  })
  message?: string;

  @ApiPropertyOptional({ type: PublicCertificateDetailsDto })
  certificate?: PublicCertificateDetailsDto;
}

export class VolunteerDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "Bibek Pant" })
  fullName: string;

  @ApiPropertyOptional({ example: "bibek@example.com" })
  email?: string | null;

  @ApiPropertyOptional({ example: "https://cdn.nepalclimatehub.org/profile/bibek.jpg" })
  profilePictureUrl?: string | null;
}

export class AdminCertificateResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "NCH-CERT-2026-000184" })
  certificateNumber: string;

  @ApiPropertyOptional({
    description: "One-time plaintext verification token returned only upon creation or regeneration",
    example: "7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42",
  })
  verificationCode?: string;

  @ApiProperty({ example: "VOLUNTEER" })
  certificateType: string;

  @ApiProperty({ example: "Volunteer" })
  role: string;

  @ApiPropertyOptional({ example: "Advocacy & Communications", nullable: true })
  teamName?: string | null;

  @ApiProperty({ example: "2024-06-07" })
  dateJoined: string;

  @ApiProperty({ example: "2026-07-09", nullable: true })
  dateEnded: string | null;

  @ApiProperty({ example: "2 years, 1 month" })
  duration: string;

  @ApiProperty({ example: "ACTIVE" })
  status: string;

  @ApiProperty({ example: "2026-07-09T00:00:00.000Z" })
  issuedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  revokedAt?: Date | null;

  @ApiProperty({ example: null, nullable: true })
  revocationReason?: string | null;

  @ApiProperty({ type: VolunteerDto })
  volunteer: VolunteerDto;

  @ApiProperty({ example: 12 })
  verificationCount: number;

  @ApiProperty({ example: "2026-07-09T00:00:00.000Z" })
  createdAt: Date;
}

export class CertificateLogDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "SUCCESS" })
  result: string;

  @ApiProperty({ example: "2026-07-09T12:00:00.000Z" })
  requestedAt: Date;

  @ApiPropertyOptional({ example: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" })
  ipHash?: string | null;

  @ApiPropertyOptional({ example: "Mozilla/5.0..." })
  userAgent?: string | null;
}
