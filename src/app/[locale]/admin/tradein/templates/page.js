"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ArrowLeftIcon,
    PlusIcon,
    SearchIcon,
    FileTextIcon,
    EditIcon,
    TrashIcon,
    MoreHorizontalIcon,
    CopyIcon,
    HelpCircleIcon,
    LoaderIcon,
    CheckIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function TemplatesPage() {
    const router = useTransitionRouter()
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleting, setDeleting] = useState(null)

    // Create template dialog state
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState('')
    const [creating, setCreating] = useState(false)

    // Fetch templates
    useEffect(() => {
        fetchTemplates()
    }, [])

    async function fetchTemplates() {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/tradein/templates?withCounts=true')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch templates')
            }

            setTemplates(data.templates || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return template.name?.toLowerCase().includes(search)
    })

    // Create new template
    const handleCreate = async () => {
        if (!newTemplateName.trim()) {
            toast.error('Please enter a template name')
            return
        }

        setCreating(true)
        try {
            const response = await fetch('/api/admin/tradein/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTemplateName.trim(),
                    questions: []
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create template')
            }

            toast.success('Template created!')
            setShowCreateDialog(false)
            setNewTemplateName('')

            // Navigate to edit the new template
            router.push(`/admin/tradein/templates/${data.template.id}`)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setCreating(false)
        }
    }

    // Delete template
    const handleDelete = async (templateId) => {
        const tmpl = templates.find(t => t.id === templateId)
        const linkedCount = tmpl?.linked_product_count || 0
        const msg = linkedCount > 0
            ? `This template is linked to ${linkedCount} product${linkedCount !== 1 ? 's' : ''}. Deleting it will unlink them (their questions will be kept). Continue?`
            : 'Delete this template? This cannot be undone.'
        if (!confirm(msg)) return

        setDeleting(templateId)
        try {
            const response = await fetch(`/api/admin/tradein/templates?id=${templateId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete template')
            }

            setTemplates(prev => prev.filter(t => t.id !== templateId))
            toast.success('Template deleted')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setDeleting(null)
        }
    }

    // Duplicate template
    const handleDuplicate = async (template) => {
        try {
            const response = await fetch('/api/admin/tradein/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${template.name} (Copy)`,
                    questions: template.questions || []
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to duplicate template')
            }

            setTemplates(prev => [data.template, ...prev])
            toast.success('Template duplicated')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Question Templates</h1>
                </div>
                <div className="flex items-center justify-center py-20">
                    <LoaderIcon className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Question Templates</h1>
                </div>
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="pt-6">
                        <p className="text-red-800 dark:text-red-400 text-center">{error}</p>
                        <div className="flex justify-center mt-4">
                            <Button onClick={fetchTemplates}>Try Again</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Question Templates</h1>
                        <p className="text-sm text-muted-foreground">
                            {templates.length} template{templates.length !== 1 ? 's' : ''} available
                        </p>
                    </div>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <PlusIcon className="w-4 h-4 mr-1.5" />
                    New Template
                </Button>
            </div>

            {/* Search */}
            {templates.length > 0 && (
                <div className="relative max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search templates..."
                        className="pl-9"
                    />
                </div>
            )}

            {/* Templates List */}
            {templates.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="font-semibold text-lg mb-2">No Templates Yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Create reusable question templates that can be applied to multiple trade-in products.
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create First Template
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : filteredTemplates.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No templates match your search.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => {
                        const questionCount = template.questions?.length || 0

                        return (
                            <Card
                                key={template.id}
                                className="group hover:shadow-md transition-all cursor-pointer"
                                onClick={() => router.push(`/admin/tradein/templates/${template.id}`)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <FileTextIcon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                                    {template.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <Badge variant="secondary" className="text-xs">
                                                        <HelpCircleIcon className="w-3 h-3 mr-1" />
                                                        {questionCount} question{questionCount !== 1 ? 's' : ''}
                                                    </Badge>
                                                    {(template.linked_product_count || 0) > 0 && (
                                                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
                                                            {template.linked_product_count} product{template.linked_product_count !== 1 ? 's' : ''} linked
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Updated {formatDate(template.updated_at || template.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                    <MoreHorizontalIcon className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation()
                                                    router.push(`/admin/tradein/templates/${template.id}`)
                                                }}>
                                                    <EditIcon className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDuplicate(template)
                                                }}>
                                                    <CopyIcon className="w-4 h-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(template.id)
                                                    }}
                                                    disabled={deleting === template.id}
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Questions Preview */}
                                    {questionCount > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="space-y-1">
                                                {template.questions.slice(0, 3).map((q, i) => (
                                                    <div key={i} className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                                                        <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        {q.title || 'Untitled question'}
                                                    </div>
                                                ))}
                                                {questionCount > 3 && (
                                                    <p className="text-xs text-muted-foreground pl-5">
                                                        +{questionCount - 3} more
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create Template Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Template</DialogTitle>
                        <DialogDescription>
                            Create a reusable set of questions for trade-in products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Template name (e.g., Smartphone Questions)"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCreate()
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={creating || !newTemplateName.trim()}>
                            {creating ? (
                                <>
                                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="w-4 h-4 mr-2" />
                                    Create Template
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
