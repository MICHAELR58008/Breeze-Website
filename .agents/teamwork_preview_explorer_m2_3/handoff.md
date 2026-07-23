# Handoff Report — Explorer 3: Implementation Blueprint Formulation (Milestone 2)

## 1. Observation
- **Project Requirements & Scope**:
  - `c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\orchestrator\PROJECT.md` lines 10-19:
    > R1: Create a reusable Client Component Error Boundary (`components/ui/error-boundary.tsx`) that catches rendering errors in child components and displays a clean fallback UI.
    > R2: Protect Image in About Section (`components/sections/about.tsx`) by wrapping `<Image />` with `<ErrorBoundary>`.
    > R3: Ensure `npm run build` succeeds cleanly without TypeScript or React errors.
  - `c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\orchestrator\plan.md` lines 14-16:
    > Explorer 3: Formulate exact code specifications for `components/ui/error-boundary.tsx` (props like `fallback`, `children`, `onReset`, state `hasError`, error details) and implementation plan for `about.tsx`.
- **Existing `components/sections/about.tsx`**:
  - Lines 47-57:
    ```tsx
    {hasImage ? (
      /* Full container coverage with custom interactive crop focal point */
      <>
        <Image
          src={image!}
          alt={ownerName || "Owner"}
          fill
          priority
          className="object-cover"
          style={{ objectPosition: activePosition }}
        />
        {/* Subtle dark gradient overlay at bottom for text legibility */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pt-12 z-10"> ... </div>
      </>
    ) : ...
    ```
- **Dependencies**:
  - `package.json` specifies `"react": "^19"`, `"next": "16.2.0"`, `"lucide-react": "^0.454.0"`.

---

## 2. Logic Chain
1. **React Class Component Requirement for Error Boundaries**:
   - In React (including React 19 / Next.js Client Components), Error Boundaries MUST be React Class Components because lifecycle methods `getDerivedStateFromError` and `componentDidCatch` are not available in functional components.
   - The file `components/ui/error-boundary.tsx` must begin with the `"use client"` directive so Next.js treats it as a Client Component.
2. **`ErrorBoundary` Component Design**:
   - **Props**:
     - `children?: React.ReactNode`
     - `fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)`
     - `onError?: (error: Error, errorInfo: React.ErrorInfo) => void`
     - `onReset?: () => void`
     - `className?: string`
   - **State**:
     - `hasError: boolean`
     - `error: Error | null`
   - **Static Method**: `static getDerivedStateFromError(error: Error): ErrorBoundaryState` returning `{ hasError: true, error }`.
   - **Lifecycle Method**: `componentDidCatch(error: Error, errorInfo: React.ErrorInfo)` to invoke optional `onError` callback and log errors.
   - **Reset Method**: `resetErrorBoundary = () => { this.props.onReset?.(); this.setState({ hasError: false, error: null }); }`.
   - **Default Fallback**: Built-in Tailwind-styled fallback card with `AlertTriangle` icon and "Try again" button, used when no custom `fallback` prop is supplied. Supports custom `fallback` passed either as a `ReactNode` or a function `(error, reset) => ReactNode`.
3. **Wrapping `<Image />` in `components/sections/about.tsx`**:
   - Import `ErrorBoundary` from `@/components/ui/error-boundary`.
   - Wrap the `<Image ... />` inside `<ErrorBoundary fallback={...}>`.
   - Using a custom fallback (`ImageOff` icon with subtle message) inside `ErrorBoundary` ensures that if image rendering fails (e.g. broken image asset, invalid URL, or Next.js image error), the layout dimensions (`min-h-[440px]`) are maintained, and the gradient overlay text (`eyebrow` & `tagline`) remains intact (`z-10`).

---

## 3. Caveats
- Next.js Error Boundaries catch rendering errors, lifecycle errors, and constructors of child components in client component trees. They do not catch errors inside async event handlers or SSR errors occurring outside the React tree, though Next.js `Image` render errors will be caught cleanly.
- No other codebase files need modification beyond `components/ui/error-boundary.tsx` and `components/sections/about.tsx`.

