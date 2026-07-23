import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Hero, type HeroProps } from "./hero"
import { tinaField } from "tinacms/dist/tina-field"

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
})
