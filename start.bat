@echo off
REM 切换到脚本所在目录
cd /d "%~dp0"

echo Starting server...
cd backend
start "Python Server" python server.py

echo Waiting for server to start...
timeout /t 2 /nobreak > nul

echo Opening browser...
start http://localhost:8000