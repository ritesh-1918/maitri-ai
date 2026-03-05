@echo off
echo ============================================
echo   MAITRI - Full System Launcher
echo ============================================
echo.
echo Starting Backend...
start "MAITRI Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn main:app --reload"
echo Backend starting on http://localhost:8000
echo.
timeout /t 5 /nobreak >nul
echo Starting Frontend...
start "MAITRI Frontend" cmd /k "cd /d %~dp0frontend && npm start"
echo Frontend starting on http://localhost:3000
echo.
echo ============================================
echo   Both servers are launching!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo ============================================
