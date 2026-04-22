import * as React from 'react'

const SCALE = [
  { tag: 'h1', className: 'text-5xl font-black leading-[1.05] tracking-tight', label: 'Display', size: 'text-5xl · 3rem' },
  { tag: 'h2', className: 'text-4xl font-bold leading-tight tracking-tight', label: 'H1', size: 'text-4xl · 2.25rem' },
  { tag: 'h3', className: 'text-3xl font-bold leading-tight tracking-tight', label: 'H2', size: 'text-3xl · 1.875rem' },
  { tag: 'h4', className: 'text-2xl font-semibold leading-snug', label: 'H3', size: 'text-2xl · 1.5rem' },
  { tag: 'h5', className: 'text-xl font-semibold leading-snug', label: 'H4', size: 'text-xl · 1.25rem' },
  { tag: 'h6', className: 'text-lg font-semibold leading-snug', label: 'H5', size: 'text-lg · 1.125rem' },
]

const BODY = [
  { className: 'text-base leading-relaxed', label: 'Body', size: 'text-base · 1rem' },
  { className: 'text-sm leading-relaxed text-muted-foreground', label: 'Small / Muted', size: 'text-sm · 0.875rem' },
  { className: 'text-xs text-muted-foreground uppercase tracking-widest', label: 'Label', size: 'text-xs · 0.75rem' },
  { className: 'font-mono text-sm text-muted-foreground', label: 'Mono', size: 'font-mono · 0.875rem' },
  { className: 'font-serif text-lg italic', label: 'Serif', size: 'font-serif · 1.125rem' },
]

const SAMPLE = 'Trade smart. Refurbish responsibly.'

function Row({ label, size, children }) {
  return (
    <div className="group flex flex-col gap-1 border-b py-5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6">
      <div className="flex w-full shrink-0 items-baseline justify-between sm:w-48">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="hidden font-mono text-[11px] text-muted-foreground/60 sm:inline">
          {size}
        </span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export function Typography() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sans</div>
          <div className="mt-3 font-sans text-4xl font-bold tracking-tight">Aa Bb Cc</div>
          <code className="mt-3 block font-mono text-[11px] text-muted-foreground">
            var(--font-sans) · Plus Jakarta Sans
          </code>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Serif</div>
          <div className="mt-3 font-serif text-4xl">Aa Bb Cc</div>
          <code className="mt-3 block font-mono text-[11px] text-muted-foreground">
            var(--font-serif) · Lora
          </code>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Mono</div>
          <div className="mt-3 font-mono text-4xl">Aa Bb Cc</div>
          <code className="mt-3 block font-mono text-[11px] text-muted-foreground">
            var(--font-mono) · IBM Plex Mono
          </code>
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6 sm:p-8">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Headings</h3>
        <div className="flex flex-col">
          {SCALE.map((s) => {
            const Tag = s.tag
            return (
              <Row key={s.label} label={s.label} size={s.size}>
                <Tag className={s.className}>{SAMPLE}</Tag>
              </Row>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6 sm:p-8">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Body & utility</h3>
        <div className="flex flex-col">
          {BODY.map((s) => (
            <Row key={s.label} label={s.label} size={s.size}>
              <p className={s.className}>{SAMPLE}</p>
            </Row>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6 sm:p-8">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Weights</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['light', 'font-light'],
            ['normal', 'font-normal'],
            ['medium', 'font-medium'],
            ['semibold', 'font-semibold'],
            ['bold', 'font-bold'],
            ['black', 'font-black'],
          ].map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-1 rounded-xl border bg-background p-4">
              <span className={`${cls} text-2xl`}>Aa</span>
              <code className="font-mono text-[10px] text-muted-foreground">{cls}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
