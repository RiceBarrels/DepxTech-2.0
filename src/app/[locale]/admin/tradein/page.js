"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useSearchParams, useRouter as useNextRouter } from "next/navigation"
import { useState, useEffect, useRef, Fragment, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    EditIcon,
    TrashIcon,
    PlusIcon,
    SearchIcon,
    ArrowRightLeftIcon,
    DownloadIcon,
    UploadIcon,
    StarIcon,
    ImageIcon,
    CopyIcon,
    FileTextIcon,
    LayoutGridIcon,
    LayoutListIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PackageIcon,
    PercentIcon,
    EyeIcon,
    MoreHorizontalIcon,
    XIcon,
    SaveIcon,
    LoaderIcon,
    HelpCircleIcon,
    CalendarIcon,
    CheckIcon,
    MinusIcon,
    DollarSignIcon
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import { CategorySelect } from "@/components/admin/CategorySelect"

// Helper to normalize image URL
const normalizeImageUrl = (img) => {
    if (!img) return ''
    if (typeof img === 'string') return img
    if (typeof img === 'object' && img.url) return img.url
    return ''
}

// Normalize questions
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

export default function TradeinManagePage() {
    const t = useTranslations('admin.tradein')
    const router = useTransitionRouter()
    const nextRouter = useNextRouter()
    const searchParams = useSearchParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filteredProducts, setFilteredProducts] = useState([])
    const [deleting, setDeleting] = useState(null)
    const [exporting, setExporting] = useState(false)
    const [importing, setImporting] = useState(false)
    const [fetchingPrices, setFetchingPrices] = useState(false)
    const fileInputRef = useRef(null)

    // View mode from localStorage
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('tradein_viewMode') || 'table'
        return 'table'
    })

    // Filter and search state from URL params
    const searchTerm = searchParams.get('q') || ''
    const categoryFilter = searchParams.get('category') || 'all'
    const brandFilter = searchParams.get('brand') || 'all'
    const sortBy = searchParams.get('sort') || 'created_desc'
    const groupBy = searchParams.get('group') || 'none'
    const [expandedGroups, setExpandedGroups] = useState({})

    const setParam = useCallback((key, value, defaultValue) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === defaultValue) {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        const qs = params.toString()
        nextRouter.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false })
    }, [searchParams, nextRouter])

    const setSearchTerm = (v) => setParam('q', v, '')
    const handleSetViewMode = (v) => { setViewMode(v); localStorage.setItem('tradein_viewMode', v) }
    const setCategoryFilter = (v) => setParam('category', v, 'all')
    const setBrandFilter = (v) => setParam('brand', v, 'all')
    const setSortBy = (v) => setParam('sort', v, 'created_desc')
    const setGroupBy = (v) => setParam('group', v, 'none')

    // Selection state
    const [selectedIds, setSelectedIds] = useState(new Set())

    // Side panel edit state
    const [editingProduct, setEditingProduct] = useState(null)
    const [editFormData, setEditFormData] = useState(null)
    const [saving, setSaving] = useState(false)
    const [otherProducts, setOtherProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [showCopySelect, setShowCopySelect] = useState(false)

    // Templates state
    const [templates, setTemplates] = useState([])
    const [loadingTemplates, setLoadingTemplates] = useState(false)
    const [showTemplateSelect, setShowTemplateSelect] = useState(false)

    // Fetch tradable products
    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true)
                const response = await fetch('/api/admin/tradein')
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch tradable products')
                }

                setProducts(data.products || [])
                setFilteredProducts(data.products || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    // Get unique values for filters
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort()
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort()

    // Filter and sort products
    useEffect(() => {
        let filtered = [...products]

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter)
        }

        if (brandFilter !== 'all') {
            filtered = filtered.filter(p => p.brand === brandFilter)
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            filtered = filtered.filter(product =>
                product.title?.toLowerCase().includes(search) ||
                product.des?.toLowerCase().includes(search) ||
                product.category?.toLowerCase().includes(search) ||
                product.brand?.toLowerCase().includes(search) ||
                product.series?.toLowerCase().includes(search)
            )
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title_asc':
                    return (a.title || '').localeCompare(b.title || '')
                case 'title_desc':
                    return (b.title || '').localeCompare(a.title || '')
                case 'price_asc':
                    return (a.base_price || 0) - (b.base_price || 0)
                case 'price_desc':
                    return (b.base_price || 0) - (a.base_price || 0)
                case 'created_asc':
                    return new Date(a.created_at) - new Date(b.created_at)
                case 'created_desc':
                default:
                    return new Date(b.created_at) - new Date(a.created_at)
            }
        })

        setFilteredProducts(filtered)
    }, [searchTerm, products, categoryFilter, brandFilter, sortBy])

    // Group products
    const groupedProducts = () => {
        if (groupBy === 'none') return { 'All Products': filteredProducts }

        const groups = {}
        filteredProducts.forEach(product => {
            const key = product[groupBy] || 'Unknown'
            if (!groups[key]) groups[key] = []
            groups[key].push(product)
        })
        return groups
    }

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }))
    }

    // Selection handlers
    const toggleSelect = (productId) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) {
                newSet.delete(productId)
            } else {
                newSet.add(productId)
            }
            return newSet
        })
    }

    const selectAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)))
        }
    }

    const clearSelection = () => {
        setSelectedIds(new Set())
    }

    // Open edit panel
    const openEditPanel = (product) => {
        setEditingProduct(product)
        setEditFormData({
            title: product.title || '',
            des: product.des || '',
            base_price: product.base_price?.toString() || '',
            min_price: product.min_price?.toString() || '',
            category: product.category || '',
            brand: product.brand || '',
            series: product.series || '',
            brand_img: normalizeImageUrl(product.brand_img),
            imgs: product.imgs || [],
            base_date: product.base_date ? product.base_date.split('T')[0] : '',
            depreciation_rate: product.depreciation_rate?.toString() || '',
            is_featured: product.is_featured || false,
            questions: normalizeQuestions(product.questions)
        })
        setShowCopySelect(false)
        setShowTemplateSelect(false)
    }

    const closeEditPanel = () => {
        setEditingProduct(null)
        setEditFormData(null)
        setShowCopySelect(false)
        setShowTemplateSelect(false)
    }

    const handleEditInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Fetch other products for copying questions
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
                const productsWithQuestions = data.products.filter(
                    p => p.id !== editingProduct?.id && p.questions && p.questions.length > 0
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
            const copiedQuestions = JSON.parse(JSON.stringify(sourceProduct.questions))
            handleEditInputChange('questions', copiedQuestions)
            toast.success(`Copied ${copiedQuestions.length} questions from "${sourceProduct.title}"`)
            setShowCopySelect(false)
        }
    }

    // Fetch templates for applying
    const fetchTemplates = async () => {
        if (templates.length > 0) {
            setShowTemplateSelect(true)
            setShowCopySelect(false)
            return
        }
        setLoadingTemplates(true)
        try {
            const response = await fetch('/api/admin/tradein/templates')
            const data = await response.json()
            if (data.templates) {
                const templatesWithQuestions = data.templates.filter(
                    tmpl => tmpl.questions && tmpl.questions.length > 0
                )
                setTemplates(templatesWithQuestions)
                setShowTemplateSelect(true)
                setShowCopySelect(false)
            }
        } catch (error) {
            toast.error('Failed to fetch templates')
        } finally {
            setLoadingTemplates(false)
        }
    }

    const applyTemplate = (templateId) => {
        const template = templates.find(tmpl => tmpl.id === templateId)
        if (template && template.questions) {
            const copiedQuestions = JSON.parse(JSON.stringify(template.questions))
            handleEditInputChange('questions', copiedQuestions)
            toast.success(`Applied "${template.name}" template (${copiedQuestions.length} questions)`)
            setShowTemplateSelect(false)
        }
    }

    // Save edited product
    const handleSaveEdit = async () => {
        if (!editingProduct || !editFormData) return

        setSaving(true)
        try {
            // Upload images
            const uploadedBrandImg = editFormData.brand_img instanceof File
                ? (await uploadFiles(editFormData.brand_img, 'tradein/brands'))[0]
                : editFormData.brand_img
            const uploadedProductImgs = await uploadFiles(editFormData.imgs, 'tradein/products')

            // Process questions with images
            const processedQuestions = await Promise.all(
                (editFormData.questions || []).map(async (question) => {
                    const questionImg = question.img instanceof File
                        ? (await uploadFiles(question.img, 'tradein/questions'))[0]
                        : question.img || null

                    const processedAnswers = await Promise.all(
                        (question.ans || []).map(async (answer) => {
                            const answerImg = answer.img instanceof File
                                ? (await uploadFiles(answer.img, 'tradein/answers'))[0]
                                : answer.img || null
                            return { ...answer, img: answerImg }
                        })
                    )

                    return { ...question, img: questionImg, ans: processedAnswers }
                })
            )

            const response = await fetch('/api/admin/tradein', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingProduct.id,
                    ...editFormData,
                    brand_img: uploadedBrandImg || null,
                    imgs: uploadedProductImgs,
                    base_price: parseFloat(editFormData.base_price) || 0,
                    min_price: editFormData.min_price ? parseFloat(editFormData.min_price) : null,
                    base_date: editFormData.base_date || null,
                    depreciation_rate: parseFloat(editFormData.depreciation_rate) || 0,
                    is_featured: editFormData.is_featured || false,
                    questions: processedQuestions
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update product')
            }

            // Update product in list
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p))
            toast.success('Product updated successfully!')

            // Move to next selected product or close
            const selectedArray = Array.from(selectedIds)
            const currentIndex = selectedArray.indexOf(editingProduct.id)
            if (currentIndex < selectedArray.length - 1) {
                const nextProduct = products.find(p => p.id === selectedArray[currentIndex + 1])
                if (nextProduct) {
                    openEditPanel(nextProduct)
                    return
                }
            }
            closeEditPanel()
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleExport = async () => {
        try {
            setExporting(true)
            const response = await fetch('/api/admin/tradein/export')

            if (!response.ok) {
                throw new Error('Failed to export tradable products')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `tradable-products-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Exported successfully!')
        } catch (error) {
            toast.error('Failed to export: ' + error.message)
        } finally {
            setExporting(false)
        }
    }

    const handleImport = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith('.csv')) {
            toast.error('Please select a CSV file')
            return
        }

        try {
            setImporting(true)
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/admin/tradein/import', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to import')
            }

            toast.success(`Imported ${data.imported} products${data.failed > 0 ? `, ${data.failed} failed` : ''}`)

            const fetchResponse = await fetch('/api/admin/tradein')
            const fetchData = await fetchResponse.json()
            if (fetchResponse.ok) {
                setProducts(fetchData.products || [])
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            toast.error('Failed to import: ' + error.message)
        } finally {
            setImporting(false)
        }
    }

    const handleDelete = async (productId) => {
        if (!confirm('Delete this product?')) return

        setDeleting(productId)
        try {
            const response = await fetch(`/api/admin/tradein?id=${productId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete')
            }

            setProducts(prev => prev.filter(p => p.id !== productId))
            setSelectedIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(productId)
                return newSet
            })
            if (editingProduct?.id === productId) {
                closeEditPanel()
            }
            toast.success('Product deleted')
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setDeleting(null)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} selected products?`)) return

        const idsToDelete = Array.from(selectedIds)
        let deleted = 0
        let failed = 0

        for (const id of idsToDelete) {
            try {
                const response = await fetch(`/api/admin/tradein?id=${id}`, {
                    method: 'DELETE'
                })
                if (response.ok) {
                    deleted++
                } else {
                    failed++
                }
            } catch {
                failed++
            }
        }

        setProducts(prev => prev.filter(p => !selectedIds.has(p.id)))
        setSelectedIds(new Set())
        if (editingProduct && selectedIds.has(editingProduct.id)) {
            closeEditPanel()
        }
        toast.success(`Deleted ${deleted} products${failed > 0 ? `, ${failed} failed` : ''}`)
    }

    const handleFetchEbayPrices = async () => {
        if (selectedIds.size === 0) return

        setFetchingPrices(true)
        try {
            const response = await fetch('/api/admin/tradein/ebay-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch eBay prices')
            }

            // Update local product state with new prices
            setProducts(prev => prev.map(p => {
                const result = data.results?.find(r => r.id === p.id && r.success)
                if (result) {
                    return { ...p, base_price: result.ebay_price, base_date: new Date().toISOString().split('T')[0] }
                }
                return p
            }))

            const details = data.results?.map(r =>
                r.success ? `${r.title}: $${r.ebay_price}` : `${r.title}: ${r.reason}`
            ).join('\n')

            toast.success(`Updated ${data.updated} of ${data.updated + data.failed} products`, {
                description: details,
                duration: 8000
            })
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setFetchingPrices(false)
        }
    }

    const handleDuplicate = async (product) => {
        try {
            const response = await fetch('/api/admin/tradein', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    id: undefined,
                    title: `${product.title} (Copy)`,
                    created_at: undefined,
                    updated_at: undefined,
                    views: 0,
                    trades: 0,
                    likes: 0
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to duplicate')
            }

            setProducts(prev => [data.product, ...prev])
            toast.success('Product duplicated')
        } catch (error) {
            toast.error('Failed to duplicate: ' + error.message)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    const getCurrentValue = (product) => {
        const basePrice = Number(product.base_price) || 0
        const depRate = Number(product.depreciation_rate) || 0
        const multiplier = 100 - depRate
        return basePrice * (multiplier / 100)
    }

    const getEstimatedValue = () => {
        if (!editFormData?.base_price) return null
        const depRate = parseFloat(editFormData.depreciation_rate) || 0
        const multiplier = 100 - depRate
        return {
            value: (parseFloat(editFormData.base_price) || 0) * (multiplier / 100),
            multiplier
        }
    }

    const clearFilters = () => {
        nextRouter.replace(window.location.pathname, { scroll: false })
    }

    const hasActiveFilters = searchTerm || categoryFilter !== 'all' || brandFilter !== 'all'

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
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
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                </div>
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="pt-6">
                        <p className="text-red-800 dark:text-red-400 text-center">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const groups = groupedProducts()
    const estimatedValue = getEstimatedValue()
    const allSelected = selectedIds.size === filteredProducts.length && filteredProducts.length > 0
    const someSelected = selectedIds.size > 0 && selectedIds.size < filteredProducts.length

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{t('title')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('productsTotal', { count: products.length })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                        <DownloadIcon className="w-4 h-4 mr-1.5" />
                        {exporting ? `${t('export')}...` : t('export')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                        <UploadIcon className="w-4 h-4 mr-1.5" />
                        {importing ? `${t('import')}...` : t('import')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/tradein/templates')}>
                        <FileTextIcon className="w-4 h-4 mr-1.5" />
                        {t('templates')}
                    </Button>
                    <Button onClick={() => router.push('/admin/tradein/add')} size="sm">
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        {t('addProduct')}
                    </Button>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
            </div>

            {/* Selection Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="font-medium">{t('selected', { count: selectedIds.size })}</span>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" onClick={handleFetchEbayPrices} disabled={fetchingPrices}>
                        {fetchingPrices ? <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" /> : <DollarSignIcon className="w-4 h-4 mr-1.5" />}
                        {fetchingPrices ? t('fetching') : t('fetchEbayPrices')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        const firstSelected = products.find(p => selectedIds.has(p.id))
                        if (firstSelected) openEditPanel(firstSelected)
                    }}>
                        <EditIcon className="w-4 h-4 mr-1.5" />
                        {t('editSelected')}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleBulkDelete}>
                        <TrashIcon className="w-4 h-4 mr-1.5" />
                        {t('deleteSelected')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection}>
                        <XIcon className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-3 p-3 bg-muted/50 rounded-lg border">
                <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchPlaceholder')} className="pl-9 h-9" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allCategories')}</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allBrands')}</SelectItem>
                            {brands.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_desc">{t('newest')}</SelectItem>
                            <SelectItem value="created_asc">{t('oldest')}</SelectItem>
                            <SelectItem value="title_asc">A-Z</SelectItem>
                            <SelectItem value="title_desc">Z-A</SelectItem>
                            <SelectItem value="price_desc">Price ↓</SelectItem>
                            <SelectItem value="price_asc">Price ↑</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={groupBy} onValueChange={setGroupBy}>
                        <SelectTrigger className="w-[120px] h-9">
                            <SelectValue placeholder="Group by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{t('noGrouping')}</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="brand">Brand</SelectItem>
                            <SelectItem value="series">Series</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                            {t('clear')}
                        </Button>
                    )}

                    <div className="border-l h-6 mx-1" />

                    <div className="flex border rounded-md">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-9 px-2.5 rounded-r-none" onClick={() => handleSetViewMode('grid')}>
                            <LayoutGridIcon className="w-4 h-4" />
                        </Button>
                        <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" className="h-9 px-2.5 rounded-l-none" onClick={() => handleSetViewMode('table')}>
                            <LayoutListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <button
                        onClick={selectAll}
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                        <div className={cn(
                            "w-4 h-4 border rounded flex items-center justify-center",
                            allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/50 border-primary" : "border-muted-foreground/50"
                        )}>
                            {allSelected ? <CheckIcon className="w-3 h-3 text-primary-foreground" /> : someSelected ? <MinusIcon className="w-3 h-3 text-primary-foreground" /> : null}
                        </div>
                        {t('selectAll')}
                    </button>
                    <span>·</span>
                    <span>{t('showing', { filtered: filteredProducts.length, total: products.length })}</span>
                </div>
            </div>

            {/* Main content with side panel */}
            <div className="flex gap-4">
                {/* Products list */}
                <div className={cn("flex-1 min-w-0 transition-all", editingProduct ? "lg:w-1/2" : "w-full")}>
                    {filteredProducts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p className="text-muted-foreground">
                                        {hasActiveFilters ? t('noFilterMatch') : t('noProducts')}
                                    </p>
                                    {!hasActiveFilters && (
                                        <Button className="mt-4" onClick={() => router.push('/admin/tradein/add')}>
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            {t('addFirstProduct')}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : viewMode === 'table' ? (
                        /* Table View */
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-3 font-medium w-10">
                                                <button onClick={selectAll} className={cn(
                                                    "w-4 h-4 border rounded flex items-center justify-center",
                                                    allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/50 border-primary" : ""
                                                )}>
                                                    {allSelected ? <CheckIcon className="w-3 h-3 text-primary-foreground" /> : someSelected ? <MinusIcon className="w-3 h-3 text-primary-foreground" /> : null}
                                                </button>
                                            </th>
                                            <th className="text-left p-3 font-medium">{t('product')}</th>
                                            <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
                                            <th className="text-right p-3 font-medium">{t('basePrice')}</th>
                                            <th className="text-right p-3 font-medium hidden sm:table-cell">{t('current')}</th>
                                            <th className="text-center p-3 font-medium w-[80px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Object.entries(groups).map(([groupName, groupProducts]) => (
                                            <Fragment key={groupName}>
                                                {groupBy !== 'none' && (
                                                    <tr key={`group-${groupName}`} className="bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => toggleGroup(groupName)}>
                                                        <td colSpan={6} className="p-2 px-3">
                                                            <div className="flex items-center gap-2 font-medium">
                                                                {expandedGroups[groupName] === false ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                                                {groupName}
                                                                <Badge variant="secondary" className="ml-2">{groupProducts.length}</Badge>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                {(groupBy === 'none' || expandedGroups[groupName] !== false) && groupProducts.map((product) => {
                                                    const currentValue = getCurrentValue(product)
                                                    const isSelected = selectedIds.has(product.id)
                                                    const isEditing = editingProduct?.id === product.id

                                                    return (
                                                        <tr key={product.id} className={cn("hover:bg-muted/30 cursor-pointer", isEditing && "bg-primary/5", isSelected && "bg-primary/10")} onDoubleClick={() => router.push(`/admin/tradein/edit/${product.id}`)}>
                                                            <td className="p-3">
                                                                <button onClick={(e) => { e.stopPropagation(); toggleSelect(product.id) }} className={cn(
                                                                    "w-4 h-4 border rounded flex items-center justify-center",
                                                                    isSelected ? "bg-primary border-primary" : ""
                                                                )}>
                                                                    {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                                                                </button>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-none flex-shrink-0 overflow-hidden">
                                                                        {product.imgs?.[0] ? (
                                                                            <Image src={product.imgs[0]} alt="" width={40} height={40} className="w-full h-full object-contain" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium truncate flex items-center gap-2">
                                                                            {product.title}
                                                                            {product.is_featured && <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">{product.brand} · {product.series}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 hidden md:table-cell">
                                                                <Badge variant="outline">{product.category}</Badge>
                                                            </td>
                                                            <td className="p-3 text-right font-medium">{formatPrice(product.base_price)}</td>
                                                            <td className="p-3 text-right hidden sm:table-cell">
                                                                <span className="text-green-600 font-medium">{formatPrice(currentValue)}</span>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditPanel(product)}>
                                                                        <EditIcon className="w-4 h-4" />
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                <MoreHorizontalIcon className="w-4 h-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => window.open(`/trade/product/${product.id}`, '_blank')}>
                                                                                <EyeIcon className="w-4 h-4 mr-2" />{t('viewLive')}
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                                                                                <CopyIcon className="w-4 h-4 mr-2" />{t('duplicate')}
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)} disabled={deleting === product.id}>
                                                                                <TrashIcon className="w-4 h-4 mr-2" />{t('delete')}
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Grid View */
                        <div className="space-y-6">
                            {Object.entries(groups).map(([groupName, groupProducts]) => (
                                <div key={groupName}>
                                    {groupBy !== 'none' && (
                                        <button className="flex items-center gap-2 mb-3 font-semibold text-lg hover:text-primary transition-colors" onClick={() => toggleGroup(groupName)}>
                                            {expandedGroups[groupName] === false ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                            {groupName}
                                            <Badge variant="secondary">{groupProducts.length}</Badge>
                                        </button>
                                    )}

                                    {(groupBy === 'none' || expandedGroups[groupName] !== false) && (
                                        <div className={cn("grid gap-4", editingProduct ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
                                            {groupProducts.map((product) => {
                                                const currentValue = getCurrentValue(product)
                                                const depRate = Number(product.depreciation_rate) || 0
                                                const isSelected = selectedIds.has(product.id)
                                                const isEditing = editingProduct?.id === product.id

                                                return (
                                                    <Card key={product.id} className={cn("group hover:shadow-md transition-all cursor-pointer", isEditing && "ring-2 ring-primary", isSelected && "bg-primary/5")}>
                                                        <CardContent className="p-4" onClick={() => openEditPanel(product)} onDoubleClick={() => router.push(`/admin/tradein/edit/${product.id}`)}>
                                                            <div className="flex gap-4">
                                                                {/* Checkbox */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleSelect(product.id) }}
                                                                    className={cn(
                                                                        "w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center mt-1",
                                                                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                                    )}
                                                                >
                                                                    {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                                                                </button>

                                                                {/* Image */}
                                                                <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                                                    {product.imgs?.[0] ? (
                                                                        <Image src={product.imgs[0]} alt={product.title} width={64} height={64} className="w-full h-full object-contain" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold truncate flex items-center gap-2">
                                                                        {product.title}
                                                                        {product.is_featured && <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                                                    </h3>
                                                                    <p className="text-sm text-muted-foreground">{product.brand} · {product.series}</p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <span className="font-semibold">{formatPrice(product.base_price)}</span>
                                                                        <span className="text-muted-foreground">→</span>
                                                                        <span className="font-semibold text-green-600">{formatPrice(currentValue)}</span>
                                                                        {depRate > 0 && (
                                                                            <Badge variant="secondary" className="text-xs">-{depRate}%</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                                            <MoreHorizontalIcon className="w-4 h-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/trade/product/${product.id}`, '_blank') }}>
                                                                            <EyeIcon className="w-4 h-4 mr-2" />{t('viewLive')}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(product) }}>
                                                                            <CopyIcon className="w-4 h-4 mr-2" />{t('duplicate')}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(product.id) }} disabled={deleting === product.id}>
                                                                            <TrashIcon className="w-4 h-4 mr-2" />{t('delete')}
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Side Panel Editor */}
                {editingProduct && editFormData && (
                    <div className="hidden lg:block w-[500px] flex-shrink-0">
                        <div className="sticky top-4 border rounded-lg bg-background shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto">
                            {/* Panel Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
                                <div className="flex items-center gap-2 min-w-0">
                                    <EditIcon className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-semibold truncate">{editingProduct.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedIds.size > 1 && (
                                        <span className="text-xs text-muted-foreground">
                                            {Array.from(selectedIds).indexOf(editingProduct.id) + 1} of {selectedIds.size}
                                        </span>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeEditPanel}>
                                        <XIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Panel Content */}
                            <div className="p-4 space-y-4">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-title">Title *</Label>
                                    <Input id="edit-title" value={editFormData.title} onChange={(e) => handleEditInputChange('title', e.target.value)} />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-des">Description</Label>
                                    <textarea
                                        id="edit-des"
                                        className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                                        value={editFormData.des}
                                        onChange={(e) => handleEditInputChange('des', e.target.value)}
                                    />
                                </div>

                                {/* Category, Brand, Series */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-category">Category *</Label>
                                        <CategorySelect value={editFormData.category} onChange={(val) => handleEditInputChange('category', val)} className="h-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-brand">Brand *</Label>
                                        <Input id="edit-brand" value={editFormData.brand} onChange={(e) => handleEditInputChange('brand', e.target.value)} className="h-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-series">Series *</Label>
                                        <Input id="edit-series" value={editFormData.series} onChange={(e) => handleEditInputChange('series', e.target.value)} className="h-9" />
                                    </div>
                                </div>

                                {/* Brand Image */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Brand Image</Label>
                                    <div className="flex items-center gap-3">
                                        {editFormData.brand_img && (
                                            <div className="relative w-12 h-12 rounded border bg-muted flex-shrink-0">
                                                <Image
                                                    src={normalizeImageUrl(editFormData.brand_img)}
                                                    alt="Brand"
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditInputChange('brand_img', '')}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                        <ImageUpload
                                            value={editFormData.brand_img ? [editFormData.brand_img] : []}
                                            onChange={(urls) => handleEditInputChange('brand_img', urls[0] || '')}
                                            multiple={false}
                                            folder="tradein/brands"
                                            label={editFormData.brand_img ? "Change" : "Upload"}
                                            onDelete={deleteFileFromBucket}
                                            compact={true}
                                        />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                        <span className="text-green-600">$</span>
                                        {t('pricing')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-base_price" className="text-xs">{t('basePrice')} *</Label>
                                            <Input id="edit-base_price" type="number" step="0.01" min="0" value={editFormData.base_price} onChange={(e) => handleEditInputChange('base_price', e.target.value)} className="h-9" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-min_price" className="text-xs">{t('minPrice')}</Label>
                                            <Input id="edit-min_price" type="number" step="0.01" min="0" value={editFormData.min_price} onChange={(e) => handleEditInputChange('min_price', e.target.value)} className="h-9" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-base_date" className="text-xs">{t('baseDate')}</Label>
                                            <Input id="edit-base_date" type="date" value={editFormData.base_date} onChange={(e) => handleEditInputChange('base_date', e.target.value)} className="h-9" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-depreciation_rate" className="text-xs">{t('depreciation')}</Label>
                                            <Input id="edit-depreciation_rate" type="number" step="1" min="0" max="100" value={editFormData.depreciation_rate} onChange={(e) => handleEditInputChange('depreciation_rate', e.target.value)} className="h-9" />
                                        </div>
                                    </div>
                                    {estimatedValue && (
                                        <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                                            <span className="text-sm text-blue-700 dark:text-blue-400">{t('currentValue')}</span>
                                            <span className="font-bold text-blue-600">${estimatedValue.value.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Featured */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="edit-is_featured" checked={editFormData.is_featured} onCheckedChange={(checked) => handleEditInputChange('is_featured', checked)} />
                                    <Label htmlFor="edit-is_featured" className="flex items-center gap-2 cursor-pointer">
                                        <StarIcon className="w-4 h-4 text-yellow-500" />
                                        {t('featured')}
                                    </Label>
                                </div>

                                {/* Questions */}
                                <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm flex items-center gap-2">
                                            <HelpCircleIcon className="w-4 h-4 text-blue-600" />
                                            {t('questions')} ({editFormData.questions?.length || 0})
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            {showTemplateSelect ? (
                                                <div className="flex items-center gap-1">
                                                    <Select onValueChange={applyTemplate}>
                                                        <SelectTrigger className="w-[160px] h-7 text-xs">
                                                            <SelectValue placeholder="Select template..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {templates.length === 0 ? (
                                                                <SelectItem value="none" disabled>No templates found</SelectItem>
                                                            ) : (
                                                                templates.map((tmpl) => (
                                                                    <SelectItem key={tmpl.id} value={tmpl.id}>{tmpl.name} ({tmpl.questions.length})</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowTemplateSelect(false)}>
                                                        <XIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : showCopySelect ? (
                                                <div className="flex items-center gap-1">
                                                    <Select onValueChange={copyQuestionsFromProduct}>
                                                        <SelectTrigger className="w-[160px] h-7 text-xs">
                                                            <SelectValue placeholder="Copy from..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {otherProducts.length === 0 ? (
                                                                <SelectItem value="none" disabled>No products found</SelectItem>
                                                            ) : (
                                                                otherProducts.map((p) => (
                                                                    <SelectItem key={p.id} value={p.id}>{p.title} ({p.questions.length})</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowCopySelect(false)}>
                                                        <XIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={fetchTemplates} disabled={loadingTemplates}>
                                                        {loadingTemplates ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <FileTextIcon className="w-3 h-3 mr-1" />}
                                                        {t('template')}
                                                    </Button>
                                                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={fetchOtherProducts} disabled={loadingProducts}>
                                                        {loadingProducts ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <CopyIcon className="w-3 h-3 mr-1" />}
                                                        {t('copy')}
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => {
                                                    const newQuestions = [...(editFormData.questions || []), { title: '', type: 'single', required: true, ans: [] }]
                                                    handleEditInputChange('questions', newQuestions)
                                                }}
                                            >
                                                <PlusIcon className="w-3 h-3 mr-1" />
                                                {t('add')}
                                            </Button>
                                        </div>
                                    </div>

                                    {editFormData.questions && editFormData.questions.length > 0 ? (
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {editFormData.questions.map((question, qIndex) => (
                                                <div key={qIndex} className="border rounded p-2 bg-background space-y-2 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1 space-y-1">
                                                            <Input
                                                                value={question.title}
                                                                onChange={(e) => {
                                                                    const newQuestions = [...editFormData.questions]
                                                                    newQuestions[qIndex].title = e.target.value
                                                                    handleEditInputChange('questions', newQuestions)
                                                                }}
                                                                placeholder="Question text..."
                                                                className="h-8 text-sm"
                                                            />
                                                            <Input
                                                                value={question.description || ''}
                                                                onChange={(e) => {
                                                                    const newQuestions = [...editFormData.questions]
                                                                    newQuestions[qIndex].description = e.target.value
                                                                    handleEditInputChange('questions', newQuestions)
                                                                }}
                                                                placeholder="Description (optional)..."
                                                                className="h-7 text-xs text-muted-foreground"
                                                            />
                                                        </div>
                                                        <Select
                                                            value={question.type || 'single'}
                                                            onValueChange={(value) => {
                                                                const newQuestions = [...editFormData.questions]
                                                                newQuestions[qIndex].type = value
                                                                handleEditInputChange('questions', newQuestions)
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-8 w-[110px] text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="single">Single</SelectItem>
                                                                <SelectItem value="multiple">Multi</SelectItem>
                                                                <SelectItem value="opposite_multiple">Opp. Multi</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500"
                                                            onClick={() => {
                                                                const newQuestions = editFormData.questions.filter((_, i) => i !== qIndex)
                                                                handleEditInputChange('questions', newQuestions)
                                                            }}
                                                        >
                                                            <TrashIcon className="w-3 h-3" />
                                                        </Button>
                                                    </div>

                                                    {/* Answers */}
                                                    <div className="pl-3 border-l-2 border-muted space-y-1">
                                                        {question.ans && question.ans.map((answer, aIndex) => (
                                                            <div key={aIndex} className="flex items-center gap-1">
                                                                <Input
                                                                    value={answer.content}
                                                                    onChange={(e) => {
                                                                        const newQuestions = [...editFormData.questions]
                                                                        newQuestions[qIndex].ans[aIndex].content = e.target.value
                                                                        handleEditInputChange('questions', newQuestions)
                                                                    }}
                                                                    placeholder="Answer"
                                                                    className="h-7 text-xs flex-1"
                                                                />
                                                                <Input
                                                                    value={answer.persentage || ''}
                                                                    onChange={(e) => {
                                                                        const newQuestions = [...editFormData.questions]
                                                                        newQuestions[qIndex].ans[aIndex].persentage = e.target.value
                                                                        handleEditInputChange('questions', newQuestions)
                                                                    }}
                                                                    placeholder="%"
                                                                    className="h-7 w-14 text-xs"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-red-500"
                                                                    onClick={() => {
                                                                        const newQuestions = [...editFormData.questions]
                                                                        newQuestions[qIndex].ans = newQuestions[qIndex].ans.filter((_, i) => i !== aIndex)
                                                                        handleEditInputChange('questions', newQuestions)
                                                                    }}
                                                                >
                                                                    <XIcon className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-xs"
                                                            onClick={() => {
                                                                const newQuestions = [...editFormData.questions]
                                                                if (!newQuestions[qIndex].ans) newQuestions[qIndex].ans = []
                                                                newQuestions[qIndex].ans.push({ content: '', persentage: '', fixed: '' })
                                                                handleEditInputChange('questions', newQuestions)
                                                            }}
                                                        >
                                                            <PlusIcon className="w-3 h-3 mr-1" />
                                                            Add Answer
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-2">{t('noQuestions')}</p>
                                    )}
                                </div>

                                {/* Images */}
                                <div className="space-y-2">
                                    <Label className="text-sm">{t('productImages')}</Label>
                                    <ImageUpload
                                        value={editFormData.imgs}
                                        onChange={(urls) => handleEditInputChange('imgs', urls)}
                                        multiple={true}
                                        folder="tradein/products"
                                        label=""
                                        onDelete={deleteFileFromBucket}
                                        compact={true}
                                    />
                                </div>
                            </div>

                            {/* Panel Footer */}
                            <div className="sticky bottom-0 flex items-center justify-between gap-2 p-4 border-t bg-background">
                                <Button type="button" variant="outline" size="sm" onClick={closeEditPanel}>
                                    {t('cancel')}
                                </Button>
                                <div className="flex items-center gap-2">
                                    {selectedIds.size > 1 && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={saving}
                                                onClick={() => {
                                                    const selectedArray = Array.from(selectedIds)
                                                    const currentIndex = selectedArray.indexOf(editingProduct.id)
                                                    if (currentIndex > 0) {
                                                        const prevProduct = products.find(p => p.id === selectedArray[currentIndex - 1])
                                                        if (prevProduct) openEditPanel(prevProduct)
                                                    }
                                                }}
                                            >
                                                {`← ${t('prev')}`}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={saving}
                                                onClick={() => {
                                                    const selectedArray = Array.from(selectedIds)
                                                    const currentIndex = selectedArray.indexOf(editingProduct.id)
                                                    if (currentIndex < selectedArray.length - 1) {
                                                        const nextProduct = products.find(p => p.id === selectedArray[currentIndex + 1])
                                                        if (nextProduct) openEditPanel(nextProduct)
                                                    }
                                                }}
                                            >
                                                Next →
                                            </Button>
                                        </>
                                    )}
                                    <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <LoaderIcon className="w-4 h-4 animate-spin mr-1" />
                                                {t('saving')}
                                            </>
                                        ) : (
                                            <>
                                                <SaveIcon className="w-4 h-4 mr-1" />
                                                {t('save')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
