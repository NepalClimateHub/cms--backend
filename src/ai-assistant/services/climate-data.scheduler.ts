import { Injectable, Logger } from "@nestjs/common";
import { Cron, Timeout } from "@nestjs/schedule";
import { ClimateDataService } from "./climate-data.service";

@Injectable()
export class ClimateDataScheduler {
  private readonly logger = new Logger(ClimateDataScheduler.name);

  constructor(private readonly climateData: ClimateDataService) {}

  @Timeout(60_000)
  async initialBackfill() {
    try {
      await this.climateData.queueInitialBackfillIfNeeded();
    } catch (error) {
      this.logger.warn(
        `Initial climate backfill was not queued: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Cron("0 3 2 * *", { timeZone: "UTC" })
  async monthlyIncremental() {
    try {
      await this.climateData.queueMonthlyIncremental();
    } catch (error) {
      this.logger.error(
        `Monthly climate sync failed to queue: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Cron("*/15 * * * *", { timeZone: "UTC" })
  async recoverStaleRuns() {
    try {
      await this.climateData.recoverStaleRuns();
    } catch (error) {
      this.logger.error(
        `Climate stale-run recovery failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
