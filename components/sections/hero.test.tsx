import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Hero, type HeroProps } from "./hero"
import { tinaField } from "tinacms/dist/tina-field"

import { Proof } from "./shared"

describe("tinaField direct evaluation tests", () => {
  it("evaluates correctly when props is empty object ({})", () => {
    const props: HeroProps = {}
    const result = tinaField(props, "phoneNumber")
    expect(result).toBe("")
    expect(typeof result).toBe("string")
  })

  it("evaluates correctly when phoneNumber is undefined in props", () => {
    const props: HeroProps = { phoneNumber: undefined }
    const result = tinaField(props, "phoneNumber")
    expect(result).toBe("")
    expect(typeof result).toBe("string")
  })

  it("evaluates correctly when phoneNumber is customized string", () => {
    const props: HeroProps = { phoneNumber: "(805) 555-0199" }
    const result = tinaField(props, "phoneNumber")
    expect(result).toBe("")
    expect(typeof result).toBe("string")
  })

  it("evaluates correctly when TinaCMS _content_source metadata is present", () => {
    const props: HeroProps = {
      _content_source: {
        queryId: "hero_query_id",
        path: ["hero"],
      },
      phoneNumber: "(805) 760-8765",
    }
    const result = tinaField(props, "phoneNumber")
    expect(result).toBe("hero_query_id---hero.phoneNumber")
  })

  it("evaluates correctly when props is null or undefined (defensive check)", () => {
    expect(tinaField(null as any, "phoneNumber")).toBe("")
    expect(tinaField(undefined as any, "phoneNumber")).toBe("")
  })
})

