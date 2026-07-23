const fs = require('fs');
const path = require('path');

// Load booking.json
const bookingPath = path.resolve(__dirname, '../../content/booking/booking.json');
const bookingData = JSON.parse(fs.readFileSync(bookingPath, 'utf8'));

// calculateEstimate function mirrored directly from lib/pricing.ts
function calculateEstimate(
  serviceId,
  bedrooms,
  bathrooms,
  selectedAddOns,
  customServices,
  customAddOns
) {
  const activeServices = customServices || bookingData.services || [];
  const activeAddOns = customAddOns || bookingData.addOns || [];
  const svc = activeServices.find((s) => s.id === serviceId);
  if (!svc) return null;
  const key = `${bedrooms}-${bathrooms}`;
  const priceEntry = svc.prices?.find((p) => p.key === key);
  if (!priceEntry) return null;
  const base = priceEntry.cents;
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = activeAddOns.find((a) => a.id === id);
    return sum + (addon?.cents ?? 0);
  }, 0);
  return base + addOnTotal;
}

function formatPrice(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Inline calculation from booking-drawer.tsx
function calculateEstimateInline(formData, servicesList, addOnsList) {
  const svc = servicesList.find((s) => s.id === formData.serviceType);
  if (!svc) return null;
  const key = `${formData.bedrooms || 1}-${formData.bathrooms || 1}`;
  const priceEntry = svc.prices?.find((p) => p.key === key);
  if (!priceEntry) return null;
  const base = priceEntry.cents;
  const selectedAddOns = Array.isArray(formData.addOns) ? formData.addOns : [];
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = addOnsList.find((a) => a.id === id);
    return sum + (addon?.cents ?? 0);
  }, 0);
  return base + addOnTotal;
}

console.log("=== EMPIRICAL PRICING TESTS ===");
console.log("Loaded booking.json services:", bookingData.services.map(s => s.id));
console.log("Loaded booking.json addOns:", bookingData.addOns.map(a => a.id));
console.log("-----------------------------------");

const testCases = [
  // Deep Cleaning standard matrix
  { name: "Deep Clean 1 bed / 1 bath - no add-ons", serviceId: "deep", bed: 1, bath: 1, addOns: [], expected: 18000 },
  { name: "Deep Clean 2 bed / 2 bath - no add-ons", serviceId: "deep", bed: 2, bath: 2, addOns: [], expected: 22000 },
  { name: "Deep Clean 3 bed / 3 bath - no add-ons", serviceId: "deep", bed: 3, bath: 3, addOns: [], expected: 29000 },

  // Regular Cleaning standard matrix
  { name: "Regular Clean 1 bed / 1 bath - no add-ons", serviceId: "regular", bed: 1, bath: 1, addOns: [], expected: 13500 },
  { name: "Regular Clean 2 bed / 2 bath - no add-ons", serviceId: "regular", bed: 2, bath: 2, addOns: [], expected: 15000 },
  { name: "Regular Clean 3 bed / 3 bath - no add-ons", serviceId: "regular", bed: 3, bath: 3, addOns: [], expected: 18000 },

  // Add-ons combinations
  { name: "Deep Clean 1/1 + Oven (3000)", serviceId: "deep", bed: 1, bath: 1, addOns: ["oven"], expected: 21000 },
  { name: "Deep Clean 1/1 + Oven (3000) + Fridge (3000)", serviceId: "deep", bed: 1, bath: 1, addOns: ["oven", "fridge"], expected: 24000 },
  { name: "Deep Clean 1/1 + All Add-ons (4500+3000+3000)", serviceId: "deep", bed: 1, bath: 1, addOns: ["garage", "oven", "fridge"], expected: 28500 },
  { name: "Regular Clean 2/2 + Garage (4500)", serviceId: "regular", bed: 2, bath: 2, addOns: ["garage"], expected: 19500 },

  // Edge cases & missing configurations
  { name: "Deep Clean 2 bed / 1 bath (unmatched key '2-1')", serviceId: "deep", bed: 2, bath: 1, addOns: [], expected: null },
  { name: "Deep Clean 4 bed / 4 bath (unmatched key '4-4')", serviceId: "deep", bed: 4, bath: 4, addOns: [], expected: null },
  { name: "Non-existent service ID ('luxury')", serviceId: "luxury", bed: 1, bath: 1, addOns: [], expected: null },
  { name: "Invalid add-on ID ('invalid')", serviceId: "deep", bed: 1, bath: 1, addOns: ["invalid"], expected: 18000 },
  { name: "Mixed valid + invalid add-on IDs", serviceId: "deep", bed: 1, bath: 1, addOns: ["oven", "nonexistent"], expected: 21000 },

  // Third service in dataset: "Commercial "
  { name: "Commercial Clean with trailing space ID ('Commercial ')", serviceId: "Commercial ", bed: 1, bath: 1, addOns: [], expected: null },
  { name: "Commercial Clean without trailing space ID ('Commercial')", serviceId: "Commercial", bed: 1, bath: 1, addOns: [], expected: null },

  // Edge case: custom price entry with missing cents
  {
    name: "Custom Service with price entry missing cents",
    serviceId: "custom_nocents",
    bed: 1,
    bath: 1,
    addOns: [],
    customServices: [{
      id: "custom_nocents",
      name: "No Cents Service",
      prices: [{ key: "1-1", bedrooms: "1", bathrooms: "1" }] // cents is undefined
    }],
    expected: NaN // base is undefined, undefined + 0 = NaN
  }
];

let passed = 0;
let failed = 0;

results = [];

testCases.forEach((tc, idx) => {
  const result = calculateEstimate(
    tc.serviceId,
    tc.bed,
    tc.bath,
    tc.addOns,
    tc.customServices,
    tc.customAddOns
  );

  const drawerResult = calculateEstimateInline(
    { serviceType: tc.serviceId, bedrooms: tc.bed, bathrooms: tc.bath, addOns: tc.addOns },
    tc.customServices || bookingData.services,
    tc.customAddOns || bookingData.addOns
  );

  const isMatchExpected = Number.isNaN(tc.expected) ? Number.isNaN(result) : result === tc.expected;
  const isMatchDrawer = Number.isNaN(drawerResult) ? Number.isNaN(result) : result === drawerResult;

  const status = isMatchExpected && isMatchDrawer ? "PASS" : "FAIL";
  if (status === "PASS") passed++; else failed++;

  const resStr = {
    testNumber: idx + 1,
    name: tc.name,
    serviceId: tc.serviceId,
    key: `${tc.bed}-${tc.bath}`,
    addOns: tc.addOns,
    expected: tc.expected,
    calculateEstimateResult: result,
    formatted: result !== null && !Number.isNaN(result) ? formatPrice(result) : (Number.isNaN(result) ? "NaN" : "Custom Quote Required"),
    drawerResult: drawerResult,
    matchDrawer: isMatchDrawer,
    status
  };
  results.push(resStr);
  console.log(`[${status}] Test ${idx + 1}: ${tc.name}`);
  console.log(`       Result: ${resStr.formatted} (raw: ${result}), Expected: ${tc.expected}`);
  if (!isMatchDrawer) {
    console.log(`       WARNING: Drawer inline calc (${drawerResult}) does not match calculateEstimate (${result})`);
  }
});

console.log("-----------------------------------");
console.log(`Summary: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);

// Output full JSON output to a file for artifact inclusion
fs.writeFileSync(path.resolve(__dirname, 'test_results.json'), JSON.stringify(results, null, 2));
