"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function CartLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Shopping Cart</h1>
                <Badge variant="outline">
                    <Skeleton className="w-1 h-3" /> <span>item</span>
                </Badge>
            </div>


        </div>
    )
}