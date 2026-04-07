-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "nextTicketNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "prefix" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketNumber" TEXT NOT NULL DEFAULT '';
