@echo off
setlocal
cd /d "%~dp0"
title Pixel Aquarium

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js is required. Install Node.js 18 or later from https://nodejs.org
    echo Then double-click this file again.
    pause
    exit /b 1
)

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo Windows PowerShell is required to open the game automatically.
    pause
    exit /b 1
)

if not exist "server.js" (
    echo Cannot find server.js. Extract the entire project before running this file.
    pause
    exit /b 1
)

rem Pick an available local port, launch Node, wait for HTTP, then open the browser.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-game.ps1"
if errorlevel 1 (
    echo.
    echo The game could not start. See the error above.
    pause
    exit /b 1
)
endlocal
