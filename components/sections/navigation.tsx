"use client"

import { useEffect, useMemo, useState } from "react"
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

const defaultLinks: NavLink[] = [
  ["Services", "#services"],
  ["Process", "#process"],
  ["About", "#about"],
  ["Reviews", "#reviews"],
  ["Contact", "#contact"],
].map(([label, href]) => ({ label, href }))

export function Navigation({ links = defaultLinks, config = navDefaults }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const { openBooking } = useBooking()

  const ctaVisible = config.ctaVisible ?? true
  const ctaText = config.ctaText || "Get a free quote"
  const linkUppercase = config.linkUppercase ?? true

  // ── Active section detection ──
  useEffect(() => {
    const sectionIds = links.map((l) => l.href.replace("#", ""))
    const NAV_OFFSET = 80

    const update = () => {
      let bestId = sectionIds[0] || ""
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= NAV_OFFSET) bestId = id
      }
      setActiveSection(bestId)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [links])

  // ── Header inline styles ──
  const headerStyle: React.CSSProperties = {}
  if (config.barBackground) headerStyle.backgroundColor = config.barBackground
  if (config.barBorderColor) headerStyle.borderBottomColor = config.barBorderColor
  headerStyle.height = `${config.barHeight || 64}px`
  if (config.barWidth) headerStyle.maxWidth = `${config.barWidth}px`

  const headerClasses = [
    "fixed top-0 left-1/2 -translate-x-1/2 z-40 w-full border-b border-border/70",
    config.barBlur !== false ? "backdrop-blur-xl" : "",
  ]
    .filter(Boolean)
    .join(" ")

  // ── Tab inline styles ──
  const tabStyle: React.CSSProperties = {}
  if (config.linkFontSize) tabStyle.fontSize = `${config.linkFontSize}px`
  if (config.linkColor) tabStyle.color = config.linkColor

  const isActive = (id: string) => id && activeSection === id

  const tabClasses = (id: string) =>
    [
      "relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      linkUppercase ? "uppercase tracking-wide" : "",
      isActive(id)
        ? "bg-foreground text-background"
        : "text-muted-foreground",
    ]
      .filter(Boolean)
      .join(" ")

  // ── CMS color overrides via <style> ──
  const overrideCss = useMemo(() => {
    const parts: string[] = []
    if (config.linkHoverColor) {
      parts.push(`#nav-links a:not(.active-tab):hover{color:${config.linkHoverColor}!important}`)
    }
    if (config.linkActiveColor) {
      parts.push(`#nav-links a.active-tab{background-color:${config.linkActiveColor}!important}`)
    }
    return parts.join("")
  }, [config.linkHoverColor, config.linkActiveColor])

  return (
    <header className={headerClasses} style={headerStyle}>
      {overrideCss && <style>{overrideCss}</style>}
      <div className="flex h-full items-center justify-between px-5 lg:px-10">
        <Brand />
        <nav
          id="nav-links"
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {links.map(({ label, href }) => {
            const id = href.replace("#", "")
            return (
              <a
                key={href}
                href={href}
                className={`${tabClasses(id)} ${isActive(id) ? "active-tab" : ""}`}
                style={tabStyle}
              >
                {label}
              </a>
            )
          })}
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
        <nav className="flex flex-col gap-1 border-t border-border bg-background/95 backdrop-blur-xl p-5 md:hidden">
          {links.map(({ label, href }) => {
            const id = href.replace("#", "")
            return (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={[
                  "rounded-lg px-4 py-3 font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive(id)
                    ? "bg-foreground text-background"
                    : "text-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={tabStyle}
              >
                {label}
              </a>
            )
          })}
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
