import { EventStatus } from "@prisma/client";

type DateLike = Date | string | null | undefined;

/**
 * Fields used to derive an event's or opportunity's status. Events carry
 * `registrationDeadline` / `startDate`; opportunities carry `applicationDeadline`.
 */
export type StatusSource = {
  status?: string | null;
  registrationDeadline?: DateLike;
  startDate?: DateLike;
  applicationDeadline?: DateLike;
};

const toTime = (value: DateLike): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  return Number.isNaN(time) ? null : time;
};

/** Normalises legacy lowercase / free-text values onto the shared enum. */
export const normalizeStatus = (status?: string | null): EventStatus => {
  const upper = (status ?? "").trim().toUpperCase();
  if (upper === "CLOSED" || upper === "CLOSE") return EventStatus.CLOSED;
  if (upper === "UPCOMING") return EventStatus.UPCOMING;
  return EventStatus.OPEN;
};

/**
 * The moment after which the item stops accepting people: the registration or
 * application deadline, or for events without one, the start date.
 */
export const getEffectiveDeadline = (item: StatusSource): number | null =>
  toTime(item.registrationDeadline) ??
  toTime(item.applicationDeadline) ??
  toTime(item.startDate);

/**
 * Status as the public should see it. A passed deadline always closes the
 * item; otherwise the stored status wins, so admins can still close early or
 * mark something UPCOMING. Comparisons are on epoch millis, i.e. UTC.
 */
export const computeStatus = (
  item: StatusSource,
  now: Date = new Date()
): EventStatus => {
  const stored = normalizeStatus(item.status);
  if (stored === EventStatus.CLOSED) return EventStatus.CLOSED;

  const deadline = getEffectiveDeadline(item);
  if (deadline !== null && deadline < now.getTime()) return EventStatus.CLOSED;

  return stored;
};

/** Overwrites `status` on each item with its computed value (in place). */
export const applyComputedStatus = <T extends StatusSource>(
  items: T[],
  now: Date = new Date()
): T[] => {
  for (const item of items) {
    item.status = computeStatus(item, now);
  }
  return items;
};
