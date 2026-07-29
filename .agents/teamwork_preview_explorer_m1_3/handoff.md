# About Redesign Architecture Handoff Report

## 1. Observation

### 1.1 Current `about.tsx` Implementation Analysis
File: `components/sections/about.tsx` (Lines 30-158)
Currently, `about.tsx` lacks standard section padding wrapper and does not use `SectionHeader`:
```tsx
export function About(props: AboutProps) {
  ...
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
            <>
              ...
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
          ) : ( ... )}
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
```

### 1.2 Reference Standard Layout & SectionHeader Patterns
Files:
- `components/sections/services.tsx` (Lines 58-81): `<section id="services" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">` with `<SectionHeader ... />`
- `components/sections/process.tsx` (Lines 43-67): `<section id="process" className="border-y border-border bg-card"><div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><SectionHeader ... />`
- `components/sections/testimonials.tsx` (Lines 34-58): `<section id="reviews" className="border-y border-border bg-card"><div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12"><SectionHeader ... />`
- `components/sections/shared.tsx` (Lines 117-196): `SectionHeader` definition accepting `eyebrow`, `title`, `copy`, and `tinaFields` mapping.

### 1.3 TinaCMS Schema Field Definitions
File: `tina/config.ts` (Lines 210-257):
The `about` template defines the following CMS fields:
- `eyebrow` (string)
- `ownerName` (string)
- `nameInitial` (string)
- `tagline` (string)
- `bioParagraph1` (string)
- `bioParagraph2` (string)
- `image` (image)
- `focalPoint` (string with FocalPointPicker UI)
- Styling & visibility control fields (`eyebrowVisible`, `ownerNameVisible`, `bioParagraph1Visible`, `bioParagraph2Visible`, X/Y positions, sizes, colors).

---

## 2. Logic Chain

1. **Section Wrapper & Header Alignment (R1)**:
   - Services, Process, and Testimonials all adhere to a shared structural wrapper: an outer `<section>` with `border-y border-border bg-card`, an inner container with `mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32`, and the standard `<SectionHeader>` at the top.
   - Incorporating `<SectionHeader>` into `about.tsx` aligns the section visually with the rest of the application while making the section eyebrow ("03 / Meet the owner") and heading structurally consistent.

2. **Card Container & Responsive Media Formatting (R2)**:
   - Below `<SectionHeader>`, owner media and bio content are formatted inside a card container (`border border-border bg-card overflow-hidden`) with a 12-column grid layout (`lg:grid-cols-12`).
   - `lg:col-span-5` hosts the owner photo/avatar with interactive crop focal point (`style={{ objectPosition: activePosition }}`), fallback blue initial badge (`nameInitial`), and `ErrorBoundary`.
   - `lg:col-span-7` hosts owner name (`ownerName`), tagline badge (`tagline`), and bio paragraphs (`bioParagraph1`, `bioParagraph2`).

3. **TinaCMS Inline Field Binding Preservation**:
   - Every existing `tinaField` reference must be preserved on its corresponding HTML/React element:
     - `eyebrow`: Passed to `SectionHeader.tinaFields.eyebrow`
     - `ownerName`: `data-tina-field={tinaField(props, "ownerName")}` on `StyledText as="h3"` inside owner card (and as fallback `SectionHeader.tinaFields.title`)
     - `tagline`: `data-tina-field={tinaField(props, "tagline")}` on tagline element inside owner card (and as fallback `SectionHeader.tinaFields.copy`)
     - `bioParagraph1`: `data-tina-field={tinaField(props, "bioParagraph1")}` on first bio `StyledText`
     - `bioParagraph2`: `data-tina-field={tinaField(props, "bioParagraph2")}` on second bio `StyledText`
     - `image`: `data-tina-field={hasImage ? tinaField(props, "image") : undefined}` on media container
     - `nameInitial`: `data-tina-field={tinaField(props, "nameInitial")}` on fallback initial paragraph
     - `focalPoint`: Applied via `style={{ objectPosition: activePosition }}` on the `<Image>` component.

---

## 3. Caveats

- **Optional `heading` & `copy` Props**:
  - `AboutProps` can accept optional `heading?: string` and `copy?: string` to match `ServicesProps`, `ProcessProps`, and `TestimonialsProps`.
  - Fallback logic ensures full backward compatibility:
    - Section Header Title: `heading || ownerName || "Meet the owner"`
    - Section Header Copy: `copy || tagline || ""`
- **Visual Editing Click Overlay**:
  - `tinaField` annotations enable inline editing highlights in Tina Admin. Binding `eyebrow`, `ownerName`, and `tagline` in both header and content card ensures clicks in either area select the correct CMS field.

---

## 4. Conclusion & Proposed JSX Structure

Below is the complete, proposed JSX implementation blueprint for `components/sections/about.tsx`:

