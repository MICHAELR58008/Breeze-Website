import siteBooking from "@/content/booking/booking.json"

export type PriceEntry = {
  key: string
  bedrooms: string
  bathrooms: string
  cents: number
}

export type ServiceItemData = {
  _template?: string
  id: string
  name: string
  description?: string
  subtitle?: string
  features?: string[]
  basePriceCents?: number
  pricePerBedroomCents?: number
  pricePerBathroomCents?: number
}

export type AddOnData = {
  id: string
  name: string
  cents: number
}

export type PricingData = {
  services: ServiceItemData[]
  addOns: AddOnData[]
}

const data = (siteBooking as unknown) as PricingData

export type AddOn = string
export type ServiceType = string

/** All valid service type IDs (dynamically derived from pricing data) */
export const validServiceTypes = data.services.map((s) => s.id) as [string, ...string[]]

/** All valid add-on IDs (dynamically derived from pricing data) */
export const validAddOnIds = data.addOns.map((a) => a.id) as [string, ...string[]]

/** Find a service by its unique id */
export function findService(id: string): ServiceItemData | undefined {
  return data.services.find((s) => s.id === id)
}

/** All services as a flat array */
export const servicesList = data.services

/** All add-ons as a flat array */
export const addOnsList = data.addOns

/** For backward compatibility — lookup by id */
export const serviceDetails = data.services.reduce(
  (acc, svc) => {
    acc[svc.id] = svc
    return acc
  },
  {} as Record<string, ServiceItemData>,
)

export const addOnDetails = data.addOns.reduce(
  (acc, addon) => {
    acc[addon.id] = { name: addon.name, price: addon.cents }
    return acc
  },
  {} as Record<string, { name: string; price: number }>,
)

export function calculateEstimate(
  serviceId: string,
  bedrooms: number,
  bathrooms: number,
  selectedAddOns: string[],
  customServices?: ServiceItemData[],
  customAddOns?: AddOnData[],
): number | null {
  const activeServices = customServices || data.services || []
  const activeAddOns = customAddOns || data.addOns || []
  const svc = activeServices.find((s) => s.id === serviceId)
  if (!svc) return null
  if (!svc.basePriceCents || svc.basePriceCents === 0) return null

  const base = svc.basePriceCents
  const bedCost = (bedrooms || 0) * (svc.pricePerBedroomCents || 0)
  const bathCost = (bathrooms || 0) * (svc.pricePerBathroomCents || 0)

  const addOnsTotal = (selectedAddOns || []).reduce((sum, id) => {
    const addon = activeAddOns.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)

  return base + bedCost + bathCost + addOnsTotal
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
