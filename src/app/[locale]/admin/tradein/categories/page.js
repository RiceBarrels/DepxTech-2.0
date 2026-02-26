"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
    LayoutGridIcon,
    EditIcon,
    GripVerticalIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload, uploadFiles, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import Image from 'next/image'

const defaultForm = {
    name: '',
    description: '',
    img: '',
    icon: 'Package',
    display_order: 0,
    is_active: true,
    is_featured: false,
    is_popular: false,
}

export default function CategoriesPage() {
    const router = useTransitionRouter()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    // Create dialog
    const [showCreate, setShowCreate] = useState(false)
    const [createForm, setCreateForm] = useState({ ...defaultForm })
    const [creating, setCreating] = useState(false)

    // Edit dialog
    const [editCategory, setEditCategory] = useState(null)
    const [editForm, setEditForm] = useState({ ...defaultForm })
    const [saving, setSaving] = useState(false)

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/tradein/categories')
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCategories(data.categories || [])
        } catch (err) {
            toast.error(err.message || 'Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchCategories() }, [fetchCategories])

    const handleCreate = async () => {
        if (!createForm.name.trim()) {
            toast.error('Category name is required')
            return
        }
        setCreating(true)
        try {
            let imgUrl = createForm.img
            if (createForm.img instanceof File) {
                imgUrl = (await uploadFiles(createForm.img, 'tradein/categories'))[0]
            }
            const res = await fetch('/api/admin/tradein/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...createForm, img: imgUrl || null }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCategories(prev => [...prev, data.category].sort((a, b) => a.display_order - b.display_order))
            setShowCreate(false)
            setCreateForm({ ...defaultForm })
            toast.success('Category created')
        } catch (err) {
            toast.error(err.message || 'Failed to create category')
        } finally {
            setCreating(false)
        }
    }

    const openEdit = (cat) => {
        setEditCategory(cat)
        setEditForm({
            name: cat.name || '',
            description: cat.description || '',
            img: cat.img || '',
            icon: cat.icon || 'Package',
            display_order: cat.display_order ?? 0,
            is_active: cat.is_active !== false,
            is_featured: cat.is_featured || false,
            is_popular: cat.is_popular || false,
        })
    }

    const handleSave = async () => {
        if (!editCategory) return
        if (!editForm.name.trim()) {
            toast.error('Category name is required')
            return
        }
        setSaving(true)
        try {
            let imgUrl = editForm.img
            if (editForm.img instanceof File) {
                imgUrl = (await uploadFiles(editForm.img, 'tradein/categories'))[0]
            }
            const res = await fetch('/api/admin/tradein/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editCategory.id, ...editForm, img: imgUrl || null }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCategories(prev => prev.map(c => c.id === editCategory.id ? data.category : c).sort((a, b) => a.display_order - b.display_order))
            setEditCategory(null)
            toast.success('Category updated')
        } catch (err) {
            toast.error(err.message || 'Failed to update category')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/tradein/categories?id=${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCategories(prev => prev.filter(c => c.id !== id))
            toast.success('Category deleted')
        } catch (err) {
            toast.error(err.message || 'Failed to delete category')
        } finally {
            setDeleting(null)
        }
    }

    const CategoryFormFields = ({ form, setForm }) => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Smartphones" />
                </div>
                <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={form.display_order} onChange={(e) => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description for this category" />
            </div>
            <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                    value={form.img}
                    onChange={(url) => setForm(f => ({ ...f, img: url }))}
                    multiple={false}
                    folder="tradein/categories"
                    label="Upload Image"
                    onDelete={deleteFileFromBucket}
                />
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Checkbox id="is_active" checked={form.is_active} onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
                    <Label htmlFor="is_active" className="cursor-pointer text-sm">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id="is_featured" checked={form.is_featured} onCheckedChange={(v) => setForm(f => ({ ...f, is_featured: v }))} />
                    <Label htmlFor="is_featured" className="cursor-pointer text-sm">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id="is_popular" checked={form.is_popular} onCheckedChange={(v) => setForm(f => ({ ...f, is_popular: v }))} />
                    <Label htmlFor="is_popular" className="cursor-pointer text-sm">Popular</Label>
                </div>
            </div>
        </div>
    )

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/tradein')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Categories</h1>
                        <p className="text-sm text-muted-foreground">Manage trade-in product categories</p>
                    </div>
                </div>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                    <PlusIcon className="w-4 h-4 mr-1" /> Add Category
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : categories.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <LayoutGridIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No categories yet</p>
                        <Button className="mt-4" onClick={() => setShowCreate(true)}>
                            <PlusIcon className="w-4 h-4 mr-1" /> Add First Category
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <Card key={cat.id} className={`hover:shadow-md transition-shadow cursor-pointer group ${!cat.is_active ? 'opacity-50' : ''}`} onClick={() => openEdit(cat)}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="relative w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                        {cat.img ? (
                                            <Image src={cat.img} alt={cat.name} width={56} height={56} className="object-contain" />
                                        ) : (
                                            <LayoutGridIcon className="w-6 h-6 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontalIcon className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(cat) }}>
                                                <EditIcon className="w-4 h-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                disabled={deleting === cat.id}
                                                onClick={(e) => { e.stopPropagation(); handleDelete(cat.id) }}
                                            >
                                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{cat.name}</span>
                                        <span className="text-xs text-muted-foreground">#{cat.display_order}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cat.slug}</p>
                                    {cat.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cat.description}</p>}
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                    {!cat.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                                    {cat.is_featured && <Badge className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100">Featured</Badge>}
                                    {cat.is_popular && <Badge className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">Popular</Badge>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Category</DialogTitle>
                    </DialogHeader>
                    <CategoryFormFields form={createForm} setForm={setCreateForm} />
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
            <Dialog open={!!editCategory} onOpenChange={(open) => { if (!open) setEditCategory(null) }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <CategoryFormFields form={editForm} setForm={setEditForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditCategory(null)}>Cancel</Button>
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
