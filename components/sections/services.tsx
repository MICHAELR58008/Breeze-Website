"use client"

import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/sections/shared"
import { formatPrice } from "@/lib/pricing"
import { useBooking } from "@/components/booking/booking-drawer"
import { tinaField } from "tinacms/dist/tina-field"

export interface ServiceItem {
  _template?: string
  id: string
  name: string
  description?: string
  subtitle?: string
  features?: string[]
  basePriceCents?: number
  pricePerBedroomCents?: number
  pricePerBathroomCents?: number
}

export interface ServicesProps {
  eyebrow?: string
  heading?: string
  copy?: string
  disclaimer?: string
  services?: ServiceItem[]
  addOnDetails?: Array<{ name: string; cents: number }>
  [key: string]: any
}

const defaults: ServicesProps = {
  eyebrow: "01 / Our services",
  heading: "Clean, your way.",
  copy: "Professional cleaning tailored to your home — because your time matters.",
  disclaimer: 'A free quote is required — either through an in-person visit or by sending 3–5 photos/videos. This ensures you receive a fair and accurate price.',
}

export function Services(props: ServicesProps) {
  const { openBooking, servicesList, addOnsList, rawPricing } = useBooking()
  const { eyebrow, heading, copy, disclaimer } = { ...defaults, ...props }

  // Use dynamic list if available from context, otherwise fallback to props/defaults
  const services = servicesList && servicesList.length > 0 ? servicesList : props.services
  const addOns = addOnsList && addOnsList.length > 0 
    ? addOnsList.map(a => ({ name: a.name, cents: a.cents })) 
    : props.addOnDetails

  const defaultAddOns = [
    { name: "Garage clean", cents: 4500 },
    { name: "Oven clean", cents: 3000 },
    { name: "Fridge clean", cents: 3000 },
  ]

  const activeAddOns = addOns && addOns.length > 0 ? addOns : defaultAddOns

  return (
    <section id="services" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
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
        <div className={`grid gap-px border-x border-b border-border bg-border grid-cols-1 ${
          services.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}>
          {services.map((item, index) => (
            <article
              key={item.id || `service-${index}`}
              className="flex flex-col bg-card p-6 sm:p-8"
              data-tina-field={rawPricing ? tinaField(rawPricing?.services?.[index]) : undefined}
            >
              <span
                className="font-mono text-xs uppercase tracking-wider text-primary"
                data-tina-field={rawPricing ? tinaField(rawPricing?.services?.[index], "subtitle") : undefined}
              >
                {item.subtitle || ""}
              </span>
              <h3
                className="mt-4 font-display text-5xl"
                data-tina-field={rawPricing ? tinaField(rawPricing?.services?.[index], "name") : undefined}
              >
                {item.name || "New Service"}
              </h3>
              <ul className="my-8 flex flex-col gap-3">
                {item.features?.map((feature: string, featureIndex: number) => (
                  <li
                    key={feature || `feature-${featureIndex}`}
                    className="flex gap-3 text-muted-foreground"
                    data-tina-field={rawPricing ? tinaField(rawPricing?.services?.[index], `features.${featureIndex}`) : undefined}
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-auto" variant="outline" onClick={() => openBooking(item.id)}>
                Quote this service <ArrowRight data-icon="inline-end" />
              </Button>
            </article>
          ))}
        </div>
      )}

      {activeAddOns.length > 0 && (
        <div
          className="border-x border-b border-border bg-card p-6 sm:p-8"
          data-tina-field={rawPricing ? tinaField(rawPricing, "addOns") : undefined}
        >
          <h4 className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            Add-ons
          </h4>
          <div className="grid gap-6 sm:grid-cols-3">
            {activeAddOns.map((addon, index) => (
              <div
                key={addon.name || `addon-${index}`}
                className="flex items-center justify-between border-b border-border/60 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6 last:border-0 last:pb-0 last:pr-0"
              >
                <span className="text-sm font-medium text-foreground">{addon.name || "New Add-on"}</span>
                <strong className="font-display text-2xl font-normal text-primary">
                  {formatPrice(addon.cents || 0)}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div data-tina-field={tinaField(props, "disclaimer")} className="mt-6 border-l-2 border-accent bg-accent/5 p-5 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">A free quote is required</strong> — {disclaimer}
      </div>
    </section>
  )
}
