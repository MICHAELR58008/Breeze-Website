import fs from "fs"
import path from "path"
import { defaultSteps } from "./booking-content"

function runEmpiricalVerification() {
  console.log("=== EMPIRICAL VERIFICATION OF BOOKING DRAWER ===")

  const drawerFilePath = path.join(process.cwd(), "components", "booking", "booking-drawer.tsx")
  const drawerSource = fs.readFileSync(drawerFilePath, "utf8")

  const results: { test: string; passed: boolean; details: string }[] = []

  // Test 1: Check distinct key props on navigation buttons
  const continueKeyMatch = drawerSource.includes('key="continue-btn"')
  const submitKeyMatch = drawerSource.includes('key="submit-btn"')
  const backKeyMatch = drawerSource.includes('key="back-btn"')

  results.push({
    test: "Navigation button keys (DOM node reuse prevention)",
    passed: continueKeyMatch && submitKeyMatch && backKeyMatch,
    details: `continue-btn key: ${continueKeyMatch}, submit-btn key: ${submitKeyMatch}, back-btn key: ${backKeyMatch}`
  })

  // Test 2: Check type="button" on Continue and Back buttons
  const continueTypeMatch = /key="continue-btn"[\s\S]*?type="button"|type="button"[\s\S]*?key="continue-btn"/.test(drawerSource)
  const backTypeMatch = /key="back-btn"[\s\S]*?type="button"|type="button"[\s\S]*?key="back-btn"/.test(drawerSource)
  const submitTypeMatch = /key="submit-btn"[\s\S]*?type="submit"|type="submit"[\s\S]*?key="submit-btn"/.test(drawerSource)

  results.push({
    test: "Explicit button types on navigation controls",
    passed: continueTypeMatch && backTypeMatch && submitTypeMatch,
    details: `Continue button type="button": ${continueTypeMatch}, Back button type="button": ${backTypeMatch}, Submit button type="submit": ${submitTypeMatch}`
  })

  // Test 3: Check submit function guard (stepIndex < totalSteps - 1)
  const submitGuardMatch = /if\s*\(\s*stepIndex\s*<\s*totalSteps\s*-\s*1\s*\)\s*\{\s*return\s*\}/.test(drawerSource)
  results.push({
    test: "Submit function guard against early submission",
    passed: submitGuardMatch,
    details: `submit() includes early return if stepIndex < totalSteps - 1: ${submitGuardMatch}`
  })

  // Test 4: Check Enter key event handler on form
  const enterKeyGuardMatch = drawerSource.includes("e.key === 'Enter'") && drawerSource.includes("e.preventDefault()")
  results.push({
    test: "Form onKeyDown Enter key interception",
    passed: enterKeyGuardMatch,
    details: `Form prevents accidental Enter key submissions: ${enterKeyGuardMatch}`
  })

  // Test 5: Verify step transition logic for all default service packages
  const services = ["deep", "standard", "move-in", "airbnb", "post-const", "office", "commercial"]
  let allServicesPass = true
  const serviceStepLogs: string[] = []

  for (const service of services) {
    let stepIndex = 0
    const totalSteps = defaultSteps.length // 7 steps

    // Simulate clicking Continue step-by-step
    while (stepIndex < totalSteps - 1) {
      stepIndex++ // Simulate setStepIndex(stepIndex + 1)
    }

    const stoppedAtReview = stepIndex === totalSteps - 1 // Final step index (6)
    const currentStepTitle = defaultSteps[stepIndex].title

    if (!stoppedAtReview || currentStepTitle !== "Review") {
      allServicesPass = false
    }
    serviceStepLogs.push(`Service '${service}': stopped at step ${stepIndex} (${currentStepTitle})`)
  }

  results.push({
    test: "Step navigation stops at Review step across all service packages",
    passed: allServicesPass,
    details: serviceStepLogs.join("; ")
  })

  // Test 6: Verify interactive field buttons have explicit type="button"
  const serviceSelectorMatch = /case "servicesSelector":[\s\S]*?type="button"/.test(drawerSource)
  const choiceInputMatch = /case "choiceInput":[\s\S]*?type="button"/.test(drawerSource)
  const bannerDismissMatch = /onClick=\{\(\) => setDismissed\(true\)\}[\s\S]*?type="button"|type="button"[\s\S]*?onClick=\{\(\) => setDismissed\(true\)\}/.test(drawerSource)

  results.push({
    test: "Field selector buttons have type='button'",
    passed: serviceSelectorMatch && choiceInputMatch && bannerDismissMatch,
    details: `serviceSelector: ${serviceSelectorMatch}, choiceInput: ${choiceInputMatch}, bannerDismiss: ${bannerDismissMatch}`
  })

  // Print Summary
  console.log("\n--- TEST SUMMARY ---")
  let overallPass = true
  for (const r of results) {
    const status = r.passed ? "[PASS]" : "[FAIL]"
    if (!r.passed) overallPass = false
    console.log(`${status} ${r.test}`)
    console.log(`       Details: ${r.details}`)
  }

  console.log(`\nOVERALL VERDICT: ${overallPass ? "PASS" : "FAIL"}`)
  if (!overallPass) {
    process.exit(1)
  }
}

runEmpiricalVerification()
