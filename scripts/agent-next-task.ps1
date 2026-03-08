param(
    [string]$BacklogPath = "docs/agent/BACKLOG.md",
    [string]$TaskId,
    [switch]$AsJson
)

$resolvedBacklog = Join-Path (Get-Location) $BacklogPath
if (-not (Test-Path $resolvedBacklog)) {
    throw "Backlog not found: $resolvedBacklog"
}

$content = Get-Content $resolvedBacklog -Raw
$matches = [regex]::Matches($content, '(?ms)^##\s+(T-\d+)\s*\r?\n(.*?)(?=^##\s+T-\d+|\z)')

$tasks = foreach ($match in $matches) {
    $id = $match.Groups[1].Value.Trim()
    $body = $match.Groups[2].Value

    $status = ([regex]::Match($body, '(?m)^status:\s*(.+)$')).Groups[1].Value.Trim()
    $risk = ([regex]::Match($body, '(?m)^risk_level:\s*(.+)$')).Groups[1].Value.Trim()
    $goal = ([regex]::Match($body, '(?m)^goal:\s*(.+)$')).Groups[1].Value.Trim()
    $files = ([regex]::Match($body, '(?m)^files:\s*(.+)$')).Groups[1].Value.Trim()

    [pscustomobject]@{
        task_id = $id
        status = $status
        risk_level = $risk
        goal = $goal
        files = $files
        raw_block = $match.Value.Trim()
    }
}

if (-not $tasks) {
    throw "No tasks found in backlog."
}

$selected = if ($TaskId) {
    $tasks | Where-Object { $_.task_id -eq $TaskId } | Select-Object -First 1
} else {
    $tasks | Where-Object { $_.status -eq 'ready' } | Select-Object -First 1
}

if (-not $selected) {
    throw "No matching task found."
}

if ($AsJson) {
    $selected | ConvertTo-Json -Depth 4
} else {
    $selected
}
