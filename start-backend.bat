@echo off
title TKR Dental - Backend Server & Doctor/Admin Portal
color 0B
echo ========================================================
echo   TKR DENTAL CARE - BACKEND & DOCTOR/ADMIN WEB PORTAL
echo   Running on Central Server (Port 5000)
echo ========================================================
echo.
cd /d "%~dp0backend"
echo Starting Doctor & Admin Web Portal on http://localhost:5000 ...
start "" http://localhost:5000
npm start
pause
