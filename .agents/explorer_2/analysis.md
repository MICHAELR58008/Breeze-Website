# Comprehensive Analysis: Adding "Proof Background Opacity" Schema Control to Hero Section

## Executive Summary
This analysis details the exact modifications required to introduce a **"Proof Background Opacity"** control to the Hero section in `tina/config.ts` and connect it to `components/sections/hero.tsx`. The proposed schema field uses Tina CMS's native `number` field type with a default value of `70` (representing 70% opacity, matching the existing `bg-background/70` design baseline).

---

## 1. Context & Scope
- **Target Section**: Hero (`tina/config.ts` -> `sections` collection template `"hero"`)
- **React Component**: `components/sections/hero.tsx` (`Hero` component)
- **Target Content File**: `content/page/page.json` (Hero section entry)
- **Goal**: Allow content editors to control the background opacity of the Proof Badges grid items in the Hero section dynamically via Tina CMS.

---

## 2. Investigation Findings

### 2.1 Current Schema in `tina/config.ts`
- **Location**: `schema.collections[0]` ("page") -> `fields[0]` ("sections") -> `templates[0]` ("hero") (lines 54–115).
- **Default Item (`ui.defaultItem`)**:
  Lines 59–74 define defaults for `location`, `headingLine1`, `headingLine2`, `subheading`, `phoneNumber`, `calloutTitle`, `calloutText`, `proofs`, `imageSrc`, and `imageAlt`.
- **Existing Fields Array**:
  Lines 76–114 list fields including text strings, proof object lists, image fields, and numeric/color controls for typography/positioning (`locationSize`, `locationColor`, `headingLine1X`, `headingLine1Y`, `headingLine1Size`, `headingLine1Color`, etc.).
- **Existing Numeric Field Pattern**:
  Numeric controls across `tina/config.ts` consistently use `{ type: "number", name: "<fieldName>", label: "<Label>" }`.

### 2.2 Current Component Props in `components/sections/hero.tsx`
- **Interface `HeroProps`** (lines 15–45): Defines optional props for text, images, proofs list, and visibility/positioning/size/color for text elements.
- **Defaults Object `defaults`** (lines 47–62): Sets fallbacks for `location`, `headingLine1`, `headingLine2`, `subheading`, `phoneNumber`, `calloutTitle`, `calloutText`, `imageSrc`, `imageAlt`, `proofs`.
- **Destructuring & Usage** (lines 64–93 & 177–186):
  ```tsx
  <div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
    {proofs?.map((p, i) => (
      <Proof
        key={p.label}
        value={p.value}
        label={p.label}
        className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} bg-background/70 text-white backdrop-blur-sm`}
      />
    ))}
  </div>
  ```
- **Observation on Styling**: The `Proof` badges currently use hardcoded `bg-background/70` in `hero.tsx` line 183. `Proof` component in `components/sections/shared.tsx` accepts `className?: string` and applies `<div className={`bg-background p-4 ${className}`}>`.

---

## 3. Exact Field Schema Specification

### 3.1 Field Schema Object
```ts
{
  type: "number",
  name: "proofBgOpacity",
  label: "Proof Background Opacity (%)",
}
```

### 3.2 Field Properties Breakdown
| Property | Value | Rationale |
|---|---|---|
| `type` | `"number"` | Standard Tina CMS input type used across all numerical parameters in `tina/config.ts`. |
| `name` | `"proofBgOpacity"` | CamelCase naming matching `locationSize`, `headingLine1X`, etc. |
| `label` | `"Proof Background Opacity (%)"` | Clear, descriptive label specifying percentage units (0 to 100). |
| Default Value | `70` | Specified in `ui.defaultItem`. Represents 70% opacity, maintaining visual parity with existing `bg-background/70`. |

---

## 4. Proposed Changes & Code Snippets

### 4.1 Changes to `tina/config.ts`

#### Step A: Update `ui.defaultItem` (around line 74)
```ts
// BEFORE (line 74):
                    imageAlt: "A bright, professionally cleaned modern home",
                  },

