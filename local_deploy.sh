#!/bin/bash

# WebTools 本地部署脚本
# 用于在服务器本地直接部署项目（无需SSH）

# 配置变量
DEPLOY_PATH="/var/www/webtools"
SERVICE_PORT="8001"
SERVICE_NAME="webtools"
PUBLIC_IP="1.14.200.211"  # 公网IP地址
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查部署依赖..."
    
    # 检查Python3
    if command -v python3 >/dev/null 2>&1; then
        local python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
        log_success "Python3 已安装，版本: $python_version"
    else
        log_error "Python3 未安装，请先安装 Python3"
        return 1
    fi
    
    # 检查systemctl
    if command -v systemctl >/dev/null 2>&1; then
        log_success "systemctl 已安装"
    else
        log_error "systemctl 未安装，无法创建系统服务"
        return 1
    fi
    
    return 0
}

# 检查权限
check_permissions() {
    log_info "检查权限..."
    
    if [[ $EUID -eq 0 ]]; then
        log_success "以root用户运行"
        return 0
    elif sudo -n true 2>/dev/null; then
        log_success "当前用户有sudo权限"
        return 0
    else
        log_error "需要root权限或sudo权限来部署服务"
        log_info "请使用: sudo $0"
        return 1
    fi
}

# 创建部署目录
setup_deploy_directory() {
    log_info "设置部署目录..."
    
    # 创建部署目录
    if sudo mkdir -p "$DEPLOY_PATH"; then
        log_success "部署目录创建成功: $DEPLOY_PATH"
    else
        log_error "创建部署目录失败"
        return 1
    fi
    
    # 创建www-data用户（如果不存在）
    if ! id "www-data" &>/dev/null; then
        if sudo useradd -r -s /bin/false www-data; then
            log_success "用户 www-data 创建成功"
        else
            log_error "创建用户 www-data 失败"
            return 1
        fi
    else
        log_success "用户 www-data 已存在"
    fi
    
    return 0
}

# 复制文件
copy_files() {
    log_info "复制项目文件..."
    
    # 定义要排除的文件和目录
    local exclude_patterns=(
        ".git"
        ".trae"
        "__pycache__"
        "*.pyc"
        ".DS_Store"
        "Thumbs.db"
        "deploy_config.py"
        "deploy.py"
        "auto_deploy.sh"
        "local_deploy.sh"
    )
    
    # 构建rsync排除参数
    local exclude_args=()
    for pattern in "${exclude_patterns[@]}"; do
        exclude_args+=("--exclude=$pattern")
    done
    
    # 复制文件
    if sudo rsync -av "${exclude_args[@]}" "$PROJECT_ROOT/" "$DEPLOY_PATH/"; then
        log_success "文件复制成功"
    else
        log_error "文件复制失败"
        return 1
    fi
    
    # 设置文件权限
    if sudo chown -R www-data:www-data "$DEPLOY_PATH" && \
       sudo chmod -R 755 "$DEPLOY_PATH"; then
        log_success "文件权限设置成功"
        return 0
    else
        log_error "设置文件权限失败"
        return 1
    fi
}

# 安装Python依赖
install_python_dependencies() {
    log_info "检查Python依赖..."
    
    if [[ -f "$DEPLOY_PATH/requirements.txt" ]]; then
        # 检查requirements.txt内容
        if [[ -s "$DEPLOY_PATH/requirements.txt" ]]; then
            log_info "发现requirements.txt文件，尝试安装依赖..."
            
            # 尝试使用虚拟环境安装依赖
            if python3 -m venv "$DEPLOY_PATH/venv" 2>/dev/null && \
               source "$DEPLOY_PATH/venv/bin/activate" && \
               pip install -r "$DEPLOY_PATH/requirements.txt" 2>/dev/null; then
                log_success "Python依赖安装成功（使用虚拟环境）"
                # 更新服务文件以使用虚拟环境
                sudo sed -i "s|ExecStart=/usr/bin/python3|ExecStart=$DEPLOY_PATH/venv/bin/python3|" "/etc/systemd/system/$SERVICE_NAME.service"
                sudo systemctl daemon-reload
            else
                log_warning "Python依赖安装失败，使用系统Python运行"
                log_info "注意：当前项目使用简单的HTTP服务器，无需额外依赖即可运行"
            fi
        else
            log_info "requirements.txt文件为空，跳过依赖安装"
        fi
    else
        log_info "未找到requirements.txt文件，跳过依赖安装"
    fi
    
    return 0
}

