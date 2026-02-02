-- Add asset_id and liability_id to transactions table
ALTER TABLE "public"."transactions" ADD COLUMN "asset_id" UUID REFERENCES "public"."assets"("id") ON DELETE SET NULL;
ALTER TABLE "public"."transactions" ADD COLUMN "liability_id" UUID REFERENCES "public"."liabilities"("id") ON DELETE SET NULL;

-- Add a comment to explain the columns
COMMENT ON COLUMN "public"."transactions"."asset_id" IS 'Linked asset account for balance updates';
COMMENT ON COLUMN "public"."transactions"."liability_id" IS 'Linked liability (credit card/loan) for balance updates';

-- Optional: Add a check constraint to ensure only one of them is set if needed, 
-- but in some cases a transfer might involve both (though usually we use separate txs or a specific transfer type).
-- For now, let's keep it flexible but typically one will be used.
