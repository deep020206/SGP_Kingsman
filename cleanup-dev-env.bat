@echo off
echo 🧹 Development Environment Cleanup Script
echo ==========================================

echo 📍 Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️  No Node.js processes running
)

echo 📍 Stopping React development servers...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul

echo 📍 Closing VS Code instances (keeping current workspace)...
timeout 2 >nul

echo 📍 Cleaning temporary files...
del /s /q "%TEMP%\vscode-*" 2>nul
del /s /q "%APPDATA%\Code\logs\*" 2>nul

echo ✅ Cleanup completed!
echo 💡 Recommendation: Restart VS Code to refresh processes
pause
