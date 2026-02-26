"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PlusIcon, LoaderIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

let cachedBrands = null

export function BrandSelect({ value, onChange, className = "h-9" }) {
    const [brands, setBrands] = useState(cachedBrands || [])
    const [loading, setLoading] = useState(!cachedBrands)
    const [adding, setAdding] = useState(false)
    const [newName, setNewName] = useState("")
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (cachedBrands) return
        fetchBrands()
    }, [])

    const fetchBrands = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/tradein/brands")
            const data = await res.json()
            if (data.brands) {
                cachedBrands = data.brands
                setBrands(data.brands)
            }
        } catch {
            toast.error("Failed to load brands")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newName.trim()) return
        setCreating(true)
        try {
            const res = await fetch("/api/admin/tradein/brands", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            const updated = [...brands, data.brand].sort((a, b) =>
                a.name.localeCompare(b.name)
            )
            cachedBrands = updated
            setBrands(updated)
            onChange(data.brand.name)
            setNewName("")
            setAdding(false)
            toast.success(`Brand "${data.brand.name}" created`)
        } catch (err) {
            toast.error(err.message || "Failed to create brand")
        } finally {
            setCreating(false)
        }
    }

    if (adding) {
        return (
            <div className="flex items-center gap-1">
                <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New brand name..."
                    className={className}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleCreate() }
                        if (e.key === "Escape") setAdding(false)
                    }}
                />
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0"
                    onClick={handleCreate}
                    disabled={creating}
                >
                    {creating ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <PlusIcon className="w-3 h-3" />}
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0"
                    onClick={() => setAdding(false)}
                >
                    <XIcon className="w-3 h-3" />
                </Button>
            </div>
        )
    }

    return (
        <Select value={value} onValueChange={onChange} disabled={loading}>
            <SelectTrigger className={className}>
                {loading ? (
                    <span className="text-muted-foreground text-sm">Loading...</span>
                ) : (
                    <SelectValue placeholder="Select brand" />
                )}
            </SelectTrigger>
            <SelectContent>
                {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                        <span className="flex items-center gap-2">
                            {brand.img && (
                                <img src={brand.img} alt="" className="w-4 h-4 object-contain" />
                            )}
                            {brand.name}
                        </span>
                    </SelectItem>
                ))}
                <button
                    type="button"
                    className="relative flex w-full cursor-pointer items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent text-primary"
                    onClick={(e) => {
                        e.stopPropagation()
                        setAdding(true)
                    }}
                >
                    <PlusIcon className="w-3 h-3 mr-2" />
                    Add new brand
                </button>
            </SelectContent>
        </Select>
    )
}
