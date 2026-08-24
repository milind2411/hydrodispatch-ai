@echo off
echo =======================================================
echo Opening HydroDispatch AI in Desktop Mobile Window Demo
echo =======================================================

:: Try Microsoft Edge App Window
start msedge --app="http://localhost:5173" --window-size=400,860
if %errorlevel% equ 0 goto done

:: Fallback to Google Chrome App Window
start chrome --app="http://localhost:5173" --window-size=400,860
if %errorlevel% equ 0 goto done

:: Fallback to Default Browser
start http://localhost:5173

:done
echo Mobile Simulator Window Opened!
