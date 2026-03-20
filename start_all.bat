@echo off
echo ========================================
echo Graph Search Visualization System Setup
echo ========================================
echo.

echo [1/3] Starting Python Backend...
start "Backend-API" cmd /k "C:/Users/joaom/AppData/Local/Python/pythoncore-3.14-64/python.exe api.py"
timeout /t 3 /nobreak

echo [2/3] Installing Frontend Dependencies...
cd frontend
call npm install
echo.

echo [3/3] Starting Frontend...
start "Frontend-React" cmd /k "npm run dev"
echo.

echo ========================================
echo System started!
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================
echo.
echo Press any key to exit...
pause
