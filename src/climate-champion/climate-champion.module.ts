import { Module } from "@nestjs/common";
import { ClimateChampionController } from "./controllers/climate-champion.controller";
import { ClimateChampionService } from "./services/climate-champion.service";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [ClimateChampionController],
  providers: [ClimateChampionService],
  exports: [ClimateChampionService],
})
export class ClimateChampionModule {}
