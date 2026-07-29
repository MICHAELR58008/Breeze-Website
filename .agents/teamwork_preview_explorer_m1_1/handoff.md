# Handoff Report — About Component Explorer (`about.tsx`)

## 1. Observation

### Key Codebase Files Inspected
- `components/sections/about.tsx` (160 lines) — The primary target component.
- `tina/config.ts` (lines 210–257) — TinaCMS schema definition for the `about` section.
- `components/sections/shared.tsx` (lines 73–111) — `StyledText` component definition handling dynamic visibility, offset positioning, font sizing, and color overrides.
- `lib/page-sections.tsx` (lines 42–43, 133–140) — Block renderer mapping `_template: "about"` to `<About />` and providing default fallback props.

### Detailed Code Snippets & Exact Line Numbers (`components/sections/about.tsx`)

1. **TinaCMS Import & Interface (`about.tsx`: lines 1-17)**
   ```tsx
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
   ```

2. **Default Prop Values (`about.tsx`: lines 19-28)**
   ```tsx
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
   ```

3. **TinaCMS Field Bindings (`data-tina-field`) Locations**:

   - **Image Binding (`about.tsx`: line 48)**:
     ```tsx
     <div
       className={`relative min-h-[440px] overflow-hidden border-b border-border lg:col-span-5 lg:border-b-0 lg:border-r ${
         hasImage ? "bg-slate-900" : "bg-primary"
       }`}
       data-tina-field={hasImage ? tinaField(props, "image") : undefined}
     >
     ```
   - **Eyebrow Binding (Image Overlay) (`about.tsx`: line 79)**:
     ```tsx
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
     ```
   - **Tagline Binding (Image Overlay) (`about.tsx`: line 85)**:
     ```tsx
     <p data-tina-field={tinaField(props, "tagline")} className="mt-1 text-sm font-medium text-white/90">{tagline}</p>
     ```
   - **Eyebrow Binding (Fallback State) (`about.tsx`: line 101)**:
     ```tsx
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
     ```
   - **Name Initial Binding (Fallback State) (`about.tsx`: line 108)**:
     ```tsx
     <p data-tina-field={tinaField(props, "nameInitial")} className="font-display text-[9rem] leading-none">{nameInitial}</p>
     ```
   - **Tagline Binding (Fallback State) (`about.tsx`: line 111)**:
     ```tsx
     <p data-tina-field={tinaField(props, "tagline")} className="text-sm">{tagline}</p>
     ```
   - **Owner Name Binding (`about.tsx`: line 128)**:
     ```tsx
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
     ```
   - **Bio Paragraph 1 Binding (`about.tsx`: line 142)**:
     ```tsx
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
     ```
   - **Bio Paragraph 2 Binding (`about.tsx`: line 152)**:
     ```tsx
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
     ```

4. **Focal Point Handling (`about.tsx`: lines 39 & 67)**:
   ```tsx
   const activePosition = focalPoint || "50% 0%"
   // ...
   <Image
     src={image!}
     alt={ownerName || "Owner"}
     fill
     priority
     className="object-cover"
     style={{ objectPosition: activePosition }}
   />
   ```

---

## 2. Logic Chain

1. **Props Interface & Destructuring Logic**:
   - `AboutProps` accepts `eyebrow`, `ownerName`, `nameInitial`, `tagline`, `bioParagraph1`, `bioParagraph2`, `image`, `focalPoint`, plus arbitrary `[key: string]: any` props for dynamic field visibility, X/Y translation offsets, font sizes, and colors.
   - Component line 31 defaults and merges props via `const { ... } = { ...defaults, ...props }`.

2. **Conditional Left Column Layout Logic**:
   - `hasImage` is determined by `Boolean(image && image.trim())`.
   - `hasLeftContent` is determined by `Boolean(hasImage || eyebrow?.trim() || nameInitial?.trim() || tagline?.trim())`.
   - If `hasLeftContent` is true:
     - Left column takes `lg:col-span-5` with a right border on desktop (`lg:border-r`).
     - Right column takes `lg:col-span-7`.
   - If `hasLeftContent` is false:
     - Left column is unrendered.
     - Right column expands to full width (`lg:col-span-12`).

