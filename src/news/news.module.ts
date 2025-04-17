import { Module } from "@nestjs/common";

import { JwtAuthStrategy } from "../auth/strategies/jwt-auth.strategy";
import { SharedModule } from "../shared/shared.module";
import { NewsService } from "./services/news.service";
import { NewsController } from "./controllers/news.controller";

@Module({
  imports: [SharedModule],
  providers: [NewsService, JwtAuthStrategy],
  controllers: [NewsController],
})
export class NewsModule {}
