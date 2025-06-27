document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const toolNavigation = document.getElementById('tool-navigation');
    const pageTitle = document.getElementById('page-title');
    const themeToggle = document.getElementById('theme-toggle');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    
    // 工具名称映射
    const toolNames = {
        'calculator': '计算器',
        'image_tool': '图片工具'
    };
    
    // 当前加载的脚本
    let currentScript = null;

    // 导航点击事件
    toolNavigation.addEventListener('click', (e) => {
        if (e.target.closest('.nav-item')) {
            e.preventDefault();
            const navItem = e.target.closest('.nav-item');
            const toolName = navItem.dataset.tool;
            if (toolName) {
                loadTool(toolName);
                updateActiveNav(navItem);
            }
        }
    });
    
    // 主题切换
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新图标
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    
    // 全屏切换
    fullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenToggle.querySelector('i').className = 'fas fa-compress';
        } else {
            document.exitFullscreen();
            fullscreenToggle.querySelector('i').className = 'fas fa-expand';
        }
    });
    
    // 监听全屏变化
    document.addEventListener('fullscreenchange', () => {
        const icon = fullscreenToggle.querySelector('i');
        icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
    });

    function loadTool(toolName) {
        // 显示加载状态
        mainContent.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>加载中...</div>';
        
        // 更新页面标题
        pageTitle.textContent = toolNames[toolName] || toolName;
        
        // 移除之前的脚本
        if (currentScript) {
            currentScript.remove();
            currentScript = null;
        }

        // 加载HTML组件
        fetch(`components/${toolName}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;

                // 加载并执行对应的JS
                const script = document.createElement('script');
                script.src = `js/tools/${toolName}.js`;
                script.type = 'module'; // 支持ES6模块
                script.onload = () => {
                    // 对于模块化的工具，应用会自动初始化
                    // 对于传统工具，尝试调用初始化函数
                    const initFunctionName = `init${capitalize(toolName).replace('_', '')}`;
                    if (typeof window[initFunctionName] === 'function') {
                        window[initFunctionName]();
                    }
                };
                script.onerror = () => {
                    console.error('Error loading script:', script.src);
                    mainContent.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>
                            脚本加载失败: ${toolName}.js
                        </div>
                    `;
                };
                document.body.appendChild(script);
                currentScript = script;
            })
            .catch(error => {
                console.error('Error loading tool:', error);
                mainContent.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>
                        加载工具失败: ${error.message}
                    </div>
                `;
            });
    }
    
    function updateActiveNav(activeItem) {
        // 移除所有活动状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加活动状态到当前项
        activeItem.classList.add('active');
    }

    function capitalize(str) {
        const parts = str.split('_');
        const capitalized = parts.map((part, index) => {
            if (index === 0) {
                return part.charAt(0).toUpperCase() + part.slice(1);
            }
            return part;
        });
        return capitalized.join('');
    }
    
    // 初始化主题
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Alt + 数字键切换工具
        if (e.altKey && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const toolIndex = parseInt(e.key) - 1;
            const navItems = document.querySelectorAll('.nav-item');
            if (navItems[toolIndex]) {
                const toolName = navItems[toolIndex].dataset.tool;
                loadTool(toolName);
                updateActiveNav(navItems[toolIndex]);
            }
        }
        
        // F11 全屏
        if (e.key === 'F11') {
            e.preventDefault();
            fullscreenToggle.click();
        }
        
        // Ctrl + Shift + T 切换主题
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            themeToggle.click();
        }
    });
    
    // 初始化
    initTheme();
    loadTool('calculator');
});