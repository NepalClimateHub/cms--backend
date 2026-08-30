import { Module } from "@nestjs/common";
import { VacancyController } from "./controllers/vacancy.controller";
import { VacancyService } from "./services/vacancy.service";
import { SharedModule } from "../shared/shared.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
  imports: [SharedModule, ActivityLogModule],
  controllers: [VacancyController],
  providers: [VacancyService],
  exports: [VacancyService],
})
export class VacancyModule { }