// AFTER:
                    imageAlt: "A bright, professionally cleaned modern home",
                    proofBgOpacity: 70,
                  },
```

#### Step B: Add field to `fields` array (around line 93, after `proofs`)
```ts
// BEFORE (lines 85–93):
                  {
                    type: "object",
                    name: "proofs",
                    label: "Proof Badges",
                    list: true,
                    fields: [
                      { type: "string", name: "value" },
                      { type: "string", name: "label" },
                    ],
                  },

// AFTER:
                  {
                    type: "object",
                    name: "proofs",
                    label: "Proof Badges",
                    list: true,
                    fields: [
                      { type: "string", name: "value" },
                      { type: "string", name: "label" },
                    ],
                  },
                  {
                    type: "number",
                    name: "proofBgOpacity",
                    label: "Proof Background Opacity (%)",
                  },
```

---

### 4.2 Changes to `components/sections/hero.tsx`

#### Step A: Update `HeroProps` interface (around line 43)
```ts
// BEFORE:
  subheadingColor?: string
  [key: string]: any
}

// AFTER:
  subheadingColor?: string
  proofBgOpacity?: number
  [key: string]: any
}
```

#### Step B: Update `defaults` object (around line 62)
```ts
// BEFORE:
  proofs: [
    { value: "24 hr", label: "Response time" },
    { value: "Local", label: "Owner-led team" },
    { value: "Free", label: "Personalized quote" },
  ],
}

// AFTER:
  proofs: [
    { value: "24 hr", label: "Response time" },
    { value: "Local", label: "Owner-led team" },
    { value: "Free", label: "Personalized quote" },
  ],
  proofBgOpacity: 70,
}
```

#### Step C: Update destructuring in `Hero` function (around line 93)
```ts
// BEFORE:
    subheadingColor,
  } = { ...defaults, ...props }

// AFTER:
    subheadingColor,
    proofBgOpacity,
  } = { ...defaults, ...props }
```

#### Step D: Update `Proof` badges JSX rendering (lines 177–186)
To apply dynamic opacity dynamically while preserving `hsl(var(--background))` color variables and fallback defaults:
```tsx
// BEFORE (line 177-186):
          <div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
            {proofs?.map((p, i) => (
              <Proof
                key={p.label}
                value={p.value}
                label={p.label}
                className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} bg-background/70 text-white backdrop-blur-sm`}
              />
            ))}
          </div>

// AFTER:
          {/* Proof Badges with dynamic background opacity */}
          <div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
            {proofs?.map((p, i) => {
              const opacityVal = typeof proofBgOpacity === "number" ? proofBgOpacity / 100 : 0.7
              return (
                <Proof
                  key={p.label}
                  value={p.value}
                  label={p.label}
                  className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} text-white backdrop-blur-sm`}
                  style={{ backgroundColor: `hsl(var(--background) / ${opacityVal})` }}
                />
              )
            })}
          </div>
```

*Note*: If `Proof` in `components/sections/shared.tsx` does not currently accept `style`, verify or add `style?: React.CSSProperties` to `Proof` signature (`export function Proof({ value, label, className = "", style }: { value: string; label: string; className?: string; style?: React.CSSProperties })`).

---

### 4.3 Content File Update (`content/page/page.json`)
Optionally add initial `proofBgOpacity` value into the Hero section object in `content/page/page.json`:
```json
"proofBgOpacity": 70
```

---

## 5. Architectural Verification & Compatibility
1. **Tina CMS Visual Editor Binding**: Placing `data-tina-field={tinaField(props, "proofs")}` or `data-tina-field={tinaField(props, "proofBgOpacity")}` ensures that editing the number field in the CMS sidebar updates the hero section live in preview mode.
2. **Backwards Compatibility**: Because `defaults.proofBgOpacity = 70` and `(proofBgOpacity ?? 70) / 100` fallbacks exist, any existing page JSON lacking `proofBgOpacity` will render identically to the current `bg-background/70` baseline.
