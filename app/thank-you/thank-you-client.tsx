"use client"

import { Check, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { tinaField } from "tinacms/dist/tina-field"
import { t } from "@/lib/booking-content"
import { useBooking } from "@/components/booking/booking-drawer"
import { Button } from "@/components/ui/button"
import { Brand } from "@/components/sections/shared"
import { Navigation } from "@/components/sections/navigation"
import { Footer } from "@/components/sections/footer"

export default function ThankYouClient() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || "there"
  const { content, rawBooking } = useBooking()
  const { title, message, buttonText, phoneNumber } = content.success

  return (
    <>
      <Navigation links={[]} config={{ ctaVisible: false }} />
      <main className="flex min-h-[80vh] items-center justify-center bg-muted/20 px-5 pt-24 pb-12">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 rounded-2xl bg-background p-10 text-center shadow-sm border border-border">
          <Brand />
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-8" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-3">
            <h1
              className="font-display text-4xl text-foreground"
              data-tina-field={rawBooking ? tinaField(rawBooking.success, "title") : undefined}
            >
              {title}
            </h1>
            <p
              className="max-w-sm text-pretty leading-relaxed text-muted-foreground"
              data-tina-field={rawBooking ? tinaField(rawBooking.success, "message") : undefined}
            >
              {t(message, { name })}
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Questions? Call{" "}
            <a
              href={`tel:${phoneNumber?.replace(/\D/g, "")}`}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
              data-tina-field={rawBooking ? tinaField(rawBooking.success, "phoneNumber") : undefined}
            >
              {phoneNumber}
            </a>
          </div>
          <Button
            asChild
            variant="outline"
            size="lg"
            data-tina-field={rawBooking ? tinaField(rawBooking.success, "buttonText") : undefined}
          >
            <a href="/">{buttonText}</a>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  )
}