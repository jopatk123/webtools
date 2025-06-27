#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的本地HTTP服务器
用于解决模块导入的CORS问题
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

def start_server(port=8000, directory=None):
    """启动本地HTTP服务器"""
    if directory:
        os.chdir(directory)
    
    # 设置处理器
    handler = http.server.SimpleHTTPRequestHandler
    
    # 添加MIME类型支持
    handler.extensions_map.update({
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.json': 'application/json'
    })
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"\n🚀 本地服务器已启动!")
            print(f"📁 服务目录: {os.getcwd()}")
            print(f"🌐 访问地址: http://localhost:{port}")
            print(f"\n可用页面:")
            print(f"  • 主页面: http://localhost:{port}/index.html")
            print(f"  • 调试页面: http://localhost:{port}/debug.html")
            print(f"  • 增强页面: http://localhost:{port}/index-fixed.html")
            print(f"  • 模块测试: http://localhost:{port}/test-modules.html")
            print(f"\n按 Ctrl+C 停止服务器")
            print(f"{'='*50}")
            
            # 自动打开浏览器
            try:
                webbrowser.open(f'http://localhost:{port}/index.html')
            except:
                pass
            
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 10048:  # Windows: Address already in use
            print(f"❌ 端口 {port} 已被占用，尝试使用端口 {port + 1}")
            start_server(port + 1, directory)
        else:
            print(f"❌ 启动服务器失败: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print(f"\n\n👋 服务器已停止")
        sys.exit(0)

if __name__ == "__main__":
    # 获取脚本所在目录
    script_dir = Path(__file__).parent
    
    print("🔧 我的工具箱 - 本地开发服务器")
    print("=" * 40)
    
    # 检查是否在正确的目录
    if not (script_dir / "index.html").exists():
        print("❌ 错误: 找不到 index.html 文件")
        print("请确保在项目根目录运行此脚本")
        sys.exit(1)
    
    # 启动服务器
    start_server(8000, script_dir)