# WebTools 部署指南

本文档详细介绍如何将 WebTools 项目部署到服务器，包括 GitHub Actions 自动部署和手动部署两种方式。

## 目录
- [服务器准备](#服务器准备)
- [GitHub Actions 自动部署](#github-actions-自动部署)
- [本地脚本部署](#本地脚本部署)
- [手动部署](#手动部署)
- [部署后管理](#部署后管理)
- [故障排除](#故障排除)

## 服务器准备

### 系统要求
- Linux 系统（Ubuntu 18.04+, CentOS 7+, Debian 9+）
- Python 3.6+
- 至少 512MB 内存
- 至少 1GB 磁盘空间

### 服务器初始化

1. **运行服务器配置脚本**
```bash
# 下载并运行服务器配置脚本
wget https://raw.githubusercontent.com/your-username/webtools/main/server_setup.sh
chmod +x server_setup.sh
sudo ./server_setup.sh
```

2. **手动配置（如果不使用脚本）**
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# 或
sudo yum update -y  # CentOS/RHEL

# 安装 Python3
sudo apt install python3 python3-pip -y  # Ubuntu/Debian
# 或
sudo yum install python3 python3-pip -y  # CentOS/RHEL

# 创建应用用户和目录
sudo useradd -r -s /bin/false www-data
sudo mkdir -p /var/www/webtools
sudo chown www-data:www-data /var/www/webtools

# 配置防火墙
sudo ufw allow 8001/tcp  # Ubuntu/Debian
# 或
sudo firewall-cmd --permanent --add-port=8001/tcp  # CentOS/RHEL
sudo firewall-cmd --reload
```

## GitHub Actions 自动部署

### 1. 配置 SSH 密钥

在服务器上生成 SSH 密钥对：
```bash
# 在服务器上生成密钥对
ssh-keygen -t rsa -b 4096 -C "webtools-deploy"

# 将公钥添加到授权文件
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 显示私钥（用于 GitHub Secrets）
cat ~/.ssh/id_rsa
```

### 2. 配置 GitHub Secrets

在 GitHub 仓库中设置以下 Secrets（Settings > Secrets and variables > Actions）：

| Secret 名称 | 描述 | 示例值 |
|------------|------|--------|
| `SSH_PRIVATE_KEY` | 服务器 SSH 私钥 | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `SERVER_HOST` | 服务器 IP 地址 | `1.14.200.211` |
| `SERVER_USER` | 服务器用户名 | `root` 或 `ubuntu` |
| `DEPLOY_PATH` | 部署路径 | `/var/www/webtools` |
| `SERVICE_NAME` | 服务名称 | `webtools` |
| `SERVICE_PORT` | 服务端口 | `8001` |

### 3. 触发部署

部署会在以下情况自动触发：
- 推送代码到 `main` 或 `master` 分支
- 在 GitHub Actions 页面手动触发

### 4. 监控部署

在 GitHub 仓库的 Actions 页面可以查看部署进度和日志。

## 本地脚本部署

### Windows 用户

1. **配置部署参数**
   编辑 `deploy_config.py` 文件，设置服务器信息：
   ```python
   SERVER_HOST = "1.14.200.211"
   SERVER_USER = "root"
   DEPLOY_PATH = "/var/www/webtools"
   ```

2. **运行部署脚本**
   ```cmd
   deploy.bat
   ```

### Linux/Mac 用户

1. **配置部署参数**
   编辑 `auto_deploy.sh` 文件，设置服务器信息：
   ```bash
   SERVER_HOST="1.14.200.211"
   SERVER_USER="root"
   DEPLOY_PATH="/var/www/webtools"
   ```

2. **运行部署脚本**
   ```bash
   chmod +x auto_deploy.sh
   ./auto_deploy.sh
   ```

## 手动部署

### 1. 克隆项目
```bash
# 在服务器上克隆项目
git clone https://github.com/your-username/webtools.git /var/www/webtools
cd /var/www/webtools
```

### 2. 安装依赖
```bash
# 安装 Python 依赖（如果有）
pip3 install -r requirements.txt
```

### 3. 创建 systemd 服务
```bash
# 创建服务文件
sudo tee /etc/systemd/system/webtools.service > /dev/null <<EOF
[Unit]
Description=WebTools Application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/webtools
ExecStart=/usr/bin/python3 /var/www/webtools/backend/server.py
Restart=always
RestartSec=5
Environment=PYTHONPATH=/var/www/webtools

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable webtools
sudo systemctl start webtools
```

### 4. 配置 Nginx（可选）
```bash
# 安装 Nginx
sudo apt install nginx -y  # Ubuntu/Debian
# 或
sudo yum install nginx -y  # CentOS/RHEL

# 创建 Nginx 配置
sudo tee /etc/nginx/sites-available/webtools > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP
    
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/webtools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 部署后管理

### 服务管理
```bash
# 查看服务状态
sudo systemctl status webtools

# 重启服务
sudo systemctl restart webtools

# 停止服务
sudo systemctl stop webtools

# 查看服务日志
sudo journalctl -u webtools -f
```

### 更新应用
```bash
# 拉取最新代码
cd /var/www/webtools
git pull origin main

# 重启服务
sudo systemctl restart webtools
```

### 备份
```bash
# 备份应用目录
sudo tar -czf /backup/webtools-$(date +%Y%m%d).tar.gz /var/www/webtools
```

## 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查服务状态和日志
   sudo systemctl status webtools
   sudo journalctl -u webtools -n 50
   
   # 检查端口占用
   sudo netstat -tlnp | grep 8001
   ```

2. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R www-data:www-data /var/www/webtools
   sudo chmod -R 755 /var/www/webtools
   ```

3. **防火墙问题**
   ```bash
   # 检查防火墙状态
   sudo ufw status  # Ubuntu/Debian
   sudo firewall-cmd --list-all  # CentOS/RHEL
   
   # 开放端口
   sudo ufw allow 8001/tcp
   ```

4. **Python 依赖问题**
   ```bash
   # 检查 Python 版本
   python3 --version
   
   # 重新安装依赖
   pip3 install -r requirements.txt --force-reinstall
   ```

### 日志位置
- 系统服务日志：`sudo journalctl -u webtools`
- Nginx 日志：`/var/log/nginx/access.log` 和 `/var/log/nginx/error.log`
- 应用日志：根据应用配置

### 性能监控
```bash
# 查看系统资源使用
top
htop

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看网络连接
ss -tlnp
```

## 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **配置防火墙**
   ```bash
   # 只开放必要端口
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 8001/tcp
   sudo ufw enable
   ```

3. **使用 HTTPS**
   - 配置 SSL 证书（Let's Encrypt 推荐）
   - 强制 HTTPS 重定向

4. **定期备份**
   - 设置自动备份脚本
   - 定期测试备份恢复

## 联系支持

如果遇到部署问题，请：
1. 查看本文档的故障排除部分
2. 检查 GitHub Issues
3. 提交新的 Issue 并附上详细的错误信息和日志