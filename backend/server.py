import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, parse_qs

PORT = 8000

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
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/scan-images':
            self.handle_scan_images()
        else:
            super().do_GET()

    def handle_scan_images(self):
        query_components = parse_qs(urlparse(self.path).query)
        folder_path = query_components.get('path', [None])[0]

        if not folder_path or not os.path.isdir(folder_path):
            self.send_error(400, 'Invalid or missing folder path')
            return

        image_files = []
        supported_formats = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg')

        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.lower().endswith(supported_formats):
                    full_path = os.path.join(root, file)
                    try:
                        stat = os.stat(full_path)
                        image_files.append({
                            'path': full_path,
                            'size': stat.st_size,
                            'extension': os.path.splitext(file)[1].lower(),
                        })
                    except OSError:
                        # Ignore files we can't access
                        pass
        
        response_data = {
            'images': image_files,
            'count': len(image_files)
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))


with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"正在端口 {PORT} 提供服务")
    print(f"请在浏览器中打开 http://localhost:{PORT}")
    httpd.serve_forever()