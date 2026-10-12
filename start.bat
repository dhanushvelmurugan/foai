@echo off
title InterviewSense AI - Local Web Server
echo ========================================================
echo   Starting InterviewSense AI Local Web Server...
echo ========================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
