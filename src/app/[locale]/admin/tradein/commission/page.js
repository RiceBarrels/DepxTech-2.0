"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    MoreHorizontalIcon,
    LoaderIcon,
    PercentIcon,
    GlobeIcon,
    TagIcon,
    LayersIcon,
    SaveIcon,
} from 'lucide-react'
import { toast } from 'sonner'

export default function CommissionPage() {
    const router = useTransitionRouter()
    const [configs, setConfigs] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    // Brands & categories from tradable products
    const [brands, setBrands] = useState([])
    const [categories, setCategories] = useState([])

    // Create dialog
    const [showCreate, setShowCreate] = useState(false)
    const [createBrand, setCreateBrand] = useState('')
    const [createCategory, setCreateCategory] = useState('')
    const [creating, setCreating] = useState(false)

    // Edit dialog
    const [editConfig, setEditConfig] = useState(null)
    const [editTiers, setEditTiers] = useState([])
    const [editBmTiers, setEditBmTiers] = useState([])
    const [editTab, setEditTab] = useState('ebay') // 'ebay' | 'backmarket'
    const [saving, setSaving] = useState(false)

    const fetchConfigs = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/tradein/commission')
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setConfigs(data.tiers || [])
        } catch (err) {
            toast.error(err.message || 'Failed to fetch commission tiers')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch brands/categories from products
    useEffect(() => {
        fetch('/api/admin/tradein')
            .then(r => r.json())
            .then(data => {
                if (data.products) {
                    setBrands([...new Set(data.products.map(p => p.brand).filter(Boolean))].sort())
                    setCategories([...new Set(data.products.map(p => p.category).filter(Boolean))].sort())
                }
            })
            .catch(() => {})
    }, [])

    useEffect(() => { fetchConfigs() }, [fetchConfigs])

    const handleCreate = async () => {
        setCreating(true)
        try {
            const defaultTiers = [
                { maxPrice: 100, percentage: 0.30, fixedFee: 5 },
                { maxPrice: 500, percentage: 0.25, fixedFee: 10 },
                { maxPrice: 1000, percentage: 0.20, fixedFee: 20 },
            ]
            const res = await fetch('/api/admin/tradein/commission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: createBrand || null,
                    category: createCategory || null,
                    tiers: defaultTiers,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setConfigs(prev => [...prev, data.tier])
            setShowCreate(false)
            setCreateBrand('')
            setCreateCategory('')
            toast.success('Commission tier created')
            // Open it for editing immediately
            setEditConfig(data.tier)
            setEditTiers(data.tier.tiers.map(t => ({ ...t })))
        } catch (err) {
            toast.error(err.message || 'Failed to create')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id) => {
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/tradein/commission?id=${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setConfigs(prev => prev.filter(c => c.id !== id))
            toast.success('Deleted')
        } catch (err) {
            toast.error(err.message || 'Failed to delete')
        } finally {
            setDeleting(null)
        }
    }

    const handleSave = async () => {
        if (!editConfig) return
        // Validate eBay tiers
        for (const tier of editTiers) {
            if (!tier.maxPrice || tier.percentage == null || tier.fixedFee == null) {
                toast.error('All eBay tier fields are required')
                return
            }
        }
        // Validate BM tiers (only if any exist)
        for (const tier of editBmTiers) {
            if (!tier.maxPrice || tier.percentage == null || tier.fixedFee == null) {
                toast.error('All BackMarket tier fields are required')
                return
            }
        }
        // Sort by maxPrice
        const sorted = [...editTiers].sort((a, b) => a.maxPrice - b.maxPrice)
        const sortedBm = [...editBmTiers].sort((a, b) => a.maxPrice - b.maxPrice)

        setSaving(true)
        try {
            const res = await fetch('/api/admin/tradein/commission', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editConfig.id, tiers: sorted, backmarket_tiers: sortedBm }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setConfigs(prev => prev.map(c => c.id === editConfig.id ? data.tier : c))
            setEditConfig(null)
            toast.success('Commission tiers saved')
        } catch (err) {
            toast.error(err.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const openEdit = (config) => {
        setEditConfig(config)
        setEditTiers(config.tiers.map(t => ({ ...t })))
        setEditBmTiers((config.backmarket_tiers || []).map(t => ({ ...t })))
        setEditTab('ebay')
    }

    // Active tier list based on tab
    const activeTiers = editTab === 'ebay' ? editTiers : editBmTiers
    const setActiveTiers = editTab === 'ebay' ? setEditTiers : setEditBmTiers

    const addTierRow = () => {
        const tiers = activeTiers
        const lastMax = tiers.length > 0 ? tiers[tiers.length - 1].maxPrice : 0
        setActiveTiers(prev => [...prev, { maxPrice: lastMax + 100, percentage: 0.20, fixedFee: 10 }])
    }

    const removeTierRow = (index) => {
        setActiveTiers(prev => prev.filter((_, i) => i !== index))
    }

    const updateTierRow = (index, field, value) => {
        setActiveTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: parseFloat(value) || 0 } : t))
    }

    const getScopeLabel = (config) => {
        if (config.brand && config.category) return `${config.brand} × ${config.category}`
        if (config.brand) return config.brand
        if (config.category) return config.category
        return 'Global Default'
    }

    const getScopeBadge = (config) => {
        if (config.brand && config.category) return { label: 'Brand + Category', className: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' }
        if (config.brand) return { label: 'Brand', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' }
        if (config.category) return { label: 'Category', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' }
        return { label: 'Global', className: 'bg-muted text-muted-foreground' }
    }

    const isGlobal = (config) => !config.brand && !config.category

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/tradein')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Commission Tiers</h1>
                        <p className="text-sm text-muted-foreground">Configure pricing margins per brand or category</p>
                    </div>
                </div>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                    <PlusIcon className="w-4 h-4 mr-1" /> Add Tier
                </Button>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : configs.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <PercentIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No commission tiers configured</p>
                        <Button className="mt-4" onClick={() => setShowCreate(true)}>
                            <PlusIcon className="w-4 h-4 mr-1" /> Create First Tier
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {configs.map(config => {
                        const scope = getScopeBadge(config)
                        const tiers = config.tiers || []
                        return (
                            <Card key={config.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openEdit(config)}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {isGlobal(config) ? <GlobeIcon className="w-4 h-4 text-muted-foreground" /> :
                                                    config.brand && config.category ? <LayersIcon className="w-4 h-4 text-green-600" /> :
                                                        config.brand ? <TagIcon className="w-4 h-4 text-blue-600" /> :
                                                            <TagIcon className="w-4 h-4 text-purple-600" />}
                                                <span className="font-semibold text-sm">{getScopeLabel(config)}</span>
                                            </div>
                                            <Badge variant="outline" className={`text-[10px] ${scope.className}`}>{scope.label}</Badge>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontalIcon className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(config) }}>
                                                    Edit Tiers
                                                </DropdownMenuItem>
                                                {!isGlobal(config) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            disabled={deleting === config.id}
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(config.id) }}
                                                        >
                                                            <TrashIcon className="w-4 h-4 mr-2" />Delete
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Tier summary */}
                                    <div className="space-y-1">
                                        {tiers.slice(0, 3).map((t, i) => (
                                            <div key={i} className="flex justify-between text-xs text-muted-foreground">
                                                <span>Up to ${t.maxPrice}</span>
                                                <span>{(t.percentage * 100).toFixed(1)}% + ${t.fixedFee}</span>
                                            </div>
                                        ))}
                                        {tiers.length > 3 && (
                                            <p className="text-xs text-muted-foreground/60">+{tiers.length - 3} more...</p>
                                        )}
                                    </div>

                                    <p className="text-[10px] text-muted-foreground/50">
                                        eBay: {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
                                        {(config.backmarket_tiers?.length > 0) && ` · BM: ${config.backmarket_tiers.length} tier${config.backmarket_tiers.length !== 1 ? 's' : ''}`}
                                        {' '}· Updated {new Date(config.updated_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Commission Tier</DialogTitle>
                        <DialogDescription>
                            Leave brand and category empty for a global default. Select one or both to target specific products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Brand (optional)</Label>
                            <Select value={createBrand} onValueChange={setCreateBrand}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All brands (global)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">All brands (global)</SelectItem>
                                    {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Category (optional)</Label>
                            <Select value={createCategory} onValueChange={setCreateCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories (global)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">All categories (global)</SelectItem>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? <LoaderIcon className="w-4 h-4 animate-spin mr-1" /> : <PlusIcon className="w-4 h-4 mr-1" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editConfig} onOpenChange={(open) => { if (!open) setEditConfig(null) }}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit: {editConfig ? getScopeLabel(editConfig) : ''}</DialogTitle>
                        <DialogDescription>
                            Each tier applies to prices up to the max price. Products above the highest tier use the last row.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tab Switcher */}
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        <button
                            className={`flex-1 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${editTab === 'ebay' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setEditTab('ebay')}
                        >
                            eBay Tiers ({editTiers.length})
                        </button>
                        <button
                            className={`flex-1 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${editTab === 'backmarket' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setEditTab('backmarket')}
                        >
                            BackMarket Tiers ({editBmTiers.length})
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2 text-xs font-medium text-muted-foreground px-1">
                            <span>Max Price ($)</span>
                            <span>Commission (%)</span>
                            <span>Fixed Fee ($)</span>
                            <span></span>
                        </div>

                        {activeTiers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No {editTab === 'backmarket' ? 'BackMarket' : 'eBay'} tiers configured. Add a row below.
                            </p>
                        ) : activeTiers.map((tier, i) => (
                            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2 items-center">
                                <Input
                                    type="number"
                                    min="0"
                                    step="10"
                                    value={tier.maxPrice}
                                    onChange={(e) => updateTierRow(i, 'maxPrice', e.target.value)}
                                    className="h-9"
                                />
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={Math.round(tier.percentage * 1000) / 10}
                                    onChange={(e) => updateTierRow(i, 'percentage', (parseFloat(e.target.value) || 0) / 100)}
                                    className="h-9"
                                />
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={tier.fixedFee}
                                    onChange={(e) => updateTierRow(i, 'fixedFee', e.target.value)}
                                    className="h-9"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-red-500"
                                    onClick={() => removeTierRow(i)}
                                    disabled={activeTiers.length <= 1 && editTab === 'ebay'}
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full" onClick={addTierRow}>
                            <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add Row
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditConfig(null)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || editTiers.length === 0}>
                            {saving ? <LoaderIcon className="w-4 h-4 animate-spin mr-1" /> : <SaveIcon className="w-4 h-4 mr-1" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
