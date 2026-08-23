@echo off
echo ===================================================
echo Starting HydroDispatch AI - FastAPI Backend (Port 8000)
echo ===================================================
cd /d "%~dp0"
call .\venv\Scripts\activate.bat
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
