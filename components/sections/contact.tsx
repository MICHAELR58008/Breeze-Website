"use client"

import { ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBooking } from "@/components/booking/booking-drawer"
import { tinaField } from "tinacms/dist/tina-field"
import { StyledText } from "@/components/sections/shared"

export interface ContactDetail {
  icon: string
  label: string
  href: string
}

export interface ContactProps {
  eyebrow?: string
  heading?: string
  address?: string
  phone?: string
  phoneHref?: string
  email?: string
  emailHref?: string
  hours?: string
  [key: string]: any
}

const defaults: ContactProps = {
  eyebrow: "05 / Get in touch",
  heading: "We'd love to hear from you.",
  address: "Ventura County, CA",
  phone: "(805) 760-8765",
  phoneHref: "tel:+18057608765",
  email: "sacrementado27@gmail.com",
  emailHref: "mailto:sacrementado27@gmail.com",
  hours: "We reply within 24 hours",
}

export function Contact(props: ContactProps) {
  const { openBooking } = useBooking()
  const { eyebrow, heading, address, phone, phoneHref, email, emailHref, hours, eyebrowVisible, eyebrowSize, eyebrowColor, headingVisible, headingX, headingY, headingSize, headingColor, addressVisible, addressSize, addressColor, phoneVisible, phoneSize, phoneColor, emailVisible, emailSize, emailColor, hoursVisible, hoursSize, hoursColor } = {
    ...defaults,
    ...props,
  }

  const details: Array<{ icon: typeof MapPin; label: string; href: string; field: string }> = [
    { icon: MapPin, label: address || "", href: "#", field: "address" },
    { icon: Phone, label: phone || "", href: phoneHref || "", field: "phone" },
    { icon: Mail, label: email || "", href: emailHref || "", field: "email" },
    { icon: Clock3, label: hours || "", href: "#", field: "hours" },
  ]

  return (
    <section id="contact" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StyledText
            as="p"
            visible={eyebrowVisible}
            size={eyebrowSize}
            color={eyebrowColor}
            className="mb-5 font-mono text-xs uppercase tracking-widest text-primary"
            data-tina-field={tinaField(props, "eyebrow")}
          >
            {eyebrow}
          </StyledText>
          <StyledText
            as="h2"
            visible={headingVisible}
            x={headingX}
            y={headingY}
            size={headingSize}
            color={headingColor}
            className="text-balance font-display text-6xl leading-none sm:text-8xl lg:text-9xl"
            data-tina-field={tinaField(props, "heading")}
          >
            {heading}
          </StyledText>
          <Button className="mt-8" size="lg" onClick={() => openBooking()}>
            Start your free quote <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
        <div className="flex flex-col justify-end gap-3 lg:col-span-5">
          {details.map(({ icon: Icon, label, href, field }) => {
            const visibleMap: Record<string, boolean | undefined> = {
              address: addressVisible,
              phone: phoneVisible,
              email: emailVisible,
              hours: hoursVisible,
            }
            const sizeMap: Record<string, number | undefined> = {
              address: addressSize,
              phone: phoneSize,
              email: emailSize,
              hours: hoursSize,
            }
            const colorMap: Record<string, string | undefined> = {
              address: addressColor,
              phone: phoneColor,
              email: emailColor,
              hours: hoursColor,
            }
            return (
              <StyledText
                as="a"
                key={String(label)}
                visible={visibleMap[field]}
                size={sizeMap[field]}
                color={colorMap[field]}
                href={href}
                className="flex items-center gap-4 border-b border-border py-5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <span data-tina-field={tinaField(props, field)}>{String(label)}</span>
              </StyledText>
            )
          })}
        </div>
      </div>
    </section>
  )
}
