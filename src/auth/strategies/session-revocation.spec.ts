import { isRevoked } from "./session-revocation";

describe("isRevoked", () => {
  const revokedAt = new Date("2026-11-16T10:00:00.000Z");
  const sec = Math.floor(revokedAt.getTime() / 1000);

  it("keeps tokens when nothing was revoked", () => {
    expect(isRevoked(sec - 100, null)).toBe(false);
  });
  it("rejects tokens issued before revocation", () => {
    expect(isRevoked(sec - 1, revokedAt)).toBe(true);
  });
  it("accepts tokens issued at or after revocation", () => {
    expect(isRevoked(sec, revokedAt)).toBe(false);
    expect(isRevoked(sec + 60, revokedAt)).toBe(false);
  });
});
