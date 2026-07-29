param([switch]$Quiet)

$failed = @()
$gitleaksPath = Join-Path $env:LOCALAPPDATA "gitleaks"
$gitleaksExe = Join-Path $gitleaksPath "gitleaks.exe"

if (-not $Quiet) {
    Write-Host "=== PHASE 1 VERIFICATION: Gitleaks ===" -ForegroundColor Cyan
}

# Verify gitleaks is installed
if (Test-Path $gitleaksExe) {
    $version = cmd /c "`"$gitleaksExe`" version"
    if (-not $Quiet) { Write-Host "PASS: Gitleaks installed: $version" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Gitleaks not found at $gitleaksExe" -ForegroundColor Red }
    $failed += "Gitleaks not installed"
}

# Verify .gitleaks.toml exists
if (Test-Path ".gitleaks.toml") {
    if (-not $Quiet) { Write-Host "PASS: .gitleaks.toml exists" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: .gitleaks.toml not found" -ForegroundColor Red }
    $failed += ".gitleaks.toml missing"
}

# Verify .gitignore contains tina/__generated__/
if ((Get-Content ".gitignore" -Raw) -match "tina/__generated__") {
    if (-not $Quiet) { Write-Host "PASS: tina/__generated__ in .gitignore" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: tina/__generated__ NOT in .gitignore" -ForegroundColor Red }
    $failed += ".gitignore missing tina/__generated__/"
}

# Run dir scan
cmd /c "`"$gitleaksExe`" dir --no-color . 2>nul"
$scanExit = $LASTEXITCODE
if ($scanExit -eq 0) {
    if (-not $Quiet) { Write-Host "PASS: Dir scan clean (exit code 0)" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Dir scan found leaks (exit code $scanExit)" -ForegroundColor Red }
    $failed += "Dir scan found leaks"
}

# Run git history scan
cmd /c "`"$gitleaksExe`" git --no-color . 2>nul"
$gitExit = $LASTEXITCODE
if ($gitExit -eq 0) {
    if (-not $Quiet) { Write-Host "PASS: Git history scan clean (exit code 0)" -ForegroundColor Green }
} else {
    if (-not $Quiet) { Write-Host "FAIL: Git history scan found leaks (exit code $gitExit)" -ForegroundColor Red }
    $failed += "Git history scan found leaks"
}

if (-not $Quiet) {
    Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
}

if ($failed.Count -eq 0) {
    if (-not $Quiet) { Write-Host "PHASE 1 COMPLETE - All checks passed." -ForegroundColor Green }
    exit 0
} else {
    if (-not $Quiet) {
        Write-Host "FAILURES:" -ForegroundColor Red
        $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
    exit 1
}
