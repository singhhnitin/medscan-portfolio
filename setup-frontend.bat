@echo off
echo Setting up MedScan Frontend...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
npm install

echo.
echo Frontend setup complete!
echo To start the frontend, run: start-frontend.bat
pause