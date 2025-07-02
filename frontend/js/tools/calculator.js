function initCalculator() {
    const display = document.getElementById('display');
    const historyList = document.getElementById('history-list');
    const buttons = document.querySelector('.buttons');
    const copyHistoryBtn = document.getElementById('copy-history');
    const clearHistoryBtn = document.getElementById('clear-history');

    let currentInput = '';
    let fullExpression = '';
    let lastResult = null;
    let shouldResetOnNextInput = false;

    // 按钮点击事件
    buttons.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const value = e.target.innerText;
            const button = e.target;
            
            // 添加按下效果
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);
            
            handleInput(value);
        }
    });

    // 键盘事件
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        
        // 只在计算器工具激活时处理键盘事件
        if (!document.querySelector('.calculator-container')) return;
        
        if (/[0-9.+\-*/()]/.test(key)) {
            e.preventDefault();
            handleInput(key);
            highlightButton(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            handleInput('=');
            highlightButton('=');
        } else if (key === 'Backspace') {
            e.preventDefault();
            handleInput('⌫');
            highlightButton('⌫');
        } else if (key === 'Escape' || key.toLowerCase() === 'c') {
            e.preventDefault();
            handleInput('C');
            highlightButton('C');
        }
    });

    // 粘贴事件
    display.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const sanitized = pasteData.replace(/[^0-9.+\-*/()]/g, '');
        if (sanitized) {
            if (shouldResetOnNextInput) {
                currentInput = sanitized;
                shouldResetOnNextInput = false;
            } else {
                currentInput += sanitized;
            }
            updateDisplay();
        }
    });

    // 历史记录点击事件
    historyList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const historyText = e.target.textContent;
            const resultMatch = historyText.match(/= (.+)$/);
            if (resultMatch) {
                currentInput = resultMatch[1];
                updateDisplay();
                shouldResetOnNextInput = true;
            }
        }
    });

    function handleInput(value) {
        display.classList.remove('error');
        
        if (value === '=') {
            calculateResult();
        } else if (value === 'C') {
            clearAll();
        } else if (value === '⌫') {
            handleBackspace();
        } else {
            if (shouldResetOnNextInput && /[0-9.]/.test(value)) {
                currentInput = value;
                shouldResetOnNextInput = false;
            } else {
                // 防止连续操作符
                if (/[+\-*/]/.test(value) && /[+\-*/]$/.test(currentInput)) {
                    currentInput = currentInput.slice(0, -1) + value;
                } else {
                    currentInput += value;
                }
            }
            updateDisplay();
        }
    }
    
    function handleBackspace() {
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            updateDisplay();
        }
    }
    
    function calculateResult() {
        if (!currentInput.trim()) return;
        
        try {
            display.classList.add('calculating');
            
            // 简单的表达式验证
            if (!/^[0-9+\-*/.()\s]+$/.test(currentInput)) {
                throw new Error('无效字符');
            }
            
            fullExpression = currentInput;
            
            // 使用 Function 构造器代替 eval，更安全
            const result = Function('"use strict"; return (' + currentInput + ')')();
            
            if (!isFinite(result)) {
                throw new Error('结果无效');
            }
            
            // 格式化结果
            const formattedResult = Number(result.toPrecision(12)).toString();
            
            addToHistory(fullExpression, formattedResult);
            lastResult = formattedResult;
            currentInput = formattedResult;
            shouldResetOnNextInput = true;
            
            setTimeout(() => {
                display.classList.remove('calculating');
                updateDisplay();
            }, 300);
            
        } catch (error) {
            console.error('计算错误:', error);
            display.classList.remove('calculating');
            display.classList.add('error');
            display.value = 'Error';
            
            setTimeout(() => {
                display.classList.remove('error');
                currentInput = '';
                updateDisplay();
            }, 2000);
        }
    }
    
    function clearAll() {
        currentInput = '';
        fullExpression = '';
        lastResult = null;
        shouldResetOnNextInput = false;
        display.classList.remove('error', 'calculating');
        updateDisplay();
    }
    
    function updateDisplay() {
        display.value = currentInput || '0';
    }
    
    function highlightButton(value) {
        const button = Array.from(buttons.querySelectorAll('button')).find(btn => 
            btn.textContent === value
        );
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);
        }
    }

    function addToHistory(expression, result) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${expression} = ${result}</span>
                <small style="color: var(--text-tertiary); font-size: 0.75rem;">
                    ${new Date().toLocaleTimeString()}
                </small>
            </div>
        `;
        
        // 添加点击复制功能
        li.title = '点击使用此结果';
        
        historyList.prepend(li);
        
        // 限制历史记录数量
        const maxHistory = 50;
        while (historyList.children.length > maxHistory) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    // 清除历史按钮事件
    clearHistoryBtn.addEventListener('click', () => {
        if (historyList.children.length === 0) {
            showNotification('暂无计算历史', 'warning');
            return;
        }
        
        if (confirm('确定要清除所有计算历史吗？')) {
            historyList.innerHTML = '';
            showNotification('计算历史已清除', 'success');
        }
    });
    
    copyHistoryBtn.addEventListener('click', () => {
        const historyItems = Array.from(historyList.querySelectorAll('li'));
        if (historyItems.length === 0) {
            showNotification('暂无计算历史', 'warning');
            return;
        }
        
        let historyText = '计算历史:\n\n';
        historyItems.forEach((li, index) => {
            const text = li.textContent.split('\n')[0]; // 只取表达式部分
            historyText += `${index + 1}. ${text}\n`;
        });
        
        navigator.clipboard.writeText(historyText).then(() => {
            showNotification('计算历史已复制到剪贴板！', 'success');
        }).catch(() => {
            showNotification('复制失败，请手动复制', 'error');
        });
    });
    
    function showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
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
            max-width: 300px;
        `;
        
        // 设置颜色
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 初始化显示
    updateDisplay();
}