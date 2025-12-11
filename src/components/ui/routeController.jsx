"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, RefreshCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LayoutDashboardIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Minimize2Icon } from "lucide-react"
import { Maximize2Icon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useSafeArea } from "@/components/safe-area"
export default function RouteController() {
    const router = useTransitionRouter()
    const safeArea = useSafeArea()
    const [minimized, setMinimized] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('minimizedPanel')
                return stored === 'true'
            } catch (error) {
                console.error('Error reading localStorage:', error)
                return false
            }
        }
        return false
    })
    const [isHover, setIsHover] = useState(false)
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('minimizedPanel', String(minimized))
            } catch (error) {
                console.error('Error writing to localStorage:', error)
            }
        }
    }, [minimized])

    return (
        <div 
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="flex items-center gap-2 p-2 bg-background/50 backdrop-blur-sm rounded-lg fixed top-2 left-2 z-10 shadow-lg h-14 z-20"style={{ 
                viewTransitionName: 'route-controller',
                top: `${4 + safeArea.top}px`,

        }}>
            <AnimatePresence mode="popLayout">
                {!minimized && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 30,
                        mass: 1.5
                    }}
                    className="flex items-center gap-2"
                    layout
                >
                    {
                        <Button onClick={() => router.back()} variant="ghost" size="icon"><ChevronLeftIcon className="w-4 h-4" /></Button>
                    }
                    
                    {
                        <Button onClick={() => router.forward()} variant="ghost" size="icon"><ChevronRightIcon className="w-4 h-4" /></Button>
                    }
                    <Button onClick={() => router.refresh()} variant="ghost" size="icon"><RefreshCcwIcon className="w-4 h-4" /></Button>
                    
                    <Button onClick={() => router.push('/')} variant="ghost" size="icon"><HomeIcon className="w-4 h-4" /></Button>
                    <Button onClick={() => router.push('/admin')} variant="ghost"><LayoutDashboardIcon className="w-4 h-4" />Dashboard</Button>
                </motion.div>
                )}
            </AnimatePresence>
            {(isHover || !minimized) ?
                <Button onClick={() => setMinimized(!minimized)} variant="ghost" size="icon">
                    {minimized ? <Maximize2Icon className="w-4 h-4" /> : <Minimize2Icon className="w-4 h-4" />}
                </Button> 
                :
                <ChevronRightIcon strokeWidth={1.5} className="w-3 h-4"/>

            }

        </div>
    )
}