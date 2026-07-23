"use client"

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, HelpCircle, ImagePlus, Info, Loader2, Shield, Sparkles, Star, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { calculateEstimate, formatPrice } from "@/lib/pricing"
import type { ServiceItemData, AddOnData } from "@/lib/pricing"
import { t, type BookingContent, type FormFieldBlock, type FormStepBlock, normalizeBookingData, defaultSteps } from "@/lib/booking-content"
import { cn } from "@/lib/utils"
import { useTina } from "tinacms/dist/react"
import { tinaField } from "tinacms/dist/tina-field"

const BookingContext = createContext<{
  openBooking: (service?: string) => void
  content: BookingContent
  servicesList: ServiceItemData[]
  addOnsList: AddOnData[]
  rawPricing: any
}>({
  openBooking: () => undefined,
  content: {} as BookingContent,
  servicesList: [],
  addOnsList: [],
  rawPricing: null,
})

export const useBooking = () => useContext(BookingContext)

const initialState: Record<string, any> = {
  serviceType: "deep",
  bedrooms: 1,
  bathrooms: 1,
  addOns: [] as string[],
  preferredDate: "",
  preferredWindow: "flexible",
  name: "",
  email: "",
  phone: "",
}

export function BookingProvider({
  content: propContent,
  tina,
  children,
}: {
  content: BookingContent
  tina?: { query: string; variables: any; data: any } | null
  children: ReactNode
}) {
  if (tina && tina.query) {
    return (
      <BookingProviderTinaWrapper
        content={propContent}
        tina={tina}
      >
        {children}
      </BookingProviderTinaWrapper>
    )
  }

  return (
    <BookingProviderStaticWrapper content={propContent}>
      {children}
    </BookingProviderStaticWrapper>
  )
}

function BookingProviderStaticWrapper({
  content,
  children,
}: {
  content: BookingContent
  children: ReactNode
}) {
  return (
    <BookingDrawerCore
      content={content}
      servicesList={content.services || []}
      addOnsList={content.addOns || []}
      rawBooking={null}
      rawPricing={null}
      previewOpen={false}
    >
      {children}
    </BookingDrawerCore>
  )
}

function BookingProviderTinaWrapper({
  content: propContent,
  tina,
  children,
}: {
  content: BookingContent
  tina: { query: string; variables: any; data: any }
  children: ReactNode
}) {
  const tinaResult = useTina({
    query: tina.query,
    variables: tina.variables,
    data: tina.data,
  })

  const rawBooking = tinaResult.data?.booking
  const content = useMemo(() => {
    return rawBooking ? normalizeBookingData(rawBooking) : propContent
  }, [rawBooking, propContent])

  const servicesList = useMemo(() => {
    return rawBooking?.services || content.services || []
  }, [rawBooking, content])

  const addOnsList = useMemo(() => {
    return rawBooking?.addOns || content.addOns || []
  }, [rawBooking, content])

  // previewOpen is a CMS editor toggle — never force-open from content data
  const previewOpen = false

  return (
    <BookingDrawerCore
      content={content}
      servicesList={servicesList}
      addOnsList={addOnsList}
      rawBooking={rawBooking}
      rawPricing={rawBooking}
      previewOpen={previewOpen}
    >
      {children}
    </BookingDrawerCore>
  )
}

