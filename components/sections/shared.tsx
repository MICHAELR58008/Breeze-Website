"use client"

import { Sparkles } from "lucide-react"

export function Brand() {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="Breeze Cleaning home">
      <span className="flex size-8 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      <span className="font-display text-2xl">Breeze</span>
    </a>
  )
}

export function Proof({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div className={`bg-background p-4 ${className}`}>
      <strong className="block font-display text-2xl font-normal">{value}</strong>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

export function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="grid gap-6 border-b border-border pb-10 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h2 className="text-balance font-display text-5xl leading-none sm:text-7xl lg:text-8xl">{title}</h2>
      </div>
      <p className="text-pretty text-lg leading-relaxed text-muted-foreground lg:col-span-4">{copy}</p>
    </div>
  )
}
