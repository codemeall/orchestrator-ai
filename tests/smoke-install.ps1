$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("orchestrator-ai-install-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Tmp | Out-Null

try {
    $env:CLAUDE_CONFIG_DIR = Join-Path $Tmp "claude-config"
    New-Item -ItemType Directory -Path $env:CLAUDE_CONFIG_DIR | Out-Null

    & (Join-Path $Root "install.ps1")

    $Target = Join-Path $env:CLAUDE_CONFIG_DIR "skills\orchestrate-agents"
    if (-not (Test-Path -LiteralPath (Join-Path $Target "SKILL.md"))) {
        throw "Installed skill is missing SKILL.md"
    }

    $item = Get-Item -LiteralPath $Target
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        Write-Host "Windows installer created a symbolic link."
    } else {
        Write-Host "Windows installer created a directory copy."
    }

    # Second install must either report idempotent success (symlink path) or
    # refuse the existing target (directory-copy fallback path).
    $secondOutput = ""
    $secondError = $null
    try {
        $secondOutput = (& (Join-Path $Root "install.ps1") *>&1 | Out-String)
    } catch {
        $secondError = $_.Exception.Message
    }
    if ($null -ne $secondError) {
        if ($secondError -notmatch "already exists") {
            throw "Second install failed unexpectedly: $secondError"
        }
        Write-Host "Second install correctly refused the existing target."
    } elseif ($secondOutput -match "already installed") {
        Write-Host "Second install reported idempotent success."
    } else {
        throw "Expected second install to refuse an existing target or report idempotent success. Output: $secondOutput"
    }

    Write-Host "Windows installer smoke test passed."
}
finally {
    Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
    Remove-Item Env:CLAUDE_CONFIG_DIR -ErrorAction SilentlyContinue
}
