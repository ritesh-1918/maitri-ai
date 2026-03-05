@echo off
echo Starting MAITRI Backend...
call venv\Scripts\activate.bat
uvicorn main:app --reload
