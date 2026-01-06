"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerOverlay,
  } from "@/components/ui/drawer"
import { useState, useEffect, useCallback, useRef } from 'react'
import { EditIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { ImageIcon } from 'lucide-react'
import { PictureInPictureIcon } from 'lucide-react'
import { openWindow } from '@/components/ui/windows'
import { Package2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ProductPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [openProductDrawer, setOpenProductDrawer] = useState(false)
    const [viewingProduct, setViewingProduct] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    })
    const router = useTransitionRouter()
    const [exporting, setExporting] = useState(false)
    const [importing, setImporting] = useState(false)
    const fileInputRef = useRef(null)

    const handleExport = async () => {
        try {
            setExporting(true)
            const response = await fetch('/api/admin/products/export')
            
            if (!response.ok) {
                throw new Error('Failed to export products')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            toast.success('Products exported successfully!')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export products: ' + error.message)
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

            const response = await fetch('/api/admin/products/import', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to import products')
            }

            toast.success(`Successfully imported ${data.imported} products${data.failed > 0 ? `, ${data.failed} failed` : ''}`)
            
            // Refresh products list
            fetchProducts(currentPage, appliedSearchTerm)
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Import error:', error)
            toast.error('Failed to import products: ' + error.message)
        } finally {
            setImporting(false)
        }
    }

    const fetchProducts = useCallback(async (page = 1, search = '', limit = 10) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search
            })
            
            const response = await fetch(`/api/products?${params}`)
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch products')
            }
            
            setProducts(data.products || [])
            setPagination(data.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const [appliedSearchTerm, setAppliedSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts(currentPage, appliedSearchTerm)
    }, [fetchProducts, currentPage, appliedSearchTerm])

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        setAppliedSearchTerm(searchTerm)
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        fetchProducts(newPage, appliedSearchTerm)
    }

    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value)
        if (e.target.value === '') {
            setCurrentPage(1)
            setAppliedSearchTerm('')
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold">Manage Products</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Products</CardTitle>
                    <CardDescription>Manage your products</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/products/add')}>
                            <PlusIcon className="w-4 h-4 mr-2" /> Add Product
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            <DownloadIcon className="w-4 h-4 mr-2" /> 
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                        >
                            <UploadIcon className="w-4 h-4 mr-2" /> 
                            {importing ? 'Importing...' : 'Import CSV'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        {/* Search and Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Search & Filter</CardTitle>
                                <CardDescription>Find products quickly</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search products by name..."
                                            value={searchTerm}
                                            onChange={handleSearchInputChange}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button type="submit" variant="outline">
                                        <SearchIcon className="w-4 h-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>All Products</CardTitle>
                                    <CardDescription>
                                        {pagination.totalItems > 0 ? (
                                            <>Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems} products</>
                                        ) : (
                                            'All products in the database'
                                        )}
                                    </CardDescription>
                                </div>
                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={!pagination.hasPrevPage || loading}
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={!pagination.hasNextPage || loading}
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading && (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="text-sm text-muted-foreground">Loading products...</div>
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="text-sm text-red-600">Error: {error}</div>
                                    </div>
                                )}
                                
                                {!loading && !error && products.length === 0 && (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="text-sm text-muted-foreground">
                                            {appliedSearchTerm ? `No products found matching "${appliedSearchTerm}"` : 'No products found'}
                                        </div>
                                    </div>
                                )}
                                
                                {!loading && !error && products.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Image</TableHead>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Views</TableHead>
                                                <TableHead>Created At</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id} className="cursor-pointer" onClick={() => {
                                                    setViewingProduct(
                                                        <div className="flex flex-col gap-6 h-full w-full p-6">
                                                            {/* Product Image Section */}
                                                            <div className="flex justify-center">
                                                                {product.imgs && product.imgs[0] ? (
                                                                    <div className="relative">
                                                                        <Image 
                                                                            src={product.imgs[0]} 
                                                                            alt={product.title} 
                                                                            width={200} 
                                                                            height={200} 
                                                                            className="rounded-lg shadow-md object-cover"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-md">
                                                                        <div className="text-center">
                                                                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                                            <p className="text-sm text-gray-500">No image available</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                            
                                                            {/* Product Details Grid */}
                                                            <div className="grid grid-cols-1 gap-4">
                                                                {/* Product Title */}
                                                                <div className="text-center border-b pb-4">
                                                                    <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
                                                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-muted-foreground">
                                                                        ID: {product.id}
                                                                    </div>
                                                                </div>
                            
                                                                {/* Price and Category Row */}
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className=" p-4 rounded-lg border border-gray-200">
                                                                        <div className="text-sm font-medium text-muted-foreground mb-1">Price</div>
                                                                        <div className="text-2xl font-bold text-foreground">${product.price}</div>
                                                                    </div>
                                                                    <div className=" p-4 rounded-lg border border-gray-200">
                                                                        <div className="text-sm font-medium text-muted-foreground mb-1">Category</div>
                                                                        <div className="text-lg font-semibold text-foreground capitalize flex flex-wrap gap-2">{product.category.map((category) => (<Badge key={category}>{category}</Badge>))}</div>
                                                                    </div>
                                                                </div>
                            
                                                                {/* Stock and Views Row */}
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className=" p-4 rounded-lg border border-gray-200">
                                                                        <div className="text-sm font-medium text-muted-foreground mb-1">Stock</div>
                                                                        <div className={cn("text-lg font-semibold",
                                                                            product.stocks === 0 ? "text-red-600" : 
                                                                            product.stocks < 5 ? "text-orange-600" : 
                                                                            "text-foreground"
                                                                        )}>{product.stocks} units</div>
                                                                    </div>
                                                                    <div className=" p-4 rounded-lg border border-gray-200">
                                                                        <div className="text-sm font-medium text-muted-foreground mb-1">Views</div>
                                                                        <div className="text-lg font-semibold text-foreground">{product.views}</div>
                                                                    </div>
                                                                </div>
                            
                                                                {/* Description Section */}
                                                                <div className=" p-4 rounded-lg border border-gray-200">
                                                                    <div className="text-sm font-medium text-muted-foreground mb-2">Description</div>
                                                                    <p className="text-gray-800 leading-relaxed">{product.des || 'No description available'}</p>
                                                                </div>
                            
                                                                {/* Created Date */}
                                                                <div className="text-center pt-2 border-t">
                                                                    <div className="text-xs text-gray-500">
                                                                        Created on {new Date(product.created_at).toLocaleDateString('en-US', { 
                                                                            year: 'numeric', 
                                                                            month: 'long', 
                                                                            day: 'numeric' 
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                    setOpenProductDrawer(true)
                                                }}>
                                                    <TableCell>
                                                        {product.imgs && product.imgs[0] ? (
                                                            <Image src={product.imgs[0]} alt={product.title} width={24} height={24} className="rounded-md" />
                                                        ) : (
                                                            <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                                                <ImageIcon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium max-w-20 truncate">{product.id}</TableCell>
                                                    <TableCell className="max-w-20 truncate">{product.title}</TableCell>
                                                    <TableCell className="max-w-20 truncate">{product.des}</TableCell>
                                                    <TableCell className="max-w-20 truncate">${product.price}</TableCell>
                                                    <TableCell className="max-w-20 truncate">{product.category}</TableCell>
                                                    <TableCell className={cn("max-w-20 truncate", product.stocks === 0 ? "text-red-500" : product.stocks < 5 ? "text-yellow-500" : "text-green-500")}>{product.stocks}</TableCell>
                                                    <TableCell className="max-w-20 truncate">{product.views}</TableCell>
                                                    <TableCell className="max-w-20 truncate">{new Date(product.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="max-w-20 truncate flex justify-center">
                                                        <Button variant="outline" size="sm" className="cursor-pointer" onClick={(e) => {
                                                                e.stopPropagation()
                                                                router.push(`/admin/products/edit/${product.id}`)
                                                            }}>
                                                            <EditIcon className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {/* Pagination Controls at Bottom */}
                                {!loading && !error && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems} results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(1)}
                                                disabled={pagination.currentPage === 1}
                                            >
                                                First
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={!pagination.hasPrevPage}
                                            >
                                                <ChevronLeftIcon className="w-4 h-4" />
                                                Previous
                                            </Button>
                                            <span className="text-sm text-muted-foreground px-2">
                                                Page {pagination.currentPage} of {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={!pagination.hasNextPage}
                                            >
                                                Next
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.totalPages)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                            >
                                                Last
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>  
            </Card>
            {/* make the overlay able to click through */}
            <Drawer open={openProductDrawer} onOpenChange={setOpenProductDrawer} direction="bottom" modal={!(typeof window !== 'undefined' && window.innerWidth > 768)}>
                <DrawerContent className="max-w-xl flex flex-col">
                    <DrawerHeader moreButton={
                        <Button variant="ghost" size="icon" onClick={() => {
                            setOpenProductDrawer(false)
                            openWindow('Product Details - Admin', viewingProduct, {icon: <Package2Icon className="w-4 h-4" />})
                        }}>
                            <PictureInPictureIcon className="w-4 h-4" />
                        </Button>
                    }>
                        <DrawerTitle>{viewingProduct?.title}</DrawerTitle>
                        <DrawerDescription>Details</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
                        {viewingProduct}
                    </div>
                    <DrawerFooter>
                        <Button variant="outline" onClick={() => setOpenProductDrawer(false)}>Close</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    )
}