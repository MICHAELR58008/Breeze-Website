import { calculateEstimate } from "./pricing"

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

export function runPricingTests() {
  console.log("Running pricing calculation tests...")

  // Test 1: Deep cleaning 1 bed 1 bath no add-ons
  // 13000 (base) + 1*3000 (bed) + 1*3000 (bath) = 19000 cents ($190)
  const deep11 = calculateEstimate("deep", 1, 1, [])
  assert(deep11 === 19000, `Expected 19000 for deep 1b/1b, got ${deep11}`)

  // Test 2: Deep cleaning 2 bed 3 bath with garage add-on (4500 cents)
  // 13000 + 2*3000 + 3*3000 + 4500 = 13000 + 6000 + 9000 + 4500 = 32500
  const deep23 = calculateEstimate("deep", 2, 3, ["garage"])
  assert(deep23 === 32500, `Expected 32500 for deep 2b/3b + garage, got ${deep23}`)

  // Test 3: Regular cleaning 1 bed 1 bath no add-ons
  // 11000 (base) + 1*3000 (bed) + 1*3000 (bath) = 17000 cents ($170)
  const reg11 = calculateEstimate("regular", 1, 1, [])
  assert(reg11 === 17000, `Expected 17000 for regular 1b/1b, got ${reg11}`)

  // Test 4: Commercial cleaning (basePriceCents = 0) -> should return null
  const commercial = calculateEstimate("Commercial ", 1, 1, [])
  assert(commercial === null, `Expected null for Commercial clean, got ${commercial}`)

  // Test 5: Unknown service ID -> should return null
  const unknown = calculateEstimate("nonexistent_service", 1, 1, [])
  assert(unknown === null, `Expected null for unknown service, got ${unknown}`)

  console.log("All pricing calculation tests passed successfully!")
}

runPricingTests()
