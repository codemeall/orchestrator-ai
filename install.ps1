param()

$ErrorActionPreference = "Stop"

$Source = Join-Path $PSScriptRoot "skills\orchestrate-agents"
$SkillFile = Join-Path $Source "SKILL.md"
$ConfigDir = if ($env:CLAUDE_CONFIG_DIR) {
    $env:CLAUDE_CONFIG_DIR
} else {
    Join-Path $HOME ".claude"
}
$SkillsDir = Join-Path $ConfigDir "skills"
$Target = Join-Path $SkillsDir "orchestrate-agents"

if (-not (Test-Path -LiteralPath $SkillFile -PathType Leaf)) {
    throw "SKILL.md was not found at $SkillFile. Run this installer from a complete clone of the repository."
}

New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null

if (Test-Path -LiteralPath $Target) {
    $existing = Get-Item -LiteralPath $Target -Force
    if ($existing.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        $currentTarget = $existing.Target
        if ($currentTarget -is [array]) {
            $currentTarget = $currentTarget[0]
        }
        $resolvedCurrent = [System.IO.Path]::GetFullPath($currentTarget)
        $resolvedSource = [System.IO.Path]::GetFullPath($Source)
        if ($resolvedCurrent -eq $resolvedSource) {
            Write-Host "Orchestrate Agents is already installed at $Target"
            exit 0
        }
    }

    throw "$Target already exists and will not be overwritten. Remove or rename it deliberately before installing."
}

try {
    New-Item -ItemType SymbolicLink -Path $Target -Target $Source -ErrorAction Stop | Out-Null
    Write-Host "Installed Orchestrate Agents as a symbolic link at $Target"
} catch {
    Write-Warning "Windows did not permit a symbolic link. Installing a copy instead."
    Copy-Item -LiteralPath $Source -Destination $Target -Recurse
    Write-Host "Installed Orchestrate Agents as a directory copy at $Target"
}

Write-Host "Open Claude Code, run /skills, and search for orchestrate-agents."
