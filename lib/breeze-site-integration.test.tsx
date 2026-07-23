import { describe, it, expect } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { BreezeSite } from "../components/breeze-site"
import type { Block } from "@/lib/page-sections"
import type { NavigationConfig } from "@/lib/navigation-config"

/* ── Fixtures ── */

function section(_template: string): Block {
  return { _template } as any as Block
}

const sampleSections: Block[] = [
  section("hero"),
  section("services"),
  section("about"),
  section("testimonials"),
  section("contact"),
  section("footer"),
]

describe("BreezeSite integration", () => {
  it("renders nav links from detected sections with no overrides", () => {
    render(<BreezeSite sections={sampleSections} />)
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(nav).toHaveTextContent("Services")
    expect(nav).toHaveTextContent("About")
    expect(nav).toHaveTextContent("Reviews")
    expect(nav).toHaveTextContent("Contact")
    // hero and footer have empty labels in sectionLabels → not rendered
    expect(nav).not.toHaveTextContent("Hero")
    expect(nav).not.toHaveTextContent("Footer")
  })

  it("applies CMS overrides to nav links", () => {
    const navConfig: NavigationConfig = {
      navLinks: [
        { sectionId: "services", label: "What We Do", visible: true },
        { sectionId: "about", label: "", visible: false }, // hidden
      ],
    }
    render(<BreezeSite sections={sampleSections} navigation={navConfig} />)
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(nav).toHaveTextContent("What We Do")
    expect(nav).not.toHaveTextContent("About")
    // Other sections still appear with default labels
    expect(nav).toHaveTextContent("Reviews")
    expect(nav).toHaveTextContent("Contact")
  })

  it("hides all links when all overrides set visible:false", () => {
    const navConfig: NavigationConfig = {
      navLinks: [
        { sectionId: "services", label: "", visible: false },
        { sectionId: "about", label: "", visible: false },
        { sectionId: "testimonials", label: "", visible: false },
        { sectionId: "contact", label: "", visible: false },
      ],
    }
    render(<BreezeSite sections={sampleSections} navigation={navConfig} />)
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(nav).toBeEmptyDOMElement()
  })

  it("applies nav config styling to the header", () => {
    const navConfig: NavigationConfig = {
      barBackground: "#123456",
      linkColor: "#789abc",
    }
    const { container } = render(<BreezeSite sections={sampleSections} navigation={navConfig} />)
    const header = container.querySelector("header")
    // jsdom normalises hex → rgb
    expect(header?.style.backgroundColor).toBe("rgb(18, 52, 86)")
  })

  it("hides CTA button when configured", () => {
    const { container } = render(<BreezeSite sections={sampleSections} navigation={{ ctaVisible: false }} />)
    const header = container.querySelector("header")
    expect(header).toBeInTheDocument()
    // No CTA button inside the header (hero section may have its own button elsewhere)
    const ctaInHeader = within(header!).queryByRole("button", { name: /Get a free quote/i })
    expect(ctaInHeader).not.toBeInTheDocument()
  })

  it("works with empty sections array", () => {
    render(<BreezeSite sections={[]} />)
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(nav).toBeEmptyDOMElement()
  })

  it("works with no navigation prop (defaults)", () => {
    const { container } = render(<BreezeSite sections={sampleSections} />)
    // CTA should be visible by default inside the header
    const header = container.querySelector("header")
    expect(header).toBeInTheDocument()
    const ctaInHeader = within(header!).getByRole("button", { name: /Get a free quote/i })
    expect(ctaInHeader).toBeInTheDocument()
  })
})
