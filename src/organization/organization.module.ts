import { Module } from "@nestjs/common";

import { JwtAuthStrategy } from "../auth/strategies/jwt-auth.strategy";
import { NotificationModule } from "../notification/notification.module";
import { SharedModule } from "../shared/shared.module";
import { OrganizationService } from "./services/organization.service";
import { OrganizationController } from "./controllers/organization.controller";

@Module({
  imports: [SharedModule, NotificationModule],
  providers: [OrganizationService, JwtAuthStrategy],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