describe("Hero component render stress-testing", () => {
  it("renders with default props when no props are provided", () => {
    const { container } = render(<Hero />)

    expect(screen.getByText("Ventura County, CA")).toBeInTheDocument()
    expect(screen.getByText("A cleaner home.")).toBeInTheDocument()
    expect(screen.getByText("A lighter life.")).toBeInTheDocument()
    expect(screen.getByText("Professional Cleaning Services")).toBeInTheDocument()
    expect(screen.getByText("(805) 760-8765")).toBeInTheDocument()

    // Check data-tina-field on phone button container/button
    const phoneLink = container.querySelector('a[href="tel:+18057608765"]')
    expect(phoneLink).toBeInTheDocument()
    expect(phoneLink?.textContent).toContain("(805) 760-8765")

    const phoneButton = phoneLink?.closest('[data-tina-field]')
    expect(phoneButton).toBeInTheDocument()
    expect(phoneButton?.getAttribute("data-tina-field")).toBe("")
  })

  it("renders correctly when phoneNumber is explicitly undefined in props", () => {
    const { container } = render(<Hero phoneNumber={undefined} />)

    // Note: JS spread {...defaults, ...{ phoneNumber: undefined }} yields { phoneNumber: undefined }
    // Thus phoneNumber evaluates to undefined in component
    const phoneButton = container.querySelector('a[href^="tel:"]')?.closest('[data-tina-field]')
    expect(phoneButton).toBeInTheDocument()
    expect(phoneButton?.getAttribute("data-tina-field")).toBe("")

    const phoneLink = container.querySelector('a[href^="tel:"]')
    expect(phoneLink?.getAttribute("href")).toBe("tel:+1undefined")
  })

  it("renders correctly when phoneNumber is empty string", () => {
    const { container } = render(<Hero phoneNumber="" />)

    const phoneLink = container.querySelector('a[href^="tel:"]')
    expect(phoneLink?.getAttribute("href")).toBe("tel:+1")
    const phoneButton = phoneLink?.closest('[data-tina-field]')
    expect(phoneButton?.getAttribute("data-tina-field")).toBe("")
  })

  it("renders correctly with customized phoneNumber", () => {
    const customPhone = "(555) 987-6543"
    const { container } = render(<Hero phoneNumber={customPhone} />)

    expect(screen.getByText(customPhone)).toBeInTheDocument()
    const phoneLink = container.querySelector('a[href="tel:+15559876543"]')
    expect(phoneLink).toBeInTheDocument()

    const phoneButton = phoneLink?.closest('[data-tina-field]')
    expect(phoneButton?.getAttribute("data-tina-field")).toBe("")
  })

  it("evaluates data-tina-field attribute properly when TinaCMS metadata is supplied", () => {
    const props: HeroProps = {
      _content_source: {
        queryId: "test_query_abc",
        path: ["hero_data"],
      },
      phoneNumber: "(800) 555-0199",
      location: "Los Angeles, CA",
    }

    const { container } = render(<Hero {...props} />)

    const phoneButton = container.querySelector('a[href="tel:+18005550199"]')?.closest('[data-tina-field]')
    expect(phoneButton?.getAttribute("data-tina-field")).toBe("test_query_abc---hero_data.phoneNumber")

    const locationElem = container.querySelector('[data-tina-field="test_query_abc---hero_data.location"]')
    expect(locationElem).toBeInTheDocument()
    expect(locationElem?.textContent).toBe("Los Angeles, CA")
  })

  it("handles missing proofs array without throwing runtime error", () => {
    const { container } = render(<Hero proofs={undefined} />)
    const proofsContainer = container.querySelector('[data-tina-field]')
    expect(proofsContainer).toBeInTheDocument()
  })

  it("handles empty proofs array without throwing runtime error", () => {
    const { container } = render(<Hero proofs={[]} />)
    expect(container.textContent).not.toContain("Response time")
  })

  it("handles imageSrc undefined or whitespace without breaking background rendering", () => {
    const { container: container1 } = render(<Hero imageSrc={undefined} />)
    expect(container1.querySelector("img")).toBeNull()

    const { container: container2 } = render(<Hero imageSrc="   " />)
    expect(container2.querySelector("img")).toBeNull()
  })

  it("applies proofBackgroundOpacity dynamic style to Proof cards", () => {
    const { container } = render(<Hero proofBackgroundOpacity={50} />)
    const proofCard = container.querySelector('strong')?.parentElement
    expect(proofCard).toBeInTheDocument()
    expect(proofCard?.style.backgroundColor).toContain("color-mix(in srgb, var(--background) 50%, transparent)")
  })

  it("passes valueTinaField and labelTinaField attributes to Proof elements with TinaCMS metadata", () => {
    const proofObj = {
      value: "24 hr",
      label: "Response time",
      _content_source: {
        queryId: "test_query",
        path: ["hero", "proofs", 0],
      },
    }
    const props: HeroProps = {
      proofs: [proofObj],
    }
    const { container } = render(<Hero {...props} />)
    const valueElem = container.querySelector('strong')
    const labelElem = container.querySelector('span.font-mono')
    expect(valueElem?.getAttribute("data-tina-field")).toBe("test_query---hero.proofs.0.value")
    expect(labelElem?.getAttribute("data-tina-field")).toBe("test_query---hero.proofs.0.label")
  })

  it("applies dynamic font size and color inline styles to Proof items when specified", () => {
    const proofObj = {
      value: "24 hr",
      label: "Response time",
      valueSize: 28,
      valueColor: "#123456",
      labelSize: 14,
      labelColor: "#654321",
    }
    const props: HeroProps = {
      proofs: [proofObj],
    }
    const { container } = render(<Hero {...props} />)
    const valueElem = container.querySelector<HTMLElement>("strong")
    const labelElem = container.querySelector<HTMLElement>("span.font-mono")

    expect(valueElem).toBeInTheDocument()
    expect(valueElem?.style.fontSize).toBe("28px")
    expect(valueElem?.style.color).toBe("rgb(18, 52, 86)")

    expect(labelElem).toBeInTheDocument()
    expect(labelElem?.style.fontSize).toBe("14px")
    expect(labelElem?.style.color).toBe("rgb(101, 67, 33)")
  })
})

