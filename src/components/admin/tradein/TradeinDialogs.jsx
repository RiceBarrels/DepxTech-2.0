"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    XIcon,
    SaveIcon,
    LoaderIcon,
    ImageIcon,
} from 'lucide-react'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ImageUpload, deleteFileFromBucket } from "@/components/admin/ImageUpload"

const normalizeImageUrl = (img) => {
    if (!img) return ''
    if (typeof img === 'string') return img
    if (typeof img === 'object' && img.url) return img.url
    return ''
}

export function ImageDialog({
    imageDialogProduct,
    setImageDialogProduct,
    imageDialogImages,
    setImageDialogImages,
    handleImageDialogSave,
    savingImages,
}) {
    return (
        <Dialog open={!!imageDialogProduct} onOpenChange={(open) => { if (!open) setImageDialogProduct(null) }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Product Images — {imageDialogProduct?.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {imageDialogImages.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {imageDialogImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg border bg-muted overflow-hidden group">
                                    <Image
                                        src={normalizeImageUrl(img)}
                                        alt=""
                                        fill
                                        className="object-contain p-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImgs = imageDialogImages.filter((_, i) => i !== idx)
                                            setImageDialogImages(newImgs)
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No images
                        </div>
                    )}
                    <ImageUpload
                        value={imageDialogImages}
                        onChange={(urls) => setImageDialogImages(urls)}
                        multiple={true}
                        folder="tradein/products"
                        label="Upload Images"
                        onDelete={deleteFileFromBucket}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setImageDialogProduct(null)}>Cancel</Button>
                        <Button onClick={handleImageDialogSave} disabled={savingImages}>
                            {savingImages ? (
                                <>
                                    <LoaderIcon className="w-4 h-4 animate-spin mr-1" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-4 h-4 mr-1" />
                                    Save Images
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function BulkTemplateDialog({
    open,
    onOpenChange,
    selectedCount,
    templates,
    loadingTemplates,
    applyingTemplate,
    handleBulkApplyTemplate,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Apply Template to {selectedCount} Product{selectedCount !== 1 ? 's' : ''}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-[300px] overflow-y-auto py-2">
                    {loadingTemplates ? (
                        <div className="flex items-center justify-center py-8">
                            <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : templates.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4 text-sm">No templates with questions found.</p>
                    ) : (
                        templates.map((tmpl) => (
                            <button
                                key={tmpl.id}
                                className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
                                onClick={() => handleBulkApplyTemplate(tmpl.id)}
                                disabled={applyingTemplate}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{tmpl.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {tmpl.questions?.length || 0} questions
                                    </Badge>
                                </div>
                                {tmpl.questions?.length > 0 && (
                                    <div className="mt-1 text-xs text-muted-foreground truncate">
                                        {tmpl.questions.slice(0, 2).map(q => q.title).join(', ')}
                                        {tmpl.questions.length > 2 && ` +${tmpl.questions.length - 2} more`}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
