import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { About, type AboutProps } from "./about"

describe("About Component - Edge Cases & Empirical Stress Tests", () => {
  describe("1. Default & Missing Optional Fields (Empty object / Unset props)", () => {
    it("renders with full defaults when no props are passed (<About />)", () => {
      const { container } = render(<About />)

      // Eyebrow renders in both SectionHeader and fallback media box when image is unset
      expect(screen.getAllByText("03 / Meet the owner").length).toBe(2)
      // Owner name renders in both SectionHeader title and Bio card h2
      expect(screen.getAllByText("Evelyn Rivas").length).toBe(2)
      // Tagline renders in both SectionHeader copy and fallback media box
      expect(screen.getAllByText("Owner-led care in Ventura County.").length).toBe(2)

      // Verify Bio paragraphs defaults
      expect(
        screen.getByText(/Evelyn started Breeze because she believes a clean home/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/When you book with Breeze, you're not just getting a clean home/i)
      ).toBeInTheDocument()

      // Verify Fallback Blue Box is rendered when image is unset
      expect(screen.getByText("E")).toBeInTheDocument()
      const fallbackBox = container.querySelector(".bg-primary")
      expect(fallbackBox).toBeInTheDocument()
    })

    it("renders cleanly with an empty object ({}) passed as props", () => {
      const { container } = render(<About {...{}} />)

      expect(screen.getAllByText("03 / Meet the owner").length).toBe(2)
      expect(screen.getAllByText("Evelyn Rivas").length).toBe(2)
      expect(screen.getByText("E")).toBeInTheDocument()
    })
  })

  describe("2. Undefined Image & Focal Point Handling", () => {
    it("renders fallback initial box when image is explicitly undefined", () => {
      const { container } = render(<About image={undefined} nameInitial="J" />)

      expect(screen.getByText("J")).toBeInTheDocument()
      expect(container.querySelector("img")).not.toBeInTheDocument()
      const fallbackBox = container.querySelector(".bg-primary")
      expect(fallbackBox).toBeInTheDocument()
    })

    it("renders image container when valid image path is provided", () => {
      const { container } = render(
        <About image="/images/owner.jpg" focalPoint="30% 40%" ownerName="Sarah" />
      )

      const imageEl = container.querySelector("img")
      expect(imageEl).toBeInTheDocument()
      expect(imageEl?.getAttribute("src")).toContain("owner.jpg")
      expect(imageEl?.style.objectPosition).toBe("30% 40%")
    })

    it("defaults focalPoint to '50% 0%' when image is present but focalPoint is undefined", () => {
      const { container } = render(<About image="/images/owner.jpg" focalPoint={undefined} />)

      const imageEl = container.querySelector("img")
      expect(imageEl).toBeInTheDocument()
      expect(imageEl?.style.objectPosition).toBe("50% 0%")
    })

    it("defaults focalPoint to '50% 0%' when focalPoint is empty string", () => {
      const { container } = render(<About image="/images/owner.jpg" focalPoint="" />)

      const imageEl = container.querySelector("img")
      expect(imageEl).toBeInTheDocument()
      expect(imageEl?.style.objectPosition).toBe("50% 0%")
    })

    it("treats whitespace-only image string as falsy and renders fallback box", () => {
      const { container } = render(<About image="   " nameInitial="W" />)

      expect(screen.getByText("W")).toBeInTheDocument()
      expect(container.querySelector("img")).not.toBeInTheDocument()
      expect(container.querySelector(".bg-primary")).toBeInTheDocument()
    })
  })

  describe("3. Empty Strings & Explicit Undefined Props", () => {
    it("handles explicit undefined values for text props without crashing", () => {
      const { container } = render(
        <About
          eyebrow={undefined}
          ownerName={undefined}
          tagline={undefined}
          bioParagraph1={undefined}
          bioParagraph2={undefined}
          nameInitial={undefined}
        />
      )

      expect(container).toBeInTheDocument()
    })

    it("handles empty strings for eyebrow, ownerName, tagline, bioParagraphs, nameInitial", () => {
      const { container } = render(
        <About
          eyebrow=""
          ownerName=""
          tagline=""
          bioParagraph1=""
          bioParagraph2=""
          nameInitial=""
        />
      )

      expect(container).toBeInTheDocument()
      const h2Elements = container.querySelectorAll("h2")
      expect(h2Elements.length).toBeGreaterThan(0)
    })

    it("handles whitespace-only text props gracefully without rendering blank blocks", () => {
      const { container } = render(
        <About
          eyebrow="   "
          tagline="   "
          nameInitial="   "
        />
      )

      // SectionHeader hasEyebrow should be false
      expect(container.querySelector(".font-mono.text-xs.text-primary")).not.toBeInTheDocument()
    })
  })

  describe("4. Dynamic Controls (X, Y, Size, Color, Visibility)", () => {
    it("hides elements when visibility props are false", () => {
      render(
        <About
          ownerNameVisible={false}
          bioParagraph1Visible={false}
          bioParagraph2Visible={false}
          eyebrowVisible={false}
        />
      )

      // SectionHeader titleVisible={false} hides SectionHeader title
      // ownerNameVisible={false} hides bio card h2
      expect(screen.queryByText("Evelyn Rivas")).not.toBeInTheDocument()
      expect(
        screen.queryByText(/Evelyn started Breeze because she believes/i)
      ).not.toBeInTheDocument()
    })

    it("applies dynamic X, Y transform styles correctly to both ownerName instances", () => {
      render(
        <About
          ownerName="Offset Name"
          ownerNameX={25}
          ownerNameY={-15}
          bioParagraph1X={10}
          bioParagraph1Y={5}
        />
      )

      const ownerH2s = screen.getAllByText("Offset Name")
      expect(ownerH2s.length).toBe(2)
      ownerH2s.forEach((el) => {
        expect(el.style.transform).toBe("translate(25px, -15px)")
      })

      const bio1 = screen.getByText(/Evelyn started Breeze/i)
      expect(bio1.style.transform).toBe("translate(10px, 5px)")
    })

    it("applies dynamic size and color styles correctly", () => {
      render(
        <About
          ownerName="Styled Name"
          ownerNameSize={42}
          ownerNameColor="#ff0000"
          bioParagraph1Size={18}
          bioParagraph1Color="rgb(0, 128, 0)"
          bioParagraph2Size={16}
          bioParagraph2Color="rgb(64, 149, 191)"
        />
      )

      const ownerH2s = screen.getAllByText("Styled Name")
      expect(ownerH2s.length).toBe(2)
      ownerH2s.forEach((el) => {
        expect(el.style.fontSize).toBe("42px")
        expect(el.style.color).toBe("rgb(255, 0, 0)")
      })

      const bio1 = screen.getByText(/Evelyn started Breeze/i)
      expect(bio1.style.fontSize).toBe("18px")
      expect(bio1.style.color).toBe("rgb(0, 128, 0)")

      const bio2 = screen.getByText(/When you book with Breeze/i)
      expect(bio2.style.fontSize).toBe("16px")
      expect(bio2.style.color).toBe("rgb(64, 149, 191)")
    })
  })

  describe("5. TinaCMS Data-Tina-Field Integration", () => {
    it("includes data-tina-field attributes for CMS editing", () => {
      const props: AboutProps = {
        _content_source: {
          queryId: "about_query_id",
          path: ["about"],
        },
        eyebrow: "Custom Eyebrow",
        ownerName: "Custom Owner",
        tagline: "Custom Tagline",
        bioParagraph1: "Custom Bio 1",
        bioParagraph2: "Custom Bio 2",
      }

      render(<About {...props} />)

      const ownerH2s = screen.getAllByText("Custom Owner")
      expect(ownerH2s.length).toBe(2)
      ownerH2s.forEach((el) => {
        expect(el.getAttribute("data-tina-field")).toBe("about_query_id---about.ownerName")
      })

      const bio1 = screen.getByText("Custom Bio 1")
      expect(bio1.getAttribute("data-tina-field")).toBe("about_query_id---about.bioParagraph1")

      const bio2 = screen.getByText("Custom Bio 2")
      expect(bio2.getAttribute("data-tina-field")).toBe("about_query_id---about.bioParagraph2")
    })
  })

  describe("6. Stress Testing Extreme Inputs & Special Characters", () => {
    it("handles extremely long strings without crashing", () => {
      const longName = "A".repeat(5000)
      const longBio = "B".repeat(10000)

      const { container } = render(
        <About ownerName={longName} bioParagraph1={longBio} />
      )

      expect(container).toBeInTheDocument()
      expect(screen.getAllByText(longName).length).toBe(2)
      expect(screen.getByText(longBio)).toBeInTheDocument()
    })

    it("safely escapes HTML special characters and XSS test strings", () => {
      const xssString = `<script>alert("xss")</script> & <img src=x onerror=alert(1) />`

      render(<About ownerName={xssString} bioParagraph1={xssString} />)

      const renderedNodes = screen.getAllByText(xssString)
      expect(renderedNodes.length).toBeGreaterThan(0)
    })
  })

  describe("7. Layout Alignment & Responsive Padding Verification", () => {
    it("renders media card without cell-level wrapper padding so image block fills cell edge-to-edge", () => {
      const { container } = render(<About />)

      const mediaCardCell = container.querySelector(".lg\\:col-span-5")
      expect(mediaCardCell).toBeInTheDocument()

      // Outer media cell should not have p-6 / sm:p-8 indents, allowing edge-to-edge alignment
      expect(mediaCardCell?.className).toContain("bg-card")
      expect(mediaCardCell?.className).not.toContain("p-6")
      expect(mediaCardCell?.className).not.toContain("sm:p-8")
    })

    it("applies responsive padding p-6 sm:p-8 lg:p-12 consistently to bio card and image overlay/fallback", () => {
      const { container } = render(<About />)

      const bioCardCell = container.querySelector(".lg\\:col-span-7")
      expect(bioCardCell).toBeInTheDocument()
      expect(bioCardCell?.className).toContain("p-6")
      expect(bioCardCell?.className).toContain("sm:p-8")
      expect(bioCardCell?.className).toContain("lg:p-12")

      const fallbackContent = container.querySelector(".text-primary-foreground")
      expect(fallbackContent).toBeInTheDocument()
      expect(fallbackContent?.className).toContain("p-6")
      expect(fallbackContent?.className).toContain("sm:p-8")
      expect(fallbackContent?.className).toContain("lg:p-12")
    })

    it("renders image directly without gradient overlay when image is provided", () => {
      const { container } = render(<About image="/images/owner.jpg" />)

      const image = container.querySelector("img")
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute("alt", "Evelyn Rivas")

      const overlay = container.querySelector(".bg-gradient-to-t")
      expect(overlay).not.toBeInTheDocument()
    })
  })
})
