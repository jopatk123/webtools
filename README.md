# 我的工具箱 🧰

一个模块化的在线工具集合，包含计算器、图片工具、转换工具、生成工具等实用功能。

## 🚨 重要提示：CORS 问题解决方案

### 问题描述
如果您直接在浏览器中打开 `index.html` 文件，可能会遇到以下错误：
```
Failed to fetch dynamically imported module: file:///...
```

这是因为现代浏览器的安全策略不允许从 `file://` 协议加载 ES6 模块。

### 解决方案

#### 方法一：使用提供的本地服务器（推荐）

1. **确保已安装 Python**
   - 下载地址：https://www.python.org/downloads/
   - 安装时勾选 "Add Python to PATH"

2. **启动服务器**
   - **Windows 用户**：双击 `start-server.bat` 文件
   - **其他系统**：在终端中运行 `python server.py`

3. **访问应用**
   - 服务器启动后会自动打开浏览器
   - 或手动访问：http://localhost:8000

#### 方法二：使用其他本地服务器

**Node.js 用户：**
```bash
npx serve .
# 或
npx http-server .
```

**Python 用户：**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**PHP 用户：**
```bash
php -S localhost:8000
```

## 📁 项目结构

```
Tools/
├── index.html              # 主页面
├── debug.html              # 调试版本（无模块依赖）
├── index-fixed.html        # 增强版本（带调试面板）
├── test-modules.html       # 模块测试页面
├── server.py               # Python 本地服务器
├── start-server.bat        # Windows 启动脚本
├── styles.css              # 样式文件
├── js/
│   ├── app.js              # 主应用入口
│   ├── config.js           # 配置文件
│   ├── utils.js            # 工具函数
│   └── modules/            # 功能模块
│       ├── calculator.js   # 计算器模块
│       ├── converters.js   # 转换工具模块
│       ├── generators.js   # 生成工具模块
│       ├── imageTools.js   # 图片工具模块
│       └── navigation.js   # 导航模块
└── README.md               # 说明文档
```

## 🔧 功能模块

### 计算工具
- **基础计算器**：支持四则运算、键盘输入
- **税务计算**：计算含税/不含税金额
- **金额转换**：数字转中文大写

### 图片工具
- **批量加载**：选择文件夹批量加载图片
- **图片预览**：支持图片浏览和切换
- **格式支持**：JPG、PNG、GIF、WebP等

### 转换工具
- **颜色转换**：HEX、RGB、HSL互转
- **单位转换**：长度、重量、温度等
- **编码转换**：Base64、URL编码等

### 生成工具
- **密码生成器**：可自定义长度和字符集
- **二维码生成**：文本转二维码
- **UUID生成**：生成唯一标识符

## 🛠️ 技术特性

- **模块化架构**：ES6 模块系统，代码组织清晰
- **响应式设计**：适配各种屏幕尺寸
- **无框架依赖**：纯原生 JavaScript 实现
- **现代化UI**：使用 Font Awesome 图标
- **错误处理**：完善的错误捕获和用户提示

## 🐛 故障排除

### 常见问题

1. **按钮点击无响应**
   - 确保使用本地服务器访问，不要直接打开HTML文件
   - 检查浏览器控制台是否有错误信息
   - 尝试强制刷新（Ctrl+F5）

2. **模块加载失败**
   - 确保所有 `.js` 文件都在正确位置
   - 检查文件路径是否正确
   - 确保使用支持 ES6 模块的现代浏览器

3. **样式显示异常**
   - 检查 `styles.css` 文件是否存在
   - 确保网络连接正常（Font Awesome 需要联网加载）

### 调试工具

- **debug.html**：简化版本，用于测试基本功能
- **test-modules.html**：模块导入测试
- **index-fixed.html**：带调试面板的增强版本

## 🔄 版本历史

### v2.0.0
- 重构为模块化架构
- 移除内联事件处理器
- 添加完善的错误处理
- 优化用户体验

### v1.0.0
- 初始版本
- 基础功能实现

## 📝 开发说明

### 添加新功能模块

1. 在 `js/modules/` 目录创建新模块文件
2. 导出模块类：`export class ModuleName { ... }`
3. 在 `app.js` 中导入并初始化模块
4. 在 `index.html` 中添加对应的HTML结构

### 代码规范

- 使用 ES6+ 语法
- 模块化组织代码
- 添加适当的错误处理
- 保持代码注释的完整性

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受使用我的工具箱！** 🎉