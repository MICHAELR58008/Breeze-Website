"use client"

import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/sections/shared"
import { formatPrice } from "@/lib/pricing"
import { useBooking } from "@/components/booking/booking-drawer"
import { tinaField } from "tinacms/dist/tina-field"

export interface PriceEntry {
  key: string
  bedrooms: string
  bathrooms: string
  cents: number
}

export interface ServiceItem {
  _template: string
  id: string
  name: string
  description: string
  subtitle: string
  features: string[]
  prices: PriceEntry[]
}

export interface ServicesProps {
  eyebrow?: string
  heading?: string
  copy?: string
  disclaimer?: string
  services?: ServiceItem[]
  addOnDetails?: Array<{ name: string; cents: number }>
}

const defaults: ServicesProps = {
  eyebrow: "01 / Our services",
  heading: "Clean, your way.",
  copy: "Professional cleaning tailored to your home — because your time matters.",
  disclaimer: 'A free quote is required — either through an in-person visit or by sending 3–5 photos/videos. This ensures you receive a fair and accurate price.',
}

export function Services(props: ServicesProps) {
  const { openBooking } = useBooking()
  const { eyebrow, heading, copy, disclaimer, services, addOnDetails } = { ...defaults, ...props }

  const defaultAddOns = [
    { name: "Garage clean", cents: 4500 },
    { name: "Oven clean", cents: 3000 },
    { name: "Fridge clean", cents: 3000 },
  ]

  return (
    <section id="services" className="mx-auto max-w-[1400px] border-x border-border px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <SectionHeader
        eyebrow={eyebrow || ""}
        title={heading || ""}
        copy={copy || ""}
        tinaFields={{
          eyebrow: tinaField(props, "eyebrow"),
          title: tinaField(props, "heading"),
          copy: tinaField(props, "copy"),
        }}
      />
      
      {services && services.length > 0 && (
        <div className="grid gap-px border-x border-b border-border bg-border lg:grid-cols-2">
          {services.map((item) => (
            <article key={item.id} className="flex flex-col bg-card p-6 sm:p-10">
              <span className="font-mono text-xs uppercase tracking-wider text-primary">
                {item.subtitle}
              </span>
              <h3 className="mt-4 font-display text-5xl">{item.name}</h3>
              <ul className="my-8 flex flex-col gap-3">
                {item.features.map((feature: string) => (
                  <li key={feature} className="flex gap-3 text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-border">
                {item.prices.map((priceEntry) => {
                  const [bed, bath] = priceEntry.key.split("-")
                  return (
                    <div key={priceEntry.key} className="flex items-center justify-between border-b border-border py-4">
                      <span>{bed} bed / {bath} bath{bath !== "1" ? "s" : ""}</span>
                      <strong className="font-display text-2xl font-normal text-primary">
                        {formatPrice(priceEntry.cents)}
                      </strong>
                    </div>
                  )
                })}
              </div>
              <Button className="mt-6" variant="outline" onClick={() => openBooking(item.id)}>
                Quote this service <ArrowRight data-icon="inline-end" />
              </Button>
            </article>
          ))}
        </div>
      )}

      {(addOnDetails || defaultAddOns.length > 0) && (
        <div className="grid gap-px border-x border-b border-border bg-border sm:grid-cols-3">
          {(addOnDetails || defaultAddOns).map((addon) => (
            <div key={addon.name} className="flex items-center justify-between bg-background p-5">
              <span>{addon.name}</span>
              <strong className="font-display text-2xl font-normal text-primary">
                {formatPrice(addon.cents)}
              </strong>
            </div>
          ))}
        </div>
      )}

      <div data-tina-field={tinaField(props, "disclaimer")} className="mt-6 border-l-2 border-accent bg-accent/5 p-5 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">A free quote is required</strong> — {disclaimer}
      </div>
    </section>
  )
}
