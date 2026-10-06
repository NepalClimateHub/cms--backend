import { EventStatus } from "@prisma/client";

import { EventsService } from "../events/services/events.service";
import { OpportunityService } from "../opportunity/services/opportunities.service";
import { RequestContext } from "../shared/request-context/request-context.dto";

describe("public reads never return a stale status", () => {
  const logger = { setContext: jest.fn(), log: jest.fn() };
  const activity = { logActivity: jest.fn() };
  const ctx = new RequestContext();

  const past = new Date(Date.now() - 60 * 60 * 1000);
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const expiredEvent = { id: "e1", title: "Past", status: "OPEN", registrationDeadline: past, startDate: future };
  const startedEvent = { id: "e2", title: "Started", status: "OPEN", registrationDeadline: null, startDate: past };
  const liveEvent = { id: "e3", title: "Live", status: "UPCOMING", registrationDeadline: future, startDate: future };

  const expiredOpportunity = { id: "o1", title: "Past", status: "OPEN", applicationDeadline: past };
  const liveOpportunity = { id: "o2", title: "Live", status: "OPEN", applicationDeadline: future };

  beforeEach(() => jest.clearAllMocks());

  it.each([undefined, "summary"])("closes expired events on the list endpoint (view=%s)", async (view) => {
    const prisma = {
      events: {
        findMany: jest.fn().mockResolvedValue([expiredEvent, startedEvent, liveEvent].map((e) => ({ ...e }))),
        count: jest.fn().mockResolvedValue(3),
      },
    };
    const service = new EventsService(logger as any, prisma as any, activity as any);

    const { events } = await service.getEvents(ctx, { view, limit: 10, offset: 0 } as any);

    expect(events.map((e) => e.status)).toEqual([EventStatus.CLOSED, EventStatus.CLOSED, EventStatus.UPCOMING]);
  });

  it("exposes the deadline fields in the event summary", async () => {
    const prisma = {
      events: { findMany: jest.fn().mockResolvedValue([{ ...liveEvent }]), count: jest.fn().mockResolvedValue(1) },
    };
    const service = new EventsService(logger as any, prisma as any, activity as any);

    const { events } = await service.getEvents(ctx, { view: "summary", limit: 10, offset: 0 } as any);

    expect(events[0]).toEqual(
      expect.objectContaining({ startDate: future, registrationDeadline: future })
    );
  });

  it("recomputes status for cached public summaries", async () => {
    const row = { ...liveEvent, status: "OPEN", registrationDeadline: future };
    const prisma = {
      events: { findMany: jest.fn().mockResolvedValue([row]), count: jest.fn().mockResolvedValue(1) },
    };
    const service = new EventsService(logger as any, prisma as any, activity as any);
    const query = { view: "summary", limit: 10, offset: 0 } as any;

    const first = await service.getEvents(ctx, query, true);
    expect(first.events[0].status).toBe(EventStatus.OPEN);

    // Deadline passes while the entry is still cached.
    (first.events[0] as any).registrationDeadline = past;
    const second = await service.getEvents(ctx, query, true);

    expect(prisma.events.findMany).toHaveBeenCalledTimes(1);
    expect(second.events[0].status).toBe(EventStatus.CLOSED);
  });

  it("closes an expired event on the by-id endpoint", async () => {
    const prisma = { events: { findUnique: jest.fn().mockResolvedValue({ ...expiredEvent }) } };
    const service = new EventsService(logger as any, prisma as any, activity as any);

    await expect(service.getOneEvent(ctx, "e1")).resolves.toEqual(
      expect.objectContaining({ status: EventStatus.CLOSED })
    );
  });

  it.each([undefined, "summary"])("closes expired opportunities on the list endpoint (view=%s)", async (view) => {
    const prisma = {
      opportunity: {
        findMany: jest.fn().mockResolvedValue([expiredOpportunity, liveOpportunity].map((o) => ({ ...o }))),
        count: jest.fn().mockResolvedValue(2),
      },
    };
    const service = new OpportunityService(logger as any, prisma as any, activity as any);

    const { items } = await service.getOpportunities(ctx, { view, limit: 10, offset: 0 } as any);

    expect(items.map((o) => o.status)).toEqual([EventStatus.CLOSED, EventStatus.OPEN]);
    if (view === "summary") {
      expect(items[1]).toEqual(expect.objectContaining({ applicationDeadline: future }));
    }
  });

  it("returns uppercase status for a legacy lowercase opportunity on the by-id endpoint", async () => {
    const prisma = {
      opportunity: { findUnique: jest.fn().mockResolvedValue({ ...liveOpportunity, status: "open" }) },
    };
    const service = new OpportunityService(logger as any, prisma as any, activity as any);

    await expect(service.getOneOpportunity(ctx, "o2")).resolves.toEqual(
      expect.objectContaining({ status: EventStatus.OPEN })
    );
  });
});
