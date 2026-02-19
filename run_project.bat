@echo off
echo Starting Task Management System...

:: Start Backend
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start Frontend
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Backend running on http://127.0.0.1:8000
echo Frontend running on http://localhost:5173
echo.
echo Press any key to exit this launcher (servers will keep running)...
pause
