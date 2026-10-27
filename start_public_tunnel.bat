@echo off
title Urban Mesh - Public Tunnel Launcher
echo ========================================================
echo        Urban Mesh - Smart Chandigarh Platform
echo ========================================================
echo.
echo Starting local server on port 3000...
start /b node server.js
timeout /t 2 >nul
echo.
echo Launching Cloudflare Public Tunnel...
echo Share the generated https://*.trycloudflare.com URL with judges!
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:3000
pause
