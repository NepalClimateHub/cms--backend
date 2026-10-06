import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EventStatus } from "@prisma/client";

import { AppLogger } from "../shared/logger/logger.service";
import { PrismaService } from "../shared/prisma-module/prisma.service";
import { RequestContext } from "../shared/request-context/request-context.dto";

export type CloseExpiredResult = { events: number; opportunities: number };

/**
 * Persists deadline-driven closures so admin lists, `?status=` filters and
 * raw DB queries agree with the status the public read endpoints compute.
 * Mirrors the rules in `computeStatus`; only rows not already CLOSED are
 * touched, so re-running is a no-op.
 */
@Injectable()
export class ContentStatusScheduler {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(ContentStatusScheduler.name);
  }

  @Cron(CronExpression.EVERY_HOUR, { name: "close-expired-content" })
  async handleCron(): Promise<void> {
    try {
      await this.closeExpired();
    } catch (error) {
      this.logger.error(
        new RequestContext(),
        `Closing expired events/opportunities failed: ${(error as Error).message}`
      );
    }
  }

  async closeExpired(now: Date = new Date()): Promise<CloseExpiredResult> {
    const [events, opportunities] = await Promise.all([
      this.prismaService.events.updateMany({
        where: {
          status: { not: EventStatus.CLOSED },
          OR: [
            { registrationDeadline: { lt: now } },
            { registrationDeadline: null, startDate: { lt: now } },
          ],
        },
        data: { status: EventStatus.CLOSED },
      }),
      this.prismaService.opportunity.updateMany({
        where: {
          status: { not: EventStatus.CLOSED },
          applicationDeadline: { lt: now },
        },
        data: { status: EventStatus.CLOSED },
      }),
    ]);

    const result = { events: events.count, opportunities: opportunities.count };
    this.logger.log(
      null,
      `Closed ${result.events} expired event(s) and ${result.opportunities} expired opportunity(ies)`
    );
    return result;
  }
}
