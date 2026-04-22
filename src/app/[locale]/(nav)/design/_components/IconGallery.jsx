'use client'

import * as React from 'react'
import {
  Sparkles, Leaf, Eye, Zap, ShieldCheck, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Users, Recycle, Clock, TrendingUp, Mail, Phone, MapPin, Home, Settings,
  Search, Bell, Heart, Star, Bookmark, Share2, Download, Upload, ExternalLink,
  ShoppingBag, ShoppingCart, Package, Truck, CreditCard, Tag, Percent, Gift,
  Smartphone, Laptop, Monitor, Headphones, Camera, Watch, Tablet, Gamepad2,
  Check, X, Plus, Minus, CheckCircle2, XCircle, AlertTriangle, Info,
  User, UserPlus, LogIn, LogOut, Lock, Unlock, Shield, Key,
  Sun, Moon, Cloud, CloudRain, Wifi, Battery, BatteryCharging, Volume2,
  Image as ImageIcon, Video, FileText, Folder, FolderOpen, Paperclip, Link as LinkIcon,
  MessageCircle, MessageSquare, Send, PhoneCall, Mic, MicOff,
  Edit, Edit3, Trash2, Copy, ClipboardCheck, RefreshCw, RotateCcw,
  Menu, Grid3x3, List, Filter, SlidersHorizontal, ChevronDown, ChevronRight,
  Calendar, Clock3, Timer, Hourglass,
  Globe, Languages, Flag,
  Sparkle, Rocket, Award, Trophy, BadgeCheck, Crown,
  DollarSign, Euro, Wallet, Banknote, Receipt,
  PlayCircle, PauseCircle, SkipForward, SkipBack,
  BookOpen, GraduationCap, Lightbulb, Brain,
} from 'lucide-react'

const ICON_GROUPS = [
  {
    label: 'Navigation & actions',
    icons: [
      ['ArrowRight', ArrowRight], ['ArrowLeft', ArrowLeft], ['ArrowUp', ArrowUp], ['ArrowDown', ArrowDown],
      ['ChevronDown', ChevronDown], ['ChevronRight', ChevronRight],
      ['Menu', Menu], ['Grid3x3', Grid3x3], ['List', List],
      ['Search', Search], ['Filter', Filter], ['SlidersHorizontal', SlidersHorizontal],
      ['Plus', Plus], ['Minus', Minus], ['Check', Check], ['X', X],
      ['ExternalLink', ExternalLink], ['LinkIcon', LinkIcon], ['Share2', Share2],
    ],
  },
  {
    label: 'Commerce',
    icons: [
      ['ShoppingCart', ShoppingCart], ['ShoppingBag', ShoppingBag], ['Package', Package], ['Truck', Truck],
      ['CreditCard', CreditCard], ['Tag', Tag], ['Percent', Percent], ['Gift', Gift],
      ['DollarSign', DollarSign], ['Euro', Euro], ['Wallet', Wallet], ['Banknote', Banknote], ['Receipt', Receipt],
    ],
  },
  {
    label: 'Devices',
    icons: [
      ['Smartphone', Smartphone], ['Laptop', Laptop], ['Monitor', Monitor], ['Tablet', Tablet],
      ['Headphones', Headphones], ['Camera', Camera], ['Watch', Watch], ['Gamepad2', Gamepad2],
    ],
  },
  {
    label: 'User & account',
    icons: [
      ['User', User], ['UserPlus', UserPlus], ['Users', Users],
      ['LogIn', LogIn], ['LogOut', LogOut],
      ['Lock', Lock], ['Unlock', Unlock], ['Shield', Shield], ['ShieldCheck', ShieldCheck], ['Key', Key],
      ['Settings', Settings], ['Bell', Bell],
    ],
  },
  {
    label: 'Status & feedback',
    icons: [
      ['CheckCircle2', CheckCircle2], ['XCircle', XCircle], ['AlertTriangle', AlertTriangle], ['Info', Info],
      ['Heart', Heart], ['Star', Star], ['Bookmark', Bookmark],
      ['BadgeCheck', BadgeCheck], ['Award', Award], ['Trophy', Trophy], ['Crown', Crown],
    ],
  },
  {
    label: 'Media & files',
    icons: [
      ['ImageIcon', ImageIcon], ['Video', Video], ['FileText', FileText],
      ['Folder', Folder], ['FolderOpen', FolderOpen], ['Paperclip', Paperclip],
      ['PlayCircle', PlayCircle], ['PauseCircle', PauseCircle], ['SkipForward', SkipForward], ['SkipBack', SkipBack],
      ['Mic', Mic], ['MicOff', MicOff], ['Volume2', Volume2],
      ['Download', Download], ['Upload', Upload],
    ],
  },
  {
    label: 'Communication',
    icons: [
      ['Mail', Mail], ['Send', Send], ['MessageCircle', MessageCircle], ['MessageSquare', MessageSquare],
      ['Phone', Phone], ['PhoneCall', PhoneCall],
    ],
  },
  {
    label: 'World & time',
    icons: [
      ['Home', Home], ['MapPin', MapPin], ['Globe', Globe], ['Languages', Languages], ['Flag', Flag],
      ['Calendar', Calendar], ['Clock', Clock], ['Clock3', Clock3], ['Timer', Timer], ['Hourglass', Hourglass],
    ],
  },
  {
    label: 'Ambience',
    icons: [
      ['Sun', Sun], ['Moon', Moon], ['Cloud', Cloud], ['CloudRain', CloudRain],
      ['Wifi', Wifi], ['Battery', Battery], ['BatteryCharging', BatteryCharging],
    ],
  },
  {
    label: 'DepxTech motifs',
    icons: [
      ['Sparkles', Sparkles], ['Sparkle', Sparkle], ['Zap', Zap], ['Rocket', Rocket],
      ['Leaf', Leaf], ['Recycle', Recycle], ['TrendingUp', TrendingUp],
      ['Eye', Eye], ['BookOpen', BookOpen], ['Lightbulb', Lightbulb], ['Brain', Brain], ['GraduationCap', GraduationCap],
    ],
  },
  {
    label: 'Editing',
    icons: [
      ['Edit', Edit], ['Edit3', Edit3], ['Trash2', Trash2], ['Copy', Copy], ['ClipboardCheck', ClipboardCheck],
      ['RefreshCw', RefreshCw], ['RotateCcw', RotateCcw],
    ],
  },
]

function IconTile({ name, Icon }) {
  const [copied, setCopied] = React.useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(`<${name} />`)
    setCopied(true)
    setTimeout(() => setCopied(false), 900)
  }
  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy <${name} />`}
      className="group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-accent cursor-pointer"
    >
      <Icon className="size-5 text-foreground transition-transform group-hover:scale-110" />
      <span className="line-clamp-1 w-full text-center font-mono text-[10px] text-muted-foreground">
        {copied ? 'copied!' : name}
      </span>
    </button>
  )
}

export function IconGallery() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-5">
        <div>
          <h3 className="text-sm font-semibold">lucide-react</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap any icon to copy its JSX. Use <code className="rounded bg-muted px-1 py-0.5 font-mono">size-4</code>,
            <code className="ml-1 rounded bg-muted px-1 py-0.5 font-mono">size-5</code>, or
            <code className="ml-1 rounded bg-muted px-1 py-0.5 font-mono">size-6</code> to control the visual scale.
          </p>
        </div>
      </div>

      {ICON_GROUPS.map((group) => (
        <section key={group.label} className="flex flex-col gap-3">
          <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {group.label}
          </h4>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {group.icons.map(([name, Icon]) => (
              <IconTile key={name} name={name} Icon={Icon} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
