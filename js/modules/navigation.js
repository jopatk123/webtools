// 导航和UI管理模块
export class Navigation {
    constructor() {
        this.init();
    }

    init() {
        this.bindNavigationEvents();
        this.enhanceUserExperience();
        this.loadTheme();
    }

    // 绑定导航事件
    bindNavigationEvents() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Update UI directly
                this.showTool(targetId);
                
                // Update URL hash
                if (history.pushState) {
                    history.pushState({tool: targetId}, ``, `#${targetId}`);
                } else {
                    location.hash = `#${targetId}`;
                }
            });
        });

        // Handle back/forward button navigation
        window.addEventListener('popstate', (e) => {
            const toolId = location.hash.substring(1) || (e.state && e.state.tool);
            if (toolId) {
                this.showTool(toolId);
            }
        });

        // Show initial tool based on hash or default to the first one
        const initialToolId = location.hash.substring(1) || (navLinks.length > 0 ? navLinks[0].getAttribute('href').substring(1) : '');
        this.showTool(initialToolId);
    }

    showTool(toolId) {
        if (!toolId) return;

        const sections = document.querySelectorAll('.tool-section');
        const navLinks = document.querySelectorAll('.nav-link');

        // Hide all sections and deactivate all links
        sections.forEach(s => s.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));

        // Show the target section
        const targetSection = document.getElementById(toolId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activate the target link
        const targetLink = document.querySelector(`a[href="#${toolId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    // 增强用户体验
    enhanceUserExperience() {
        // 为所有输入框添加焦点效果
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
        });
        
        // 添加复制功能到结果区域
        this.addCopyFunctionality();
    }

    // 添加复制功能
    addCopyFunctionality() {
        const results = document.querySelectorAll('.result');
        results.forEach(result => {
            result.addEventListener('click', function() {
                if (this.textContent.trim()) {
                    // 使用现代的 Clipboard API
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(this.textContent).then(() => {
                            this.showCopySuccess();
                        }).catch(() => {
                            // 降级到传统方法
                            this.fallbackCopy();
                        });
                    } else {
                        this.fallbackCopy();
                    }
                }
            });
            
            // 添加复制成功提示方法
            result.showCopySuccess = function() {
                const originalBg = this.style.backgroundColor;
                this.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    this.style.backgroundColor = originalBg;
                }, 500);
            };
            
            // 降级复制方法
            result.fallbackCopy = function() {
                const textArea = document.createElement('textarea');
                textArea.value = this.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    this.showCopySuccess();
                } catch (err) {
                    console.error('复制失败:', err);
                }
                document.body.removeChild(textArea);
            };
        });
    }

    // 主题切换功能
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        return isDark;
    }

    // 加载保存的主题
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    // 显示通知
    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // 根据类型设置背景色
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // 切换到指定工具
    switchToTool(toolId) {
        const navLink = document.querySelector(`a[href="#${toolId}"]`);
        if (navLink) {
            navLink.click();
        }
    }

    // 获取当前活动的工具
    getCurrentTool() {
        const activeSection = document.querySelector('.tool-section.active');
        return activeSection ? activeSection.id : null;
    }

    // 添加工具提示
    addTooltip(element, text) {
        element.setAttribute('title', text);
        element.style.cursor = 'help';
    }

    // 平滑滚动到元素
    scrollToElement(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

export { Navigation };