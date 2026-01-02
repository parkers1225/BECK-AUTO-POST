# Production Package Creator for Chrome Web Store
# Creates a clean extension package ready for Chrome Web Store submission

$ErrorActionPreference = "Stop"

Write-Host "📦 Creating Production Extension Package..." -ForegroundColor Cyan
Write-Host ""

# Set paths
$rootPath = "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
$packagePath = Join-Path $rootPath "beck-auto-post-extension-package"
$zipPath = Join-Path $rootPath "beck-auto-post-extension-v1.0.0.zip"

# Clean up old package
if (Test-Path $packagePath) {
    Remove-Item $packagePath -Recurse -Force
    Write-Host "✅ Cleaned up old package" -ForegroundColor Green
}

# Create package directory
New-Item -ItemType Directory -Path $packagePath -Force | Out-Null

# Files to include
$filesToInclude = @(
    "manifest.json",
    "popup.html",
    "popup.js",
    "popup.css",
    "background.js",
    "content.js"
)

# Directories to include
$dirsToInclude = @(
    "icons",
    "utils"
)

Write-Host "📋 Copying extension files..." -ForegroundColor Yellow

# Copy files
foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $rootPath $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $packagePath -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $file not found" -ForegroundColor Yellow
    }
}

# Copy directories (exclude sensitive/unnecessary files)
foreach ($dir in $dirsToInclude) {
    $sourcePath = Join-Path $rootPath $dir
    if (Test-Path $sourcePath) {
        # Copy directory but exclude .pem files and node_modules
        $destPath = Join-Path $packagePath $dir
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        
        Get-ChildItem -Path $sourcePath -Recurse -File | Where-Object {
            $_.Extension -ne ".pem" -and 
            $_.FullName -notlike "*node_modules*" -and
            $_.FullName -notlike "*\.git*"
        } | ForEach-Object {
            $relativePath = $_.FullName.Substring($sourcePath.Length + 1)
            $targetPath = Join-Path $destPath $relativePath
            $targetDir = Split-Path $targetPath -Parent
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            Copy-Item $_.FullName $targetPath -Force
        }
        Write-Host "  ✅ $dir/ (excluding .pem, node_modules)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $dir/ not found" -ForegroundColor Yellow
    }
}

# Verify manifest.json exists
$manifestPath = Join-Path $packagePath "manifest.json"
if (Test-Path $manifestPath) {
    Write-Host ""
    Write-Host "✅ Package created successfully!" -ForegroundColor Green
    Write-Host "   Location: $packagePath" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error: manifest.json not found in package!" -ForegroundColor Red
    exit 1
}

# Verify no .pem files or node_modules in package before creating ZIP
Write-Host ""
Write-Host "🔍 Verifying package contents..." -ForegroundColor Yellow

$pemFiles = Get-ChildItem -Path $packagePath -Recurse -Filter "*.pem" -ErrorAction SilentlyContinue
$nodeModulesDirs = Get-ChildItem -Path $packagePath -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue
$serverDirs = Get-ChildItem -Path $packagePath -Recurse -Directory -Filter "server" -ErrorAction SilentlyContinue

if ($pemFiles) {
    Write-Host "⚠️  WARNING: Found .pem files in package:" -ForegroundColor Red
    foreach ($file in $pemFiles) {
        Write-Host "     - $($file.FullName)" -ForegroundColor Red
        Remove-Item $file.FullName -Force
        Write-Host "     ✅ Removed" -ForegroundColor Green
    }
}

if ($nodeModulesDirs) {
    Write-Host "⚠️  WARNING: Found node_modules directories in package:" -ForegroundColor Red
    foreach ($dir in $nodeModulesDirs) {
        Write-Host "     - $($dir.FullName)" -ForegroundColor Red
        Remove-Item $dir.FullName -Recurse -Force
        Write-Host "     ✅ Removed" -ForegroundColor Green
    }
}

if ($serverDirs) {
    Write-Host "⚠️  WARNING: Found server directories in package:" -ForegroundColor Red
    foreach ($dir in $serverDirs) {
        Write-Host "     - $($dir.FullName)" -ForegroundColor Red
        Remove-Item $dir.FullName -Recurse -Force
        Write-Host "     ✅ Removed" -ForegroundColor Green
    }
}

if (-not $pemFiles -and -not $nodeModulesDirs -and -not $serverDirs) {
    Write-Host "✅ Package verified - no .pem files, node_modules, or server directories found" -ForegroundColor Green
}

# Create ZIP file with explicit file selection to avoid including unwanted files
Write-Host ""
Write-Host "📦 Creating ZIP file..." -ForegroundColor Yellow

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Get only the files we want to include (explicitly exclude .pem, node_modules, server)
$filesToZip = Get-ChildItem -Path $packagePath -Recurse -File | Where-Object {
    $_.Extension -ne ".pem" -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.FullName -notlike "*\server\*" -and
    $_.FullName -notlike "*\.git\*"
}

# Create ZIP using Compress-Archive (compatible with PowerShell 5.0+)
# Since we've already verified the package directory, we can safely compress it
Compress-Archive -Path "$packagePath\*" -DestinationPath $zipPath -Force

if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "✅ ZIP file created!" -ForegroundColor Green
    Write-Host "   Location: $zipPath" -ForegroundColor Gray
    Write-Host "   Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Gray
    
    # Final verification - check if ZIP contains any .pem files
    Write-Host ""
    Write-Host "🔍 Final verification of ZIP contents..." -ForegroundColor Yellow
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction SilentlyContinue
        $zipArchive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
        $pemInZip = $zipArchive.Entries | Where-Object { $_.Name -like "*.pem" }
        if ($pemInZip) {
            Write-Host "❌ ERROR: ZIP file still contains .pem files!" -ForegroundColor Red
            foreach ($entry in $pemInZip) {
                Write-Host "     - $($entry.FullName)" -ForegroundColor Red
            }
            $zipArchive.Dispose()
            Remove-Item $zipPath -Force
            Write-Host "   ZIP file removed. Please check the package directory." -ForegroundColor Yellow
            exit 1
        } else {
            Write-Host "✅ ZIP file verified - no .pem files found" -ForegroundColor Green
        }
        $zipArchive.Dispose()
    } catch {
        # If .NET compression API is not available, verify package directory instead
        $pemFiles = Get-ChildItem -Path $packagePath -Recurse -Filter "*.pem" -ErrorAction SilentlyContinue
        if ($pemFiles) {
            Write-Host "⚠️  WARNING: Could not verify ZIP, but found .pem files in package directory" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Package directory verified - no .pem files found" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ Error creating ZIP file!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Production package ready for Chrome Web Store!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review package contents in: $packagePath" -ForegroundColor White
Write-Host "   2. Test the ZIP file by loading it in Chrome (chrome://extensions)" -ForegroundColor White
Write-Host "   3. Follow CHROME_WEB_STORE_PUBLISHING.md guide" -ForegroundColor White
Write-Host ""

