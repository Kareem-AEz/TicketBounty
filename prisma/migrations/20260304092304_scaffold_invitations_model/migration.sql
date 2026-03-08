-- CreateTable
CREATE TABLE "Invitations" (
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitedByUserId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitations_tokenHash_key" ON "Invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitations_email_idx" ON "Invitations"("email");

-- CreateIndex
CREATE INDEX "Invitations_organizationId_idx" ON "Invitations"("organizationId");

-- CreateIndex
CREATE INDEX "Invitations_invitedByUserId_idx" ON "Invitations"("invitedByUserId");

-- AddForeignKey
ALTER TABLE "Invitations" ADD CONSTRAINT "Invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitations" ADD CONSTRAINT "Invitations_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
