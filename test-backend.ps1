# Test favorites API endpoints

# Test if server is running
Write-Host "🔍 Testing if backend server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/menu" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start the backend server with: cd Backend && node server.js" -ForegroundColor Yellow
    exit 1
}

# Check if favorites endpoint exists
Write-Host ""
Write-Host "🔍 Testing favorites endpoints..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/favorites/ids" -Method Get -TimeoutSec 5
    Write-Host "⚠️ Favorites endpoint accessible but needs authentication" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Favorites endpoint exists (401 Unauthorized - need to login)" -ForegroundColor Green
    } else {
        Write-Host "❌ Favorites endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}