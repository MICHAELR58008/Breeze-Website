"use client"

import { useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Brand } from "@/components/sections/shared"
import { useBooking } from "@/components/booking/booking-drawer"

export interface NavLink {
  label: string
  href: string
}

interface NavigationProps {
  links?: NavLink[]
}

// Default links used when no CMS data is available
const defaultLinks: NavLink[] = [
  ["Services", "#services"],
  ["Process", "#process"],
  ["About", "#about"],
  ["Reviews", "#reviews"],
  ["Contact", "#contact"],
].map(([label, href]) => ({ label, href }))

export function Navigation({ links = defaultLinks }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const { openBooking } = useBooking()

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-10">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button size="sm" onClick={() => openBooking()}>
            Get a free quote <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
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
            >
              {label}
            </a>
          ))}
          <Button className="mt-4" onClick={() => { setOpen(false); openBooking() }}>
            Get a free quote
          </Button>
        </nav>
      )}
    </header>
  )
}
