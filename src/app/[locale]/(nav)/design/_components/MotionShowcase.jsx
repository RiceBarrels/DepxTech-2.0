'use client'

import * as React from 'react'
import {
  GSAPStagger, GSAPReveal, GSAPCounter, GSAPParallax,
} from '@/components/ui/scroll-animation-gsap'
import {
  ScrollStagger, ScrollReveal, ScrollFade, ScrollScale,
} from '@/components/ui/scroll-animation'
import { RotateCcw, Sparkles, Zap } from 'lucide-react'

function Card({ children, tone = 'default' }) {
  const palette =
    tone === 'primary'
      ? 'bg-primary text-primary-foreground'
      : tone === 'accent'
      ? 'bg-accent text-accent-foreground'
      : 'bg-card text-card-foreground border'
  return (
    <div
      className={`flex h-16 w-full max-w-xs items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-xs ${palette}`}
    >
      {children}
    </div>
  )
}

function Demo({ title, code, tag, render }) {
  const [k, setK] = React.useState(0)
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border bg-card">
      <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{title}</span>
            {tag ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-primary">
                {tag}
              </span>
            ) : null}
          </div>
          <code className="truncate font-mono text-[11px] text-muted-foreground">{code}</code>
        </div>
        <button
          type="button"
          onClick={() => setK((n) => n + 1)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <RotateCcw className="size-3" /> Replay
        </button>
      </div>
      <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/40 p-8">
        <div key={k} className="w-full">{render()}</div>
      </div>
    </div>
  )
}

function GroupHeading({ eyebrow, title, caption }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </div>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="hidden max-w-sm text-right text-xs text-muted-foreground sm:block">
        {caption}
      </p>
    </div>
  )
}

