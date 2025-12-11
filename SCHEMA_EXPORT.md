# Supabase Schema Export Instructions

Project ID: iyumymzfuppeqsuyjttk

## Quick Method (Recommended)
1. Run: `bunx supabase login`
2. Run: `bunx supabase db dump --project-ref iyumymzfuppeqsuyjttk --schema public > supabase-schema.sql`

## Using the Script
1. Run: `bun scripts/fetch-schema-manual.js`
   (Make sure you're logged in first with: `bunx supabase login`)

## Alternative: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Database > Schema
3. Use the export feature

The schema will be saved as `supabase-schema.sql` in the project root.
