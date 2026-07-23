"use client"

import { Navigation, type NavLink } from "@/components/sections/navigation"
import { renderBlock, buildNavLinks, type Block } from "@/lib/page-sections"
import { navDefaults, type NavigationConfig } from "@/lib/navigation-config"

interface BreezeSiteProps {
  sections: Block[]
  navigation?: NavigationConfig
}

export function BreezeSite({ sections, navigation = navDefaults }: BreezeSiteProps) {
  const navEntries = buildNavLinks(sections, navigation.navLinks)

  // Map to Navigation's expected prop type
  const navLinks: NavLink[] = navEntries.map((e) => ({
    label: e.label,
    href: e.href,
  }))

  return (
    <>
      <Navigation links={navLinks} config={navigation} />
      {sections.map((block, index) => renderBlock(block, index))}
    </>
  )
}
