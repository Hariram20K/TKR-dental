@echo off
title TKR Dental - Frontend Patient Mobile App
color 0A
echo ========================================================
echo   TKR DENTAL CARE - PATIENT MOBILE APP (EXPO SDK 57)
echo   "Healthy Smiles, Happier Lives"
echo ========================================================
echo.
cd /d "%~dp0frontend"
echo Starting Frontend Expo Development Server...
echo Press 'w' in terminal to open Web Browser
echo Press 'a' for Android Emulator / Phone
echo Scan the QR code with Expo Go on your phone!
echo.
call npx expo start -c
pause
