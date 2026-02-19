-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "canDeleteTickets" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Ticket_title_idx" ON "Ticket" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Ticket_content_idx" ON "Ticket" USING GIN ("content" gin_trgm_ops);
