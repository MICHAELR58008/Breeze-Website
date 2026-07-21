"use client"

import { SectionHeader } from "@/components/sections/shared"
import { tinaField } from "tinacms/dist/tina-field"

export interface TestimonialReview {
  quote: string
  byline: string
}

export interface TestimonialsProps {
  eyebrow?: string
  heading?: string
  copy?: string
  reviews?: TestimonialReview[]
}

const defaults: TestimonialsProps = {
  eyebrow: "04 / Testimonials",
  heading: "Care that shows.",
  copy: "This section is ready for your real customer feedback. The reviews below are clearly labeled sample content.",
  reviews: [
    { quote: "The house felt completely refreshed, and every detail was handled with care.", byline: "Sample review · Replace with customer name" },
    { quote: "Clear communication, thoughtful service, and a result we were proud to come home to.", byline: "Sample review · Replace with customer name" },
    { quote: "Breeze made the whole process feel easy from the first quote to the final walkthrough.", byline: "Sample review · Replace with customer name" },
  ],
}

export function Testimonials(props: TestimonialsProps) {
  const { eyebrow, heading, copy, reviews } = { ...defaults, ...props }

  return (
    <section id="reviews" className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1400px] border-x border-border px-5 py-24 sm:px-8 lg:px-12">
        <SectionHeader
          eyebrow={eyebrow || ""}
          title={heading || ""}
          copy={copy || ""}
          tinaFields={{
            eyebrow: tinaField(props, "eyebrow"),
            title: tinaField(props, "heading"),
            copy: tinaField(props, "copy"),
          }}
        />
        <div data-tina-field={tinaField(props, "reviews")} className="grid gap-px border border-border bg-border lg:grid-cols-3">
          {(reviews || []).map((review) => (
            <figure key={review.quote} className="flex min-h-64 flex-col justify-between bg-card p-6 sm:p-8">
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
      </div>
    </section>
  )
}
