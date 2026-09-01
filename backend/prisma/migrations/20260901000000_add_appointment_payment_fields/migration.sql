-- Migration: add payment + reminder fields to appointments
-- Generated for Yarijoo V2

-- Add zarinpal payment fields
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "zarinpal_authority" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "zarinpal_ref_id" TEXT;

-- Add reminder tracking field
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "reminder_sent" BOOLEAN NOT NULL DEFAULT false;

-- Add index for reminder queries
CREATE INDEX IF NOT EXISTS "appointments_reminder_sent_idx" ON "appointments"("reminder_sent");
