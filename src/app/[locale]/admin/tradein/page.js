"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useSearchParams, useRouter as useNextRouter } from "next/navigation"
import { useState, useEffect, useRef, Fragment, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
    ChevronLeftIcon,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import { CategorySelect } from "@/components/admin/CategorySelect"
import { BrandSelect } from "@/components/admin/BrandSelect"
import { AICommandPanel } from "@/components/admin/AICommandPanel"

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
    const [deleting, setDeleting] = useState(null)
    const [exporting, setExporting] = useState(false)
    const [importing, setImporting] = useState(false)
    const [fetchingPrices, setFetchingPrices] = useState(false)
    const [priceProgress, setPriceProgress] = useState({ done: 0, total: 0 })
    const [fetchingBmPrices, setFetchingBmPrices] = useState(false)
    const [bmPriceProgress, setBmPriceProgress] = useState({ done: 0, total: 0 })
    const fileInputRef = useRef(null)

    // View mode from localStorage
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('tradein_viewMode') || 'table'
        return 'table'
    })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(() => {
        if (typeof window !== 'undefined') return parseInt(localStorage.getItem('tradein_perPage') || '20', 10)
        return 20
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
    const handleSetPerPage = (v) => { const n = parseInt(v, 10); setPerPage(n); setCurrentPage(1); localStorage.setItem('tradein_perPage', String(n)) }
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

    // Bulk template apply state
    const [showBulkTemplateDialog, setShowBulkTemplateDialog] = useState(false)
    const [applyingTemplate, setApplyingTemplate] = useState(false)

    // Image dialog state
    const [imageDialogProduct, setImageDialogProduct] = useState(null)
    const [imageDialogImages, setImageDialogImages] = useState([])
    const [savingImages, setSavingImages] = useState(false)

    // Description expand state
    const [expandedDesIds, setExpandedDesIds] = useState(new Set())

    // Inline editing state
    const [inlineEdits, setInlineEdits] = useState({})
    const [savingInline, setSavingInline] = useState(null)

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
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    // Get unique values for filters
    const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort(), [products])
    const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products])

    // Filter and sort products (memoized)
    const filteredProducts = useMemo(() => {
        let filtered = products

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

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'title_asc': return (a.title || '').localeCompare(b.title || '')
                case 'title_desc': return (b.title || '').localeCompare(a.title || '')
                case 'price_asc': return (a.base_price || 0) - (b.base_price || 0)
                case 'price_desc': return (b.base_price || 0) - (a.base_price || 0)
                case 'updated_asc': return (a.base_date || '0') < (b.base_date || '0') ? -1 : (a.base_date || '0') > (b.base_date || '0') ? 1 : 0
                case 'updated_desc': return (b.base_date || '9') < (a.base_date || '9') ? -1 : (b.base_date || '9') > (a.base_date || '9') ? 1 : 0
                case 'created_asc': return new Date(a.created_at) - new Date(b.created_at)
                case 'created_desc':
                default: return new Date(b.created_at) - new Date(a.created_at)
            }
        })
    }, [products, categoryFilter, brandFilter, searchTerm, sortBy])

    // Reset page when filters change
    const prevFilterKey = useRef('')
    useEffect(() => {
        const key = `${searchTerm}|${categoryFilter}|${brandFilter}|${sortBy}`
        if (prevFilterKey.current && prevFilterKey.current !== key) setCurrentPage(1)
        prevFilterKey.current = key
    }, [searchTerm, categoryFilter, brandFilter, sortBy])

    // Pagination (memoized)
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage))
    const safePage = Math.min(currentPage, totalPages)
    const paginatedProducts = useMemo(
        () => filteredProducts.slice((safePage - 1) * perPage, safePage * perPage),
        [filteredProducts, safePage, perPage]
    )

    // Group products (memoized)
    const groupedProducts = useMemo(() => {
        if (groupBy === 'none') return { 'All Products': paginatedProducts }
        const groups = {}
        paginatedProducts.forEach(product => {
            const key = product[groupBy] || 'Unknown'
            if (!groups[key]) groups[key] = []
            groups[key].push(product)
        })
        return groups
    }, [paginatedProducts, groupBy])

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
            questions: normalizeQuestions(product.questions),
            question_template_id: product.question_template_id || null
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
            handleEditInputChange('question_template_id', null)
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
            handleEditInputChange('question_template_id', templateId)
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
                    imgs: uploadedProductImgs,
                    base_price: parseFloat(editFormData.base_price) || 0,
                    min_price: editFormData.min_price ? parseFloat(editFormData.min_price) : null,
                    base_date: editFormData.base_date || null,
                    depreciation_rate: parseFloat(editFormData.depreciation_rate) || 0,
                    is_featured: editFormData.is_featured || false,
                    questions: processedQuestions,
                    question_template_id: editFormData.question_template_id
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
        const total = selectedIds.size
        setPriceProgress({ done: 0, total })
        try {
            const response = await fetch('/api/admin/tradein/ebay-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            })

            if (!response.ok) {
                let errMsg = 'Failed to fetch eBay prices'
                try {
                    const data = await response.json()
                    errMsg = data.error || errMsg
                } catch {}
                throw new Error(errMsg)
            }

            // Stream results — update each product as it arrives
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let summary = null
            let processed = 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const result = JSON.parse(line)
                        if (result.done) {
                            summary = result
                            continue
                        }
                        processed++
                        setPriceProgress({ done: processed, total })
                        // Update product immediately
                        if (result.success) {
                            setProducts(prev => prev.map(p =>
                                p.id === result.id
                                    ? { ...p, base_price: result.ebay_price, base_date: new Date().toISOString().split('T')[0] }
                                    : p
                            ))
                            toast.success(`${result.title}: $${result.ebay_price}`, { duration: 3000 })
                        } else {
                            toast.warning(`${result.title}: ${result.reason}`, { duration: 4000 })
                        }
                    } catch {}
                }
            }

            if (summary) {
                toast.success(`Done — updated ${summary.updated} of ${summary.updated + summary.failed} products`, { duration: 5000 })
            }
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setFetchingPrices(false)
            setPriceProgress({ done: 0, total: 0 })
        }
    }

    const handleFetchBackmarketPrices = async () => {
        if (selectedIds.size === 0) return

        setFetchingBmPrices(true)
        const total = selectedIds.size
        setBmPriceProgress({ done: 0, total })
        try {
            const response = await fetch('/api/admin/tradein/backmarket-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            })

            if (!response.ok) {
                let errMsg = 'Failed to fetch Back Market prices'
                try {
                    const data = await response.json()
                    errMsg = data.error || errMsg
                } catch {}
                throw new Error(errMsg)
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let summary = null
            let processed = 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const result = JSON.parse(line)
                        if (result.done) {
                            summary = result
                            continue
                        }
                        processed++
                        setBmPriceProgress({ done: processed, total })
                        if (result.success) {
                            setProducts(prev => prev.map(p =>
                                p.id === result.id
                                    ? { ...p, base_price: result.bm_price, base_date: new Date().toISOString().split('T')[0] }
                                    : p
                            ))
                            toast.success(`${result.title}: $${result.bm_price}`, { duration: 3000 })
                        } else {
                            toast.warning(`${result.title}: ${result.reason}`, { duration: 4000 })
                        }
                    } catch {}
                }
            }

            if (summary) {
                toast.success(`Done — updated ${summary.updated} of ${summary.updated + summary.failed} products`, { duration: 5000 })
            }
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setFetchingBmPrices(false)
            setBmPriceProgress({ done: 0, total: 0 })
        }
    }

    const handleBulkApplyTemplate = async (templateId) => {
        if (selectedIds.size === 0) return

        setApplyingTemplate(true)
        try {
            const response = await fetch('/api/admin/tradein/apply-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId,
                    productIds: Array.from(selectedIds)
                })
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to apply template')
            }

            // Refresh products list
            const refreshResponse = await fetch('/api/admin/tradein')
            const refreshData = await refreshResponse.json()
            if (refreshResponse.ok) {
                setProducts(refreshData.products || [])
            }

            toast.success(`Applied "${data.templateName}" to ${data.updatedCount} products`)
            setShowBulkTemplateDialog(false)
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setApplyingTemplate(false)
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

    // Toggle description expand in grid/table view
    const toggleDesExpand = (productId, e) => {
        if (e) e.stopPropagation()
        setExpandedDesIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) newSet.delete(productId)
            else newSet.add(productId)
            return newSet
        })
    }

    // Open image dialog for a product
    const openImageDialog = (product, e) => {
        if (e) e.stopPropagation()
        setImageDialogProduct(product)
        setImageDialogImages(product.imgs || [])
    }

    // Save images from dialog
    const handleImageDialogSave = async () => {
        if (!imageDialogProduct) return
        setSavingImages(true)
        try {
            const uploadedImgs = await uploadFiles(imageDialogImages, 'tradein/products')
            const response = await fetch('/api/admin/tradein', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...imageDialogProduct,
                    imgs: uploadedImgs
                })
            })
            if (!response.ok) throw new Error('Failed to update images')
            const data = await response.json()
            setProducts(prev => prev.map(p => p.id === imageDialogProduct.id ? data.product : p))
            if (editFormData && editingProduct?.id === imageDialogProduct.id) {
                handleEditInputChange('imgs', uploadedImgs)
            }
            toast.success('Images updated')
            setImageDialogProduct(null)
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setSavingImages(false)
        }
    }

    // Quick template change for a product from grid/table view
    const handleQuickTemplateChange = async (product, templateId, e) => {
        if (e) e.stopPropagation()
        const template = templates.find(tmpl => tmpl.id === templateId)
        if (!template) return
        try {
            const response = await fetch('/api/admin/tradein/apply-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId,
                    productIds: [product.id]
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to apply template')
            // Refresh this product
            const refreshResponse = await fetch('/api/admin/tradein')
            const refreshData = await refreshResponse.json()
            if (refreshResponse.ok) setProducts(refreshData.products || [])
            toast.success(`Applied "${template.name}" to ${product.title}`)
        } catch (err) {
            toast.error('Error: ' + err.message)
        }
    }

    // Inline editing helpers
    const getInlineValue = (product, field) => {
        if (inlineEdits[product.id]?.[field] !== undefined) return inlineEdits[product.id][field]
        if (field === 'base_price') return product.base_price?.toString() || ''
        return product[field] || ''
    }

    const handleInlineChange = (productId, field, value) => {
        setInlineEdits(prev => ({
            ...prev,
            [productId]: { ...prev[productId], [field]: value }
        }))
    }

    const handleInlineBlur = async (product, field) => {
        const edits = inlineEdits[product.id]
        if (!edits || edits[field] === undefined) return

        const newValue = edits[field]
        const oldValue = field === 'base_price' ? (product.base_price?.toString() || '') : (product[field] || '')
        if (newValue === oldValue) {
            // No change, clear edit
            setInlineEdits(prev => {
                const next = { ...prev }
                if (next[product.id]) {
                    delete next[product.id][field]
                    if (Object.keys(next[product.id]).length === 0) delete next[product.id]
                }
                return next
            })
            return
        }

        setSavingInline(product.id)
        try {
            const updateData = {
                id: product.id,
                title: product.title,
                des: product.des,
                category: product.category,
                brand: product.brand,
                series: product.series,
                brand_img: product.brand_img,
                imgs: product.imgs,
                base_price: product.base_price,
                min_price: product.min_price,
                base_date: product.base_date,
                depreciation_rate: product.depreciation_rate,
                is_featured: product.is_featured,
                questions: product.questions,
                question_template_id: product.question_template_id,
            }
            if (field === 'base_price') {
                updateData.base_price = parseFloat(newValue) || 0
            } else {
                updateData[field] = newValue
            }

            const response = await fetch('/api/admin/tradein', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            if (!response.ok) throw new Error('Failed to save')
            const data = await response.json()
            setProducts(prev => prev.map(p => p.id === product.id ? data.product : p))
            // Clear inline edit
            setInlineEdits(prev => {
                const next = { ...prev }
                delete next[product.id]
                return next
            })
        } catch (err) {
            toast.error(`Save failed: ${err.message}`)
        } finally {
            setSavingInline(null)
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

    const groups = groupedProducts
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
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/tradein/commission')}>
                        <PercentIcon className="w-4 h-4 mr-1.5" />
                        Commission
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/tradein/brands')}>
                        <ImageIcon className="w-4 h-4 mr-1.5" />
                        Brands
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/tradein/categories')}>
                        <LayoutGridIcon className="w-4 h-4 mr-1.5" />
                        Categories
                    </Button>
                    <Button onClick={() => router.push('/admin/tradein/add')} size="sm">
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        {t('addProduct')}
                    </Button>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
            </div>

            {/* AI Command Panel */}
            <AICommandPanel
                products={products}
                onProductsChanged={async () => {
                    try {
                        const response = await fetch('/api/admin/tradein')
                        const data = await response.json()
                        if (response.ok) {
                            setProducts(data.products || [])
                        }
                    } catch (err) {
                        console.error('Failed to refresh products:', err)
                    }
                }}
            />

            {/* Selection Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="font-medium">{t('selected', { count: selectedIds.size })}</span>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" onClick={() => { fetchTemplates(); setShowBulkTemplateDialog(true) }} disabled={applyingTemplate}>
                        {applyingTemplate ? <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" /> : <FileTextIcon className="w-4 h-4 mr-1.5" />}
                        {applyingTemplate ? t('applyingTemplate') : t('applyTemplate')}
                    </Button>
                    <div className="flex flex-col gap-1.5">
                        <Button variant="outline" size="sm" onClick={handleFetchEbayPrices} disabled={fetchingPrices || fetchingBmPrices}>
                            {fetchingPrices ? <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" /> : <DollarSignIcon className="w-4 h-4 mr-1.5" />}
                            {fetchingPrices && priceProgress.total > 0
                                ? `${priceProgress.done}/${priceProgress.total}`
                                : fetchingPrices ? t('fetching') : t('fetchEbayPrices')}
                        </Button>
                        {fetchingPrices && priceProgress.total > 0 && (
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${(priceProgress.done / priceProgress.total) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Button variant="outline" size="sm" onClick={handleFetchBackmarketPrices} disabled={fetchingBmPrices || fetchingPrices}>
                            {fetchingBmPrices ? <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" /> : <DollarSignIcon className="w-4 h-4 mr-1.5" />}
                            {fetchingBmPrices && bmPriceProgress.total > 0
                                ? `${bmPriceProgress.done}/${bmPriceProgress.total}`
                                : fetchingBmPrices ? t('fetching') : t('fetchBackmarketPrices')}
                        </Button>
                        {fetchingBmPrices && bmPriceProgress.total > 0 && (
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${(bmPriceProgress.done / bmPriceProgress.total) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
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
            <div className="flex flex-col lg:flex-row gap-3 p-3 bg-muted/50 rounded-xl border">
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
                            <SelectItem value="updated_asc">Stale first</SelectItem>
                            <SelectItem value="updated_desc">Recent first</SelectItem>
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
                            "w-4 h-4 border rounded-xs flex items-center justify-center",
                            allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/50 border-primary" : "border-muted-foreground/50"
                        )}>
                            {allSelected ? <CheckIcon className="w-3 h-3 text-primary-foreground" /> : someSelected ? <MinusIcon className="w-3 h-3 text-primary-foreground" /> : null}
                        </div>
                        {t('selectAll')}
                    </button>
                    <span>·</span>
                    <span>{t('showing', { filtered: filteredProducts.length, total: products.length })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs">Per page:</span>
                    <Select value={String(perPage)} onValueChange={handleSetPerPage}>
                        <SelectTrigger className="w-[70px] h-7 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main content with side panel */}
            <div className="flex gap-4">
                {/* Products list */}
                <div className={cn("flex-1 min-w-0 transition-all", editingProduct ? "lg:w-1/2" : "w-full")}>
                    {loading ? (
                        <div className="border rounded-lg overflow-hidden">
                            {Array.from({ length: perPage > 8 ? 8 : perPage }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 border-b last:border-0">
                                    <div className="h-4 w-4 bg-muted rounded-xs animate-pulse" />
                                    <div className="w-10 h-10 bg-muted rounded-xs animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded-xs animate-pulse" style={{ width: `${45 + (i * 7) % 35}%` }} />
                                        <div className="h-3 w-24 bg-muted rounded-xs animate-pulse" />
                                    </div>
                                    <div className="h-4 w-16 bg-muted rounded-xs animate-pulse" />
                                    <div className="h-4 w-16 bg-muted rounded-xs animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
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
                                                    "w-4 h-4 border rounded-xs flex items-center justify-center",
                                                    allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/50 border-primary" : ""
                                                )}>
                                                    {allSelected ? <CheckIcon className="w-3 h-3 text-primary-foreground" /> : someSelected ? <MinusIcon className="w-3 h-3 text-primary-foreground" /> : null}
                                                </button>
                                            </th>
                                            <th className="text-left p-3 font-medium">{t('product')}</th>
                                            <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
                                            <th className="text-right p-3 font-medium">{t('basePrice')}</th>
                                            <th className="text-right p-3 font-medium hidden sm:table-cell">{t('current')}</th>
                                            <th className="text-center p-3 font-medium hidden lg:table-cell">Updated</th>
                                            <th className="text-center p-3 font-medium w-[80px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Object.entries(groups).map(([groupName, groupProducts]) => (
                                            <Fragment key={groupName}>
                                                {groupBy !== 'none' && (
                                                    <tr key={`group-${groupName}`} className="bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => toggleGroup(groupName)}>
                                                        <td colSpan={7} className="p-2 px-3">
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
                                                        <tr key={product.id} className={cn("hover:bg-muted/30", isEditing && "bg-primary/5", isSelected && "bg-primary/10", savingInline === product.id && "opacity-60")} onDoubleClick={() => router.push(`/admin/tradein/edit/${product.id}`)}>
                                                            <td className="p-3 align-top">
                                                                <button onClick={(e) => { e.stopPropagation(); toggleSelect(product.id) }} className={cn(
                                                                    "w-4 h-4 border rounded-xs flex items-center justify-center mt-1",
                                                                    isSelected ? "bg-primary border-primary" : ""
                                                                )}>
                                                                    {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                                                                </button>
                                                            </td>
                                                            <td className="p-2">
                                                                <div className="flex items-start gap-3">
                                                                    <div
                                                                        className="w-10 h-10 rounded-xs flex-shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all bg-muted"
                                                                        onClick={(e) => openImageDialog(product, e)}
                                                                    >
                                                                        {product.imgs?.[0] ? (
                                                                            <Image src={product.imgs[0]} alt="" width={40} height={40} className="w-full h-full object-contain" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 space-y-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <Textarea
                                                                                className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-sm font-medium min-h-0 resize-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30 rounded-sm"
                                                                                rows={1}
                                                                                value={getInlineValue(product, 'title')}
                                                                                onChange={(e) => handleInlineChange(product.id, 'title', e.target.value)}
                                                                                onBlur={() => handleInlineBlur(product, 'title')}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                            {product.is_featured && <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                                                            {product.question_template_id && (
                                                                                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); openEditPanel(product) }}>
                                                                                    <FileTextIcon className="w-2.5 h-2.5 mr-0.5" />T
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <Textarea
                                                                            className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-xs text-muted-foreground min-h-0 resize-none rounded-xs focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30"
                                                                            rows={expandedDesIds.has(product.id) ? 3 : 1}
                                                                            placeholder="Description..."
                                                                            value={getInlineValue(product, 'des')}
                                                                            onChange={(e) => handleInlineChange(product.id, 'des', e.target.value)}
                                                                            onBlur={() => { handleInlineBlur(product, 'des'); setExpandedDesIds(prev => { const n = new Set(prev); n.delete(product.id); return n }) }}
                                                                            onFocus={() => { if (!expandedDesIds.has(product.id)) toggleDesExpand(product.id) }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-2 hidden md:table-cell align-top">
                                                                <Badge variant="outline">{product.category}</Badge>
                                                            </td>
                                                            <td className="p-2 text-right align-top">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="w-20 bg-transparent border-0 p-0 px-1 text-sm font-medium text-right rounded-xs focus:ring-1 focus:ring-primary/40 focus:bg-muted/30 outline-none"
                                                                    value={getInlineValue(product, 'base_price')}
                                                                    onChange={(e) => handleInlineChange(product.id, 'base_price', e.target.value)}
                                                                    onBlur={() => handleInlineBlur(product, 'base_price')}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </td>
                                                            <td className="p-2 text-right hidden sm:table-cell align-top">
                                                                <span className="text-green-600 font-medium text-sm">{formatPrice(currentValue)}</span>
                                                            </td>
                                                            <td className="p-2 text-center hidden lg:table-cell align-top">
                                                                {product.base_date ? (
                                                                    <span className={cn("text-xs", (() => {
                                                                        const days = Math.floor((Date.now() - new Date(product.base_date).getTime()) / 86400000)
                                                                        return days > 30 ? "text-red-500" : days > 14 ? "text-yellow-500" : "text-muted-foreground"
                                                                    })())}>
                                                                        {(() => {
                                                                            const days = Math.floor((Date.now() - new Date(product.base_date).getTime()) / 86400000)
                                                                            if (days === 0) return 'Today'
                                                                            if (days === 1) return '1d ago'
                                                                            if (days < 30) return `${days}d ago`
                                                                            if (days < 365) return `${Math.floor(days / 30)}mo ago`
                                                                            return `${Math.floor(days / 365)}y ago`
                                                                        })()}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground/40">—</span>
                                                                )}
                                                            </td>
                                                            <td className="p-2 align-top">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    {savingInline === product.id && <LoaderIcon className="w-3 h-3 animate-spin text-muted-foreground" />}
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditPanel(product)}>
                                                                        <EditIcon className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                                <MoreHorizontalIcon className="w-3.5 h-3.5" />
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
                                                    <Card key={product.id} className={cn("group hover:shadow-md transition-all", isEditing && "ring-2 ring-primary", isSelected && "bg-primary/5", savingInline === product.id && "opacity-60")}>
                                                        <CardContent className="p-4">
                                                            <div className="flex gap-3">
                                                                {/* Checkbox */}
                                                                <button
                                                                    onClick={() => toggleSelect(product.id)}
                                                                    className={cn(
                                                                        "w-5 h-5 border rounded-xs flex-shrink-0 flex items-center justify-center mt-1",
                                                                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                                    )}
                                                                >
                                                                    {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                                                                </button>

                                                                {/* Image */}
                                                                <div
                                                                    className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                                                    onClick={() => openImageDialog(product)}
                                                                >
                                                                    {product.imgs?.[0] ? (
                                                                        <Image src={product.imgs[0]} alt={product.title} width={64} height={64} className="w-full h-full object-contain" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Info - inline editable */}
                                                                <div className="flex-1 min-w-0 space-y-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <Textarea
                                                                            className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-sm font-semibold min-h-0 resize-none rounded-xs focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30"
                                                                            rows={1}
                                                                            value={getInlineValue(product, 'title')}
                                                                            onChange={(e) => handleInlineChange(product.id, 'title', e.target.value)}
                                                                            onBlur={() => handleInlineBlur(product, 'title')}
                                                                        />
                                                                        {product.is_featured && <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground px-1">{product.brand} · {product.series}</p>
                                                                    <Textarea
                                                                        className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-xs text-muted-foreground min-h-0 resize-none rounded-xs focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30"
                                                                        rows={expandedDesIds.has(product.id) ? 3 : 1}
                                                                        placeholder="Description..."
                                                                        value={getInlineValue(product, 'des')}
                                                                        onChange={(e) => handleInlineChange(product.id, 'des', e.target.value)}
                                                                        onBlur={() => { handleInlineBlur(product, 'des'); setExpandedDesIds(prev => { const n = new Set(prev); n.delete(product.id); return n }) }}
                                                                        onFocus={() => { if (!expandedDesIds.has(product.id)) toggleDesExpand(product.id) }}
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-muted-foreground">$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="w-20 bg-transparent border-0 p-0 px-1 text-sm font-semibold resize-none rounded-xs focus:ring-1 focus:ring-primary/40 focus:bg-muted/30 outline-none"
                                                                            value={getInlineValue(product, 'base_price')}
                                                                            onChange={(e) => handleInlineChange(product.id, 'base_price', e.target.value)}
                                                                            onBlur={() => handleInlineBlur(product, 'base_price')}
                                                                        />
                                                                        <span className="text-muted-foreground">→</span>
                                                                        <span className="font-semibold text-green-600 text-sm">{formatPrice(currentValue)}</span>
                                                                        {depRate > 0 && (
                                                                            <Badge variant="secondary" className="text-xs">-{depRate}%</Badge>
                                                                        )}
                                                                        {product.base_date && (
                                                                            <span className={cn("text-[10px]", (() => {
                                                                                const days = Math.floor((Date.now() - new Date(product.base_date).getTime()) / 86400000)
                                                                                return days > 30 ? "text-red-500" : days > 14 ? "text-yellow-500" : "text-muted-foreground"
                                                                            })())}>
                                                                                {(() => {
                                                                                    const days = Math.floor((Date.now() - new Date(product.base_date).getTime()) / 86400000)
                                                                                    if (days === 0) return 'Today'
                                                                                    if (days === 1) return '1d ago'
                                                                                    if (days < 30) return `${days}d ago`
                                                                                    if (days < 365) return `${Math.floor(days / 30)}mo ago`
                                                                                    return `${Math.floor(days / 365)}y ago`
                                                                                })()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Template badge */}
                                                                    {product.question_template_id ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50"
                                                                            onClick={() => openEditPanel(product)}
                                                                        >
                                                                            <FileTextIcon className="w-2.5 h-2.5 mr-0.5" />Template
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] h-4 px-1 text-muted-foreground/50 cursor-pointer hover:text-muted-foreground hover:border-muted-foreground/50"
                                                                            onClick={() => openEditPanel(product)}
                                                                        >
                                                                            <PlusIcon className="w-2.5 h-2.5 mr-0.5" />Template
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                                    {savingInline === product.id && <LoaderIcon className="w-3 h-3 animate-spin text-muted-foreground" />}
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                                <MoreHorizontalIcon className="w-4 h-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => openEditPanel(product)}>
                                                                                <EditIcon className="w-4 h-4 mr-2" />{t('edit') || 'Edit'}
                                                                            </DropdownMenuItem>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <span className="text-sm text-muted-foreground">
                                {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredProducts.length)} of {filteredProducts.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}>
                                    <ChevronLeftIcon className="w-4 h-4" /><ChevronLeftIcon className="w-4 h-4 -ml-2.5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </Button>
                                <span className="px-3 text-sm font-medium">{currentPage} / {totalPages}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
                                    <ChevronRightIcon className="w-4 h-4" /><ChevronRightIcon className="w-4 h-4 -ml-2.5" />
                                </Button>
                            </div>
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
                                    <Textarea
                                        id="edit-title"
                                        className="min-h-[60px] resize-none"
                                        value={editFormData.title}
                                        onChange={(e) => handleEditInputChange('title', e.target.value)}
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-des">Description</Label>
                                    <Textarea
                                        id="edit-des"
                                        className="min-h-[80px] resize-none"
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
                                        <BrandSelect value={editFormData.brand} onChange={(val) => handleEditInputChange('brand', val)} className="h-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-series">Series *</Label>
                                        <Input id="edit-series" value={editFormData.series} onChange={(e) => handleEditInputChange('series', e.target.value)} className="h-9" />
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
                                    {editFormData.question_template_id && (
                                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 rounded-md px-2 py-1.5">
                                            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                <FileTextIcon className="w-3 h-3" />
                                                {t('linkedToTemplate')}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    handleEditInputChange('question_template_id', null)
                                                    toast.info('Template unlinked (questions kept)')
                                                }}
                                            >
                                                {t('unlinkTemplate')}
                                            </Button>
                                        </div>
                                    )}
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
                                                <div key={qIndex} className="border rounded-xs p-2 bg-background space-y-2 text-sm">
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
                                    {editFormData.imgs?.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {editFormData.imgs.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative w-16 h-16 rounded-xs border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                                    onClick={() => {
                                                        setImageDialogProduct(editingProduct)
                                                        setImageDialogImages(editFormData.imgs)
                                                    }}
                                                >
                                                    <Image
                                                        src={normalizeImageUrl(img)}
                                                        alt=""
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

            {/* Image Dialog */}
            <Dialog open={!!imageDialogProduct} onOpenChange={(open) => { if (!open) setImageDialogProduct(null) }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Product Images — {imageDialogProduct?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {imageDialogImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {imageDialogImages.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg border bg-muted overflow-hidden group">
                                        <Image
                                            src={normalizeImageUrl(img)}
                                            alt=""
                                            fill
                                            className="object-contain p-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImgs = imageDialogImages.filter((_, i) => i !== idx)
                                                setImageDialogImages(newImgs)
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No images
                            </div>
                        )}
                        <ImageUpload
                            value={imageDialogImages}
                            onChange={(urls) => setImageDialogImages(urls)}
                            multiple={true}
                            folder="tradein/products"
                            label="Upload Images"
                            onDelete={deleteFileFromBucket}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setImageDialogProduct(null)}>Cancel</Button>
                            <Button onClick={handleImageDialogSave} disabled={savingImages}>
                                {savingImages ? (
                                    <>
                                        <LoaderIcon className="w-4 h-4 animate-spin mr-1" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="w-4 h-4 mr-1" />
                                        Save Images
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Apply Template Dialog */}
            <Dialog open={showBulkTemplateDialog} onOpenChange={setShowBulkTemplateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Apply Template to {selectedIds.size} Product{selectedIds.size !== 1 ? 's' : ''}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto py-2">
                        {loadingTemplates ? (
                            <div className="flex items-center justify-center py-8">
                                <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : templates.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4 text-sm">No templates with questions found.</p>
                        ) : (
                            templates.map((tmpl) => (
                                <button
                                    key={tmpl.id}
                                    className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
                                    onClick={() => handleBulkApplyTemplate(tmpl.id)}
                                    disabled={applyingTemplate}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{tmpl.name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {tmpl.questions?.length || 0} questions
                                        </Badge>
                                    </div>
                                    {tmpl.questions?.length > 0 && (
                                        <div className="mt-1 text-xs text-muted-foreground truncate">
                                            {tmpl.questions.slice(0, 2).map(q => q.title).join(', ')}
                                            {tmpl.questions.length > 2 && ` +${tmpl.questions.length - 2} more`}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
