"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/sections/shared"
import { useBooking } from "@/components/booking/booking-drawer"

export interface ProcessStep {
  number: string
  title: string
  description: string
}

export interface ProcessProps {
  eyebrow?: string
  heading?: string
  copy?: string
  steps?: ProcessStep[]
}

const defaults: ProcessProps = {
  eyebrow: "02 / How it works",
  heading: "Simple from start to shine.",
  copy: "A compact quote flow designed around your home—not a generic one-price-fits-all form.",
  steps: [
    { number: "01", title: "Choose your clean", description: "Select deep or regular cleaning, then tell us about your bedrooms and bathrooms." },
    { number: "02", title: "Share the details", description: "Add extras and, if you would like, securely upload photos for a more accurate quote." },
    { number: "03", title: "Request a time", description: "Pick your preferred date and a morning, afternoon, or flexible time window." },
    { number: "04", title: "We confirm", description: "Breeze reviews your request and gets back to you within 24 hours with availability and final pricing." },
  ],
}

export function Process(props: ProcessProps) {
  const { openBooking } = useBooking()
  const { eyebrow, heading, copy, steps } = { ...defaults, ...props }

  return (
    <section id="process" className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1400px] border-x border-border px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeader eyebrow={eyebrow || ""} title={heading || ""} copy={copy || ""} />
        <div className="grid gap-px border-x border-b border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {(steps || []).map((step) => (
            <article key={step.number} className="flex min-h-72 flex-col bg-card p-6">
              <span className="font-mono text-xs text-primary">{step.number}</span>
              <div className="mt-auto">
                <h3 className="mb-3 text-xl font-medium">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
        <Button className="mt-8" size="lg" onClick={() => openBooking()}>
          Plan my clean <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  )
}
