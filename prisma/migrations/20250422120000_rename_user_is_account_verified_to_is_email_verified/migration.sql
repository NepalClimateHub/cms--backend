-- Rename column to match email verification semantics
ALTER TABLE "User" RENAME COLUMN "isAccountVerified" TO "isEmailVerified";
