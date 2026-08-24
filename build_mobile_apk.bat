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
    echo [NOTE] If Gradle build requires Android SDK, you can also open Android Studio directly:
    echo        Run 'npm run mobile:open' inside the 'frontend' folder.
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
