import { calculateEstimate, formatPrice, servicesList, addOnsList } from "../../lib/pricing"
import { z } from "zod"

// ---------------------------------------------------------------------------
// 1. Stress Test calculateEstimate Pricing Engine
// ---------------------------------------------------------------------------
console.log("=== 1. STRESS TESTING PRICING ENGINE (calculateEstimate) ===")

let passedTests = 0
let totalTests = 0

function assertEqual(actual: any, expected: any, testName: string) {
  totalTests++
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`[PASS] ${testName}`)
    passedTests++
  } else {
    console.error(`[FAIL] ${testName}`)
    console.error(`       Expected: ${JSON.stringify(expected)}`)
    console.error(`       Actual:   ${JSON.stringify(actual)}`)
  }
}

// Standard service prices in booking.json:
// Deep clean: 1-1 = 18000 ($180), 2-2 = 22000 ($220), 3-3 = 29000 ($290)
// Regular clean: 1-1 = 13500 ($135), 2-2 = 15000 ($150), 3-3 = 18000 ($180)
// Commercial: no prices defined (Custom Quote -> null)
// Addons: garage = 4500 ($45), oven = 3000 ($30), fridge = 3000 ($30)

// Test 1.1: Standard Deep Cleaning estimates
assertEqual(calculateEstimate("deep", 1, 1, []), 18000, "Deep 1 bed / 1 bath, no add-ons = 18000 cents")
assertEqual(calculateEstimate("deep", 2, 2, ["oven"]), 25000, "Deep 2 bed / 2 bath + oven = 22000 + 3000 = 25000 cents")
assertEqual(calculateEstimate("deep", 3, 3, ["oven", "fridge", "garage"]), 39500, "Deep 3 bed / 3 bath + all add-ons = 29000 + 3000 + 3000 + 4500 = 39500 cents")

// Test 1.2: Standard Regular Cleaning estimates
assertEqual(calculateEstimate("regular", 1, 1, []), 13500, "Regular 1 bed / 1 bath, no add-ons = 13500 cents")
assertEqual(calculateEstimate("regular", 2, 2, ["fridge"]), 18000, "Regular 2 bed / 2 bath + fridge = 15000 + 3000 = 18000 cents")
assertEqual(calculateEstimate("regular", 3, 3, []), 18000, "Regular 3 bed / 3 bath, no add-ons = 18000 cents")

// Test 1.3: Commercial Cleaning (no prices array in JSON)
assertEqual(calculateEstimate("Commercial ", 1, 1, []), null, "Commercial clean (no price grid) returns null (Custom Quote)")

// Test 1.4: Unmatched bed/bath combinations
assertEqual(calculateEstimate("deep", 1, 2, []), null, "Unmatched bed/bath (1 bed / 2 bath) returns null (Custom Quote)")
assertEqual(calculateEstimate("deep", 4, 4, []), null, "Unmatched bed/bath (4 bed / 4 bath) returns null (Custom Quote)")
assertEqual(calculateEstimate("regular", 0, 0, []), null, "Invalid bed/bath (0 bed / 0 bath) returns null")
assertEqual(calculateEstimate("deep", -1, 1, []), null, "Negative bedrooms returns null")

// Test 1.5: Invalid / Unknown service ID
assertEqual(calculateEstimate("unknown_service", 1, 1, []), null, "Unknown service ID returns null")
assertEqual(calculateEstimate("", 1, 1, []), null, "Empty service ID returns null")

// Test 1.6: Add-on edge cases
assertEqual(calculateEstimate("deep", 1, 1, ["non_existent_addon"]), 18000, "Non-existent add-on ignored (adds 0 cents)")
assertEqual(calculateEstimate("deep", 1, 1, ["oven", "oven"]), 24000, "Duplicate add-on IDs summed (18000 + 3000 + 3000 = 24000)")

// Test 1.7: Price Formatter
assertEqual(formatPrice(18000), "$180", "formatPrice(18000) returns $180")
assertEqual(formatPrice(13500), "$135", "formatPrice(13500) returns $135")
assertEqual(formatPrice(0), "$0", "formatPrice(0) returns $0")

// ---------------------------------------------------------------------------
// 2. Stress Test Bed/Bath Step Conditional & UI Step Filtering Logic
// ---------------------------------------------------------------------------
console.log("\n=== 2. STRESS TESTING BED/BATH STEP CONDITIONAL LOGIC ===")

