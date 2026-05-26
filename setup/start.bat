@echo off

:: ──────────────────────────────────────────────
:: CogLens — Start Dev Server
:: ──────────────────────────────────────────────

cls
echo.
echo   ┌─────────────────────────────────────────┐
echo   │                                         │
echo   │   CogLens  —  Development Server        │
echo   │   http://localhost:3000                  │
echo   │                                         │
echo   │   Press Ctrl+C to stop                  │
echo   │                                         │
echo   └─────────────────────────────────────────┘
echo.

:: Navigate to project root
cd /d "%~dp0.."

:: Check if node_modules exists
if not exist "node_modules" (
    echo   [WARN] node_modules not found. Running install first...
    echo.
    call npm install
    echo.
)

:: Start the dev server
call npm run dev
