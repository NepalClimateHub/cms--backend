import { Module } from "@nestjs/common";
import { ProjectService } from "./services/project.service";
import { ProjectController } from "./controllers/project.controller";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
