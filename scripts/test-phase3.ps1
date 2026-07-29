param([switch]$Quiet)

$failed = @()
$semgrepExe = "$env:USERPROFILE\.local\bin\semgrep.exe"

if (-not $Quiet) {
    Write-Host "=== PHASE 3 VERIFICATION: Semgrep ===" -ForegroundColor Cyan
}

# Verify semgrep is installed
if (Test-Path $semgrepExe) {
    $version = cmd /c "`"$semgrepExe`" --version" 2>$null
    if (-not $Quiet) { Write-Host "PASS: Semgrep installed: $version" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Semgrep not found" -ForegroundColor Red }
    $failed += "Semgrep not installed"
}

# Verify .semgrep.yml exists
if (Test-Path ".semgrep.yml") {
    if (-not $Quiet) { Write-Host "PASS: .semgrep.yml exists" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: .semgrep.yml not found" -ForegroundColor Red }
    $failed += ".semgrep.yml missing"
}

# Verify .semgrepignore exists
if (Test-Path ".semgrepignore") {
    if (-not $Quiet) { Write-Host "PASS: .semgrepignore exists" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: .semgrepignore not found" -ForegroundColor Red }
    $failed += ".semgrepignore missing"
}

# Run custom rules
cmd /c "`"$semgrepExe`" scan --config=.semgrep.yml --json -o semgrep-custom-check.json . 2>nul"
$scanExit = $LASTEXITCODE

if ($scanExit -eq 0 -or $scanExit -eq 1) {
    $report = Get-Content semgrep-custom-check.json -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
    $count = $report.results.Count
    if (-not $Quiet) { Write-Host "PASS: Scan completed ($count findings)" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Scan failed (exit code $scanExit)" -ForegroundColor Red }
    $failed += "Semgrep scan failed"
}

if (-not $Quiet) {
    Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
}

if ($failed.Count -eq 0) {
    if (-not $Quiet) { Write-Host "PHASE 3 COMPLETE - All checks passed." -ForegroundColor Green }
    exit 0
} else {
    if (-not $Quiet) {
        Write-Host "FAILURES:" -ForegroundColor Red
        $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
    exit 1
}
