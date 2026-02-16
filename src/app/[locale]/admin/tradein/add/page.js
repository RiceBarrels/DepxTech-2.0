"use client"

import { usePathname } from "@/i18n/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ArrowLeftIcon, SaveIcon, LoaderIcon, XIcon, PlusIcon, ArrowRightLeftIcon, CalendarIcon, StarIcon, TrashIcon, HelpCircleIcon, CopyIcon, ImageIcon, FileTextIcon } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PictureInPictureIcon } from "lucide-react"
import { openWindow } from "@/components/ui/windows"
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import { Checkbox } from '@/components/ui/checkbox'
import { CategorySelect } from '@/components/admin/CategorySelect'
import { toast } from 'sonner'
import { AITranslateButton, AITranslateQuestionsButton, AIGenerateButton } from '@/components/admin/AIButton'
import TranslationEditor from '@/components/admin/TranslationEditor'

export default function AddTradeinProductPage({defaultData={
    title: '',
    des: '',
    base_price: '',
    min_price: '',
    category: '',
    brand: '',
    series: '',
    brand_img: '',
    imgs: [],
    base_date: '',
    depreciation_rate: '',
    is_featured: false,
    questions: [],
    question_template_id: null,
    title_i18n: {},
    des_i18n: {},
    questions_i18n: {},
}}) {
    const router = useTransitionRouter()
    const pathname = usePathname()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    // Copy questions from other products
    const [otherProducts, setOtherProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [showCopySelect, setShowCopySelect] = useState(false)

    // Templates state
    const [templates, setTemplates] = useState([])
    const [loadingTemplates, setLoadingTemplates] = useState(false)
    const [showTemplateSelect, setShowTemplateSelect] = useState(false)

    // Fetch templates
    const fetchTemplates = async () => {
        if (templates.length > 0) {
            setShowTemplateSelect(true)
            return
        }
        setLoadingTemplates(true)
        try {
            const response = await fetch('/api/admin/tradein/templates')
            const data = await response.json()
            if (data.templates) {
                const templatesWithQuestions = data.templates.filter(
                    t => t.questions && t.questions.length > 0
                )
                setTemplates(templatesWithQuestions)
                setShowTemplateSelect(true)
            }
        } catch (error) {
            toast.error('Failed to fetch templates')
        } finally {
            setLoadingTemplates(false)
        }
    }

    const applyTemplate = (templateId) => {
        const template = templates.find(t => t.id === templateId)
        if (template && template.questions) {
            const copiedQuestions = JSON.parse(JSON.stringify(template.questions))
            handleInputChange('questions', copiedQuestions)
            handleInputChange('question_template_id', templateId)
            toast.success(`Applied "${template.name}" template (${copiedQuestions.length} questions)`)
            setShowTemplateSelect(false)
        }
    }

    // Fetch other products with questions
    const fetchOtherProducts = async () => {
        if (otherProducts.length > 0) {
            setShowCopySelect(true)
            return
        }
        setLoadingProducts(true)
        try {
            const response = await fetch('/api/admin/tradein')
            const data = await response.json()
            if (data.products) {
                // Filter products that have questions
                const productsWithQuestions = data.products.filter(
                    p => p.questions && p.questions.length > 0
                )
                setOtherProducts(productsWithQuestions)
                setShowCopySelect(true)
            }
        } catch (error) {
            toast.error('Failed to fetch products')
        } finally {
            setLoadingProducts(false)
        }
    }

    const copyQuestionsFromProduct = (productId) => {
        const sourceProduct = otherProducts.find(p => p.id === productId)
        if (sourceProduct && sourceProduct.questions) {
            // Deep copy the questions
            const copiedQuestions = JSON.parse(JSON.stringify(sourceProduct.questions))
            handleInputChange('questions', copiedQuestions)
            handleInputChange('question_template_id', null)
            toast.success(`Copied ${copiedQuestions.length} questions from "${sourceProduct.title}"`)
            setShowCopySelect(false)
        }
    }

    // Form state
    const [formData, setFormData] = useState(defaultData)

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            // Upload images first
            const uploadedBrandImg = formData.brand_img instanceof File
                ? (await uploadFiles(formData.brand_img, 'tradein/brands'))[0]
                : formData.brand_img
            const uploadedProductImgs = await uploadFiles(formData.imgs, 'tradein/products')

            // Upload question and answer images
            const processedQuestions = await Promise.all(
                (formData.questions || []).map(async (question) => {
                    // Upload question image if it's a File
                    const questionImg = question.img instanceof File
                        ? (await uploadFiles(question.img, 'tradein/questions'))[0]
                        : question.img || null

                    // Upload answer images if they're Files
                    const processedAnswers = await Promise.all(
                        (question.ans || []).map(async (answer) => {
                            const answerImg = answer.img instanceof File
                                ? (await uploadFiles(answer.img, 'tradein/answers'))[0]
                                : answer.img || null
                            return {
                                ...answer,
                                img: answerImg
                            }
                        })
                    )

                    return {
                        ...question,
                        img: questionImg,
                        ans: processedAnswers
                    }
                })
            )

            const response = await fetch('/api/admin/tradein', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    brand_img: uploadedBrandImg || null,
                    imgs: uploadedProductImgs,
                    base_price: parseFloat(formData.base_price) || 0,
                    min_price: formData.min_price ? parseFloat(formData.min_price) : null,
                    base_date: formData.base_date || null,
                    depreciation_rate: parseFloat(formData.depreciation_rate) || 0,
                    is_featured: formData.is_featured || false,
                    questions: processedQuestions,
                    question_template_id: formData.question_template_id
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create tradable product')
            }

            setSuccess(true)
            toast.success('Trade-in product created successfully!')

            // Reset form after successful creation
            setFormData({
                title: '',
                des: '',
                base_price: '',
                min_price: '',
                category: '',
                brand: '',
                series: '',
                brand_img: '',
                imgs: [],
                base_date: '',
                depreciation_rate: '',
                is_featured: false,
                questions: [],
                question_template_id: null,
                title_i18n: {},
                des_i18n: {},
                questions_i18n: {},
            })

            setTimeout(() => {
                setSuccess(false)
            }, 3000)
        } catch (err) {
            setError(err.message)
            toast.error('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    // Calculate estimated current value based on depreciation rate
    const getEstimatedValue = () => {
        if (!formData.base_price) {
            return null
        }
        const depRate = parseFloat(formData.depreciation_rate) || 0
        const multiplier = 100 - depRate

        return {
            value: (parseFloat(formData.base_price) || 0) * (multiplier / 100),
            multiplier
        }
    }

    const estimatedValue = getEstimatedValue()

    return (
        <div className="flex flex-col gap-4 p-4">
            {pathname === '/admin/tradein/add' &&
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowRightLeftIcon className="w-6 h-6" />
                        Add New Trade-in Product
                    </h1>
                    <Button variant="outline" size="sm" onClick={() => {
                        openWindow('Add New Trade-in Product - Admin', <AddTradeinProductPage defaultData={formData}/>, {icon: <PlusIcon className="w-4 h-4" />})
                        router.back()
                    }}
                    >
                        <PictureInPictureIcon className="w-4 h-4" />
                        Pop window
                    </Button>
                </div>
            }

            {success && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="text-green-800 text-center">
                            Trade-in product created successfully!
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="text-red-800 text-center">
                            Error: {error}
                        </div>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Trade-in Product Information</CardTitle>
                        <CardDescription>Enter the details for the new trade-in product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Product Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter product title (e.g., iPhone 15 Pro Max 256GB)"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="des">Description</Label>
                                <AIGenerateButton
                                    type="product_description"
                                    prompt={formData.title}
                                    context={{ title: formData.title, category: formData.category, brand: formData.brand }}
                                    onResult={(text) => handleInputChange('des', text)}
                                />
                            </div>
                            <textarea
                                id="des"
                                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                                value={formData.des}
                                onChange={(e) => handleInputChange('des', e.target.value)}
                                placeholder="Enter product description"
                            />
                        </div>

                        {/* Category, Brand, Series */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <CategorySelect value={formData.category} onChange={(val) => handleInputChange('category', val)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand *</Label>
                                <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                    placeholder="e.g., Apple"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="series">Series *</Label>
                                <Input
                                    id="series"
                                    value={formData.series}
                                    onChange={(e) => handleInputChange('series', e.target.value)}
                                    placeholder="e.g., iPhone 15"
                                    required
                                />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="text-green-600">$</span>
                                Pricing & Depreciation
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_price">Base Price ($) *</Label>
                                    <Input
                                        id="base_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.base_price}
                                        onChange={(e) => handleInputChange('base_price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="border-green-200 focus:border-green-500"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Maximum trade-in value for new/mint condition
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_price">Minimum Price ($)</Label>
                                    <Input
                                        id="min_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.min_price}
                                        onChange={(e) => handleInputChange('min_price', e.target.value)}
                                        placeholder="0.00"
                                        className="border-orange-200 focus:border-orange-500"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Floor value - quote won't go below this (optional)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_date" className="flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        Base Date
                                    </Label>
                                    <Input
                                        id="base_date"
                                        type="date"
                                        value={formData.base_date}
                                        onChange={(e) => handleInputChange('base_date', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Reference date for this product's pricing
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="depreciation_rate">Depreciation Rate (%)</Label>
                                    <Input
                                        id="depreciation_rate"
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="100"
                                        value={formData.depreciation_rate}
                                        onChange={(e) => handleInputChange('depreciation_rate', e.target.value)}
                                        placeholder="0"
                                        className="border-orange-200 focus:border-orange-500"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Percentage to reduce from base price (e.g., 10 = 10% off)
                                    </p>
                                </div>
                            </div>

                            {/* Estimated Value Preview */}
                            {estimatedValue && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                                                Estimated Current Value
                                            </p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                ${estimatedValue.value.toFixed(2)}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            {estimatedValue.multiplier}% of base
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Featured Toggle */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_featured"
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                            />
                            <Label htmlFor="is_featured" className="flex items-center gap-2 cursor-pointer">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                Featured Product
                            </Label>
                        </div>

                        {/* Product-specific Questions */}
                        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                            {formData.question_template_id && (
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 rounded-md px-2.5 py-1.5">
                                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                        <FileTextIcon className="w-3 h-3" />
                                        Linked to template
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            handleInputChange('question_template_id', null)
                                            toast.info('Template unlinked (questions kept)')
                                        }}
                                    >
                                        Unlink
                                    </Button>
                                </div>
                            )}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <HelpCircleIcon className="w-5 h-5 text-blue-600" />
                                    Product Questions
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Apply Template */}
                                    {showTemplateSelect ? (
                                        <div className="flex items-center gap-2">
                                            <Select onValueChange={applyTemplate}>
                                                <SelectTrigger className="w-[200px] h-8 text-sm">
                                                    <SelectValue placeholder="Select template..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {templates.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No templates found
                                                        </SelectItem>
                                                    ) : (
                                                        templates.map((t) => (
                                                            <SelectItem key={t.id} value={t.id}>
                                                                {t.name} ({t.questions.length} Q)
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowTemplateSelect(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : showCopySelect ? (
                                        <div className="flex items-center gap-2">
                                            <Select onValueChange={copyQuestionsFromProduct}>
                                                <SelectTrigger className="w-[220px] h-8 text-sm">
                                                    <SelectValue placeholder="Select product to copy from..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {otherProducts.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No products with questions found
                                                        </SelectItem>
                                                    ) : (
                                                        otherProducts.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.title} ({p.questions.length} Q)
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowCopySelect(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchTemplates}
                                                disabled={loadingTemplates}
                                            >
                                                {loadingTemplates ? (
                                                    <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <FileTextIcon className="w-4 h-4 mr-1" />
                                                )}
                                                Apply Template
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchOtherProducts}
                                                disabled={loadingProducts}
                                            >
                                                {loadingProducts ? (
                                                    <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <CopyIcon className="w-4 h-4 mr-1" />
                                                )}
                                                Copy from Product
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newQuestions = [...(formData.questions || []), {
                                                title: '',
                                                type: 'single', // 'single' or 'multiple'
                                                required: true, // whether question is required
                                                ans: []
                                            }]
                                            handleInputChange('questions', newQuestions)
                                        }}
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Add Question
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Add custom questions specific to this product, or copy from another product. Each answer can have a percentage adjustment (+/-) or fixed dollar amount.
                            </p>

                            {formData.questions && formData.questions.length > 0 ? (
                                <div className="space-y-4">
                                    {formData.questions.map((question, qIndex) => (
                                        <div key={qIndex} className="border rounded-lg p-4 bg-background space-y-3">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Label className="text-xs text-muted-foreground">Question {qIndex + 1}</Label>
                                                        <Select
                                                            value={question.type || 'single'}
                                                            onValueChange={(value) => {
                                                                const newQuestions = [...formData.questions]
                                                                newQuestions[qIndex].type = value
                                                                handleInputChange('questions', newQuestions)
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-7 w-[130px] text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="single">Single Select</SelectItem>
                                                                <SelectItem value="multiple">Multiple Select</SelectItem>
                                                                <SelectItem value="opposite_multiple">Opposite Multi-Select</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex items-center gap-1">
                                                            <Checkbox
                                                                id={`required-${qIndex}`}
                                                                checked={question.required !== false}
                                                                onCheckedChange={(checked) => {
                                                                    const newQuestions = [...formData.questions]
                                                                    newQuestions[qIndex].required = checked
                                                                    handleInputChange('questions', newQuestions)
                                                                }}
                                                            />
                                                            <Label htmlFor={`required-${qIndex}`} className="text-xs text-muted-foreground cursor-pointer">
                                                                Required
                                                            </Label>
                                                        </div>
                                                    </div>
                                                    <Input
                                                        value={question.title}
                                                        onChange={(e) => {
                                                            const newQuestions = [...formData.questions]
                                                            newQuestions[qIndex].title = e.target.value
                                                            handleInputChange('questions', newQuestions)
                                                        }}
                                                        placeholder="Enter question text..."
                                                    />
                                                    {/* Question Image Upload */}
                                                    <div className="flex items-center gap-2">
                                                        <ImageUpload
                                                            value={question.img || ''}
                                                            onChange={(url) => {
                                                                const newQuestions = [...formData.questions]
                                                                newQuestions[qIndex].img = url
                                                                handleInputChange('questions', newQuestions)
                                                            }}
                                                            multiple={false}
                                                            folder="tradein/questions"
                                                            label=""
                                                            onDelete={deleteFileFromBucket}
                                                            compact={true}
                                                            placeholder="Question image (optional)"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 mt-5"
                                                    onClick={() => {
                                                        const newQuestions = formData.questions.filter((_, i) => i !== qIndex)
                                                        handleInputChange('questions', newQuestions)
                                                    }}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Answers */}
                                            <div className="pl-4 border-l-2 border-muted space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs text-muted-foreground">Answers</Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newQuestions = [...formData.questions]
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
                                                            handleInputChange('questions', newQuestions)
                                                        }}
                                                    >
                                                        <PlusIcon className="w-3 h-3 mr-1" />
                                                        Add Answer
                                                    </Button>
                                                </div>

                                                {question.ans && question.ans.map((answer, aIndex) => (
                                                    <div key={aIndex} className="bg-muted/50 rounded p-3 space-y-2">
                                                        {/* Answer main row */}
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={answer.content}
                                                                onChange={(e) => {
                                                                    const newQuestions = [...formData.questions]
                                                                    newQuestions[qIndex].ans[aIndex].content = e.target.value
                                                                    handleInputChange('questions', newQuestions)
                                                                }}
                                                                placeholder="Answer text"
                                                                className="flex-1 h-8 text-sm"
                                                            />
                                                            <div className="flex items-center gap-1">
                                                                <Input
                                                                    value={answer.persentage}
                                                                    onChange={(e) => {
                                                                        const newQuestions = [...formData.questions]
                                                                        newQuestions[qIndex].ans[aIndex].persentage = e.target.value
                                                                        handleInputChange('questions', newQuestions)
                                                                    }}
                                                                    placeholder="+10 or -5"
                                                                    className="w-20 h-8 text-sm"
                                                                />
                                                                <span className="text-xs text-muted-foreground">%</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-muted-foreground">$</span>
                                                                <Input
                                                                    value={answer.fixed}
                                                                    onChange={(e) => {
                                                                        const newQuestions = [...formData.questions]
                                                                        newQuestions[qIndex].ans[aIndex].fixed = e.target.value
                                                                        handleInputChange('questions', newQuestions)
                                                                    }}
                                                                    placeholder="Fixed"
                                                                    className="w-16 h-8 text-sm"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-500"
                                                                onClick={() => {
                                                                    const newQuestions = [...formData.questions]
                                                                    newQuestions[qIndex].ans = newQuestions[qIndex].ans.filter((_, i) => i !== aIndex)
                                                                    handleInputChange('questions', newQuestions)
                                                                }}
                                                            >
                                                                <TrashIcon className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                        {/* Answer description */}
                                                        <Input
                                                            value={answer.description || ''}
                                                            onChange={(e) => {
                                                                const newQuestions = [...formData.questions]
                                                                newQuestions[qIndex].ans[aIndex].description = e.target.value
                                                                handleInputChange('questions', newQuestions)
                                                            }}
                                                            placeholder="Description (optional) - helps explain this answer"
                                                            className="h-8 text-sm text-muted-foreground"
                                                        />
                                                        {/* Answer image upload */}
                                                        <ImageUpload
                                                            value={answer.img || ''}
                                                            onChange={(url) => {
                                                                const newQuestions = [...formData.questions]
                                                                newQuestions[qIndex].ans[aIndex].img = url
                                                                handleInputChange('questions', newQuestions)
                                                            }}
                                                            multiple={false}
                                                            folder="tradein/answers"
                                                            label=""
                                                            onDelete={deleteFileFromBucket}
                                                            compact={true}
                                                            placeholder="Answer image (optional)"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No product-specific questions. Click "Add Question" to create one.
                                </p>
                            )}
                        </div>

                        {/* Brand Image */}
                        <div className="space-y-2">
                            <ImageUpload
                                value={formData.brand_img}
                                onChange={(url) => handleInputChange('brand_img', url)}
                                multiple={false}
                                folder="tradein/brands"
                                label="Brand Image"
                                onDelete={deleteFileFromBucket}
                            />
                        </div>

                        {/* Product Images */}
                        <div className="space-y-2">
                            <ImageUpload
                                value={formData.imgs}
                                onChange={(urls) => handleInputChange('imgs', urls)}
                                multiple={true}
                                folder="tradein/products"
                                label="Product Images"
                                onDelete={deleteFileFromBucket}
                            />
                        </div>

                        {/* Translations */}
                        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                            <h3 className="font-semibold flex items-center gap-2">
                                Translations
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <AITranslateButton
                                    fields={{ title: formData.title, des: formData.des }}
                                    context="trade-in product"
                                    onResult={(translations) => {
                                        handleInputChange('title_i18n', translations.title_i18n || formData.title_i18n)
                                        handleInputChange('des_i18n', translations.des_i18n || formData.des_i18n)
                                    }}
                                />
                                {formData.questions && formData.questions.length > 0 && (
                                    <AITranslateQuestionsButton
                                        questions={formData.questions}
                                        context="trade-in product condition questionnaire"
                                        onResult={(questionsI18n) => {
                                            handleInputChange('questions_i18n', questionsI18n)
                                        }}
                                    />
                                )}
                            </div>
                            <TranslationEditor
                                fields={[
                                    { key: 'title', label: 'Title', value: formData.title },
                                    { key: 'des', label: 'Description', value: formData.des },
                                ]}
                                i18nData={{ title_i18n: formData.title_i18n, des_i18n: formData.des_i18n }}
                                onChange={(i18nKey, value) => handleInputChange(i18nKey, value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Create Trade-in Product
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
