@echo off
echo ===================================================
echo Launching HydroDispatch AI Full Stack Application...
echo ===================================================
start "HydroDispatch AI - Backend (Port 8000)" cmd /k "cd /d "%~dp0" && call .\venv\Scripts\activate.bat && cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start "HydroDispatch AI - Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo ===================================================
echo HydroDispatch AI Servers Running!
echo ===================================================
echo [Desktop] Frontend: http://localhost:5173
echo [Desktop] Backend:  http://127.0.0.1:8000 / http://localhost:8000/docs
echo [Mobile]  Frontend: http://172.20.10.4:5173
echo ===================================================
pause
