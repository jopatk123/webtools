// 导航功能
document.addEventListener('DOMContentLoaded', function() {
    // 导航切换
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.tool-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加活动状态
            this.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
});

// 文本工具功能
function textToUpper() {
    const input = document.getElementById('textInput').value;
    const result = input.toUpperCase();
    document.getElementById('textResult').textContent = result;
}

function textToLower() {
    const input = document.getElementById('textInput').value;
    const result = input.toLowerCase();
    document.getElementById('textResult').textContent = result;
}

function removeSpaces() {
    const input = document.getElementById('textInput').value;
    const result = input.replace(/\s+/g, '');
    document.getElementById('textResult').textContent = result;
}

function countWords() {
    const input = document.getElementById('textInput').value;
    const words = input.trim().split(/\s+/).filter(word => word.length > 0);
    const chars = input.length;
    const charsNoSpaces = input.replace(/\s/g, '').length;
    const lines = input.split('\n').length;
    
    const result = `字数: ${words.length}\n字符数: ${chars}\n字符数(不含空格): ${charsNoSpaces}\n行数: ${lines}`;
    document.getElementById('textResult').textContent = result;
}

// JSON工具功能
function formatJson() {
    const input = document.getElementById('jsonInput').value;
    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        document.getElementById('jsonResult').textContent = formatted;
    } catch (error) {
        document.getElementById('jsonResult').textContent = '错误: ' + error.message;
    }
}

function minifyJson() {
    const input = document.getElementById('jsonInput').value;
    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        document.getElementById('jsonResult').textContent = minified;
    } catch (error) {
        document.getElementById('jsonResult').textContent = '错误: ' + error.message;
    }
}

function validateJson() {
    const input = document.getElementById('jsonInput').value;
    try {
        JSON.parse(input);
        document.getElementById('jsonResult').textContent = '✅ JSON格式正确';
    } catch (error) {
        document.getElementById('jsonResult').textContent = '❌ JSON格式错误: ' + error.message;
    }
}

