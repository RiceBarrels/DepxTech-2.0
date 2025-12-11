import { execSync } from 'child_process'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const PROJECT_ID = 'iyumymzfuppeqsuyjttk'
const OUTPUT_FILE = 'supabase-schema.sql'

async function fetchSchema() {
  console.log(`Fetching Supabase schema for project: ${PROJECT_ID}`)
  console.log('Using Supabase CLI...\n')

  try {
    // Check if supabase CLI is available via bunx
    console.log('Checking for Supabase CLI...')
    
    try {
      execSync('bunx supabase --version', { stdio: 'pipe' })
      console.log('✓ Supabase CLI found\n')
    } catch (error) {
      console.log('⚠ Supabase CLI not found. It will be downloaded automatically.\n')
    }

    // Check if project is already linked
    const isLinked = existsSync(join(process.cwd(), '.supabase', 'config.toml'))
    
    if (!isLinked) {
      console.log('Linking to Supabase project...')
      console.log('Note: You may need to login first with: bunx supabase login\n')
      
      try {
        // Link the project
        execSync(`bunx supabase link --project-ref ${PROJECT_ID}`, {
          stdio: 'inherit',
          cwd: process.cwd()
        })
        console.log('✓ Project linked successfully\n')
      } catch (error) {
        if (error.message.includes('not authenticated') || error.message.includes('login')) {
          console.log('\n⚠ Authentication required.')
          console.log('Please run: bunx supabase login')
          console.log('Then run this script again.\n')
          createAuthScript()
          return
        }
        throw error
      }
    } else {
      console.log('✓ Project already linked\n')
    }

    // Dump the schema
    console.log('Fetching schema...')
    try {
      const outputPath = join(process.cwd(), OUTPUT_FILE)
      execSync(`bunx supabase db dump --linked --schema public -f ${outputPath}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      })
      
      console.log(`\n✓ Schema successfully saved to ${OUTPUT_FILE}`)
      return
    } catch (error) {
      // Try alternative: use db-url if we have connection string
      console.log('\n⚠ Direct dump failed. Trying alternative method...\n')
      return await tryAlternativeMethod()
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.log('\nCreating alternative script...\n')
    createManualScript()
  }
}

async function tryAlternativeMethod() {
  // Try using Management API or provide instructions
  console.log('Alternative: Use database connection string')
  console.log('If you have your database connection string, you can run:')
  console.log(`  bunx supabase db dump --db-url "YOUR_CONNECTION_STRING" -f ${OUTPUT_FILE}`)
  console.log('\nOr use the Supabase dashboard to export your schema.')
  
  createManualScript()
}

function createAuthScript() {
  const scriptContent = `#!/usr/bin/env bun
import { execSync } from 'child_process'

const PROJECT_ID = '${PROJECT_ID}'

console.log('Supabase Schema Fetcher')
console.log('Project ID:', PROJECT_ID)
console.log('')

// Step 1: Login
console.log('Step 1: Checking authentication...')
try {
  execSync('bunx supabase projects list', { stdio: 'pipe' })
  console.log('✓ Already authenticated')
} catch {
  console.log('⚠ Not authenticated. Please login:')
  console.log('   bunx supabase login')
  console.log('')
  console.log('After logging in, run this script again.')
  process.exit(1)
}

// Step 2: Dump schema
console.log('Step 2: Fetching schema...')
try {
  execSync(\`bunx supabase db dump --project-ref \${PROJECT_ID} --schema public > supabase-schema.sql\`, {
    stdio: 'inherit'
  })
  console.log('')
  console.log('✓ Schema saved to supabase-schema.sql')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
`

  const scriptPath = join(process.cwd(), 'scripts', 'fetch-schema-auth.js')
  writeFileSync(scriptPath, scriptContent, 'utf8')
  console.log(`Created authentication script: scripts/fetch-schema-auth.js`)
  console.log('Run it with: bun scripts/fetch-schema-auth.js')
}

function createManualScript() {
  const scriptContent = `#!/usr/bin/env bun
// Manual Supabase Schema Fetcher
// Run this after authenticating with: bunx supabase login

import { execSync } from 'child_process'

const PROJECT_ID = '${PROJECT_ID}'

console.log('Fetching Supabase schema...')
console.log('Project ID:', PROJECT_ID)
console.log('')

try {
  execSync(\`bunx supabase db dump --project-ref \${PROJECT_ID} --schema public > supabase-schema.sql\`, {
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
`

  const scriptPath = join(process.cwd(), 'scripts', 'fetch-schema-manual.js')
  writeFileSync(scriptPath, scriptContent, 'utf8')
  
  const instructions = `# Supabase Schema Export Instructions

Project ID: ${PROJECT_ID}

## Quick Method (Recommended)
1. Run: \`bunx supabase login\`
2. Run: \`bunx supabase db dump --project-ref ${PROJECT_ID} --schema public > supabase-schema.sql\`

## Using the Script
1. Run: \`bun scripts/fetch-schema-manual.js\`
   (Make sure you're logged in first with: \`bunx supabase login\`)

## Alternative: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Database > Schema
3. Use the export feature

The schema will be saved as \`supabase-schema.sql\` in the project root.
`

  const instructionsPath = join(process.cwd(), 'SCHEMA_EXPORT.md')
  writeFileSync(instructionsPath, instructions, 'utf8')
  
  console.log(`Created manual script: scripts/fetch-schema-manual.js`)
  console.log(`Created instructions: SCHEMA_EXPORT.md`)
}

// Main execution
fetchSchema().catch(console.error)
