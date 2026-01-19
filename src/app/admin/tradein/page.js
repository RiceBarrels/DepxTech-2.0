"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeftIcon,
    EditIcon,
    TrashIcon,
    PlusIcon,
    SearchIcon,
    ArrowRightLeftIcon,
    DownloadIcon,
    UploadIcon,
    CalendarIcon,
    TrendingDownIcon,
    HelpCircleIcon,
    PackageIcon,
    StarIcon,
    SettingsIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
    const [activeTab, setActiveTab] = useState('products')
    const fileInputRef = useRef(null)

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

    // Filter products based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredProducts(products)
        } else {
            const filtered = products.filter(product =>
                product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.des?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.series?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredProducts(filtered)
        }
    }, [searchTerm, products])

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

            toast.success('Tradable products exported successfully!')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export tradable products: ' + error.message)
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
                throw new Error(data.error || 'Failed to import tradable products')
            }

            toast.success(`Successfully imported ${data.imported} products${data.failed > 0 ? `, ${data.failed} failed` : ''}`)

            // Refresh products list
            const fetchResponse = await fetch('/api/admin/tradein')
            const fetchData = await fetchResponse.json()
            if (fetchResponse.ok) {
                setProducts(fetchData.products || [])
                setFilteredProducts(fetchData.products || [])
            }

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Import error:', error)
            toast.error('Failed to import tradable products: ' + error.message)
        } finally {
            setImporting(false)
        }
    }

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this tradable product?')) {
            return
        }

        setDeleting(productId)
        try {
            const response = await fetch(`/api/admin/tradein?id=${productId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete product')
            }

            // Remove the deleted product from state
            setProducts(prev => prev.filter(p => p.id !== productId))
            setFilteredProducts(prev => prev.filter(p => p.id !== productId))
            toast.success('Product deleted successfully')
        } catch (err) {
            toast.error('Error deleting product: ' + err.message)
        } finally {
            setDeleting(null)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    // Calculate depreciated price based on release date
    const getDepreciatedInfo = (product) => {
        if (!product.release_date) {
            return { multiplier: 100, label: 'No release date' }
        }
        const release = new Date(product.release_date)
        const now = new Date()
        const monthsOld = Math.floor((now - release) / (1000 * 60 * 60 * 24 * 30))

        if (monthsOld < 6) return { multiplier: 100, label: '0-6 months' }
        if (monthsOld < 12) return { multiplier: 90, label: '6-12 months' }
        if (monthsOld < 24) return { multiplier: 80, label: '1-2 years' }
        if (monthsOld < 36) return { multiplier: 65, label: '2-3 years' }
        return { multiplier: 45, label: '3+ years' }
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Manage Trade-in Products</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            Loading tradable products...
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Manage Trade-in Products</h1>
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Manage Trade-in Products</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                    >
                        <UploadIcon className="w-4 h-4 mr-2" />
                        {importing ? 'Importing...' : 'Import CSV'}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/admin/tradein/settings')}>
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    <Button onClick={() => router.push('/admin/tradein/add')} className="bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="w-4 h-4 mr-2" />
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

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b pb-2">
                <Button
                    variant={activeTab === 'products' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('products')}
                >
                    <ArrowRightLeftIcon className="w-4 h-4 mr-2" />
                    Products ({products.length})
                </Button>
                <Button
                    variant={activeTab === 'questions' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('questions')}
                >
                    <HelpCircleIcon className="w-4 h-4 mr-2" />
                    Questions
                </Button>
                <Button
                    variant={activeTab === 'accessories' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('accessories')}
                >
                    <PackageIcon className="w-4 h-4 mr-2" />
                    Accessories
                </Button>
                <Button
                    variant={activeTab === 'depreciation' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('depreciation')}
                >
                    <TrendingDownIcon className="w-4 h-4 mr-2" />
                    Depreciation
                </Button>
            </div>

            {activeTab === 'products' && (
                <>
                    {/* Search and Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Search Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by title, brand, series, category..."
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Total Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{products.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Filtered Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filteredProducts.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products List */}
                    <div className="grid gap-4">
                        {filteredProducts.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center text-muted-foreground">
                                        {searchTerm ? 'No products found matching your search.' : 'No tradable products found. Add your first product to get started.'}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredProducts.map((product) => {
                                const depreciationInfo = getDepreciatedInfo(product)
                                const basePrice = Number(product.base_price) || 0
                                const depreciatedPrice = basePrice * (depreciationInfo.multiplier / 100)

                                return (
                                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <ArrowRightLeftIcon className="w-5 h-5" />
                                                        {product.title}
                                                        {product.is_featured && (
                                                            <Badge className="bg-yellow-500">
                                                                <StarIcon className="w-3 h-3 mr-1" />
                                                                Featured
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <span>{product.brand}</span>
                                                        <span>•</span>
                                                        <span>{product.series}</span>
                                                        <span>•</span>
                                                        <Badge variant="outline">{product.category}</Badge>
                                                    </CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/admin/tradein/edit/${product.id}`)}
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id)}
                                                        disabled={deleting === product.id}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        {deleting === product.id ? (
                                                            <div className="w-4 h-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full" />
                                                        ) : (
                                                            <TrashIcon className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Pricing Info */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                                                        <div className="text-xs text-green-700 dark:text-green-400 font-medium">Base Price</div>
                                                        <div className="text-lg font-bold text-green-600">{formatPrice(basePrice)}</div>
                                                    </div>
                                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                                                        <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">Current Value</div>
                                                        <div className="text-lg font-bold text-blue-600">{formatPrice(depreciatedPrice)}</div>
                                                        <div className="text-xs text-blue-500">{depreciationInfo.multiplier}% of base</div>
                                                    </div>
                                                    <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
                                                        <div className="text-xs text-purple-700 dark:text-purple-400 font-medium flex items-center gap-1">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            Release Date
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            {product.release_date
                                                                ? new Date(product.release_date).toLocaleDateString()
                                                                : 'Not set'}
                                                        </div>
                                                        <div className="text-xs text-purple-500">{depreciationInfo.label}</div>
                                                    </div>
                                                    <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg">
                                                        <div className="text-xs text-orange-700 dark:text-orange-400 font-medium flex items-center gap-1">
                                                            <TrendingDownIcon className="w-3 h-3" />
                                                            Schedule
                                                        </div>
                                                        <div className="text-sm font-medium capitalize">
                                                            {product.depreciation_schedule || 'standard'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <span>Views: {product.views || 0}</span>
                                                    <span>Trades: {product.trades || 0}</span>
                                                    <span>Likes: {product.likes || 0}</span>
                                                    <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </>
            )}

            {activeTab === 'questions' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircleIcon className="w-5 h-5" />
                            Trade-in Questions
                        </CardTitle>
                        <CardDescription>
                            Manage the questionnaire questions used to evaluate device condition
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <HelpCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="mb-4">Questions are managed in the database.</p>
                            <p className="text-sm">
                                Tables: <code className="bg-muted px-2 py-1 rounded">trade_questions</code> and <code className="bg-muted px-2 py-1 rounded">trade_question_options</code>
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.push('/admin/tradein/questions')}
                            >
                                Manage Questions
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'accessories' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PackageIcon className="w-5 h-5" />
                            Trade-in Accessories
                        </CardTitle>
                        <CardDescription>
                            Manage accessories that add bonus value to trade-ins
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <PackageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="mb-4">Accessories are managed in the database.</p>
                            <p className="text-sm">
                                Table: <code className="bg-muted px-2 py-1 rounded">trade_accessories</code>
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.push('/admin/tradein/accessories')}
                            >
                                Manage Accessories
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'depreciation' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDownIcon className="w-5 h-5" />
                            Depreciation Schedules
                        </CardTitle>
                        <CardDescription>
                            Manage how product values decrease over time based on age
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <TrendingDownIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="mb-4">Depreciation schedules are managed in the database.</p>
                            <p className="text-sm">
                                Tables: <code className="bg-muted px-2 py-1 rounded">trade_depreciation_schedules</code> and <code className="bg-muted px-2 py-1 rounded">trade_depreciation_tiers</code>
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.push('/admin/tradein/depreciation')}
                            >
                                Manage Schedules
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
