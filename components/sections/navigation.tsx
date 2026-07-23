"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Brand } from "@/components/sections/shared"
import { useBooking } from "@/components/booking/booking-drawer"
import { navDefaults, type NavigationConfig } from "@/lib/navigation-config"

export interface NavLink {
  label: string
  href: string
}

interface NavigationProps {
  links?: NavLink[]
  config?: NavigationConfig
}

// Default links used when no CMS data is available
const defaultLinks: NavLink[] = [
  ["Services", "#services"],
  ["Process", "#process"],
  ["About", "#about"],
  ["Reviews", "#reviews"],
  ["Contact", "#contact"],
].map(([label, href]) => ({ label, href }))

export function Navigation({ links = defaultLinks, config = navDefaults }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const { openBooking } = useBooking()

  // ── Resolve config with defaults ──
  const ctaVisible = config.ctaVisible ?? true
  const ctaText = config.ctaText || "Get a free quote"
  const linkUppercase = config.linkUppercase ?? true

  // ── Header inline styles ──
  const headerStyle: React.CSSProperties = {}
  if (config.barBackground) headerStyle.backgroundColor = config.barBackground
  if (config.barBorderColor) headerStyle.borderBottomColor = config.barBorderColor
  if (config.barHeight) headerStyle.height = `${config.barHeight}px`

  const headerClasses = [
    "fixed inset-x-0 top-0 z-40 border-b border-border/70",
    config.barBlur !== false ? "backdrop-blur-xl" : "",
  ]
    .filter(Boolean)
    .join(" ")

  // ── Link inline styles ──
  const linkStyle: React.CSSProperties = {}
  if (config.linkFontSize) linkStyle.fontSize = `${config.linkFontSize}px`
  if (config.linkColor) linkStyle.color = config.linkColor

  const linkClasses = [
    "font-mono text-xs tracking-wider text-muted-foreground transition-colors",
    linkUppercase ? "uppercase" : "",
  ]
    .filter(Boolean)
    .join(" ")

  // ── Hover / active pseudo-class <style> tag ──
  const hoverCss = useMemo(() => {
    const parts: string[] = []
    if (config.linkHoverColor) {
      parts.push(`#nav-links a:hover{color:${config.linkHoverColor}!important}`)
    }
    if (config.linkActiveColor) {
      parts.push(`#nav-links a:active{color:${config.linkActiveColor}!important}`)
    }
    return parts.join("")
  }, [config.linkHoverColor, config.linkActiveColor])

  return (
    <header className={headerClasses} style={headerStyle}>
      {hoverCss && <style>{hoverCss}</style>}
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 lg:px-10">
        <Brand />
        <nav
          id="nav-links"
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          {links.map(({ label, href }) => (
            <a key={href} href={href} className={linkClasses} style={linkStyle}>
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          {ctaVisible && (
            <Button size="sm" onClick={() => openBooking()}>
              {ctaText} <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </div>
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background p-5 md:hidden">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-4 text-xl"
              style={linkStyle}
            >
              {label}
            </a>
          ))}
          {ctaVisible && (
            <Button className="mt-4" onClick={() => { setOpen(false); openBooking() }}>
              {ctaText}
            </Button>
          )}
        </nav>
      )}
    </header>
  )
}
