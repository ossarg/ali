-- Migration 017: unique constraint on claim_payments to prevent duplicates on re-sync
-- First deduplicate existing rows keeping the oldest (min id per group)
DELETE FROM claim_payments
WHERE id NOT IN (
    SELECT MIN(id::text)::uuid
    FROM claim_payments
    GROUP BY stage_id, amount, payment_date
);

-- Add unique constraint
ALTER TABLE claim_payments
    ADD CONSTRAINT uq_claim_payments_stage_amount_date
    UNIQUE (stage_id, amount, payment_date);
