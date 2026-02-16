'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SparklesIcon, LoaderIcon, Languages, FileTextIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

/**
 * AI Translate button — translates text fields to all locales.
 * @param {Object} props
 * @param {Object} props.fields - { title: "...", des: "..." } text fields to translate
 * @param {string} props.context - e.g. "trade-in product" or "blog post"
 * @param {Function} props.onResult - called with { title_i18n: {...}, des_i18n: {...} }
 * @param {string} [props.className]
 */
export function AITranslateButton({ fields, context, onResult, className }) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.ai')

  const handleTranslate = async () => {
    // Filter out empty fields
    const nonEmpty = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v && typeof v === 'string' && v.trim())
    )
    if (Object.keys(nonEmpty).length === 0) {
      toast.error('No text to translate')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate', fields: nonEmpty, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Translation failed')

      onResult(data.translations)
      const localeCount = Object.values(data.translations)[0]
        ? Object.keys(Object.values(data.translations)[0]).length
        : 0
      toast.success(t('translateSuccess', { count: localeCount }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleTranslate}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <LoaderIcon className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : (
        <Languages className="w-3.5 h-3.5 mr-1.5" />
      )}
      {loading ? t('translating') : t('translate')}
    </Button>
  )
}

/**
 * AI Translate Questions button — translates questions array to all locales.
 * @param {Object} props
 * @param {Array} props.questions - questions array to translate
 * @param {string} props.context
 * @param {Function} props.onResult - called with questions_i18n object
 */
export function AITranslateQuestionsButton({ questions, context, onResult, className }) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.ai')

  const handleTranslate = async () => {
    if (!questions || questions.length === 0) {
      toast.error('No questions to translate')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate_questions', questions, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Translation failed')

      onResult(data.questions_i18n)
      const localeCount = Object.keys(data.questions_i18n).length
      toast.success(t('translateSuccess', { count: localeCount }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleTranslate}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <LoaderIcon className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : (
        <Languages className="w-3.5 h-3.5 mr-1.5" />
      )}
      {loading ? t('translating') : t('translateQuestions')}
    </Button>
  )
}

/**
 * AI Generate button — generates content using AI.
 * @param {Object} props
 * @param {"blog_content"|"blog_excerpt"|"product_description"} props.type
 * @param {string} props.prompt - or used as fallback
 * @param {Object} [props.context] - { title, category, content, brand }
 * @param {Function} props.onResult - called with generated text string
 * @param {string} [props.label]
 * @param {string} [props.className]
 */
export function AIGenerateButton({ type, prompt, context, onResult, label, className }) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.ai')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', type, prompt: prompt || '', context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      onResult(data.result)
      toast.success(t('generateSuccess'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const defaultLabel =
    type === 'blog_content' ? t('generateContent') : type === 'blog_excerpt' ? t('generateExcerpt') : t('generate')

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <LoaderIcon className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : (
        <SparklesIcon className="w-3.5 h-3.5 mr-1.5" />
      )}
      {loading ? t('generating') : label || defaultLabel}
    </Button>
  )
}
