"use client"

import { createContext, useContext, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, ArrowRight, CalendarDays, Check, ImagePlus, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { findService, calculateEstimate, formatPrice, servicesList, addOnsList } from "@/lib/pricing"
import { cn } from "@/lib/utils"

const BookingContext = createContext<{ openBooking: (service?: string) => void }>({ openBooking: () => undefined })
export const useBooking = () => useContext(BookingContext)

const stepNames = ["Service", "Home", "Extras", "Photos", "Schedule", "Contact", "Review"]
const initialState = {
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

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initialState)
  const [photos, setPhotos] = useState<File[]>([])
  const [startedAt, setStartedAt] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [complete, setComplete] = useState(false)

  const estimate = useMemo(
    () => calculateEstimate(data.serviceType, data.bedrooms, data.bathrooms, data.addOns),
    [data],
  )

  const openBooking = (service?: string) => {
    setData((current) => ({ ...current, ...(service ? { serviceType: service } : {}) }))
    setStartedAt(Date.now())
    setOpen(true)
  }

  const canContinue = [
    Boolean(data.serviceType),
    data.bedrooms > 0 && data.bathrooms > 0,
    true,
    true,
    Boolean(data.preferredDate && data.preferredWindow),
    Boolean(data.name.trim().length > 1 && /\S+@\S+\.\S+/.test(data.email) && data.phone.trim().length >= 7),
    true,
  ][step]

  const toggleAddOn = (addOn: string) => {
    setData((current) => ({
      ...current,
      addOns: current.addOns.includes(addOn)
        ? current.addOns.filter((item) => item !== addOn)
        : [...current.addOns, addOn],
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    const body = new FormData()
    Object.entries(data).forEach(([key, value]) => body.set(key, typeof value === "object" ? JSON.stringify(value) : String(value)))
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
    setData(initialState)
    setPhotos([])
    setStep(0)
    setComplete(false)
    setOpen(false)
  }

  const selectedService = findService(data.serviceType)

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto border-border bg-background p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-border px-6 py-5 pr-14">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              <Sparkles aria-hidden="true" className="size-4" /> Free quote request
            </div>
            <SheetTitle className="font-display text-3xl font-normal">Let&apos;s plan your clean.</SheetTitle>
            <SheetDescription>Request a preferred time. Evelyn will confirm availability and final pricing.</SheetDescription>
          </SheetHeader>

          {complete ? (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check aria-hidden="true" /></div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-4xl">Request received.</h3>
                <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">Thank you, {data.name}. We look forward to working with you. Breeze will get back to you within 24 hours to confirm the details.</p>
              </div>
              <Button onClick={reset}>Back to Breeze</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex min-h-[calc(100vh-140px)] flex-col">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="border-b border-border px-6 py-4">
                <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <span>Step {step + 1} of {stepNames.length}</span><span>{stepNames[step]}</span>
                </div>
                <Progress value={((step + 1) / stepNames.length) * 100} />
              </div>

              <div className="flex-1 p-6 sm:p-8">
                {step === 0 && (
                  <FieldSet><FieldLegend>What kind of clean do you need?</FieldLegend>
                    <div className="grid gap-3">
                      {servicesList.map((svc) => (
                        <button key={svc.id} type="button" onClick={() => setData({ ...data, serviceType: svc.id })} className={cn("rounded-lg border p-5 text-left transition-colors", data.serviceType === svc.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50")}>
                          <span className="block text-lg font-medium">{svc.name}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">{svc.description}</span>
                        </button>
                      ))}
                    </div>
                  </FieldSet>
                )}
                {step === 1 && (
                  <FieldGroup>
                    <Field><FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel><Input id="bedrooms" type="number" min={1} max={10} value={data.bedrooms} onChange={(e) => setData({ ...data, bedrooms: Number(e.target.value) })} /></Field>
                    <Field><FieldLabel htmlFor="bathrooms">Bathrooms</FieldLabel><Input id="bathrooms" type="number" min={1} max={10} value={data.bathrooms} onChange={(e) => setData({ ...data, bathrooms: Number(e.target.value) })} /></Field>
                    <EstimateCallout estimate={estimate} />
                  </FieldGroup>
                )}
                {step === 2 && (
                  <FieldSet><FieldLegend>Would you like any extras?</FieldLegend>
                    <div className="flex flex-col gap-3">
                      {addOnsList.map((addOn) => (
                        <Field key={addOn.id} orientation="horizontal" className="rounded-lg border border-border bg-card p-4">
                          <Checkbox id={addOn.id} checked={data.addOns.includes(addOn.id)} onCheckedChange={() => toggleAddOn(addOn.id)} />
                          <FieldLabel htmlFor={addOn.id} className="flex flex-1 justify-between"><span>{addOn.name}</span><span className="font-mono text-primary">+{formatPrice(addOn.cents)}</span></FieldLabel>
                        </Field>
                      ))}
                    </div>
                    <EstimateCallout estimate={estimate} />
                  </FieldSet>
                )}
                {step === 3 && (
                  <FieldGroup><Field><FieldLabel htmlFor="photos">Add 3–5 photos for a more accurate quote</FieldLabel>
                    <label htmlFor="photos" className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-8 text-center">
                      <ImagePlus aria-hidden="true" className="size-7 text-primary" /><span className="font-medium">Choose home photos</span><span className="text-sm text-muted-foreground">Optional. JPG, PNG, WEBP, or HEIC · 5 MB each</span>
                    </label>
                    <Input id="photos" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, 5))} />
                    <FieldDescription>{photos.length ? `${photos.length} photo${photos.length === 1 ? "" : "s"} selected and stored privately.` : "You can continue without photos."}</FieldDescription></Field></FieldGroup>
                )}
                {step === 4 && (
                  <FieldGroup><Field><FieldLabel htmlFor="date">Preferred date</FieldLabel><Input id="date" type="date" min={new Date().toISOString().split("T")[0]} value={data.preferredDate} onChange={(e) => setData({ ...data, preferredDate: e.target.value })} /></Field>
                    <FieldSet><FieldLegend variant="label">Preferred time window</FieldLegend><div className="grid grid-cols-3 gap-2">{["morning", "afternoon", "flexible"].map((window) => <button key={window} type="button" onClick={() => setData({ ...data, preferredWindow: window })} className={cn("rounded-md border px-2 py-3 text-sm capitalize", data.preferredWindow === window ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{window}</button>)}</div></FieldSet>
                    <FieldDescription><CalendarDays aria-hidden="true" className="mr-2 inline size-4" />This is a request, not a confirmed appointment.</FieldDescription>
                  </FieldGroup>
                )}
                {step === 5 && (
                  <FieldGroup>
                    <Field><FieldLabel htmlFor="name">Name</FieldLabel><Input id="name" autoComplete="name" required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" type="email" autoComplete="email" required value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="phone">Phone</FieldLabel><Input id="phone" type="tel" autoComplete="tel" required value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} /></Field>
                  </FieldGroup>
                )}
                {step === 6 && selectedService && (
                  <div className="flex flex-col gap-6">
                    <div><p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Your request</p><h3 className="mt-2 font-display text-4xl">{selectedService.name}</h3></div>
                    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
                      {[['Home', `${data.bedrooms} bed / ${data.bathrooms} bath`], ['Preferred date', data.preferredDate], ['Window', data.preferredWindow], ['Photos', String(photos.length)]].map(([label, value]) => <div key={label} className="bg-card p-4"><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 capitalize">{value}</dd></div>)}
                    </dl>
                    <EstimateCallout estimate={estimate} />
                    <p className="text-sm leading-relaxed text-muted-foreground">A free quote is required — either through an in-person visit or by sending 3–5 photos/videos. This ensures you receive a fair and accurate price.</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
                <Button type="button" variant="ghost" disabled={step === 0 || submitting} onClick={() => setStep(step - 1)}><ArrowLeft data-icon="inline-start" /> Back</Button>
                {step < 6 ? <Button type="button" disabled={!canContinue} onClick={() => setStep(step + 1)}>Continue <ArrowRight data-icon="inline-end" /></Button> : <Button type="submit" disabled={submitting}>{submitting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />} Submit request</Button>}
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </BookingContext.Provider>
  )
}

function EstimateCallout({ estimate }: { estimate: number | null }) {
  return <div className="rounded-lg border border-primary/30 bg-primary/10 p-4"><p className="font-mono text-xs uppercase tracking-wider text-primary">Base estimate</p><p className="mt-1 font-display text-3xl">{estimate === null ? "Custom quote required" : formatPrice(estimate)}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Final pricing is confirmed after Breeze reviews your home details.</p></div>
}
