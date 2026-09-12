@echo off
title TKR Dental - Unified System Launcher
color 0E
echo ========================================================
echo   TKR DENTAL CARE - UNIFIED DENTAL MANAGEMENT SYSTEM
echo   1. Backend Server + Doctor/Admin Web Portal (Port 5000)
echo   2. Dedicated Patient Mobile App (Expo SDK 57)
echo ========================================================
echo.
echo Launching Doctor & Admin Web Portal and Central Backend Server...
start "TKR Backend & Doctor Portal" cmd /k "call \"%~dp0start-backend.bat\""

timeout /t 2 /nobreak >nul

echo Launching Dedicated Patient Mobile App (Frontend)...
start "TKR Frontend Patient App (Expo)" cmd /k "call \"%~dp0start-frontend.bat\""

echo.
echo Both systems launched!
echo - Doctor & Admin Portal: http://localhost:5000
echo - Patient App: Expo Terminal (Scan QR with Expo Go or press 'w')
echo.
pause
