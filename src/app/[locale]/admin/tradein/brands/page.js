"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    MoreHorizontalIcon,
    LoaderIcon,
    TagIcon,
    EditIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import Image from 'next/image'

export default function BrandsPage() {
    const router = useTransitionRouter()
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    // Create dialog
    const [showCreate, setShowCreate] = useState(false)
    const [createName, setCreateName] = useState('')
    const [createImg, setCreateImg] = useState('')
    const [creating, setCreating] = useState(false)

    // Edit dialog
    const [editBrand, setEditBrand] = useState(null)
    const [editName, setEditName] = useState('')
    const [editImg, setEditImg] = useState('')
    const [saving, setSaving] = useState(false)

    const fetchBrands = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/tradein/brands')
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setBrands(data.brands || [])
        } catch (err) {
            toast.error(err.message || 'Failed to fetch brands')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchBrands() }, [fetchBrands])

    const handleCreate = async () => {
        if (!createName.trim()) {
            toast.error('Brand name is required')
            return
        }
        setCreating(true)
        try {
            let imgUrl = createImg
            if (createImg instanceof File) {
                imgUrl = (await uploadFiles(createImg, 'tradein/brands'))[0]
            }
            const res = await fetch('/api/admin/tradein/brands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: createName.trim(), img: imgUrl || null }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setBrands(prev => [...prev, data.brand].sort((a, b) => a.name.localeCompare(b.name)))
            setShowCreate(false)
            setCreateName('')
            setCreateImg('')
            toast.success('Brand created')
        } catch (err) {
            toast.error(err.message || 'Failed to create brand')
        } finally {
            setCreating(false)
        }
    }

    const openEdit = (brand) => {
        setEditBrand(brand)
        setEditName(brand.name)
        setEditImg(brand.img || '')
    }

    const handleSave = async () => {
        if (!editBrand) return
        if (!editName.trim()) {
            toast.error('Brand name is required')
            return
        }
        setSaving(true)
        try {
            let imgUrl = editImg
            if (editImg instanceof File) {
                imgUrl = (await uploadFiles(editImg, 'tradein/brands'))[0]
            }
            const res = await fetch('/api/admin/tradein/brands', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editBrand.id, name: editName.trim(), img: imgUrl || null }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setBrands(prev => prev.map(b => b.id === editBrand.id ? data.brand : b).sort((a, b) => a.name.localeCompare(b.name)))
            setEditBrand(null)
            toast.success('Brand updated')
        } catch (err) {
            toast.error(err.message || 'Failed to update brand')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/tradein/brands?id=${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setBrands(prev => prev.filter(b => b.id !== id))
            toast.success('Brand deleted')
        } catch (err) {
            toast.error(err.message || 'Failed to delete brand')
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/tradein')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Brands</h1>
                        <p className="text-sm text-muted-foreground">Manage brand logos in one place</p>
                    </div>
                </div>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                    <PlusIcon className="w-4 h-4 mr-1" /> Add Brand
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : brands.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <TagIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No brands yet</p>
                        <Button className="mt-4" onClick={() => setShowCreate(true)}>
                            <PlusIcon className="w-4 h-4 mr-1" /> Add First Brand
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {brands.map(brand => (
                        <Card key={brand.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openEdit(brand)}>
                            <CardContent className="p-4 flex flex-col items-center gap-3">
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    {brand.img ? (
                                        <Image src={brand.img} alt={brand.name} width={64} height={64} className="object-contain" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                                            <span className="text-xl font-bold text-muted-foreground">{brand.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium text-sm text-center">{brand.name}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontalIcon className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(brand) }}>
                                            <EditIcon className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            disabled={deleting === brand.id}
                                            onClick={(e) => { e.stopPropagation(); handleDelete(brand.id) }}
                                        >
                                            <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Brand</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Brand Name *</Label>
                            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Apple" />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <ImageUpload
                                value={createImg}
                                onChange={(url) => setCreateImg(url)}
                                multiple={false}
                                folder="tradein/brands"
                                label="Upload Logo"
                                onDelete={deleteFileFromBucket}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating && <LoaderIcon className="w-4 h-4 animate-spin mr-1" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editBrand} onOpenChange={(open) => { if (!open) setEditBrand(null) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Brand</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Brand Name *</Label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <div className="flex items-start gap-4">
                                {editImg && typeof editImg === 'string' && (
                                    <div className="relative w-16 h-16 rounded border bg-muted flex-shrink-0 flex items-center justify-center">
                                        <Image src={editImg} alt={editName} width={56} height={56} className="object-contain" />
                                    </div>
                                )}
                                <ImageUpload
                                    value={editImg}
                                    onChange={(url) => setEditImg(url)}
                                    multiple={false}
                                    folder="tradein/brands"
                                    label={editImg ? "Change" : "Upload Logo"}
                                    onDelete={deleteFileFromBucket}
                                    compact={!!editImg}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditBrand(null)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <LoaderIcon className="w-4 h-4 animate-spin mr-1" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
