import { ScrollReveal, ScrollStagger } from '@/components/ui/scroll-animation'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Palette, Type, Ruler, Boxes, Shapes, Waves } from 'lucide-react'
import { ColorSystem } from './_components/ColorSystem'
import { Typography } from './_components/Typography'
import { Spacing } from './_components/Spacing'
import { ComponentShowcase } from './_components/ComponentShowcase'
import { IconGallery } from './_components/IconGallery'
import { MotionShowcase } from './_components/MotionShowcase'
import { SectionNav } from './_components/SectionNav'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const { buildPageMeta } = await import('@/lib/seo')
  return buildPageMeta(locale, {
    titleKey: 'designTitle',
    descKey: 'designDescription',
    path: '/design',
  })
}

const SECTIONS = [
  { id: 'color',      icon: Palette,  eyebrow: '01',  title: 'Color',               caption: 'Tokens that drive every surface.' },
  { id: 'typography', icon: Type,     eyebrow: '02',  title: 'Typography',          caption: 'Plus Jakarta Sans · Lora · IBM Plex Mono.' },
  { id: 'space',      icon: Ruler,    eyebrow: '03',  title: 'Space, radius & elevation', caption: 'Rhythm on a 4px grid.' },
  { id: 'components', icon: Boxes,    eyebrow: '04',  title: 'Components',          caption: 'The building blocks shipped in /components/ui.' },
  { id: 'icons',      icon: Shapes,   eyebrow: '05',  title: 'Icons',               caption: 'A curated subset of lucide-react.' },
  { id: 'motion',     icon: Waves,    eyebrow: '06',  title: 'Motion',              caption: 'GSAP + framer-motion scroll primitives.' },
]

function SectionHeader({ eyebrow, title, caption, Icon }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border bg-card shadow-xs sm:flex">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow} · {title.split(' ')[0]}
          </div>
          <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{caption}</p>
        </div>
      </div>
    </div>
  )
}

export default async function DesignPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(60% 60% at 20% 10%, var(--primary) 0, transparent 60%), radial-gradient(50% 50% at 90% 20%, var(--accent) 0, transparent 55%)',
            opacity: 0.22,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in oklab, var(--border) 60%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 60%, transparent) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <ScrollStagger staggerChildren={0.12} className="max-w-3xl">
            <ScrollReveal animation="top">
              <Badge variant="outline" className="border-foreground/15 bg-background/70 backdrop-blur-sm">
                <BookOpen className="size-3" /> Design Book
              </Badge>
            </ScrollReveal>
            <ScrollReveal animation="blur">
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                The DepxTech <span className="text-primary">design system</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="blur">
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Every token, component and motion pattern used across the product, in one
                place. Everything you see is rendered with the real components from
                <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-sm">src/components/ui</code>
                — the page documents itself.
              </p>
            </ScrollReveal>
            <ScrollReveal animation="bottom">
              <div className="mt-8 flex flex-wrap gap-2">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="group inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
                  >
                    <s.icon className="size-3.5 text-primary/70 transition-colors group-hover:text-primary" />
                    {s.title}
                  </a>
                ))}
              </div>
            </ScrollReveal>
          </ScrollStagger>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionNav />

        <section id="color" className="scroll-mt-24 py-16">
          <SectionHeader eyebrow="01" title="Color" caption="Tokens that drive every surface. Click copy to grab a CSS variable." Icon={Palette} />
          <ColorSystem />
        </section>

        <section id="typography" className="scroll-mt-24 border-t py-16">
          <SectionHeader eyebrow="02" title="Typography" caption="Plus Jakarta Sans · Lora · IBM Plex Mono — set once in globals.css." Icon={Type} />
          <Typography />
        </section>

        <section id="space" className="scroll-mt-24 border-t py-16">
          <SectionHeader eyebrow="03" title="Space, radius & elevation" caption="A 4px rhythm, a single --radius token, and layered shadows." Icon={Ruler} />
          <Spacing />
        </section>

        <section id="components" className="scroll-mt-24 border-t py-16">
          <SectionHeader eyebrow="04" title="Components" caption="Live instances of every shadcn/ui + Radix primitive in the codebase." Icon={Boxes} />
          <ComponentShowcase />
        </section>

        <section id="icons" className="scroll-mt-24 border-t py-16">
          <SectionHeader eyebrow="05" title="Icons" caption="Tap any icon to copy its JSX. Powered by lucide-react." Icon={Shapes} />
          <IconGallery />
        </section>

        <section id="motion" className="scroll-mt-24 border-t py-16">
          <SectionHeader eyebrow="06" title="Motion" caption="GSAP ScrollTrigger (home &amp; trade) and framer-motion (inner pages)." Icon={Waves} />
          <MotionShowcase />
        </section>

        <section className="border-t py-16 text-center">
          <div className="mx-auto max-w-xl">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              End of book
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Source of truth lives in
              <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">src/app/globals.css</code>
              and
              <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">src/components/ui</code>.
              Edit there and this page updates automatically.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
