-- Upgrade date columns to TIMESTAMPTZ to support time tracking
ALTER TABLE "public"."transactions" ALTER COLUMN "date" TYPE TIMESTAMPTZ USING "date"::TIMESTAMPTZ;
ALTER TABLE "public"."pending_transactions" ALTER COLUMN "date" TYPE TIMESTAMPTZ USING "date"::TIMESTAMPTZ;

-- Add comments for clarity
COMMENT ON COLUMN "public"."transactions"."date" IS 'Transaction date and time';
COMMENT ON COLUMN "public"."pending_transactions"."date" IS 'Detected transaction date and time from Gmail/OCR/AI';
