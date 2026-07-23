import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import { Proof } from "./shared"
import { Hero, type HeroProps, type HeroProof } from "./hero"
import { tinaField } from "tinacms/dist/tina-field"

describe("Proof Component - Empirical Precedence & DOM Style Tests", () => {
  it("omits style attribute completely on strong and span when size/color props are undefined", () => {
    const { container } = render(
      <Proof value="100%" label="Satisfaction" />
    )
    const strong = container.querySelector("strong")
    const span = container.querySelector("span")
    const div = container.querySelector("div")

    expect(strong?.getAttribute("style")).toBeNull()
    expect(span?.getAttribute("style")).toBeNull()
    expect(div?.getAttribute("style")).toBeNull()
  })

  it("does not overwrite outer container style when inner valueStyle and labelStyle are defined", () => {
    const containerStyle: React.CSSProperties = {
      backgroundColor: "rgb(255, 0, 0)",
      borderColor: "rgb(0, 255, 0)",
    }
    const { container } = render(
      <Proof
        value="50+"
        label="Projects"
        valueSize={36}
        valueColor="#0000ff"
        labelSize={16}
        labelColor="#ff0000"
        style={containerStyle}
      />
    )
    const div = container.querySelector("div")
    const strong = container.querySelector("strong")
    const span = container.querySelector("span")

    // Check outer container style
    expect(div?.style.backgroundColor).toBe("rgb(255, 0, 0)")
    expect(div?.style.borderColor).toBe("rgb(0, 255, 0)")

    // Outer container style should NOT contain fontSize or color from inner elements
    expect(div?.style.fontSize).toBe("")
    expect(div?.style.color).toBe("")

    // Inner elements should have their own styles
    expect(strong?.style.fontSize).toBe("36px")
    expect(strong?.style.color).toBe("rgb(0, 0, 255)")

    expect(span?.style.fontSize).toBe("16px")
    expect(span?.style.color).toBe("rgb(255, 0, 0)")
  })

  it("applies inline style precedence over Tailwind classes on strong and span elements", () => {
    const { container } = render(
      <Proof
        value="24 hr"
        label="Response"
        valueSize={40}
        valueColor="#112233"
        labelSize={18}
        labelColor="#445566"
      />
    )
    const strong = container.querySelector("strong")!
    const span = container.querySelector("span")!

    // Tailwind classes are still present in className
    expect(strong.className).toContain("font-display text-2xl font-normal")
    expect(span.className).toContain("font-mono text-[10px] uppercase tracking-wider text-muted-foreground")

    // Inline style object contains inline properties
    expect(strong.style.fontSize).toBe("40px")
    expect(strong.style.color).toBe("rgb(17, 34, 51)")
    expect(span.style.fontSize).toBe("18px")
    expect(span.style.color).toBe("rgb(68, 85, 102)")
  })

  it("tests edge cases: valueSize=0, empty color strings, negative sizes, and NaN", () => {
    // 1. Test valueSize=0 (0 is falsy in JS, so valueSize ? ... : {} evaluates to false)
    const { container: c1 } = render(
      <Proof value="0" label="Zero test" valueSize={0} valueColor="" labelSize={0} labelColor="" />
    )
    const strong1 = c1.querySelector("strong")
    const span1 = c1.querySelector("span")
    // Because 0 and "" are falsy in JS, valueStyle and labelStyle are empty ({}), omitting style attribute
    expect(strong1?.getAttribute("style")).toBeNull()
    expect(span1?.getAttribute("style")).toBeNull()

    // 2. Test negative sizes & invalid color: JS passes object, but DOM CSS parser rejects invalid CSS values
    const { container: c2 } = render(
      <Proof value="-5" label="Negative" valueSize={-12} valueColor="custom-color-token" />
    )
    const strong2 = c2.querySelector("strong")
    // DOM CSS parser discards invalid CSS properties (-12px font-size and custom-color-token), resulting in null/empty style attribute
    expect(strong2?.getAttribute("style")).toBeNull()
    expect(strong2?.style.fontSize).toBe("")
    expect(strong2?.style.color).toBe("")

    // 3. Test NaN size (valueSize ? ... : {} -> NaN is falsy in JS, so valueStyle is {})
    const { container: c3 } = render(
      <Proof value="NaN" label="NaN Test" valueSize={NaN} />
    )
    const strong3 = c3.querySelector("strong")
    expect(strong3?.getAttribute("style")).toBeNull()
  })

  it("verifies tinaField bindings pass to DOM elements", () => {
    const { container } = render(
      <Proof
        value="Free"
        label="Quote"
        valueTinaField="query_id---hero.proofs.2.value"
        labelTinaField="query_id---hero.proofs.2.label"
      />
    )
    const strong = container.querySelector("strong")
    const span = container.querySelector("span")

    expect(strong?.getAttribute("data-tina-field")).toBe("query_id---hero.proofs.2.value")
    expect(span?.getAttribute("data-tina-field")).toBe("query_id---hero.proofs.2.label")
  })
})

