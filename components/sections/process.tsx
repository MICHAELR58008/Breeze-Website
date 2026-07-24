"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { SectionHeader } from "@/components/sections/shared"
import { tinaField } from "tinacms/dist/tina-field"

export interface ProcessProps {
  heading?: string
  galleryImages?: { src?: string; alt?: string }[]
  [key: string]: any
}

const defaults: ProcessProps = {
  heading: "Simple from start to shine.",
}

function GalleryCrossfade({ images }: { images: { src?: string; alt?: string }[] }) {
  const [current, setCurrent] = useState(0)
  const validImages = images.filter((img) => img?.src)

  useEffect(() => {
    if (validImages.length < 2) return
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validImages.length)
    }, 4000)
    return () => clearInterval(id)
  }, [validImages.length])

  if (!validImages.length) return null

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
      {validImages.map((img, i) => (
        <div
          key={img.src || i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={img.src || ""}
            alt={img.alt || `Gallery image ${i + 1}`}
            fill
            className="object-cover"
            priority={i === 0}
            unoptimized
          />
        </div>
      ))}
    </div>
  )
}

export function Process(props: ProcessProps) {
  const { heading, galleryImages, headingVisible, headingX, headingY, headingSize, headingColor } = { ...defaults, ...props }

  return (
    <section id="process" className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeader
          eyebrow=""
          title={heading || ""}
          copy=""
          tinaFields={{
            title: tinaField(props, "heading"),
          }}
          titleVisible={headingVisible}
          titleX={headingX}
          titleY={headingY}
          titleSize={headingSize}
          titleColor={headingColor}
        />
        {galleryImages && galleryImages.length > 0 && (
          <div className="mt-10 w-full max-w-4xl mx-auto">
            <GalleryCrossfade images={galleryImages} />
          </div>
        )}
      </div>
    </section>
  )
}
