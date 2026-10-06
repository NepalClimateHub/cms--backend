import { RequestContext } from "./shared/request-context/request-context.dto";
import { EventsService } from "./events/services/events.service";
import { OpportunityService } from "./opportunity/services/opportunities.service";
import { ResourceService } from "./resource/services/resource.service";

describe("opt-in content summary projections", () => {
  const logger = { setContext: jest.fn(), log: jest.fn() };
  const activity = { logActivity: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it("keeps event list pagination/count while selecting only summary fields", async () => {
    const prisma = { events: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(7) } };
    const service = new EventsService(logger as any, prisma as any, activity as any);

    const result = await service.getEvents(new RequestContext(), { view: "summary", limit: 12, offset: 3 } as any);

    expect(result.count).toBe(7);
    expect(prisma.events.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 12,
      skip: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true, locationType: true,
        type: true, format: true, status: true, cost: true,
        bannerImageUrl: true, startDate: true, registrationDeadline: true,
        address: { select: { state: true } },
        tags: { select: { tag: true } },
      },
    }));
    expect(prisma.events.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
  });

  it("retains the full event include for legacy list calls", async () => {
    const prisma = { events: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) } };
    const service = new EventsService(logger as any, prisma as any, activity as any);

    await service.getEvents(new RequestContext(), { limit: 100, offset: 0 } as any);

    expect(prisma.events.findMany).toHaveBeenCalledWith(expect.objectContaining({ include: { address: true, tags: true } }));
  });

  it("keeps opportunity list pagination/count while selecting only summary fields", async () => {
    const prisma = { opportunity: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(5) } };
    const service = new OpportunityService(logger as any, prisma as any, activity as any);

    const result = await service.getOpportunities(new RequestContext(), { view: "summary", limit: 8, offset: 2 } as any);

    expect(result.count).toBe(5);
    expect(prisma.opportunity.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 8,
      skip: 2,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true, locationType: true,
        type: true, format: true, status: true, cost: true,
        bannerImageUrl: true, applicationDeadline: true,
        address: { select: { state: true } },
        tags: { select: { tag: true } },
      },
    }));
  });

  it("retains the full opportunity include for legacy list calls", async () => {
    const prisma = { opportunity: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) } };
    const service = new OpportunityService(logger as any, prisma as any, activity as any);

    await service.getOpportunities(new RequestContext(), { limit: 100, offset: 0 } as any);

    expect(prisma.opportunity.findMany).toHaveBeenCalledWith(expect.objectContaining({ include: { address: true, tags: true } }));
  });

  it("keeps resource filters, pagination/count, and omits unused relations in summary mode", async () => {
    const prisma = { resource: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(2) } };
    const service = new ResourceService(prisma as any, activity as any);

    const result = await service.findAllResources({ view: "summary", type: "REPORTS", limit: 20, offset: 1 } as any);

    expect(result.total).toBe(2);
    expect(prisma.resource.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 20,
      skip: 1,
      orderBy: { createdAt: "desc" },
      where: expect.objectContaining({ type: "REPORTS" }),
      select: {
        id: true, title: true, overview: true, type: true,
        level: true, link: true, bannerImageUrl: true,
      },
    }));
  });

  it("retains the full resource include for legacy list calls", async () => {
    const prisma = { resource: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) } };
    const service = new ResourceService(prisma as any, activity as any);

    await service.findAllResources({ limit: 100, offset: 0 } as any);

    expect(prisma.resource.findMany).toHaveBeenCalledWith(expect.objectContaining({ include: { tags: true } }));
  });
});
