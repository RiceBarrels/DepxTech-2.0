"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    SettingsIcon,
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
    MoreHorizontalIcon
} from 'lucide-react'
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

export default function TradeinManagePage() {
    const router = useTransitionRouter()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredProducts, setFilteredProducts] = useState([])
    const [deleting, setDeleting] = useState(null)
    const [exporting, setExporting] = useState(false)
    const [importing, setImporting] = useState(false)
    const fileInputRef = useRef(null)

    // View and filter state
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [brandFilter, setBrandFilter] = useState('all')
    const [sortBy, setSortBy] = useState('created_desc')
    const [groupBy, setGroupBy] = useState('none') // 'none', 'category', 'brand', 'series'
    const [expandedGroups, setExpandedGroups] = useState({})

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

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter)
        }

        // Apply brand filter
        if (brandFilter !== 'all') {
            filtered = filtered.filter(p => p.brand === brandFilter)
        }

        // Apply search filter
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

        // Apply sorting
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

            // Refresh products list
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
            toast.success('Product deleted')
        } catch (err) {
            toast.error('Error: ' + err.message)
        } finally {
            setDeleting(null)
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

    // Calculate current value based on depreciation rate
    const getCurrentValue = (product) => {
        const basePrice = Number(product.base_price) || 0
        const depRate = Number(product.depreciation_rate) || 0
        const multiplier = 100 - depRate
        return basePrice * (multiplier / 100)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setCategoryFilter('all')
        setBrandFilter('all')
        setSortBy('created_desc')
        setGroupBy('none')
    }

    const hasActiveFilters = searchTerm || categoryFilter !== 'all' || brandFilter !== 'all'

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Trade-in Products</h1>
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
                    <h1 className="text-2xl font-bold">Trade-in Products</h1>
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

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Trade-in Products</h1>
                        <p className="text-sm text-muted-foreground">
                            {products.length} products total
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        <DownloadIcon className="w-4 h-4 mr-1.5" />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                    >
                        <UploadIcon className="w-4 h-4 mr-1.5" />
                        {importing ? 'Importing...' : 'Import'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin/tradein/templates')}
                    >
                        <FileTextIcon className="w-4 h-4 mr-1.5" />
                        Templates
                    </Button>
                    <Button onClick={() => router.push('/admin/tradein/add')} size="sm">
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        Add Product
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="hidden"
                />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-3 p-3 bg-muted/50 rounded-lg border">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="pl-9 h-9"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
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
                            <SelectItem value="all">All Brands</SelectItem>
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
                            <SelectItem value="created_desc">Newest</SelectItem>
                            <SelectItem value="created_asc">Oldest</SelectItem>
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
                            <SelectItem value="none">No Grouping</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="brand">Brand</SelectItem>
                            <SelectItem value="series">Series</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                            Clear
                        </Button>
                    )}

                    <div className="border-l h-6 mx-1" />

                    {/* View Toggle */}
                    <div className="flex border rounded-md">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-9 px-2.5 rounded-r-none"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGridIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-9 px-2.5 rounded-l-none"
                            onClick={() => setViewMode('table')}
                        >
                            <LayoutListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Showing {filteredProducts.length} of {products.length} products
                </span>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                                {hasActiveFilters ? 'No products match your filters.' : 'No products yet.'}
                            </p>
                            {!hasActiveFilters && (
                                <Button className="mt-4" onClick={() => router.push('/admin/tradein/add')}>
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add First Product
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
                                    <th className="text-left p-3 font-medium">Product</th>
                                    <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
                                    <th className="text-left p-3 font-medium hidden lg:table-cell">Brand / Series</th>
                                    <th className="text-right p-3 font-medium">Base Price</th>
                                    <th className="text-right p-3 font-medium hidden sm:table-cell">Current Value</th>
                                    <th className="text-center p-3 font-medium hidden lg:table-cell">Depreciation</th>
                                    <th className="text-center p-3 font-medium w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {Object.entries(groups).map(([groupName, groupProducts]) => (
                                    <>
                                        {groupBy !== 'none' && (
                                            <tr
                                                key={`group-${groupName}`}
                                                className="bg-muted/30 cursor-pointer hover:bg-muted/50"
                                                onClick={() => toggleGroup(groupName)}
                                            >
                                                <td colSpan={7} className="p-2 px-3">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        {expandedGroups[groupName] === false ? (
                                                            <ChevronRightIcon className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDownIcon className="w-4 h-4" />
                                                        )}
                                                        {groupName}
                                                        <Badge variant="secondary" className="ml-2">
                                                            {groupProducts.length}
                                                        </Badge>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {(groupBy === 'none' || expandedGroups[groupName] !== false) && groupProducts.map((product) => {
                                            const currentValue = getCurrentValue(product)
                                            const depRate = Number(product.depreciation_rate) || 0

                                            return (
                                                <tr key={product.id} className="hover:bg-muted/30">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
                                                                {product.imgs?.[0] ? (
                                                                    <Image
                                                                        src={product.imgs[0]}
                                                                        alt=""
                                                                        width={40}
                                                                        height={40}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-medium truncate flex items-center gap-2">
                                                                    {product.title}
                                                                    {product.is_featured && (
                                                                        <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground md:hidden">
                                                                    {product.brand} · {product.category}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 hidden md:table-cell">
                                                        <Badge variant="outline">{product.category}</Badge>
                                                    </td>
                                                    <td className="p-3 hidden lg:table-cell text-muted-foreground">
                                                        {product.brand} / {product.series}
                                                    </td>
                                                    <td className="p-3 text-right font-medium">
                                                        {formatPrice(product.base_price)}
                                                    </td>
                                                    <td className="p-3 text-right hidden sm:table-cell">
                                                        <span className="text-green-600 font-medium">
                                                            {formatPrice(currentValue)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center hidden lg:table-cell">
                                                        {depRate > 0 ? (
                                                            <Badge variant="secondary" className="font-mono">
                                                                -{depRate}%
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => router.push(`/admin/tradein/edit/${product.id}`)}
                                                            >
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
                                                                        <EyeIcon className="w-4 h-4 mr-2" />
                                                                        View Live
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                                                                        <CopyIcon className="w-4 h-4 mr-2" />
                                                                        Duplicate
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => handleDelete(product.id)}
                                                                        disabled={deleting === product.id}
                                                                    >
                                                                        <TrashIcon className="w-4 h-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </>
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
                                <button
                                    className="flex items-center gap-2 mb-3 font-semibold text-lg hover:text-primary transition-colors"
                                    onClick={() => toggleGroup(groupName)}
                                >
                                    {expandedGroups[groupName] === false ? (
                                        <ChevronRightIcon className="w-5 h-5" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5" />
                                    )}
                                    {groupName}
                                    <Badge variant="secondary">{groupProducts.length}</Badge>
                                </button>
                            )}

                            {(groupBy === 'none' || expandedGroups[groupName] !== false) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {groupProducts.map((product) => {
                                        const currentValue = getCurrentValue(product)
                                        const depRate = Number(product.depreciation_rate) || 0

                                        return (
                                            <Card key={product.id} className="group hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex gap-4">
                                                        {/* Image */}
                                                        <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                                            {product.imgs?.[0] ? (
                                                                <Image
                                                                    src={product.imgs[0]}
                                                                    alt={product.title}
                                                                    width={80}
                                                                    height={80}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <h3 className="font-semibold truncate flex items-center gap-2">
                                                                        {product.title}
                                                                        {product.is_featured && (
                                                                            <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                                                        )}
                                                                    </h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {product.brand} · {product.series}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="outline" className="flex-shrink-0">
                                                                    {product.category}
                                                                </Badge>
                                                            </div>

                                                            {/* Pricing */}
                                                            <div className="flex items-center gap-3 mt-3">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Base</p>
                                                                    <p className="font-semibold">{formatPrice(product.base_price)}</p>
                                                                </div>
                                                                <div className="text-muted-foreground">→</div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Current</p>
                                                                    <p className="font-semibold text-green-600">{formatPrice(currentValue)}</p>
                                                                </div>
                                                                {depRate > 0 && (
                                                                    <Badge variant="secondary" className="ml-auto font-mono">
                                                                        <PercentIcon className="w-3 h-3 mr-1" />
                                                                        -{depRate}%
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>{product.questions?.length || 0} questions</span>
                                                            <span>·</span>
                                                            <span>{product.views || 0} views</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => router.push(`/admin/tradein/edit/${product.id}`)}
                                                            >
                                                                <EditIcon className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontalIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => window.open(`/trade/product/${product.id}`, '_blank')}>
                                                                        <EyeIcon className="w-4 h-4 mr-2" />
                                                                        View Live
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                                                                        <CopyIcon className="w-4 h-4 mr-2" />
                                                                        Duplicate
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => handleDelete(product.id)}
                                                                        disabled={deleting === product.id}
                                                                    >
                                                                        <TrashIcon className="w-4 h-4 mr-2" />
                                                                        Delete
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
        </div>
    )
}
