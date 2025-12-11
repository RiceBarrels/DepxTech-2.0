"use client"

import { usePathname } from "next/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, SaveIcon, LoaderIcon, XIcon, PlusIcon } from 'lucide-react'
import { PictureInPictureIcon } from "lucide-react"
import { openWindow } from "@/components/ui/windows"
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"

export default function AddProductPage({defaultData={
    title: '',
    des: '',
    price: '',
    stocks: '',
    category: [],
    imgs: [],
    variant_of_id: '',
    variant_data: [{ variant_type: '', variant_title: '' }],
    views: 0
}}) {
    const router = useTransitionRouter()
    const pathname = usePathname()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    
    // Form state
    const [formData, setFormData] = useState(defaultData)
    
    // Category input state
    const [categoryInput, setCategoryInput] = useState('')

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const addCategory = () => {
        if (categoryInput.trim() && !formData.category.includes(categoryInput.trim())) {
            setFormData(prev => ({
                ...prev,
                category: [...prev.category, categoryInput.trim()]
            }))
            setCategoryInput('')
        }
    }

    const removeCategory = (categoryToRemove) => {
        setFormData(prev => ({
            ...prev,
            category: prev.category.filter(cat => cat !== categoryToRemove)
        }))
    }


    const handleVariantChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            variant_data: prev.variant_data.map((variant, i) => 
                i === index ? { ...variant, [field]: value } : variant
            )
        }))
    }

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variant_data: [...prev.variant_data, { variant_type: '', variant_title: '' }]
        }))
    }

    const removeVariant = (index) => {
        if (formData.variant_data.length > 1) {
            setFormData(prev => ({
                ...prev,
                variant_data: prev.variant_data.filter((_, i) => i !== index)
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            // Upload images first
            const uploadedImageUrls = await uploadFiles(formData.imgs, 'products')
            
            const response = await fetch('/api/admin/products/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    imgs: uploadedImageUrls,
                    price: parseFloat(formData.price) || 0,
                    stocks: parseInt(formData.stocks) || 0,
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create product')
            }

            setSuccess(true)
            // Reset form after successful creation
            setFormData({
                title: '',
                des: '',
                price: '',
                stocks: '',
                category: [],
                imgs: [],
                variant_of_id: '',
                variant_data: [{ variant_type: '', variant_title: '' }],
                views: 0
            })
            setCategoryInput('')
            
            setTimeout(() => {
                setSuccess(false)
            }, 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            {pathname === '/admin/products/add' &&
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Add New Product</h1>
                    <Button variant="outline" size="sm" onClick={() => {
                        openWindow('Add New Product - Admin', <AddProductPage defaultData={formData}/>, {icon: <PlusIcon className="w-4 h-4" />})
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
                            Product created successfully!
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
                        <CardTitle>Product Information</CardTitle>
                        <CardDescription>Enter the details for the new product</CardDescription>
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

                        {/* Price and Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price ($) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock Quantity *</label>
                                <Input
                                    type="number"
                                    value={formData.stocks}
                                    onChange={(e) => handleInputChange('stocks', e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categories</label>
                            <div className="flex gap-2">
                                <Input
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    placeholder="Add category"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                />
                                <Button type="button" onClick={addCategory} variant="outline">
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.category.map((cat, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {cat}
                                        <button
                                            type="button"
                                            onClick={() => removeCategory(cat)}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Images */}
                        <ImageUpload
                            value={formData.imgs}
                            onChange={(urls) => handleInputChange('imgs', urls)}
                            multiple={true}
                            folder="products"
                            label="Product Images"
                            onDelete={deleteFileFromBucket}
                        />

                        {/* Variant Data */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Variants</label>
                            {formData.variant_data.map((variant, index) => (
                                <div key={index} className="flex gap-2 items-center p-3 border rounded">
                                    <Input
                                        value={variant.variant_type}
                                        onChange={(e) => handleVariantChange(index, 'variant_type', e.target.value)}
                                        placeholder="Variant type (e.g., Color, Size)"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={variant.variant_title}
                                        onChange={(e) => handleVariantChange(index, 'variant_title', e.target.value)}
                                        placeholder="Variant title (e.g., Red, Large)"
                                        className="flex-1"
                                    />
                                    {formData.variant_data.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" onClick={addVariant} variant="outline" size="sm">
                                Add Variant
                            </Button>
                        </div>

                        {/* Variant Parent ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Variant Parent ID (Optional)</label>
                            <Input
                                value={formData.variant_of_id}
                                onChange={(e) => handleInputChange('variant_of_id', e.target.value)}
                                placeholder="Parent product ID if this is a variant"
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
                                        Create Product
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