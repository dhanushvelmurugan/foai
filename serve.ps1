# serve.ps1 - Zero-Dependency Native PowerShell Local Web Server
# Serves static files via .NET HttpListener and launches browser

$port = 8080
$prefix = "http://localhost:$port/"
$folder = $PSScriptRoot

if (-not $folder) {
    $folder = Get-Location
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "[!] Port $port is already in use or requires elevation. Trying port 8081..." -ForegroundColor Yellow
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  InterviewSense AI - Symbolic AI Interview Assistant" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  URL: $prefix" -ForegroundColor Green
Write-Host "  Serving from: $folder" -ForegroundColor Gray
Write-Host "  (Press Ctrl+C to terminate the local server)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Launch user's default browser
Start-Process $prefix

$mimeTypes = @{
    ".html" = "text/html"
    ".htm"  = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or [string]::IsNullOrEmpty($path)) {
            $path = "/index.html"
        }

        # Normalize relative path to local directory
        $relPath = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $folder $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $mime = $mimeTypes[$ext]
            }

            $response.ContentType = $mime
            $response.Headers.Add("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Loop continues or exits on interrupt
    }
}
