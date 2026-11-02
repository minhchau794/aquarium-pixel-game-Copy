$ErrorActionPreference = 'Stop'
$server = $null
try {
    Set-Location -LiteralPath $PSScriptRoot
    $node = (Get-Command node -ErrorAction Stop).Source
    $major = [int]((& $node --version).TrimStart('v').Split('.')[0])
    if ($major -lt 18) { throw 'Install Node.js 18 or later, then try again.' }

    # Prefer a stable port to preserve browser saves; fall back if occupied.
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 5173)
    try { $listener.Start() } catch {
        $listener.Stop()
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
        $listener.Start()
    }
    $portNumber = $listener.LocalEndpoint.Port
    $listener.Stop()
    $address = "http://127.0.0.1:$portNumber/"
    $server = Start-Process -FilePath $node -ArgumentList @('server.js', '--host', '127.0.0.1', '--port', "$portNumber") -WorkingDirectory $PSScriptRoot -NoNewWindow -PassThru

    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        if ($server.HasExited) { throw "Game server exited with code $($server.ExitCode)." }
        try {
            $response = Invoke-WebRequest -Uri $address -UseBasicParsing -TimeoutSec 1
            if ($response.StatusCode -eq 200 -and $response.Content.Contains('id="aquarium"')) {
                $ready = $true
                break
            }
        } catch { }
        Start-Sleep -Milliseconds 200
    }
    if (-not $ready) { throw 'The game server did not become ready. Check firewall settings and try again.' }

    Write-Host "Game running at $address"
    Write-Host 'Keep this window open while playing.'
    Write-Host 'Save data is tied to the browser and port; using a new port starts a separate save.'
    Start-Process $address
    Read-Host 'Press Enter here to stop the game' | Out-Null
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    if ($null -ne $server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id -ErrorAction SilentlyContinue
    }
}
