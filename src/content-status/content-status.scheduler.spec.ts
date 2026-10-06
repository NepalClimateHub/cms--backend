import { EventStatus } from "@prisma/client";
import { CronExpression } from "@nestjs/schedule";

import { ContentStatusScheduler } from "./content-status.scheduler";

// Metadata key written by @nestjs/schedule's @Cron decorator.
const SCHEDULE_CRON_OPTIONS = "SCHEDULE_CRON_OPTIONS";

describe("ContentStatusScheduler", () => {
  const now = new Date("2026-10-06T12:00:00.000Z");
  const logger = { setContext: jest.fn(), log: jest.fn(), error: jest.fn() };

  const buildPrisma = (eventCount: number, opportunityCount: number) => ({
    events: { updateMany: jest.fn().mockResolvedValue({ count: eventCount }) },
    opportunity: { updateMany: jest.fn().mockResolvedValue({ count: opportunityCount }) },
  });

  beforeEach(() => jest.clearAllMocks());

  it("closes only expired, not-yet-closed rows and logs the counts", async () => {
    const prisma = buildPrisma(5, 77);
    const scheduler = new ContentStatusScheduler(logger as any, prisma as any);

    const result = await scheduler.closeExpired(now);

    expect(result).toEqual({ events: 5, opportunities: 77 });
    expect(prisma.events.updateMany).toHaveBeenCalledWith({
      where: {
        status: { not: EventStatus.CLOSED },
        OR: [
          { registrationDeadline: { lt: now } },
          { registrationDeadline: null, startDate: { lt: now } },
        ],
      },
      data: { status: EventStatus.CLOSED },
    });
    expect(prisma.opportunity.updateMany).toHaveBeenCalledWith({
      where: {
        status: { not: EventStatus.CLOSED },
        applicationDeadline: { lt: now },
      },
      data: { status: EventStatus.CLOSED },
    });
    expect(logger.log).toHaveBeenCalledWith(
      null,
      "Closed 5 expired event(s) and 77 expired opportunity(ies)"
    );
  });

  it("is idempotent: a second run with nothing left to close updates zero rows", async () => {
    const prisma = buildPrisma(0, 0);
    const scheduler = new ContentStatusScheduler(logger as any, prisma as any);

    await expect(scheduler.closeExpired(now)).resolves.toEqual({ events: 0, opportunities: 0 });
    expect(logger.log).toHaveBeenCalledWith(
      null,
      "Closed 0 expired event(s) and 0 expired opportunity(ies)"
    );
  });

  it("logs instead of throwing when the update fails", async () => {
    const prisma = buildPrisma(0, 0);
    prisma.events.updateMany.mockRejectedValue(new Error("db down"));
    const scheduler = new ContentStatusScheduler(logger as any, prisma as any);

    await expect(scheduler.handleCron()).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("db down")
    );
  });

  it("is registered as an hourly cron job", () => {
    const cronOptions = Reflect.getMetadata(
      SCHEDULE_CRON_OPTIONS,
      ContentStatusScheduler.prototype.handleCron
    );
    expect(cronOptions).toEqual(
      expect.objectContaining({
        cronTime: CronExpression.EVERY_HOUR,
        name: "close-expired-content",
      })
    );
  });
});
