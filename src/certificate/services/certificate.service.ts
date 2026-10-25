import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as crypto from "crypto";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import {
  AdminCertificateResponseDto,
  CertificateLogDto,
  CertificateSearchInput,
  CreateCertificateDto,
  PublicCertificateResponseDto,
} from "../dto/certificate.dto";
import { RateLimiterService } from "./rate-limiter.service";
import { EmailType, sendEmail } from "../../utils/email.util";

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  /**
   * Helper to format certificate type into a user-friendly public display title
   */
  private formatCertificateType(type: string): string {
    const map: Record<string, string> = {
      VOLUNTEER: "Volunteer Certificate",
      INTERNSHIP: "Internship Certificate",
      TRAINING: "Training Certificate",
      WORKSHOP: "Workshop Certificate",
      PARTICIPATION: "Participation Certificate",
      EMPLOYMENT: "Employment Certificate",
      SERVICE: "Service Certificate",
    };
    return map[type.toUpperCase()] || type;
  }

  /**
   * Helper to calculate human-readable duration between two dates
   * (e.g. "2 years, 1 month", "6 months", "1 year")
   */
  public calculateDuration(dateJoined: Date, dateEnded?: Date | null): string {
    const start = new Date(dateJoined);
    const end = dateEnded ? new Date(dateEnded) : new Date();

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (end.getDate() < start.getDate()) {
      months -= 1;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0 && months > 0) {
      return `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"}`;
    } else if (years > 0 && months === 0) {
      return `${years} ${years === 1 ? "year" : "years"}`;
    } else if (years === 0 && months > 0) {
      return `${months} ${months === 1 ? "month" : "months"}`;
    } else {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
    }
  }

  /**
   * Normalize input verification token:
   * - Trim whitespace
   * - Strip optional 'NCH-' prefix
   * - Uppercase
   */
  public normalizeToken(token: string): string {
    return token
      .trim()
      .toUpperCase()
      .replace(/^NCH-/, "");
  }

  /**
   * SHA-256 hash generator
   */
  public sha256(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  /**
   * Generate 16-character alphanumeric verification token
   */
  public generateVerificationToken(): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const bytes = crypto.randomBytes(16);
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Public Certificate Verification
   */
  async verifyCertificate(
    rawCode: string,
    ip?: string,
    userAgent?: string,
  ): Promise<PublicCertificateResponseDto> {
    const clientIp = ip || "unknown";

    // 1. Rate limiting check (10 requests/min per IP)
    this.rateLimiterService.assertAllowed(clientIp);

    const ipHash = ip ? this.sha256(ip) : null;

    // 2. Validate and normalize token
    if (!rawCode || typeof rawCode !== "string") {
      await this.recordAuditLog(null, "INVALID_FORMAT", ipHash, userAgent);
      throw new BadRequestException("Please enter a valid verification code.");
    }

    const normalizedToken = this.normalizeToken(rawCode);
    const tokenRegex =
      /^([0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}|[A-Z0-9]{16})$/i;

    if (!tokenRegex.test(normalizedToken)) {
      await this.recordAuditLog(null, "INVALID_FORMAT", ipHash, userAgent);
      throw new BadRequestException("Please enter a valid verification code.");
    }

    // 3. Hash the token
    const tokenHash = this.sha256(normalizedToken);

    // 4. Lookup certificate in database
    const cert = await this.prisma.certificate.findUnique({
      where: { verificationTokenHash: tokenHash },
      include: { volunteer: true },
    });

    // 5. Handle record not found
    if (!cert) {
      await this.recordAuditLog(null, "NOT_FOUND", ipHash, userAgent);
      throw new NotFoundException(
        "This record doesn't exist. Please email us if you are concerned about the legitimacy of this person's certificate.",
      );
    }

    // 6. Handle revoked certificates
    if (cert.status === "REVOKED") {
      await this.recordAuditLog(cert.id, "REVOKED", ipHash, userAgent);
      return {
        valid: false,
        status: "REVOKED",
        message:
          "This certificate is no longer valid. Please contact Nepal Climate Hub if you have concerns about its legitimacy.",
      };
    }

    // 7. Handle non-active statuses
    if (cert.status !== "ACTIVE") {
      await this.recordAuditLog(cert.id, cert.status, ipHash, userAgent);
      return {
        valid: false,
        status: "NOT_FOUND",
        message:
          "This certificate is no longer valid. Please contact Nepal Climate Hub if you have concerns about its legitimacy.",
      };
    }

    // 8. Log success audit record
    await this.recordAuditLog(cert.id, "SUCCESS", ipHash, userAgent);

    const duration = this.calculateDuration(cert.dateJoined, cert.dateEnded);

    return {
      valid: true,
      status: "VERIFIED",
      certificate: {
        certificateNumber: cert.certificateNumber,
        name: cert.volunteer.fullName,
        role: cert.role,
        dateJoined: cert.dateJoined.toISOString().split("T")[0],
        dateEnded: cert.dateEnded
          ? cert.dateEnded.toISOString().split("T")[0]
          : null,
        duration,
        certificateType: this.formatCertificateType(cert.certificateType),
        profilePicture: cert.volunteer.profilePictureUrl || null,
        teamName: cert.teamName || null,
        issuedAt: cert.issuedAt
          ? cert.issuedAt.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        organization: "Nepal Climate Hub",
      },
    };
  }

  /**
   * Helper to write a verification audit log safely
   */
  private async recordAuditLog(
    certificateId: string | null,
    result: string,
    ipHash: string | null,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.prisma.certificateVerificationLog.create({
        data: {
          certificateId: certificateId || undefined,
          result,
          ipHash,
          userAgent: userAgent ? userAgent.substring(0, 500) : null,
        },
      });
    } catch (err) {
      this.logger.error("Failed to write verification audit log", err);
    }
  }

  /**
   * Admin: Generate a new certificate with random UUID token
   */
  async generateCertificate(
    dto: CreateCertificateDto,
    ctx?: RequestContext,
  ): Promise<AdminCertificateResponseDto> {
    // 1. Generate cryptographically secure random token (16-character alphanumeric string)
    const rawToken = this.generateVerificationToken();
    const tokenHash = this.sha256(rawToken);

    // 2. Generate unique Certificate Number in format NCH-YEAR-MM-CertificateNo
    const issueDate = dto.issuedAt ? new Date(dto.issuedAt) : new Date();
    const currentYear = issueDate.getFullYear();
    const currentMonth = String(issueDate.getMonth() + 1).padStart(2, "0");
    const certCount = await this.prisma.certificate.count();
    const certNumber = `NCH-${currentYear}-${currentMonth}-${String(certCount + 1).padStart(6, "0")}`;

    // 3. Find or create Volunteer
    let volunteerId = dto.volunteerId;
    if (!volunteerId) {
      const volunteer = await this.prisma.volunteer.create({
        data: {
          fullName: dto.fullName || "Volunteer",
          email: dto.email || null,
          profilePictureUrl: dto.profilePictureUrl || null,
        },
      });
      volunteerId = volunteer.id;
    }

    // 4. Create Certificate record with hashed token
    const certificate = await this.prisma.certificate.create({
      data: {
        certificateNumber: certNumber,
        verificationTokenHash: tokenHash,
        volunteerId,
        certificateType: dto.certificateType.toUpperCase(),
        role: dto.role,
        teamName: dto.teamName || null,
        dateJoined: new Date(dto.dateJoined),
        dateEnded: dto.dateEnded ? new Date(dto.dateEnded) : null,
        status: "ACTIVE",
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
      },
      include: {
        volunteer: true,
      },
    });

    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.CREATE,
        ActivityEntity.CERTIFICATE,
        certificate.id,
        certificate.certificateNumber,
      );
    }

    const duration = this.calculateDuration(
      certificate.dateJoined,
      certificate.dateEnded,
    );

    const recipientEmail = certificate.volunteer.email || dto.email;
    if (recipientEmail) {
      try {
        await sendEmail(EmailType.CERTIFICATE_VERIFICATION, {
          to: recipientEmail,
          fullName: certificate.volunteer.fullName,
          certificateNumber: certificate.certificateNumber,
          verificationCode: rawToken,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to send certificate verification email to ${recipientEmail}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      id: certificate.id,
      certificateNumber: certificate.certificateNumber,
      verificationCode: rawToken, // Returned ONLY during initial creation
      certificateType: certificate.certificateType,
      role: certificate.role,
      teamName: certificate.teamName,
      dateJoined: certificate.dateJoined.toISOString().split("T")[0],
      dateEnded: certificate.dateEnded
        ? certificate.dateEnded.toISOString().split("T")[0]
        : null,
      duration,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      revocationReason: certificate.revocationReason,
      volunteer: {
        id: certificate.volunteer.id,
        fullName: certificate.volunteer.fullName,
        email: certificate.volunteer.email,
        profilePictureUrl: certificate.volunteer.profilePictureUrl,
      },
      verificationCount: 0,
      createdAt: certificate.createdAt,
    };
  }

  /**
   * Admin: Invalidate old token and generate a new random token for certificate
   */
  async regenerateCode(
    certificateId: string,
    ctx?: RequestContext,
  ): Promise<{
    certificateId: string;
    certificateNumber: string;
    verificationCode: string;
  }> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!cert) {
      throw new NotFoundException(
        `Certificate with ID ${certificateId} not found`,
      );
    }

    // Generate new random 16-character token
    const newRawToken = this.generateVerificationToken();
    const newTokenHash = this.sha256(newRawToken);

    await this.prisma.certificate.update({
      where: { id: certificateId },
      data: {
        verificationTokenHash: newTokenHash,
      },
    });

    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.UPDATE,
        ActivityEntity.CERTIFICATE,
        cert.id,
        `${cert.certificateNumber} (Code Regenerated)`,
      );
    }

    return {
      certificateId: cert.id,
      certificateNumber: cert.certificateNumber,
      verificationCode: newRawToken,
    };
  }

  /**
   * Admin: Revoke certificate
   */
  async revokeCertificate(
    certificateId: string,
    reason: string,
    ctx?: RequestContext,
  ): Promise<AdminCertificateResponseDto> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        volunteer: true,
        _count: { select: { verificationLogs: true } },
      },
    });

    if (!cert) {
      throw new NotFoundException(
        `Certificate with ID ${certificateId} not found`,
      );
    }

    const updatedCert = await this.prisma.certificate.update({
      where: { id: certificateId },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revocationReason: reason,
      },
      include: {
        volunteer: true,
        _count: { select: { verificationLogs: true } },
      },
    });

    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.REJECT,
        ActivityEntity.CERTIFICATE,
        updatedCert.id,
        `${updatedCert.certificateNumber} (Revoked)`,
      );
    }

    return {
      id: updatedCert.id,
      certificateNumber: updatedCert.certificateNumber,
      certificateType: updatedCert.certificateType,
      role: updatedCert.role,
      teamName: updatedCert.teamName,
      dateJoined: updatedCert.dateJoined.toISOString().split("T")[0],
      dateEnded: updatedCert.dateEnded
        ? updatedCert.dateEnded.toISOString().split("T")[0]
        : null,
      duration: this.calculateDuration(
        updatedCert.dateJoined,
        updatedCert.dateEnded,
      ),
      status: updatedCert.status,
      issuedAt: updatedCert.issuedAt,
      revokedAt: updatedCert.revokedAt,
      revocationReason: updatedCert.revocationReason,
      volunteer: {
        id: updatedCert.volunteer.id,
        fullName: updatedCert.volunteer.fullName,
        email: updatedCert.volunteer.email,
        profilePictureUrl: updatedCert.volunteer.profilePictureUrl,
      },
      verificationCount: updatedCert._count.verificationLogs,
      createdAt: updatedCert.createdAt,
    };
  }

  /**
   * Admin: List all certificates with search, filtering, and verification count
   */
  async findAllCertificates(searchInput: CertificateSearchInput): Promise<{
    certificates: AdminCertificateResponseDto[];
    total: number;
  }> {
    const {
      offset = 0,
      limit = 100,
      search,
      status,
      certificateType,
    } = searchInput;

    const where: Prisma.CertificateWhereInput = {};

    if (search) {
      where.OR = [
        {
          certificateNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          volunteer: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          teamName: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (certificateType) {
      where.certificateType = certificateType.toUpperCase();
    }

    const [certificates, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ createdAt: "desc" }],
        include: {
          volunteer: true,
          _count: { select: { verificationLogs: true } },
        },
      }),
      this.prisma.certificate.count({ where }),
    ]);

    const formatted: AdminCertificateResponseDto[] = certificates.map(
      (cert) => ({
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        certificateType: cert.certificateType,
        role: cert.role,
        teamName: cert.teamName,
        dateJoined: cert.dateJoined.toISOString().split("T")[0],
        dateEnded: cert.dateEnded
          ? cert.dateEnded.toISOString().split("T")[0]
          : null,
        duration: this.calculateDuration(cert.dateJoined, cert.dateEnded),
        status: cert.status,
        issuedAt: cert.issuedAt,
        revokedAt: cert.revokedAt,
        revocationReason: cert.revocationReason,
        volunteer: {
          id: cert.volunteer.id,
          fullName: cert.volunteer.fullName,
          email: cert.volunteer.email,
          profilePictureUrl: cert.volunteer.profilePictureUrl,
        },
        verificationCount: cert._count.verificationLogs,
        createdAt: cert.createdAt,
      }),
    );

    return { certificates: formatted, total };
  }

  /**
   * Admin: Find certificate by ID
   */
  async findCertificateById(id: string): Promise<AdminCertificateResponseDto> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        volunteer: true,
        _count: { select: { verificationLogs: true } },
      },
    });

    if (!cert) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return {
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      certificateType: cert.certificateType,
      role: cert.role,
      teamName: cert.teamName,
      dateJoined: cert.dateJoined.toISOString().split("T")[0],
      dateEnded: cert.dateEnded
        ? cert.dateEnded.toISOString().split("T")[0]
        : null,
      duration: this.calculateDuration(cert.dateJoined, cert.dateEnded),
      status: cert.status,
      issuedAt: cert.issuedAt,
      revokedAt: cert.revokedAt,
      revocationReason: cert.revocationReason,
      volunteer: {
        id: cert.volunteer.id,
        fullName: cert.volunteer.fullName,
        email: cert.volunteer.email,
        profilePictureUrl: cert.volunteer.profilePictureUrl,
      },
      verificationCount: cert._count.verificationLogs,
      createdAt: cert.createdAt,
    };
  }

  /**
   * Admin: Get audit logs for a certificate
   */
  async getCertificateLogs(id: string): Promise<CertificateLogDto[]> {
    const logs = await this.prisma.certificateVerificationLog.findMany({
      where: { certificateId: id },
      orderBy: { requestedAt: "desc" },
      take: 50,
    });

    return logs.map((log) => ({
      id: log.id,
      result: log.result,
      requestedAt: log.requestedAt,
      ipHash: log.ipHash,
      userAgent: log.userAgent,
    }));
  }
}
