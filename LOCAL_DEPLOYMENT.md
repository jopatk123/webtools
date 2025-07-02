# WebTools 本地部署指南

当您的项目已经在目标服务器上时，可以使用本地部署脚本直接在服务器上完成部署，无需SSH连接。

## 使用场景

- 项目代码已经通过git clone或其他方式存在于服务器上
- 您有服务器的直接访问权限（SSH登录到服务器）
- 不需要从远程机器推送代码到服务器

## 快速开始

### 1. 准备工作

确保您已经登录到目标服务器，并且项目代码已经存在于服务器上。

### 2. 给脚本添加执行权限

```bash
chmod +x local_deploy.sh
```

### 3. 运行部署脚本

```bash
# 完整部署
sudo ./local_deploy.sh

# 或者以root用户运行
./local_deploy.sh
```

## 脚本功能

### 主要功能

- **检查依赖**: 验证Python3和systemctl是否已安装
- **检查权限**: 确认当前用户有足够的权限进行部署
- **设置部署目录**: 创建`/var/www/webtools`目录和`www-data`用户
- **复制文件**: 将项目文件复制到部署目录，排除不必要的文件
- **安装依赖**: 如果存在`requirements.txt`，自动安装Python依赖
- **创建系统服务**: 创建systemd服务文件，实现开机自启和后台运行
- **配置防火墙**: 自动开放8001端口
- **启动服务**: 启动WebTools服务

### 管理命令

```bash
# 查看帮助
./local_deploy.sh --help

# 查看服务状态
./local_deploy.sh --status

# 重启服务
./local_deploy.sh --restart

# 停止服务
./local_deploy.sh --stop
```

## 部署配置

脚本使用以下默认配置：

- **部署路径**: `/var/www/webtools`
- **服务端口**: `8001`
- **服务名称**: `webtools`
- **运行用户**: `www-data`

## 排除的文件

部署时会自动排除以下文件和目录：

- `.git` - Git版本控制文件
- `.trae` - Trae AI配置文件
- `__pycache__` - Python缓存文件
- `*.pyc` - Python编译文件
- `.DS_Store` - macOS系统文件
- `Thumbs.db` - Windows缩略图文件
- `deploy_config.py` - 部署配置文件
- `deploy.py` - 远程部署脚本
- `auto_deploy.sh` - 远程部署脚本
- `local_deploy.sh` - 本地部署脚本

## 系统要求

- **操作系统**: Linux (Ubuntu, CentOS, Debian等)
- **Python**: 3.6+
- **权限**: sudo权限或root用户
- **服务管理**: systemd支持
- **防火墙**: ufw或firewalld（可选）

## 故障排除

### 常见问题

1. **权限不足**
   ```bash
   # 解决方案：使用sudo运行
   sudo ./local_deploy.sh
   ```

2. **Python3未安装**
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install python3 python3-pip
   
   # CentOS/RHEL
   sudo yum install python3 python3-pip
   ```

3. **服务启动失败**
   ```bash
   # 查看服务状态
   sudo systemctl status webtools
   
   # 查看详细日志
   sudo journalctl -u webtools -f
   ```

4. **端口被占用**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep 8001
   
   # 或使用ss命令
   sudo ss -tlnp | grep 8001
   ```

### 手动服务管理

如果需要手动管理服务：

```bash
# 启动服务
sudo systemctl start webtools

# 停止服务
sudo systemctl stop webtools

# 重启服务
sudo systemctl restart webtools

# 查看服务状态
sudo systemctl status webtools

# 启用开机自启
sudo systemctl enable webtools

# 禁用开机自启
sudo systemctl disable webtools

# 查看服务日志
sudo journalctl -u webtools -f
```

## 与远程部署的区别

| 特性 | 远程部署 (auto_deploy.sh) | 本地部署 (local_deploy.sh) |
|------|---------------------------|----------------------------|
| 运行位置 | 本地机器 | 目标服务器 |
| SSH要求 | 需要SSH密钥配置 | 不需要SSH |
| 文件传输 | rsync通过SSH | 本地文件复制 |
| 适用场景 | CI/CD自动化部署 | 手动服务器部署 |
| 网络要求 | 需要网络连接到服务器 | 无网络要求 |

## 安全注意事项

1. **用户权限**: 服务以`www-data`用户运行，降低安全风险
2. **文件权限**: 部署文件设置适当的权限（755）
3. **防火墙**: 只开放必要的端口（8001）
4. **服务隔离**: 使用systemd服务管理，实现进程隔离

## 卸载

如果需要完全卸载WebTools：

```bash
# 停止并禁用服务
sudo systemctl stop webtools
sudo systemctl disable webtools

# 删除服务文件
sudo rm /etc/systemd/system/webtools.service
sudo systemctl daemon-reload

# 删除部署文件
sudo rm -rf /var/www/webtools

# 关闭防火墙端口（可选）
sudo ufw delete allow 8001/tcp
```

这样就可以完全清理WebTools的部署痕迹。