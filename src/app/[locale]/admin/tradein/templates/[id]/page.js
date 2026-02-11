"use client"

import { useParams } from "next/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useCallback, useMemo } from "react"
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
    ArrowUpIcon,
    ArrowDownIcon,
    EyeIcon,
    EyeOffIcon,
    UndoIcon,
    AlertCircleIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import { cn } from '@/lib/utils'

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
    const [expandedQuestions, setExpandedQuestions] = useState(new Set())
    const [showPreview, setShowPreview] = useState(false)

    // Track unsaved changes
    const hasChanges = useMemo(() => {
        return name !== originalName || JSON.stringify(questions) !== JSON.stringify(originalQuestions)
    }, [name, originalName, questions, originalQuestions])

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
                const response = await fetch(`/api/admin/tradein/templates?id=${id}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch template')
                }

                const foundTemplate = data.templates?.find(t => t.id === id)
                if (!foundTemplate) {
                    throw new Error('Template not found')
                }

                setTemplate(foundTemplate)
                setName(foundTemplate.name || '')
                setOriginalName(foundTemplate.name || '')

                const q = foundTemplate.questions || []
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
                questions.map(async (question) => {
                    const questionImg = question.img instanceof File
                        ? (await uploadFiles(question.img, 'tradein/templates'))[0]
                        : question.img || null

                    const processedAnswers = await Promise.all(
                        (question.ans || []).map(async (answer) => {
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
                    questions: processedQuestions
                })
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update template')
            }

            setOriginalName(name)
            setOriginalQuestions(JSON.parse(JSON.stringify(processedQuestions)))
            setQuestions(processedQuestions)
            toast.success('Template saved successfully')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        setName(originalName)
        setQuestions(JSON.parse(JSON.stringify(originalQuestions)))
        toast.info('Changes discarded')
    }

    // ── Question operations ──────────────────────────────
    const addQuestion = () => {
        const newIndex = questions.length
        setQuestions(prev => [...prev, {
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

    const moveQuestion = (index, direction) => {
        const target = index + direction
        if (target < 0 || target >= questions.length) return
        const newQuestions = [...questions]
        ;[newQuestions[index], newQuestions[target]] = [newQuestions[target], newQuestions[index]]
        setQuestions(newQuestions)
        setExpandedQuestions(prev => {
            const next = new Set()
            prev.forEach(i => {
                if (i === index) next.add(target)
                else if (i === target) next.add(index)
                else next.add(i)
            })
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

    // ── Answer operations ──────────────────────────────
    const addAnswer = (qIndex) => {
        setQuestions(prev => {
            const updated = [...prev]
            const q = { ...updated[qIndex] }
            q.ans = [...(q.ans || []), {
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

    const moveAnswer = (qIndex, aIndex, direction) => {
        const target = aIndex + direction
        setQuestions(prev => {
            const updated = [...prev]
            const q = { ...updated[qIndex] }
            q.ans = [...q.ans]
            if (target < 0 || target >= q.ans.length) return prev
            ;[q.ans[aIndex], q.ans[target]] = [q.ans[target], q.ans[aIndex]]
            updated[qIndex] = q
            return updated
        })
    }

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
                            router.push('/admin/tradein/templates')
                        }}>
                            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                            Back
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold truncate">Edit Template</h1>
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
                    {/* Template Name */}
                    <Card>
                        <CardContent className="pt-5 pb-5">
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
                        </CardContent>
                    </Card>

                    {/* Questions Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HelpCircleIcon className="w-4 h-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Questions ({questions.length})</h2>
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
                        <div className="flex flex-col gap-2">
                            {questions.map((question, qIndex) => {
                                const isExpanded = expandedQuestions.has(qIndex)
                                return (
                                    <Card key={qIndex} className={cn(
                                        "transition-colors",
                                        isExpanded ? "border-primary/30" : "hover:border-muted-foreground/30"
                                    )}>
                                        {/* Collapsed header */}
                                        <div
                                            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
                                            onClick={() => toggleQuestion(qIndex)}
                                        >
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
                                            </div>
                                            {/* Action buttons on collapsed row */}
                                            <div className="flex items-center gap-0.5 shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                                                    disabled={qIndex === 0}
                                                    onClick={() => moveQuestion(qIndex, -1)}
                                                    title="Move up"
                                                >
                                                    <ArrowUpIcon className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                                                    disabled={qIndex === questions.length - 1}
                                                    onClick={() => moveQuestion(qIndex, 1)}
                                                    title="Move down"
                                                >
                                                    <ArrowDownIcon className="w-3.5 h-3.5" />
                                                </Button>
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
                                                        </div>
                                                        <div className="space-y-1.5 sm:col-span-2">
                                                            <Label className="text-xs font-medium text-muted-foreground">Description (optional)</Label>
                                                            <Input
                                                                value={question.description || ''}
                                                                onChange={(e) => updateQuestion(qIndex, 'description', e.target.value)}
                                                                placeholder="Helper text shown below the question..."
                                                                className="text-sm"
                                                            />
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
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-medium text-muted-foreground">
                                                            Answers ({question.ans?.length || 0})
                                                        </Label>
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addAnswer(qIndex)}>
                                                            <PlusIcon className="w-3 h-3 mr-1" />
                                                            Add Answer
                                                        </Button>
                                                    </div>

                                                    {(!question.ans || question.ans.length === 0) ? (
                                                        <div className="border border-dashed rounded-lg py-6 text-center text-muted-foreground text-xs">
                                                            No answers yet. Click "Add Answer" above.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {question.ans.map((answer, aIndex) => (
                                                                <div key={aIndex} className="bg-muted/40 rounded-lg p-3 space-y-2 border border-transparent hover:border-muted-foreground/20 transition-colors">
                                                                    <div className="flex items-center gap-2">
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
                                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                                                                                disabled={aIndex === 0}
                                                                                onClick={() => moveAnswer(qIndex, aIndex, -1)}
                                                                            >
                                                                                <ArrowUpIcon className="w-3 h-3" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                                                                                disabled={aIndex === question.ans.length - 1}
                                                                                onClick={() => moveAnswer(qIndex, aIndex, 1)}
                                                                            >
                                                                                <ArrowDownIcon className="w-3 h-3" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                                                                onClick={() => removeAnswer(qIndex, aIndex)}
                                                                            >
                                                                                <TrashIcon className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="pl-6">
                                                                        <Input
                                                                            value={answer.description || ''}
                                                                            onChange={(e) => updateAnswer(qIndex, aIndex, 'description', e.target.value)}
                                                                            placeholder="Description (optional)"
                                                                            className="h-7 text-xs text-muted-foreground"
                                                                        />
                                                                    </div>
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
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
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
                                    questions.map((q, qi) => (
                                        <div key={qi} className="space-y-2.5">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {q.title || 'Untitled question'}
                                                    {q.required !== false && <span className="text-red-500 ml-0.5">*</span>}
                                                </p>
                                                {q.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{q.description}</p>
                                                )}
                                                {q.type === 'opposite_multiple' && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Adjustments apply when unchecked</p>
                                                )}
                                            </div>
                                            {q.img && typeof q.img === 'string' && q.img.startsWith('http') && (
                                                <img src={q.img} alt="" className="w-full h-24 object-cover rounded-md" />
                                            )}
                                            <div className="space-y-1.5">
                                                {(q.ans || []).map((a, ai) => (
                                                    <div
                                                        key={ai}
                                                        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer transition-colors"
                                                    >
                                                        <div className={cn(
                                                            "w-4 h-4 rounded border-2 border-muted-foreground/40 shrink-0",
                                                            (q.type === 'multiple' || q.type === 'opposite_multiple') ? 'rounded-sm' : 'rounded-full'
                                                        )} />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm">{a.content || 'Untitled answer'}</span>
                                                            {a.description && (
                                                                <p className="text-xs text-muted-foreground truncate">{a.description}</p>
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
                                                ))}
                                            </div>
                                            {qi < questions.length - 1 && <Separator />}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
