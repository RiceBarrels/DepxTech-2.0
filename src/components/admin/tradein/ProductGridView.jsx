"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
    LoaderIcon,
    CheckIcon,
    StarIcon,
    FileTextIcon,
    CopyIcon,
    EyeIcon,
    ImageIcon,
    GitBranchIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from 'next-intl'

function formatRelativeDate(dateStr) {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return '1d ago'
    if (days < 30) return `${days}d ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
}

function getDateColor(dateStr) {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    return days > 30 ? "text-red-500" : days > 14 ? "text-yellow-500" : "text-muted-foreground"
}

export function ProductGridView({
    groups,
    groupBy,
    expandedGroups,
    toggleGroup,
    selectedIds,
    editingProduct,
    toggleSelect,
    openEditPanel,
    openImageDialog,
    handleDuplicate,
    handleDelete,
    deleting,
    formatPrice,
    getCurrentValue,
    // Inline editing
    getInlineValue,
    handleInlineChange,
    handleInlineBlur,
    savingInline,
    expandedDesIds,
    toggleDesExpand,
}) {
    const t = useTranslations('admin.tradein')

    return (
        <div className="space-y-6">
            {Object.entries(groups).map(([groupName, groupProducts]) => (
                <div key={groupName}>
                    {groupBy !== 'none' && (
                        <button className="flex items-center gap-2 mb-3 font-semibold text-lg hover:text-primary transition-colors" onClick={() => toggleGroup(groupName)}>
                            {expandedGroups[groupName] === false ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                            {groupName}
                            <Badge variant="secondary">{groupProducts.length}</Badge>
                        </button>
                    )}

                    {(groupBy === 'none' || expandedGroups[groupName] !== false) && (
                        <div className={cn("grid gap-4", editingProduct ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
                            {groupProducts.map((product) => {
                                const currentValue = getCurrentValue(product)
                                const depRate = Number(product.depreciation_rate) || 0
                                const isSelected = selectedIds.has(product.id)
                                const isEditing = editingProduct?.id === product.id

                                return (
                                    <Card key={product.id} className={cn("group hover:shadow-md transition-all", isEditing && "ring-2 ring-primary", isSelected && "bg-primary/5", savingInline === product.id && "opacity-60")}>
                                        <CardContent className="p-4">
                                            <div className="flex gap-3">
                                                {/* Checkbox */}
                                                <button
                                                    onClick={() => toggleSelect(product.id)}
                                                    className={cn(
                                                        "w-5 h-5 border rounded-xs flex-shrink-0 flex items-center justify-center mt-1",
                                                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                    )}
                                                >
                                                    {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                                                </button>

                                                {/* Image */}
                                                <div
                                                    className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                                    onClick={() => openImageDialog(product)}
                                                >
                                                    {product.imgs?.[0] ? (
                                                        <Image src={product.imgs[0]} alt={product.title} width={64} height={64} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info - inline editable */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <Textarea
                                                            className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-sm font-semibold min-h-0 resize-none rounded-xs focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30"
                                                            rows={1}
                                                            value={getInlineValue(product, 'title')}
                                                            onChange={(e) => handleInlineChange(product.id, 'title', e.target.value)}
                                                            onBlur={() => handleInlineBlur(product, 'title')}
                                                        />
                                                        {product.is_featured && <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground px-1">{product.brand} · {product.series}</p>
                                                    <Textarea
                                                        className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-xs text-muted-foreground min-h-0 resize-none rounded-xs focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30"
                                                        rows={expandedDesIds.has(product.id) ? 3 : 1}
                                                        placeholder="Description..."
                                                        value={getInlineValue(product, 'des')}
                                                        onChange={(e) => handleInlineChange(product.id, 'des', e.target.value)}
                                                        onBlur={() => { handleInlineBlur(product, 'des'); toggleDesExpand(product.id, null, true) }}
                                                        onFocus={() => { if (!expandedDesIds.has(product.id)) toggleDesExpand(product.id) }}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-20 bg-transparent border-0 p-0 px-1 text-sm font-semibold resize-none rounded-xs focus:ring-1 focus:ring-primary/40 focus:bg-muted/30 outline-none"
                                                            value={getInlineValue(product, 'base_price')}
                                                            onChange={(e) => handleInlineChange(product.id, 'base_price', e.target.value)}
                                                            onBlur={() => handleInlineBlur(product, 'base_price')}
                                                        />
                                                        <span className="text-muted-foreground">→</span>
                                                        <span className="font-semibold text-green-600 text-sm">{formatPrice(currentValue)}</span>
                                                        {depRate > 0 && (
                                                            <Badge variant="secondary" className="text-xs">-{depRate}%</Badge>
                                                        )}
                                                        {product.base_date && (
                                                            <span className={cn("text-[10px]", getDateColor(product.base_date))}>
                                                                {formatRelativeDate(product.base_date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Template badge */}
                                                    {product.question_template_id ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50"
                                                            onClick={() => openEditPanel(product)}
                                                        >
                                                            <FileTextIcon className="w-2.5 h-2.5 mr-0.5" />Template
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] h-4 px-1 text-muted-foreground/50 cursor-pointer hover:text-muted-foreground hover:border-muted-foreground/50"
                                                            onClick={() => openEditPanel(product)}
                                                        >
                                                            <PlusIcon className="w-2.5 h-2.5 mr-0.5" />Template
                                                        </Badge>
                                                    )}
                                                    {/* Variant badge */}
                                                    {product.variant_of && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800">
                                                            <GitBranchIcon className="w-2.5 h-2.5 mr-0.5" />Variant
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                    {savingInline === product.id && <LoaderIcon className="w-3 h-3 animate-spin text-muted-foreground" />}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <MoreHorizontalIcon className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEditPanel(product)}>
                                                                <EditIcon className="w-4 h-4 mr-2" />{t('edit') || 'Edit'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => window.open(`/trade/product/${product.id}`, '_blank')}>
                                                                <EyeIcon className="w-4 h-4 mr-2" />{t('viewLive')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                                                                <CopyIcon className="w-4 h-4 mr-2" />{t('duplicate')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)} disabled={deleting === product.id}>
                                                                <TrashIcon className="w-4 h-4 mr-2" />{t('delete')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
