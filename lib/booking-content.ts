import defaultData from "@/content/booking/booking.json"
import type { ServiceItemData, AddOnData } from "@/lib/pricing"

export type BookingService = ServiceItemData

export interface FormFieldBlock {
  _template: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  validationType?: string
  min?: number
  max?: number
  options?: Array<{ id?: string; value?: string; label: string; priceCents?: number }>
  hint?: string
  text?: string
  question?: string
  disclaimer?: string
  prompt?: string
  selectedText?: string
  emptyText?: string
  src?: string
  alt?: string
  caption?: string
  aspect?: string
  title?: string
  description?: string
  icon?: string
  variant?: string
  type?: string
  dismissible?: boolean
  rows?: number
  defaultValue?: string
}

export interface FormStepBlock {
  title: string
  description?: string
  disabled?: boolean
  showIfField?: string
  showIfOperator?: string
  showIfValue?: string
  fields?: FormFieldBlock[]
}

export interface ThemeConfig {
  fontFamily?: string
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderRadius?: string
}

export interface BookingContent {
  theme?: ThemeConfig
  steps?: FormStepBlock[]
  header: { badge: string; title: string; description: string }
  stepNames: string[]

  timeWindows: Array<{ id: string; label: string }>
  reviewLabels: {
    heading: string
    rowHome: string
    rowDate: string
    rowWindow: string
    rowPhotos: string
    disclaimer: string
  }
  navigation: { back: string; continue: string; submit: string }
  success: { title: string; message: string; buttonText: string }
  estimate: { label: string; customQuote: string; disclaimer: string }
  services: ServiceItemData[]
  addOns: AddOnData[]
}

export interface BookingContentResult {
  tina: {
    query: string
    variables: { relativePath: string }
    data: any
  } | null
  content: BookingContent
}

export const defaultSteps: FormStepBlock[] = [
  {
    title: "Service",
    description: "What kind of clean do you need?",
    fields: [{ _template: "servicesSelector", question: "What kind of clean do you need?" }],
  },
  {
    title: "Home",
    description: "Tell us about your home size",
    fields: [
      { _template: "numberInput", name: "bedrooms", label: "Bedrooms", min: 1, max: 10 },
      { _template: "numberInput", name: "bathrooms", label: "Bathrooms", min: 1, max: 10 },
    ],
  },
  {
    title: "Extras",
    description: "Select any add-on services",
    fields: [{ _template: "addonsSelector", question: "Would you like any extras?" }],
  },
  {
    title: "Photos",
    description: "Upload home photos for accuracy",
    fields: [{ _template: "photoUpload", label: "Add 3–5 photos for a more accurate quote", hint: "Optional. JPG, PNG, WEBP, or HEIC - 5 MB each" }],
  },
  {
    title: "Schedule",
    description: "Pick your preferred date & window",
    fields: [
      { _template: "dateInput", name: "preferredDate", label: "Preferred Date" },
      {
        _template: "choiceInput",
        name: "preferredWindow",
        label: "Arrival Window",
        options: [
          { id: "flexible", label: "Flexible" },
          { id: "morning", label: "Morning (8am - 12pm)" },
          { id: "afternoon", label: "Afternoon (12pm - 4pm)" },
        ],
      },
    ],
  },
  {
    title: "Contact",
    description: "Where should we send your quote?",
    fields: [
      { _template: "textInput", name: "name", label: "Your Full Name", required: true },
      { _template: "textInput", name: "email", label: "Email Address", required: true, validationType: "email" },
      { _template: "textInput", name: "phone", label: "Phone Number", required: true, validationType: "phone" },
    ],
  },
  {
    title: "Review",
    description: "Review your estimate details",
    fields: [{ _template: "estimateSummary", disclaimer: "Final pricing is confirmed after Breeze reviews your home details." }],
  },
]

const typenameToTemplate: Record<string, string> = {
  BookingStepsFieldsTextInput: "textInput",
  BookingStepsFieldsNumberInput: "numberInput",
  BookingStepsFieldsChoiceInput: "choiceInput",
  BookingStepsFieldsDateInput: "dateInput",
  BookingStepsFieldsPhotoUpload: "photoUpload",
  BookingStepsFieldsRichTextHeading: "richTextHeading",
  BookingStepsFieldsServicesSelector: "servicesSelector",
  BookingStepsFieldsAddonsSelector: "addonsSelector",
  BookingStepsFieldsEstimateSummary: "estimateSummary",
  BookingStepsFieldsImageBlock: "imageBlock",
  BookingStepsFieldsInfoCard: "infoCard",
  BookingStepsFieldsInfoBanner: "infoBanner",
  BookingStepsFieldsTextareaInput: "textareaInput",
  BookingStepsFieldsSelectInput: "selectInput",
  BookingStepsFieldsCheckboxGroup: "checkboxGroup",
}