export function MotionShowcase() {
  return (
    <div className="flex flex-col gap-12">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Scroll-triggered motion</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          The site ships two scroll libraries that coexist:
          <strong className="mx-1 text-foreground">GSAP ScrollTrigger</strong> powers the Home and
          Trade heros (heavier choreography, scrub effects, pinning);{' '}
          <strong className="mx-1 text-foreground">framer-motion</strong> covers lighter fades across
          About, Blog and inner pages. Hit <strong>Replay</strong> to re-run any demo.
        </p>
      </div>

      {/* GSAP */}
      <div>
        <GroupHeading
          eyebrow="gsap · ScrollTrigger"
          title="GSAP primitives"
          caption="Imported from @/components/ui/scroll-animation-gsap"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Demo
            tag="gsap"
            title="GSAPStagger"
            code='<GSAPStagger from="bottom" staggerChildren={0.12} />'
            render={() => (
              <GSAPStagger staggerChildren={0.12} from="bottom" className="flex flex-col gap-3">
                <Card>from="bottom"</Card>
                <Card tone="primary">staggered child</Card>
                <Card tone="accent">staggered child</Card>
                <Card>final child</Card>
              </GSAPStagger>
            )}
          />
          <Demo
            tag="gsap"
            title="GSAPReveal — from directions"
            code='<GSAPReveal from="top | left | right | blur | scale" />'
            render={() => (
              <div className="grid w-full grid-cols-2 gap-3">
                <GSAPReveal from="top"><Card>from="top"</Card></GSAPReveal>
                <GSAPReveal from="left"><Card tone="accent">from="left"</Card></GSAPReveal>
                <GSAPReveal from="right"><Card tone="primary">from="right"</Card></GSAPReveal>
                <GSAPReveal from="blur"><Card>from="blur"</Card></GSAPReveal>
                <GSAPReveal from="scale" className="col-span-2">
                  <Card tone="primary">from="scale"</Card>
                </GSAPReveal>
              </div>
            )}
          />
          <Demo
            tag="gsap"
            title="GSAPCounter"
            code='<GSAPCounter value={5000} suffix="+" />'
            render={() => (
              <div className="grid w-full grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-4xl font-black tracking-tight">
                    <GSAPCounter value={5000} suffix="+" duration={1.8} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Devices</div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight">
                    <GSAPCounter value={98} suffix="%" duration={1.4} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Happy</div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight">
                    <GSAPCounter value={48} suffix="h" duration={1.2} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Payout</div>
                </div>
              </div>
            )}
          />
          <Demo
            tag="gsap"
            title="GSAPParallax"
            code='<GSAPParallax speed={0.4} /> · ties to scrub'
            render={() => (
              <div className="flex w-full items-center justify-center gap-4">
                <GSAPParallax speed={0.8}>
                  <Card tone="accent">speed 0.8</Card>
                </GSAPParallax>
                <GSAPParallax speed={0.3}>
                  <Card tone="primary">speed 0.3</Card>
                </GSAPParallax>
              </div>
            )}
          />
        </div>

        <div className="mt-6 rounded-3xl border bg-card p-6 sm:p-8">
          <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Zap className="size-4 text-primary" /> Usage
          </h4>
          <p className="mb-4 text-sm text-muted-foreground">
            GSAP primitives auto-detect the nearest scrollable ancestor (so they work inside the
            <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono">#scrollable-content</code>
            custom scroller) and register <code className="rounded bg-muted px-1 py-0.5 font-mono">ScrollTrigger</code> for you.
          </p>
          <pre className="overflow-x-auto rounded-2xl border bg-background p-4 font-mono text-xs leading-relaxed">
{`import { GSAPStagger, GSAPReveal } from '@/components/ui/scroll-animation-gsap'

<GSAPStagger staggerChildren={0.11} from="bottom">
  <h1>Instant quotes</h1>
  <p>Refurbish responsibly.</p>
  <Button>Start now</Button>
</GSAPStagger>`}
          </pre>
        </div>
      </div>

      {/* Framer Motion */}
      <div>
        <GroupHeading
          eyebrow="framer-motion"
          title="Framer Motion primitives"
          caption="Lightweight fades used on inner pages — imported from @/components/ui/scroll-animation"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Demo
            tag="motion"
            title="ScrollStagger + ScrollReveal"
            code='<ScrollStagger><ScrollReveal animation="…" /></ScrollStagger>'
            render={() => (
              <ScrollStagger staggerChildren={0.12} amount={0.1} className="flex flex-col gap-3">
                <ScrollReveal animation="top"><Card>animation="top"</Card></ScrollReveal>
                <ScrollReveal animation="blur"><Card tone="primary">animation="blur"</Card></ScrollReveal>
                <ScrollReveal animation="left"><Card tone="accent">animation="left"</Card></ScrollReveal>
                <ScrollReveal animation="right"><Card>animation="right"</Card></ScrollReveal>
              </ScrollStagger>
            )}
          />
          <Demo
            tag="motion"
            title="ScrollFade"
            code='animation="bottom | top | left | right"'
            render={() => (
              <div className="grid w-full grid-cols-2 gap-3">
                <ScrollFade animation="bottom"><Card>bottom</Card></ScrollFade>
                <ScrollFade animation="top" delay={0.1}><Card tone="primary">top</Card></ScrollFade>
                <ScrollFade animation="left" delay={0.2}><Card tone="accent">left</Card></ScrollFade>
                <ScrollFade animation="right" delay={0.3}><Card>right</Card></ScrollFade>
              </div>
            )}
          />
          <Demo
            tag="motion"
            title="ScrollScale"
            code="scales from 0.9 → 1 on enter"
            render={() => (
              <div className="flex w-full items-center justify-center">
                <ScrollScale>
                  <div className="flex size-40 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
                    <Sparkles className="size-10" />
                  </div>
                </ScrollScale>
              </div>
            )}
          />
          <Demo
            tag="motion"
            title="Inline reveal"
            code="standalone ScrollReveal (no parent)"
            render={() => (
              <div className="flex w-full flex-col gap-3">
                <ScrollReveal animation="blur" delay={0.05}><Card>standalone blur</Card></ScrollReveal>
                <ScrollReveal animation="bottom" delay={0.15}><Card tone="primary">standalone bottom</Card></ScrollReveal>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
