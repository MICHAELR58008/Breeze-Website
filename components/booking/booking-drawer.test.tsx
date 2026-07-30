import { describe, it, expect } from "vitest"
import { calculateEstimate } from "@/lib/pricing"
import { initialState } from "./booking-drawer"

describe("Booking Drawer — blank bed/bath fields", () => {
  it("initialState has empty bedrooms and bathrooms", () => {
    expect(initialState.bedrooms).toBe("")
    expect(initialState.bathrooms).toBe("")
  })

  it("regular clean defaults to 1 bed + 1 bath when fields are blank", () => {
    const bedrooms = initialState.bedrooms || 1
    const bathrooms = initialState.bathrooms || 1
    const result = calculateEstimate("regular", bedrooms, bathrooms, [])
    // 11000 (base) + 3000 (bed) + 3000 (bath) = 17000
    expect(result).toBe(17000)
  })

  it("estimate recalculates when user provides explicit bed/bath counts", () => {
    const result = calculateEstimate("regular", 2, 3, [])
    // 11000 + 6000 + 9000 = 26000
    expect(result).toBe(26000)
  })

  it("deep clean defaults to 1 bed + 1 bath when fields are blank", () => {
    const bedrooms = initialState.bedrooms || 1
    const bathrooms = initialState.bathrooms || 1
    const result = calculateEstimate("deep", bedrooms, bathrooms, [])
    // 13000 (base) + 4000 (bed) + 4000 (bath) = 21000
    expect(result).toBe(21000)
  })

  it("commercial returns null regardless of default bed/bath values", () => {
    const bedrooms = initialState.bedrooms || 1
    const bathrooms = initialState.bathrooms || 1
    const result = calculateEstimate("Commercial ", bedrooms, bathrooms, [])
    expect(result).toBeNull()
  })
})
