@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo   DrawPhy - Local Launcher
echo ==========================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] First time run detected or dependencies missing.
    echo [INFO] Installing dependencies - this may take a minute...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Please check if Node.js is installed.
        pause
        exit /b %errorlevel%
    )
)

echo.
echo [INFO] Starting Development Server...
echo [INFO] The browser should open automatically.
echo [INFO] Press Ctrl+C in this window to stop the server.
echo.

REM Run the dev server and open default browser
call npm run dev -- --open

pause
