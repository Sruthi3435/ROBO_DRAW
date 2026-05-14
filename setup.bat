@echo off
REM RoboDraw Setup and Test Script for Windows
REM This script sets up the environment and tests the celebration popup

echo.
echo ========================================
echo  RoboDraw - Complete Workflow Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    where python3 >nul 2>nul
    if %errorlevel% neq 0 (
        echo ERROR: Python is not installed or not in PATH
        echo Please install Python from https://www.python.org/
        pause
        exit /b 1
    )
)

echo ✓ Node.js and Python found
echo.
echo Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo ✓ Node.js dependencies installed
echo.

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo WARNING: pip install failed, some features may not work
)

echo ✓ Python dependencies installed
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. START SERVER:
echo    Open a new terminal/cmd and run:
echo    node server.js
echo.
echo 2. TEST CELEBRATION POPUP:
echo    Open another terminal/cmd and run:
echo    node test-celebration.js
echo.
echo 3. OPEN BROWSER:
echo    Visit http://localhost:3003
echo.
echo 4. WATCH FOR THE POPUP:
echo    The celebration popup with confetti will appear
echo    when the workflow completes (after about 12 seconds)
echo.
echo ========================================
echo.
pause
