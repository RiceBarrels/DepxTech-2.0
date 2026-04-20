"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    SearchIcon,
    LayoutGridIcon,
    LayoutListIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ProductToolbar({
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    sortBy,
    setSortBy,
    groupBy,
    setGroupBy,
    viewMode,
    handleSetViewMode,
    categories,
    brands,
    hasActiveFilters,
    clearFilters,
}) {
    const t = useTranslations('admin.tradein')

    return (
        <div className="flex flex-col lg:flex-row gap-3 p-3 bg-muted/50 rounded-xl border">
            <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchPlaceholder')} className="pl-9 h-9" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allCategories')}</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allBrands')}</SelectItem>
                        {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[130px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_desc">{t('newest')}</SelectItem>
                        <SelectItem value="created_asc">{t('oldest')}</SelectItem>
                        <SelectItem value="title_asc">A-Z</SelectItem>
                        <SelectItem value="title_desc">Z-A</SelectItem>
                        <SelectItem value="price_desc">Price ↓</SelectItem>
                        <SelectItem value="price_asc">Price ↑</SelectItem>
                        <SelectItem value="updated_asc">Stale first</SelectItem>
                        <SelectItem value="updated_desc">Recent first</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger className="w-[120px] h-9">
                        <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">{t('noGrouping')}</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="series">Series</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                        {t('clear')}
                    </Button>
                )}

                <div className="border-l h-6 mx-1" />

                <div className="flex border rounded-md">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-9 px-2.5 rounded-r-none" onClick={() => handleSetViewMode('grid')}>
                        <LayoutGridIcon className="w-4 h-4" />
                    </Button>
                    <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" className="h-9 px-2.5 rounded-l-none" onClick={() => handleSetViewMode('table')}>
                        <LayoutListIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
