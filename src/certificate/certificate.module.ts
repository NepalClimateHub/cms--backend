import { Module } from "@nestjs/common";
import { ActivityLogModule } from "../activity-log/activity-log.module";
import { DatabaseModule } from "../database/database.module";
import { SharedModule } from "../shared/shared.module";
import { AdminCertificateController } from "./controllers/admin-certificate.controller";
import { PublicCertificateController } from "./controllers/public-certificate.controller";
import { CertificateService } from "./services/certificate.service";
import { RateLimiterService } from "./services/rate-limiter.service";

@Module({
  imports: [DatabaseModule, SharedModule, ActivityLogModule],
  controllers: [AdminCertificateController, PublicCertificateController],
  providers: [CertificateService, RateLimiterService],
  exports: [CertificateService],
})
export class CertificateModule {}
