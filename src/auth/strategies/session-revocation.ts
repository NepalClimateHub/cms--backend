// JWT `iat` is in whole seconds. A token minted in the same second as the
// revocation stays valid; ponytail: second granularity, add a token version if that matters.
export const isRevoked = (
  iat: number | undefined,
  sessionsRevokedAt: Date | null | undefined,
): boolean =>
  !!sessionsRevokedAt &&
  (iat ?? 0) < Math.floor(sessionsRevokedAt.getTime() / 1000);
