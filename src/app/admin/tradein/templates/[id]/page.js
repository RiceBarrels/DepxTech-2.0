"use client"

import { useParams } from "next/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
    GripVerticalIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"

export default function EditTemplatePage() {
    const { id } = useParams()
    const router = useTransitionRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [template, setTemplate] = useState(null)
    const [name, setName] = useState('')
    const [questions, setQuestions] = useState([])

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

                // Find the specific template
                const foundTemplate = data.templates?.find(t => t.id === id)
                if (!foundTemplate) {
                    throw new Error('Template not found')
                }

                setTemplate(foundTemplate)
                setName(foundTemplate.name || '')
                setQuestions(foundTemplate.questions || [])
            } catch (err) {
                toast.error(err.message)
                router.push('/admin/tradein')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchTemplate()
        }
    }, [id])

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Template name is required')
            return
        }

        setSaving(true)
        try {
            // Upload any new images in questions
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

            toast.success('Template saved successfully')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            title: '',
            type: 'single',
            required: true,
            img: '',
            ans: []
        }])
    }

    const removeQuestion = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index))
    }

    const updateQuestion = (index, field, value) => {
        setQuestions(prev => {
            const newQuestions = [...prev]
            newQuestions[index] = { ...newQuestions[index], [field]: value }
            return newQuestions
        })
    }

    const addAnswer = (qIndex) => {
        setQuestions(prev => {
            const newQuestions = [...prev]
            if (!newQuestions[qIndex].ans) {
                newQuestions[qIndex].ans = []
            }
            newQuestions[qIndex].ans.push({
                content: '',
                description: '',
                img: '',
                persentage: '',
                fixed: ''
            })
            return newQuestions
        })
    }

    const removeAnswer = (qIndex, aIndex) => {
        setQuestions(prev => {
            const newQuestions = [...prev]
            newQuestions[qIndex].ans = newQuestions[qIndex].ans.filter((_, i) => i !== aIndex)
            return newQuestions
        })
    }

    const updateAnswer = (qIndex, aIndex, field, value) => {
        setQuestions(prev => {
            const newQuestions = [...prev]
            newQuestions[qIndex].ans[aIndex] = {
                ...newQuestions[qIndex].ans[aIndex],
                [field]: value
            }
            return newQuestions
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Question Template</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            Loading template...
                        </div>
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
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Question Template</h1>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="w-4 h-4 mr-2" />
                            Save Template
                        </>
                    )}
                </Button>
            </div>

            {/* Template Name */}
            <Card>
                <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Smartphone Questions"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Questions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircleIcon className="w-5 h-5" />
                                Questions ({questions.length})
                            </CardTitle>
                            <CardDescription>
                                Add questions that will be used when this template is applied to products
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={addQuestion}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {questions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <HelpCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No questions yet. Click "Add Question" to create one.</p>
                        </div>
                    ) : (
                        questions.map((question, qIndex) => (
                            <Card key={qIndex} className="border bg-muted/30">
                                <CardContent className="pt-4 space-y-4">
                                    {/* Question Header */}
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Label className="text-sm text-muted-foreground">
                                                    Question {qIndex + 1}
                                                </Label>
                                                <Select
                                                    value={question.type || 'single'}
                                                    onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
                                                >
                                                    <SelectTrigger className="h-7 w-[130px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single Select</SelectItem>
                                                        <SelectItem value="multiple">Multiple Select</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <div className="flex items-center gap-1">
                                                    <Checkbox
                                                        id={`required-${qIndex}`}
                                                        checked={question.required !== false}
                                                        onCheckedChange={(checked) => updateQuestion(qIndex, 'required', checked)}
                                                    />
                                                    <Label htmlFor={`required-${qIndex}`} className="text-xs text-muted-foreground cursor-pointer">
                                                        Required
                                                    </Label>
                                                </div>
                                            </div>
                                            <Input
                                                value={question.title}
                                                onChange={(e) => updateQuestion(qIndex, 'title', e.target.value)}
                                                placeholder="Enter question text..."
                                            />
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => removeQuestion(qIndex)}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Answers */}
                                    <div className="pl-4 border-l-2 border-muted space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-muted-foreground">Answers</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addAnswer(qIndex)}
                                            >
                                                <PlusIcon className="w-3 h-3 mr-1" />
                                                Add Answer
                                            </Button>
                                        </div>

                                        {question.ans && question.ans.map((answer, aIndex) => (
                                            <div key={aIndex} className="bg-background rounded p-3 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={answer.content}
                                                        onChange={(e) => updateAnswer(qIndex, aIndex, 'content', e.target.value)}
                                                        placeholder="Answer text"
                                                        className="flex-1 h-8 text-sm"
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            value={answer.persentage}
                                                            onChange={(e) => updateAnswer(qIndex, aIndex, 'persentage', e.target.value)}
                                                            placeholder="+10 or -5"
                                                            className="w-20 h-8 text-sm"
                                                        />
                                                        <span className="text-xs text-muted-foreground">%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">$</span>
                                                        <Input
                                                            value={answer.fixed}
                                                            onChange={(e) => updateAnswer(qIndex, aIndex, 'fixed', e.target.value)}
                                                            placeholder="Fixed"
                                                            className="w-16 h-8 text-sm"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-500"
                                                        onClick={() => removeAnswer(qIndex, aIndex)}
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <Input
                                                    value={answer.description || ''}
                                                    onChange={(e) => updateAnswer(qIndex, aIndex, 'description', e.target.value)}
                                                    placeholder="Description (optional)"
                                                    className="h-8 text-sm text-muted-foreground"
                                                />
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
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
