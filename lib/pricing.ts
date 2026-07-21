import sitePricing from "@/content/pricing/pricing.json"

type PricingData = {
  deep: {
    name: string
    description: string
    subtitle: string
    features: string[]
    prices: { key: string; bedrooms: string; bathrooms: string; cents: number }[]
  }
  regular: {
    name: string
    description: string
    subtitle: string
    features: string[]
    prices: { key: string; bedrooms: string; bathrooms: string; cents: number }[]
  }
  addOns: { id: string; name: string; cents: number }[]
}

const data = sitePricing as PricingData

export type ServiceType = keyof typeof data
export type ServiceTypeEnum = "deep" | "regular"
export type AddOn = "garage" | "oven" | "fridge"

export const serviceDetails = {
  deep: data.deep,
  regular: data.regular,
}

export const addOnDetails = data.addOns.reduce(
  (acc, addon) => {
    acc[addon.id as AddOn] = { name: addon.name, price: addon.cents }
    return acc
  },
  {} as Record<AddOn, { name: string; price: number }>,
)

export function calculateEstimate(
  service: ServiceTypeEnum,
  bedrooms: number,
  bathrooms: number,
  addOns: AddOn[],
): number | null {
  const svc = data[service]
  if (!svc) return null
  const key = `${bedrooms}-${bathrooms}`
  const priceEntry = svc.prices.find((p) => p.key === key)
  if (!priceEntry) return null
  const base = priceEntry.cents
  const addOnTotal = addOns.reduce((sum, id) => {
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
