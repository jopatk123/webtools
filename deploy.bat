@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM WebTools Windows 部署脚本
REM 用于在Windows环境下部署到Linux服务器

REM 配置变量
set SERVER_HOST=1.14.200.211
set SERVER_USER=root
set DEPLOY_PATH=/var/www/webtools
set SERVICE_PORT=8001
set SERVICE_NAME=webtools
set PROJECT_ROOT=%~dp0

REM 颜色定义（Windows 10及以上支持）
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo ==========================================
echo        WebTools Windows 部署脚本
echo ==========================================
echo 目标服务器: %SERVER_HOST%
echo 部署路径: %DEPLOY_PATH%
echo 服务端口: %SERVICE_PORT%
echo ==========================================
echo.

REM 检查参数
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help
if "%1"=="--test" goto :test_only
if "%1"=="-t" goto :test_only

REM 检查依赖
echo %BLUE%[检查依赖]%NC%
call :check_dependencies
if errorlevel 1 goto :error

REM 测试SSH连接
echo.
echo %BLUE%[测试SSH连接]%NC%
call :test_ssh_connection
if errorlevel 1 goto :error

REM 使用Python部署脚本
echo.
echo %BLUE%[执行Python部署脚本]%NC%
if exist "%PROJECT_ROOT%deploy.py" (
    python "%PROJECT_ROOT%deploy.py"
    if errorlevel 1 (
        echo %RED%Python部署脚本执行失败%NC%
        goto :error
    )
) else (
    echo %RED%未找到deploy.py文件%NC%
    goto :error
)

echo.
echo ==========================================
echo %GREEN%🎉 部署成功完成！%NC%
echo ==========================================
echo.
echo %BLUE%访问地址: http://%SERVER_HOST%:%SERVICE_PORT%%NC%
echo.
echo 服务管理命令:
echo   启动服务: sudo systemctl start %SERVICE_NAME%
echo   停止服务: sudo systemctl stop %SERVICE_NAME%
echo   重启服务: sudo systemctl restart %SERVICE_NAME%
echo   查看状态: sudo systemctl status %SERVICE_NAME%
echo   查看日志: sudo journalctl -u %SERVICE_NAME% -f
goto :end

:check_dependencies
echo 检查部署依赖...

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo %RED%✗ Python 未安装，请先安装 Python%NC%
    exit /b 1
) else (
    echo %GREEN%✓ Python 已安装%NC%
)

REM 检查SSH客户端（Windows 10 1809+自带）
ssh -V >nul 2>&1
if errorlevel 1 (
    echo %RED%✗ SSH 客户端未安装%NC%
    echo 请安装 OpenSSH 客户端或使用 Git Bash
    exit /b 1
) else (
    echo %GREEN%✓ SSH 客户端已安装%NC%
)

REM 检查SCP（通常与SSH一起安装）
scp >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%⚠ SCP 可能未正确安装%NC%
) else (
    echo %GREEN%✓ SCP 已安装%NC%
)

exit /b 0

:test_ssh_connection
echo 测试SSH连接...
ssh -o ConnectTimeout=10 -o BatchMode=yes %SERVER_USER%@%SERVER_HOST% exit >nul 2>&1
if errorlevel 1 (
    echo %RED%✗ SSH连接失败，请检查:%NC%
    echo   1. 服务器地址是否正确: %SERVER_HOST%
    echo   2. 用户名是否正确: %SERVER_USER%
    echo   3. SSH密钥是否已配置
    echo   4. 服务器SSH服务是否正常
    exit /b 1
) else (
    echo %GREEN%✓ SSH连接测试成功%NC%
)
exit /b 0

:test_only
echo %BLUE%测试模式：仅测试SSH连接%NC%
call :check_dependencies
if errorlevel 1 goto :error
call :test_ssh_connection
if errorlevel 1 goto :error
echo %GREEN%测试完成%NC%
goto :end

:show_help
echo WebTools Windows 部署脚本
echo 用法: %0 [选项]
echo.
echo 选项:
echo   -h, --help     显示此帮助信息
echo   -t, --test     仅测试SSH连接
echo.
echo 部署前请确保:
echo 1. 已配置SSH密钥认证到目标服务器
echo 2. 目标服务器已安装Python3
echo 3. 当前用户有sudo权限
echo 4. 已安装Python和SSH客户端
echo.
echo 配置信息:
echo   服务器: %SERVER_HOST%
echo   用户: %SERVER_USER%
echo   部署路径: %DEPLOY_PATH%
echo   服务端口: %SERVICE_PORT%
goto :end

:error
echo.
echo %RED%❌ 部署失败%NC%
exit /b 1

:end
pause