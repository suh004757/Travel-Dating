param(
    [string]$BacklogPath = "docs/agent/BACKLOG.md",
    [string]$WorklogPath = "docs/agent/WORKLOG.md",
    [string]$PromptOutputPath = "docs/agent/LAST_PROMPT.md",
    [string]$StopFilePath = "docs/agent/STOP",
    [int]$IdleSeconds = 30,
    [int]$MaxIterations = 0,
    [int]$MaxIdleCycles = 0,
    [switch]$PrepareOnly,
    [switch]$LogHeartbeat
)

$ErrorActionPreference = "Stop"

function Resolve-RepoPath {
    param([string]$Path)
    return Join-Path (Get-Location) $Path
}

function Add-WorklogLine {
    param([string]$Message)

    $resolved = Resolve-RepoPath $WorklogPath
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $resolved -Value "`n## Daemon - $timestamp`n- $Message"
}

function Get-ReadyTaskJson {
    $scriptPath = Resolve-RepoPath "scripts/agent-next-task.ps1"
    try {
        return & $scriptPath -BacklogPath $BacklogPath -AsJson 2>$null
    } catch {
        return $null
    }
}

function Invoke-PrepareLoop {
    $scriptPath = Resolve-RepoPath "scripts/agent-loop.ps1"
    & $scriptPath -BacklogPath $BacklogPath -WorklogPath $WorklogPath -PromptOutputPath $PromptOutputPath -PrepareOnly
}

$resolvedStopFile = Resolve-RepoPath $StopFilePath
$iteration = 0
$idleCycles = 0

Write-Host "Agent daemon started."
Write-Host "Stop file: $resolvedStopFile"
Write-Host "Idle seconds: $IdleSeconds"
if ($MaxIterations -gt 0) {
    Write-Host "Max iterations: $MaxIterations"
} else {
    Write-Host "Max iterations: infinite"
}
if ($MaxIdleCycles -gt 0) {
    Write-Host "Max idle cycles: $MaxIdleCycles"
}

while ($true) {
    if (Test-Path $resolvedStopFile) {
        Write-Host "Stop file detected. Exiting daemon."
        Add-WorklogLine "daemon_status: stopped by stop file"
        break
    }

    if ($MaxIterations -gt 0 -and $iteration -ge $MaxIterations) {
        Write-Host "Reached max iterations. Exiting daemon."
        Add-WorklogLine "daemon_status: stopped after reaching max iterations ($MaxIterations)"
        break
    }

    $readyTaskJson = Get-ReadyTaskJson
    if (-not $readyTaskJson) {
        $idleCycles += 1
        if ($LogHeartbeat) {
            Add-WorklogLine "daemon_status: idle, no ready task found"
        }
        if ($MaxIdleCycles -gt 0 -and $idleCycles -ge $MaxIdleCycles) {
            Write-Host "Reached max idle cycles. Exiting daemon."
            Add-WorklogLine "daemon_status: stopped after reaching max idle cycles ($MaxIdleCycles)"
            break
        }
        Write-Host "No ready task. Sleeping for $IdleSeconds second(s)."
        Start-Sleep -Seconds $IdleSeconds
        continue
    }

    $task = $readyTaskJson | ConvertFrom-Json
    $iteration += 1
    $idleCycles = 0
    Write-Host "Preparing loop for $($task.task_id) (iteration $iteration)."

    try {
        Invoke-PrepareLoop
        if ($PrepareOnly) {
            Add-WorklogLine "daemon_status: prepared $($task.task_id) and paused for external agent execution"
            Write-Host "Prepared $($task.task_id). Waiting $IdleSeconds second(s) before next poll."
            Start-Sleep -Seconds $IdleSeconds
            continue
        }

        Add-WorklogLine "daemon_status: prepared $($task.task_id); external agent execution is still required"
        Write-Host "Prepared $($task.task_id). External agent execution is required before completion."
        Write-Host "Create $resolvedStopFile to stop the daemon."
        Start-Sleep -Seconds $IdleSeconds
    } catch {
        Add-WorklogLine "daemon_status: blocked while preparing $($task.task_id); error=$($_.Exception.Message)"
        throw
    }
}
