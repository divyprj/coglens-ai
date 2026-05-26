@echo off
setlocal

:: ──────────────────────────────────────────────
:: CogLens — Uninstall / Clean
:: ──────────────────────────────────────────────

cls
echo.
echo   ┌─────────────────────────────────────────┐
echo   │                                         │
echo   │   CogLens  —  Clean Project             │
echo   │                                         │
echo   │   This will remove:                     │
echo   │     - node_modules                      │
echo   │     - .next (build cache)               │
echo   │     - .env.local                        │
echo   │                                         │
echo   └─────────────────────────────────────────┘
echo.

set /p CONFIRM="   Are you sure? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo.
    echo   Cancelled. No files were removed.
    echo.
    pause
    exit /b 0
)

:: Navigate to project root
cd /d "%~dp0.."

echo.

:: Remove node_modules
if exist "node_modules" (
    echo   Removing node_modules...
    rmdir /s /q "node_modules"
    echo   Removed node_modules.
) else (
    echo   node_modules not found — skipping.
)

:: Remove .next build cache
if exist ".next" (
    echo   Removing .next build cache...
    rmdir /s /q ".next"
    echo   Removed .next.
) else (
    echo   .next not found — skipping.
)

:: Remove .env.local
if exist ".env.local" (
    echo   Removing .env.local...
    del /q ".env.local"
    echo   Removed .env.local.
) else (
    echo   .env.local not found — skipping.
)

echo.
echo   ┌─────────────────────────────────────────┐
echo   │                                         │
echo   │   Clean complete.                       │
echo   │                                         │
echo   │   To reinstall, run setup\install.bat   │
echo   │                                         │
echo   └─────────────────────────────────────────┘
echo.
pause
