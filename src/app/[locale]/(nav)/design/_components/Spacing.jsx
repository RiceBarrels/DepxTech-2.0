import * as React from 'react'

const SCALE = [
  { step: 1, token: 'p-1', px: '4px' },
  { step: 2, token: 'p-2', px: '8px' },
  { step: 3, token: 'p-3', px: '12px' },
  { step: 4, token: 'p-4', px: '16px' },
  { step: 6, token: 'p-6', px: '24px' },
  { step: 8, token: 'p-8', px: '32px' },
  { step: 12, token: 'p-12', px: '48px' },
  { step: 16, token: 'p-16', px: '64px' },
  { step: 24, token: 'p-24', px: '96px' },
]

const RADIUS = [
  { label: 'sm', cls: 'rounded-sm', note: 'calc(var(--radius) − 4px)' },
  { label: 'md', cls: 'rounded-md', note: 'calc(var(--radius) − 2px)' },
  { label: 'lg', cls: 'rounded-lg', note: 'var(--radius)' },
  { label: 'xl', cls: 'rounded-xl', note: 'calc(var(--radius) + 4px)' },
  { label: '2xl', cls: 'rounded-2xl', note: 'calc(var(--radius) + 8px)' },
  { label: '3xl', cls: 'rounded-3xl', note: 'calc(var(--radius) + 12px)' },
  { label: 'full', cls: 'rounded-full', note: 'pill / circle' },
]

const SHADOWS = [
  { label: '2xs', cls: 'shadow-2xs' },
  { label: 'xs', cls: 'shadow-xs' },
  { label: 'sm', cls: 'shadow-sm' },
  { label: 'md', cls: 'shadow-md' },
  { label: 'lg', cls: 'shadow-lg' },
  { label: 'xl', cls: 'shadow-xl' },
  { label: '2xl', cls: 'shadow-2xl' },
]

export function Spacing() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl border bg-card p-6 sm:p-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-lg font-semibold">Spacing scale</h3>
          <code className="font-mono text-[11px] text-muted-foreground">var(--spacing) = 0.27rem</code>
        </div>
        <div className="flex flex-col gap-3">
          {SCALE.map((s) => (
            <div key={s.token} className="flex items-center gap-4">
              <code className="w-14 font-mono text-xs text-muted-foreground">{s.token}</code>
              <span className="w-12 font-mono text-[11px] text-muted-foreground/70">{s.px}</span>
              <div className="flex-1">
                <div
                  className="h-4 rounded-full bg-primary"
                  style={{ width: `${Math.min(s.step * 8, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold">Radius</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {RADIUS.map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-2">
                <div className={`size-14 border-2 border-foreground/10 bg-primary/15 ${r.cls}`} />
                <code className="font-mono text-[11px]">{r.label}</code>
                <span className="text-center font-mono text-[10px] text-muted-foreground/70">
                  {r.note}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold">Shadows</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SHADOWS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className={`size-14 rounded-2xl bg-card border ${s.cls}`} />
                <code className="font-mono text-[11px]">{s.label}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
