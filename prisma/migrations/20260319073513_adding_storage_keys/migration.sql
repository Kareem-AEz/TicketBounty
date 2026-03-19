/*
  Warnings:

  - Added the required column `hash` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageOrganizationId` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageTicketId` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "storageOrganizationId" TEXT NOT NULL,
ADD COLUMN     "storageTicketId" TEXT NOT NULL;