# 创建systemd服务
create_systemd_service() {
    log_info "创建systemd服务..."
    
    local service_file="/etc/systemd/system/$SERVICE_NAME.service"
    
    sudo tee "$service_file" > /dev/null << EOF
[Unit]
Description=WebTools Application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/python3 $DEPLOY_PATH/backend/server.py
Restart=always
RestartSec=5
Environment=PYTHONPATH=$DEPLOY_PATH

[Install]
WantedBy=multi-user.target
EOF
    
    if [[ $? -eq 0 ]]; then
        log_success "systemd服务文件创建成功"
    else
        log_error "创建systemd服务文件失败"
        return 1
    fi
    
    # 重新加载systemd并启用服务
    if sudo systemctl daemon-reload && \
       sudo systemctl enable "$SERVICE_NAME"; then
        log_success "systemd服务启用成功"
        return 0
    else
        log_error "启用systemd服务失败"
        return 1
    fi
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    # 检查防火墙类型并配置
    if command -v ufw >/dev/null 2>&1; then
        # Ubuntu/Debian 使用 ufw
        if sudo ufw allow "$SERVICE_PORT/tcp" && \
           sudo ufw --force enable; then
            log_success "UFW防火墙配置成功，已开放端口 $SERVICE_PORT"
            return 0
        else
            log_warning "UFW防火墙配置失败，请手动开放端口 $SERVICE_PORT"
            return 0
        fi
    elif command -v firewall-cmd >/dev/null 2>&1; then
        # CentOS/RHEL 使用 firewalld
        if sudo firewall-cmd --permanent --add-port="$SERVICE_PORT/tcp" && \
           sudo firewall-cmd --reload; then
            log_success "Firewalld防火墙配置成功，已开放端口 $SERVICE_PORT"
            return 0
        else
            log_warning "Firewalld防火墙配置失败，请手动开放端口 $SERVICE_PORT"
            return 0
        fi
    else
        log_warning "未找到防火墙管理工具，请手动开放端口 $SERVICE_PORT"
        return 0
    fi
}

# 启动服务
start_service() {
    log_info "启动服务..."
    
    # 停止旧服务（如果存在）
    sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    
    # 启动新服务
    if sudo systemctl start "$SERVICE_NAME"; then
        sleep 3
        if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
            log_success "服务启动成功"
            
            # 显示访问地址
            log_success "应用已部署，访问地址: http://$PUBLIC_IP:$SERVICE_PORT"
            
            # 同时显示本地访问地址
            local local_ip=$(hostname -I | awk '{print $1}')
            if [[ -n "$local_ip" && "$local_ip" != "$PUBLIC_IP" ]]; then
                log_info "本地访问地址: http://$local_ip:$SERVICE_PORT"
            fi
            return 0
        else
            log_error "服务启动失败"
            log_info "查看服务状态: sudo systemctl status $SERVICE_NAME"
            log_info "查看服务日志: sudo journalctl -u $SERVICE_NAME -f"
            return 1
        fi
    else
        log_error "服务启动失败"
        return 1
    fi
}

# 显示帮助信息
show_help() {
    echo "WebTools 本地部署脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -s, --status   查看服务状态"
    echo "  -r, --restart  重启服务"
    echo "  -t, --stop     停止服务"
    echo ""
    echo "部署前请确保:"
    echo "1. 当前用户有sudo权限或以root用户运行"
    echo "2. 系统已安装Python3"
    echo "3. 系统支持systemd服务管理"
    echo ""
    echo "配置信息:"
    echo "  部署路径: $DEPLOY_PATH"
    echo "  服务端口: $SERVICE_PORT"
    echo "  服务名称: $SERVICE_NAME"
}

# 查看服务状态
show_status() {
    log_info "查看服务状态..."
    sudo systemctl status "$SERVICE_NAME"
}

# 重启服务
restart_service() {
    log_info "重启服务..."
    if sudo systemctl restart "$SERVICE_NAME"; then
        log_success "服务重启成功"
        show_status
    else
        log_error "服务重启失败"
        return 1
    fi
}

# 停止服务
stop_service() {
    log_info "停止服务..."
    if sudo systemctl stop "$SERVICE_NAME"; then
        log_success "服务已停止"
    else
        log_error "停止服务失败"
        return 1
    fi
}

# 主部署函数
deploy() {
    echo "==========================================="
    echo "       WebTools 本地部署脚本"
    echo "==========================================="
    echo "部署路径: $DEPLOY_PATH"
    echo "服务端口: $SERVICE_PORT"
    echo "服务名称: $SERVICE_NAME"
    echo "==========================================="
    echo ""
    
    local steps=(
        "check_dependencies:检查依赖"
        "check_permissions:检查权限"
        "setup_deploy_directory:设置部署目录"
        "copy_files:复制文件"
        "install_python_dependencies:安装Python依赖"
        "create_systemd_service:创建系统服务"
        "setup_firewall:配置防火墙"
        "start_service:启动服务"
    )
    
    for step in "${steps[@]}"; do
        local func_name="${step%%:*}"
        local step_name="${step##*:}"
        
        echo ""
        log_info "[$step_name]"
        if ! $func_name; then
            echo ""
            log_error "部署失败，在步骤 '$step_name' 出错"
            exit 1
        fi
    done
    
    echo ""
    echo "==========================================="
    log_success "🎉 本地部署成功完成！"
    echo "==========================================="
    echo ""
    log_info "服务管理命令:"
    echo "  查看状态: $0 --status"
    echo "  重启服务: $0 --restart"
    echo "  停止服务: $0 --stop"
    echo "  查看日志: sudo journalctl -u $SERVICE_NAME -f"
}

# 解析命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -s|--status)
        show_status
        exit $?
        ;;
    -r|--restart)
        restart_service
        exit $?
        ;;
    -t|--stop)
        stop_service
        exit $?
        ;;
    "")
        deploy
        ;;
    *)
        log_error "未知选项: $1"
        show_help
        exit 1
        ;;
esac