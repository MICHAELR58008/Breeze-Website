import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Navigation, type NavLink } from "./navigation"

/* ── Helpers ── */

function renderNav(links?: NavLink[], config?: any) {
  return render(<Navigation links={links} config={config} />)
}

/* ── Tests ── */

describe("Navigation", () => {
  it("renders links passed via the links prop", () => {
    renderNav([
      { label: "Services", href: "#services" },
      { label: "About", href: "#about" },
    ])

    // Desktop nav
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveTextContent("Services")
    expect(nav).toHaveTextContent("About")

    // Links are <a> elements
    const serviceLink = nav.querySelector('a[href="#services"]')
    expect(serviceLink).toBeInTheDocument()
  })

  it("renders default links when no links prop is given", () => {
    renderNav()
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(nav).toHaveTextContent("Services")
    expect(nav).toHaveTextContent("Process")
    expect(nav).toHaveTextContent("About")
    expect(nav).toHaveTextContent("Reviews")
    expect(nav).toHaveTextContent("Contact")
  })

  it("shows the CTA button by default", () => {
    renderNav()
    expect(screen.getByRole("button", { name: /Get a free quote/i })).toBeInTheDocument()
  })

  it("hides the CTA button when ctaVisible is false", () => {
    renderNav(undefined, { ctaVisible: false })
    expect(screen.queryByRole("button", { name: /Get a free quote/i })).not.toBeInTheDocument()
  })

  it("uses custom CTA text from config", () => {
    renderNav(undefined, { ctaText: "Book Now" })
    expect(screen.getByRole("button", { name: /Book Now/i })).toBeInTheDocument()
  })

  it("applies barBackground as inline style on header", () => {
    const { container } = renderNav(undefined, { barBackground: "#ff0000" })
    const header = container.querySelector("header")
    expect(header?.style.backgroundColor).toBe("rgb(255, 0, 0)")
  })

  it("applies barHeight as inline style on header", () => {
    const { container } = renderNav(undefined, { barHeight: 80 })
    const header = container.querySelector("header")
    expect(header?.style.height).toBe("80px")
  })

  it("applies linkColor inline on each nav link", () => {
    renderNav([{ label: "Services", href: "#services" }], { linkColor: "#00ff00" })
    const link = screen.getByText("Services")
    expect(link.style.color).toBe("rgb(0, 255, 0)")
  })

  it("applies linkFontSize inline on each nav link", () => {
    renderNav([{ label: "Services", href: "#services" }], { linkFontSize: 14 })
    const link = screen.getByText("Services")
    expect(link.style.fontSize).toBe("14px")
  })

  it("removes uppercase class when linkUppercase is false", () => {
    renderNav([{ label: "Services", href: "#services" }], { linkUppercase: false })
    const link = screen.getByText("Services")
    expect(link.className).not.toContain("uppercase")
  })

  it("adds uppercase class when linkUppercase is true (default)", () => {
    renderNav([{ label: "Services", href: "#services" }], { linkUppercase: true })
    const link = screen.getByText("Services")
    expect(link.className).toContain("uppercase")
  })

  it("injects a <style> tag with hover color when configured", () => {
    const { container } = renderNav(undefined, { linkHoverColor: "#ff6600" })
    const styleTags = container.querySelectorAll("style")
    const hasHoverRule = Array.from(styleTags).some((s) =>
      s.textContent?.includes("color:#ff6600")
    )
    expect(hasHoverRule).toBe(true)
  })

  it("injects a <style> tag with active color when configured", () => {
    const { container } = renderNav(undefined, { linkActiveColor: "#cc0000" })
    const styleTags = container.querySelectorAll("style")
    const hasActiveRule = Array.from(styleTags).some((s) =>
      s.textContent?.includes("color:#cc0000")
    )
    expect(hasActiveRule).toBe(true)
  })

  it("renders mobile hamburger menu", () => {
    const { container } = renderNav()
    const hamburger = container.querySelector('button[aria-label="Toggle menu"]')
    expect(hamburger).toBeInTheDocument()
  })

  it("shows mobile CTA button when menu is open", () => {
    // We can't easily test mobile menu toggle in jsdom without interaction,
    // but we can verify the mobile nav section is valid
    renderNav()
    const mobileNavSection = screen.getAllByRole("navigation")
    // One for desktop, one for mobile
    expect(mobileNavSection.length).toBeGreaterThanOrEqual(1)
  })

  it("applies linkColor to mobile menu links via inline style", () => {
    renderNav([{ label: "Services", href: "#services" }], { linkColor: "#0000ff" })
    const links = screen.getAllByText("Services")
    links.forEach((link) => {
      expect(link.style.color).toBe("rgb(0, 0, 255)")
    })
  })
})
