@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo.
echo 启动本地服务器...
echo.

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python 未安装，请先安装。
    pause
    exit /b
)

echo 服务器正在启动...
echo 请在浏览器中打开 http://localhost:8000
echo.

python -m http.server 8000