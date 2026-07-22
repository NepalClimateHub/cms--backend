import { Module } from "@nestjs/common";

import { JwtAuthStrategy } from "../auth/strategies/jwt-auth.strategy";
import { SharedModule } from "../shared/shared.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";
import { NewsService } from "./services/news.service";
import { NewsController } from "./controllers/news.controller";

@Module({
  imports: [SharedModule, ActivityLogModule],
  providers: [NewsService, JwtAuthStrategy],
  controllers: [NewsController],
})
export class NewsModule {}
