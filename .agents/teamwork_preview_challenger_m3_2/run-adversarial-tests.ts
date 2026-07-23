import { calculateEstimate, formatPrice, validServiceTypes, validAddOnIds, serviceDetails, addOnDetails } from "../../lib/pricing"

interface TestResult {
  category: string
  name: string
  input: any
  expected: any
  actual: any
  passed: boolean
  notes?: string
}

const results: TestResult[] = []

function test(category: string, name: string, input: any, expected: any, fn: () => any, notes?: string) {
  let actual: any
  let passed = false
  try {
    actual = fn()
    if (expected === "NaN") {
      passed = Number.isNaN(actual)
    } else if (expected === null) {
      passed = actual === null
    } else {
      passed = actual === expected
    }
  } catch (err: any) {
    actual = `EXCEPTION: ${err.message}`
    passed = expected === "EXCEPTION"
  }
  results.push({ category, name, input, expected, actual, passed, notes })
}

console.log("=================================================");
console.log("   ADVERSARIAL STRESS TEST: PRICING ENGINE       ");
console.log("=================================================\n");

// ---------------------------------------------------------
// Category 1: Standard & Exact Expected Dollar Value Tests
// ---------------------------------------------------------

// Deep Cleaning: Base $130 (13000), Bed $20 (2000), Bath $30 (3000)
test(
  "Exact Dollar Values",
  "Deep 1b/1b no add-ons ($180)",
  { serviceId: "deep", bed: 1, bath: 1, addOns: [] },
  18000,
  () => calculateEstimate("deep", 1, 1, [])
)

test(
  "Exact Dollar Values",
  "Deep 2b/3b + Garage ($305)",
  { serviceId: "deep", bed: 2, bath: 3, addOns: ["garage"] },
  30500,
  () => calculateEstimate("deep", 2, 3, ["garage"])
)

test(
  "Exact Dollar Values",
  "Deep 10b/10b + All Add-ons ($735)",
  { serviceId: "deep", bed: 10, bath: 10, addOns: ["garage", "oven", "fridge"] },
  73500, // 13000 + 20000 + 30000 + 4500 + 3000 + 3000 = 73500 ($735)
  () => calculateEstimate("deep", 10, 10, ["garage", "oven", "fridge"])
)

// Regular Cleaning: Base $110 (11000), Bed $10 (1000), Bath $15 (1500)
test(
  "Exact Dollar Values",
  "Regular 1b/1b no add-ons ($135)",
  { serviceId: "regular", bed: 1, bath: 1, addOns: [] },
  13500,
  () => calculateEstimate("regular", 1, 1, [])
)

test(
  "Exact Dollar Values",
  "Regular 10b/10b + All Add-ons ($465)",
  { serviceId: "regular", bed: 10, bath: 10, addOns: ["garage", "oven", "fridge"] },
  46500, // 11000 + 10000 + 15000 + 10500 = 46500 ($465)
  () => calculateEstimate("regular", 10, 10, ["garage", "oven", "fridge"])
)

// ---------------------------------------------------------
// Category 2: Custom Quotes (Must Return null)
// ---------------------------------------------------------

test(
  "Custom Quotes",
  "Commercial Clean (basePriceCents = 0) returns null",
  { serviceId: "Commercial ", bed: 1, bath: 1, addOns: [] },
  null,
  () => calculateEstimate("Commercial ", 1, 1, [])
)

test(
  "Custom Quotes",
  "Commercial Clean with 10b/10b + add-ons returns null",
  { serviceId: "Commercial ", bed: 10, bath: 10, addOns: ["garage", "oven"] },
  null,
  () => calculateEstimate("Commercial ", 10, 10, ["garage", "oven"])
)

test(
  "Custom Quotes",
  "Non-existent service ID returns null",
  { serviceId: "unknown_service", bed: 1, bath: 1, addOns: [] },
  null,
  () => calculateEstimate("unknown_service", 1, 1, [])
)

test(
  "Custom Quotes",
  "Empty string service ID returns null",
  { serviceId: "", bed: 1, bath: 1, addOns: [] },
  null,
  () => calculateEstimate("", 1, 1, [])
)

test(
  "Custom Quotes",
  "Custom service with basePriceCents = 0 returns null",
  { serviceId: "custom_zero", bed: 1, bath: 1, addOns: [] },
  null,
  () => calculateEstimate("custom_zero", 1, 1, [], [{ id: "custom_zero", name: "Free", basePriceCents: 0 }])
)

test(
  "Custom Quotes",
  "Custom service with missing basePriceCents returns null",
  { serviceId: "custom_none", bed: 1, bath: 1, addOns: [] },
  null,
  () => calculateEstimate("custom_none", 1, 1, [], [{ id: "custom_none", name: "No Base" }])
)

// ---------------------------------------------------------
// Category 3: Room Count Boundaries & Extremes
// ---------------------------------------------------------

test(
  "Boundary & Extreme",
  "0 bed 0 bath (Deep clean base $130)",
  { serviceId: "deep", bed: 0, bath: 0, addOns: [] },
  13000,
  () => calculateEstimate("deep", 0, 0, []),
  "0 || 0 evaluates to 0 in function"
)

test(
  "Boundary & Extreme",
  "10 bed 10 bath (Deep clean $630)",
  { serviceId: "deep", bed: 10, bath: 10, addOns: [] },
  63000,
  () => calculateEstimate("deep", 10, 10, [])
)

test(
  "Boundary & Extreme",
  "100 bed 100 bath (Deep clean $5130)",
  { serviceId: "deep", bed: 100, bath: 100, addOns: [] },
  513000,
  () => calculateEstimate("deep", 100, 100, [])
)

