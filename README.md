# WebTools 工具箱

这是一个现代化的网页工具箱项目，目前包含计算器功能。

## 项目结构

```
.
├── backend/                # 后端代码
│   └── server.py           # 用于提供静态文件的简单服务器
├── frontend/               # 前端代码
│   ├── components/         # 可复用的HTML组件
│   │   └── calculator.html # 计算器组件
│   ├── css/                # 样式文件
│   │   ├── calculator.css  # 计算器样式
│   │   └── style.css       # 主样式
│   ├── index.html          # 主页面
│   └── js/                 # 脚本文件
│       ├── main.js         # 主逻辑
│       └── tools/          # 各个工具的专属脚本
│           └── calculator.js # 计算器逻辑
├── deploy.py               # Python部署脚本
├── deploy.bat              # Windows部署脚本
├── auto_deploy.sh          # Linux/Mac部署脚本
├── deploy_config.py        # 部署配置文件
├── server_setup.sh         # 服务器环境安装脚本
├── nginx.conf              # Nginx配置文件
├── requirements.txt        # Python依赖文件
└── README.md               # 项目说明
```

## 功能特性

- 🧮 **计算器**: 支持基本数学运算和科学计算
- 🎨 **现代UI**: 响应式设计，支持深色/浅色主题切换
- ⌨️ **快捷键支持**: 支持键盘快捷键操作
- 📱 **移动端适配**: 完美支持移动设备

## 本地开发

### 快速开始

1. 克隆项目到本地
2. 进入 `backend` 目录
3. 运行 `python server.py` 启动服务器
4. 在浏览器中打开 `http://localhost:8001`

### 开发环境要求

- Python 3.6+
- 现代浏览器（Chrome、Firefox、Safari、Edge）

## 服务器部署

### GitHub Actions 自动部署（推荐）

1. **配置 GitHub Secrets**
   在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥：
   ```
   SSH_PRIVATE_KEY     # 服务器SSH私钥
   SERVER_HOST         # 服务器IP地址（如：1.14.200.211）
   SERVER_USER         # 服务器用户名（如：root 或 ubuntu）
   DEPLOY_PATH         # 部署路径（如：/var/www/webtools）
   SERVICE_NAME        # 服务名称（如：webtools）
   SERVICE_PORT        # 服务端口（如：8001）
   ```

2. **自动部署触发**
   - 推送代码到 `main` 或 `master` 分支时自动部署
   - 或在 GitHub Actions 页面手动触发部署

3. **部署流程**
   - 自动同步代码到服务器
   - 创建并启动 systemd 服务
   - 执行健康检查
   - 显示部署结果

### 本地脚本部署

项目提供了多种部署方式，支持自动化部署到Linux服务器。

#### 1. 服务器环境准备

首先在服务器上运行环境安装脚本：

```bash
# 上传并运行服务器环境安装脚本
wget https://your-repo/server_setup.sh
chmod +x server_setup.sh
sudo ./server_setup.sh
```

#### 2. 配置部署参数

编辑 `deploy_config.py` 文件，修改服务器配置：

```python
SERVER_CONFIG = {
    'host': '1.14.200.211',        # 你的服务器IP
    'username': 'root',            # SSH用户名
    'deploy_path': '/var/www/webtools',  # 部署目录
    'service_port': 8001,          # 应用端口
}
```

#### 3. 执行部署

**Windows环境：**
```cmd
# 使用批处理脚本
deploy.bat

# 或使用Python脚本
python deploy.py
```

**Linux/Mac环境：**
```bash
# 使用Shell脚本
chmod +x auto_deploy.sh
./auto_deploy.sh

# 或使用Python脚本
python3 deploy.py
```

### 手动部署

如果不使用自动部署脚本，也可以手动部署：

1. **从 GitHub 克隆项目**
   ```bash
   # 克隆项目到服务器
   git clone https://github.com/your-username/webtools.git /var/www/webtools
   cd /var/www/webtools
   ```

2. **创建systemd服务**
   ```bash
   sudo cp webtools.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable webtools
   sudo systemctl start webtools
   ```

3. **配置Nginx（可选）**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/webtools
   sudo ln -s /etc/nginx/sites-available/webtools /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 部署后管理

**服务管理命令：**
```bash
# 查看服务状态
sudo systemctl status webtools

# 启动/停止/重启服务
sudo systemctl start webtools
sudo systemctl stop webtools
sudo systemctl restart webtools

# 查看服务日志
sudo journalctl -u webtools -f
```

**防火墙配置：**
```bash
# Ubuntu/Debian
sudo ufw allow 8001/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8001/tcp
sudo firewall-cmd --reload
```

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Python 3 (标准库)
- **部署**: systemd, Nginx (可选)
- **样式**: CSS Grid, Flexbox, CSS Variables
- **图标**: Font Awesome

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！