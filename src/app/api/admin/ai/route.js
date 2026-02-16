import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'google/gemini-3-flash-preview'

const LOCALE_NAMES = {
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  ar: 'Arabic',
  nl: 'Dutch',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pl: 'Polish',
  pt: 'Portuguese',
  ru: 'Russian',
  es: 'Spanish',
  sv: 'Swedish',
}

async function callOpenRouter(messages, overrideModel) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com',
      'X-Title': 'DepxTech Admin',
    },
    body: JSON.stringify({
      model: overrideModel || MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 16384,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function handleTranslate(body) {
  const { fields, targetLocales, context } = body
  if (!fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'fields is required' }, { status: 400 })
  }

  const locales = targetLocales || Object.keys(LOCALE_NAMES)
  const fieldEntries = Object.entries(fields).filter(([, v]) => v && typeof v === 'string' && v.trim())

  if (fieldEntries.length === 0) {
    return NextResponse.json({ error: 'No non-empty text fields to translate' }, { status: 400 })
  }

  const fieldDescriptions = fieldEntries.map(([k, v]) => `"${k}": "${v}"`).join('\n')
  const localeList = locales.map((l) => `"${l}" (${LOCALE_NAMES[l] || l})`).join(', ')

  const systemPrompt = `You are a professional translator for a tech trade-in and e-commerce website called DepxTech. Translate the given fields accurately, keeping technical terms (brand names, model names like "iPhone", "MacBook") unchanged. Keep translations natural and concise. Context: ${context || 'website content'}.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code fences.`

  const userPrompt = `Translate the following fields to these locales: ${localeList}

Fields:
${fieldDescriptions}

Return a JSON object where each key is "{fieldName}_i18n" and each value is an object mapping locale codes to translated strings. Example format:
{"title_i18n": {"zh-CN": "...", "ja": "..."}, "des_i18n": {"zh-CN": "...", "ja": "..."}}`

  const raw = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])

  // Parse JSON from response (strip markdown code fences if present)
  const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json({ success: true, translations: parsed })
}

async function handleTranslateQuestions(body) {
  const { questions, targetLocales, context } = body
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'questions array is required' }, { status: 400 })
  }

  const locales = targetLocales || Object.keys(LOCALE_NAMES)
  const localeList = locales.map((l) => `"${l}" (${LOCALE_NAMES[l] || l})`).join(', ')

  const systemPrompt = `You are a professional translator for a tech trade-in website called DepxTech. Translate questionnaire questions and answer options accurately. Keep brand/model names unchanged. Context: ${context || 'product condition questionnaire'}.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code fences.`

  const questionsJson = JSON.stringify(
    questions.map((q) => ({
      title: q.title,
      description: q.description || '',
      ans: (q.ans || []).map((a) => ({
        content: a.content,
        description: a.description || '',
      })),
    }))
  )

  const userPrompt = `Translate these product condition questions and their answer options to: ${localeList}

Questions:
${questionsJson}

Return a JSON object where each key is a locale code and the value is the translated questions array with the SAME structure (title, description, ans[{content, description}]). Example:
{"zh-CN": [{"title": "...", "description": "...", "ans": [{"content": "...", "description": "..."}]}]}`

  const raw = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])

  const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json({ success: true, questions_i18n: parsed })
}

async function handleGenerate(body) {
  const { type, prompt, context } = body
  if (!type || !prompt) {
    return NextResponse.json({ error: 'type and prompt are required' }, { status: 400 })
  }

  let systemPrompt = ''
  let userPrompt = prompt

  switch (type) {
    case 'blog_content':
      systemPrompt = `You are a content writer for DepxTech, a tech trade-in and e-commerce company. Write engaging, informative blog posts in markdown format. Include headings (##, ###), bullet points, and clear structure. Keep the tone professional yet approachable. Category: ${context?.category || 'Tech'}.`
      userPrompt = `Write a blog post with the title: "${context?.title || prompt}"

Requirements:
- Use markdown format with ## and ### headings
- Include an introduction, 3-5 main sections, and a conclusion
- Keep it between 500-800 words
- Make it SEO-friendly and informative
- Do NOT include the title as an H1 heading (it's already displayed separately)`
      break

    case 'blog_excerpt':
      systemPrompt = `You are a content writer for DepxTech. Write a brief, compelling excerpt/summary for a blog post. Keep it to 1-2 sentences, under 160 characters ideally.`
      userPrompt = `Write a short excerpt for a blog post titled "${context?.title || ''}". ${context?.content ? `The content starts with: "${context.content.slice(0, 300)}..."` : prompt}`
      break

    case 'product_description':
      systemPrompt = `You are a product copywriter for DepxTech, a tech trade-in platform. Write concise, informative product descriptions for trade-in listings.`
      userPrompt = `Write a short product description (1-2 sentences) for: ${context?.title || prompt}. Category: ${context?.category || 'Electronics'}, Brand: ${context?.brand || 'Unknown'}.`
      break

    default:
      return NextResponse.json({ error: `Unknown generate type: ${type}` }, { status: 400 })
  }

  const result = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])

  return NextResponse.json({ success: true, result: result.trim() })
}

