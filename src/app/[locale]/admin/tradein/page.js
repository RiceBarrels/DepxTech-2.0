"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useSearchParams, useRouter as useNextRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowLeftIcon,
    DownloadIcon,
    UploadIcon,
    PlusIcon,
    FileTextIcon,
    LayoutGridIcon,
    PercentIcon,
    ImageIcon,
    PackageIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckIcon,
    MinusIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { uploadFiles } from "@/components/admin/ImageUpload"
import { AICommandPanel } from "@/components/admin/AICommandPanel"

import { ProductTableView } from "@/components/admin/tradein/ProductTableView"
import { ProductGridView } from "@/components/admin/tradein/ProductGridView"
import { ProductEditPanel } from "@/components/admin/tradein/ProductEditPanel"
import { ImageDialog, BulkTemplateDialog } from "@/components/admin/tradein/TradeinDialogs"
import { SelectionBar } from "@/components/admin/tradein/SelectionBar"
import { ProductToolbar } from "@/components/admin/tradein/ProductToolbar"

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
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))
    }

    // Selection handlers
    const toggleSelect = (productId) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) newSet.delete(productId)
            else newSet.add(productId)
            return newSet
        })
    }

    const selectAll = () => {
        if (selectedIds.size === filteredProducts.length) setSelectedIds(new Set())
        else setSelectedIds(new Set(filteredProducts.map(p => p.id)))
    }

    const clearSelection = () => setSelectedIds(new Set())

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
            question_template_id: product.question_template_id || null,
            variant_of: product.variant_of || null
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
        setEditFormData(prev => ({ ...prev, [field]: value }))
    }

    // Fetch other products for copying questions
    const fetchOtherProducts = async () => {
        if (otherProducts.length > 0) { setShowCopySelect(true); return }
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
        } catch { toast.error('Failed to fetch products') }
        finally { setLoadingProducts(false) }
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
        if (templates.length > 0) { setShowTemplateSelect(true); setShowCopySelect(false); return }
        setLoadingTemplates(true)
        try {
            const response = await fetch('/api/admin/tradein/templates')
            const data = await response.json()
            if (data.templates) {
                const templatesWithQuestions = data.templates.filter(tmpl => tmpl.questions && tmpl.questions.length > 0)
                setTemplates(templatesWithQuestions)
                setShowTemplateSelect(true)
                setShowCopySelect(false)
            }
        } catch { toast.error('Failed to fetch templates') }
        finally { setLoadingTemplates(false) }
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
            const uploadedProductImgs = await uploadFiles(editFormData.imgs, 'tradein/products')
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
                    question_template_id: editFormData.question_template_id,
                    variant_of: editFormData.variant_of
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to update product')

            setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p))
            toast.success('Product updated successfully!')

            const selectedArray = Array.from(selectedIds)
            const currentIndex = selectedArray.indexOf(editingProduct.id)
            if (currentIndex < selectedArray.length - 1) {
                const nextProduct = products.find(p => p.id === selectedArray[currentIndex + 1])
                if (nextProduct) { openEditPanel(nextProduct); return }
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
            if (!response.ok) throw new Error('Failed to export tradable products')
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
        if (!file.name.endsWith('.csv')) { toast.error('Please select a CSV file'); return }
        try {
            setImporting(true)
            const formData = new FormData()
            formData.append('file', file)
            const response = await fetch('/api/admin/tradein/import', { method: 'POST', body: formData })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to import')
            toast.success(`Imported ${data.imported} products${data.failed > 0 ? `, ${data.failed} failed` : ''}`)
            const fetchResponse = await fetch('/api/admin/tradein')
            const fetchData = await fetchResponse.json()
            if (fetchResponse.ok) setProducts(fetchData.products || [])
            if (fileInputRef.current) fileInputRef.current.value = ''
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
            const response = await fetch(`/api/admin/tradein?id=${productId}`, { method: 'DELETE' })
            if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Failed to delete') }
            setProducts(prev => prev.filter(p => p.id !== productId))
            setSelectedIds(prev => { const newSet = new Set(prev); newSet.delete(productId); return newSet })
            if (editingProduct?.id === productId) closeEditPanel()
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
        let deleted = 0, failed = 0
        for (const id of idsToDelete) {
            try {
                const response = await fetch(`/api/admin/tradein?id=${id}`, { method: 'DELETE' })
                if (response.ok) deleted++; else failed++
            } catch { failed++ }
        }
        setProducts(prev => prev.filter(p => !selectedIds.has(p.id)))
        setSelectedIds(new Set())
        if (editingProduct && selectedIds.has(editingProduct.id)) closeEditPanel()
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
                try { const data = await response.json(); errMsg = data.error || errMsg } catch {}
                throw new Error(errMsg)
            }
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = '', summary = null, processed = 0
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
                        if (result.done) { summary = result; continue }
                        processed++
                        setPriceProgress({ done: processed, total })
                        if (result.success) {
                            setProducts(prev => prev.map(p => p.id === result.id ? { ...p, base_price: result.ebay_price, base_date: new Date().toISOString().split('T')[0] } : p))
                            toast.success(`${result.title}: $${result.ebay_price}`, { duration: 3000 })
                        } else {
                            toast.warning(`${result.title}: ${result.reason}`, { duration: 4000 })
                        }
                    } catch {}
                }
            }
            if (summary) toast.success(`Done — updated ${summary.updated} of ${summary.updated + summary.failed} products`, { duration: 5000 })
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
                try { const data = await response.json(); errMsg = data.error || errMsg } catch {}
                throw new Error(errMsg)
            }
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = '', summary = null, processed = 0
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
                        if (result.done) { summary = result; continue }
                        processed++
                        setBmPriceProgress({ done: processed, total })
                        if (result.success) {
                            setProducts(prev => prev.map(p => p.id === result.id ? { ...p, base_price: result.bm_price, base_date: new Date().toISOString().split('T')[0] } : p))
                            toast.success(`${result.title}: $${result.bm_price}`, { duration: 3000 })
                        } else {
                            toast.warning(`${result.title}: ${result.reason}`, { duration: 4000 })
                        }
                    } catch {}
                }
            }
            if (summary) toast.success(`Done — updated ${summary.updated} of ${summary.updated + summary.failed} products`, { duration: 5000 })
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
                body: JSON.stringify({ templateId, productIds: Array.from(selectedIds) })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to apply template')
            const refreshResponse = await fetch('/api/admin/tradein')
            const refreshData = await refreshResponse.json()
            if (refreshResponse.ok) setProducts(refreshData.products || [])
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
                    ...product, id: undefined, title: `${product.title} (Copy)`,
                    created_at: undefined, updated_at: undefined, views: 0, trades: 0, likes: 0
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to duplicate')
            setProducts(prev => [data.product, ...prev])
            toast.success('Product duplicated')
        } catch (error) {
            toast.error('Failed to duplicate: ' + error.message)
        }
    }

    // Toggle description expand in grid/table view
    const toggleDesExpand = (productId, e, forceClose) => {
        if (e) e.stopPropagation()
        setExpandedDesIds(prev => {
            const newSet = new Set(prev)
            if (forceClose || newSet.has(productId)) newSet.delete(productId)
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
                body: JSON.stringify({ ...imageDialogProduct, imgs: uploadedImgs })
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

    // Inline editing helpers
    const getInlineValue = (product, field) => {
        if (inlineEdits[product.id]?.[field] !== undefined) return inlineEdits[product.id][field]
        if (field === 'base_price') return product.base_price?.toString() || ''
        return product[field] || ''
    }

    const handleInlineChange = (productId, field, value) => {
        setInlineEdits(prev => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }))
    }

    const handleInlineBlur = async (product, field) => {
        const edits = inlineEdits[product.id]
        if (!edits || edits[field] === undefined) return
        const newValue = edits[field]
        const oldValue = field === 'base_price' ? (product.base_price?.toString() || '') : (product[field] || '')
        if (newValue === oldValue) {
            setInlineEdits(prev => {
                const next = { ...prev }
                if (next[product.id]) { delete next[product.id][field]; if (Object.keys(next[product.id]).length === 0) delete next[product.id] }
                return next
            })
            return
        }
        setSavingInline(product.id)
        try {
            const updateData = {
                id: product.id, title: product.title, des: product.des, category: product.category,
                brand: product.brand, series: product.series, brand_img: product.brand_img, imgs: product.imgs,
                base_price: product.base_price, min_price: product.min_price, base_date: product.base_date,
                depreciation_rate: product.depreciation_rate, is_featured: product.is_featured,
                questions: product.questions, question_template_id: product.question_template_id,
            }
            if (field === 'base_price') updateData.base_price = parseFloat(newValue) || 0
            else updateData[field] = newValue

            const response = await fetch('/api/admin/tradein', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
            if (!response.ok) throw new Error('Failed to save')
            const data = await response.json()
            setProducts(prev => prev.map(p => p.id === product.id ? data.product : p))
            setInlineEdits(prev => { const next = { ...prev }; delete next[product.id]; return next })
        } catch (err) {
            toast.error(`Save failed: ${err.message}`)
        } finally {
            setSavingInline(null)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0)
    }

    const getCurrentValue = (product) => {
        const basePrice = Number(product.base_price) || 0
        const depRate = Number(product.depreciation_rate) || 0
        return basePrice * ((100 - depRate) / 100)
    }

    const clearFilters = () => nextRouter.replace(window.location.pathname, { scroll: false })
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
                        if (response.ok) setProducts(data.products || [])
                    } catch (err) {
                        console.error('Failed to refresh products:', err)
                    }
                }}
            />

            {/* Selection Bar */}
            {selectedIds.size > 0 && (
                <SelectionBar
                    selectedIds={selectedIds}
                    products={products}
                    clearSelection={clearSelection}
                    openEditPanel={openEditPanel}
                    handleBulkDelete={handleBulkDelete}
                    fetchingPrices={fetchingPrices}
                    priceProgress={priceProgress}
                    handleFetchEbayPrices={handleFetchEbayPrices}
                    fetchingBmPrices={fetchingBmPrices}
                    bmPriceProgress={bmPriceProgress}
                    handleFetchBackmarketPrices={handleFetchBackmarketPrices}
                    applyingTemplate={applyingTemplate}
                    fetchTemplates={fetchTemplates}
                    setShowBulkTemplateDialog={setShowBulkTemplateDialog}
                />
            )}

            {/* Toolbar */}
            <ProductToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                brandFilter={brandFilter}
                setBrandFilter={setBrandFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
                viewMode={viewMode}
                handleSetViewMode={handleSetViewMode}
                categories={categories}
                brands={brands}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
            />

            {/* Results info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <button onClick={selectAll} className="flex items-center gap-2 hover:text-foreground transition-colors">
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
                        <ProductTableView
                            groups={groups}
                            groupBy={groupBy}
                            expandedGroups={expandedGroups}
                            toggleGroup={toggleGroup}
                            selectedIds={selectedIds}
                            editingProduct={editingProduct}
                            toggleSelect={toggleSelect}
                            selectAll={selectAll}
                            allSelected={allSelected}
                            someSelected={someSelected}
                            openEditPanel={openEditPanel}
                            openImageDialog={openImageDialog}
                            handleDuplicate={handleDuplicate}
                            handleDelete={handleDelete}
                            deleting={deleting}
                            formatPrice={formatPrice}
                            getCurrentValue={getCurrentValue}
                            getInlineValue={getInlineValue}
                            handleInlineChange={handleInlineChange}
                            handleInlineBlur={handleInlineBlur}
                            savingInline={savingInline}
                            expandedDesIds={expandedDesIds}
                            toggleDesExpand={toggleDesExpand}
                            router={router}
                        />
                    ) : (
                        <ProductGridView
                            groups={groups}
                            groupBy={groupBy}
                            expandedGroups={expandedGroups}
                            toggleGroup={toggleGroup}
                            selectedIds={selectedIds}
                            editingProduct={editingProduct}
                            toggleSelect={toggleSelect}
                            openEditPanel={openEditPanel}
                            openImageDialog={openImageDialog}
                            handleDuplicate={handleDuplicate}
                            handleDelete={handleDelete}
                            deleting={deleting}
                            formatPrice={formatPrice}
                            getCurrentValue={getCurrentValue}
                            getInlineValue={getInlineValue}
                            handleInlineChange={handleInlineChange}
                            handleInlineBlur={handleInlineBlur}
                            savingInline={savingInline}
                            expandedDesIds={expandedDesIds}
                            toggleDesExpand={toggleDesExpand}
                        />
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
                    <ProductEditPanel
                        editingProduct={editingProduct}
                        editFormData={editFormData}
                        handleEditInputChange={handleEditInputChange}
                        handleSaveEdit={handleSaveEdit}
                        closeEditPanel={closeEditPanel}
                        saving={saving}
                        selectedIds={selectedIds}
                        products={products}
                        openEditPanel={openEditPanel}
                        showTemplateSelect={showTemplateSelect}
                        setShowTemplateSelect={setShowTemplateSelect}
                        showCopySelect={showCopySelect}
                        setShowCopySelect={setShowCopySelect}
                        templates={templates}
                        otherProducts={otherProducts}
                        fetchTemplates={fetchTemplates}
                        fetchOtherProducts={fetchOtherProducts}
                        applyTemplate={applyTemplate}
                        copyQuestionsFromProduct={copyQuestionsFromProduct}
                        loadingTemplates={loadingTemplates}
                        loadingProducts={loadingProducts}
                        setImageDialogProduct={setImageDialogProduct}
                        setImageDialogImages={setImageDialogImages}
                    />
                )}
            </div>

            {/* Image Dialog */}
            <ImageDialog
                imageDialogProduct={imageDialogProduct}
                setImageDialogProduct={setImageDialogProduct}
                imageDialogImages={imageDialogImages}
                setImageDialogImages={setImageDialogImages}
                handleImageDialogSave={handleImageDialogSave}
                savingImages={savingImages}
            />

            {/* Bulk Apply Template Dialog */}
            <BulkTemplateDialog
                open={showBulkTemplateDialog}
                onOpenChange={setShowBulkTemplateDialog}
                selectedCount={selectedIds.size}
                templates={templates}
                loadingTemplates={loadingTemplates}
                applyingTemplate={applyingTemplate}
                handleBulkApplyTemplate={handleBulkApplyTemplate}
            />
        </div>
    )
}
