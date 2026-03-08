param(
    [string[]]$Files
)

$ErrorActionPreference = "Stop"

function Get-InlineScriptsFromHtml {
    param([string]$Path)

    $content = Get-Content $Path -Raw
    $matches = [regex]::Matches($content, '<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>')
    return $matches | ForEach-Object { $_.Groups[1].Value }
}

function Test-NodeAvailable {
    return $null -ne (Get-Command node -ErrorAction SilentlyContinue)
}

function Test-IdReferences {
    param(
        [string]$Root,
        [string[]]$TargetFiles
    )

    $jsFiles = foreach ($path in $TargetFiles) {
        if ($path -match '\.js$') {
            $resolved = Join-Path $Root $path
            if (Test-Path $resolved) { Get-Item $resolved }
        }
    }
    $repoFiles = Get-ChildItem -Path $Root -Recurse -Include *.js,*.html -File
    $allContent = ($repoFiles | ForEach-Object { Get-Content $_.FullName -Raw }) -join "`n"
    $missing = @()

    foreach ($file in $jsFiles) {
        $content = Get-Content $file.FullName -Raw
        $matches = [regex]::Matches($content, "getElementById\('([^'$`]+)'\)")
        foreach ($match in $matches) {
            $id = $match.Groups[1].Value
            $hasStaticId = $allContent -match [regex]::Escape("id=`"$id`"") -or $allContent -match [regex]::Escape("id='$id'")
            $hasDynamicIdAssignment = $allContent -match [regex]::Escape(".id = '$id'") -or $allContent -match [regex]::Escape(".id = `"$id`"")
            if (-not $hasStaticId -and -not $hasDynamicIdAssignment) {
                $missing += [pscustomobject]@{
                    file = $file.FullName
                    id = $id
                }
            }
        }
    }

    return $missing
}

$repoRoot = Get-Location
if (-not $Files -or $Files.Count -eq 0) {
    $Files = git diff --name-only | Where-Object { $_ -match '\.(js|html|css|md)$' }
}

$Files = $Files |
    ForEach-Object { $_ -split ',' } |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ } |
    Select-Object -Unique

if (-not $Files) {
    Write-Host "No changed files detected for review."
    exit 0
}

$jsFiles = $Files | Where-Object { $_ -match '\.js$' }
$htmlFiles = $Files | Where-Object { $_ -match '\.html$' }

if ($jsFiles -and -not (Test-NodeAvailable)) {
    throw "node is required for JS syntax checks."
}

foreach ($file in $jsFiles) {
    Write-Host "node --check $file"
    node --check $file
    if ($LASTEXITCODE -ne 0) {
        throw "JS syntax check failed: $file"
    }
}

foreach ($file in $htmlFiles) {
    $scripts = Get-InlineScriptsFromHtml -Path $file
    if (-not $scripts) { continue }

    $index = 0
    foreach ($script in $scripts) {
        $tempPath = Join-Path $env:TEMP ("agent-inline-{0}-{1}.js" -f [IO.Path]::GetFileNameWithoutExtension($file), $index)
        Set-Content -Path $tempPath -Value $script
        Write-Host "node --check inline:$file#$index"
        node --check $tempPath
        if ($LASTEXITCODE -ne 0) {
            throw "Inline script syntax check failed: $file#$index"
        }
        $index += 1
    }
}

Write-Host "Selector and binding grep"
rg -n "getElementById|querySelector|data-mobile-view|data-mobile-section|onclick|addEventListener" app.js components index.html view.html
if ($LASTEXITCODE -ne 0) {
    throw "Selector grep failed."
}

$missingIds = Test-IdReferences -Root $repoRoot -TargetFiles $Files
if ($missingIds.Count -gt 0) {
    $summary = $missingIds | ForEach-Object { "$($_.file): missing id reference '$($_.id)'" }
    throw ("ID reference check failed:`n" + ($summary -join "`n"))
}

Write-Host "Review gate passed."
