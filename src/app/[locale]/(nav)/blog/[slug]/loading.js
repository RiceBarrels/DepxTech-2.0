import { Skeleton } from '@/components/ui/skeleton'

export default function BlogPostLoading() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-6 w-24 rounded-full mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-2/3 mb-6" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <Skeleton className="aspect-video rounded-2xl mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    </main>
  )
}