interface FormStepBlock {
  title: string
  disabled?: boolean
  showIfField?: string
  showIfOperator?: string
  showIfValue?: string
}

const mockSteps: FormStepBlock[] = [
  { title: "Service" },
  {
    title: "Home",
    showIfField: "serviceType",
    showIfOperator: "not_equals",
    showIfValue: "Commercial ",
  },
  { title: "Extras", disabled: true },
  { title: "Photos" },
  { title: "Schedule" },
  { title: "Contact" },
  { title: "Review" },
]

function filterSteps(rawSteps: FormStepBlock[], formData: Record<string, any>) {
  return rawSteps.filter((step) => {
    if (step.disabled) return false
    if (!step.showIfField) return true
    const val = formData[step.showIfField]
    if (step.showIfOperator === "equals") return String(val) === String(step.showIfValue)
    if (step.showIfOperator === "not_equals") return String(val) !== String(step.showIfValue)
    if (step.showIfOperator === "contains") return String(val).includes(String(step.showIfValue))
    return true
  })
}

// Test 2.1: Default service (deep) -> Home step SHOULD be shown
const deepFiltered = filterSteps(mockSteps, { serviceType: "deep" })
assertEqual(
  deepFiltered.map((s) => s.title),
  ["Service", "Home", "Photos", "Schedule", "Contact", "Review"],
  "ServiceType 'deep' includes Home step and excludes disabled Extras step",
)

// Test 2.2: Commercial service -> Home step SHOULD be hidden
const commercialFiltered = filterSteps(mockSteps, { serviceType: "Commercial " })
assertEqual(
  commercialFiltered.map((s) => s.title),
  ["Service", "Photos", "Schedule", "Contact", "Review"],
  "ServiceType 'Commercial ' hides Home step because showIfOperator is not_equals 'Commercial '",
)

// Test 2.3: Additional operators (equals, contains)
const testOperatorSteps: FormStepBlock[] = [
  { title: "EqualsTest", showIfField: "freq", showIfOperator: "equals", showIfValue: "weekly" },
  { title: "ContainsTest", showIfField: "notes", showIfOperator: "contains", showIfValue: "pet" },
]

assertEqual(
  filterSteps(testOperatorSteps, { freq: "weekly", notes: "I have a pet dog" }).map((s) => s.title),
  ["EqualsTest", "ContainsTest"],
  "showIfOperator 'equals' and 'contains' work as expected",
)

assertEqual(
  filterSteps(testOperatorSteps, { freq: "biweekly", notes: "No animals" }).map((s) => s.title),
  [],
  "showIfOperator 'equals' and 'contains' filter out steps when condition fails",
)

// ---------------------------------------------------------------------------
// 3. Stress Test app/api/bookings/route.ts Parsing & Zod Schema Validation
// ---------------------------------------------------------------------------
console.log("\n=== 3. STRESS TESTING API ROUTE PARSING & ZOD SCHEMA ===")

