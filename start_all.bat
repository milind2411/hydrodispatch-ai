@echo off
echo ===================================================
echo Launching HydroDispatch AI Full Stack Application...
echo ===================================================
start "HydroDispatch AI - Backend (Port 8000)" cmd /k "cd /d "%~dp0" && call .\venv\Scripts\activate.bat && cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "HydroDispatch AI - Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo Both servers started!
echo - Backend:  http://127.0.0.1:8000 / http://localhost:8000/docs
echo - Frontend: http://localhost:5173
pause
