import { cn } from "@/lib/utils"

export function TextGenerateEffect({
  words,
  className,
  filter = false,
  duration = 0.4,
}) {
  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="dark:text-white text-black text-2xl leading-snug tracking-wide">
          {words}
        </div>
      </div>
    </div>
  )
}
