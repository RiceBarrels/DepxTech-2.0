"use client"

import { Button } from '@/components/ui/button'
import {
    EditIcon,
    TrashIcon,
    XIcon,
    LoaderIcon,
    FileTextIcon,
    DollarSignIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SelectionBar({
    selectedIds,
    products,
    clearSelection,
    openEditPanel,
    handleBulkDelete,
    // eBay
    fetchingPrices,
    priceProgress,
    handleFetchEbayPrices,
    // BackMarket
    fetchingBmPrices,
    bmPriceProgress,
    handleFetchBackmarketPrices,
    // Template
    applyingTemplate,
    fetchTemplates,
    setShowBulkTemplateDialog,
}) {
    const t = useTranslations('admin.tradein')

    return (
        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <span className="font-medium">{t('selected', { count: selectedIds.size })}</span>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => { fetchTemplates(); setShowBulkTemplateDialog(true) }} disabled={applyingTemplate}>
                {applyingTemplate ? <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" /> : <FileTextIcon className="w-4 h-4 mr-1.5" />}
                {applyingTemplate ? t('applyingTemplate') : t('applyTemplate')}
            </Button>
            <div className="flex flex-col gap-1.5">
                <Button variant="outline" size="sm" onClick={handleFetchEbayPrices} disabled={fetchingPrices || fetchingBmPrices}>
                    {fetchingPrices ? <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" /> : <DollarSignIcon className="w-4 h-4 mr-1.5" />}
                    {fetchingPrices && priceProgress.total > 0
                        ? `${priceProgress.done}/${priceProgress.total}`
                        : fetchingPrices ? t('fetching') : t('fetchEbayPrices')}
                </Button>
                {fetchingPrices && priceProgress.total > 0 && (
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(priceProgress.done / priceProgress.total) * 100}%` }}
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <Button variant="outline" size="sm" onClick={handleFetchBackmarketPrices} disabled={fetchingBmPrices || fetchingPrices}>
                    {fetchingBmPrices ? <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" /> : <DollarSignIcon className="w-4 h-4 mr-1.5" />}
                    {fetchingBmPrices && bmPriceProgress.total > 0
                        ? `${bmPriceProgress.done}/${bmPriceProgress.total}`
                        : fetchingBmPrices ? t('fetching') : t('fetchBackmarketPrices')}
                </Button>
                {fetchingBmPrices && bmPriceProgress.total > 0 && (
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(bmPriceProgress.done / bmPriceProgress.total) * 100}%` }}
                        />
                    </div>
                )}
            </div>
            <Button variant="outline" size="sm" onClick={() => {
                const firstSelected = products.find(p => selectedIds.has(p.id))
                if (firstSelected) openEditPanel(firstSelected)
            }}>
                <EditIcon className="w-4 h-4 mr-1.5" />
                {t('editSelected')}
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleBulkDelete}>
                <TrashIcon className="w-4 h-4 mr-1.5" />
                {t('deleteSelected')}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
                <XIcon className="w-4 h-4" />
            </Button>
        </div>
    )
}
