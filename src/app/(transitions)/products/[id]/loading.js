"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import TopNav from "@/components/ui/topNav"
// ProductDetails Skeleton
function ProductDetailsSkeleton() {
    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    <Card className="p-0">
                        <CardContent className="p-0">
                            <Skeleton className="aspect-square w-full rounded-lg" />
                        </CardContent>
                    </Card>
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="w-16 h-16 rounded" />
                        ))}
                    </div>
                </div>

                {/* Product Information Skeleton */}
                <div className="space-y-6">
                    <div className="flex flex-col py-8">
                        {/* Title */}
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        
                        {/* Price and Stock */}
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        {/* Categories */}
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="w-4 h-4" />
                            <div className="flex flex-wrap gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-16" />
                                ))}
                            </div>
                        </div>

                        {/* Views */}
                        <div className="flex items-center gap-1 mb-4">
                            <Skeleton className="w-4 h-4" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-gray-200" />

                    {/* Description */}
                    <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-gray-200" />

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Recommends Skeleton
function RecommendsSkeleton() {
    return (
        <div className="mt-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, index) => (
                            <Card key={index} className="overflow-hidden">
                                <Skeleton className="aspect-square w-full" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoadingPage(){
    return (
        <div className='p-4 flex flex-col items-center justify-center'>
            <TopNav />
            <ProductDetailsSkeleton />
            <RecommendsSkeleton />
        </div>
    )
}