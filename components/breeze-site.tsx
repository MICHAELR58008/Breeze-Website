"use client"

import { Navigation, type NavLink } from "@/components/sections/navigation"
import { renderBlock, buildNavLinks, type Block } from "@/lib/page-sections"

interface BreezeSiteProps {
  sections: Block[]
}

export function BreezeSite({ sections }: BreezeSiteProps) {
  const navEntries = buildNavLinks(sections)

  // Map to Navigation's expected prop type
  const navLinks: NavLink[] = navEntries.map((e) => ({
    label: e.label,
    href: e.href,
  }))

  return (
    <>
      <Navigation links={navLinks} />
      {sections.map((block, index) => renderBlock(block, index))}
    </>
  )
}
