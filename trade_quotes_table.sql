-- Create trade_quotes table for storing trade-in quote requests
-- Run this SQL in your Supabase SQL editor to create the table

CREATE TABLE IF NOT EXISTS "public"."trade_quotes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "product_id" uuid NOT NULL,
    "product_title" text NOT NULL,
    "condition" text NOT NULL,
    "estimated_value" numeric NOT NULL,
    "customer_name" text NOT NULL,
    "customer_email" text NOT NULL,
    "customer_phone" text,
    "notes" text,
    "user_id" uuid,
    "status" text DEFAULT 'pending' NOT NULL,
    "shipping_method" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "trade_quotes_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint to tradable_products (optional)
-- ALTER TABLE "public"."trade_quotes" 
-- ADD CONSTRAINT "trade_quotes_product_id_fkey" 
-- FOREIGN KEY ("product_id") REFERENCES "public"."tradable_products"("id") ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS "idx_trade_quotes_product_id" ON "public"."trade_quotes"("product_id");
CREATE INDEX IF NOT EXISTS "idx_trade_quotes_status" ON "public"."trade_quotes"("status");
CREATE INDEX IF NOT EXISTS "idx_trade_quotes_created_at" ON "public"."trade_quotes"("created_at");

-- Enable RLS (Row Level Security)
ALTER TABLE "public"."trade_quotes" ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert quotes (public submissions)
CREATE POLICY "Allow public quote submissions" ON "public"."trade_quotes"
    FOR INSERT
    TO "anon", "authenticated"
    WITH CHECK (true);

-- Allow users to view their own quotes
CREATE POLICY "Users can view own quotes" ON "public"."trade_quotes"
    FOR SELECT
    TO "authenticated"
    USING (( SELECT auth.uid() AS uid) = user_id);

-- Allow service role to do everything (for admin operations)
-- This is handled by service_role key, no policy needed

-- Grant permissions
GRANT ALL ON TABLE "public"."trade_quotes" TO "anon";
GRANT ALL ON TABLE "public"."trade_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_quotes" TO "service_role";

-- Create trigger to update updated_at
CREATE OR REPLACE TRIGGER "update_trade_quotes_updated_at" 
    BEFORE UPDATE ON "public"."trade_quotes" 
    FOR EACH ROW 
    EXECUTE FUNCTION "public"."update_updated_at_column"();
