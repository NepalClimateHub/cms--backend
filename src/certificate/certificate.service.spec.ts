import { BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { CertificateService } from './services/certificate.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { PrismaService } from '../shared/prisma-module/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { sendEmail, EmailType } from '../utils/email.util';

jest.mock('../utils/email.util', () => ({
  EmailType: {
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    WELCOME_EMAIL: 'WELCOME_EMAIL',
    EMAIL_VERIFIED: 'EMAIL_VERIFIED',
    PASSWORD_RESET: 'PASSWORD_RESET',
    PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
    ORGANIZATION_VERIFIED: 'ORGANIZATION_VERIFIED',
    DB_BACKUP: 'DB_BACKUP',
    CERTIFICATE_VERIFICATION: 'CERTIFICATE_VERIFICATION',
  },
  sendEmail: jest.fn().mockResolvedValue({ success: true, message: 'Email sent successfully' }),
}));

describe('CertificateService', () => {
  let certificateService: CertificateService;
  let rateLimiterService: RateLimiterService;
  let prismaMock: any;
  let activityLogMock: any;

  beforeEach(() => {
    prismaMock = {
      certificate: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn(),
      },
      volunteer: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      certificateVerificationLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
        findMany: jest.fn(),
      },
    };

    activityLogMock = {
      logActivity: jest.fn(),
    };

    rateLimiterService = new RateLimiterService();
    (sendEmail as jest.Mock).mockResolvedValue({ success: true, message: 'Email sent successfully' });
    certificateService = new CertificateService(
      prismaMock as unknown as PrismaService,
      rateLimiterService,
      activityLogMock as unknown as ActivityLogService,
    );
  });

  describe('Duration Calculation', () => {
    it('should correctly calculate "2 years, 1 month" for June 7 2024 to July 9 2026', () => {
      const start = new Date('2024-06-07');
      const end = new Date('2026-07-09');
      const duration = certificateService.calculateDuration(start, end);
      expect(duration).toBe('2 years, 1 month');
    });

    it('should correctly calculate "1 year" for exactly 12 months', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');
      const duration = certificateService.calculateDuration(start, end);
      expect(duration).toBe('1 year');
    });

    it('should correctly calculate "6 months" within the same year', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-07-01');
      const duration = certificateService.calculateDuration(start, end);
      expect(duration).toBe('6 months');
    });
  });

  describe('Token Normalization & Hashing', () => {
    it('should normalize uppercase, trim whitespace, and strip NCH- prefix', () => {
      const raw = '  nch-7f3a91c2-4d8e-4b71-a6f2-91c83e5d7a42  ';
      const normalized = certificateService.normalizeToken(raw);
      expect(normalized).toBe('7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42');
    });

    it('should calculate accurate 64-char SHA-256 hex string', () => {
      const hash = certificateService.sha256('7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42');
      expect(hash).toHaveLength(64);
      expect(typeof hash).toBe('string');
      // Identical inputs must yield identical hash
      expect(certificateService.sha256('7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42')).toBe(hash);
    });
  });

  describe('Public Verification', () => {
    it('should throw BadRequestException if token format is invalid', async () => {
      await expect(
        certificateService.verifyCertificate('invalid-token', '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if token does not exist in database', async () => {
      prismaMock.certificate.findUnique.mockResolvedValue(null);

      await expect(
        certificateService.verifyCertificate(
          '7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42',
          '127.0.0.1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return valid certificate response when active record exists', async () => {
      const mockRecord = {
        id: 'cert-uuid-1',
        certificateNumber: 'NCH-CERT-2026-000184',
        verificationTokenHash: certificateService.sha256(
          '7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42',
        ),
        role: 'Volunteer',
        certificateType: 'VOLUNTEER',
        dateJoined: new Date('2024-06-07'),
        dateEnded: new Date('2026-07-09'),
        status: 'ACTIVE',
        volunteer: {
          fullName: 'Bibek Pant',
          email: 'bibek@example.com', // MUST NOT be exposed in public response
          profilePictureUrl: 'https://cdn.nepalclimatehub.org/bibek.jpg',
        },
      };

      prismaMock.certificate.findUnique.mockResolvedValue(mockRecord);

      const result = await certificateService.verifyCertificate(
        '7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42',
        '192.168.1.1',
      );

      expect(result.valid).toBe(true);
      expect(result.status).toBe('VERIFIED');
      expect(result.certificate).toBeDefined();
      expect(result.certificate?.name).toBe('Bibek Pant');
      expect(result.certificate?.role).toBe('Volunteer');
      expect(result.certificate?.certificateNumber).toBe('NCH-CERT-2026-000184');
      expect(result.certificate?.duration).toBe('2 years, 1 month');
      expect(result.certificate?.certificateType).toBe('Volunteer Certificate');
      expect(result.certificate?.organization).toBe('Nepal Climate Hub');

      // Ensure private fields are NEVER exposed
      expect((result.certificate as any).email).toBeUndefined();
      expect((result.certificate as any).volunteerId).toBeUndefined();
    });

    it('should return REVOKED status if certificate was revoked', async () => {
      const mockRevoked = {
        id: 'cert-uuid-2',
        certificateNumber: 'NCH-CERT-2026-000185',
        verificationTokenHash: certificateService.sha256(
          '7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42',
        ),
        status: 'REVOKED',
        volunteer: { fullName: 'Test Volunteer' },
      };

      prismaMock.certificate.findUnique.mockResolvedValue(mockRevoked);

      const result = await certificateService.verifyCertificate(
        '7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42',
        '127.0.0.1',
      );

      expect(result.valid).toBe(false);
      expect(result.status).toBe('REVOKED');
      expect(result.message).toContain('no longer valid');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow up to 10 verification requests within 1 minute from the same IP, then block the 11th', () => {
      const ip = '10.0.0.42';

      for (let i = 0; i < 10; i++) {
        expect(() => rateLimiterService.assertAllowed(ip)).not.toThrow();
      }

      expect(() => rateLimiterService.assertAllowed(ip)).toThrow(HttpException);
      try {
        rateLimiterService.assertAllowed(ip);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(err.getResponse()).toEqual({
          message: 'Too many verification attempts. Please try again later.',
        });
      }
    });
  });

  describe('Certificate Generation', () => {
    it('should create volunteer if not provided, hash token, and return raw token once', async () => {
      const mockVolunteer = {
        id: 'vol-uuid-1',
        fullName: 'Bibek Pant',
        email: 'bibek@example.com',
        profilePictureUrl: null,
      };

      const mockCert = {
        id: 'cert-uuid-1',
        certificateNumber: 'NCH-2026-10-000001',
        verificationTokenHash: 'mock-hash-64-chars',
        certificateType: 'VOLUNTEER',
        role: 'Volunteer',
        dateJoined: new Date('2024-06-07'),
        dateEnded: new Date('2026-07-09'),
        status: 'ACTIVE',
        issuedAt: new Date(),
        revokedAt: null,
        revocationReason: null,
        createdAt: new Date(),
        volunteer: mockVolunteer,
      };

      prismaMock.volunteer.create.mockResolvedValue(mockVolunteer);
      prismaMock.certificate.create.mockResolvedValue(mockCert);

      const result = await certificateService.generateCertificate({
        fullName: 'Bibek Pant',
        email: 'bibek@example.com',
        role: 'Volunteer',
        certificateType: 'VOLUNTEER',
        dateJoined: '2024-06-07',
        dateEnded: '2026-07-09',
      });

      expect(result.certificateNumber).toMatch(/^NCH-\d{4}-\d{2}-\d{6}$/);
      expect(result.verificationCode).toBeDefined();
      expect(result.verificationCode).toMatch(/^[A-Z0-9]{16}$/);

      // Verify DB was called with HASHED token, not raw token
      expect(prismaMock.certificate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verificationTokenHash: expect.any(String),
          }),
        }),
      );

      const createCallData = prismaMock.certificate.create.mock.calls[0][0].data;
      expect(createCallData.verificationTokenHash).not.toBe(result.verificationCode);
      expect(createCallData.verificationTokenHash).toHaveLength(64);
    });

    it('should email the verification code to the volunteer when an email is provided', async () => {
      const mockVolunteer = {
        id: 'vol-uuid-1',
        fullName: 'Bibek Pant',
        email: 'bibek@example.com',
        profilePictureUrl: null,
      };

      const mockCert = {
        id: 'cert-uuid-1',
        certificateNumber: 'NCH-CERT-2026-000002',
        verificationTokenHash: 'mock-hash-64-chars',
        certificateType: 'VOLUNTEER',
        role: 'Volunteer',
        dateJoined: new Date('2024-06-07'),
        dateEnded: new Date('2026-07-09'),
        status: 'ACTIVE',
        issuedAt: new Date(),
        revokedAt: null,
        revocationReason: null,
        createdAt: new Date(),
        volunteer: mockVolunteer,
      };

      prismaMock.volunteer.create.mockResolvedValue(mockVolunteer);
      prismaMock.certificate.create.mockResolvedValue(mockCert);

      const result = await certificateService.generateCertificate({
        fullName: 'Bibek Pant',
        email: 'bibek@example.com',
        role: 'Volunteer',
        certificateType: 'VOLUNTEER',
        dateJoined: '2024-06-07',
        dateEnded: '2026-07-09',
      });

      expect(sendEmail).toHaveBeenCalledWith(
        EmailType.CERTIFICATE_VERIFICATION,
        expect.objectContaining({
          to: 'bibek@example.com',
          fullName: 'Bibek Pant',
          certificateNumber: result.certificateNumber,
          verificationCode: result.verificationCode,
        }),
      );
    });
  });
});
