import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, parse_qs

PORT = 8001

# 获取脚本所在的目录
backend_dir = os.path.dirname(os.path.abspath(__file__))
# 获取项目根目录
project_root = os.path.dirname(backend_dir)
# 设置前端目录为服务目录
web_dir = os.path.join(project_root, 'frontend')

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=web_dir, **kwargs)

    def do_GET(self):
        # The API endpoint for scanning has been removed for security and feasibility reasons.
        # All scanning is now handled client-side.
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"正在端口 {PORT} 提供服务")
    print(f"请在浏览器中打开 http://localhost:{PORT}")
    httpd.serve_forever()