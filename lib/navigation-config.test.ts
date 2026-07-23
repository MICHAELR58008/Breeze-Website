import { describe, it, expect } from "vitest"
import { buildNavLinks, type NavEntry } from "./page-sections"
import { navDefaults, type NavigationConfig, type NavLinkOverride } from "./navigation-config"

/* ── Helpers ── */

/** Minimal section-like object – just the fields buildNavLinks reads. */
function section(_template: string) {
  return { _template } as any
}

/* ── Tests ── */

describe("buildNavLinks", () => {
  it("returns all detected sections when no overrides given", () => {
    const sections = [section("services"), section("about"), section("testimonials"), section("contact")]
    const result = buildNavLinks(sections)
    expect(result).toEqual<NavEntry[]>([
      { id: "services", label: "Services", href: "#services" },
      { id: "about", label: "About", href: "#about" },
      { id: "testimonials", label: "Reviews", href: "#testimonials" },
      { id: "contact", label: "Contact", href: "#contact" },
    ])
  })

  it("returns all detected sections when overrides array is empty", () => {
    const sections = [section("services"), section("about")]
    const result = buildNavLinks(sections, [])
    expect(result).toHaveLength(2)
  })

  it("hides a link when visible is false", () => {
    const sections = [section("services"), section("about"), section("contact")]
    const result = buildNavLinks(sections, [
      { sectionId: "about", label: "", visible: false },
    ])
    expect(result).toEqual<NavEntry[]>([
      { id: "services", label: "Services", href: "#services" },
      { id: "contact", label: "Contact", href: "#contact" },
    ])
  })

  it("overrides a link label", () => {
    const sections = [section("services")]
    const result = buildNavLinks(sections, [
      { sectionId: "services", label: "Our Services" },
    ])
    expect(result).toEqual<NavEntry[]>([
      { id: "services", label: "Our Services", href: "#services" },
    ])
  })

  it("overrides multiple labels", () => {
    const sections = [section("services"), section("about"), section("testimonials")]
    const result = buildNavLinks(sections, [
      { sectionId: "services", label: "What We Do" },
      { sectionId: "testimonials", label: "What People Say" },
    ])
    expect(result).toEqual<NavEntry[]>([
      { id: "services", label: "What We Do", href: "#services" },
      { id: "about", label: "About", href: "#about" },
      { id: "testimonials", label: "What People Say", href: "#testimonials" },
    ])
  })

  it("ignores override for a section not present on the page", () => {
    const sections = [section("contact")]
    const result = buildNavLinks(sections, [
      { sectionId: "services", label: "Services", visible: true }, // not in sections
    ])
    expect(result).toEqual<NavEntry[]>([
      { id: "contact", label: "Contact", href: "#contact" },
    ])
  })

  it("returns empty array when no nav-worthy sections exist", () => {
    const result = buildNavLinks([section("hero"), section("footer")])
    expect(result).toEqual([])
  })

  it("returns empty array when all overrides hide their sections", () => {
    const sections = [section("services"), section("about")]
    const result = buildNavLinks(sections, [
      { sectionId: "services", label: "", visible: false },
      { sectionId: "about", label: "", visible: false },
    ])
    expect(result).toEqual([])
  })

  it("keeps default label when override label is empty string", () => {
    const sections = [section("services")]
    const result = buildNavLinks(sections, [
      { sectionId: "services", label: "" },
    ])
    expect(result).toEqual<NavEntry[]>([
      { id: "services", label: "Services", href: "#services" },
    ])
  })

  it("handles mixed visible/invisible overrides correctly", () => {
    const sections = [
      section("services"),
      section("process"),
      section("about"),
      section("testimonials"),
      section("contact"),
    ]
    const result = buildNavLinks(sections, [
      { sectionId: "process", label: "", visible: false },
      { sectionId: "about", label: "Meet Us" },
      { sectionId: "testimonials", label: "", visible: false },
    ])
    expect(result).toEqual<NavEntry[]>([
      { id: "services", label: "Services", href: "#services" },
      { id: "about", label: "Meet Us", href: "#about" },
      { id: "contact", label: "Contact", href: "#contact" },
    ])
  })
})

describe("navDefaults", () => {
  it("has CTA visible and default text", () => {
    expect(navDefaults.ctaVisible).toBe(true)
    expect(navDefaults.ctaText).toBe("Get a free quote")
  })

  it("has default link font size", () => {
    expect(navDefaults.linkFontSize).toBe(11)
  })

  it("defaults to uppercase links", () => {
    expect(navDefaults.linkUppercase).toBe(true)
  })
})
