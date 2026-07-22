import { Module } from "@nestjs/common";

import { JwtAuthStrategy } from "../auth/strategies/jwt-auth.strategy";
import { SharedModule } from "../shared/shared.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";
import { EventsService } from "./services/events.service";
import { EventsController } from "./controllers/events.controller";

@Module({
  imports: [SharedModule, ActivityLogModule],
  providers: [EventsService, JwtAuthStrategy],
  controllers: [EventsController],
})
export class EventsModule {}
