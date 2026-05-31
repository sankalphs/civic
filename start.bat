@echo off
echo ========================================
echo  CivicBLR - Bangalore Civic Issue Resolver
echo ========================================
echo.

echo Starting backend server...
start /B cmd /C "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend dev server...
start /B cmd /C "cd /d %~dp0frontend && npx vite --port 5173"

echo.
echo ========================================
echo  Servers starting...
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo  Admin:    http://localhost:5173/admin
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo Servers stopped.
