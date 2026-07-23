import { Hero, type HeroProps } from "@/components/sections/hero"
import { Services, type ServicesProps } from "@/components/sections/services"
import { Process, type ProcessProps } from "@/components/sections/process"
import { About, type AboutProps } from "@/components/sections/about"
import { Testimonials, type TestimonialsProps } from "@/components/sections/testimonials"
import { Contact, type ContactProps } from "@/components/sections/contact"
import { Footer, type FooterProps } from "@/components/sections/footer"

/* ── Tina block type discriminators ── */

export type Block =
  | ({ _template: "hero" } & HeroProps)
  | ({ _template: "services" } & ServicesProps)
  | ({ _template: "process" } & ProcessProps)
  | ({ _template: "about" } & AboutProps)
  | ({ _template: "testimonials" } & TestimonialsProps)
  | ({ _template: "contact" } & ContactProps)
  | ({ _template: "footer" } & FooterProps)

/* ── Helper: get template name from either _template or __typename ── */

function getTemplate(block: any): string | undefined {
  if (block._template) return block._template
  if (block.__typename?.startsWith("PageSections")) {
    return block.__typename.replace("PageSections", "").toLowerCase()
  }
  return undefined
}

/* ── Block renderer ── */

export function renderBlock(block: Block, index: number) {
  const template = getTemplate(block)
  switch (template) {
    case "hero":
      return <Hero key={`hero-${index}`} {...(block as HeroProps)} />
    case "services":
      return <Services key={`services-${index}`} {...(block as ServicesProps)} />
    case "process":
      return <Process key={`process-${index}`} {...(block as ProcessProps)} />
    case "about":
      return <About key={`about-${index}`} {...(block as AboutProps)} />
    case "testimonials":
      return <Testimonials key={`testimonials-${index}`} {...(block as TestimonialsProps)} />
    case "contact":
      return <Contact key={`contact-${index}`} {...(block as ContactProps)} />
    case "footer":
      return <Footer key={`footer-${index}`} {...(block as FooterProps)} />
    default:
      return null
  }
}

/* ── Section registry (for navigation) ── */

export interface NavEntry {
  id: string
  label: string
  href: string
}

const sectionLabels: Record<string, string> = {
  hero: "",
  services: "Services",
  process: "Process",
  about: "About",
  testimonials: "Reviews",
  contact: "Contact",
  footer: "",
}

export function buildNavLinks(sections: Block[]): NavEntry[] {
  return sections
    .filter((s) => {
      const t = getTemplate(s)
      return t ? sectionLabels[t] : false
    })
    .map((s) => {
      const t = getTemplate(s)!
      return {
        id: t,
        label: sectionLabels[t],
        href: `#${t}`,
      }
    })
}

/* ── Default blocks for fallback (no Tina credentials) ── */

export const defaultBlocks: Block[] = [
  {
    _template: "hero",
    location: "Ventura County, CA",
    headingLine1: "A cleaner home.",
    headingLine2: "A lighter life.",
    subheading: "Professional Cleaning Services",
    phoneNumber: "(805) 760-8765",
    calloutTitle: "Care you can feel",
    calloutText: "Every surface considered. Every room treated like our own.",
    proofs: [
      { value: "24 hr", label: "Response time" },
      { value: "Local", label: "Owner-led team" },
      { value: "Free", label: "Personalized quote" },
    ],
    headingLine1X: 0,
    headingLine1Y: 0,
    headingLine2X: 0,
    headingLine2Y: 0,
    subheadingX: 0,
    subheadingY: 0,
    imageSrc: "/images/breeze-clean-home.png",
    imageAlt: "A bright, professionally cleaned modern home",
  } as HeroProps & { _template: "hero" },
  {
    _template: "services",
    eyebrow: "01 / Our services",
    heading: "Clean, your way.",
    copy: "Professional cleaning tailored to your home — because your time matters.",
    disclaimer: "either through an in-person visit or by sending 3–5 photos/videos. This ensures you receive a fair and accurate price.",
  } as ServicesProps & { _template: "services" },
  {
    _template: "about",
    eyebrow: "03 / Meet the owner",
    ownerName: "Evelyn Rivas",
    nameInitial: "E",
    tagline: "Owner-led care in Ventura County.",
    bioParagraph1: "Evelyn started Breeze because she believes a clean home shouldn't feel like a luxury. Based in Ventura County, she and her team treat every home like their own — with care, attention to detail, and a genuine pride in making spaces shine.",
    bioParagraph2: "When you book with Breeze, you're not just getting a clean home — you're getting someone who truly cares about getting it right.",
  } as AboutProps & { _template: "about" },
  {
    _template: "testimonials",
    eyebrow: "04 / Testimonials",
    heading: "Care that shows.",
    copy: "This section is ready for your real customer feedback. The reviews below are clearly labeled sample content.",
    reviews: [
      { quote: "The house felt completely refreshed, and every detail was handled with care.", byline: "Sample review · Replace with customer name" },
      { quote: "Clear communication, thoughtful service, and a result we were proud to come home to.", byline: "Sample review · Replace with customer name" },
      { quote: "Breeze made the whole process feel easy from the first quote to the final walkthrough.", byline: "Sample review · Replace with customer name" },
    ],
  } as TestimonialsProps & { _template: "testimonials" },
  {
    _template: "contact",
    eyebrow: "05 / Get in touch",
    heading: "We'd love to hear from you.",
    address: "Ventura County, CA",
    phone: "(805) 760-8765",
    phoneHref: "tel:+18057608765",
    email: "sacrementado27@gmail.com",
    emailHref: "mailto:sacrementado27@gmail.com",
    hours: "We reply within 24 hours",
  } as ContactProps & { _template: "contact" },
  {
    _template: "footer",
    tagline: "Professional cleaning services in Ventura County, California.",
  } as FooterProps & { _template: "footer" },
]
