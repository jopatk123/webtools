// 生成工具模块
export class Generators {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('passwordLength')?.addEventListener('input', () => this.updateLengthDisplay());
        document.querySelector('button[onclick="generatePassword()"]')?.addEventListener('click', () => this.generatePassword());
        document.querySelector('button[onclick="copyPassword()"]')?.addEventListener('click', () => this.copyPassword());
        document.querySelector('button[onclick="generateQR()"]')?.addEventListener('click', () => this.generateQR());
    }

    // 更新密码长度显示
    updateLengthDisplay() {
        const length = document.getElementById('passwordLength').value;
        document.getElementById('lengthDisplay').textContent = length;
    }

    // 生成密码
    generatePassword() {
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

    // 复制密码
    copyPassword() {
        const password = document.getElementById('generatedPassword');
        password.select();
        document.execCommand('copy');
        alert('密码已复制到剪贴板');
    }

    // 生成二维码
    generateQR() {
        const text = document.getElementById('qrInput').value;
        if (!text.trim()) {
            alert('请输入要生成二维码的内容');
            return;
        }
        
        const qrContainer = document.getElementById('qrResult');
        qrContainer.innerHTML = '';
        
        // 检查QRCode库是否可用
        if (typeof QRCode !== 'undefined') {
            QRCode.toCanvas(text, { width: 200, margin: 2 }, function(error, canvas) {
                if (error) {
                    qrContainer.innerHTML = '生成失败: ' + error.message;
                } else {
                    qrContainer.appendChild(canvas);
                }
            });
        } else {
            qrContainer.innerHTML = '二维码库未加载，请刷新页面重试';
        }
    }

    // 生成UUID
    generateUUID() {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        
        const resultElement = document.getElementById('uuidResult');
        if (resultElement) {
            resultElement.value = uuid;
        }
        return uuid;
    }

    // 生成随机数
    generateRandomNumber() {
        const min = parseInt(document.getElementById('randomMin')?.value || 1);
        const max = parseInt(document.getElementById('randomMax')?.value || 100);
        
        if (min >= max) {
            alert('最小值必须小于最大值');
            return;
        }
        
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        const resultElement = document.getElementById('randomResult');
        if (resultElement) {
            resultElement.textContent = randomNum;
        }
        return randomNum;
    }

    // 生成随机字符串
    generateRandomString() {
        const length = parseInt(document.getElementById('stringLength')?.value || 10);
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        const resultElement = document.getElementById('stringResult');
        if (resultElement) {
            resultElement.value = result;
        }
        return result;
    }
}

export { Generators };