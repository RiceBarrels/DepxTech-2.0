"use client"

import * as React from "react"
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWebHaptics } from 'web-haptics/react'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const { trigger } = useWebHaptics()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <SunIcon className="h-[1.1rem] w-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => { trigger('selection'); setTheme("light") }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <SunIcon className="h-4 w-4" />
          <span>Light</span>
          <div className="flex-1" />
          {theme === "light" && <CheckIcon className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => { trigger('selection'); setTheme("dark") }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <MoonIcon className="h-4 w-4" />
          <span>Dark</span>
          <div className="flex-1" />
          {theme === "dark" && <CheckIcon className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => { trigger('selection'); setTheme("system") }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <MonitorIcon className="h-4 w-4" /> 
          <span>System</span>
          <div className="flex-1" /> 
          {theme === "system" && <CheckIcon className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
