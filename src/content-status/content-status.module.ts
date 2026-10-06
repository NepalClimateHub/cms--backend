import { Module } from "@nestjs/common";

import { SharedModule } from "../shared/shared.module";
import { ContentStatusScheduler } from "./content-status.scheduler";

@Module({
  imports: [SharedModule],
  providers: [ContentStatusScheduler],
})
export class ContentStatusModule {}
