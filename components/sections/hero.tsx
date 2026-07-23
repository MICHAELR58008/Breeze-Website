"use client"

import Image from "next/image"
import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Proof } from "@/components/sections/shared"
import { useBooking } from "@/components/booking/booking-drawer"
import { tinaField } from "tinacms/dist/tina-field"
import { useCallback, useEffect, useRef, useState } from "react"

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

// ── Draggable text field ──

function useDraggablePosition(fieldPath: string) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{
    active: boolean
    startX: number
    startY: number
    origX: number
    origY: number
  }>({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 })

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
    }
  }, [offset])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) return
    setOffset({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    })
  }, [])

  const handlePointerUp = useCallback(async (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false

    const newX = Math.round((dragRef.current.origX + (e.clientX - dragRef.current.startX)) * 10) / 10
    const newY = Math.round((dragRef.current.origY + (e.clientY - dragRef.current.startY)) * 10) / 10

    if (!fieldPath) return

    // Persist via TinaCMS form (visual editor) or localStorage (standalone preview)
    try {
      const { useCMS } = await import("tinacms/dist/toolkit/react-tinacms/use-cms")
      const cms = useCMS()
      const form = cms.forms.all().find((f: any) => f.id?.includes("page"))
      if (form) {
        form.change(`${fieldPath}X`, newX)
        form.change(`${fieldPath}Y`, newY)
      }
    } catch {
      // Not in editor context — save to localStorage as fallback
      try {
        const key = `hero:${fieldPath}`
        localStorage.setItem(key, JSON.stringify({ x: newX, y: newY }))
      } catch {}
    }
  }, [fieldPath])

  return { offset, setOffset, handlePointerDown, handlePointerMove, handlePointerUp }
}

function DraggableTextField({
  fieldPath,
  children,
  className,
  as: Tag = "span",
  ...props
}: {
  fieldPath: string
  children: React.ReactNode
  className?: string
  as?: "span" | "p" | "h1" | "div"
  [key: string]: any
}) {
  const { offset, handlePointerDown, handlePointerMove, handlePointerUp } = useDraggablePosition(fieldPath)
  const [dragging, setDragging] = useState(false)

  // Load persisted position from localStorage (non-editor fallback)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = localStorage.getItem(`hero:${fieldPath}`)
      if (saved) {
        const { x, y } = JSON.parse(saved)
        // Only apply if CMS hasn't provided its own value
      }
    } catch {}
  }, [fieldPath])

  const isMoved = offset.x !== 0 || offset.y !== 0

  return (
    <Tag
      {...props}
      className={`${className || ""} ${isMoved || dragging ? "relative z-20" : ""}`}
      style={{
        ...(props.style || {}),
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onPointerDown={(e: React.PointerEvent<HTMLElement>) => {
        setDragging(true)
        handlePointerDown(e)
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={(e: React.PointerEvent<HTMLElement>) => {
        setDragging(false)
        handlePointerUp(e)
      }}
    >
      {children}
    </Tag>
  )
}

// ── Position fields are stored alongside text fields in the JSON.
//     tinaField returns eg "page---sections.0.headingLine1".
//     We extract "sections.0.headingLine1" as the form field path,
//     and the companion position fields are at "sections.0.headingLine1X" etc.
function getSectionPath(props: HeroProps, field: string): string {
  const raw = tinaField(props, field as any)
  if (!raw || typeof raw !== "string") return ""
  // raw format: "queryId---path.to.field"
  const parts = raw.split("---")
  return parts.length > 1 ? parts[1] : raw
}

export function Hero(props: HeroProps) {
  const { openBooking } = useBooking()
  const {
    location,
    headingLine1,
    headingLine2,
    subheading,
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
      <div className="pointer-events-none absolute inset-0 grid-surface opacity-20" />

      <div className="relative mx-auto grid min-h-[88vh] max-w-[1400px]">
        <div className="flex flex-col justify-between border-x border-border px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            <span className="size-2 rounded-full bg-accent" />
            <span data-tina-field={tinaField(props, "location")} className="text-white/80">{location}</span>
          </div>

          <div className="flex flex-col gap-8">
            <h1 className="max-w-4xl text-balance font-display text-6xl leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-[7.5rem]">
              <DraggableTextField
                as="span"
                fieldPath={getSectionPath(props, "headingLine1")}
                data-tina-field={tinaField(props, "headingLine1")}
              >
                {headingLine1}
              </DraggableTextField>
              <br />
              <DraggableTextField
                as="span"
                fieldPath={getSectionPath(props, "headingLine2")}
                className="text-primary"
                data-tina-field={tinaField(props, "headingLine2")}
              >
                {headingLine2}
              </DraggableTextField>
            </h1>

            <DraggableTextField
              as="p"
              fieldPath={getSectionPath(props, "subheading")}
              data-tina-field={tinaField(props, "subheading")}
              className="max-w-xl text-pretty text-lg leading-relaxed text-white/70 sm:text-xl"
            >
              {subheading}
            </DraggableTextField>

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
