"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CartLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48" />
                <Badge variant="outline">
                    <Skeleton className="h-4 w-12" />
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items Skeleton */}
                <div className="lg:col-span-2 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    {/* Product Image Skeleton */}
                                    <div className="flex-shrink-0">
                                        <Skeleton className="w-20 h-20 rounded-lg" />
                                    </div>

                                    {/* Product Details Skeleton */}
                                    <div className="flex-1 min-w-0">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-24 mb-3" />
                                        <Skeleton className="h-5 w-20 mb-3" />
                                        
                                        {/* Quantity Controls Skeleton */}
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-10 w-16" />
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-10 w-10 rounded-full ml-auto" />
                                        </div>
                                    </div>

                                    {/* Subtotal Skeleton */}
                                    <div className="text-right">
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Clear Cart Button Skeleton */}
                    <div className="pt-4">
                        <Skeleton className="h-10 w-full rounded-full" />
                    </div>
                </div>

                {/* Order Summary Skeleton */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="h-px bg-border" />
                            
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-6 w-20" />
                            </div>

                            <div className="flex flex-col space-y-2 pt-4">
                                <Skeleton className="h-10 w-full rounded-full" />
                                <Skeleton className="h-10 w-full rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}