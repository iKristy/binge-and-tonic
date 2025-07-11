-- Add the missing columns to the shows table for better error tracking
ALTER TABLE shows 
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error text DEFAULT NULL;