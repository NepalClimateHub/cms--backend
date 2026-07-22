import { Module } from "@nestjs/common";
import { ProjectService } from "./services/project.service";
import { ProjectController } from "./controllers/project.controller";
import { SharedModule } from "../shared/shared.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
  imports: [SharedModule, ActivityLogModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
