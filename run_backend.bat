@echo off
echo ============================================
echo   MAITRI Backend - FastAPI Server
echo ============================================
echo.
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
echo Starting uvicorn on http://localhost:8000 ...
uvicorn main:app --reload
