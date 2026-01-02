# Automated Extension Installation Script
# Run this script on employee computers to install the extension

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Beck Auto-Post Extension Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Chrome is installed
$chromePath = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
$chromePathX86 = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"

if (-not (Test-Path $chromePath) -and -not (Test-Path $chromePathX86)) {
    Write-Host "❌ ERROR: Google Chrome not found!" -ForegroundColor Red
    Write-Host "Please install Google Chrome first." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Chrome found" -ForegroundColor Green
Write-Host ""

# Get extension ZIP file location
Write-Host "Please provide the path to the extension ZIP file:" -ForegroundColor Yellow
Write-Host "Example: C:\Users\YourName\Downloads\beck-auto-post-extension-v1.0.0.zip" -ForegroundColor Gray
Write-Host "Or drag and drop the ZIP file into this window, then press Enter" -ForegroundColor Gray
$zipPath = Read-Host "ZIP file path"

if (-not (Test-Path $zipPath)) {
    Write-Host "❌ ERROR: ZIP file not found at: $zipPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ ZIP file found" -ForegroundColor Green
Write-Host ""

# Extract extension
$extractPath = Join-Path $env:TEMP "beck-extension-install"
if (Test-Path $extractPath) {
    Remove-Item $extractPath -Recurse -Force
}

Write-Host "📦 Extracting extension..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Write-Host "✅ Extraction complete" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to extract ZIP file" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Find the extension folder (might be nested)
$extensionFolder = Get-ChildItem -Path $extractPath -Recurse -Filter "manifest.json" | Select-Object -First 1
if ($extensionFolder) {
    $extensionFolder = $extensionFolder.Directory.FullName
} else {
    Write-Host "❌ ERROR: Could not find extension folder (manifest.json not found)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Extension folder found: $extensionFolder" -ForegroundColor Green
Write-Host ""

# Copy to permanent location
$permanentPath = Join-Path $env:LOCALAPPDATA "BeckExtension"
if (Test-Path $permanentPath) {
    Remove-Item $permanentPath -Recurse -Force
}

Write-Host "📁 Copying extension to permanent location..." -ForegroundColor Yellow
Copy-Item -Path $extensionFolder -Destination $permanentPath -Recurse -Force
Write-Host "✅ Extension copied to: $permanentPath" -ForegroundColor Green
Write-Host ""

# Clean up temp folder
Remove-Item $extractPath -Recurse -Force

# Instructions for manual loading
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Google Chrome" -ForegroundColor White
Write-Host "2. Go to: chrome://extensions/" -ForegroundColor White
Write-Host "3. Enable 'Developer mode' (toggle in top-right)" -ForegroundColor White
Write-Host "4. Click 'Load unpacked'" -ForegroundColor White
Write-Host "5. Navigate to: $permanentPath" -ForegroundColor White
Write-Host "6. Click 'Select Folder'" -ForegroundColor White
Write-Host ""
Write-Host "The extension is ready at: $permanentPath" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to open Chrome extensions page
$openChrome = Read-Host "Would you like to open Chrome extensions page now? (Y/N)"
if ($openChrome -eq "Y" -or $openChrome -eq "y") {
    Start-Process "chrome://extensions/"
    Write-Host ""
    Write-Host "Chrome should open. Follow the steps above to load the extension." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "After installation, configure the extension with your store's settings:" -ForegroundColor Yellow
Write-Host "See EMPLOYEE_INSTALLATION_GUIDE.md for configuration details" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"


