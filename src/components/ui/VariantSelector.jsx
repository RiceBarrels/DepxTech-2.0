"use client"

import { useState } from "react"
import { Badge } from '@/components/ui/badge'

export function VariantSelector({ variants = [] }) {
    const [selectedVariant, setSelectedVariant] = useState(null)

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">Variants</h3>
            <div className="space-y-3">
                {variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">
                            {variant.variant_type}:
                        </span>
                        <Badge
                            variant={selectedVariant === index ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedVariant(selectedVariant === index ? null : index)}
                        >
                            {variant.variant_title}
                        </Badge>
                    </div>
                ))}
            </div>
        </div>
    )
} 