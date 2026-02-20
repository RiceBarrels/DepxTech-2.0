"use client"

import { useEffect } from "react"
import { motion, useAnimate } from "framer-motion"
import { cn } from "@/lib/utils"

export function TextGenerateEffect({
  words,
  className,
  filter = false,
  duration = 0.4,
}) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    animate(
      scope.current,
      { opacity: 1 },
      { duration: duration ? duration : 0.4 }
    )
  }, [scope.current])

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="dark:text-white text-black text-2xl leading-snug tracking-wide">
          <motion.div ref={scope} style={{ opacity: 0 }}>
            {words}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
