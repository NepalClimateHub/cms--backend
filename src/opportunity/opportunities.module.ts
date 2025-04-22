import { Module } from "@nestjs/common";

import { JwtAuthStrategy } from "../auth/strategies/jwt-auth.strategy";
import { SharedModule } from "../shared/shared.module";
import { OpportunityService } from "./services/opportunities.service";
import { OpportunityController } from "./controllers/opportunities.controller";

@Module({
  imports: [SharedModule],
  providers: [OpportunityService, JwtAuthStrategy],
  controllers: [OpportunityController],
})
export class OpportunityModule {}
