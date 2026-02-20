import { Skeleton } from '@/components/ui/skeleton'

export default function BlogLoading() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero skeleton */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </div>

      {/* Category pills */}
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 flex gap-3 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Latest post hero card */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>

      {/* Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[16/10] rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
