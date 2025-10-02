@echo off
echo ========================================
echo    MedScan Portfolio - Quick Launch
echo ========================================
echo.
echo Starting MedScan Portfolio Demo...
echo.
echo This will open your web browser with the interactive demo.
echo Press Ctrl+C to stop the demo when finished.
echo.
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.12 or higher
    pause
    exit /b 1
)

REM Install dependencies if needed
echo Installing/updating dependencies...
pip install -r requirements.txt

REM Launch Streamlit app
echo.
echo Launching MedScan Portfolio Web Interface...
echo.
echo Your portfolio will be available at:
echo   Local URL:   http://localhost:8501
echo   Network URL: http://YOUR_NETWORK_IP:8501
echo.
echo Share the Network URL with friends on the same network!
echo.
streamlit run streamlit_app.py

pause