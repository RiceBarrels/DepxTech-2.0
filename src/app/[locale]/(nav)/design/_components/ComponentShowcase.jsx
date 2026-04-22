'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction,
} from '@/components/ui/card'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

function Block({ title, caption, children, full }) {
  return (
    <section className={`rounded-3xl border bg-card p-6 sm:p-8 ${full ? 'lg:col-span-2' : ''}`}>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {caption ? (
          <code className="truncate font-mono text-[11px] text-muted-foreground">{caption}</code>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function ComponentShowcase() {
  const [sliderValue, setSliderValue] = React.useState([50])
  const [switchOn, setSwitchOn] = React.useState(true)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Block title="Buttons" caption="variant · size" full>
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Variants
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sizes
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Sparkles /></Button>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              With icons
            </div>
            <div className="flex flex-wrap gap-3">
              <Button><Sparkles /> Make magic</Button>
              <Button variant="outline">Continue <ArrowRight /></Button>
              <Button variant="secondary"><ShieldCheck /> Verified</Button>
            </div>
          </div>
        </div>
      </Block>

      <Block title="Badges" caption="variant">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge><CheckCircle2 /> Verified</Badge>
          <Badge variant="outline">Beta</Badge>
        </div>
      </Block>

      <Block title="Card" caption="rounded-3xl · shadow-sm">
        <Card>
          <CardHeader>
            <CardTitle>iPhone 15 Pro — 256GB</CardTitle>
            <CardDescription>Instant quote based on condition.</CardDescription>
            <CardAction>
              <Badge>Trade-in</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cards use <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">bg-card</code>,
              <code className="ml-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">rounded-3xl</code>
              and a subtle <code className="ml-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">shadow-sm</code>.
            </p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm">Get quote</Button>
          </CardFooter>
        </Card>
      </Block>

      <Block title="Inputs" caption="h-12 · rounded-full" full>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-email">Email</Label>
            <Input id="demo-email" type="email" placeholder="you@depxtech.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-disabled">Disabled</Label>
            <Input id="demo-disabled" disabled placeholder="Not editable" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="demo-textarea">Message</Label>
            <Textarea id="demo-textarea" placeholder="Tell us about your device…" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Select</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Choose condition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mint">Mint</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="broken">Broken</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Label>Slider · {sliderValue[0]}%</Label>
            <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
          </div>
        </div>
      </Block>

      <Block title="Toggles" caption="switch · checkbox · radio">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-4">
            <div>
              <Label className="text-base">Email receipts</Label>
              <p className="text-xs text-muted-foreground">Send a summary after each quote.</p>
            </div>
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="demo-cb" defaultChecked />
            <Label htmlFor="demo-cb">I agree to the terms</Label>
          </div>
          <RadioGroup defaultValue="card" className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <RadioGroupItem id="pay-card" value="card" />
              <Label htmlFor="pay-card">Credit card</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem id="pay-bank" value="bank" />
              <Label htmlFor="pay-bank">Bank transfer</Label>
            </div>
          </RadioGroup>
        </div>
      </Block>

      <Block title="Alerts" caption="variant">
        <div className="flex flex-col gap-3">
          <Alert>
            <Info />
            <AlertTitle>New trade-in flow is live</AlertTitle>
            <AlertDescription>
              Check out the redesigned process at /trade/how-it-works.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Info />
            <AlertTitle>Device not eligible</AlertTitle>
            <AlertDescription>
              We could not verify this serial. Try another device.
            </AlertDescription>
          </Alert>
        </div>
      </Block>

      <Block title="Dialog & Toasts" caption="@radix-ui/react-dialog · sonner">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm trade-in</DialogTitle>
                <DialogDescription>
                  This action will lock in your quote for 48 hours.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 rounded-2xl bg-muted p-4 text-sm">
                <ShieldCheck className="size-4 text-primary" />
                Quote guaranteed if device matches description.
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={() => toast('Saved to drafts')}>Toast</Button>
          <Button
            variant="secondary"
            onClick={() => toast.success('Quote locked', { description: '$342 · valid for 48h' })}
          >
            Success toast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error('Something broke', { description: 'Retry or contact support.' })
            }
          >
            Error toast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(
                new Promise((res) => setTimeout(res, 1400)),
                { loading: 'Generating quote…', success: 'All done!', error: 'Failed' }
              )
            }
          >
            Promise toast
          </Button>
        </div>
      </Block>

      <Block title="Accordion" caption="shadcn/ui" full>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q-1">
            <AccordionTrigger>How is my quote calculated?</AccordionTrigger>
            <AccordionContent>
              We combine market demand, device condition, and residual value. You always
              see the final number before shipping.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q-2">
            <AccordionTrigger>What if my device arrives damaged?</AccordionTrigger>
            <AccordionContent>
              We revise the quote transparently. You can accept or get the device back at
              no cost — shipping is always on us.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q-3" className="border-none">
            <AccordionTrigger>How long does payout take?</AccordionTrigger>
            <AccordionContent>
              Most users get paid within 1–2 business days of us receiving the device.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Block>

      <Block title="Skeleton & Separator" caption="loading states">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3 rounded-md" />
              <Skeleton className="mt-2 h-3 w-1/2 rounded-md" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Separator above</span>
            <span className="font-medium">Clean 1px border</span>
          </div>
        </div>
      </Block>
    </div>
  )
}