3. **Dual Media Rendering Modes**:
   - **Mode A (Image Provided)**:
     - Outer container gets `data-tina-field={tinaField(props, "image")}` allowing TinaCMS click-to-edit image selection.
     - Utilizes Next.js `<Image fill priority className="object-cover" style={{ objectPosition: activePosition }} />` wrapped in an `<ErrorBoundary>` to gracefully handle missing/broken image assets.
     - Renders a subtle dark gradient overlay at the bottom (`from-black/80 via-black/30 to-transparent`) containing `eyebrow` and `tagline` for high contrast text readability.
   - **Mode B (Fallback Blue Box / No Image)**:
     - Container background switches to `bg-primary` with `grid-surface` texture at 15% opacity.
     - Top eyebrow rendered in white font styling.
     - Large initial letter (`nameInitial`) rendered in giant display font (`text-[9rem]`) along with tagline.

4. **Right Column Content & TinaCMS Field Bindings**:
   - Content container aligns elements vertically with `gap-7` and responsive padding (`p-6 sm:p-10 lg:p-16`).
   - `ownerName`, `bioParagraph1`, and `bioParagraph2` are rendered through `<StyledText>` components.
   - Each `<StyledText>` receives matching `data-tina-field={tinaField(props, "<fieldName>")}` attribute for visual inline editing in TinaCMS.
   - Styling parameters (`visible`, `x`, `y`, `size`, `color`) dynamically control transform translations and typography styles when customized via CMS.

---

## 3. Caveats

- **No Source Code Modifications**: Per explorer role guidelines, no source code in `components/sections/about.tsx` was modified during this investigation.
- **Focal Point Selector**: `focalPoint` does not attach `data-tina-field` directly to an HTML element in `about.tsx`, but rather drives the inline `style={{ objectPosition }}` attribute. Visual editing for focal point relies on the `FocalPointPicker` custom UI component defined in `tina/config.ts`.
- **CSS Grid Dependencies**: Grid column balancing relies on `lg:col-span-5` / `lg:col-span-7`. Any structural layout redesign must preserve these breakpoints or adapt `hasLeftContent` calculations accordingly.

---

## 4. Conclusion

`components/sections/about.tsx` is a highly structured, TinaCMS-enabled Next.js component designed with fallback mechanisms and visual editing support.

**Key Preserve Requirements for any modifications or previews**:
1. All 9 `data-tina-field={tinaField(props, "...")]}` attributes (`image`, `eyebrow` (x2), `tagline` (x2), `nameInitial`, `ownerName`, `bioParagraph1`, `bioParagraph2`).
2. Dual rendering logic for `hasImage` (Photo vs Fallback Box with Initial).
3. Image crop focal point CSS property (`objectPosition: activePosition`).
4. `<StyledText>` wrapper usage for `eyebrow`, `ownerName`, `bioParagraph1`, and `bioParagraph2` to preserve dynamic position (X/Y), size, color, and visibility controls.

---

## 5. Verification Method

To verify `components/sections/about.tsx` integrity and TinaCMS field bindings:

1. **File Inspection**:
   - Inspect `components/sections/about.tsx` lines 1–160.
   - Confirm presence of `import { tinaField } from "tinacms/dist/tina-field"`.
   - Confirm all 9 `data-tina-field` bindings on image container, eyebrow tags, tagline tags, name initial, owner title heading, and bio paragraph elements.

2. **Schema Verification**:
   - Inspect `tina/config.ts` lines 210–257 to verify field key alignment (`eyebrow`, `ownerName`, `nameInitial`, `tagline`, `bioParagraph1`, `bioParagraph2`, `image`, `focalPoint`).

3. **Invalidation Conditions**:
   - Removing any `data-tina-field` attribute will break visual click-to-select functionality in TinaCMS visual editor.
   - Omitting `focalPoint` calculation will break custom image crop positioning.
   - Replacing `<StyledText>` with raw tags without style props will disable custom CMS font size, color, and positioning controls.