describe("Hero Component - Proof Badges Integration & Data Mapping", () => {
  it("correctly calculates proofBackgroundOpacity and applies to proof items", () => {
    const proofs: HeroProof[] = [
      { value: "A", label: "Alpha", valueSize: 20, valueColor: "#111111" },
      { value: "B", label: "Beta", labelSize: 12, labelColor: "#222222" },
    ]

    // 1. Normal opacity 70
    const { container: c1 } = render(<Hero proofs={proofs} proofBackgroundOpacity={70} />)
    const proofDivs1 = c1.querySelectorAll<HTMLElement>('strong')
    const proofCard1 = proofDivs1[0]?.parentElement
    expect(proofCard1?.style.backgroundColor).toBe("color-mix(in srgb, var(--background) 70%, transparent)")

    // 2. Decimal opacity 0.8 => should convert to 80%
    const { container: c2 } = render(<Hero proofs={proofs} proofBackgroundOpacity={0.8} />)
    const proofCard2 = c2.querySelectorAll<HTMLElement>('strong')[0]?.parentElement
    expect(proofCard2?.style.backgroundColor).toBe("color-mix(in srgb, var(--background) 80%, transparent)")

    // 3. Out-of-bounds opacity (150 -> capped to 100, -20 -> capped to 0)
    const { container: c3 } = render(<Hero proofs={proofs} proofBackgroundOpacity={150} />)
    const proofCard3 = c3.querySelectorAll<HTMLElement>('strong')[0]?.parentElement
    expect(proofCard3?.style.backgroundColor).toBe("color-mix(in srgb, var(--background) 100%, transparent)")

    const { container: c4 } = render(<Hero proofs={proofs} proofBackgroundOpacity={-20} />)
    const proofCard4 = c4.querySelectorAll<HTMLElement>('strong')[0]?.parentElement
    expect(proofCard4?.style.backgroundColor).toBe("color-mix(in srgb, var(--background) 0%, transparent)")
  })

  it("handles empty proofs list and proof items with missing optional properties", () => {
    const proofs: HeroProof[] = [
      { value: "Only Value", label: "" },
    ]
    const { container } = render(<Hero proofs={proofs} />)
    expect(screen.getByText("Only Value")).toBeInTheDocument()
  })

  it("maps TinaCMS metadata across multiple proof items accurately", () => {
    const proofsWithMeta: HeroProof[] = [
      {
        value: "V1",
        label: "L1",
        _content_source: { queryId: "q1", path: ["hero", "proofs", 0] },
      },
      {
        value: "V2",
        label: "L2",
        _content_source: { queryId: "q1", path: ["hero", "proofs", 1] },
      },
    ]

    const { container } = render(
      <Hero
        _content_source={{ queryId: "q1", path: ["hero"] }}
        proofs={proofsWithMeta}
      />
    )

    const strongs = container.querySelectorAll("strong")
    const spans = container.querySelectorAll("span.font-mono")

    expect(strongs[0]?.getAttribute("data-tina-field")).toBe("q1---hero.proofs.0.value")
    expect(spans[0]?.getAttribute("data-tina-field")).toBe("q1---hero.proofs.0.label")

    expect(strongs[1]?.getAttribute("data-tina-field")).toBe("q1---hero.proofs.1.value")
    expect(spans[1]?.getAttribute("data-tina-field")).toBe("q1---hero.proofs.1.label")
  })
})

describe("Empirical Performance Harness - Proof Badges Rendering", () => {
  it("renders 500 Proof items without performance degradation (< 500ms execution time)", () => {
    const largeProofsList: HeroProof[] = Array.from({ length: 500 }, (_, i) => ({
      value: `Val ${i}`,
      label: `Label ${i}`,
      valueSize: 14 + (i % 20),
      valueColor: `#${(i * 123456).toString(16).padStart(6, "0").slice(0, 6)}`,
      labelSize: 10 + (i % 10),
      labelColor: `#${(i * 654321).toString(16).padStart(6, "0").slice(0, 6)}`,
    }))

    const start = performance.now()
    const { container } = render(<Hero proofs={largeProofsList} />)
    const end = performance.now()

    const duration = end - start
    const renderedCards = container.querySelectorAll("strong")

    expect(renderedCards.length).toBe(500)
    expect(duration).toBeLessThan(500) // Expect 500 components to render in < 500ms
  })

  it("handles 100 rapid consecutive re-renders efficiently", () => {
    const { rerender } = render(<Hero proofBackgroundOpacity={10} />)

    const start = performance.now()
    for (let i = 0; i < 100; i++) {
      rerender(
        <Hero
          proofBackgroundOpacity={i}
          proofs={[
            {
              value: `${i}`,
              label: `Step ${i}`,
              valueSize: 12 + (i % 10),
              valueColor: i % 2 === 0 ? "#111" : "#222",
            },
          ]}
        />
      )
    }
    const end = performance.now()
    const duration = end - start

    expect(duration).toBeLessThan(300) // 100 re-renders under 300ms
  })
})
