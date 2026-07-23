import React, { Component } from "react"
import ReactDOMServer from "react-dom/server"
import { ErrorBoundary, ErrorBoundaryProps } from "../components/ui/error-boundary"
import { ErrorBoundary as TinaErrorBoundary } from "../tina/components/ErrorBoundary"

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`)
  }
}

// Helper to attach React component updater for unmounted instance unit testing
function attachMockUpdater(instance: Component) {
  (instance as any).updater = {
    isMounted: () => true,
    enqueueSetState: (inst: any, partialState: any, callback?: Function) => {
      const nextState = typeof partialState === "function" ? partialState(inst.state, inst.props) : partialState
      inst.state = { ...inst.state, ...nextState }
      if (callback) callback()
    }
  }
}

export function runErrorBoundaryVerification() {
  console.log("==========================================================")
  console.log("  EMPIRICAL VERIFICATION: UI & TinaCMS ErrorBoundary  ")
  console.log("==========================================================\n")

  const testResults: { test: string; passed: boolean; details: string }[] = []

  // -------------------------------------------------------------------------
  // TEST 1: Normal Rendering (No Error)
  // -------------------------------------------------------------------------
  try {
    const element = React.createElement(
      ErrorBoundary,
      null,
      React.createElement("span", { id: "normal-child" }, "Child text")
    )
    const html = ReactDOMServer.renderToStaticMarkup(element)
    const passed = html === '<span id="normal-child">Child text</span>'
    testResults.push({
      test: "Test 1: Normal child rendering (no error)",
      passed,
      details: `Rendered HTML: "${html}"`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 1: Normal child rendering (no error)",
      passed: false,
      details: `Unexpected error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 2: getDerivedStateFromError & Default Fallback UI Rendering
  // -------------------------------------------------------------------------
  try {
    const errorMsg = "Fatal component crash in child"
    const testError = new Error(errorMsg)
    const derivedState = ErrorBoundary.getDerivedStateFromError(testError)
    
    assert(derivedState.hasError === true, "hasError must be true")
    assert(derivedState.error === testError, "error must match original error")

    // Create boundary instance and set state to error state
    const boundaryInstance = new ErrorBoundary({
      children: React.createElement("div", null, "Child")
    })
    boundaryInstance.state = derivedState

    const fallbackNode = boundaryInstance.render()
    const html = ReactDOMServer.renderToStaticMarkup(fallbackNode as React.ReactElement)

    const hasRoleAlert = html.includes('role="alert"')
    const hasHeader = html.includes('Something went wrong')
    const hasErrorMsg = html.includes(errorMsg)
    const hasTryAgainBtn = html.includes('Try again')

    const passed = hasRoleAlert && hasHeader && hasErrorMsg && hasTryAgainBtn

    testResults.push({
      test: "Test 2: Catch error & display default fallback UI",
      passed,
      details: `Alert role: ${hasRoleAlert}, Header: ${hasHeader}, Error text: ${hasErrorMsg}, Reset button: ${hasTryAgainBtn}`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 2: Catch error & display default fallback UI",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 3: Static `fallback` ReactNode Prop
  // -------------------------------------------------------------------------
  try {
    const customFallback = React.createElement("div", { className: "custom-fallback-box" }, "Custom Fallback Rendered")
    const boundaryInstance = new ErrorBoundary({
      fallback: customFallback,
      children: React.createElement("div", null, "Child")
    })
    boundaryInstance.state = { hasError: true, error: new Error("Sample error") }

    const fallbackNode = boundaryInstance.render()
    const html = ReactDOMServer.renderToStaticMarkup(fallbackNode as React.ReactElement)

    const passed = html === '<div class="custom-fallback-box">Custom Fallback Rendered</div>'
    testResults.push({
      test: "Test 3: Custom ReactNode `fallback` prop support",
      passed,
      details: `Rendered HTML: "${html}"`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 3: Custom ReactNode `fallback` prop support",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 4: Function `fallback` Prop (error, reset) => ReactNode
  // -------------------------------------------------------------------------
  try {
    let receivedError: Error | null = null
    let receivedResetFn: (() => void) | null = null

    const fallbackFn = (err: Error, reset: () => void) => {
      receivedError = err
      receivedResetFn = reset
      return React.createElement("div", { id: "fn-fallback" }, `Error: ${err.message}`)
    }

    const testError = new Error("Function fallback trigger error")
    const boundaryInstance = new ErrorBoundary({
      fallback: fallbackFn,
      children: React.createElement("div", null, "Child")
    })
    boundaryInstance.state = { hasError: true, error: testError }

    const fallbackNode = boundaryInstance.render()
    const html = ReactDOMServer.renderToStaticMarkup(fallbackNode as React.ReactElement)

    const correctErrorReceived = receivedError === testError
    const correctResetReceived = typeof receivedResetFn === "function" && receivedResetFn === boundaryInstance.resetErrorBoundary
    const correctHtml = html === '<div id="fn-fallback">Error: Function fallback trigger error</div>'

    const passed = correctErrorReceived && correctResetReceived && correctHtml

    testResults.push({
      test: "Test 4: Function `fallback(error, reset)` prop execution",
      passed,
      details: `Error received: ${correctErrorReceived}, Reset fn passed: ${correctResetReceived}, HTML match: ${correctHtml}`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 4: Function `fallback(error, reset)` prop execution",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 5: Fallback function when state.error is null/undefined
  // -------------------------------------------------------------------------
  try {
    let receivedErrorMessage = ""
    const fallbackFn = (err: Error) => {
      receivedErrorMessage = err.message
      return React.createElement("span", null, err.message)
    }

    const boundaryInstance = new ErrorBoundary({ fallback: fallbackFn })
    boundaryInstance.state = { hasError: true, error: null }

    boundaryInstance.render()
    const passed = receivedErrorMessage === "Unknown error"

    testResults.push({
      test: "Test 5: Function fallback fallback error handling (null error)",
      passed,
      details: `Received error message when state.error was null: "${receivedErrorMessage}"`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 5: Function fallback fallback error handling (null error)",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 6: `onError` Callback Execution (componentDidCatch)
  // -------------------------------------------------------------------------
  try {
    let onErrorCalled = false
    let caughtErrorArg: Error | null = null
    let caughtInfoArg: any = null

    const mockOnError = (error: Error, errorInfo: React.ErrorInfo) => {
      onErrorCalled = true
      caughtErrorArg = error
      caughtInfoArg = errorInfo
    }

    // Suppress console.error during expected boundary catch test
    const origConsoleError = console.error
    console.error = () => {}

    const testError = new Error("Catch test error")
    const testInfo = { componentStack: "\n    in ThrowingChild\n    in ErrorBoundary" }

    const boundaryInstance = new ErrorBoundary({ onError: mockOnError })
    boundaryInstance.componentDidCatch(testError, testInfo)

    console.error = origConsoleError

    const passed = onErrorCalled && caughtErrorArg === testError && caughtInfoArg === testInfo

    testResults.push({
      test: "Test 6: `onError` prop callback in componentDidCatch",
      passed,
      details: `onError triggered: ${onErrorCalled}, Correct error: ${caughtErrorArg === testError}, Correct info: ${caughtInfoArg === testInfo}`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 6: `onError` prop callback in componentDidCatch",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 7: `onReset` Callback & Reset State Behavior
  // -------------------------------------------------------------------------
  try {
    let onResetCalled = false
    const mockOnReset = () => {
      onResetCalled = true
    }

    const boundaryInstance = new ErrorBoundary({
      onReset: mockOnReset,
      children: React.createElement("div", { id: "recovered" }, "Recovered Content")
    })
    attachMockUpdater(boundaryInstance)

    // Set error state
    boundaryInstance.state = { hasError: true, error: new Error("Pre-reset error") }

    // Execute reset
    boundaryInstance.resetErrorBoundary()

    const stateCleared = boundaryInstance.state.hasError === false && boundaryInstance.state.error === null
    
    // Render after reset
    const postResetNode = boundaryInstance.render()
    const html = ReactDOMServer.renderToStaticMarkup(postResetNode as React.ReactElement)

    const passed = onResetCalled && stateCleared && html === '<div id="recovered">Recovered Content</div>'

    testResults.push({
      test: "Test 7: `onReset` callback and reset state behavior",
      passed,
      details: `onReset called: ${onResetCalled}, State reset: ${stateCleared}, Post-reset children rendered: ${html === '<div id="recovered">Recovered Content</div>'}`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 7: `onReset` callback and reset state behavior",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 8: `className` Prop Application to Default Fallback UI
  // -------------------------------------------------------------------------
  try {
    const customClass = "my-custom-error-boundary-class border-red-900"
    const boundaryInstance = new ErrorBoundary({
      className: customClass,
      children: React.createElement("div", null, "Child")
    })
    boundaryInstance.state = { hasError: true, error: new Error("Test error") }

    const fallbackNode = boundaryInstance.render()
    const html = ReactDOMServer.renderToStaticMarkup(fallbackNode as React.ReactElement)

    const passed = html.includes(customClass)

    testResults.push({
      test: "Test 8: `className` prop forwarded to default fallback container",
      passed,
      details: `Contains custom class: ${passed}`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 8: `className` prop forwarded to default fallback container",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // TEST 9: TinaCMS ErrorBoundary (`tina/components/ErrorBoundary.tsx`)
  // -------------------------------------------------------------------------
  try {
    const tinaError = new Error("Tina field render error")
    const tinaDerivedState = TinaErrorBoundary.getDerivedStateFromError(tinaError)
    assert(tinaDerivedState.hasError === true, "Tina error state must be true")

    const tinaInstance = new TinaErrorBoundary({
      children: React.createElement("div", null, "Tina Field Content")
    })
    tinaInstance.state = tinaDerivedState

    const html = ReactDOMServer.renderToStaticMarkup(tinaInstance.render() as React.ReactElement)
    const containsHeader = html.includes("Error loading field")
    const containsMsg = html.includes("Tina field render error")

    const passed = containsHeader && containsMsg
    testResults.push({
      test: "Test 9: TinaCMS ErrorBoundary fallback rendering",
      passed,
      details: `Contains 'Error loading field': ${containsHeader}, Contains error message: ${containsMsg}`
    })
  } catch (err: any) {
    testResults.push({
      test: "Test 9: TinaCMS ErrorBoundary fallback rendering",
      passed: false,
      details: `Error: ${err.message}`
    })
  }

  // -------------------------------------------------------------------------
  // PRINT RESULTS SUMMARY
  // -------------------------------------------------------------------------
  console.log("------------------ TEST RESULTS SUMMARY ------------------")
  let allPassed = true
  for (const res of testResults) {
    const tag = res.passed ? "[PASS]" : "[FAIL]"
    if (!res.passed) allPassed = false
    console.log(`${tag} ${res.test}`)
    console.log(`       ${res.details}`)
  }
  console.log("----------------------------------------------------------")
  console.log(`OVERALL ERROR BOUNDARY VERDICT: ${allPassed ? "PASS" : "FAIL"}\n`)

  if (!allPassed) {
    process.exit(1)
  }
}

runErrorBoundaryVerification()
