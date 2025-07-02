# 工具箱

这是一个包含多种实用工具的网页项目。

## 项目结构

```
.
├── backend/                # 后端代码
│   └── server.py           # 用于提供静态文件的简单服务器
├── frontend/               # 前端代码
│   ├── components/         # 可复用的HTML组件
│   │   ├── calculator.html
│   │   ├── image_preview.html
│   │   └── image_tool.html
│   ├── css/                # 样式文件
│   │   ├── calculator.css
│   │   ├── image_preview.css
│   │   ├── image_tool.css
│   │   └── style.css
│   ├── index.html          # 主页面
│   └── js/                 # 脚本文件
│       ├── main.js         # 主逻辑
│       └── tools/          # 各个工具的专属脚本
│           ├── calculator.js
│           └── image_tool/         # 图片工具模块化目录
│               ├── constants.js    # 常量定义
│               ├── index.js        # 图片工具主入口
│               └── modules/        # 功能模块目录
│                   ├── dom-manager.js
│                   ├── event-handler.js
│                   ├── file-scanner.js
│                   ├── format-filter.js
│                   ├── image-display.js
│                   ├── modal-manager.js
│                   ├── preview-manager.js
│                   └── utils.js
├── README.md                # 项目说明
├── start.bat                # 启动脚本（可选）
```

## 如何开始

1. 进入 `backend` 目录。
2. 运行 `python server.py` 启动服务器。
3. 在浏览器中打开 `http://localhost:8000`。