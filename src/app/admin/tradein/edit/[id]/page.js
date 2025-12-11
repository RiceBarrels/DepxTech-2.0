"use client"

import { useParams, usePathname } from "next/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, SaveIcon, LoaderIcon, XIcon, EditIcon, ArrowRightLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PictureInPictureIcon } from "lucide-react"
import { openWindow } from "@/components/ui/windows"
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"

export default function EditTradeinProductPage() {
    const { id } = useParams()
    const router = useTransitionRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [product, setProduct] = useState(null)
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        des: '',
        new_price: '',
        good_price: '',
        okay_price: '',
        bad_price: '',
        broken_price: '',
        category: '',
        brand: '',
        series: '',
        brand_img: '',
        imgs: [],
        new_def: '',
        good_def: '',
        okay_def: '',
        bad_def: '',
        broken_def: ''
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
                    new_price: foundProduct.new_price?.toString() || '',
                    good_price: foundProduct.good_price?.toString() || '',
                    okay_price: foundProduct.okay_price?.toString() || '',
                    bad_price: foundProduct.bad_price?.toString() || '',
                    broken_price: foundProduct.broken_price?.toString() || '',
                    category: foundProduct.category || '',
                    brand: foundProduct.brand || '',
                    series: foundProduct.series || '',
                    brand_img: foundProduct.brand_img || '',
                    imgs: foundProduct.imgs || [],
                    new_def: foundProduct.new_def || '',
                    good_def: foundProduct.good_def || '',
                    okay_def: foundProduct.okay_def || '',
                    bad_def: foundProduct.bad_def || '',
                    broken_def: foundProduct.broken_def || ''
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
                    new_price: parseFloat(formData.new_price) || 0,
                    good_price: parseFloat(formData.good_price) || 0,
                    okay_price: parseFloat(formData.okay_price) || 0,
                    bad_price: parseFloat(formData.bad_price) || 0,
                    broken_price: parseFloat(formData.broken_price) || 0,
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update tradable product')
            }

            setSuccess(true)
            setProduct(data.product)
            
            setTimeout(() => {
                setSuccess(false)
            }, 3000)
        } catch (err) {
            setError(err.message)
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
                            <label className="text-sm font-medium">Product Title *</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter product title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                className="w-full min-h-[120px] px-3 py-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.des}
                                onChange={(e) => handleInputChange('des', e.target.value)}
                                placeholder="Enter product description"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category *</label>
                            <Input
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                placeholder="e.g., Smartphones, Laptops, Tablets"
                                required
                            />
                        </div>

                        {/* Brand */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Brand *</label>
                            <Input
                                value={formData.brand}
                                onChange={(e) => handleInputChange('brand', e.target.value)}
                                placeholder="e.g., Apple, Samsung, Dell"
                                required
                            />
                        </div>

                        {/* Series */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Series *</label>
                            <Input
                                value={formData.series}
                                onChange={(e) => handleInputChange('series', e.target.value)}
                                placeholder="e.g., iPhone, Galaxy, XPS"
                                required
                            />
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

                        {/* Trade-in Prices */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Trade-in Prices by Condition *</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-green-700">New Condition ($) *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.new_price}
                                        onChange={(e) => handleInputChange('new_price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="border-green-200 focus:border-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700">Good Condition ($) *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.good_price}
                                        onChange={(e) => handleInputChange('good_price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="border-blue-200 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-yellow-700">Okay Condition ($) *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.okay_price}
                                        onChange={(e) => handleInputChange('okay_price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="border-yellow-200 focus:border-yellow-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-orange-700">Bad Condition ($) *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.bad_price}
                                        onChange={(e) => handleInputChange('bad_price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="border-orange-200 focus:border-orange-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-red-700">Broken Condition ($) *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.broken_price}
                                        onChange={(e) => handleInputChange('broken_price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="border-red-200 focus:border-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Condition Definitions */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Condition Definitions *</label>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-green-700">New Definition *</label>
                                    <textarea
                                        className="w-full min-h-[80px] px-3 py-2 border border-green-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={formData.new_def}
                                        onChange={(e) => handleInputChange('new_def', e.target.value)}
                                        placeholder="Define what constitutes 'new' condition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700">Good Definition *</label>
                                    <textarea
                                        className="w-full min-h-[80px] px-3 py-2 border border-blue-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.good_def}
                                        onChange={(e) => handleInputChange('good_def', e.target.value)}
                                        placeholder="Define what constitutes 'good' condition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-yellow-700">Okay Definition *</label>
                                    <textarea
                                        className="w-full min-h-[80px] px-3 py-2 border border-yellow-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={formData.okay_def}
                                        onChange={(e) => handleInputChange('okay_def', e.target.value)}
                                        placeholder="Define what constitutes 'okay' condition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-orange-700">Bad Definition *</label>
                                    <textarea
                                        className="w-full min-h-[80px] px-3 py-2 border border-orange-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={formData.bad_def}
                                        onChange={(e) => handleInputChange('bad_def', e.target.value)}
                                        placeholder="Define what constitutes 'bad' condition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 lg:col-span-2">
                                    <label className="text-sm font-medium text-red-700">Broken Definition *</label>
                                    <textarea
                                        className="w-full min-h-[80px] px-3 py-2 border border-red-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                                        value={formData.broken_def}
                                        onChange={(e) => handleInputChange('broken_def', e.target.value)}
                                        placeholder="Define what constitutes 'broken' condition"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Stats (Read-only) */}
                        {product && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Statistics</label>
                                <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Views</div>
                                        <div className="text-lg font-semibold">{product.views}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Trades</div>
                                        <div className="text-lg font-semibold">{product.trades}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Likes</div>
                                        <div className="text-lg font-semibold">{product.likes}</div>
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