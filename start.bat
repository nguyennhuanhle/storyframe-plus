@echo off
REM Storyframe launcher — double-click this file to start the app.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
if %ERRORLEVEL% neq 0 (
  echo.
  echo Co loi xay ra. Doc thong bao ben tren.
  pause
)
