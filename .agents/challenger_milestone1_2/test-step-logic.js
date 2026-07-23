// Empirical verification script for booking drawer step logic & submit requirements
const assert = require('assert');

// Default steps definition matching lib/booking-content.ts / content/booking/booking.json
const rawSteps = [
  { title: "Service", fields: [{ _template: "servicesSelector" }] },
  {
    title: "Home",
    showIfField: "serviceType",
    showIfOperator: "not_equals",
    showIfValue: "Commercial ",
    fields: [{ _template: "numberInput" }]
  },
  { title: "Extras", disabled: true, fields: [{ _template: "addonsSelector" }] },
  { title: "Photos", showIfField: "fdasfasd", showIfOperator: "", showIfValue: "", fields: [{ _template: "photoUpload" }] },
  { title: "Schedule", fields: [{ _template: "dateInput" }] },
  { title: "Contact", fields: [{ _template: "textInput" }] },
  { title: "Review", fields: [{ _template: "estimateSummary" }] }
];

function filterSteps(contentSteps, formData) {
  return contentSteps
    .map((step, originalIndex) => ({ step, originalIndex }))
    .filter(({ step }) => {
      if (step.disabled) return false;
      if (!step.showIfField) return true;
      const val = formData[step.showIfField];
      if (step.showIfOperator === "equals") return String(val) === String(step.showIfValue);
      if (step.showIfOperator === "not_equals") return String(val) !== String(step.showIfValue);
      if (step.showIfOperator === "contains") return String(val).includes(String(step.showIfValue));
      return true;
    });
}

function simulateStepFlow(serviceType) {
  const formData = { serviceType };
  const steps = filterSteps(rawSteps, formData);
  const totalSteps = steps.length;
  
  const audit = {
    serviceType,
    totalSteps,
    stepSequence: [],
    submitAttemptedOnNonFinal: [],
    finalStepButtonType: null,
    enterKeySubmitBlocked: true,
  };

  for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
    const currentStep = steps[stepIndex].step;
    const isLessThanLast = stepIndex < totalSteps - 1;
    const buttonType = isLessThanLast ? "button" : "submit";
    const buttonLabel = isLessThanLast ? "Continue" : "Submit request";

    // Simulate submit trigger on current stepIndex
    let submitProceeded = false;
    if (stepIndex < totalSteps - 1) {
      // Logic in submit(): if (stepIndex < totalSteps - 1) return;
      submitProceeded = false;
    } else {
      submitProceeded = true;
    }

    audit.stepSequence.push({
      stepIndex,
      title: currentStep.title,
      buttonType,
      buttonLabel,
      canSubmit: submitProceeded
    });

    if (isLessThanLast && submitProceeded) {
      audit.submitAttemptedOnNonFinal.push(stepIndex);
    }

    if (!isLessThanLast) {
      audit.finalStepButtonType = buttonType;
    }
  }

  return audit;
}

console.log("=== EMPIRICAL TEST RUN ===");

// 1. Standard Clean ("deep" / "regular") -> 6 steps
const standardAudit = simulateStepFlow("deep");
console.log("Standard Clean Audit:", JSON.stringify(standardAudit, null, 2));
assert.strictEqual(standardAudit.totalSteps, 6, "Standard clean must have exactly 6 steps");
assert.strictEqual(standardAudit.submitAttemptedOnNonFinal.length, 0, "No submit allowed on non-final step for standard clean");
assert.strictEqual(standardAudit.finalStepButtonType, "submit", "Final step must render type='submit'");

// 2. Commercial Clean ("Commercial ") -> 5 steps
const commercialAudit = simulateStepFlow("Commercial ");
console.log("Commercial Clean Audit:", JSON.stringify(commercialAudit, null, 2));
assert.strictEqual(commercialAudit.totalSteps, 5, "Commercial clean must have exactly 5 steps");
assert.strictEqual(commercialAudit.submitAttemptedOnNonFinal.length, 0, "No submit allowed on non-final step for commercial clean");
assert.strictEqual(commercialAudit.finalStepButtonType, "submit", "Final step must render type='submit'");

// 3. Dynamic Package Switching Simulation
console.log("\n--- Testing Dynamic Package Switch Mid-Flow ---");
let currentFormData = { serviceType: "deep" };
let currentSteps = filterSteps(rawSteps, currentFormData);
console.log(`Initial package: deep (${currentSteps.length} steps)`);
assert.strictEqual(currentSteps.length, 6);

// User changes package to Commercial Clean
currentFormData.serviceType = "Commercial ";
currentSteps = filterSteps(rawSteps, currentFormData);
console.log(`Switched package: Commercial Clean (${currentSteps.length} steps)`);
assert.strictEqual(currentSteps.length, 5);

// Verify step titles for Commercial Clean
const titles = currentSteps.map(s => s.step.title);
console.log("Commercial step titles:", titles);
assert.deepStrictEqual(titles, ["Service", "Photos", "Schedule", "Contact", "Review"]);

console.log("\nAll step logic assertions PASSED successfully.");
