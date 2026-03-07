"use client"

import { useParams } from "next/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowLeftIcon,
    SaveIcon,
    LoaderIcon,
    PlusIcon,
    TrashIcon,
    HelpCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CopyIcon,
    EyeIcon,
    EyeOffIcon,
    UndoIcon,
    AlertCircleIcon,
    GripVerticalIcon,
    GlobeIcon,
    GitBranchIcon,
    CornerDownRightIcon,
    ExternalLinkIcon,
    ImportIcon,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import { AITranslateQuestionsButton } from '@/components/admin/AIButton'
import { cn } from '@/lib/utils'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const genId = () => Math.random().toString(36).slice(2, 10)

const LOCALE_NAMES = {
    'zh-CN': '简体中文', 'zh-HK': '繁體中文',
    ar: 'العربية', nl: 'Nederlands', fr: 'Français', de: 'Deutsch',
    it: 'Italiano', ja: '日本語', ko: '한국어', pl: 'Polski',
    pt: 'Português', ru: 'Русский', es: 'Español', sv: 'Svenska',
}

function SortableItem({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto',
    }
    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {children({ listeners, isDragging })}
        </div>
    )
}

export default function EditTemplatePage() {
    const { id } = useParams()
    const router = useTransitionRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [template, setTemplate] = useState(null)
    const [name, setName] = useState('')
    const [questions, setQuestions] = useState([])
    const [originalName, setOriginalName] = useState('')
    const [originalQuestions, setOriginalQuestions] = useState([])
    const [questionsI18n, setQuestionsI18n] = useState({})
    const [originalQuestionsI18n, setOriginalQuestionsI18n] = useState({})
    const [expandedQuestions, setExpandedQuestions] = useState(new Set())
    const [selectedLocale, setSelectedLocale] = useState(null)
    const [showPreview, setShowPreview] = useState(false)
    const [linkedProductCount, setLinkedProductCount] = useState(0)
    const [parentTemplateId, setParentTemplateId] = useState(null)
    const [originalParentTemplateId, setOriginalParentTemplateId] = useState(null)
    const [allTemplates, setAllTemplates] = useState([])
    const [childTemplates, setChildTemplates] = useState([])

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    const handleQuestionDragEnd = (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = questions.findIndex(q => q._dndId === active.id)
        const newIndex = questions.findIndex(q => q._dndId === over.id)
        if (oldIndex === -1 || newIndex === -1) return
        const reordered = arrayMove(questions, oldIndex, newIndex)
        setQuestions(reordered)
        setExpandedQuestions(prev => {
            const next = new Set()
            prev.forEach(idx => {
                const dndId = questions[idx]?._dndId
                if (dndId) {
                    const newIdx = reordered.findIndex(q => q._dndId === dndId)
                    if (newIdx !== -1) next.add(newIdx)
                }
            })
            return next
        })
    }

    const handleAnswerDragEnd = (qIndex) => (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setQuestions(prev => {
            const updated = [...prev]
            const q = { ...updated[qIndex] }
            const oldIdx = q.ans.findIndex(a => a._dndId === active.id)
            const newIdx = q.ans.findIndex(a => a._dndId === over.id)
            if (oldIdx === -1 || newIdx === -1) return prev
            q.ans = arrayMove(q.ans, oldIdx, newIdx)
            updated[qIndex] = q
            return updated
        })
    }

    // Track unsaved changes
    const hasChanges = useMemo(() => {
        return name !== originalName || parentTemplateId !== originalParentTemplateId || JSON.stringify(questions) !== JSON.stringify(originalQuestions) || JSON.stringify(questionsI18n) !== JSON.stringify(originalQuestionsI18n)
    }, [name, originalName, parentTemplateId, originalParentTemplateId, questions, originalQuestions, questionsI18n, originalQuestionsI18n])

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handler = (e) => {
            if (hasChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [hasChanges])

    // Fetch template data
    useEffect(() => {
        async function fetchTemplate() {
            try {
                setLoading(true)
                const response = await fetch(`/api/admin/tradein/templates?withCounts=true`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch template')
                }

                const allTmpls = data.templates || []
                setAllTemplates(allTmpls)

                const foundTemplate = allTmpls.find(t => t.id === id)
                if (!foundTemplate) {
                    throw new Error('Template not found')
                }

                setTemplate(foundTemplate)
                setName(foundTemplate.name || '')
                setOriginalName(foundTemplate.name || '')
                setLinkedProductCount(foundTemplate.linked_product_count || 0)
                setParentTemplateId(foundTemplate.parent_template_id || null)
                setOriginalParentTemplateId(foundTemplate.parent_template_id || null)
                setChildTemplates(allTmpls.filter(t => t.parent_template_id === id))
                setQuestionsI18n(foundTemplate.questions_i18n || {})
                setOriginalQuestionsI18n(JSON.parse(JSON.stringify(foundTemplate.questions_i18n || {})))

                const q = (foundTemplate.questions || []).map(q => ({
                    ...q,
                    _dndId: genId(),
                    ans: (q.ans || []).map(a => ({ ...a, _dndId: genId() }))
                }))
                setQuestions(q)
                setOriginalQuestions(JSON.parse(JSON.stringify(q)))

                // Expand all questions by default
                setExpandedQuestions(new Set(q.map((_, i) => i)))
            } catch (err) {
                toast.error(err.message)
                router.push('/admin/tradein/templates')
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchTemplate()
    }, [id])

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Template name is required')
            return
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].title?.trim()) {
                toast.error(`Question ${i + 1} is missing a title`)
                setExpandedQuestions(prev => new Set([...prev, i]))
                return
            }
        }

        setSaving(true)
        try {
            const processedQuestions = await Promise.all(
                questions.map(async ({ _dndId, ...question }) => {
                    const questionImg = question.img instanceof File
                        ? (await uploadFiles(question.img, 'tradein/templates'))[0]
                        : question.img || null

                    const processedAnswers = await Promise.all(
                        (question.ans || []).map(async ({ _dndId: _aid, ...answer }) => {
                            const answerImg = answer.img instanceof File
                                ? (await uploadFiles(answer.img, 'tradein/templates'))[0]
                                : answer.img || null
                            return { ...answer, img: answerImg }
                        })
                    )

                    return { ...question, img: questionImg, ans: processedAnswers }
                })
            )

            const response = await fetch('/api/admin/tradein/templates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    name,
                    questions: processedQuestions,
                    questions_i18n: questionsI18n,
                    parent_template_id: parentTemplateId
                })
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update template')
            }

            setOriginalName(name)
            setOriginalParentTemplateId(parentTemplateId)
            setOriginalQuestions(JSON.parse(JSON.stringify(processedQuestions)))
            setOriginalQuestionsI18n(JSON.parse(JSON.stringify(questionsI18n)))
            setQuestions(processedQuestions)
            const parts = []
            if (data.updatedChildCount > 0) parts.push(`${data.updatedChildCount} child template${data.updatedChildCount !== 1 ? 's' : ''}`)
            if (data.updatedProductCount > 0) {
                setLinkedProductCount(data.updatedProductCount)
                parts.push(`${data.updatedProductCount} product${data.updatedProductCount !== 1 ? 's' : ''}`)
            }
            if (parts.length > 0) {
                toast.success(`Template saved! Synced ${parts.join(' and ')}.`)
            } else {
                toast.success('Template saved successfully')
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        setName(originalName)
        setParentTemplateId(originalParentTemplateId)
        setQuestions(JSON.parse(JSON.stringify(originalQuestions)))
        setQuestionsI18n(JSON.parse(JSON.stringify(originalQuestionsI18n)))
        toast.info('Changes discarded')
    }

    // ── Question operations ──────────────────────────────
    const addQuestion = () => {
        const newIndex = questions.length
        setQuestions(prev => [...prev, {
            _dndId: genId(),
            title: '',
            description: '',
            type: 'single',
            required: true,
            img: '',
            ans: []
        }])
        setExpandedQuestions(prev => new Set([...prev, newIndex]))
    }

    const removeQuestion = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index))
        setExpandedQuestions(prev => {
            const next = new Set()
            prev.forEach(i => {
                if (i < index) next.add(i)
                else if (i > index) next.add(i - 1)
            })
            return next
        })
    }

    const duplicateQuestion = (index) => {
        const copy = JSON.parse(JSON.stringify(questions[index]))
        copy.title = copy.title + ' (Copy)'
        copy._dndId = genId()
        copy.ans = (copy.ans || []).map(a => ({ ...a, _dndId: genId() }))
        const newQuestions = [...questions]
        newQuestions.splice(index + 1, 0, copy)
        setQuestions(newQuestions)
        setExpandedQuestions(prev => {
            const next = new Set()
            prev.forEach(i => {
                if (i <= index) next.add(i)
                else next.add(i + 1)
            })
            next.add(index + 1)
            return next
        })
    }

    const updateQuestion = (index, field, value) => {
        setQuestions(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const toggleQuestion = (index) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev)
            if (next.has(index)) next.delete(index)
            else next.add(index)
            return next
        })
    }

    const expandAll = () => setExpandedQuestions(new Set(questions.map((_, i) => i)))
    const collapseAll = () => setExpandedQuestions(new Set())

    // Import questions from another template
    const importFromTemplate = (templateId) => {
        const source = allTemplates.find(t => t.id === templateId)
        if (!source || !source.questions?.length) {
            toast.error('Template has no questions to import')
            return
        }
        const imported = source.questions.map(q => ({
            ...JSON.parse(JSON.stringify(q)),
            _dndId: genId(),
            ans: (q.ans || []).map(a => ({ ...a, _dndId: genId() }))
        }))
        const startIndex = questions.length
        setQuestions(prev => [...prev, ...imported])
        setExpandedQuestions(prev => {
            const next = new Set(prev)
            imported.forEach((_, i) => next.add(startIndex + i))
            return next
        })
        toast.success(`Imported ${imported.length} question${imported.length !== 1 ? 's' : ''} from "${source.name}"`)
    }

    // ── Answer operations ──────────────────────────────
    const addAnswer = (qIndex) => {
        setQuestions(prev => {
            const updated = [...prev]
            const q = { ...updated[qIndex] }
            q.ans = [...(q.ans || []), {
                _dndId: genId(),
                content: '',
                description: '',
                img: '',
                persentage: '',
                fixed: ''
            }]
            updated[qIndex] = q
            return updated
        })
    }

    const removeAnswer = (qIndex, aIndex) => {
        setQuestions(prev => {
            const updated = [...prev]
            const q = { ...updated[qIndex] }
            q.ans = q.ans.filter((_, i) => i !== aIndex)
            updated[qIndex] = q
            return updated
        })
    }

    const updateAnswer = (qIndex, aIndex, field, value) => {
        setQuestions(prev => {
            const updated = [...prev]
            const q = { ...updated[qIndex] }
            q.ans = [...q.ans]
            q.ans[aIndex] = { ...q.ans[aIndex], [field]: value }
            updated[qIndex] = q
            return updated
        })
    }

    // ── Question origin lookup ────────────────────────
    // Build a map: question title → list of template names that contain it
    const questionOriginMap = useMemo(() => {
        const map = {}
        const normalize = (t) => (t || '').trim().toLowerCase().replace(/[:：\s]+$/g, '')
        questions.forEach(q => {
            const key = normalize(q.title)
            if (!key) return
            const sources = []
            allTemplates.forEach(tmpl => {
                if (tmpl.id === id) return
                const has = (tmpl.questions || []).some(tq => normalize(tq.title) === key)
                if (has) sources.push({ id: tmpl.id, name: tmpl.name, isParent: tmpl.id === parentTemplateId })
            })
            map[key] = sources
        })
        return map
    }, [questions, allTemplates, parentTemplateId, id])

    // ── Loading state ──────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/tradein/templates')}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Template</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                            <LoaderIcon className="w-4 h-4 animate-spin" />
                            Loading template...
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // ── Percentage badge color ─────────────────────────
    const pctColor = (val) => {
        const n = parseFloat(val)
        if (isNaN(n) || n === 0) return 'bg-muted text-muted-foreground'
        return n > 0
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    }

    // ── Main render ──────────────────────────────────
    return (
        <div className="flex flex-col gap-0 min-h-screen">
            {/* ── Header ── */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 md:px-6 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="outline" size="sm" onClick={() => {
                            if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return
                            router.back()
                        }}>
                            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                            Back
                        </Button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold truncate">Edit Template</h1>
                                {linkedProductCount > 0 && (
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                        {linkedProductCount} product{linkedProductCount !== 1 ? 's' : ''} linked
                                    </Badge>
                                )}
                            </div>
                            {template && (
                                <p className="text-xs text-muted-foreground truncate">
                                    ID: {template.id.slice(0, 8)}...
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="hidden md:flex"
                        >
                            {showPreview ? <EyeOffIcon className="w-4 h-4 mr-1.5" /> : <EyeIcon className="w-4 h-4 mr-1.5" />}
                            {showPreview ? 'Hide' : 'Preview'}
                        </Button>
                        {hasChanges && (
                            <Button variant="ghost" size="sm" onClick={handleDiscard}>
                                <UndoIcon className="w-4 h-4 mr-1.5" />
                                Discard
                            </Button>
                        )}
                        <Button onClick={handleSave} disabled={saving} size="sm">
                            {saving ? (
                                <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" />
                            ) : (
                                <SaveIcon className="w-4 h-4 mr-1.5" />
                            )}
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Unsaved changes banner ── */}
            {hasChanges && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 md:px-6 py-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                        <AlertCircleIcon className="w-4 h-4 shrink-0" />
                        <span>You have unsaved changes</span>
                    </div>
                </div>
            )}

            {/* ── Body ── */}
            <div className={cn(
                "flex-1 p-4 md:p-6 gap-6",
                showPreview ? "grid grid-cols-1 lg:grid-cols-2 items-start" : "flex flex-col"
            )}>
                {/* ── Editor Column ── */}
                <div className="flex flex-col gap-4">
                    {/* Template Name + Parent */}
                    <Card>
                        <CardContent className="pt-5 pb-5 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">Template Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Smartphone Questions"
                                    className="text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1.5">
                                    <CornerDownRightIcon className="w-3.5 h-3.5" />
                                    Parent Template
                                </Label>
                                <Select
                                    value={parentTemplateId || '_none'}
                                    onValueChange={(v) => setParentTemplateId(v === '_none' ? null : v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="No parent template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_none">
                                            <span className="text-muted-foreground">None</span>
                                        </SelectItem>
                                        {allTemplates
                                            .filter(t => t.id !== id)
                                            .map(t => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    {t.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Link this template to a parent for organizational grouping.
                                </p>
                            </div>
                            {childTemplates.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1.5">
                                        <GitBranchIcon className="w-3.5 h-3.5" />
                                        Child Templates ({childTemplates.length})
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {childTemplates.map(ct => (
                                            <Badge
                                                key={ct.id}
                                                variant="outline"
                                                className="text-xs cursor-pointer hover:bg-muted transition-colors text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800"
                                                onClick={() => router.push(`/admin/tradein/templates/${ct.id}`)}
                                            >
                                                {ct.name}
                                                <ExternalLinkIcon className="w-3 h-3 ml-1" />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Questions Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <HelpCircleIcon className="w-4 h-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Questions ({questions.length})</h2>
                            {Object.keys(questionsI18n).length > 0 && (
                                <Select value={selectedLocale || '_none'} onValueChange={(v) => setSelectedLocale(v === '_none' ? null : v)}>
                                    <SelectTrigger className="h-7 w-auto gap-1.5 text-xs border-blue-300 text-blue-600 [&>svg]:hidden px-2">
                                        <GlobeIcon className="w-3.5 h-3.5 shrink-0" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_none">
                                            <span className="text-muted-foreground">English (source)</span>
                                        </SelectItem>
                                        {Object.keys(questionsI18n).map((locale) => (
                                            <SelectItem key={locale} value={locale}>
                                                {LOCALE_NAMES[locale] || locale} <span className="text-muted-foreground ml-1">({locale})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {questions.length > 0 && (
                                <>
                                    <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs h-7 px-2">
                                        Expand All
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs h-7 px-2">
                                        Collapse All
                                    </Button>
                                    <Separator orientation="vertical" className="h-4 mx-1" />
                                </>
                            )}
                            <AITranslateQuestionsButton
                                questions={questions.map(({ _dndId, ...q }) => ({
                                    ...q,
                                    ans: (q.ans || []).map(({ _dndId: _, ...a }) => a)
                                }))}
                                context="trade-in question template"
                                onResult={(i18n) => setQuestionsI18n(i18n)}
                                className="h-7"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7">
                                        <ImportIcon className="w-3.5 h-3.5 mr-1" />
                                        Import
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                                    <DropdownMenuLabel className="text-xs">Import questions from</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {parentTemplateId && (() => {
                                        const parent = allTemplates.find(t => t.id === parentTemplateId)
                                        if (!parent) return null
                                        return (
                                            <>
                                                <DropdownMenuItem onClick={() => importFromTemplate(parentTemplateId)}>
                                                    <CornerDownRightIcon className="w-3.5 h-3.5 mr-2 text-violet-500" />
                                                    <span className="font-medium">{parent.name}</span>
                                                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                                                        {parent.questions?.length || 0}
                                                    </Badge>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                            </>
                                        )
                                    })()}
                                    {allTemplates
                                        .filter(t => t.id !== id && t.id !== parentTemplateId && t.questions?.length > 0)
                                        .map(t => (
                                            <DropdownMenuItem key={t.id} onClick={() => importFromTemplate(t.id)}>
                                                {t.name}
                                                <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                                                    {t.questions?.length || 0}
                                                </Badge>
                                            </DropdownMenuItem>
                                        ))
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" size="sm" onClick={addQuestion} className="h-7">
                                <PlusIcon className="w-3.5 h-3.5 mr-1" />
                                Add Question
                            </Button>
                        </div>
                    </div>

                    {/* Questions List */}
                    {questions.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    <HelpCircleIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">No questions yet.</p>
                                    <Button variant="outline" onClick={addQuestion} className="mt-3" size="sm">
                                        <PlusIcon className="w-3.5 h-3.5 mr-1" />
                                        Add Your First Question
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
                        <SortableContext items={questions.map(q => q._dndId)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-2">
                            {questions.map((question, qIndex) => {
                                const isExpanded = expandedQuestions.has(qIndex)
                                return (
                                    <SortableItem key={question._dndId} id={question._dndId}>
                                    {({ listeners, isDragging }) => (
                                    <Card className={cn(
                                        "transition-colors",
                                        isExpanded ? "border-primary/30" : "hover:border-muted-foreground/30",
                                        isDragging && "shadow-lg"
                                    )}>
                                        {/* Collapsed header */}
                                        <div
                                            className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                                            onClick={() => toggleQuestion(qIndex)}
                                        >
                                            <button
                                                {...listeners}
                                                className="cursor-grab active:cursor-grabbing shrink-0 p-0.5 -ml-1 text-muted-foreground hover:text-foreground touch-none"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <GripVerticalIcon className="w-4 h-4" />
                                            </button>
                                            {isExpanded
                                                ? <ChevronDownIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                : <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                            }
                                            <span className="text-xs font-bold text-muted-foreground shrink-0 w-6">
                                                Q{qIndex + 1}
                                            </span>
                                            <span className={cn(
                                                "flex-1 text-sm truncate",
                                                question.title ? "text-foreground font-medium" : "text-muted-foreground italic"
                                            )}>
                                                {question.title || 'Untitled question'}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                    {question.type === 'opposite_multiple' ? 'Opp. Multi' : question.type === 'multiple' ? 'Multi' : 'Single'}
                                                </Badge>
                                                {question.required !== false && (
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-amber-600 border-amber-300">
                                                        Required
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                    {question.ans?.length || 0} ans
                                                </Badge>
                                                {(() => {
                                                    const key = (question.title || '').trim().toLowerCase().replace(/[:：\s]+$/g, '')
                                                    const sources = questionOriginMap[key]
                                                    if (!sources?.length) return null
                                                    const parentSource = sources.find(s => s.isParent)
                                                    const siblingCount = sources.filter(s => !s.isParent).length
                                                    return (
                                                        <>
                                                            {parentSource && (
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-violet-600 border-violet-300 dark:text-violet-400 dark:border-violet-700">
                                                                    <CornerDownRightIcon className="w-2.5 h-2.5 mr-0.5" />
                                                                    {parentSource.name}
                                                                </Badge>
                                                            )}
                                                            {siblingCount > 0 && (
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-sky-600 border-sky-300 dark:text-sky-400 dark:border-sky-700">
                                                                    +{siblingCount}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                            {/* Action buttons on collapsed row */}
                                            <div className="flex items-center gap-0.5 shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                                                    onClick={() => duplicateQuestion(qIndex)}
                                                    title="Duplicate"
                                                >
                                                    <CopyIcon className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                                    onClick={() => removeQuestion(qIndex)}
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded content */}
                                        {isExpanded && (
                                            <CardContent className="pt-0 pb-4 space-y-4">
                                                <Separator />

                                                {/* Question fields */}
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="space-y-1.5 sm:col-span-2">
                                                            <Label className="text-xs font-medium text-muted-foreground">Question Title</Label>
                                                            <Input
                                                                value={question.title}
                                                                onChange={(e) => updateQuestion(qIndex, 'title', e.target.value)}
                                                                placeholder="Enter question text..."
                                                            />
                                                            {selectedLocale && questionsI18n[selectedLocale]?.[qIndex]?.title && (
                                                                <div className="flex items-start gap-1.5 mt-1">
                                                                    <GlobeIcon className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                                                                    <span className="text-xs text-blue-600 dark:text-blue-400">{questionsI18n[selectedLocale][qIndex].title}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5 sm:col-span-2">
                                                            <Label className="text-xs font-medium text-muted-foreground">Description (optional)</Label>
                                                            <Input
                                                                value={question.description || ''}
                                                                onChange={(e) => updateQuestion(qIndex, 'description', e.target.value)}
                                                                placeholder="Helper text shown below the question..."
                                                                className="text-sm"
                                                            />
                                                            {selectedLocale && questionsI18n[selectedLocale]?.[qIndex]?.description && (
                                                                <div className="flex items-start gap-1.5 mt-1">
                                                                    <GlobeIcon className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                                                                    <span className="text-xs text-blue-600 dark:text-blue-400">{questionsI18n[selectedLocale][qIndex].description}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-xs text-muted-foreground">Type:</Label>
                                                            <Select
                                                                value={question.type || 'single'}
                                                                onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
                                                            >
                                                                <SelectTrigger className="h-8 w-[140px] text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="single">Single Select</SelectItem>
                                                                    <SelectItem value="multiple">Multiple Select</SelectItem>
                                                                    <SelectItem value="opposite_multiple">Opposite Multi-Select</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Checkbox
                                                                id={`req-${qIndex}`}
                                                                checked={question.required !== false}
                                                                onCheckedChange={(c) => updateQuestion(qIndex, 'required', c)}
                                                            />
                                                            <Label htmlFor={`req-${qIndex}`} className="text-xs text-muted-foreground cursor-pointer">
                                                                Required
                                                            </Label>
                                                        </div>
                                                    </div>

                                                    <ImageUpload
                                                        value={question.img || ''}
                                                        onChange={(url) => updateQuestion(qIndex, 'img', url)}
                                                        multiple={false}
                                                        folder="tradein/templates"
                                                        label=""
                                                        onDelete={deleteFileFromBucket}
                                                        compact={true}
                                                        placeholder="Question image (optional)"
                                                    />
                                                </div>

                                                {/* Answers */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Answers ({question.ans?.length || 0})
                                                    </Label>

                                                    {(!question.ans || question.ans.length === 0) ? (
                                                        <div className="border border-dashed rounded-lg py-6 text-center text-muted-foreground text-xs">
                                                            No answers yet.
                                                        </div>
                                                    ) : (
                                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAnswerDragEnd(qIndex)}>
                                                        <SortableContext items={(question.ans || []).map(a => a._dndId)} strategy={verticalListSortingStrategy}>
                                                        <div className="space-y-2">
                                                            {question.ans.map((answer, aIndex) => (
                                                                <SortableItem key={answer._dndId} id={answer._dndId}>
                                                                {({ listeners: ansListeners, isDragging: ansIsDragging }) => (
                                                                <div className={cn("bg-muted/40 rounded-lg p-3 space-y-2 border border-transparent hover:border-muted-foreground/20 transition-colors", ansIsDragging && "shadow-md border-primary/20")}>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            {...ansListeners}
                                                                            className="cursor-grab active:cursor-grabbing shrink-0 p-0.5 text-muted-foreground hover:text-foreground touch-none"
                                                                        >
                                                                            <GripVerticalIcon className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                                                                            {String.fromCharCode(65 + aIndex)}
                                                                        </span>
                                                                        <Input
                                                                            value={answer.content}
                                                                            onChange={(e) => updateAnswer(qIndex, aIndex, 'content', e.target.value)}
                                                                            placeholder="Answer text"
                                                                            className="flex-1 h-8 text-sm"
                                                                        />
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <Input
                                                                                value={answer.persentage}
                                                                                onChange={(e) => updateAnswer(qIndex, aIndex, 'persentage', e.target.value)}
                                                                                placeholder="±%"
                                                                                className={cn(
                                                                                    "w-16 h-8 text-xs text-center",
                                                                                    answer.persentage && pctColor(answer.persentage).includes('emerald') && "text-emerald-600",
                                                                                    answer.persentage && pctColor(answer.persentage).includes('red') && "text-red-600"
                                                                                )}
                                                                            />
                                                                            <span className="text-xs text-muted-foreground">%</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <span className="text-xs text-muted-foreground">$</span>
                                                                            <Input
                                                                                value={answer.fixed}
                                                                                onChange={(e) => updateAnswer(qIndex, aIndex, 'fixed', e.target.value)}
                                                                                placeholder="±$"
                                                                                className="w-16 h-8 text-xs text-center"
                                                                            />
                                                                        </div>
                                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-red-500 hover:text-red-700"
                                                                            onClick={() => removeAnswer(qIndex, aIndex)}
                                                                        >
                                                                            <TrashIcon className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                    <div className="pl-6">
                                                                        <Input
                                                                            value={answer.description || ''}
                                                                            onChange={(e) => updateAnswer(qIndex, aIndex, 'description', e.target.value)}
                                                                            placeholder="Description (optional)"
                                                                            className="h-7 text-xs text-muted-foreground"
                                                                        />
                                                                    </div>
                                                                    {selectedLocale && (() => {
                                                                        const ta = questionsI18n[selectedLocale]?.[qIndex]?.ans?.[aIndex]
                                                                        if (!ta?.content && !ta?.description) return null
                                                                        return (
                                                                            <div className="pl-6 flex items-start gap-1.5">
                                                                                <GlobeIcon className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                                                                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                                                                    {ta.content && <span>{ta.content}</span>}
                                                                                    {ta.content && ta.description && <span className="mx-1 text-blue-400">·</span>}
                                                                                    {ta.description && <span className="opacity-70">{ta.description}</span>}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })()}
                                                                    <div className="pl-6">
                                                                        <ImageUpload
                                                                            value={answer.img || ''}
                                                                            onChange={(url) => updateAnswer(qIndex, aIndex, 'img', url)}
                                                                            multiple={false}
                                                                            folder="tradein/templates"
                                                                            label=""
                                                                            onDelete={deleteFileFromBucket}
                                                                            compact={true}
                                                                            placeholder="Answer image (optional)"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                )}
                                                                </SortableItem>
                                                            ))}
                                                        </div>
                                                        </SortableContext>
                                                        </DndContext>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full border border-dashed" onClick={() => addAnswer(qIndex)}>
                                                        <PlusIcon className="w-3 h-3 mr-1" />
                                                        Add Answer
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                    )}
                                    </SortableItem>
                                )
                            })}
                        </div>
                        </SortableContext>
                        </DndContext>
                    )}

                    {/* Bottom add button */}
                    {questions.length > 0 && (
                        <Button variant="outline" onClick={addQuestion} className="w-full border-dashed">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    )}
                </div>

                {/* ── Preview Column ── */}
                {showPreview && (
                    <div className="hidden lg:block sticky top-24">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <EyeIcon className="w-4 h-4" />
                                    Preview
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    How the questionnaire looks to customers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {questions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Add questions to see a preview
                                    </p>
                                ) : (
                                    questions.map((q, qi) => {
                                        const tq = selectedLocale ? questionsI18n[selectedLocale]?.[qi] : null
                                        return (
                                        <div key={qi} className="space-y-2.5">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {tq?.title || q.title || 'Untitled question'}
                                                    {q.required !== false && <span className="text-red-500 ml-0.5">*</span>}
                                                </p>
                                                {(tq?.description || q.description) && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{tq?.description || q.description}</p>
                                                )}
                                                {q.type === 'opposite_multiple' && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Adjustments apply when unchecked</p>
                                                )}
                                            </div>
                                            {q.img && typeof q.img === 'string' && q.img.startsWith('http') && (
                                                <img src={q.img} alt="" className="w-full h-24 object-cover rounded-md" />
                                            )}
                                            <div className="space-y-1.5">
                                                {(q.ans || []).map((a, ai) => {
                                                    const ta = tq?.ans?.[ai]
                                                    return (
                                                    <div
                                                        key={ai}
                                                        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer transition-colors"
                                                    >
                                                        <div className={cn(
                                                            "w-4 h-4 rounded border-2 border-muted-foreground/40 shrink-0",
                                                            (q.type === 'multiple' || q.type === 'opposite_multiple') ? 'rounded-sm' : 'rounded-full'
                                                        )} />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm">{ta?.content || a.content || 'Untitled answer'}</span>
                                                            {(ta?.description || a.description) && (
                                                                <p className="text-xs text-muted-foreground truncate">{ta?.description || a.description}</p>
                                                            )}
                                                        </div>
                                                        {(a.persentage || a.fixed) && (
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {a.persentage && (
                                                                    <Badge className={cn("text-[10px] h-5", pctColor(a.persentage))}>
                                                                        {parseFloat(a.persentage) > 0 ? '+' : ''}{a.persentage}%
                                                                    </Badge>
                                                                )}
                                                                {a.fixed && (
                                                                    <Badge className={cn("text-[10px] h-5", pctColor(a.fixed))}>
                                                                        {parseFloat(a.fixed) > 0 ? '+' : ''}${a.fixed}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    )
                                                })}
                                            </div>
                                            {qi < questions.length - 1 && <Separator />}
                                        </div>
                                        )
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
