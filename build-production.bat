@echo off
echo Building MedScan Frontend for Production...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if not already installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

:: Build for production
echo Creating production build...
npm run build

:: Check if build was successful
if exist "build" (
    echo.
    echo Production build created successfully!
    echo Build files are in the 'build' directory
    echo.
    echo To serve locally, you can use:
    echo   npx serve -s build -l 3000
    echo.
) else (
    echo.
    echo Build failed! Please check for errors above.
    echo.
)

pause