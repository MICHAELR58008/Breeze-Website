import Image from "next/image"
import { tinaField } from "tinacms/dist/tina-field"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ImageOff } from "lucide-react"
import { StyledText } from "@/components/sections/shared"

export interface AboutProps {
  eyebrow?: string
  ownerName?: string
  nameInitial?: string
  tagline?: string
  bioParagraph1?: string
  bioParagraph2?: string
  image?: string
  focalPoint?: string
  [key: string]: any
}

const defaults: AboutProps = {
  eyebrow: "03 / Meet the owner",
  ownerName: "Evelyn Rivas",
  nameInitial: "E",
  tagline: "Owner-led care in Ventura County.",
  bioParagraph1:
    "Evelyn started Breeze because she believes a clean home shouldn't feel like a luxury. Based in Ventura County, she and her team treat every home like their own — with care, attention to detail, and a genuine pride in making spaces shine.",
  bioParagraph2:
    "When you book with Breeze, you're not just getting a clean home — you're getting someone who truly cares about getting it right.",
}

export function About(props: AboutProps) {
  const { eyebrow, ownerName, nameInitial, tagline, bioParagraph1, bioParagraph2, image, focalPoint, eyebrowVisible, eyebrowSize, eyebrowColor, ownerNameVisible, ownerNameX, ownerNameY, ownerNameSize, ownerNameColor, bioParagraph1Visible, bioParagraph1X, bioParagraph1Y, bioParagraph1Size, bioParagraph1Color, bioParagraph2Visible, bioParagraph2X, bioParagraph2Y, bioParagraph2Size, bioParagraph2Color } = {
    ...defaults,
    ...props,
  }

  const hasImage = Boolean(image && image.trim())
  const hasLeftContent = Boolean(hasImage || eyebrow?.trim() || nameInitial?.trim() || tagline?.trim())

  const activePosition = focalPoint || "50% 0%"

  return (
    <section id="about" className="mx-auto grid max-w-[1400px] lg:grid-cols-12">
      {hasLeftContent && (
        <div
          className={`relative min-h-[440px] overflow-hidden border-b border-border lg:col-span-5 lg:border-b-0 lg:border-r ${
            hasImage ? "bg-slate-900" : "bg-primary"
          }`}
          data-tina-field={hasImage ? tinaField(props, "image") : undefined}
        >
          {hasImage ? (
            /* Full container coverage with custom interactive crop focal point */
            <>
              <ErrorBoundary
                fallback={
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center z-0">
                    <ImageOff className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-xs font-mono">Unable to load image</span>
                  </div>
                }
              >
                <Image
                  src={image!}
                  alt={ownerName || "Owner"}
                  fill
                  priority
                  className="object-cover"
                  style={{ objectPosition: activePosition }}
                />
              </ErrorBoundary>
              {/* Subtle dark gradient overlay at bottom for text legibility */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pt-12 z-10">
                {eyebrow?.trim() && (
                  <StyledText
                    as="p"
                    visible={eyebrowVisible}
                    size={eyebrowSize}
                    color={eyebrowColor}
                    className="font-mono text-xs uppercase tracking-widest text-white/90"
                    data-tina-field={tinaField(props, "eyebrow")}
                  >
                    {eyebrow}
                  </StyledText>
                )}
                {tagline?.trim() && (
                  <p data-tina-field={tinaField(props, "tagline")} className="mt-1 text-sm font-medium text-white/90">{tagline}</p>
                )}
              </div>
            </>
          ) : (
            /* Fallback blue box styling when no image is uploaded */
            <>
              <div className="grid-surface absolute inset-0 opacity-15" />
              <div className="relative flex h-full flex-col justify-between p-8 text-primary-foreground">
                {eyebrow?.trim() && (
                  <StyledText
                    as="p"
                    visible={eyebrowVisible}
                    size={eyebrowSize}
                    color={eyebrowColor}
                    className="font-mono text-xs uppercase tracking-widest"
                    data-tina-field={tinaField(props, "eyebrow")}
                  >
                    {eyebrow}
                  </StyledText>
                )}
                <div>
                  {nameInitial?.trim() && (
                    <p data-tina-field={tinaField(props, "nameInitial")} className="font-display text-[9rem] leading-none">{nameInitial}</p>
                  )}
                  {tagline?.trim() && (
                    <p data-tina-field={tinaField(props, "tagline")} className="text-sm">{tagline}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <div className={`flex flex-col justify-center gap-7 p-6 sm:p-10 lg:p-16 ${hasLeftContent ? "lg:col-span-7" : "lg:col-span-12"}`}>
        <StyledText
          as="h2"
          visible={ownerNameVisible}
          x={ownerNameX}
          y={ownerNameY}
          size={ownerNameSize}
          color={ownerNameColor}
          className="font-display text-6xl sm:text-8xl"
          data-tina-field={tinaField(props, "ownerName")}
        >
          {ownerName}
        </StyledText>
        <StyledText
          as="p"
          visible={bioParagraph1Visible}
          x={bioParagraph1X}
          y={bioParagraph1Y}
          size={bioParagraph1Size}
          color={bioParagraph1Color}
          className="text-pretty text-lg leading-relaxed text-muted-foreground"
          data-tina-field={tinaField(props, "bioParagraph1")}
        >
          {bioParagraph1}
        </StyledText>
        <StyledText
          as="p"
          visible={bioParagraph2Visible}
          x={bioParagraph2X}
          y={bioParagraph2Y}
          size={bioParagraph2Size}
          color={bioParagraph2Color}
          className="text-pretty text-lg leading-relaxed"
          data-tina-field={tinaField(props, "bioParagraph2")}
        >
          {bioParagraph2}
        </StyledText>
      </div>
    </section>
  )
}
