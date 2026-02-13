"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { X, Minus, Square, RotateCcw } from 'lucide-react'

// Global windows state
let windowsState = {
  windows: [],
  nextId: 1,
  zIndexCounter: 1000
}

const windowsListeners = new Set()

function notifyWindowsChange() {
  windowsListeners.forEach(listener => listener([...windowsState.windows]))
}

// Dock component for minimized windows
function WindowsDock({ windows, onAction }) {
  const minimizedWindows = useMemo(() => 
    windows.filter(w => w.minimized), 
    [windows]
  )
  
  if (minimizedWindows.length === 0) {
    return null
  }

  return (
    <motion.div 
      className="fixed left-4 top-1/2 -translate-y-1/2 pointer-events-auto z-50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {minimizedWindows.map((window, index) => (
              <motion.div
                key={window.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                layout
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-14 w-14 p-2 flex flex-col items-center justify-center group hover:bg-muted/80"
                  onClick={() => onAction(window.id, 'minimize')} // Toggle minimize
                  title={window.title}
                >
                  {window.icon ? (
                    <div className="flex-shrink-0 mb-1">
                      {React.cloneElement(window.icon, { className: "h-8 w-8" })}
                    </div>
                  ) : (
                    <div className="w-4 h-4 bg-muted rounded mb-1" />
                  )}
                  <span className="text-[8px] truncate w-full text-center">
                    {window.title}
                  </span>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export function WindowsLayer() {
  const [windows, setWindows] = useState([])

  useEffect(() => {
    const updateWindows = (newWindows) => {
      setWindows(newWindows)
    }
    
    windowsListeners.add(updateWindows)
    updateWindows([...windowsState.windows])
    
    return () => {
      windowsListeners.delete(updateWindows)
    }
  }, [])

  const handleWindowAction = useCallback((windowId, action, data) => {
    const windowIndex = windowsState.windows.findIndex(w => w.id === windowId)
    if (windowIndex === -1) return

    const updatedWindows = [...windowsState.windows]
    const window = updatedWindows[windowIndex]

    switch (action) {
      case 'close':
        updatedWindows.splice(windowIndex, 1)
        break
      case 'minimize':
        window.minimized = !window.minimized
        if (!window.minimized) {
          // When restoring from dock, bring to front
          window.zIndex = ++windowsState.zIndexCounter
        }
        break
      case 'maximize':
        if (window.maximized) {
          window.maximized = false
          window.position = window.restorePosition
          window.size = window.restoreSize
        } else {
          window.restorePosition = window.position
          window.restoreSize = window.size
          window.maximized = true
          window.position = { x: 0, y: 0 }
          window.size = { width: '100vw', height: '100vh' }
        }
        break
      case 'focus':
        window.zIndex = ++windowsState.zIndexCounter
        break
      case 'move':
        window.position = data
        break
      case 'resize':
        window.size = data
        break
    }

    windowsState.windows = updatedWindows
    notifyWindowsChange()
  }, [])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence mode="popLayout">
          {windows.map((window) => (
            <WindowComponent
              key={window.id}
              window={window}
              windows={windows}
              onAction={handleWindowAction}
            />
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {windows.filter(w => w.minimized).length > 0 && (
          <WindowsDock windows={windows} onAction={handleWindowAction} />
        )}
      </AnimatePresence>
    </>
  )
}

function WindowComponent({ window, windows, onAction }) {
  const windowRef = useRef(null)
  const dragRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  // Memoize dock position calculation for better performance
  const dockPosition = useMemo(() => {
    const minimizedWindows = windows.filter(w => w.minimized)
    const windowIndex = minimizedWindows.findIndex(w => w.id === window.id)
    
    return {
      left: 53 - 600 / 2,
      top: `calc(50vh - 200px - ${windowIndex} * 66px + 10px)`,
      scale: 0.1
    }
  }, [windows, window.id])

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.window-controls')) return
    
    onAction(window.id, 'focus')
    setIsDragging(true)
    setDragStart({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    })
  }, [window.id, window.position, onAction])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || window.maximized) return
    
    const newX = e.clientX - dragStart.x
    const newY = Math.max(0, e.clientY - dragStart.y)
    
    onAction(window.id, 'move', { x: newX, y: newY })
  }, [isDragging, dragStart, window.id, window.maximized, onAction])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection('')
  }, [])

  const handleResizeStart = useCallback((e, direction) => {
    e.stopPropagation()
    onAction(window.id, 'focus')
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: typeof window.size.width === 'number' ? window.size.width : parseInt(window.size.width),
      height: typeof window.size.height === 'number' ? window.size.height : parseInt(window.size.height)
    })
  }, [window.id, window.size, onAction])

  const handleResizeMove = useCallback((e) => {
    if (!isResizing || window.maximized) return

    const deltaX = e.clientX - resizeStart.x
    const deltaY = e.clientY - resizeStart.y
    
    let newWidth = resizeStart.width
    let newHeight = resizeStart.height
    let newX = window.position.x
    let newY = window.position.y

    // Minimum size constraints
    const minWidth = 200
    const minHeight = 150

    if (resizeDirection.includes('e')) {
      newWidth = Math.max(minWidth, resizeStart.width + deltaX)
    }
    if (resizeDirection.includes('w')) {
      newWidth = Math.max(minWidth, resizeStart.width - deltaX)
      if (newWidth > minWidth) {
        newX = window.position.x + deltaX
      }
    }
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(minHeight, resizeStart.height + deltaY)
    }
    if (resizeDirection.includes('n')) {
      newHeight = Math.max(minHeight, resizeStart.height - deltaY)
      if (newHeight > minHeight) {
        newY = Math.max(0, window.position.y + deltaY)
      }
    }

    // Update window size and position
    onAction(window.id, 'resize', { width: newWidth, height: newHeight })
    if (newX !== window.position.x || newY !== window.position.y) {
      onAction(window.id, 'move', { x: newX, y: newY })
    }
  }, [isResizing, resizeDirection, resizeStart, window.id, window.position, window.maximized, onAction])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleResizeMove, handleMouseUp])

  const windowStyle = {
    position: 'absolute',
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
    zIndex: window.zIndex
  }

  return (
    <motion.div
      style={windowStyle}
      animate={window.minimized ? {
        left: dockPosition.left,
        top: dockPosition.top,
        scale: dockPosition.scale,
        width: 600,
        height: 400,
        opacity: 0
      } : {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1
      }}
      transition={isResizing || isDragging ? {
        duration: 0
      } : {
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      layout
      layoutId={`window-${window.id}`}
      className={cn(
        "pointer-events-auto",
        window.minimized && "*:pointer-events-none"
      )}
    >
      <Card
        ref={windowRef}
        className={cn(
          "shadow-2xl border-2 overflow-hidden p-0 flex flex-col h-full",
          window.maximized ? "rounded-none" : "rounded-lg",
          isDragging && "cursor-move",
          isResizing && "cursor-se-resize"
        )}
        onMouseDown={() => onAction(window.id, 'focus')}
      >
      <CardHeader
        ref={dragRef}
        className={cn(
          "flex flex-row items-center justify-between p-2 bg-muted/50 cursor-move"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {window.icon && (
            <div className="flex-shrink-0">
              {window.icon}
            </div>
          )}
          <h3 className="font-semibold text-sm truncate">
            {window.title}
          </h3>
        </div>
        
        <div className="window-controls flex items-center space-x-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => onAction(window.id, 'minimize')}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => onAction(window.id, 'maximize')}
          >
            {window.maximized ? (
              <RotateCcw className="h-3 w-3" />
            ) : (
              <Square className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onAction(window.id, 'close')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 h-full overflow-auto">
        <div className="h-full">
          {window.content}
        </div>
      </CardContent>
      
      {/* Resize handles */}
      {!window.maximized && !window.minimized && (
        <>
          {/* Corner resize handles */}
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div 
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          
          {/* Edge resize handles */}
          <div 
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div 
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize bg-transparent hover:bg-muted/50" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </Card>
    </motion.div>
  )
}

export function openWindow(title, content, options = {icon: null}) {
  const defaultOptions = {
    width: 600,
    height: 400,
    x: Math.random() * 200 + 100,
    y: Math.random() * 100 + 100,
    icon: options.icon,
    resizable: true,
    maximizable: true,
    minimizable: true
  }

  const finalOptions = { ...defaultOptions, ...options }

  const newWindow = {
    id: windowsState.nextId++,
    title,
    content,
    position: { x: finalOptions.x, y: finalOptions.y },
    size: { width: finalOptions.width, height: finalOptions.height },
    zIndex: ++windowsState.zIndexCounter,
    minimized: false,
    maximized: false,
    icon: finalOptions.icon,
    resizable: finalOptions.resizable,
    maximizable: finalOptions.maximizable,
    minimizable: finalOptions.minimizable,
    restorePosition: null,
    restoreSize: null
  }

  windowsState.windows.push(newWindow)
  notifyWindowsChange()

  return newWindow.id
}

export function closeWindow(windowId) {
  const windowIndex = windowsState.windows.findIndex(w => w.id === windowId)
  if (windowIndex !== -1) {
    windowsState.windows.splice(windowIndex, 1)
    notifyWindowsChange()
  }
}

export function closeAllWindows() {
  windowsState.windows = []
  notifyWindowsChange()
}

export function getOpenWindows() {
  return [...windowsState.windows]
}