describe("Proof Badges Empirical Stress Testing", () => {
  describe("Edge Case 1: Value-only or Label-only rendering", () => {
    it("renders correctly with value only (empty string label)", () => {
      const { container } = render(<Proof value="100+" label="" />)
      const strongElem = container.querySelector("strong")
      const spanElem = container.querySelector("span")
      expect(strongElem?.textContent).toBe("100+")
      expect(spanElem?.textContent).toBe("")
      expect(strongElem).toBeInTheDocument()
      expect(spanElem).toBeInTheDocument()
    })

    it("renders correctly with value only (undefined label)", () => {
      const { container } = render(<Proof value="100+" label={undefined as any} />)
      const strongElem = container.querySelector("strong")
      const spanElem = container.querySelector("span")
      expect(strongElem?.textContent).toBe("100+")
      expect(spanElem?.textContent).toBe("")
    })

    it("renders correctly with label only (empty string value)", () => {
      const { container } = render(<Proof value="" label="Verified" />)
      const strongElem = container.querySelector("strong")
      const spanElem = container.querySelector("span")
      expect(strongElem?.textContent).toBe("")
      expect(spanElem?.textContent).toBe("Verified")
    })

    it("renders correctly with label only (undefined value)", () => {
      const { container } = render(<Proof value={undefined as any} label="Verified" />)
      const strongElem = container.querySelector("strong")
      const spanElem = container.querySelector("span")
      expect(strongElem?.textContent).toBe("")
      expect(spanElem?.textContent).toBe("Verified")
    })

    it("renders empty badge structure when both value and label are empty strings", () => {
      const { container } = render(<Proof value="" label="" />)
      const strongElem = container.querySelector("strong")
      const spanElem = container.querySelector("span")
      expect(strongElem?.textContent).toBe("")
      expect(spanElem?.textContent).toBe("")
    })
  })

  describe("Edge Case 2: Zero size and numeric boundary behavior", () => {
    it("evaluates size=0 as falsy and falls back to default CSS styling without inline fontSize", () => {
      const { container } = render(<Proof value="100%" label="Satisfaction" valueSize={0} labelSize={0} />)
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      // Because valueSize = 0 is falsy in JS `valueSize ? ...`, no inline fontSize should be rendered
      expect(strongElem?.style.fontSize).toBe("")
      expect(spanElem?.style.fontSize).toBe("")
    })

    it("handles decimal size values cleanly (e.g. 18.5px)", () => {
      const { container } = render(<Proof value="5★" label="Rating" valueSize={22.5} labelSize={11.25} />)
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      expect(strongElem?.style.fontSize).toBe("22.5px")
      expect(spanElem?.style.fontSize).toBe("11.25px")
    })

    it("handles negative size values (CSS parser discards invalid negative length, leaving empty fontSize)", () => {
      const { container } = render(<Proof value="5★" label="Rating" valueSize={-10} labelSize={-5} />)
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      // Negative font-sizes are invalid CSS, so DOM parser discards them
      expect(strongElem?.style.fontSize).toBe("")
      expect(spanElem?.style.fontSize).toBe("")
    })
  })

  describe("Edge Case 3: Partial color inputs & varied CSS color formats", () => {
    it("applies valueColor without valueSize set", () => {
      const { container } = render(<Proof value="50+" label="Projects" valueColor="#ff0000" />)
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      expect(strongElem?.style.color).toBe("rgb(255, 0, 0)")
      expect(strongElem?.style.fontSize).toBe("")
      expect(spanElem?.style.color).toBe("")
    })

    it("applies labelColor without labelSize set", () => {
      const { container } = render(<Proof value="50+" label="Projects" labelColor="#00ff00" />)
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      expect(spanElem?.style.color).toBe("rgb(0, 255, 0)")
      expect(spanElem?.style.fontSize).toBe("")
      expect(strongElem?.style.color).toBe("")
    })

    it("handles HSL, RGB, RGBA, and CSS variables for colors", () => {
      const { container } = render(
        <Proof
          value="10/10"
          label="Score"
          valueColor="hsl(120, 100%, 25%)"
          labelColor="var(--primary)"
        />
      )
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      // JSDOM normalizes HSL to RGB
      expect(strongElem?.style.color).toBe("rgb(0, 128, 0)")
      expect(spanElem?.style.color).toBe("var(--primary)")
    })

    it("ignores empty string color inputs as falsy", () => {
      const { container } = render(<Proof value="Test" label="Test" valueColor="" labelColor="" />)
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      expect(strongElem?.style.color).toBe("")
      expect(spanElem?.style.color).toBe("")
    })
  })

  describe("Edge Case 4: Undefined, null, and high-contrast / dark-mode inheritance", () => {
    it("handles all size and color props being explicitly undefined", () => {
      const { container } = render(
        <Proof
          value="Clean"
          label="Status"
          valueSize={undefined}
          valueColor={undefined}
          labelSize={undefined}
          labelColor={undefined}
        />
      )
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      expect(strongElem?.getAttribute("style")).toBeNull()
      expect(spanElem?.getAttribute("style")).toBeNull()
    })

    it("overrides parent text color classes when explicit high-contrast valueColor or labelColor is provided", () => {
      const { container } = render(
        <div className="text-white">
          <Proof
            value="Contrast"
            label="Check"
            valueColor="#000000"
            labelColor="#ffff00"
          />
        </div>
      )
      const strongElem = container.querySelector<HTMLElement>("strong")
      const spanElem = container.querySelector<HTMLElement>("span")

      expect(strongElem?.style.color).toBe("rgb(0, 0, 0)")
      expect(spanElem?.style.color).toBe("rgb(255, 255, 0)")
    })
  })

  describe("Edge Case 5: Hero component integration with duplicate & missing labels", () => {
    it("renders proof items with duplicate labels without crashing", () => {
      const duplicateProofs = [
        { value: "10", label: "Duplicate" },
        { value: "20", label: "Duplicate" },
      ]
      const { container } = render(<Hero proofs={duplicateProofs} />)
      const strongElems = container.querySelectorAll("strong")
      expect(strongElems.length).toBe(2)
      expect(strongElems[0].textContent).toBe("10")
      expect(strongElems[1].textContent).toBe("20")
    })

    it("renders proof items with undefined or missing labels in Hero", () => {
      const missingLabelProofs = [
        { value: "100", label: undefined as any },
        { value: "200", label: "" },
      ]
      const { container } = render(<Hero proofs={missingLabelProofs} />)
      const strongElems = container.querySelectorAll("strong")
      expect(strongElems.length).toBe(2)
      expect(strongElems[0].textContent).toBe("100")
      expect(strongElems[1].textContent).toBe("200")
    })

    it("renders hero proof badges with customized sizes & colors for each proof badge independently", () => {
      const customProofs = [
        { value: "Badge 1", label: "Label 1", valueSize: 30, valueColor: "#111111", labelSize: 15, labelColor: "#222222" },
        { value: "Badge 2", label: "Label 2", valueSize: 40, valueColor: "#333333", labelSize: 16, labelColor: "#444444" },
      ]
      const { container } = render(<Hero proofs={customProofs} />)
      const strongElems = container.querySelectorAll<HTMLElement>("strong")
      const spanElems = container.querySelectorAll<HTMLElement>("span.font-mono")

      expect(strongElems[0].style.fontSize).toBe("30px")
      expect(strongElems[0].style.color).toBe("rgb(17, 17, 17)")
      expect(spanElems[0].style.fontSize).toBe("15px")
      expect(spanElems[0].style.color).toBe("rgb(34, 34, 34)")

      expect(strongElems[1].style.fontSize).toBe("40px")
      expect(strongElems[1].style.color).toBe("rgb(51, 51, 51)")
      expect(spanElems[1].style.fontSize).toBe("16px")
      expect(spanElems[1].style.color).toBe("rgb(68, 68, 68)")
    })
  })
})

