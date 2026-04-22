-- Migration v10: Add Paddle specific columns to profiles

-- We are adding the new columns for Paddle Billing while preserving the old Stripe ones
-- just in case historical records are needed.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;

-- We don't need any special RLS for these columns as they fall under the existing profiles RLS 
-- which allows users to read their own profiles, and the backend service role to update them.