function normalizeSteps(rawSteps: any[]): FormStepBlock[] {
  if (!rawSteps?.length) return rawSteps ?? defaultSteps
  return rawSteps.map((step: any) => ({
    ...step,
    fields: step.fields?.map((f: any) => {
      const template = typenameToTemplate[f?.__typename] ?? f?._template
      if (!template) return f
      return { _template: template, ...f }
    }),
  }))
}

/** Default content used as fallback */
export const bookingContent: BookingContent = {
  ...(defaultData as any),
  steps: (defaultData as any).steps?.length ? (defaultData as any).steps : defaultSteps,
  services: (defaultData as any).services || [],
  addOns: (defaultData as any).addOns || [],
}

/**
 * Fetch booking content from the Tina GraphQL API at runtime.
 * Falls back to the bundled JSON if the Tina API is unreachable.
 */
export async function fetchBookingContent(): Promise<BookingContentResult> {
  try {
    const { client } = await import("@/tina/__generated__/client")
    const res = await (client.queries as any).booking({ relativePath: "booking.json" })
    const data = (res.data as any)?.booking
    if (!data) throw new Error("No booking data from Tina API")
    return {
      tina: {
        query: res.query,
        variables: { relativePath: "booking.json" },
        data: res.data,
      },
      content: normalizeBookingData(data),
    }
  } catch {
    return {
      tina: null,
      content: bookingContent,
    }
  }
}

export function normalizeBookingData(raw: any): BookingContent {
  return {
    theme: {
      fontFamily: raw.theme?.fontFamily ?? bookingContent.theme?.fontFamily ?? "sans-serif",
      primaryColor: raw.theme?.primaryColor ?? bookingContent.theme?.primaryColor,
      backgroundColor: raw.theme?.backgroundColor ?? bookingContent.theme?.backgroundColor,
      textColor: raw.theme?.textColor ?? bookingContent.theme?.textColor,
      borderRadius: raw.theme?.borderRadius ?? bookingContent.theme?.borderRadius,
    },
    steps: raw.steps?.length ? normalizeSteps(raw.steps) : defaultSteps,
    header: {
      badge: raw.header?.badge ?? bookingContent.header.badge,
      title: raw.header?.title ?? bookingContent.header.title,
      description: raw.header?.description ?? bookingContent.header.description,
    },
    stepNames: raw.stepNames?.length ? raw.stepNames : bookingContent.stepNames,

    timeWindows: raw.timeWindows?.length ? raw.timeWindows : bookingContent.timeWindows,
    reviewLabels: {
      heading: raw.reviewLabels?.heading ?? bookingContent.reviewLabels.heading,
      rowHome: raw.reviewLabels?.rowHome ?? bookingContent.reviewLabels.rowHome,
      rowDate: raw.reviewLabels?.rowDate ?? bookingContent.reviewLabels.rowDate,
      rowWindow: raw.reviewLabels?.rowWindow ?? bookingContent.reviewLabels.rowWindow,
      rowPhotos: raw.reviewLabels?.rowPhotos ?? bookingContent.reviewLabels.rowPhotos,
      disclaimer: raw.reviewLabels?.disclaimer ?? bookingContent.reviewLabels.disclaimer,
    },
    navigation: {
      back: raw.navigation?.back ?? bookingContent.navigation.back,
      continue: raw.navigation?.continue ?? bookingContent.navigation.continue,
      submit: raw.navigation?.submit ?? bookingContent.navigation.submit,
    },
    success: {
      title: raw.success?.title ?? bookingContent.success.title,
      message: raw.success?.message ?? bookingContent.success.message,
      buttonText: raw.success?.buttonText ?? bookingContent.success.buttonText,
    },
    estimate: {
      label: raw.estimate?.label ?? bookingContent.estimate.label,
      customQuote: raw.estimate?.customQuote ?? bookingContent.estimate.customQuote,
      disclaimer: raw.estimate?.disclaimer ?? bookingContent.estimate.disclaimer,
    },
    services: raw.services?.length ? raw.services : bookingContent.services || [],
    addOns: raw.addOns?.length ? raw.addOns : bookingContent.addOns || [],
  }
}
export function t(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}
