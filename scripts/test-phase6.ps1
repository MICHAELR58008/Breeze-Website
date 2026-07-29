param([switch]$Quiet)

$failed = @()

if (-not $Quiet) {
    Write-Host "=== PHASE 6 VERIFICATION: GitHub Actions CI ===" -ForegroundColor Cyan
}

# Verify workflow file exists
$workflowPath = ".github\workflows\security.yml"
if (Test-Path $workflowPath) {
    if (-not $Quiet) { Write-Host "PASS: Workflow file exists at $workflowPath" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Workflow file missing" -ForegroundColor Red }
    $failed += "Workflow file missing"
}

# Verify package.json has security scripts
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$hasScripts = ($pkg.scripts.security_gitleaks -or $pkg.scripts.'security:gitleaks')
if ($hasScripts) {
    if (-not $Quiet) { Write-Host "PASS: Security scripts in package.json" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Security scripts not in package.json" -ForegroundColor Red }
    $failed += "Missing security scripts in package.json"
}

if (-not $Quiet) {
    Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
}

if ($failed.Count -eq 0) {
    if (-not $Quiet) { Write-Host "PHASE 6 COMPLETE - CI pipeline configured." -ForegroundColor Green }
    exit 0
} else {
    if (-not $Quiet) {
        Write-Host "FAILURES:" -ForegroundColor Red
        $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
    exit 1
}