// 颜色转换功能
function convertColor() {
    const hex = document.getElementById('hexInput').value;
    if (!hex.match(/^#[0-9A-Fa-f]{6}$/)) {
        return;
    }
    
    // 转换为RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    document.getElementById('rgbInput').value = `rgb(${r}, ${g}, ${b})`;
    
    // 转换为HSL
    const hsl = rgbToHsl(r, g, b);
    document.getElementById('hslInput').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    
    // 显示颜色预览
    document.getElementById('colorPreview').style.backgroundColor = hex;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// 时间戳转换功能
function convertTimestamp() {
    const timestamp = document.getElementById('timestampInput').value;
    if (!timestamp) return;
    
    const date = new Date(timestamp * 1000);
    const isoString = date.toISOString().slice(0, 16);
    document.getElementById('datetimeInput').value = isoString;
    
    const result = `本地时间: ${date.toLocaleString()}\nUTC时间: ${date.toUTCString()}\nISO格式: ${date.toISOString()}`;
    document.getElementById('timestampResult').textContent = result;
}

function convertDatetime() {
    const datetime = document.getElementById('datetimeInput').value;
    if (!datetime) return;
    
    const date = new Date(datetime);
    const timestamp = Math.floor(date.getTime() / 1000);
    document.getElementById('timestampInput').value = timestamp;
    
    const result = `时间戳: ${timestamp}\n毫秒时间戳: ${date.getTime()}\n本地时间: ${date.toLocaleString()}`;
    document.getElementById('timestampResult').textContent = result;
}

function getCurrentTimestamp() {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    document.getElementById('timestampInput').value = timestamp;
    
    const isoString = now.toISOString().slice(0, 16);
    document.getElementById('datetimeInput').value = isoString;
    
    const result = `当前时间戳: ${timestamp}\n当前时间: ${now.toLocaleString()}`;
    document.getElementById('timestampResult').textContent = result;
}

// 密码生成功能
function updateLengthDisplay() {
    const length = document.getElementById('passwordLength').value;
    document.getElementById('lengthDisplay').textContent = length;
}

function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
        alert('请至少选择一种字符类型');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    document.getElementById('generatedPassword').value = password;
}

function copyPassword() {
    const password = document.getElementById('generatedPassword');
    password.select();
    document.execCommand('copy');
    alert('密码已复制到剪贴板');
}

// 二维码生成功能
function generateQR() {
    const text = document.getElementById('qrInput').value;
    if (!text.trim()) {
        alert('请输入要生成二维码的内容');
        return;
    }
    
    const qrContainer = document.getElementById('qrResult');
    qrContainer.innerHTML = '';
    
    QRCode.toCanvas(text, { width: 200, margin: 2 }, function(error, canvas) {
        if (error) {
            qrContainer.innerHTML = '生成失败: ' + error.message;
        } else {
            qrContainer.appendChild(canvas);
        }
    });
}

// 计算器功能
let calcExpression = '';
let calcHistoryArr = [];

function appendToCalc(value) {
    calcExpression += value;
    document.getElementById('calcDisplay').value = calcExpression;
}

function clearCalc() {
    calcExpression = '';
    document.getElementById('calcDisplay').value = '';
    // 可选：清空历史
    // calcHistoryArr = [];
    // updateCalcHistory();
}

function deleteLast() {
    calcExpression = calcExpression.slice(0, -1);
    document.getElementById('calcDisplay').value = calcExpression;
}

function calculate() {
    try {
        // 替换显示符号为计算符号
        const expression = calcExpression.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(expression);
        document.getElementById('calcDisplay').value = result;
        // 记录历史
        if (calcExpression) {
            calcHistoryArr.unshift(`${calcExpression} = ${result}`);
            if (calcHistoryArr.length > 10) calcHistoryArr.length = 10;
            updateCalcHistory();
        }
        calcExpression = result.toString();
    } catch (error) {
        document.getElementById('calcDisplay').value = '错误';
        calcExpression = '';
    }
}

function updateCalcHistory() {
    const historyDiv = document.getElementById('calcHistory');
    if (calcHistoryArr.length === 0) {
        historyDiv.innerHTML = '<div class="history-placeholder">暂无计算历史</div>';
    } else {
        historyDiv.innerHTML = calcHistoryArr.map(item => `<div class="history-item">${item}</div>`).join('');
    }
}

function clearHistory() {
    calcHistoryArr = [];
    updateCalcHistory();
}

// 百分比计算功能
function calculatePercent() {
    const value = parseFloat(document.getElementById('percentValue').value);
    const rate = parseFloat(document.getElementById('percentRate').value);
    
    if (isNaN(value) || isNaN(rate)) {
        document.getElementById('percentResult').textContent = '请输入有效数字';
        return;
    }
    
    const result = (value * rate) / 100;
    const resultText = `${value} 的 ${rate}% = ${result}\n${value} + ${rate}% = ${value + result}\n${value} - ${rate}% = ${value - result}`;
    document.getElementById('percentResult').textContent = resultText;
}

// URL编码/解码功能
function encodeURL() {
    const input = document.getElementById('urlInput').value;
    const result = encodeURIComponent(input);
    document.getElementById('urlResult').value = result;
}

function decodeURL() {
    const input = document.getElementById('urlInput').value;
    try {
        const result = decodeURIComponent(input);
        document.getElementById('urlResult').value = result;
    } catch (error) {
        document.getElementById('urlResult').value = '解码失败: ' + error.message;
    }
}

// Base64编码/解码功能
function encodeBase64() {
    const input = document.getElementById('base64Input').value;
    try {
        const result = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('base64Result').value = result;
    } catch (error) {
        document.getElementById('base64Result').value = '编码失败: ' + error.message;
    }
}

function decodeBase64() {
    const input = document.getElementById('base64Input').value;
    try {
        const result = decodeURIComponent(escape(atob(input)));
        document.getElementById('base64Result').value = result;
    } catch (error) {
        document.getElementById('base64Result').value = '解码失败: ' + error.message;
    }
}

// 税率计算功能
function calculateTax() {
    const amount = parseFloat(document.getElementById('taxAmount').value);
    const rate = parseFloat(document.getElementById('taxRate').value);
    if (isNaN(amount) || isNaN(rate)) {
        document.getElementById('taxResult').textContent = '请输入有效的金额和税率';
        return;
    }
    const tax = amount * rate / 100;
    const withTax = amount + tax;
    const withoutTax = amount;
    const result = `不含税金额: ${withoutTax}\n税额: ${tax}\n含税金额: ${withTax}`;
    document.getElementById('taxResult').textContent = result;
}

// 金额小写转大写功能
function convertAmountToChinese() {
    const num = document.getElementById('amountInput').value.trim();
    if (!num || isNaN(num)) {
        document.getElementById('amountResult').textContent = '请输入有效的金额';
        return;
    }
    document.getElementById('amountResult').textContent = numberToChinese(num);
}

function numberToChinese(num) {
    // 支持到厘
    const CN_NUM = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
    const CN_UNIT = ['','拾','佰','仟'];
    const CN_SECTION = ['','万','亿','兆'];
    const CN_DECIMAL = ['角','分','厘'];
    const CN_INTEGER = '整';
    const CN_YUAN = '元';
    num = parseFloat(num);
    if (num === 0) return '零元整';
    let strIns = '', chnStr = '';
    let integerNum = Math.floor(num);
    let decimalNum = Math.round((num - integerNum) * 1000);
    // 整数部分
    let unitPos = 0;
    let zero = true;
    while(integerNum > 0) {
        let section = integerNum % 10000;
        if (!zero) chnStr = CN_NUM[0] + chnStr;
        let strInsSec = sectionToChinese(section, CN_NUM, CN_UNIT);
        if(section !== 0) strInsSec += CN_SECTION[unitPos];
        chnStr = strInsSec + chnStr;
        zero = (section < 1000) && (section > 0);
        integerNum = Math.floor(integerNum / 10000);
        unitPos++;
    }
    chnStr += CN_YUAN;
    // 小数部分
    if (decimalNum === 0) {
        chnStr += CN_INTEGER;
    } else {
        let dec = decimalNum.toString().padStart(3, '0');
        for (let i = 0; i < 3; i++) {
            if (dec[i] !== '0') {
                chnStr += CN_NUM[parseInt(dec[i])] + CN_DECIMAL[i];
            }
        }
    }
    // 处理连续零
    chnStr = chnStr.replace(/零{2,}/g, '零');
    chnStr = chnStr.replace(/零(万|亿|兆|元)/g, '$1');
    chnStr = chnStr.replace(/亿万/g, '亿');
    chnStr = chnStr.replace(/零角零分零厘$/, '整');
    chnStr = chnStr.replace(/零角零分$/, '整');
    chnStr = chnStr.replace(/零分零厘$/, '整');
    chnStr = chnStr.replace(/零厘$/, '');
    return chnStr;
}
function sectionToChinese(section, CN_NUM, CN_UNIT) {
    let strIns = '', chnStr = '';
    let unitPos = 0;
    let zero = true;
    while(section > 0) {
        let v = section % 10;
        if(v === 0) {
            if(!zero) {
                zero = true;
                chnStr = CN_NUM[0] + chnStr;
            }
        } else {
            zero = false;
            strIns = CN_NUM[v] + CN_UNIT[unitPos];
            chnStr = strIns + chnStr;
        }
        unitPos++;
        section = Math.floor(section / 10);
    }
    return chnStr;
}

// 优化计算器键盘支持：只要计算工具section展示时即可键盘输入
document.addEventListener('keydown', function(e) {
    const calculatorSection = document.getElementById('calculator');
    if (calculatorSection.classList.contains('active')) {
        const key = e.key;
        if ('0123456789+-*/.'.includes(key)) {
            e.preventDefault();
            appendToCalc(key === '*' ? '×' : key === '/' ? '÷' : key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            e.preventDefault();
            clearCalc();
        } else if (key === 'Backspace') {
            e.preventDefault();
            deleteLast();
        }
    }
});

// 工具提示和用户体验增强
document.addEventListener('DOMContentLoaded', function() {
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
    const results = document.querySelectorAll('.result');
    results.forEach(result => {
        result.addEventListener('click', function() {
            if (this.textContent.trim()) {
                navigator.clipboard.writeText(this.textContent).then(() => {
                    // 显示复制成功提示
                    const originalBg = this.style.backgroundColor;
                    this.style.backgroundColor = '#d4edda';
                    setTimeout(() => {
                        this.style.backgroundColor = originalBg;
                    }, 500);
                });
            }
        });
    });
});

// 主题切换功能（可选）
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// 加载保存的主题
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});