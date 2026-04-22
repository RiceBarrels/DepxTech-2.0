'use client'

import * as React from 'react'
import { Copy, Check } from 'lucide-react'

const TOKENS = [
  { group: 'Surfaces', tokens: [
    { name: 'background', var: '--background', note: 'Page background' },
    { name: 'foreground', var: '--foreground', note: 'Primary text' },
    { name: 'card', var: '--card', note: 'Card surface' },
    { name: 'card-foreground', var: '--card-foreground', note: 'Text on cards' },
    { name: 'popover', var: '--popover', note: 'Popover surface' },
    { name: 'popover-foreground', var: '--popover-foreground', note: 'Text on popovers' },
  ]},
  { group: 'Brand & Actions', tokens: [
    { name: 'primary', var: '--primary', note: 'Brand / CTAs' },
    { name: 'primary-foreground', var: '--primary-foreground', note: 'Text on primary' },
    { name: 'secondary', var: '--secondary', note: 'Muted action surface' },
    { name: 'secondary-foreground', var: '--secondary-foreground', note: 'Text on secondary' },
    { name: 'accent', var: '--accent', note: 'Accent highlight' },
    { name: 'accent-foreground', var: '--accent-foreground', note: 'Text on accent' },
    { name: 'destructive', var: '--destructive', note: 'Danger / errors' },
    { name: 'destructive-foreground', var: '--destructive-foreground', note: 'Text on destructive' },
  ]},
  { group: 'Neutrals & Support', tokens: [
    { name: 'muted', var: '--muted', note: 'Subtle background' },
    { name: 'muted-foreground', var: '--muted-foreground', note: 'Secondary text' },
    { name: 'border', var: '--border', note: 'Borders' },
    { name: 'input', var: '--input', note: 'Input borders' },
    { name: 'ring', var: '--ring', note: 'Focus ring' },
  ]},
  { group: 'Sidebar', tokens: [
    { name: 'sidebar', var: '--sidebar' },
    { name: 'sidebar-foreground', var: '--sidebar-foreground' },
    { name: 'sidebar-primary', var: '--sidebar-primary' },
    { name: 'sidebar-primary-foreground', var: '--sidebar-primary-foreground' },
    { name: 'sidebar-accent', var: '--sidebar-accent' },
    { name: 'sidebar-accent-foreground', var: '--sidebar-accent-foreground' },
    { name: 'sidebar-border', var: '--sidebar-border' },
    { name: 'sidebar-ring', var: '--sidebar-ring' },
  ]},
  { group: 'Charts', tokens: [
    { name: 'chart-1', var: '--chart-1' },
    { name: 'chart-2', var: '--chart-2' },
    { name: 'chart-3', var: '--chart-3' },
    { name: 'chart-4', var: '--chart-4' },
    { name: 'chart-5', var: '--chart-5' },
  ]},
]

function oklchToHex(oklchStr) {
  if (typeof window === 'undefined') return ''
  try {
    const probe = document.createElement('div')
    probe.style.color = oklchStr
    probe.style.display = 'none'
    document.body.appendChild(probe)
    const rgb = getComputedStyle(probe).color
    document.body.removeChild(probe)
    const m = rgb.match(/\d+(?:\.\d+)?/g)
    if (!m) return ''
    const [r, g, b] = m.slice(0, 3).map((n) => Math.round(parseFloat(n)))
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()
  } catch {
    return ''
  }
}

function Swatch({ name, cssVar, note }) {
  const [value, setValue] = React.useState('')
  const [hex, setHex] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (!ref.current) return
    const raw = getComputedStyle(ref.current).getPropertyValue(cssVar).trim()
    setValue(raw)
    setHex(oklchToHex(raw))
  }, [cssVar])

  const copy = () => {
    navigator.clipboard?.writeText(cssVar)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div
      ref={ref}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-shadow hover:shadow-md"
    >
      <div
        className="h-24 w-full border-b"
        style={{ background: `var(${cssVar})` }}
        aria-label={name}
      />
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{name}</span>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            title="Copy CSS variable"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
        <code className="truncate font-mono text-[11px] text-muted-foreground">
          {cssVar}
        </code>
        <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-muted-foreground/80">
          <span className="rounded bg-muted px-1.5 py-0.5">{hex || '…'}</span>
          <span className="truncate">{value || 'loading…'}</span>
        </div>
        {note ? <p className="mt-1 text-[11px] text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  )
}

export function ColorSystem() {
  const [mode, setMode] = React.useState('current')

  React.useEffect(() => {
    const root = document.documentElement
    const container = document.getElementById('design-color-preview')
    if (!container) return
    container.classList.remove('dark')
    if (mode === 'dark') container.classList.add('dark')
    if (mode === 'light') container.classList.remove('dark')
    if (mode === 'current') {
      const isDark = root.classList.contains('dark')
      if (isDark) container.classList.add('dark')
    }
  }, [mode])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Tokens are defined in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">src/app/globals.css</code>.
          </h3>
        </div>
        <div className="inline-flex rounded-full border bg-card p-1 text-xs shadow-xs">
          {['current', 'light', 'dark'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1.5 capitalize transition-colors cursor-pointer ${
                mode === m
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div id="design-color-preview" className="flex flex-col gap-10 rounded-3xl bg-background p-6 sm:p-8 border">
        {TOKENS.map((group) => (
          <section key={group.group} className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">{group.group}</h3>
              <span className="text-xs text-muted-foreground">
                {group.tokens.length} tokens
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.tokens.map((t) => (
                <Swatch key={t.var} name={t.name} cssVar={t.var} note={t.note} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
