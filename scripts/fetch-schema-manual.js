#!/usr/bin/env bun
// Manual Supabase Schema Fetcher
// Run this after authenticating with: bunx supabase login

import { execSync } from 'child_process'

const PROJECT_ID = 'iyumymzfuppeqsuyjttk'

console.log('Fetching Supabase schema...')
console.log('Project ID:', PROJECT_ID)
console.log('')

try {
  execSync(`bunx supabase db dump --project-ref ${PROJECT_ID} --schema public > supabase-schema.sql`, {
    stdio: 'inherit'
  })
  console.log('')
  console.log('✓ Schema saved to supabase-schema.sql')
} catch (error) {
  console.error('❌ Error:', error.message)
  console.log('')
  console.log('Make sure you are logged in: bunx supabase login')
  process.exit(1)
}
