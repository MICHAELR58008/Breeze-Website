import sitePricing from "@/content/pricing/pricing.json"

type PriceEntry = {
  key: string
  bedrooms: string
  bathrooms: string
  cents: number
}

type ServiceItemData = {
  _template: string
  id: string
  name: string
  description: string
  subtitle: string
  features: string[]
  prices: PriceEntry[]
}

type AddOnData = {
  id: string
  name: string
  cents: number
}

type PricingData = {
  services: ServiceItemData[]
  addOns: AddOnData[]
}

const data = sitePricing as PricingData

export type AddOn = string

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
): number | null {
  const svc = findService(serviceId)
  if (!svc) return null
  const key = `${bedrooms}-${bathrooms}`
  const priceEntry = svc.prices.find((p: PriceEntry) => p.key === key)
  if (!priceEntry) return null
  const base = priceEntry.cents
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = data.addOns.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)
  return base + addOnTotal
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
