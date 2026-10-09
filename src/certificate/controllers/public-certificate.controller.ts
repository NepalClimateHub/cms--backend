import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import {
  PublicCertificateResponseDto,
  VerifyCertificateDto,
} from "../dto/certificate.dto";
import { CertificateService } from "../services/certificate.service";

@ApiTags("Public Certificates")
@Controller("public/certificates")
export class PublicCertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post("verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify an NCH certificate using its unique verification code",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Certificate verified successfully or revoked status returned",
    type: PublicCertificateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "This record doesn't exist",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Please enter a valid verification code.",
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: "Too many verification attempts. Please try again later.",
  })
  async verifyCertificate(
    @Body() dto: VerifyCertificateDto,
    @Req() req: Request,
  ): Promise<PublicCertificateResponseDto> {
    const rawIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      "unknown";

    const userAgent = req.headers["user-agent"] || "unknown";

    return this.certificateService.verifyCertificate(
      dto.code,
      rawIp,
      userAgent,
    );
  }
}