const requestSchema = z
  .object({
    serviceType: z.string().catch("deep"),
    bedrooms: z.coerce.number().int().min(1).max(10).catch(1),
    bathrooms: z.coerce.number().int().min(1).max(10).catch(1),
    addOns: z.array(z.string()).catch([]),
    preferredDate: z.string().catch(new Date().toISOString().split("T")[0]),
    preferredWindow: z.string().catch("flexible"),
    name: z.string().trim().catch("Guest Customer"),
    email: z.string().trim().catch("customer@example.com"),
    phone: z.string().trim().catch("0000000000"),
    website: z.string().max(0).catch(""),
    startedAt: z.coerce.number().catch(Date.now()),
    customFields: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .passthrough()

// Helper to simulate route.ts customFields parsing
function parseFormDataEntries(entries: Array<[string, string]>) {
  const coreKeys = new Set([
    "serviceType",
    "bedrooms",
    "bathrooms",
    "addOns",
    "preferredDate",
    "preferredWindow",
    "name",
    "email",
    "phone",
    "website",
    "startedAt",
    "photos",
  ])

  const customFields: Record<string, any> = {}
  for (const [key, value] of entries) {
    if (coreKeys.has(key)) continue
    let parsedVal: any = value
    if (typeof value === "string" && (value.startsWith("[") || value.startsWith("{"))) {
      try {
        parsedVal = JSON.parse(value)
      } catch {
        parsedVal = value
      }
    }
    customFields[key] = parsedVal
  }

  return customFields
}

// Test 3.1: Textarea string parsing into customFields
const textareaEntries: Array<[string, string]> = [
  ["specialInstructions", "Please focus on the kitchen and master bathroom.\nKey is in lockbox."],
  ["accessNotes", "Gate code #4921."],
]
const customTextarea = parseFormDataEntries(textareaEntries)
assertEqual(
  customTextarea.specialInstructions,
  "Please focus on the kitchen and master bathroom.\nKey is in lockbox.",
  "Textarea string with newlines parsed intact into customFields",
)

// Test 3.2: Select input string parsing into customFields
const selectEntries: Array<[string, string]> = [
  ["frequency", "biweekly"],
  ["propertyType", "townhouse"],
  ["parkingOption", "street_parking"],
]
const customSelect = parseFormDataEntries(selectEntries)
assertEqual(
  customSelect,
  { frequency: "biweekly", propertyType: "townhouse", parkingOption: "street_parking" },
  "Select option strings parsed into customFields",
)

// Test 3.3: Checkbox array (JSON stringified) parsing into customFields
const checkboxEntries: Array<[string, string]> = [
  ["selectedExtras", JSON.stringify(["balcony", "laundry_fold", "eco_cleaning"])],
  ["petsPresent", JSON.stringify(["dog", "cat"])],
]
const customCheckbox = parseFormDataEntries(checkboxEntries)
assertEqual(
  customCheckbox.selectedExtras,
  ["balcony", "laundry_fold", "eco_cleaning"],
  "JSON-encoded checkbox array parsed into native JS array in customFields",
)
assertEqual(customCheckbox.petsPresent, ["dog", "cat"], "Checkbox array for pets parsed correctly")

// Test 3.4: Nested JSON object in customFields
const objectEntries: Array<[string, string]> = [
  ["billingAddress", JSON.stringify({ street: "123 Main St", city: "Seattle", zip: "98101" })],
]
const customObject = parseFormDataEntries(objectEntries)
assertEqual(
  customObject.billingAddress,
  { street: "123 Main St", city: "Seattle", zip: "98101" },
  "JSON-encoded object parsed into native object in customFields",
)

// Test 3.5: Zod Schema safeParse with dynamic form customFields
const zodPayload = {
  serviceType: "deep",
  bedrooms: 2,
  bathrooms: 2,
  addOns: ["oven", "fridge"],
  preferredDate: "2026-08-01",
  preferredWindow: "morning",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-123-4567",
  website: "",
  startedAt: Date.now(),
  customFields: {
    specialInstructions: "Clean thoroughly",
    frequency: "monthly",
    extrasList: ["windows", "blinds"],
    metadata: { ref: "campaign_123" },
  },
}

const parsedResult = requestSchema.safeParse(zodPayload)
assertEqual(parsedResult.success, true, "Zod schema parses payload with diverse customFields without errors")
if (parsedResult.success) {
  assertEqual(
    parsedResult.data.customFields,
    zodPayload.customFields,
    "Zod payload customFields preserved exactly",
  )
}

// Test 3.6: Zod Fallbacks (.catch()) on Invalid Payload
const invalidPayload = {
  serviceType: 12345, // invalid type -> fallback to "deep"
  bedrooms: "99", // >10 -> min/max validation fails -> fallback to 1
  bathrooms: -5, // <1 -> fallback to 1
  addOns: "not-an-array", // invalid -> fallback to []
  name: null, // invalid -> fallback to "Guest Customer"
  email: undefined,
  phone: 9999999999, // fallback to "0000000000"
  website: "http://spam-bot.com", // website max(0) fails -> fallback to ""
  customFields: {
    anythingGoes: [1, 2, true, null, { nested: "val" }],
  },
}

const fallbackParsed = requestSchema.safeParse(invalidPayload)
assertEqual(fallbackParsed.success, true, "Zod safeParse returns success: true due to .catch() handlers on invalid fields")
if (fallbackParsed.success) {
  assertEqual(fallbackParsed.data.bedrooms, 1, "bedrooms caught and defaulted to 1")
  assertEqual(fallbackParsed.data.bathrooms, 1, "bathrooms caught and defaulted to 1")
  assertEqual(fallbackParsed.data.addOns, [], "addOns caught and defaulted to []")
  assertEqual(fallbackParsed.data.name, "Guest Customer", "name caught and defaulted to Guest Customer")
  assertEqual(fallbackParsed.data.website, "", "website honeypot caught and defaulted to empty string")
}

console.log(`\n=== STRESS TEST RESULTS SUMMARY: ${passedTests} / ${totalTests} PASSED ===`)
