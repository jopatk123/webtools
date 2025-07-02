#!/bin/bash

# WebTools 自动部署脚本
# 用于将项目部署到Linux服务器

# 配置变量
SERVER_HOST="1.14.200.211"
SERVER_USER="root"  # 请根据实际情况修改
DEPLOY_PATH="/var/www/webtools"
SERVICE_PORT="8001"
SERVICE_NAME="webtools"
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
    
    # 检查rsync
    if command -v rsync >/dev/null 2>&1; then
        log_success "rsync 已安装"
    else
        log_error "rsync 未安装，请先安装 rsync"
        return 1
    fi
    
    # 检查ssh
    if command -v ssh >/dev/null 2>&1; then
        log_success "ssh 已安装"
    else
        log_error "ssh 未安装，请先安装 openssh"
        return 1
    fi
    
    return 0
}

# 测试SSH连接
test_ssh_connection() {
    log_info "测试SSH连接..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
        log_success "SSH连接测试成功"
        return 0
    else
        log_error "SSH连接失败，请检查:"
        echo "  1. 服务器地址是否正确: $SERVER_HOST"
        echo "  2. 用户名是否正确: $SERVER_USER"
        echo "  3. SSH密钥是否已配置"
        echo "  4. 服务器SSH服务是否正常"
        return 1
    fi
}

# 创建排除文件
create_exclude_file() {
    local exclude_file="/tmp/rsync_exclude_$$"
    cat > "$exclude_file" << EOF
.git
.trae
__pycache__
*.pyc
.DS_Store
Thumbs.db
deploy_config.py
deploy.py
auto_deploy.sh
EOF
    echo "$exclude_file"
}

# 同步文件
sync_files() {
    log_info "同步文件到服务器 $SERVER_HOST..."
    
    local exclude_file
    exclude_file=$(create_exclude_file)
    
    # 创建远程目录
    if ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $DEPLOY_PATH"; then
        log_success "远程目录创建成功"
    else
        log_error "创建远程目录失败"
        rm -f "$exclude_file"
        return 1
    fi
    
    # 同步文件
    if rsync -avz --delete --exclude-from="$exclude_file" "$PROJECT_ROOT/" "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/"; then
        log_success "文件同步成功"
        rm -f "$exclude_file"
        return 0
    else
        log_error "文件同步失败"
        rm -f "$exclude_file"
        return 1
    fi
}

# 创建systemd服务
create_systemd_service() {
    log_info "创建systemd服务..."
    
    local service_file="/tmp/${SERVICE_NAME}_$$.service"
    
    cat > "$service_file" << EOF
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
    
    # 上传服务文件并安装
    if scp "$service_file" "$SERVER_USER@$SERVER_HOST:/tmp/$SERVICE_NAME.service" && \
       ssh "$SERVER_USER@$SERVER_HOST" "
           sudo mv /tmp/$SERVICE_NAME.service /etc/systemd/system/ && \
           sudo systemctl daemon-reload && \
           sudo systemctl enable $SERVICE_NAME
       "; then
        log_success "systemd服务创建成功"
        rm -f "$service_file"
        return 0
    else
        log_error "创建systemd服务失败"
        rm -f "$service_file"
        return 1
    fi
}

# 安装Python依赖
install_dependencies() {
    log_info "检查Python环境..."
    
    if ssh "$SERVER_USER@$SERVER_HOST" "
        python3 --version && \
        echo 'Python3 已安装'
    "; then
        log_success "Python环境检查通过"
        return 0
    else
        log_error "Python3 未安装或版本不兼容"
        return 1
    fi
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    if ssh "$SERVER_USER@$SERVER_HOST" "
        sudo ufw allow $SERVICE_PORT/tcp && \
        sudo ufw --force enable
    "; then
        log_success "防火墙配置成功，已开放端口 $SERVICE_PORT"
        return 0
    else
        log_warning "防火墙配置失败，请手动开放端口 $SERVICE_PORT"
        return 0  # 不阻止部署继续
    fi
}

# 启动服务
start_service() {
    log_info "启动服务..."
    
    # 停止旧服务（如果存在）
    ssh "$SERVER_USER@$SERVER_HOST" "sudo systemctl stop $SERVICE_NAME 2>/dev/null || true"
    
    # 启动新服务
    if ssh "$SERVER_USER@$SERVER_HOST" "
        sudo systemctl start $SERVICE_NAME && \
        sleep 3 && \
        sudo systemctl status $SERVICE_NAME
    "; then
        log_success "服务启动成功"
        log_success "应用已部署，访问地址: http://$SERVER_HOST:$SERVICE_PORT"
        return 0
    else
        log_error "服务启动失败"
        log_info "查看服务日志: sudo journalctl -u $SERVICE_NAME -f"
        return 1
    fi
}

# 显示帮助信息
show_help() {
    echo "WebTools 自动部署脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -t, --test     仅测试SSH连接"
    echo "  -s, --sync     仅同步文件"
    echo ""
    echo "部署前请确保:"
    echo "1. 已配置SSH密钥认证到目标服务器"
    echo "2. 目标服务器已安装Python3"
    echo "3. 当前用户有sudo权限"
    echo "4. 已安装rsync和ssh客户端"
    echo ""
    echo "配置信息:"
    echo "  服务器: $SERVER_HOST"
    echo "  用户: $SERVER_USER"
    echo "  部署路径: $DEPLOY_PATH"
    echo "  服务端口: $SERVICE_PORT"
}

# 主部署函数
deploy() {
    echo "==========================================="
    echo "       WebTools 自动部署脚本"
    echo "==========================================="
    echo "目标服务器: $SERVER_HOST"
    echo "部署路径: $DEPLOY_PATH"
    echo "服务端口: $SERVICE_PORT"
    echo "==========================================="
    echo ""
    
    local steps=(
        "check_dependencies:检查依赖"
        "test_ssh_connection:测试SSH连接"
        "sync_files:同步文件"
        "install_dependencies:检查Python环境"
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
    log_success "🎉 部署成功完成！"
    echo "==========================================="
    echo ""
    log_info "访问地址: http://$SERVER_HOST:$SERVICE_PORT"
    log_info "服务管理命令:"
    echo "  启动服务: sudo systemctl start $SERVICE_NAME"
    echo "  停止服务: sudo systemctl stop $SERVICE_NAME"
    echo "  重启服务: sudo systemctl restart $SERVICE_NAME"
    echo "  查看状态: sudo systemctl status $SERVICE_NAME"
    echo "  查看日志: sudo journalctl -u $SERVICE_NAME -f"
}

# 解析命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -t|--test)
        log_info "测试模式：仅测试SSH连接"
        check_dependencies && test_ssh_connection
        exit $?
        ;;
    -s|--sync)
        log_info "同步模式：仅同步文件"
        check_dependencies && test_ssh_connection && sync_files
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