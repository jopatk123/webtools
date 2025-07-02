#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动部署脚本
用于将webtools项目部署到Linux服务器
"""

import os
import sys
import subprocess
import shutil
import tempfile
from pathlib import Path
from deploy_config import SERVER_CONFIG, DEPLOY_FILES, EXCLUDE_PATTERNS, SERVICE_CONFIG

class WebToolsDeployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.server_host = SERVER_CONFIG['host']
        self.server_user = SERVER_CONFIG['username']
        self.deploy_path = SERVER_CONFIG['deploy_path']
        self.service_port = SERVER_CONFIG['service_port']
        self.service_name = SERVER_CONFIG['service_name']
    
    def check_dependencies(self):
        """检查部署依赖"""
        print("检查部署依赖...")
        
        # 检查rsync
        try:
            subprocess.run(['rsync', '--version'], capture_output=True, check=True)
            print("✓ rsync 已安装")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("✗ rsync 未安装，请先安装 rsync")
            return False
        
        # 检查ssh
        try:
            subprocess.run(['ssh', '-V'], capture_output=True, check=True)
            print("✓ ssh 已安装")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("✗ ssh 未安装，请先安装 openssh")
            return False
        
        return True
    
    def create_exclude_file(self):
        """创建rsync排除文件"""
        exclude_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
        for pattern in EXCLUDE_PATTERNS:
            exclude_file.write(f"{pattern}\n")
        exclude_file.close()
        return exclude_file.name
    
    def sync_files(self):
        """同步文件到服务器"""
        print(f"同步文件到服务器 {self.server_host}...")
        
        exclude_file = self.create_exclude_file()
        
        try:
            # 创建远程目录
            ssh_cmd = f"ssh {self.server_user}@{self.server_host} 'mkdir -p {self.deploy_path}'"
            subprocess.run(ssh_cmd, shell=True, check=True)
            
            # 同步文件
            rsync_cmd = [
                'rsync',
                '-avz',
                '--delete',
                f'--exclude-from={exclude_file}',
                f'{self.project_root}/',
                f'{self.server_user}@{self.server_host}:{self.deploy_path}/'
            ]
            
            result = subprocess.run(rsync_cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print("✓ 文件同步成功")
                return True
            else:
                print(f"✗ 文件同步失败: {result.stderr}")
                return False
        
        except subprocess.CalledProcessError as e:
            print(f"✗ 同步过程中出错: {e}")
            return False
        
        finally:
            os.unlink(exclude_file)
    
    def create_systemd_service(self):
        """创建systemd服务文件"""
        print("创建systemd服务...")
        
        service_content = f"""[Unit]
Description={SERVICE_CONFIG['description']}
After=network.target

[Service]
Type=simple
User={SERVICE_CONFIG['user']}
Group={SERVICE_CONFIG['group']}
WorkingDirectory={self.deploy_path}
ExecStart=/usr/bin/python3 {self.deploy_path}/backend/server.py
Restart={SERVICE_CONFIG['restart_policy']}
RestartSec=5
Environment=PYTHONPATH={self.deploy_path}

[Install]
WantedBy=multi-user.target
"""
        
        # 创建临时服务文件
        temp_service = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.service')
        temp_service.write(service_content)
        temp_service.close()
        
        try:
            # 上传服务文件
            scp_cmd = f"scp {temp_service.name} {self.server_user}@{self.server_host}:/tmp/{self.service_name}.service"
            subprocess.run(scp_cmd, shell=True, check=True)
            
            # 安装服务
            install_cmd = f"""ssh {self.server_user}@{self.server_host} '
                sudo mv /tmp/{self.service_name}.service /etc/systemd/system/
                sudo systemctl daemon-reload
                sudo systemctl enable {self.service_name}
            '"""
            subprocess.run(install_cmd, shell=True, check=True)
            
            print("✓ systemd服务创建成功")
            return True
        
        except subprocess.CalledProcessError as e:
            print(f"✗ 创建服务失败: {e}")
            return False
        
        finally:
            os.unlink(temp_service.name)
    
    def setup_firewall(self):
        """配置防火墙"""
        print("配置防火墙...")
        
        firewall_cmd = f"""ssh {self.server_user}@{self.server_host} '
            sudo ufw allow {self.service_port}/tcp
            sudo ufw --force enable
        '"""
        
        try:
            subprocess.run(firewall_cmd, shell=True, check=True)
            print(f"✓ 防火墙配置成功，已开放端口 {self.service_port}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ 防火墙配置失败: {e}")
            return False
    
    def start_service(self):
        """启动服务"""
        print("启动服务...")
        
        start_cmd = f"""ssh {self.server_user}@{self.server_host} '
            sudo systemctl start {self.service_name}
            sudo systemctl status {self.service_name}
        '"""
        
        try:
            result = subprocess.run(start_cmd, shell=True, capture_output=True, text=True)
            if "active (running)" in result.stdout:
                print("✓ 服务启动成功")
                print(f"✓ 应用已部署，访问地址: http://{self.server_host}:{self.service_port}")
                return True
            else:
                print(f"✗ 服务启动失败: {result.stdout}")
                return False
        except subprocess.CalledProcessError as e:
            print(f"✗ 启动服务失败: {e}")
            return False
    
    def deploy(self):
        """执行完整部署流程"""
        print("开始部署 WebTools 到服务器...")
        print(f"目标服务器: {self.server_host}")
        print(f"部署路径: {self.deploy_path}")
        print("-" * 50)
        
        steps = [
            ("检查依赖", self.check_dependencies),
            ("同步文件", self.sync_files),
            ("创建服务", self.create_systemd_service),
            ("配置防火墙", self.setup_firewall),
            ("启动服务", self.start_service)
        ]
        
        for step_name, step_func in steps:
            print(f"\n[{step_name}]")
            if not step_func():
                print(f"\n❌ 部署失败，在步骤 '{step_name}' 出错")
                return False
        
        print("\n🎉 部署成功完成！")
        print(f"\n访问地址: http://{self.server_host}:{self.service_port}")
        return True

def main():
    """主函数"""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("WebTools 自动部署脚本")
        print("用法: python deploy.py")
        print("\n部署前请确保:")
        print("1. 已配置SSH密钥认证到目标服务器")
        print("2. 目标服务器已安装Python3")
        print("3. 当前用户有sudo权限")
        print("4. 已安装rsync和ssh客户端")
        return
    
    deployer = WebToolsDeployer()
    deployer.deploy()

if __name__ == '__main__':
    main()