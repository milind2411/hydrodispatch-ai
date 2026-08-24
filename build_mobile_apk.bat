@echo off
echo =======================================================
echo Building HydroDispatch AI Native Android Mobile APK
echo =======================================================
cd /d "%~dp0frontend"

echo [1/3] Compiling production web bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Web build failed.
    pause
    exit /b %errorlevel%
)

echo [2/3] Syncing assets to native Android container...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b %errorlevel%
)

echo [3/3] Assembling Android APK package...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo.
    echo ===========================================================================
    echo [INFO] Android SDK is not detected in command line.
    echo To build the APK with 1 click:
    echo   1. Install Android Studio (free from developer.android.com/studio)
    echo   2. Run 'npm run mobile:open' in the 'frontend' folder, then click Build APK!
    echo.
    echo [INSTANT ALTERNATIVE] You can install this app directly on any phone right now
    echo                      without Android Studio by opening http://172.20.10.4:5173
    echo                      in your mobile browser and tapping 'Install App'!
    echo ===========================================================================
    pause
    exit /b %errorlevel%
)

if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "app\build\outputs\apk\debug\app-debug.apk" "%~dp0HydroDispatch-AI.apk"
    echo.
    echo =======================================================
    echo SUCCESS: Standalone Android APK Created!
    echo Location: %~dp0HydroDispatch-AI.apk
    echo Transfer this file to any Android phone to install!
    echo =======================================================
) else (
    echo APK generated in android/app/build/outputs/apk/debug/
)
pause
