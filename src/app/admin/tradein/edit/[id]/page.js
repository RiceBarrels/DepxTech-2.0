"use client"

import { useParams, usePathname } from "next/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ArrowLeftIcon, SaveIcon, LoaderIcon, EditIcon, ArrowRightLeftIcon, CalendarIcon, StarIcon, TrendingUpIcon, RefreshCwIcon, PlusIcon, TrashIcon, HelpCircleIcon, CopyIcon, CheckIcon, ImageIcon } from 'lucide-react'
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
import { toast } from 'sonner'

// Helper to normalize image URL (handles both string URLs and {url: "..."} objects)
const normalizeImageUrl = (img) => {
    if (!img) return ''
    if (typeof img === 'string') return img
    if (typeof img === 'object' && img.url) return img.url
    return ''
}

// Normalize questions to ensure all image fields are strings
const normalizeQuestions = (questions) => {
    if (!questions || !Array.isArray(questions)) return []
    return questions.map(q => ({
        ...q,
        img: normalizeImageUrl(q.img),
        ans: (q.ans || []).map(a => ({
            ...a,
            img: normalizeImageUrl(a.img)
        }))
    }))
}

export default function EditTradeinProductPage() {
    const { id } = useParams()
    const router = useTransitionRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [product, setProduct] = useState(null)

    // eBay pricing state
    const [ebayPricing, setEbayPricing] = useState(null)
    const [ebayLoading, setEbayLoading] = useState(false)

    // Copy questions from other products
    const [otherProducts, setOtherProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [showCopySelect, setShowCopySelect] = useState(false)

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
                // Filter products that have questions and are not the current product
                const productsWithQuestions = data.products.filter(
                    p => p.id !== id && p.questions && p.questions.length > 0
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
            toast.success(`Copied ${copiedQuestions.length} questions from "${sourceProduct.title}"`)
            setShowCopySelect(false)
        }
    }

    const fetchEbayPrice = async () => {
        if (!formData.title) {
            toast.error('Please enter a product title first')
            return
        }
        setEbayLoading(true)
        try {
            const response = await fetch(
                `/api/tradeins/ebay-price?query=${encodeURIComponent(formData.title)}`
            )
            const data = await response.json()
            if (data.suggestedTradeIn) {
                setEbayPricing(data)
                toast.success(`eBay price fetched: $${data.suggestedTradeIn}`)
            } else {
                toast.error(data.error || 'No eBay data found', {
                    description: data.details || (data.sandbox ? 'Sandbox mode - no real data available' : 'Try a different search term')
                })
            }
        } catch (error) {
            toast.error('Failed to fetch eBay price', {
                description: error.message
            })
        } finally {
            setEbayLoading(false)
        }
    }

    const applyEbayPrice = () => {
        if (ebayPricing?.suggestedTradeIn) {
            handleInputChange('base_price', ebayPricing.suggestedTradeIn.toString())
            toast.success('eBay price applied to base price')
        }
    }

    // Form state with new schema
    const [formData, setFormData] = useState({
        title: '',
        des: '',
        base_price: '',
        min_price: '',
        category: '',
        brand: '',
        series: '',
        brand_img: '',
        imgs: [],
        release_date: '',
        depreciation_schedule: 'standard',
        is_featured: false,
        questions: []
    })

    // Fetch product data
    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoading(true)
                const response = await fetch(`/api/admin/tradein?id=${id}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch tradable product')
                }

                const foundProduct = data.product
                if (!foundProduct) {
                    throw new Error('Tradable product not found')
                }

                setProduct(foundProduct)
                setFormData({
                    title: foundProduct.title || '',
                    des: foundProduct.des || '',
                    base_price: foundProduct.base_price?.toString() || '',
                    min_price: foundProduct.min_price?.toString() || '',
                    category: foundProduct.category || '',
                    brand: foundProduct.brand || '',
                    series: foundProduct.series || '',
                    brand_img: normalizeImageUrl(foundProduct.brand_img),
                    imgs: foundProduct.imgs || [],
                    release_date: foundProduct.release_date ? foundProduct.release_date.split('T')[0] : '',
                    depreciation_schedule: foundProduct.depreciation_schedule || 'standard',
                    is_featured: foundProduct.is_featured || false,
                    questions: normalizeQuestions(foundProduct.questions)
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchProduct()
        }
    }, [id])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Calculate estimated current value based on release date
    const getEstimatedValue = () => {
        if (!formData.base_price || !formData.release_date) {
            return null
        }
        const release = new Date(formData.release_date)
        const now = new Date()
        const monthsOld = Math.floor((now - release) / (1000 * 60 * 60 * 24 * 30))

        let multiplier = 100
        if (monthsOld >= 36) multiplier = 45
        else if (monthsOld >= 24) multiplier = 65
        else if (monthsOld >= 12) multiplier = 80
        else if (monthsOld >= 6) multiplier = 90

        return {
            value: (parseFloat(formData.base_price) || 0) * (multiplier / 100),
            multiplier
        }
    }

    const estimatedValue = getEstimatedValue()

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
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    ...formData,
                    brand_img: uploadedBrandImg || null,
                    imgs: uploadedProductImgs,
                    base_price: parseFloat(formData.base_price) || 0,
                    min_price: formData.min_price ? parseFloat(formData.min_price) : null,
                    release_date: formData.release_date || null,
                    depreciation_schedule: formData.depreciation_schedule || 'standard',
                    is_featured: formData.is_featured || false,
                    questions: processedQuestions
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update tradable product')
            }

            setSuccess(true)
            setProduct(data.product)
            toast.success('Trade-in product updated successfully!')

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

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Trade-in Product</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            Loading tradable product...
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error && !product) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Trade-in Product</h1>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="text-red-800 text-center">
                            Error: {error}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ArrowRightLeftIcon className="w-6 h-6" />
                    Edit Trade-in Product
                </h1>
                <Button variant="outline" size="sm" onClick={() => {
                    const EditPage = () => <EditTradeinProductPage />
                    openWindow(`Edit Trade-in Product - ${product?.title}`, <EditPage />, {icon: <EditIcon className="w-4 h-4" />})
                    router.back()
                }}
                >
                    <PictureInPictureIcon className="w-4 h-4" />
                    Pop window
                </Button>
            </div>

            {success && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="text-green-800 text-center">
                            Trade-in product updated successfully!
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
                        <CardDescription>Edit the trade-in product details below</CardDescription>
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
                            <Label htmlFor="des">Description</Label>
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
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    placeholder="e.g., Smartphones"
                                    required
                                />
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
                                    <Label htmlFor="release_date" className="flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        Release Date
                                    </Label>
                                    <Input
                                        id="release_date"
                                        type="date"
                                        value={formData.release_date}
                                        onChange={(e) => handleInputChange('release_date', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Used to calculate depreciation
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="depreciation_schedule">Depreciation Schedule</Label>
                                    <select
                                        id="depreciation_schedule"
                                        value={formData.depreciation_schedule}
                                        onChange={(e) => handleInputChange('depreciation_schedule', e.target.value)}
                                        className="w-full h-10 px-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="premium">Premium (Slower)</option>
                                        <option value="budget">Budget (Faster)</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        How quickly value decreases over time
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

                            {/* eBay Market Price */}
                            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUpIcon className="w-5 h-5 text-purple-600" />
                                        <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                                            eBay Market Price
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchEbayPrice}
                                        disabled={ebayLoading}
                                        className="border-purple-200 hover:bg-purple-100"
                                    >
                                        {ebayLoading ? (
                                            <LoaderIcon className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                            <RefreshCwIcon className="w-4 h-4 mr-1" />
                                        )}
                                        {ebayLoading ? 'Checking...' : 'Check eBay'}
                                    </Button>
                                </div>

                                {ebayPricing ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Suggested Trade-in</p>
                                                <p className="text-xl font-bold text-purple-600">
                                                    ${ebayPricing.suggestedTradeIn?.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Trade-in Range</p>
                                                <p className="font-medium">
                                                    ${ebayPricing.tradeInRange?.low?.toFixed(2)} - ${ebayPricing.tradeInRange?.high?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        {ebayPricing.usedMarket && (
                                            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                                                <div>
                                                    <p className="text-muted-foreground">Used Avg</p>
                                                    <p className="font-medium">${ebayPricing.usedMarket.average?.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Used Median</p>
                                                    <p className="font-medium">${ebayPricing.usedMarket.median?.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Listings</p>
                                                    <p className="font-medium">{ebayPricing.usedMarket.count || 0}</p>
                                                </div>
                                            </div>
                                        )}
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="sm"
                                            onClick={applyEbayPrice}
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                        >
                                            Apply eBay Price as Base Price
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Click "Check eBay" to fetch current market prices
                                    </p>
                                )}
                            </div>
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
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <HelpCircleIcon className="w-5 h-5 text-blue-600" />
                                    Product Questions
                                </h3>
                                <div className="flex items-center gap-2">
                                    {/* Copy from another product */}
                                    {showCopySelect ? (
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
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newQuestions = [...(formData.questions || []), {
                                                title: '',
                                                type: 'single', // 'single' or 'multiple'
                                                required: true,
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
                                                    <div className="flex items-center gap-2">
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

                        {/* Product Stats (Read-only) */}
                        {product && (
                            <div className="space-y-2">
                                <Label>Product Statistics</Label>
                                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Views</div>
                                        <div className="text-lg font-semibold">{product.views || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Trades</div>
                                        <div className="text-lg font-semibold">{product.trades || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Likes</div>
                                        <div className="text-lg font-semibold">{product.likes || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Created</div>
                                        <div className="text-sm font-medium">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="w-4 h-4 mr-2" />
                                        Update Trade-in Product
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
