"use client"

import Image from "next/image"
import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Proof } from "@/components/sections/shared"
import { useBooking } from "@/components/booking/booking-drawer"
import { tinaField } from "tinacms/dist/tina-field"

export interface HeroProof {
  value: string
  label: string
}

export interface HeroProps {
  location?: string
  headingLine1?: string
  headingLine2?: string
  subheading?: string
  phoneNumber?: string
  calloutTitle?: string
  calloutText?: string
  imageSrc?: string
  imageAlt?: string
  proofs?: HeroProof[]
  [key: string]: any
}

const defaults: HeroProps = {
  location: "Ventura County, CA",
  headingLine1: "A cleaner home.",
  headingLine2: "A lighter life.",
  subheading: "Professional Cleaning Services",
  phoneNumber: "(805) 760-8765",
  calloutTitle: "Care you can feel",
  calloutText: "Every surface considered. Every room treated like our own.",
  imageSrc: "/images/breeze-clean-home.png",
  imageAlt: "A bright, professionally cleaned modern home",
  proofs: [
    { value: "24 hr", label: "Response time" },
    { value: "Local", label: "Owner-led team" },
    { value: "Free", label: "Personalized quote" },
  ],
}

export function Hero(props: HeroProps) {
  const { openBooking } = useBooking()
  const {
    location,
    headingLine1,
    headingLine2,
    subheading,
    phoneNumber,
    calloutTitle,
    calloutText,
    imageSrc,
    imageAlt,
    proofs,
  } = { ...defaults, ...props }

  return (
    <section id="top" className="relative overflow-hidden border-b border-border pt-16">
      <div className="pointer-events-none absolute inset-0 grid-surface opacity-40" />
      <div className="relative mx-auto grid min-h-[88vh] max-w-[1400px] lg:grid-cols-12">
        <div className="flex flex-col justify-between border-x border-border px-5 py-16 sm:px-8 lg:col-span-7 lg:px-12 lg:py-20">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            <span className="size-2 rounded-full bg-accent" /> <span data-tina-field={tinaField(props, "location")}>{location}</span>
          </div>
          <div className="flex flex-col gap-8">
            <h1 className="max-w-4xl text-balance font-display text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-[7.5rem]">
              <span data-tina-field={tinaField(props, "headingLine1")}>{headingLine1}</span><br /><span data-tina-field={tinaField(props, "headingLine2")} className="text-primary">{headingLine2}</span>
            </h1>
            <p data-tina-field={tinaField(props, "subheading")} className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {subheading}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => openBooking()}>
                Get a free quote <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={`tel:+1${phoneNumber?.replace(/\D/g, "")}`}>
                  <Phone data-icon="inline-start" /> {phoneNumber}
                </a>
              </Button>
            </div>
          </div>
          <div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
            {proofs?.map((p, i) => (
              <Proof
                key={p.label}
                value={p.value}
                label={p.label}
                className={i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""}
              />
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] border-r border-border lg:col-span-5">
          <Image
            data-tina-field={tinaField(props, "imageSrc")}
            src={imageSrc || ""}
            alt={imageAlt || ""}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-x-5 bottom-5 border border-foreground/20 bg-background/85 p-5 backdrop-blur-xl">
            <p data-tina-field={tinaField(props, "calloutTitle")} className="font-mono text-xs uppercase tracking-widest text-primary">{calloutTitle}</p>
            <p data-tina-field={tinaField(props, "calloutText")} className="mt-2 text-pretty text-lg">{calloutText}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
