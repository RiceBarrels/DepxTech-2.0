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

let cachedCategories = null

export function CategorySelect({ value, onChange, className = "h-9" }) {
    const [categories, setCategories] = useState(cachedCategories || [])
    const [loading, setLoading] = useState(!cachedCategories)
    const [adding, setAdding] = useState(false)
    const [newName, setNewName] = useState("")
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (cachedCategories) return
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/tradein/categories")
            const data = await res.json()
            if (data.categories) {
                cachedCategories = data.categories
                setCategories(data.categories)
            }
        } catch {
            toast.error("Failed to load categories")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newName.trim()) return
        setCreating(true)
        try {
            const res = await fetch("/api/admin/tradein/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            const updated = [...categories, data.category].sort((a, b) =>
                a.display_order - b.display_order || a.name.localeCompare(b.name)
            )
            cachedCategories = updated
            setCategories(updated)
            onChange(data.category.name)
            setNewName("")
            setAdding(false)
            toast.success(`Category "${data.category.name}" created`)
        } catch (err) {
            toast.error(err.message || "Failed to create category")
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
                    placeholder="New category name..."
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
                    <SelectValue placeholder="Select category" />
                )}
            </SelectTrigger>
            <SelectContent>
                {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
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
                    Add new category
                </button>
            </SelectContent>
        </Select>
    )
}
