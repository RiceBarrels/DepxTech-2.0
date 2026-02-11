"use client"

import { useParams } from "next/navigation"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, SaveIcon, LoaderIcon, PlusIcon, TicketPercentIcon, XIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"

export default function EditOfferPage() {
    const { id } = useParams()
    const router = useTransitionRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [offer, setOffer] = useState(null)
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percentage: '',
        discount_amount: '',
        start_date: '',
        end_date: '',
        is_active: true,
        image_url: '',
        code: '',
        min_purchase_amount: '',
        max_discount_amount: '',
        applicable_categories: []
    })
    
    // Category input state
    const [categoryInput, setCategoryInput] = useState('')

    // Fetch offer data
    useEffect(() => {
        async function fetchOffer() {
            try {
                setLoading(true)
                const response = await fetch(`/api/admin/offers?id=${id}`)
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch offer')
                }
                
                const foundOffer = data.offer
                if (!foundOffer) {
                    throw new Error('Offer not found')
                }
                
                setOffer(foundOffer)
                
                // Format dates for datetime-local input
                const formatDateForInput = (dateString) => {
                    if (!dateString) return ''
                    const date = new Date(dateString)
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    const hours = String(date.getHours()).padStart(2, '0')
                    const minutes = String(date.getMinutes()).padStart(2, '0')
                    return `${year}-${month}-${day}T${hours}:${minutes}`
                }
                
                setFormData({
                    title: foundOffer.title || '',
                    description: foundOffer.description || '',
                    discount_percentage: foundOffer.discount_percentage?.toString() || '',
                    discount_amount: foundOffer.discount_amount?.toString() || '',
                    start_date: formatDateForInput(foundOffer.start_date),
                    end_date: formatDateForInput(foundOffer.end_date),
                    is_active: foundOffer.is_active !== undefined ? foundOffer.is_active : true,
                    image_url: foundOffer.image_url || '',
                    code: foundOffer.code || '',
                    min_purchase_amount: foundOffer.min_purchase_amount?.toString() || '',
                    max_discount_amount: foundOffer.max_discount_amount?.toString() || '',
                    applicable_categories: foundOffer.applicable_categories || []
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        
        if (id) {
            fetchOffer()
        }
    }, [id])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const addCategory = () => {
        if (categoryInput.trim() && !formData.applicable_categories.includes(categoryInput.trim())) {
            setFormData(prev => ({
                ...prev,
                applicable_categories: [...prev.applicable_categories, categoryInput.trim()]
            }))
            setCategoryInput('')
        }
    }

    const removeCategory = (categoryToRemove) => {
        setFormData(prev => ({
            ...prev,
            applicable_categories: prev.applicable_categories.filter(cat => cat !== categoryToRemove)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            // Upload image if it's a File object
            const uploadedImageUrl = formData.image_url instanceof File 
                ? (await uploadFiles(formData.image_url, 'offers'))[0]
                : formData.image_url

            // Prepare data for submission
            const submitData = {
                id: id,
                ...formData,
                discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : undefined,
                discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : undefined,
                min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : undefined,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                image_url: uploadedImageUrl || null,
                code: formData.code || null
            }

            const response = await fetch('/api/admin/offers', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update offer')
            }

            setSuccess(true)
            setOffer(data.offer)
            
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
                    <h1 className="text-2xl font-bold">Edit Offer</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            Loading offer...
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error && !offer) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Offer</h1>
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
                    <TicketPercentIcon className="w-6 h-6" />
                    Edit Offer
                </h1>
            </div>

            {success && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="text-green-800 text-center">
                            Offer updated successfully!
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
                        <CardTitle>Offer Information</CardTitle>
                        <CardDescription>Edit the offer details below</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter offer title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <textarea
                                id="description"
                                className="w-full min-h-[120px] px-3 py-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter offer description"
                                required
                            />
                        </div>

                        {/* Discount Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                                <Input
                                    id="discount_percentage"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.discount_percentage}
                                    onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                                    placeholder="e.g., 20"
                                />
                                <p className="text-xs text-muted-foreground">Enter percentage (0-100)</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount_amount">Discount Amount ($)</Label>
                                <Input
                                    id="discount_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.discount_amount}
                                    onChange={(e) => handleInputChange('discount_amount', e.target.value)}
                                    placeholder="e.g., 50"
                                />
                                <p className="text-xs text-muted-foreground">Enter fixed discount amount</p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Code and Image */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Promo Code</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value)}
                                    placeholder="e.g., SAVE20"
                                />
                            </div>
                            <div className="space-y-2">
                                <ImageUpload
                                    value={formData.image_url}
                                    onChange={(url) => handleInputChange('image_url', url)}
                                    multiple={false}
                                    folder="offers"
                                    label="Offer Image"
                                    onDelete={deleteFileFromBucket}
                                />
                            </div>
                        </div>

                        {/* Purchase Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="min_purchase_amount">Minimum Purchase Amount ($)</Label>
                                <Input
                                    id="min_purchase_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.min_purchase_amount}
                                    onChange={(e) => handleInputChange('min_purchase_amount', e.target.value)}
                                    placeholder="e.g., 100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_discount_amount">Maximum Discount Amount ($)</Label>
                                <Input
                                    id="max_discount_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.max_discount_amount}
                                    onChange={(e) => handleInputChange('max_discount_amount', e.target.value)}
                                    placeholder="e.g., 200"
                                />
                            </div>
                        </div>

                        {/* Applicable Categories */}
                        <div className="space-y-2">
                            <Label>Applicable Categories</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    placeholder="Enter category name"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                />
                                <Button type="button" onClick={addCategory} variant="outline">
                                    <PlusIcon className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.applicable_categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.applicable_categories.map((cat, idx) => (
                                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
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
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="is_active">Active</Label>
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
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="w-4 h-4 mr-2" />
                                        Update Offer
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
