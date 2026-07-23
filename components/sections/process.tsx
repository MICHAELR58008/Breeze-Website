"use client"

import Image from "next/image"
import { ArrowRight, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader, StyledText } from "@/components/sections/shared"
import { useBooking } from "@/components/booking/booking-drawer"
import { tinaField } from "tinacms/dist/tina-field"

export interface ProcessStep {
  number: string
  title: string
  description: string
  image?: string
  [key: string]: any
}

export interface ProcessProps {
  eyebrow?: string
  heading?: string
  copy?: string
  steps?: ProcessStep[]
  [key: string]: any
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
  const { eyebrow, heading, copy, steps, eyebrowVisible, eyebrowSize, eyebrowColor, headingVisible, headingX, headingY, headingSize, headingColor, copyVisible, copyX, copyY, copySize, copyColor } = { ...defaults, ...props }

  return (
    <section id="process" className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeader
          eyebrow={eyebrow || ""}
          title={heading || ""}
          copy={copy || ""}
          tinaFields={{
            eyebrow: tinaField(props, "eyebrow"),
            title: tinaField(props, "heading"),
            copy: tinaField(props, "copy"),
          }}
          eyebrowVisible={eyebrowVisible}
          eyebrowSize={eyebrowSize}
          eyebrowColor={eyebrowColor}
          titleVisible={headingVisible}
          titleX={headingX}
          titleY={headingY}
          titleSize={headingSize}
          titleColor={headingColor}
          copyVisible={copyVisible}
          copyX={copyX}
          copyY={copyY}
          copySize={copySize}
          copyColor={copyColor}
        />
        <div data-tina-field={tinaField(props, "steps")} className="grid gap-px border-x border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {(steps || []).map((step, index) => (
            <article
              key={step.number || `step-${index}`}
              className="flex min-h-80 flex-col bg-card p-6 sm:p-8"
              data-tina-field={tinaField(step)}
            >
              <div className="flex items-center justify-between">
                <span
                  data-tina-field={tinaField(step, "number")}
                  className="font-mono text-xs uppercase tracking-wider text-primary"
                >
                  {step.number}
                </span>
              </div>

              {/* Image / Photo upload area for step */}
              <div
                className="relative my-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/20"
                data-tina-field={tinaField(step, "image")}
              >
                {step.image ? (
                  <Image
                    src={step.image}
                    alt={step.title || `Step ${step.number}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center text-xs text-muted-foreground/60">
                    <ImagePlus className="size-5 text-muted-foreground/40" />
                    <span>Click to add photo</span>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <h3
                  data-tina-field={tinaField(step, "title")}
                  className="mb-2 text-xl font-medium text-foreground"
                >
                  {step.title}
                </h3>
                <p
                  data-tina-field={tinaField(step, "description")}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {step.description}
                </p>
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