function BookingDrawerCore({
  content,
  servicesList,
  addOnsList,
  rawBooking,
  rawPricing,
  previewOpen,
  children,
}: {
  content: BookingContent
  servicesList: ServiceItemData[]
  addOnsList: AddOnData[]
  rawBooking: any
  rawPricing: any
  previewOpen: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(previewOpen)
  const [stepIndex, setStepIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>(initialState)
  const [photos, setPhotos] = useState<File[]>([])
  const [startedAt, setStartedAt] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [complete, setComplete] = useState(false)

  // Sync open state when CMS previewOpen toggle changes
  useEffect(() => {
    if (previewOpen) {
      setOpen(true)
    }
  }, [previewOpen])

  // Dynamic Theme CSS Custom Properties & Style Override
  const themeStyle = useMemo(() => {
    const t = content.theme
    const style: Record<string, string> = {}
    if (t?.fontFamily && t.fontFamily !== "sans-serif") style.fontFamily = t.fontFamily
    if (t?.backgroundColor) style.backgroundColor = t.backgroundColor
    if (t?.textColor) style.color = t.textColor
    if (t?.primaryColor) style["--primary"] = t.primaryColor
    if (t?.borderRadius) style["--radius"] = t.borderRadius
    return style as React.CSSProperties
  }, [content.theme])

  // Active steps filtered by conditional logic
  const steps = useMemo(() => {
    const rawSteps = content.steps?.length ? content.steps : defaultSteps
    return rawSteps
      .map((step, originalIndex) => ({ step, originalIndex }))
      .filter(({ step }) => {
        if (step.disabled) return false
        if (!step.showIfField) return true
        const val = formData[step.showIfField]
        if (step.showIfOperator === "equals") return String(val) === String(step.showIfValue)
        if (step.showIfOperator === "not_equals") return String(val) !== String(step.showIfValue)
        if (step.showIfOperator === "contains") return String(val).includes(String(step.showIfValue))
        return true
      })
  }, [content.steps, formData])

  // Clamp stepIndex within bounds
  const currentStepItem = steps[stepIndex] || steps[0] || { step: defaultSteps[0], originalIndex: 0 }
  const currentStep = currentStepItem.step
  const originalStepIndex = currentStepItem.originalIndex
  const totalSteps = steps.length

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleAddOn = (addOnId: string) => {
    setFormData((prev) => {
      const currentAddOns = Array.isArray(prev.addOns) ? prev.addOns : []
      return {
        ...prev,
        addOns: currentAddOns.includes(addOnId)
          ? currentAddOns.filter((id: string) => id !== addOnId)
          : [...currentAddOns, addOnId],
      }
    })
  }

  const estimate = useMemo(() => {
    return calculateEstimate(
      formData.serviceType,
      formData.bedrooms || 1,
      formData.bathrooms || 1,
      Array.isArray(formData.addOns) ? formData.addOns : [],
      servicesList,
      addOnsList
    )
  }, [formData.serviceType, formData.bedrooms, formData.bathrooms, formData.addOns, servicesList, addOnsList])

  const openBooking = (service?: string) => {
    setFormData((current) => ({ ...current, ...(service ? { serviceType: service } : {}) }))
    setStartedAt(Date.now())
    setStepIndex(0)
    setOpen(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (stepIndex < totalSteps - 1) {
      return
    }
    if (submitting) return
    setSubmitting(true)
    const body = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      body.set(key, typeof value === "object" ? JSON.stringify(value) : String(value))
    })
    body.set("startedAt", String(startedAt))
    body.set("website", "")
    photos.forEach((photo) => body.append("photos", photo))

    try {
      const response = await fetch("/api/bookings", { method: "POST", body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setComplete(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit your request.")
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setFormData(initialState)
    setPhotos([])
    setStepIndex(0)
    setComplete(false)
    setOpen(false)
  }

  const selectedService = servicesList.find((s) => s.id === formData.serviceType)

  return (
    <BookingContext.Provider
      value={{
        openBooking,
        content,
        servicesList,
        addOnsList,
        rawPricing,
      }}
    >
      {children}
      <Sheet open={open} onOpenChange={setOpen} modal={!rawBooking}>
        <SheetContent
          className="w-full overflow-y-auto border-border bg-background p-0 sm:max-w-xl"
          style={{ zIndex: 60, ...themeStyle }}
          data-tina-field={rawBooking ? tinaField(rawBooking) : undefined}
        >
          <SheetHeader className="border-b border-border px-6 py-5 pr-14">
            <div
              className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary"
              data-tina-field={rawBooking ? tinaField(rawBooking.header, "badge") : undefined}
            >
              <Sparkles aria-hidden="true" className="size-4" /> {content.header.badge}
            </div>
            <SheetTitle
              className="font-display text-3xl font-normal"
              data-tina-field={rawBooking ? tinaField(rawBooking.header, "title") : undefined}
            >
              {content.header.title}
            </SheetTitle>
            <SheetDescription data-tina-field={rawBooking ? tinaField(rawBooking.header, "description") : undefined}>
              {content.header.description}
            </SheetDescription>
          </SheetHeader>

          {complete ? (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className="font-display text-4xl"
                  data-tina-field={rawBooking ? tinaField(rawBooking.success, "title") : undefined}
                >
                  {content.success.title}
                </h3>
                <p
                  className="max-w-sm text-pretty leading-relaxed text-muted-foreground"
                  data-tina-field={rawBooking ? tinaField(rawBooking.success, "message") : undefined}
                >
                  {t(content.success.message, { name: formData.name || "there" })}
                </p>
              </div>
              <Button onClick={reset} data-tina-field={rawBooking ? tinaField(rawBooking.success, "buttonText") : undefined}>
                {content.success.buttonText}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              data-tina-field={rawBooking ? tinaField(rawBooking) : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target instanceof HTMLElement && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                  e.preventDefault()
                }
              }}
              className="flex min-h-[calc(100vh-140px)] flex-col"
              style={{ pointerEvents: "auto" }}
            >
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              
              {/* Progress Header */}
              <div className="border-b border-border px-6 py-4">
                <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <span>Step {stepIndex + 1} of {totalSteps}</span>
                  <span data-tina-field={rawBooking ? tinaField(rawBooking.steps?.[originalStepIndex], "title") : undefined}>
                    {currentStep.title}
                  </span>
                </div>
                <Progress value={((stepIndex + 1) / totalSteps) * 100} />
              </div>

              {/* Step Content Block Renderer */}
              <div className="flex-1 p-6 sm:p-8">
                {currentStep.description && (
                  <p
                    className="mb-6 text-sm text-muted-foreground"
                    data-tina-field={rawBooking ? tinaField(rawBooking.steps?.[originalStepIndex], "description") : undefined}
                  >
                    {currentStep.description}
                  </p>
                )}

                <div className="flex flex-col gap-6">
                  {currentStep.fields?.map((field: FormFieldBlock, fieldIdx: number) => {
                    const tinaAttr = rawBooking
                      ? tinaField(rawBooking.steps?.[originalStepIndex]?.fields?.[fieldIdx])
                      : undefined

                    switch (field._template) {
                      case "servicesSelector":
                        return (
                          <FieldSet key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            <FieldLegend>{field.question}</FieldLegend>
                            <div className="grid gap-3">
                              {servicesList.map((svc, index) => (
                                <button
                                  key={svc.id || `service-${index}`}
                                  type="button"
                                  onClick={() => updateField("serviceType", svc.id)}
                                  className={cn(
                                    "rounded-lg border p-5 text-left transition-colors",
                                    formData.serviceType === svc.id
                                      ? "border-primary bg-primary/10"
                                      : "border-border bg-card hover:border-primary/50"
                                  )}
                                  data-tina-field={rawPricing ? tinaField(rawPricing?.services?.[index], "name") : undefined}
                                >
                                  <span className="block text-lg font-medium">{svc.name || "New Service"}</span>
                                  <span className="mt-1 block text-sm text-muted-foreground">{svc.description || ""}</span>
                                </button>
                              ))}
                            </div>
                          </FieldSet>
                        )

                      case "addonsSelector":
                        return (
                          <FieldSet key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            <FieldLegend>{field.question}</FieldLegend>
                            <div className="flex flex-col gap-3">
                              {addOnsList.map((addOn, index) => (
                                <Field key={addOn.id || `addon-${index}`} orientation="horizontal" className="rounded-lg border border-border bg-card p-4">
                                  <Checkbox
                                    id={addOn.id}
                                    checked={Array.isArray(formData.addOns) && formData.addOns.includes(addOn.id)}
                                    onCheckedChange={() => toggleAddOn(addOn.id)}
                                  />
                                  <FieldLabel
                                    htmlFor={addOn.id}
                                    className="flex flex-1 justify-between"
                                    data-tina-field={rawPricing ? tinaField(rawPricing?.addOns?.[index], "name") : undefined}
                                  >
                                    <span>{addOn.name || "New Add-on"}</span>
                                    <span className="font-mono text-primary">+{formatPrice(addOn.cents || 0)}</span>
                                  </FieldLabel>
                                </Field>
                              ))}
                            </div>
                            <EstimateCallout content={content} rawBooking={rawBooking} estimate={estimate} />
                          </FieldSet>
                        )

                      case "textInput":
                        return (
                          <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                            <Input
                              id={field.name}
                              type={field.validationType === "email" ? "email" : field.validationType === "phone" ? "tel" : "text"}
                              placeholder={field.placeholder || ""}
                              required={field.required}
                              value={formData[field.name || ""] || ""}
                              onChange={(e) => updateField(field.name || "", e.target.value)}
                            />
                          </Field>
                        )

                      case "numberInput": {
                        const rawVal = formData[field.name || ""]
                        const displayVal = rawVal === 0 || rawVal === "" ? "" : (rawVal ?? field.min ?? 1)
                        return (
                          <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                            <Input
                              id={field.name}
                              type="number"
                              min={field.min ?? 1}
                              max={field.max ?? 10}
                              value={displayVal}
                              onChange={(e) => {
                                const str = e.target.value
                                if (str === "") {
                                  updateField(field.name || "", "")
                                } else {
                                  const parsed = parseInt(str, 10)
                                  updateField(field.name || "", isNaN(parsed) ? "" : parsed)
                                }
                              }}
                              onBlur={() => {
                                const current = formData[field.name || ""]
                                if (current === "" || current === undefined || current === null || Number(current) < (field.min ?? 1)) {
                                  updateField(field.name || "", field.min ?? 1)
                                } else if (Number(current) > (field.max ?? 10)) {
                                  updateField(field.name || "", field.max ?? 10)
                                }
                              }}
                            />
                          </Field>
                        )
                      }

                      case "choiceInput":
                        return (
                          <FieldSet key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            <FieldLegend variant="label">{field.label}</FieldLegend>
                            <div className="grid grid-cols-3 gap-2">
                              {field.options?.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => updateField(field.name || "", opt.id)}
                                  className={cn(
                                    "rounded-md border px-2 py-3 text-sm capitalize",
                                    formData[field.name || ""] === opt.id
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </FieldSet>
                        )

                      case "dateInput":
                        return (
                          <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                            <Input
                              id={field.name}
                              type="date"
                              min={new Date().toISOString().split("T")[0]}
                              value={formData[field.name || ""] || ""}
                              onChange={(e) => updateField(field.name || "", e.target.value)}
                            />
                          </Field>
                        )

                      case "photoUpload":
                        return (
                          <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            <FieldLabel htmlFor="photos">{field.label}</FieldLabel>
                            <label
                              htmlFor="photos"
                              className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-8 text-center"
                            >
                              <ImagePlus aria-hidden="true" className="size-7 text-primary" />
                              <span className="font-medium">{field.prompt}</span>
                              <span className="text-sm text-muted-foreground">{field.hint}</span>
                            </label>
                            <Input
                              id="photos"
                              className="sr-only"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/heic"
                              multiple
                              onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, 5))}
                            />
                            <FieldDescription>
                              {photos.length
                                ? t(field.selectedText ?? "{count} photo{s} selected", { count: String(photos.length), s: photos.length === 1 ? "" : "s" })
                                : field.emptyText}
                            </FieldDescription>
                          </Field>
                        )

                      case "richTextHeading":
                        return (
                          <div key={`field-${fieldIdx}`} className="rounded-lg border border-accent bg-accent/5 p-4 text-sm text-muted-foreground" data-tina-field={tinaAttr}>
                            {field.text}
                          </div>
                        )

                      case "estimateSummary":
                        return (
                          <div key={`field-${fieldIdx}`} className="flex flex-col gap-6" data-tina-field={tinaAttr}>
                            {selectedService && (
                              <div>
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{content.reviewLabels.heading}</p>
                                <h3 className="mt-2 font-display text-4xl">{selectedService.name}</h3>
                              </div>
                            )}
                            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
                              {[
                                [content.reviewLabels.rowHome, `${formData.bedrooms || 1} bed / ${formData.bathrooms || 1} bath`],
                                [content.reviewLabels.rowDate, formData.preferredDate || "N/A"],
                                [content.reviewLabels.rowWindow, formData.preferredWindow || "flexible"],
                                [content.reviewLabels.rowPhotos, String(photos.length)],
                              ].map(([label, value]) => (
                                <div key={label} className="bg-card p-4">
                                  <dt className="text-muted-foreground">{label}</dt>
                                  <dd className="mt-1 capitalize">{value}</dd>
                                </div>
                              ))}
                            </dl>
                            <EstimateCallout content={content} rawBooking={rawBooking} estimate={estimate} />
                            <p className="text-sm leading-relaxed text-muted-foreground">{field.disclaimer || content.reviewLabels.disclaimer}</p>
                          </div>
                        )

                      case "imageBlock": {
                        const aspectClass =
                          field.aspect === "16/9" || field.aspect === "video" ? "aspect-video" :
                          field.aspect === "4/3" ? "aspect-[4/3]" :
                          field.aspect === "1/1" || field.aspect === "square" ? "aspect-square" :
                          "aspect-auto"

                        return (
                          <div key={`field-${fieldIdx}`} className="overflow-hidden rounded-lg border border-border bg-card p-2" data-tina-field={tinaAttr}>
                            {field.src ? (
                              <div className={cn("relative w-full overflow-hidden rounded-md bg-muted", aspectClass)}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={field.src}
                                  alt={field.alt || ""}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-32 w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                                {field.alt || "No image specified"}
                              </div>
                            )}
                            {field.caption && (
                              <p className="mt-2 text-center text-xs text-muted-foreground">
                                {field.caption}
                              </p>
                            )}
                          </div>
                        )
                      }

                      case "infoCard": {
                        const variantClass =
                          field.variant === "highlight"
                            ? "border-primary/40 bg-primary/10 text-card-foreground"
                            : field.variant === "outline"
                            ? "border-border bg-transparent text-card-foreground"
                            : "border-border bg-card text-card-foreground"

                        const IconComp =
                          field.icon === "sparkles" ? Sparkles :
                          field.icon === "shield" ? Shield :
                          field.icon === "star" ? Star :
                          field.icon === "check" ? CheckCircle2 :
                          field.icon === "help" ? HelpCircle :
                          Info

                        return (
                          <div key={`field-${fieldIdx}`} className={cn("rounded-lg border p-4 shadow-sm", variantClass)} data-tina-field={tinaAttr}>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0 text-primary">
                                <IconComp aria-hidden="true" className="size-5" />
                              </div>
                              <div className="flex-1">
                                {field.title && <h4 className="font-medium text-base leading-snug">{field.title}</h4>}
                                {field.description && (
                                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {field.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      }

                      case "infoBanner": {
                        const typeClass =
                          field.type === "warning"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                            : field.type === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                            : "border-primary/30 bg-primary/10 text-primary"

                        const BannerIcon =
                          field.type === "warning" ? AlertTriangle :
                          field.type === "success" ? CheckCircle2 :
                          Info

                        return (
                          <InfoBannerItem
                            key={`field-${fieldIdx}`}
                            field={field}
                            tinaAttr={tinaAttr}
                            typeClass={typeClass}
                            BannerIcon={BannerIcon}
                          />
                        )
                      }

                      case "textareaInput":
                        return (
                          <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            {field.label && <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>}
                            <textarea
                              id={field.name}
                              rows={field.rows || 3}
                              placeholder={field.placeholder || ""}
                              required={field.required}
                              value={formData[field.name || ""] || ""}
                              onChange={(e) => updateField(field.name || "", e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </Field>
                        )

                      case "selectInput": {
                        const currentValue = formData[field.name || ""] ?? field.defaultValue ?? ""
                        return (
                          <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            {field.label && <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>}
                            <select
                              id={field.name}
                              required={field.required}
                              value={currentValue}
                              onChange={(e) => updateField(field.name || "", e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {!field.defaultValue && <option value="">Select an option...</option>}
                              {field.options?.map((opt, optIdx) => (
                                <option key={opt.value || opt.id || `opt-${optIdx}`} value={opt.value || opt.id || ""}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                        )
                      }

                      case "checkboxGroup": {
                        const currentValues: string[] = Array.isArray(formData[field.name || ""])
                          ? formData[field.name || ""]
                          : []

                        const toggleGroupOption = (val: string) => {
                          const next = currentValues.includes(val)
                            ? currentValues.filter((v) => v !== val)
                            : [...currentValues, val]
                          updateField(field.name || "", next)
                        }

                        return (
                          <FieldSet key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
                            {field.label && <FieldLegend>{field.label}</FieldLegend>}
                            <div className="flex flex-col gap-3">
                              {field.options?.map((opt, optIdx) => {
                                const optValue = opt.value || opt.id || `val-${optIdx}`
                                const isChecked = currentValues.includes(optValue)
                                const optId = `${field.name || "cb"}-${optIdx}`
                                return (
                                  <Field key={optId} orientation="horizontal" className="rounded-lg border border-border bg-card p-4">
                                    <Checkbox
                                      id={optId}
                                      checked={isChecked}
                                      onCheckedChange={() => toggleGroupOption(optValue)}
                                    />
                                    <FieldLabel htmlFor={optId} className="flex flex-1 justify-between">
                                      <span>{opt.label}</span>
                                      {typeof opt.priceCents === "number" && opt.priceCents > 0 && (
                                        <span className="font-mono text-primary">+{formatPrice(opt.priceCents)}</span>
                                      )}
                                    </FieldLabel>
                                  </Field>
                                )
                              })}
                            </div>
                          </FieldSet>
                        )
                      }

                      default:
                        return null
                    }
                  })}
                  {originalStepIndex === 1 && (
                    <EstimateCallout content={content} rawBooking={rawBooking} estimate={estimate} />
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
                <Button
                  key="back-btn"
                  type="button"
                  variant="ghost"
                  disabled={stepIndex === 0 || submitting}
                  onClick={() => setStepIndex(stepIndex - 1)}
                  data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "back") : undefined}
                >
                  <ArrowLeft data-icon="inline-start" /> {content.navigation.back}
                </Button>
                {stepIndex < totalSteps - 1 ? (
                  <Button
                    key="continue-btn"
                    type="button"
                    onClick={() => setStepIndex(stepIndex + 1)}
                    data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "continue") : undefined}
                  >
                    {content.navigation.continue} <ArrowRight data-icon="inline-end" />
                  </Button>
                ) : (
                  <Button
                    key="submit-btn"
                    type="submit"
                    disabled={submitting}
                    data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "submit") : undefined}
                  >
                    {submitting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
                    {content.navigation.submit}
                  </Button>
                )}
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </BookingContext.Provider>
  )
}

function InfoBannerItem({
  field,
  tinaAttr,
  typeClass,
  BannerIcon,
}: {
  field: FormFieldBlock
  tinaAttr?: string
  typeClass: string
  BannerIcon: any
}) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className={cn("relative flex items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed", typeClass)} data-tina-field={tinaAttr}>
      <BannerIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1 whitespace-pre-line">{field.text}</div>
      {field.dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label="Dismiss banner"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  )
}

function EstimateCallout({ content, rawBooking, estimate }: { content: BookingContent; rawBooking: any; estimate: number | null }) {
  const c = content.estimate
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-primary" data-tina-field={rawBooking ? tinaField(rawBooking.estimate, "label") : undefined}>
        {c.label}
      </p>
      <p className="mt-1 font-display text-3xl" data-tina-field={rawBooking ? tinaField(rawBooking.estimate, "customQuote") : undefined}>
        {estimate === null ? c.customQuote : formatPrice(estimate)}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground" data-tina-field={rawBooking ? tinaField(rawBooking.estimate, "disclaimer") : undefined}>
        {c.disclaimer}
      </p>
    </div>
  )
}
