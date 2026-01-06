"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, EditIcon, TrashIcon, PlusIcon, SearchIcon, ArrowRightLeftIcon, DownloadIcon, UploadIcon } from 'lucide-react'
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
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.des?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
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
        } catch (err) {
            alert('Error deleting product: ' + err.message)
        } finally {
            setDeleting(null)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
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
                    <Button onClick={() => router.push('/admin/tradein/add')} className="bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Trade-in Product
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

            {/* Search and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Search Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by title, description, or category..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtered Results</CardTitle>
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
                    filteredProducts.map((product) => (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowRightLeftIcon className="w-5 h-5" />
                                            {product.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {product.des || 'No description provided'}
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
                                    {/* Category */}
                                    {product.category && (
                                        <div>
                                            <p className="text-sm font-medium mb-2">Category:</p>
                                            <Badge variant="secondary">
                                                {product.category}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Pricing Grid */}
                                    <div>
                                        <p className="text-sm font-medium mb-2">Trade-in Prices:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                                            <div className="bg-green-50 p-2 rounded">
                                                <div className="font-medium text-green-800">New</div>
                                                <div className="text-green-600">{formatPrice(product.new_price)}</div>
                                            </div>
                                            <div className="bg-blue-50 p-2 rounded">
                                                <div className="font-medium text-blue-800">Good</div>
                                                <div className="text-blue-600">{formatPrice(product.good_price)}</div>
                                            </div>
                                            <div className="bg-yellow-50 p-2 rounded">
                                                <div className="font-medium text-yellow-800">Okay</div>
                                                <div className="text-yellow-600">{formatPrice(product.okay_price)}</div>
                                            </div>
                                            <div className="bg-orange-50 p-2 rounded">
                                                <div className="font-medium text-orange-800">Bad</div>
                                                <div className="text-orange-600">{formatPrice(product.bad_price)}</div>
                                            </div>
                                            <div className="bg-red-50 p-2 rounded">
                                                <div className="font-medium text-red-800">Broken</div>
                                                <div className="text-red-600">{formatPrice(product.broken_price)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <span>Views: {product.views}</span>
                                        <span>Trades: {product.trades}</span>
                                        <span>Likes: {product.likes}</span>
                                        <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
} 