test(
  "Boundary & Extreme",
  "1000 bed 1000 bath (Deep clean $50130)",
  { serviceId: "deep", bed: 1000, bath: 1000, addOns: [] },
  5013000,
  () => calculateEstimate("deep", 1000, 1000, [])
)

test(
  "Boundary & Extreme",
  "Float rooms: 2.5 bed 1.5 bath",
  { serviceId: "deep", bed: 2.5, bath: 1.5, addOns: [] },
  22500, // 13000 + 5000 + 4500 = 22500
  () => calculateEstimate("deep", 2.5, 1.5, [])
)

test(
  "Boundary & Extreme",
  "Negative rooms: -1 bed -1 bath",
  { serviceId: "deep", bed: -1, bath: -1, addOns: [] },
  8000, // 13000 + (-1*2000) + (-1*3000) = 8000
  () => calculateEstimate("deep", -1, -1, []),
  "Vulnerability: negative bed/bath reduces total price because (-1 || 0) is -1"
)

test(
  "Boundary & Extreme",
  "Extreme negative rooms: -10 bed -10 bath",
  { serviceId: "deep", bed: -10, bath: -10, addOns: [] },
  -37000, // 13000 - 20000 - 30000 = -37000 ($ -370)
  () => calculateEstimate("deep", -10, -10, []),
  "Vulnerability: results in negative overall price estimate"
)

// ---------------------------------------------------------
// Category 4: Robustness against NaN, undefined, null & bad types
// ---------------------------------------------------------

test(
  "NaN / Undefined / Null",
  "NaN bedrooms: calculateEstimate('deep', NaN, 1, [])",
  { serviceId: "deep", bed: NaN, bath: 1, addOns: [] },
  16000, // (NaN || 0) -> 0. base 13000 + bath 3000 = 16000
  () => calculateEstimate("deep", NaN, 1, []),
  "(NaN || 0) resolves to 0"
)

test(
  "NaN / Undefined / Null",
  "NaN bathrooms: calculateEstimate('deep', 1, NaN, [])",
  { serviceId: "deep", bed: 1, bath: NaN, addOns: [] },
  15000, // base 13000 + bed 2000 = 15000
  () => calculateEstimate("deep", 1, NaN, [])
)

test(
  "NaN / Undefined / Null",
  "Both NaN: calculateEstimate('deep', NaN, NaN, [])",
  { serviceId: "deep", bed: NaN, bath: NaN, addOns: [] },
  13000,
  () => calculateEstimate("deep", NaN, NaN, [])
)

test(
  "NaN / Undefined / Null",
  "Undefined bedrooms & bathrooms",
  { serviceId: "deep", bed: undefined, bath: undefined, addOns: [] },
  13000,
  () => calculateEstimate("deep", undefined as any, undefined as any, [])
)

test(
  "NaN / Undefined / Null",
  "Null bedrooms & bathrooms",
  { serviceId: "deep", bed: null, bath: null, addOns: [] },
  13000,
  () => calculateEstimate("deep", null as any, null as any, [])
)

test(
  "NaN / Undefined / Null",
  "String number inputs ('5', '3')",
  { serviceId: "deep", bed: "5", bath: "3", addOns: [] },
  32000, // 13000 + 5*2000 + 3*3000 = 32000
  () => calculateEstimate("deep", "5" as any, "3" as any, [])
)

test(
  "NaN / Undefined / Null",
  "Non-numeric string bedrooms ('abc')",
  { serviceId: "deep", bed: "abc", bath: 1, addOns: [] },
  "NaN",
  () => calculateEstimate("deep", "abc" as any, 1, []),
  "Vulnerability: 'abc' || 0 is 'abc', 'abc' * 2000 is NaN -> returns NaN instead of handling"
)

test(
  "NaN / Undefined / Null",
  "Undefined selectedAddOns array",
  { serviceId: "deep", bed: 1, bath: 1, addOns: undefined },
  18000,
  () => calculateEstimate("deep", 1, 1, undefined as any)
)

test(
  "NaN / Undefined / Null",
  "Null selectedAddOns array",
  { serviceId: "deep", bed: 1, bath: 1, addOns: null },
  18000,
  () => calculateEstimate("deep", 1, 1, null as any)
)

test(
  "NaN / Undefined / Null",
  "Invalid add-on ID in array",
  { serviceId: "deep", bed: 1, bath: 1, addOns: ["bogus_addon", "garage"] },
  22500, // 18000 + 4500 = 22500
  () => calculateEstimate("deep", 1, 1, ["bogus_addon", "garage"])
)

// ---------------------------------------------------------
// Category 5: FormatPrice Helper Stress Tests
// ---------------------------------------------------------

test(
  "FormatPrice Utility",
  "formatPrice(18000) -> '$180'",
  18000,
  "$180",
  () => formatPrice(18000)
)

test(
  "FormatPrice Utility",
  "formatPrice(0) -> '$0'",
  0,
  "$0",
  () => formatPrice(0)
)

test(
  "FormatPrice Utility",
  "formatPrice(30500) -> '$305'",
  30500,
  "$305",
  () => formatPrice(30500)
)

test(
  "FormatPrice Utility",
  "formatPrice(NaN) -> '$NaN'",
  NaN,
  "$NaN",
  () => formatPrice(NaN)
)

test(
  "FormatPrice Utility",
  "formatPrice(-5000) -> '-$50'",
  -5000,
  "-$50",
  () => formatPrice(-5000)
)

// Print Results Summary
console.log(JSON.stringify(results, null, 2));

const failed = results.filter((r) => !r.passed)
console.log(`\nTotal Tests: ${results.length}`);
console.log(`Passed: ${results.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
