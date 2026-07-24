"use client"

import { ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBooking } from "@/components/booking/booking-drawer"
import { SectionHeader, StyledText } from "@/components/sections/shared"
import { tinaField } from "tinacms/dist/tina-field"

export interface ReviewEntry {
  quote: string
  byline: string
}

export interface ReviewsProps {
  eyebrow?: string
  heading?: string
  copy?: string
  reviews?: ReviewEntry[]
  address?: string
  phone?: string
  phoneHref?: string
  email?: string
  emailHref?: string
  hours?: string
  [key: string]: any
}

const defaults: ReviewsProps = {
  eyebrow: "04 / Testimonials",
  heading: "What our clients say.",
  copy: "",
  reviews: [
    { quote: "The house felt completely refreshed, and every detail was handled with care.", byline: "Sample review" },
    { quote: "Clear communication, thoughtful service, and a result we were proud to come home to.", byline: "Sample review" },
    { quote: "Breeze made the whole process feel easy from the first quote to the final walkthrough.", byline: "Sample review" },
  ],
  address: "Ventura County, CA",
  phone: "(805) 760-8765",
  phoneHref: "tel:+18057608765",
  email: "sacrementado27@gmail.com",
  emailHref: "mailto:sacrementado27@gmail.com",
  hours: "We reply within 24 hours",
}

export function Reviews(props: ReviewsProps) {
  const { openBooking } = useBooking()
  const {
    eyebrow, heading, copy, reviews,
    address, phone, phoneHref, email, emailHref, hours,
    eyebrowVisible, eyebrowSize, eyebrowColor,
    headingVisible, headingX, headingY, headingSize, headingColor,
    copyVisible, copyX, copyY, copySize, copyColor,
    addressVisible, addressSize, addressColor,
    phoneVisible, phoneSize, phoneColor,
    emailVisible, emailSize, emailColor,
    hoursVisible, hoursSize, hoursColor,
  } = { ...defaults, ...props }

  const details: Array<{ icon: typeof MapPin; label: string; href: string; visible?: boolean; size?: number; color?: string; field: string }> = [
    { icon: MapPin, label: address || "", href: "#", visible: addressVisible, size: addressSize, color: addressColor, field: "address" },
    { icon: Phone, label: phone || "", href: phoneHref || "", visible: phoneVisible, size: phoneSize, color: phoneColor, field: "phone" },
    { icon: Mail, label: email || "", href: emailHref || "", visible: emailVisible, size: emailSize, color: emailColor, field: "email" },
    { icon: Clock3, label: hours || "", href: "#", visible: hoursVisible, size: hoursSize, color: hoursColor, field: "hours" },
  ]

  return (
    <section id="reviews" className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12">
        <SectionHeader
          eyebrow={eyebrow || ""}
          title={heading || ""}
          copy={copy || ""}
          tinaFields={{
            eyebrow: tinaField(props, "eyebrow"),
            title: tinaField(props, "heading"),
            copy: tinaField(props, "copy"),
          }}
          eyebrowVisible={eyebrowVisible}
          eyebrowSize={eyebrowSize}
          eyebrowColor={eyebrowColor}
          titleVisible={headingVisible}
          titleX={headingX}
          titleY={headingY}
          titleSize={headingSize}
          titleColor={headingColor}
          copyVisible={copyVisible}
          copyX={copyX}
          copyY={copyY}
          copySize={copySize}
          copyColor={copyColor}
        />

        <div data-tina-field={tinaField(props, "reviews")} className="mb-16 grid gap-px border border-border bg-border lg:grid-cols-3">
          {(reviews || []).map((review) => (
            <figure key={review.quote} className="flex min-h-48 flex-col justify-between bg-card p-6 sm:p-8">
              <div className="flex gap-1 text-accent" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote className="text-pretty font-display text-2xl leading-snug">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {review.byline}
              </figcaption>
            </figure>
          ))}
        </div>

        <div id="contact" className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="text-balance font-display text-5xl leading-none sm:text-7xl lg:text-8xl">
              Contact Us
            </h3>
            <Button className="mt-8" size="lg" onClick={() => openBooking()}>
              Start your free quote <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
          <div className="flex flex-col justify-end gap-3 lg:col-span-5">
            {details.map(({ icon: Icon, label, href, visible, field }) => (
              <StyledText
                as="a"
                key={field}
                visible={visible}
                href={href}
                className="flex items-center gap-4 border-b border-border py-5 text-muted-foreground transition-colors hover:text-foreground"
                data-tina-field={tinaField(props, field)}
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <span>{String(label)}</span>
              </StyledText>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
