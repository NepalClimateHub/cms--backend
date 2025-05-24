import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { AnalyticsService } from "./services/analytics.service";
import { AnalyticsController } from "./controllers/analytics.controller";

@Module({
  imports: [SharedModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
