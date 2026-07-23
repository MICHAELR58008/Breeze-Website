import React, { useRef } from "react"
import { wrapFieldsWithMeta } from "tinacms"
import { ErrorBoundary } from "./ErrorBoundary"

const FocalPointPickerInner = (props: any) => {
  const { input, form } = props
  const imageRef = useRef<HTMLImageElement>(null)

  // Determine the sibling image field path (e.g., "sections.2.focalPoint" -> "sections.2.image")
  const fieldName = input.name || ""
  const imagePath = fieldName.includes(".")
    ? fieldName.substring(0, fieldName.lastIndexOf(".")) + ".image"
    : "image"

  // Use form.getFieldState per TinaCMS docs instead of manual value digging
  const imageUrl =
    form?.getFieldState?.(imagePath)?.value ||
    form?.getFieldState?.("image")?.value ||
    ""

  // Current focal point value, e.g., "50% 20%" or default "50% 0%"
  const rawValue = input.value || "50% 0%"
  const value = typeof rawValue === "string" ? rawValue : "50% 0%"
  const [posX, posY] = value.split(" ").map((v: string) => parseFloat(v) || 0)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const xPct = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
    const yPct = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)))

    const newValue = `${xPct}% ${yPct}%`
    input.onChange(newValue)
  }

  if (!imageUrl) {
    return (
      <div className="p-3 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-dashed text-center">
        Upload an owner photo above to select a crop focal point.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative cursor-crosshair overflow-hidden rounded border border-gray-300 dark:border-gray-700 bg-slate-900 group select-none"
        onPointerDown={handlePointerDown}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Focal point preview"
          className="w-full h-auto max-h-48 object-contain pointer-events-none"
        />
        {/* Visual Target Reticle */}
        <div
          className="absolute w-6 h-6 border-2 border-white bg-primary/70 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md pointer-events-none transition-all flex items-center justify-center"
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
        <span>Click image to set crop center</span>
        <span className="font-semibold text-primary">{value}</span>
      </div>
    </div>
  )
}

export const FocalPointPicker = wrapFieldsWithMeta((props: any) => (
  <ErrorBoundary>
    <FocalPointPickerInner {...props} />
  </ErrorBoundary>
))
