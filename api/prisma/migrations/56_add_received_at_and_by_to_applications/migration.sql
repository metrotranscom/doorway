-- AlterTable
ALTER TABLE "applications" 
ADD COLUMN IF NOT EXISTS    "received_at" TIMESTAMPTZ(6),
ADD COLUMN IF NOT EXISTS    "received_by" TEXT;
