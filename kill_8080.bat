@echo off
echo Looking for process on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do taskkill /f /pid %%a
echo Done. Please try running the project again.
pause
