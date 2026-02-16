'use client'

import { useTranslations } from 'next-intl'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
  FileTextIcon,
  EyeIcon,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminBlogPage() {
  const router = useTransitionRouter()
  const t = useTranslations('admin.blog')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/blog')
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to fetch posts')
        setPosts(data.posts || [])
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = searchTerm
    ? posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : posts

  const handleDelete = async (postId) => {
    if (!confirm(t('deleteConfirm'))) return

    setDeleting(postId)
    try {
      const response = await fetch(`/api/admin/blog?id=${postId}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete')
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      toast.success('Post deleted')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <Button onClick={() => router.push('/admin/blog/add')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('addPost')}
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('searchPlaceholder')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('totalPosts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('publishedPosts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {posts.filter((p) => p.published).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <div className="grid gap-3">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">{t('noPostsFound')}</div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FileTextIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant={post.published ? 'default' : 'secondary'}>
                          {post.published ? t('published') : t('draft')}
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                        {post.featured && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            {t('featured')}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                    >
                      {deleting === post.id ? (
                        <div className="w-4 h-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
