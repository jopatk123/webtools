#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
部署配置文件
包含服务器部署相关的配置信息
"""

# 服务器配置
SERVER_CONFIG = {
    'host': '1.14.200.211',
    'port': 22,
    'username': 'root',  # 请根据实际情况修改
    'deploy_path': '/var/www/webtools',  # 部署目录
    'service_port': 8001,  # 应用服务端口
    'service_name': 'webtools'
}

# 需要上传的文件和目录
DEPLOY_FILES = [
    'frontend/',
    'backend/',
    'requirements.txt',
    'README.md'
]

# 需要排除的文件和目录
EXCLUDE_PATTERNS = [
    '.git',
    '.trae',
    '__pycache__',
    '*.pyc',
    '.DS_Store',
    'Thumbs.db',
    'deploy_config.py',
    'deploy.py',
    'auto_deploy.sh'
]

# 服务配置
SERVICE_CONFIG = {
    'description': 'WebTools Application',
    'user': 'www-data',  # 运行服务的用户
    'group': 'www-data',  # 运行服务的用户组
    'restart_policy': 'always'
}