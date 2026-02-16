'use client'

import { useTranslations } from 'next-intl'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeftIcon, SaveIcon, LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload, uploadFiles } from '@/components/admin/ImageUpload'
import BlogEditor from '@/components/admin/BlogEditor'
import { AITranslateButton, AIGenerateButton } from '@/components/admin/AIButton'
import TranslationEditor from '@/components/admin/TranslationEditor'

const CATEGORIES = ['Guides', 'Tips', 'Sustainability', 'Comparisons', 'Behind the Scenes', 'News']

export default function EditBlogPostPage() {
  const router = useTransitionRouter()
  const params = useParams()
  const t = useTranslations('admin.blog')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    category: 'Guides',
    author: 'DepxTech Team',
    date: '',
    read_time: '',
    image: '',
    featured: false,
    published: false,
    content: '',
    title_i18n: {},
    excerpt_i18n: {},
  })

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/admin/blog?id=${params.id}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to fetch post')

        const post = data.post
        setForm({
          id: post.id,
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          category: post.category || 'Guides',
          author: post.author || 'DepxTech Team',
          date: post.date || '',
          read_time: post.read_time || '',
          image: post.image || '',
          featured: post.featured || false,
          published: post.published || false,
          content: post.content || '',
          title_i18n: post.title_i18n || {},
          excerpt_i18n: post.excerpt_i18n || {},
        })
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchPost()
  }, [params.id])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      // Upload cover image if it's a File
      let imageUrl = form.image
      if (form.image instanceof File) {
        const urls = await uploadFiles([form.image], 'blog')
        imageUrl = urls[0] || null
      }

      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image: imageUrl }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update post')

      toast.success('Post updated!')
      router.push('/admin/blog')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/blog')}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('editPost')}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">{t('loading')}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/blog')}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('editPost')}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <SaveIcon className="w-4 h-4 mr-2" />
          )}
          {saving ? t('saving') : t('save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('postTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Post title..."
              />
              <div>
                <Label className="text-xs text-muted-foreground">{t('slug')}</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="post-url-slug"
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-muted-foreground">{t('excerpt')}</Label>
                  <AIGenerateButton
                    type="blog_excerpt"
                    prompt={form.title}
                    context={{ title: form.title, content: form.content }}
                    onResult={(text) => updateField('excerpt', text)}
                  />
                </div>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  placeholder="Short summary of the post..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">{t('content')}</CardTitle>
              <AIGenerateButton
                type="blog_content"
                prompt={form.title}
                context={{ title: form.title, category: form.category }}
                onResult={(text) => updateField('content', text)}
              />
            </CardHeader>
            <CardContent>
              <BlogEditor value={form.content} onChange={(val) => updateField('content', val)} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('coverImage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={form.image}
                onChange={(val) => updateField('image', val)}
                folder="blog"
                label=""
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">{t('category')}</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => updateField('category', val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">{t('author')}</Label>
                <Input
                  value={form.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">{t('readTime')}</Label>
                <Input
                  value={form.read_time}
                  onChange={(e) => updateField('read_time', e.target.value)}
                  placeholder="5 min read"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>{t('featured')}</Label>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(val) => updateField('featured', val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>{t('published')}</Label>
                <Switch
                  checked={form.published}
                  onCheckedChange={(val) => updateField('published', val)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Translations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('translations')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AITranslateButton
                fields={{ title: form.title, excerpt: form.excerpt }}
                context="blog post"
                onResult={(translations) => {
                  setForm((prev) => ({
                    ...prev,
                    title_i18n: translations.title_i18n || prev.title_i18n,
                    excerpt_i18n: translations.excerpt_i18n || prev.excerpt_i18n,
                  }))
                }}
              />
              <TranslationEditor
                fields={[
                  { key: 'title', label: 'Title', value: form.title },
                  { key: 'excerpt', label: 'Excerpt', value: form.excerpt },
                ]}
                i18nData={{ title_i18n: form.title_i18n, excerpt_i18n: form.excerpt_i18n }}
                onChange={(i18nKey, value) => updateField(i18nKey, value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
