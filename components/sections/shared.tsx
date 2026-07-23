"use client"

import React from "react"
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

// ── StyledText ──
// Shared component that applies visibility, position, font size, and color
// from per-element CMS fields. Falls back to Tailwind classes when props are unset.

export interface TextControlProps {
  visible?: boolean
  x?: number
  y?: number
  size?: number
  color?: string
}

export function StyledText({
  visible = true,
  x = 0,
  y = 0,
  size,
  color,
  as: Tag = "span",
  className,
  children,
  ...props
}: TextControlProps & {
  as?: React.ElementType
  className?: string
  children?: React.ReactNode
  [key: string]: any
}) {
  if (!visible) return null

  const style: React.CSSProperties = {}
  if ((x !== 0 || y !== 0) && (x !== undefined || y !== undefined)) {
    style.transform = `translate(${x}px, ${y}px)`
  }
  if (size) style.fontSize = `${size}px`
  if (color) style.color = color

  return (
    <Tag className={className} style={style} {...props}>
      {children}
    </Tag>
  )
}

// ── SectionHeader ──
// Eyebrow, title, and copy each receive per-element TextControlProps
// plus a tinaFields mapping for visual editing.

export function SectionHeader(props: {
  eyebrow: string
  title: string
  copy: string
  tinaFields?: { eyebrow?: string; title?: string; copy?: string }
  eyebrowVisible?: boolean
  eyebrowX?: number
  eyebrowY?: number
  eyebrowSize?: number
  eyebrowColor?: string
  titleVisible?: boolean
  titleX?: number
  titleY?: number
  titleSize?: number
  titleColor?: string
  copyVisible?: boolean
  copyX?: number
  copyY?: number
  copySize?: number
  copyColor?: string
}) {
  const {
    eyebrow, title, copy, tinaFields,
    eyebrowVisible, eyebrowX, eyebrowY, eyebrowSize, eyebrowColor,
    titleVisible, titleX, titleY, titleSize, titleColor,
    copyVisible, copyX, copyY, copySize, copyColor,
  } = props

  const hasCopy = Boolean(copy && copy.trim())
  const hasEyebrow = Boolean(eyebrow && eyebrow.trim())

  return (
    <div className="grid gap-6 border-b border-border pb-10 lg:grid-cols-12 lg:items-end">
      <div className={hasCopy ? "lg:col-span-8" : "lg:col-span-12"}>
        {hasEyebrow && (
          <StyledText
            as="p"
            visible={eyebrowVisible}
            x={eyebrowX}
            y={eyebrowY}
            size={eyebrowSize}
            color={eyebrowColor}
            className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-primary"
            data-tina-field={tinaFields?.eyebrow}
          >
            {eyebrow}
          </StyledText>
        )}
        {title && (
          <StyledText
            as="h2"
            visible={titleVisible}
            x={titleX}
            y={titleY}
            size={titleSize}
            color={titleColor}
            className="text-balance font-display text-5xl leading-none sm:text-7xl lg:text-8xl"
            data-tina-field={tinaFields?.title}
          >
            {title}
          </StyledText>
        )}
      </div>
      {hasCopy && (
        <StyledText
          as="p"
          visible={copyVisible}
          x={copyX}
          y={copyY}
          size={copySize}
          color={copyColor}
          className="text-pretty text-lg leading-relaxed text-muted-foreground lg:col-span-4"
          data-tina-field={tinaFields?.copy}
        >
          {copy}
        </StyledText>
      )}
    </div>
  )
}
