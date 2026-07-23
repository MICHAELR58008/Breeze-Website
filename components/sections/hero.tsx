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
  headingLine1X?: number
  headingLine1Y?: number
  headingLine2?: string
  headingLine2X?: number
  headingLine2Y?: number
  subheading?: string
  subheadingX?: number
  subheadingY?: number
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
  headingLine1X: 0,
  headingLine1Y: 0,
  headingLine2: "A lighter life.",
  headingLine2X: 0,
  headingLine2Y: 0,
  subheading: "Professional Cleaning Services",
  subheadingX: 0,
  subheadingY: 0,
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
    headingLine1X,
    headingLine1Y,
    headingLine2,
    headingLine2X,
    headingLine2Y,
    subheading,
    subheadingX,
    subheadingY,
    phoneNumber,
    imageSrc,
    imageAlt,
    proofs,
  } = { ...defaults, ...props }

  const hasBgImage = Boolean(imageSrc && imageSrc.trim())

  return (
    <section id="top" className="relative overflow-hidden border-b border-border pt-16">
      {hasBgImage && (
        <Image
          src={imageSrc!}
          alt={imageAlt || "Background"}
          fill
          priority
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative mx-auto grid min-h-[88vh] max-w-[1400px]">
        <div className="flex flex-col justify-between px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            <span className="size-2 rounded-full bg-accent" />
            <span data-tina-field={tinaField(props, "location")} className="text-white/80">{location}</span>
          </div>

          <div className="flex flex-col gap-8">
            <h1 className="max-w-4xl text-balance font-display text-6xl leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-[7.5rem]">
              <span
                data-tina-field={tinaField(props, "headingLine1")}
                style={{ transform: `translate(${headingLine1X ?? 0}px, ${headingLine1Y ?? 0}px)` }}
              >
                {headingLine1}
              </span>
              <br />
              <span
                data-tina-field={tinaField(props, "headingLine2")}
                className="text-primary"
                style={{ transform: `translate(${headingLine2X ?? 0}px, ${headingLine2Y ?? 0}px)` }}
              >
                {headingLine2}
              </span>
            </h1>

            <p
              data-tina-field={tinaField(props, "subheading")}
              className="max-w-xl text-pretty text-lg leading-relaxed text-white/70 sm:text-xl"
              style={{ transform: `translate(${subheadingX ?? 0}px, ${subheadingY ?? 0}px)` }}
            >
              {subheading}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => openBooking()}>
                Get a free quote <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <a href={`tel:+1${phoneNumber?.replace(/\D/g, "")}`}>
                  <Phone data-icon="inline-start" /> {phoneNumber}
                </a>
              </Button>
            </div>
          </div>

          <div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
            {proofs?.map((p, i) => (
              <Proof
                key={p.label}
                value={p.value}
                label={p.label}
                className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} bg-background/70 text-white backdrop-blur-sm`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
