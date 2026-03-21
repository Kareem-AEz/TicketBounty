/*
  Warnings:

  - Added the required column `entity` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentEntity" AS ENUM ('TICKET', 'COMMENT');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "entity" "AttachmentEntity" NOT NULL,
ALTER COLUMN "ticketId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Attachment_commentId_idx" ON "Attachment"("commentId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "TicketComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
