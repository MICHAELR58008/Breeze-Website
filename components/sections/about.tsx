import Image from "next/image"
import { tinaField } from "tinacms/dist/tina-field"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ImageOff } from "lucide-react"
import { SectionHeader, StyledText } from "@/components/sections/shared"

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
  const {
    eyebrow,
    ownerName,
    nameInitial,
    tagline,
    bioParagraph1,
    bioParagraph2,
    image,
    focalPoint,
    eyebrowVisible,
    eyebrowSize,
    eyebrowColor,
    ownerNameVisible,
    ownerNameX,
    ownerNameY,
    ownerNameSize,
    ownerNameColor,
    bioParagraph1Visible,
    bioParagraph1X,
    bioParagraph1Y,
    bioParagraph1Size,
    bioParagraph1Color,
    bioParagraph2Visible,
    bioParagraph2X,
    bioParagraph2Y,
    bioParagraph2Size,
    bioParagraph2Color,
  } = {
    ...defaults,
    ...props,
  }

  const hasImage = Boolean(image && image.trim())
  const activePosition = focalPoint || "50% 0%"

  return (
    <section id="about" className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeader
          eyebrow={eyebrow!}
          title={ownerName!}
          copy={tagline!}
          tinaFields={{
            eyebrow: tinaField(props, "eyebrow"),
            title: tinaField(props, "ownerName"),
            copy: tinaField(props, "tagline"),
          }}
          eyebrowVisible={eyebrowVisible}
          eyebrowSize={eyebrowSize}
          eyebrowColor={eyebrowColor}
          titleVisible={ownerNameVisible}
          titleX={ownerNameX}
          titleY={ownerNameY}
          titleSize={ownerNameSize}
          titleColor={ownerNameColor}
        />

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          {/* Media Card */}
          <div className="bg-card lg:col-span-5 flex flex-col">
            <div
              className={`relative w-full h-full min-h-[440px] overflow-hidden ${
                hasImage ? "bg-transparent" : "bg-primary"
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
                </>
              ) : (
                /* Fallback blue box styling when no image is uploaded */
                <>
                  <div className="grid-surface absolute inset-0 opacity-15" />
                  <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-12 text-primary-foreground">
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
                        <p data-tina-field={tinaField(props, "nameInitial")} className="font-display text-[9rem] leading-none">
                          {nameInitial}
                        </p>
                      )}
                      {tagline?.trim() && (
                        <p data-tina-field={tinaField(props, "tagline")} className="text-sm">
                          {tagline}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bio Content Card */}
          <div className="bg-card p-6 sm:p-8 lg:p-12 flex flex-col justify-center gap-7 lg:col-span-7">
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
        </div>
      </div>
    </section>
  )
}
