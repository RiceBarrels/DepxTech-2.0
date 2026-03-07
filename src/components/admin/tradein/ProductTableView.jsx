"use client"

import { Fragment } from "react"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    EditIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
    XIcon,
    LoaderIcon,
    CheckIcon,
    MinusIcon,
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

export function ProductTableView({
    groups,
    groupBy,
    expandedGroups,
    toggleGroup,
    selectedIds,
    editingProduct,
    toggleSelect,
    selectAll,
    allSelected,
    someSelected,
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
    router,
}) {
    const t = useTranslations('admin.tradein')

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="text-left p-3 font-medium w-10">
                                <button onClick={selectAll} className={cn(
                                    "w-4 h-4 border rounded-xs flex items-center justify-center",
                                    allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/50 border-primary" : ""
                                )}>
                                    {allSelected ? <CheckIcon className="w-3 h-3 text-primary-foreground" /> : someSelected ? <MinusIcon className="w-3 h-3 text-primary-foreground" /> : null}
                                </button>
                            </th>
                            <th className="text-left p-3 font-medium">{t('product')}</th>
                            <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
                            <th className="text-right p-3 font-medium">{t('basePrice')}</th>
                            <th className="text-right p-3 font-medium hidden sm:table-cell">{t('current')}</th>
                            <th className="text-center p-3 font-medium hidden lg:table-cell">Updated</th>
                            <th className="text-center p-3 font-medium w-[80px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {Object.entries(groups).map(([groupName, groupProducts]) => (
                            <Fragment key={groupName}>
                                {groupBy !== 'none' && (
                                    <tr key={`group-${groupName}`} className="bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => toggleGroup(groupName)}>
                                        <td colSpan={7} className="p-2 px-3">
                                            <div className="flex items-center gap-2 font-medium">
                                                {expandedGroups[groupName] === false ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                                {groupName}
                                                <Badge variant="secondary" className="ml-2">{groupProducts.length}</Badge>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {(groupBy === 'none' || expandedGroups[groupName] !== false) && groupProducts.map((product) => {
                                    const currentValue = getCurrentValue(product)
                                    const isSelected = selectedIds.has(product.id)
                                    const isEditing = editingProduct?.id === product.id

                                    return (
                                        <tr key={product.id} className={cn("hover:bg-muted/30", isEditing && "bg-primary/5", isSelected && "bg-primary/10", savingInline === product.id && "opacity-60")} onDoubleClick={() => router.push(`/admin/tradein/edit/${product.id}`)}>
                                            <td className="p-3 align-top">
                                                <button onClick={(e) => { e.stopPropagation(); toggleSelect(product.id) }} className={cn(
                                                    "w-4 h-4 border rounded-xs flex items-center justify-center mt-1",
                                                    isSelected ? "bg-primary border-primary" : ""
                                                )}>
                                                    {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                                                </button>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-xs flex-shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all bg-muted"
                                                        onClick={(e) => openImageDialog(product, e)}
                                                    >
                                                        {product.imgs?.[0] ? (
                                                            <Image src={product.imgs[0]} alt="" width={40} height={40} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <Textarea
                                                                className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-sm font-medium min-h-0 resize-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30 rounded-sm"
                                                                rows={1}
                                                                value={getInlineValue(product, 'title')}
                                                                onChange={(e) => handleInlineChange(product.id, 'title', e.target.value)}
                                                                onBlur={() => handleInlineBlur(product, 'title')}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            {product.is_featured && <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                                            {product.question_template_id && (
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); openEditPanel(product) }}>
                                                                    <FileTextIcon className="w-2.5 h-2.5 mr-0.5" />T
                                                                </Badge>
                                                            )}
                                                            {product.variant_of && (
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800 flex-shrink-0">
                                                                    <GitBranchIcon className="w-2.5 h-2.5 mr-0.5" />V
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <Textarea
                                                            className="w-full bg-transparent border-0 shadow-none p-0 px-1 -mx-1 text-xs text-muted-foreground min-h-0 resize-none rounded-xs focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-muted/30"
                                                            rows={expandedDesIds.has(product.id) ? 3 : 1}
                                                            placeholder="Description..."
                                                            value={getInlineValue(product, 'des')}
                                                            onChange={(e) => handleInlineChange(product.id, 'des', e.target.value)}
                                                            onBlur={() => { handleInlineBlur(product, 'des'); toggleDesExpand(product.id, null, true) }}
                                                            onFocus={() => { if (!expandedDesIds.has(product.id)) toggleDesExpand(product.id) }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2 hidden md:table-cell align-top">
                                                <Badge variant="outline">{product.category}</Badge>
                                            </td>
                                            <td className="p-2 text-right align-top">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-20 bg-transparent border-0 p-0 px-1 text-sm font-medium text-right rounded-xs focus:ring-1 focus:ring-primary/40 focus:bg-muted/30 outline-none"
                                                    value={getInlineValue(product, 'base_price')}
                                                    onChange={(e) => handleInlineChange(product.id, 'base_price', e.target.value)}
                                                    onBlur={() => handleInlineBlur(product, 'base_price')}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="p-2 text-right hidden sm:table-cell align-top">
                                                <span className="text-green-600 font-medium text-sm">{formatPrice(currentValue)}</span>
                                            </td>
                                            <td className="p-2 text-center hidden lg:table-cell align-top">
                                                {product.base_date ? (
                                                    <span className={cn("text-xs", getDateColor(product.base_date))}>
                                                        {formatRelativeDate(product.base_date)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/40">—</span>
                                                )}
                                            </td>
                                            <td className="p-2 align-top">
                                                <div className="flex items-center justify-center gap-1">
                                                    {savingInline === product.id && <LoaderIcon className="w-3 h-3 animate-spin text-muted-foreground" />}
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditPanel(product)}>
                                                        <EditIcon className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <MoreHorizontalIcon className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
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
                                            </td>
                                        </tr>
                                    )
                                })}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
