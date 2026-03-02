"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    XIcon,
    SaveIcon,
    LoaderIcon,
    HelpCircleIcon,
    StarIcon,
    FileTextIcon,
    CopyIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import Image from 'next/image'
import { ImageUpload, deleteFileFromBucket } from "@/components/admin/ImageUpload"
import { CategorySelect } from "@/components/admin/CategorySelect"
import { BrandSelect } from "@/components/admin/BrandSelect"

const normalizeImageUrl = (img) => {
    if (!img) return ''
    if (typeof img === 'string') return img
    if (typeof img === 'object' && img.url) return img.url
    return ''
}

export function ProductEditPanel({
    editingProduct,
    editFormData,
    handleEditInputChange,
    handleSaveEdit,
    closeEditPanel,
    saving,
    selectedIds,
    products,
    openEditPanel,
    // Template / copy
    showTemplateSelect,
    setShowTemplateSelect,
    showCopySelect,
    setShowCopySelect,
    templates,
    otherProducts,
    fetchTemplates,
    fetchOtherProducts,
    applyTemplate,
    copyQuestionsFromProduct,
    loadingTemplates,
    loadingProducts,
    // Image dialog
    setImageDialogProduct,
    setImageDialogImages,
}) {
    const t = useTranslations('admin.tradein')

    const getEstimatedValue = () => {
        if (!editFormData?.base_price) return null
        const depRate = parseFloat(editFormData.depreciation_rate) || 0
        const multiplier = 100 - depRate
        return {
            value: (parseFloat(editFormData.base_price) || 0) * (multiplier / 100),
            multiplier
        }
    }

    const estimatedValue = getEstimatedValue()

    return (
        <div className="hidden lg:block w-[500px] flex-shrink-0">
            <div className="sticky top-4 border rounded-lg bg-background shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto">
                {/* Panel Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
                    <div className="flex items-center gap-2 min-w-0">
                        <EditIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold truncate">{editingProduct.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.size > 1 && (
                            <span className="text-xs text-muted-foreground">
                                {Array.from(selectedIds).indexOf(editingProduct.id) + 1} of {selectedIds.size}
                            </span>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeEditPanel}>
                            <XIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Panel Content */}
                <div className="p-4 space-y-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-title">Title *</Label>
                        <Textarea
                            id="edit-title"
                            className="min-h-[60px] resize-none"
                            value={editFormData.title}
                            onChange={(e) => handleEditInputChange('title', e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-des">Description</Label>
                        <Textarea
                            id="edit-des"
                            className="min-h-[80px] resize-none"
                            value={editFormData.des}
                            onChange={(e) => handleEditInputChange('des', e.target.value)}
                        />
                    </div>

                    {/* Category, Brand, Series */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-category">Category *</Label>
                            <CategorySelect value={editFormData.category} onChange={(val) => handleEditInputChange('category', val)} className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-brand">Brand *</Label>
                            <BrandSelect value={editFormData.brand} onChange={(val) => handleEditInputChange('brand', val)} className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-series">Series *</Label>
                            <Input id="edit-series" value={editFormData.series} onChange={(e) => handleEditInputChange('series', e.target.value)} className="h-9" />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            <span className="text-green-600">$</span>
                            {t('pricing')}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-base_price" className="text-xs">{t('basePrice')} *</Label>
                                <Input id="edit-base_price" type="number" step="0.01" min="0" value={editFormData.base_price} onChange={(e) => handleEditInputChange('base_price', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-min_price" className="text-xs">{t('minPrice')}</Label>
                                <Input id="edit-min_price" type="number" step="0.01" min="0" value={editFormData.min_price} onChange={(e) => handleEditInputChange('min_price', e.target.value)} className="h-9" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-base_date" className="text-xs">{t('baseDate')}</Label>
                                <Input id="edit-base_date" type="date" value={editFormData.base_date} onChange={(e) => handleEditInputChange('base_date', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-depreciation_rate" className="text-xs">{t('depreciation')}</Label>
                                <Input id="edit-depreciation_rate" type="number" step="1" min="0" max="100" value={editFormData.depreciation_rate} onChange={(e) => handleEditInputChange('depreciation_rate', e.target.value)} className="h-9" />
                            </div>
                        </div>
                        {estimatedValue && (
                            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                                <span className="text-sm text-blue-700 dark:text-blue-400">{t('currentValue')}</span>
                                <span className="font-bold text-blue-600">${estimatedValue.value.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Featured */}
                    <div className="flex items-center space-x-2">
                        <Checkbox id="edit-is_featured" checked={editFormData.is_featured} onCheckedChange={(checked) => handleEditInputChange('is_featured', checked)} />
                        <Label htmlFor="edit-is_featured" className="flex items-center gap-2 cursor-pointer">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            {t('featured')}
                        </Label>
                    </div>

                    {/* Questions */}
                    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                        {editFormData.question_template_id && (
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 rounded-md px-2 py-1.5">
                                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <FileTextIcon className="w-3 h-3" />
                                    {t('linkedToTemplate')}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        handleEditInputChange('question_template_id', null)
                                        toast.info('Template unlinked (questions kept)')
                                    }}
                                >
                                    {t('unlinkTemplate')}
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <HelpCircleIcon className="w-4 h-4 text-blue-600" />
                                {t('questions')} ({editFormData.questions?.length || 0})
                            </h4>
                            <div className="flex items-center gap-1">
                                {showTemplateSelect ? (
                                    <div className="flex items-center gap-1">
                                        <Select onValueChange={applyTemplate}>
                                            <SelectTrigger className="w-[160px] h-7 text-xs">
                                                <SelectValue placeholder="Select template..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.length === 0 ? (
                                                    <SelectItem value="none" disabled>No templates found</SelectItem>
                                                ) : (
                                                    templates.map((tmpl) => (
                                                        <SelectItem key={tmpl.id} value={tmpl.id}>{tmpl.name} ({tmpl.questions.length})</SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowTemplateSelect(false)}>
                                            <XIcon className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ) : showCopySelect ? (
                                    <div className="flex items-center gap-1">
                                        <Select onValueChange={copyQuestionsFromProduct}>
                                            <SelectTrigger className="w-[160px] h-7 text-xs">
                                                <SelectValue placeholder="Copy from..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {otherProducts.length === 0 ? (
                                                    <SelectItem value="none" disabled>No products found</SelectItem>
                                                ) : (
                                                    otherProducts.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>{p.title} ({p.questions.length})</SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowCopySelect(false)}>
                                            <XIcon className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={fetchTemplates} disabled={loadingTemplates}>
                                            {loadingTemplates ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <FileTextIcon className="w-3 h-3 mr-1" />}
                                            {t('template')}
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={fetchOtherProducts} disabled={loadingProducts}>
                                            {loadingProducts ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <CopyIcon className="w-3 h-3 mr-1" />}
                                            {t('copy')}
                                        </Button>
                                    </>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => {
                                        const newQuestions = [...(editFormData.questions || []), { title: '', type: 'single', required: true, ans: [] }]
                                        handleEditInputChange('questions', newQuestions)
                                    }}
                                >
                                    <PlusIcon className="w-3 h-3 mr-1" />
                                    {t('add')}
                                </Button>
                            </div>
                        </div>

                        {editFormData.questions && editFormData.questions.length > 0 ? (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {editFormData.questions.map((question, qIndex) => (
                                    <div key={qIndex} className="border rounded-xs p-2 bg-background space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 space-y-1">
                                                <Input
                                                    value={question.title}
                                                    onChange={(e) => {
                                                        const newQuestions = [...editFormData.questions]
                                                        newQuestions[qIndex].title = e.target.value
                                                        handleEditInputChange('questions', newQuestions)
                                                    }}
                                                    placeholder="Question text..."
                                                    className="h-8 text-sm"
                                                />
                                                <Input
                                                    value={question.description || ''}
                                                    onChange={(e) => {
                                                        const newQuestions = [...editFormData.questions]
                                                        newQuestions[qIndex].description = e.target.value
                                                        handleEditInputChange('questions', newQuestions)
                                                    }}
                                                    placeholder="Description (optional)..."
                                                    className="h-7 text-xs text-muted-foreground"
                                                />
                                            </div>
                                            <Select
                                                value={question.type || 'single'}
                                                onValueChange={(value) => {
                                                    const newQuestions = [...editFormData.questions]
                                                    newQuestions[qIndex].type = value
                                                    handleEditInputChange('questions', newQuestions)
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[110px] text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">Single</SelectItem>
                                                    <SelectItem value="multiple">Multi</SelectItem>
                                                    <SelectItem value="opposite_multiple">Opp. Multi</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500"
                                                onClick={() => {
                                                    const newQuestions = editFormData.questions.filter((_, i) => i !== qIndex)
                                                    handleEditInputChange('questions', newQuestions)
                                                }}
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        {/* Answers */}
                                        <div className="pl-3 border-l-2 border-muted space-y-1">
                                            {question.ans && question.ans.map((answer, aIndex) => (
                                                <div key={aIndex} className="flex items-center gap-1">
                                                    <Input
                                                        value={answer.content}
                                                        onChange={(e) => {
                                                            const newQuestions = [...editFormData.questions]
                                                            newQuestions[qIndex].ans[aIndex].content = e.target.value
                                                            handleEditInputChange('questions', newQuestions)
                                                        }}
                                                        placeholder="Answer"
                                                        className="h-7 text-xs flex-1"
                                                    />
                                                    <Input
                                                        value={answer.persentage || ''}
                                                        onChange={(e) => {
                                                            const newQuestions = [...editFormData.questions]
                                                            newQuestions[qIndex].ans[aIndex].persentage = e.target.value
                                                            handleEditInputChange('questions', newQuestions)
                                                        }}
                                                        placeholder="%"
                                                        className="h-7 w-14 text-xs"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500"
                                                        onClick={() => {
                                                            const newQuestions = [...editFormData.questions]
                                                            newQuestions[qIndex].ans = newQuestions[qIndex].ans.filter((_, i) => i !== aIndex)
                                                            handleEditInputChange('questions', newQuestions)
                                                        }}
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    const newQuestions = [...editFormData.questions]
                                                    if (!newQuestions[qIndex].ans) newQuestions[qIndex].ans = []
                                                    newQuestions[qIndex].ans.push({ content: '', persentage: '', fixed: '' })
                                                    handleEditInputChange('questions', newQuestions)
                                                }}
                                            >
                                                <PlusIcon className="w-3 h-3 mr-1" />
                                                Add Answer
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">{t('noQuestions')}</p>
                        )}
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label className="text-sm">{t('productImages')}</Label>
                        {editFormData.imgs?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {editFormData.imgs.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative w-16 h-16 rounded-xs border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                        onClick={() => {
                                            setImageDialogProduct(editingProduct)
                                            setImageDialogImages(editFormData.imgs)
                                        }}
                                    >
                                        <Image
                                            src={normalizeImageUrl(img)}
                                            alt=""
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <ImageUpload
                            value={editFormData.imgs}
                            onChange={(urls) => handleEditInputChange('imgs', urls)}
                            multiple={true}
                            folder="tradein/products"
                            label=""
                            onDelete={deleteFileFromBucket}
                            compact={true}
                        />
                    </div>
                </div>

                {/* Panel Footer */}
                <div className="sticky bottom-0 flex items-center justify-between gap-2 p-4 border-t bg-background">
                    <Button type="button" variant="outline" size="sm" onClick={closeEditPanel}>
                        {t('cancel')}
                    </Button>
                    <div className="flex items-center gap-2">
                        {selectedIds.size > 1 && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={saving}
                                    onClick={() => {
                                        const selectedArray = Array.from(selectedIds)
                                        const currentIndex = selectedArray.indexOf(editingProduct.id)
                                        if (currentIndex > 0) {
                                            const prevProduct = products.find(p => p.id === selectedArray[currentIndex - 1])
                                            if (prevProduct) openEditPanel(prevProduct)
                                        }
                                    }}
                                >
                                    {`← ${t('prev')}`}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={saving}
                                    onClick={() => {
                                        const selectedArray = Array.from(selectedIds)
                                        const currentIndex = selectedArray.indexOf(editingProduct.id)
                                        if (currentIndex < selectedArray.length - 1) {
                                            const nextProduct = products.find(p => p.id === selectedArray[currentIndex + 1])
                                            if (nextProduct) openEditPanel(nextProduct)
                                        }
                                    }}
                                >
                                    Next →
                                </Button>
                            </>
                        )}
                        <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                            {saving ? (
                                <>
                                    <LoaderIcon className="w-4 h-4 animate-spin mr-1" />
                                    {t('saving')}
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-4 h-4 mr-1" />
                                    {t('save')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