```tsx
import Image from "next/image"
import { tinaField } from "tinacms/dist/tina-field"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ImageOff } from "lucide-react"
import { SectionHeader, StyledText } from "@/components/sections/shared"

export interface AboutProps {
  eyebrow?: string
  heading?: string
  title?: string
  copy?: string
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
  heading: "Owner-led care.",
  copy: "Clean homes, personal dedication, and a local team that treats your space like their own.",
  ownerName: "Evelyn Rivas",
  nameInitial: "E",
  tagline: "Owner & Lead Cleaner",
  bioParagraph1:
    "Evelyn started Breeze because she believes a clean home shouldn't feel like a luxury. Based in Ventura County, she and her team treat every home like their own — with care, attention to detail, and a genuine pride in making spaces shine.",
  bioParagraph2:
    "When you book with Breeze, you're not just getting a clean home — you're getting someone who truly cares about getting it right.",
}

export function About(props: AboutProps) {
  const {
    eyebrow,
    heading,
    copy,
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
    headingVisible,
    headingX,
    headingY,
    headingSize,
    headingColor,
    copyVisible,
    copyX,
    copyY,
    copySize,
    copyColor,
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

  const headerTitle = heading || ownerName || ""
  const headerCopy = copy || tagline || ""

  return (
    <section id="about" className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        {/* R1: Section Header & Layout Alignment */}
        <SectionHeader
          eyebrow={eyebrow || ""}
          title={headerTitle}
          copy={headerCopy}
          tinaFields={{
            eyebrow: tinaField(props, "eyebrow"),
            title: tinaField(props, heading ? "heading" : "ownerName"),
            copy: tinaField(props, copy ? "copy" : "tagline"),
          }}
          eyebrowVisible={eyebrowVisible}
          eyebrowSize={eyebrowSize}
          eyebrowColor={eyebrowColor}
          titleVisible={headingVisible ?? ownerNameVisible}
          titleX={headingX ?? ownerNameX}
          titleY={headingY ?? ownerNameY}
          titleSize={headingSize ?? ownerNameSize}
          titleColor={headingColor ?? ownerNameColor}
          copyVisible={copyVisible}
          copyX={copyX}
          copyY={copyY}
          copySize={copySize}
          copyColor={copyColor}
        />

        {/* R2: Owner Media & Content Card Formatting */}
        <div className="mt-12 border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Owner Media / Avatar Container */}
            <div
              className={`relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] overflow-hidden border-b border-border lg:col-span-5 lg:border-b-0 lg:border-r ${
                hasImage ? "bg-slate-900" : "bg-primary"
              }`}
              data-tina-field={hasImage ? tinaField(props, "image") : undefined}
            >
              {hasImage ? (
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
              ) : (
                <>
                  <div className="grid-surface absolute inset-0 opacity-15" />
                  <div className="relative flex h-full flex-col justify-between p-8 text-primary-foreground">
                    <span className="font-mono text-xs uppercase tracking-widest text-primary-foreground/80">
                      {eyebrow || "Owner"}
                    </span>
                    <div>
                      {nameInitial?.trim() && (
                        <p
                          data-tina-field={tinaField(props, "nameInitial")}
                          className="font-display text-[9rem] leading-none text-primary-foreground"
                        >
                          {nameInitial}
                        </p>
                      )}
                      {tagline?.trim() && (
                        <p
                          data-tina-field={tinaField(props, "tagline")}
                          className="text-sm font-medium text-primary-foreground/90"
                        >
                          {tagline}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Owner Bio Content Card */}
            <div className="flex flex-col justify-center gap-6 p-6 sm:p-10 lg:p-12 lg:col-span-7">
              {tagline?.trim() && (
                <span
                  data-tina-field={tinaField(props, "tagline")}
                  className="font-mono text-xs uppercase tracking-[0.22em] text-primary font-semibold"
                >
                  {tagline}
                </span>
              )}

              {ownerName?.trim() && (
                <StyledText
                  as="h3"
                  visible={ownerNameVisible}
                  x={ownerNameX}
                  y={ownerNameY}
                  size={ownerNameSize}
                  color={ownerNameColor}
                  className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground"
                  data-tina-field={tinaField(props, "ownerName")}
                >
                  {ownerName}
                </StyledText>
              )}

              {bioParagraph1?.trim() && (
                <StyledText
                  as="p"
                  visible={bioParagraph1Visible}
                  x={bioParagraph1X}
                  y={bioParagraph1Y}
                  size={bioParagraph1Size}
                  color={bioParagraph1Color}
                  className="text-pretty text-base sm:text-lg leading-relaxed text-muted-foreground"
                  data-tina-field={tinaField(props, "bioParagraph1")}
                >
                  {bioParagraph1}
                </StyledText>
              )}

              {bioParagraph2?.trim() && (
                <StyledText
                  as="p"
                  visible={bioParagraph2Visible}
                  x={bioParagraph2X}
                  y={bioParagraph2Y}
                  size={bioParagraph2Size}
                  color={bioParagraph2Color}
                  className="text-pretty text-base sm:text-lg leading-relaxed text-foreground/90"
                  data-tina-field={tinaField(props, "bioParagraph2")}
                >
                  {bioParagraph2}
                </StyledText>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## 5. Verification Method

1. **Unit Test Suite Verification**:
   - Command: `npx vitest run`
   - Expected Output: All test suites (79/79 tests across 5 test files) pass with zero errors.

2. **Prop & TinaField Mapping Checklist**:
   - `eyebrow` -> `SectionHeader` eyebrow prop (`tinaFields.eyebrow`)
   - `ownerName` -> `StyledText as="h3"` (`data-tina-field={tinaField(props, "ownerName")}`)
   - `tagline` -> Tagline span element (`data-tina-field={tinaField(props, "tagline")}`)
   - `bioParagraph1` -> First bio paragraph (`data-tina-field={tinaField(props, "bioParagraph1")}`)
   - `bioParagraph2` -> Second bio paragraph (`data-tina-field={tinaField(props, "bioParagraph2")}`)
   - `image` -> Media container div (`data-tina-field={hasImage ? tinaField(props, "image") : undefined}`)
   - `focalPoint` -> Image object position (`style={{ objectPosition: activePosition }}`)
   - `nameInitial` -> Fallback paragraph (`data-tina-field={tinaField(props, "nameInitial")}`)

3. **Invalidation Conditions**:
   - If any `data-tina-field` attribute is missing or misnamed relative to `tina/config.ts`.
   - If `SectionHeader` component signature is changed or omits `tinaFields` mapping.