---

## 4. Conclusion & Implementation Blueprint for Worker

### Step-by-Step Execution Blueprint

#### Step 1: Create `components/ui/error-boundary.tsx`
Create a new file at `components/ui/error-boundary.tsx` with the following complete code structure:

```tsx
"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

export interface ErrorBoundaryProps {
  children?: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  className?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  public resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset()
    }
    this.setState({ hasError: false, error: null })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(
            this.state.error || new Error("Unknown error"),
            this.resetErrorBoundary
          )
        }
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          className={`flex min-h-[120px] w-full flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-destructive ${
            this.props.className || ""
          }`}
        >
          <AlertTriangle className="mb-2 h-6 w-6" />
          <h3 className="text-sm font-semibold">Something went wrong</h3>
          <p className="mt-1 text-xs opacity-80">
            {this.state.error?.message || "An error occurred while rendering this component."}
          </p>
          <button
            type="button"
            onClick={this.resetErrorBoundary}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-destructive/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-destructive/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

#### Step 2: Update `components/sections/about.tsx`
Update `components/sections/about.tsx` to import `ErrorBoundary` and `ImageOff`, and wrap `<Image />` with `<ErrorBoundary>`:

```tsx
import Image from "next/image"
import { tinaField } from "tinacms/dist/tina-field"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ImageOff } from "lucide-react"

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
  const { eyebrow, ownerName, nameInitial, tagline, bioParagraph1, bioParagraph2, image, focalPoint } = {
    ...defaults,
    ...props,
  }

  const hasImage = Boolean(image && image.trim())
  const hasLeftContent = Boolean(hasImage || eyebrow?.trim() || nameInitial?.trim() || tagline?.trim())

  const activePosition = focalPoint || "50% 0%"

  return (
    <section id="about" className="mx-auto grid max-w-[1400px] border-x border-border lg:grid-cols-12">
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
                  <p data-tina-field={tinaField(props, "eyebrow")} className="font-mono text-xs uppercase tracking-widest text-white/90">{eyebrow}</p>
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
                  <p data-tina-field={tinaField(props, "eyebrow")} className="font-mono text-xs uppercase tracking-widest">{eyebrow}</p>
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
        {ownerName?.trim() && (
          <h2 data-tina-field={tinaField(props, "ownerName")} className="font-display text-6xl sm:text-8xl">{ownerName}</h2>
        )}
        {bioParagraph1?.trim() && (
          <p data-tina-field={tinaField(props, "bioParagraph1")} className="text-pretty text-lg leading-relaxed text-muted-foreground">{bioParagraph1}</p>
        )}
        {bioParagraph2?.trim() && (
          <p data-tina-field={tinaField(props, "bioParagraph2")} className="text-pretty text-lg leading-relaxed">{bioParagraph2}</p>
        )}
      </div>
    </section>
  )
}
```

---

## 5. Verification Method

To verify the implementation after Worker edits:

1. **Type Check**:
   Run in terminal at project root (`c:\Users\SOL\Desktop\Projet for Breeze\wesite`):
   ```bash
   npx tsc --noEmit
   ```
   *Expected result*: Clean exit code 0 without any TypeScript compilation errors.

2. **Next.js Production Build**:
   Run in terminal at project root:
   ```bash
   npm run build
   ```
   *Expected result*: Successful build with all pages compiled cleanly.

3. **File Inspection**:
   - `components/ui/error-boundary.tsx`: Verify `"use client"` header, `ErrorBoundary` class export, `getDerivedStateFromError`, `componentDidCatch`, `resetErrorBoundary`, and fallback handling.
   - `components/sections/about.tsx`: Verify import of `ErrorBoundary` and `<Image />` wrapped with `<ErrorBoundary fallback={...}>`.

4. **Invalidation Conditions**:
   - Failure of `npx tsc --noEmit` or `npm run build`.
   - Missing `"use client"` in `components/ui/error-boundary.tsx`.
   - `ErrorBoundary` not being a React class component.
   - `<Image />` not wrapped inside `ErrorBoundary`.
