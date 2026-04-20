/**
 * One-time script to translate all question templates via OpenRouter AI.
 * Fires all unique question sets in PARALLEL using the same model.
 * Usage: node scripts/translate-templates.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envFile = readFileSync(resolve(import.meta.dirname, '../.env.local'), 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE
const OPENROUTER_KEY = env.OPENROUTER_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENROUTER_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const LOCALE_NAMES = {
  'zh-CN': 'Simplified Chinese',
  'zh-HK': 'Traditional Chinese',
  ar: 'Arabic', nl: 'Dutch', fr: 'French', de: 'German',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', pl: 'Polish',
  pt: 'Portuguese', ru: 'Russian', es: 'Spanish', sv: 'Swedish',
}

const MODEL = 'google/gemini-3-flash-preview'

async function translateSet(textOnly) {
  const localeList = Object.entries(LOCALE_NAMES).map(([c, n]) => `"${c}" (${n})`).join(', ')

  const systemPrompt = `You are a professional translator for a tech trade-in website called DepxTech. Translate questionnaire questions and answer options accurately. Keep brand names (AT&T, T-Mobile, Verizon, ASUS, GIGABYTE, MSI, Intel, AMD, etc.) and storage sizes (64 GB, 128 GB, etc.) unchanged. Context: product condition questionnaire.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code fences.`

  const userPrompt = `Translate these questions to: ${localeList}

${JSON.stringify(textOnly)}

Return a JSON object where each key is a locale code and the value is the translated questions array: { "zh-CN": [{title, description, ans:[{content, description}]}], ... }`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://depxtech.com',
      'X-Title': 'DepxTech Admin Script',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 16384,
    }),
  })

  if (!res.ok) throw new Error(`${MODEL}: ${res.status} ${await res.text()}`)

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || ''
  const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}

async function main() {
  console.log('Fetching templates...')
  const { data: templates, error } = await supabase
    .from('trade_question_templates')
    .select('*')
    .order('created_at')

  if (error) { console.error(error); process.exit(1) }
  console.log(`Found ${templates.length} templates`)

  // Group by unique text fingerprint
  const groups = new Map()
  for (const t of templates) {
    if (!t.questions?.length) { console.log(`  Skip "${t.name}" (empty)`); continue }
    const textOnly = t.questions.map(q => ({
      title: q.title,
      description: q.description || '',
      ans: (q.ans || []).map(a => ({ content: a.content, description: a.description || '' }))
    }))
    const fp = JSON.stringify(textOnly)
    if (!groups.has(fp)) groups.set(fp, { textOnly, templates: [] })
    groups.get(fp).templates.push(t)
  }

  const sets = [...groups.values()]
  console.log(`${sets.length} unique question sets — firing ${sets.length} parallel requests`)

  // Fire ALL requests in parallel
  const promises = sets.map((s, i) => {
    console.log(`  SET_${i} -> ${MODEL} (${s.templates.map(t => t.name).join(', ')})`)
    return translateSet(s.textOnly)
      .then(i18n => ({ index: i, i18n, error: null }))
      .catch(err => ({ index: i, i18n: null, error: err.message }))
  })

  console.log('\nWaiting for all translations...')
  const results = await Promise.all(promises)

  // Write results to DB
  let updated = 0
  for (const { index, i18n, error: err } of results) {
    if (err) { console.error(`SET_${index} FAILED: ${err}`); continue }

    const localeCount = Object.keys(i18n).length
    console.log(`\nSET_${index}: ${localeCount} locales`)

    for (const t of sets[index].templates) {
      const { error: dbErr } = await supabase
        .from('trade_question_templates')
        .update({ questions_i18n: i18n })
        .eq('id', t.id)

      if (dbErr) { console.error(`  Error "${t.name}":`, dbErr); continue }
      console.log(`  Updated "${t.name}"`)
      updated++

      // Propagate to linked products
      const { data: prods } = await supabase
        .from('tradable_products')
        .update({ questions_i18n: i18n })
        .eq('question_template_id', t.id)
        .select('id')

      if (prods?.length) console.log(`    -> ${prods.length} products`)
    }
  }

  console.log(`\nDone! Updated ${updated} templates.`)
}

main().catch(console.error)
