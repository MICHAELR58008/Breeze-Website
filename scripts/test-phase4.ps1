param([switch]$Quiet)

$failed = @()
$trivyExe = "$env:LOCALAPPDATA\trivy\trivy.exe"

if (-not $Quiet) {
    Write-Host "=== PHASE 4 VERIFICATION: Trivy ===" -ForegroundColor Cyan
}

# Verify trivy is installed
if (Test-Path $trivyExe) {
    $version = cmd /c "`"$trivyExe`" --version 2>nul"
    if (-not $Quiet) { Write-Host "PASS: Trivy installed: $version" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Trivy not found at $trivyExe" -ForegroundColor Red }
    $failed += "Trivy not installed"
}

# Run dependency vulnerability scan (exit code 0 to not fail on findings)
cmd /c "`"$trivyExe`" fs --scanners vuln --severity CRITICAL,HIGH --format json --exit-code 0 -o trivy-latest.json . 2>nul"
$scanExit = $LASTEXITCODE
if ($scanExit -eq 0 -or $scanExit -eq 1) {
    $report = Get-Content trivy-latest.json -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
    $totalVulns = 0
    if ($report.Results) {
        $totalVulns = ($report.Results | Where-Object { $_.Vulnerabilities } | ForEach-Object { $_.Vulnerabilities.Count } | Measure-Object -Sum).Sum
    }
    if (-not $Quiet) { Write-Host "PASS: Scan completed ($totalVulns vulnerabilities found)" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Trivy scan failed (exit code $scanExit)" -ForegroundColor Red }
    $failed += "Trivy scan failed"
}

if (-not $Quiet) {
    Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
}

if ($failed.Count -eq 0) {
    if (-not $Quiet) { Write-Host "PHASE 4 COMPLETE - All checks passed." -ForegroundColor Green }
    exit 0
} else {
    if (-not $Quiet) {
        Write-Host "FAILURES:" -ForegroundColor Red
        $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
    exit 1
}
