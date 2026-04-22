'use client'

import * as React from 'react'

const SECTIONS = [
  { id: 'color', label: 'Color' },
  { id: 'typography', label: 'Typography' },
  { id: 'space', label: 'Space & radius' },
  { id: 'components', label: 'Components' },
  { id: 'icons', label: 'Icons' },
  { id: 'motion', label: 'Motion' },
]

export function SectionNav() {
  const [active, setActive] = React.useState('color')

  React.useEffect(() => {
    const scroller = document.getElementById('scrollable-content') || window
    const getOffset = (id) => {
      const el = document.getElementById(id)
      if (!el) return Infinity
      const rect = el.getBoundingClientRect()
      return rect.top
    }
    const onScroll = () => {
      let current = SECTIONS[0].id
      for (const s of SECTIONS) {
        if (getOffset(s.id) - 140 <= 0) current = s.id
      }
      setActive(current)
    }
    onScroll()
    const target = scroller === window ? window : scroller
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [])

  const jump = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const scroller = document.getElementById('scrollable-content')
    const offset = 96
    if (scroller) {
      const top = el.getBoundingClientRect().top + scroller.scrollTop - offset
      scroller.scrollTo({ top, behavior: 'smooth' })
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-16 z-20 -mx-4 mb-8 overflow-x-auto border-b bg-background/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-1 whitespace-nowrap">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => jump(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              active === s.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
