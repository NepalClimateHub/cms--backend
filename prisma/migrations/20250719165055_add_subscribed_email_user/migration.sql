-- CreateTable
CREATE TABLE "SubscribedEmailUser" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubscribedEmailUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscribedEmailUser_email_key" ON "SubscribedEmailUser"("email");
