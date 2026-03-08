param(
    [string]$TaskId,
    [string]$BacklogPath = "docs/agent/BACKLOG.md",
    [string]$WorklogPath = "docs/agent/WORKLOG.md",
    [string]$RunbookPath = "docs/agent/RUNBOOK.md",
    [string]$ProductIntentPath = "docs/agent/PRODUCT_INTENT.md",
    [string]$GuardrailsPath = "docs/agent/GUARDRAILS.md",
    [string]$PromptOutputPath = "docs/agent/LAST_PROMPT.md",
    [switch]$PrepareOnly
)

$ErrorActionPreference = "Stop"

function Resolve-RepoPath {
    param([string]$Path)
    return Join-Path (Get-Location) $Path
}

function Get-Task {
    param([string]$ChosenTaskId)

    $scriptPath = Resolve-Path (Join-Path (Get-Location) "scripts/agent-next-task.ps1")
    $args = @{
        BacklogPath = $BacklogPath
        AsJson = $true
    }
    if ($ChosenTaskId) {
        $args.TaskId = $ChosenTaskId
    }

    $json = & $scriptPath @args
    return $json | ConvertFrom-Json
}

function Set-TaskStatus {
    param(
        [string]$Path,
        [string]$SelectedTaskId,
        [string]$NewStatus
    )

    $resolved = Resolve-RepoPath $Path
    $content = Get-Content $resolved -Raw
    $pattern = "(?ms)(^##\s+$([regex]::Escape($SelectedTaskId))\s*\r?\n.*?^status:\s*)(.+?)$"
    $updated = [regex]::Replace($content, $pattern, "`$1$NewStatus", 1)
    if ($updated -eq $content) {
        throw "Failed to update task status for $SelectedTaskId"
    }
    Set-Content -Path $resolved -Value $updated
}

function Append-Worklog {
    param(
        [string]$Path,
        [string]$Task,
        [string]$Status,
        [string]$Notes
    )

    $resolved = Resolve-RepoPath $Path
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = @"

## $Task - $timestamp
- loop_status: $Status
- notes: $Notes
"@
    Add-Content -Path $resolved -Value $entry
}

$task = Get-Task -ChosenTaskId $TaskId
$promptParts = @(
    "# Agent Loop Prompt",
    "",
    "## Runbook",
    (Get-Content (Resolve-RepoPath $RunbookPath) -Raw),
    "",
    "## Product Intent",
    (Get-Content (Resolve-RepoPath $ProductIntentPath) -Raw),
    "",
    "## Guardrails",
    (Get-Content (Resolve-RepoPath $GuardrailsPath) -Raw),
    "",
    "## Selected Task",
    $task.raw_block,
    "",
    "## Required Checks",
    "- Run scripts/agent-review.ps1 after changes",
    "- Update docs/agent/WORKLOG.md",
    "- Move the task to done, review_needed, or blocked"
)

$prompt = $promptParts -join "`n"
Set-Content -Path (Resolve-RepoPath $PromptOutputPath) -Value $prompt

if ($PrepareOnly) {
    Write-Host "Prepared prompt at $PromptOutputPath for task $($task.task_id)"
    exit 0
}

Set-TaskStatus -Path $BacklogPath -SelectedTaskId $task.task_id -NewStatus "in_progress"
Append-Worklog -Path $WorklogPath -Task $task.task_id -Status "prepared" -Notes "Prepared loop prompt at $PromptOutputPath. Execute the agent manually, then run scripts/agent-review.ps1 and update the task outcome."
Write-Host "Task $($task.task_id) set to in_progress."
Write-Host "Prompt written to $PromptOutputPath"
Write-Host "Next step:"
Write-Host "1. Run the coding agent with the prompt file."
Write-Host "2. Run scripts/agent-review.ps1."
Write-Host "3. Update backlog status to done, review_needed, or blocked."
