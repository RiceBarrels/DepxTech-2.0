"use client"

import { useState } from "react"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, PackageIcon } from 'lucide-react'
import { useWebHaptics } from 'web-haptics/react'

export function ImageGallery({ images = [], title = "" }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const { trigger } = useWebHaptics()

    const nextImage = () => {
        if (images.length > 1) {
            trigger('light')
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }
    }

    const prevImage = () => {
        if (images.length > 1) {
            trigger('light')
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
        }
    }

    return (
        <div className="space-y-4">
            <Card className="p-0">
                <CardContent className="p-0">
                    {images.length > 0 ? (
                        <div className="relative">
                            <div className="aspect-square w-full overflow-hidden rounded-lg">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={title}
                                    className="w-full h-full object-cover rounded-xl"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.svg'
                                    }}
                                />
                            </div>
                            
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                        onClick={nextImage}
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                            
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-square w-full flex items-center justify-center bg-gray-100 rounded-lg">
                            <PackageIcon className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Thumbnail Images */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                                currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                            }`}
                        >
                            <img
                                src={img}
                                alt={`${title} ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.svg'
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
} 