/**
 * Single application role model (no separate "user type" enum).
 * Values align with Prisma `User.userType` and the JWT `role` claim.
 */
export enum ROLE {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  CONTENT_ADMIN = "CONTENT_ADMIN",
  ORGANIZATION = "ORGANIZATION",
  INDIVIDUAL = "INDIVIDUAL",
}

/** All roles; use for routes that any signed-in user may access (replaces the old `ROLE.USER` catch-all). */
export const ALL_ROLES: readonly ROLE[] = [
  ROLE.SUPER_ADMIN,
  ROLE.ADMIN,
  ROLE.CONTENT_ADMIN,
  ROLE.ORGANIZATION,
  ROLE.INDIVIDUAL,
] as const;
