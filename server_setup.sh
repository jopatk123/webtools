#!/bin/bash

# WebTools 服务器环境安装脚本
# 用于在Ubuntu/Debian服务器上安装必要的依赖

set -e  # 遇到错误立即退出

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        echo "请使用: sudo $0"
        exit 1
    fi
}

# 检测操作系统
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    
    log_info "检测到操作系统: $OS $VER"
}

# 更新系统包
update_system() {
    log_info "更新系统包..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt update && apt upgrade -y
        log_success "系统包更新完成"
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum update -y
        log_success "系统包更新完成"
    else
        log_warning "未知操作系统，跳过系统更新"
    fi
}

# 安装Python3
install_python() {
    log_info "安装Python3..."
    
    if command -v python3 >/dev/null 2>&1; then
        local python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
        log_success "Python3 已安装，版本: $python_version"
        return 0
    fi
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y python3 python3-pip python3-venv
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum install -y python3 python3-pip
    else
        log_error "不支持的操作系统: $OS"
        return 1
    fi
    
    if command -v python3 >/dev/null 2>&1; then
        log_success "Python3 安装成功"
    else
        log_error "Python3 安装失败"
        return 1
    fi
}

# 安装Nginx（可选）
install_nginx() {
    log_info "安装Nginx..."
    
    if command -v nginx >/dev/null 2>&1; then
        log_success "Nginx 已安装"
        return 0
    fi
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y nginx
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum install -y nginx
    else
        log_warning "不支持的操作系统，跳过Nginx安装"
        return 0
    fi
    
    # 启用并启动Nginx
    systemctl enable nginx
    systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        log_success "Nginx 安装并启动成功"
    else
        log_error "Nginx 启动失败"
        return 1
    fi
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw >/dev/null 2>&1; then
        # Ubuntu/Debian 使用 ufw
        ufw --force enable
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8001/tcp  # WebTools 应用端口
        log_success "UFW 防火墙配置完成"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        # CentOS/RHEL 使用 firewalld
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=8001/tcp
        firewall-cmd --reload
        log_success "Firewalld 防火墙配置完成"
    else
        log_warning "未找到防火墙管理工具，请手动配置防火墙"
    fi
}

# 创建应用用户
create_app_user() {
    log_info "创建应用用户..."
    
    if id "www-data" &>/dev/null; then
        log_success "用户 www-data 已存在"
    else
        useradd -r -s /bin/false www-data
        log_success "用户 www-data 创建成功"
    fi
}

# 创建应用目录
create_app_directory() {
    log_info "创建应用目录..."
    
    local app_dir="/var/www/webtools"
    
    if [[ -d "$app_dir" ]]; then
        log_warning "目录 $app_dir 已存在"
    else
        mkdir -p "$app_dir"
        log_success "目录 $app_dir 创建成功"
    fi
    
    chown -R www-data:www-data "$app_dir"
    chmod -R 755 "$app_dir"
    log_success "目录权限设置完成"
}

# 安装其他必要工具
install_tools() {
    log_info "安装其他必要工具..."
    
    local tools=("curl" "wget" "git" "unzip" "htop")
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y "${tools[@]}"
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum install -y "${tools[@]}"
    fi
    
    log_success "工具安装完成"
}

# 优化系统设置
optimize_system() {
    log_info "优化系统设置..."
    
    # 设置时区为中国标准时间
    timedatectl set-timezone Asia/Shanghai
    log_success "时区设置为 Asia/Shanghai"
    
    # 优化文件描述符限制
    echo "* soft nofile 65535" >> /etc/security/limits.conf
    echo "* hard nofile 65535" >> /etc/security/limits.conf
    log_success "文件描述符限制优化完成"
    
    # 启用BBR（如果内核支持）
    if [[ $(uname -r | cut -d. -f1) -ge 4 ]] && [[ $(uname -r | cut -d. -f2) -ge 9 ]]; then
        echo 'net.core.default_qdisc=fq' >> /etc/sysctl.conf
        echo 'net.ipv4.tcp_congestion_control=bbr' >> /etc/sysctl.conf
        sysctl -p
        log_success "BBR 拥塞控制算法已启用"
    fi
}

# 显示安装总结
show_summary() {
    echo ""
    echo "==========================================="
    log_success "🎉 服务器环境安装完成！"
    echo "==========================================="
    echo ""
    echo "已安装的组件:"
    echo "  ✓ Python3: $(python3 --version 2>&1 | cut -d' ' -f2)"
    
    if command -v nginx >/dev/null 2>&1; then
        echo "  ✓ Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"
    fi
    
    echo "  ✓ 防火墙已配置"
    echo "  ✓ 应用用户 www-data 已创建"
    echo "  ✓ 应用目录 /var/www/webtools 已创建"
    echo ""
    echo "下一步:"
    echo "1. 运行部署脚本将应用部署到服务器"
    echo "2. 如果安装了Nginx，可以配置反向代理"
    echo "3. 配置SSL证书（可选）"
    echo ""
    echo "有用的命令:"
    echo "  查看系统状态: systemctl status"
    echo "  查看防火墙状态: ufw status (Ubuntu) 或 firewall-cmd --list-all (CentOS)"
    echo "  查看Nginx状态: systemctl status nginx"
}

# 主函数
main() {
    echo "==========================================="
    echo "       WebTools 服务器环境安装脚本"
    echo "==========================================="
    echo ""
    
    check_root
    detect_os
    
    echo ""
    log_info "开始安装服务器环境..."
    echo ""
    
    update_system
    install_python
    install_tools
    create_app_user
    create_app_directory
    setup_firewall
    optimize_system
    
    # 询问是否安装Nginx
    echo ""
    read -p "是否安装Nginx作为反向代理？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_nginx
    else
        log_info "跳过Nginx安装"
    fi
    
    show_summary
}

# 显示帮助信息
show_help() {
    echo "WebTools 服务器环境安装脚本"
    echo "用法: sudo $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo ""
    echo "此脚本将安装:"
    echo "  - Python3 和 pip"
    echo "  - 必要的系统工具"
    echo "  - 配置防火墙"
    echo "  - 创建应用用户和目录"
    echo "  - 优化系统设置"
    echo "  - Nginx（可选）"
    echo ""
    echo "支持的操作系统:"
    echo "  - Ubuntu 18.04+"
    echo "  - Debian 9+"
    echo "  - CentOS 7+"
    echo "  - Red Hat Enterprise Linux 7+"
}

# 解析命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    "")
        main
        ;;
    *)
        log_error "未知选项: $1"
        show_help
        exit 1
        ;;
esac