@echo off
echo.
echo  ========================================
echo    CogLens - Setup
echo    Verify information with confidence.
echo  ========================================
echo.

:: Navigate to project root
cd /d "%~dp0.."

echo  [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo  [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo  [2/3] Creating environment file...
if not exist ".env.local" (
    copy .env.example .env.local > nul
    echo  Created .env.local from template.
    echo  Please add your API keys to .env.local:
    echo    - GROQ_API_KEY    (https://console.groq.com/keys)
    echo    - GEMINI_API_KEY  (optional fallback, https://aistudio.google.com/apikey)
    echo    - SERPER_API_KEY  (https://serper.dev)
) else (
    echo  .env.local already exists, skipping.
)

echo.
echo  [3/3] Setup complete!
echo.
echo  Next steps:
echo    1. Add API keys to .env.local
echo    2. Run: npm run dev
echo    3. Open: http://localhost:3000
echo.
pause
