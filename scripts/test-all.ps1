$ErrorActionPreference = "SilentlyContinue"
$failed = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FULL SECURITY AUDIT VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nRunning Phase 1: Gitleaks..." -ForegroundColor Yellow
& "$PSScriptRoot\test-phase1.ps1" -Quiet 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red; $failed += "Phase 1" }

Write-Host "Running Phase 2: Pre-commit..." -ForegroundColor Yellow
& python -m pre_commit run gitleaks --all-files 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red; $failed += "Phase 2" }

Write-Host "Running Phase 3: Semgrep..." -ForegroundColor Yellow
& "$PSScriptRoot\test-phase3.ps1" -Quiet 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red; $failed += "Phase 3" }

Write-Host "Running Phase 4: Trivy..." -ForegroundColor Yellow
& "$PSScriptRoot\test-phase4.ps1" -Quiet 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red; $failed += "Phase 4" }

Write-Host "Running Phase 5: Bearer..." -ForegroundColor Yellow
& "$PSScriptRoot\test-phase5.ps1" -Quiet 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red; $failed += "Phase 5" }

Write-Host "Running Phase 6: CI..." -ForegroundColor Yellow
& "$PSScriptRoot\test-phase6.ps1" -Quiet 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red; $failed += "Phase 6" }

Write-Host "`n========================================" -ForegroundColor Cyan
if ($failed.Count -eq 0) {
    Write-Host "ALL PHASES PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "FAILED: $($failed -join ', ')" -ForegroundColor Red
    exit 1
}