const ALLOWED_MODELS = [
  'google/gemini-3-flash-preview',
  'arcee-ai/trinity-large-preview:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'meta-llama/llama-4-maverick:free',
  'qwen/qwen3-235b-a22b:free',
]

function buildTradeinPrompts(command, productContext) {
  const systemPrompt = `You are an AI assistant for DepxTech's trade-in product management system. You parse admin commands (in Chinese, English, or mixed) and generate structured actions to manage trade-in products.

You have access to the current product catalog below. Based on the admin's command, generate a JSON array of actions.

RULES:
1. For "add" actions: generate product entries with title, category, brand, series, and a reasonable base_price (estimate based on current market resale value). Be THOROUGH — generate ALL well-known models for the requested series/brand (e.g. for "all Surface products" generate Surface Pro 11, Surface Pro 10, Surface Laptop 7, Surface Laptop 6, Surface Laptop Studio 2, Surface Laptop Go 3, Surface Go 4, etc.). Do NOT limit to just 5 — include every mainstream model you know. If the admin says "all", they mean comprehensive coverage.
2. For "delete" actions: match existing products by brand, series, title keywords, or category. Always include the product's "id" from the catalog. Only match products that actually exist.
3. For "update" actions: match existing products and specify the field(s) to change. For percentage changes (e.g. "reduce by 10%"), calculate the new numeric value. Always include the product's "id". Updatable fields: base_price, depreciation_rate, is_featured, title, des, category, brand, series.
4. Use case-insensitive fuzzy matching for brand/series names (e.g., "surface" matches "Surface", "pixel" matches "Pixel", "apple" matches "Apple").
5. If the command is ambiguous or you cannot determine the intent, return an empty actions array with a "summary" explaining why.
6. Each action MUST have a human-readable "description" field in the language the admin used.
7. Never invent product IDs. For delete/update, only use IDs from the catalog.

CURRENT PRODUCT CATALOG (${productContext.length} products):
${JSON.stringify(productContext)}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation outside the JSON.`

  const userPrompt = `Admin command: "${command}"

Return a JSON object with this exact structure:
{
  "actions": [
    {
      "type": "add" | "delete" | "update",
      "description": "Human-readable description of this action",
      "data": {}
    }
  ],
  "summary": "Brief summary of what was understood from the command",
  "matched_count": 0
}

For "add" type data: { "title": "...", "category": "...", "brand": "...", "series": "...", "base_price": 0, "des": "..." }
For "delete" type data: { "id": "existing-uuid", "title": "product name for display" }
For "update" type data: { "id": "existing-uuid", "title": "product name for display", "fields": { "field_name": "new_value" } }`

  return { systemPrompt, userPrompt }
}

async function handleTradeinCommand(body) {
  const { command, productContext, model } = body

  if (!command || typeof command !== 'string' || !command.trim()) {
    return NextResponse.json({ error: 'Command is required' }, { status: 400 })
  }

  if (!productContext || !Array.isArray(productContext)) {
    return NextResponse.json({ error: 'Product context is required' }, { status: 400 })
  }

  const { systemPrompt, userPrompt } = buildTradeinPrompts(command, productContext)
  const selectedModel = model && ALLOWED_MODELS.includes(model) ? model : ALLOWED_MODELS[0]

  const raw = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], selectedModel)

  const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    return NextResponse.json({ success: true, result: parsed })
  } catch {
    return NextResponse.json(
      { error: 'AI returned invalid response. Please try again.', raw: cleaned },
      { status: 422 }
    )
  }
}

async function handleTradeinCommandStream(body) {
  const { command, productContext, model, chatHistory } = body

  if (!command || typeof command !== 'string' || !command.trim()) {
    return NextResponse.json({ error: 'Command is required' }, { status: 400 })
  }

  if (!productContext || !Array.isArray(productContext)) {
    return NextResponse.json({ error: 'Product context is required' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 })
  }

  const { systemPrompt, userPrompt } = buildTradeinPrompts(command, productContext)
  const selectedModel = model && ALLOWED_MODELS.includes(model) ? model : ALLOWED_MODELS[0]

  // Build messages with chat history for multi-turn context
  const messages = [{ role: 'system', content: systemPrompt }]
  if (Array.isArray(chatHistory)) {
    for (const msg of chatHistory.slice(-10)) { // Keep last 10 messages to avoid token overflow
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: String(msg.content || '') })
      }
    }
  }
  messages.push({ role: 'user', content: userPrompt })

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com',
      'X-Title': 'DepxTech Admin',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.3,
      max_tokens: 16384,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json(
      { error: `OpenRouter API error: ${res.status} ${err}` },
      { status: 502 }
    )
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const data = trimmed.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const token = parsed.choices?.[0]?.delta?.content
              if (token) {
                controller.enqueue(encoder.encode(token))
              }
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

export async function POST(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'translate':
        return await handleTranslate(body)
      case 'translate_questions':
        return await handleTranslateQuestions(body)
      case 'generate':
        return await handleGenerate(body)
      case 'tradein_command':
        return await handleTradeinCommand(body)
      case 'tradein_command_stream':
        return await handleTradeinCommandStream(body)
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in admin AI route:', error)
    return NextResponse.json(
      { error: error.message || 'AI request failed' },
      { status: 500 }
    )
  }
}
