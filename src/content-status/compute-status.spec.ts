import { EventStatus } from "@prisma/client";

import { applyComputedStatus, computeStatus, normalizeStatus } from "./compute-status";

describe("computeStatus", () => {
  const now = new Date("2026-10-06T12:00:00.000Z");
  const past = "2026-10-06T11:59:59.000Z";
  const future = "2026-10-06T12:00:01.000Z";

  describe("events", () => {
    it("closes when the registration deadline has passed", () => {
      expect(computeStatus({ status: "OPEN", registrationDeadline: past }, now)).toBe(EventStatus.CLOSED);
    });

    it("stays OPEN while the registration deadline is in the future", () => {
      expect(computeStatus({ status: "OPEN", registrationDeadline: future }, now)).toBe(EventStatus.OPEN);
    });

    it("uses the registration deadline over a passed start date", () => {
      expect(
        computeStatus({ status: "OPEN", registrationDeadline: future, startDate: past }, now)
      ).toBe(EventStatus.OPEN);
    });

    it("falls back to startDate when there is no registration deadline", () => {
      expect(computeStatus({ status: "OPEN", registrationDeadline: null, startDate: past }, now)).toBe(EventStatus.CLOSED);
      expect(computeStatus({ status: "OPEN", startDate: future }, now)).toBe(EventStatus.OPEN);
    });

    it("accepts Date instances as well as ISO strings", () => {
      expect(computeStatus({ status: "OPEN", startDate: new Date(past) }, now)).toBe(EventStatus.CLOSED);
    });
  });

  describe("opportunities", () => {
    it("closes when the application deadline has passed", () => {
      expect(computeStatus({ status: "open", applicationDeadline: past }, now)).toBe(EventStatus.CLOSED);
    });

    it("stays OPEN while the application deadline is in the future", () => {
      expect(computeStatus({ status: "open", applicationDeadline: future }, now)).toBe(EventStatus.OPEN);
    });
  });

  it("falls back to the stored status when there are no dates", () => {
    expect(computeStatus({ status: "OPEN" }, now)).toBe(EventStatus.OPEN);
    expect(computeStatus({ status: "UPCOMING", applicationDeadline: null }, now)).toBe(EventStatus.UPCOMING);
    expect(computeStatus({ status: "CLOSED" }, now)).toBe(EventStatus.CLOSED);
  });

  it("keeps a manual CLOSED even when the deadline is in the future", () => {
    expect(computeStatus({ status: "CLOSED", registrationDeadline: future }, now)).toBe(EventStatus.CLOSED);
    expect(computeStatus({ status: "closed", applicationDeadline: future }, now)).toBe(EventStatus.CLOSED);
  });

  it("keeps a manual UPCOMING until the deadline passes", () => {
    expect(computeStatus({ status: "UPCOMING", startDate: future }, now)).toBe(EventStatus.UPCOMING);
    expect(computeStatus({ status: "UPCOMING", startDate: past }, now)).toBe(EventStatus.CLOSED);
  });

  it("always returns uppercase, defaulting unknown values to OPEN", () => {
    expect(normalizeStatus("open")).toBe(EventStatus.OPEN);
    expect(normalizeStatus(" Closed ")).toBe(EventStatus.CLOSED);
    expect(normalizeStatus("CLOSE")).toBe(EventStatus.CLOSED);
    expect(normalizeStatus(null)).toBe(EventStatus.OPEN);
    expect(normalizeStatus("whatever")).toBe(EventStatus.OPEN);
  });

  it("ignores unparseable dates", () => {
    expect(computeStatus({ status: "OPEN", applicationDeadline: "not-a-date" }, now)).toBe(EventStatus.OPEN);
  });

  it("applyComputedStatus rewrites each item in place", () => {
    const items = [
      { status: "open", applicationDeadline: past },
      { status: "open", applicationDeadline: future },
    ];
    expect(applyComputedStatus(items, now)).toBe(items);
    expect(items.map((i) => i.status)).toEqual([EventStatus.CLOSED, EventStatus.OPEN]);
  });
});
