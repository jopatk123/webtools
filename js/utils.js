// 工具类模块 - 提供通用的辅助函数
import { getConfig } from './config.js';

// 存储工具类
export class StorageUtils {
    static getPrefix() {
        return getConfig('STORAGE.PREFIX', 'toolbox-');
    }

    static set(key, value) {
        try {
            const prefixedKey = this.getPrefix() + key;
            localStorage.setItem(prefixedKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('存储失败:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const prefixedKey = this.getPrefix() + key;
            const item = localStorage.getItem(prefixedKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取存储失败:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            const prefixedKey = this.getPrefix() + key;
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.error('删除存储失败:', error);
            return false;
        }
    }

    static clear() {
        try {
            const prefix = this.getPrefix();
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('清空存储失败:', error);
            return false;
        }
    }
}

// 验证工具类
export class ValidationUtils {
    static isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isNumber(value) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    }

    static isInteger(value) {
        return Number.isInteger(Number(value));
    }

    static isPositive(value) {
        return this.isNumber(value) && Number(value) > 0;
    }

    static isInRange(value, min, max) {
        const num = Number(value);
        return this.isNumber(value) && num >= min && num <= max;
    }

    static isHexColor(color) {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(color);
    }

    static isJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }
}

// 格式化工具类
export class FormatUtils {
    static formatNumber(num, decimals = 2) {
        return Number(num).toFixed(decimals);
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    static truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }
}

// DOM工具类
export class DOMUtils {
    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }

    static addEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    }

    static removeAllChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    static scrollToElement(element, behavior = 'smooth') {
        element.scrollIntoView({ behavior, block: 'start' });
    }
}

// 性能工具类
export class PerformanceUtils {
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static measureTime(name, func) {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`${name} 执行时间: ${end - start} 毫秒`);
        return result;
    }

    static async measureAsyncTime(name, asyncFunc) {
        const start = performance.now();
        const result = await asyncFunc();
        const end = performance.now();
        console.log(`${name} 执行时间: ${end - start} 毫秒`);
        return result;
    }
}

// 数学工具类
export class MathUtils {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min, max, decimals = 2) {
        const value = Math.random() * (max - min) + min;
        return Number(value.toFixed(decimals));
    }

    static roundTo(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    static percentage(value, total) {
        return total === 0 ? 0 : (value / total) * 100;
    }

    static gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    static lcm(a, b) {
        return Math.abs(a * b) / this.gcd(a, b);
    }
}

// 字符串工具类
export class StringUtils {
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static camelCase(str) {
        return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
    }

    static kebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static snakeCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }

    static removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    static generateRandomString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    static escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static unescapeHtml(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent || div.innerText || '';
    }
}

// 异步工具类
export class AsyncUtils {
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static timeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('操作超时')), ms)
            )
        ]);
    }

    static retry(asyncFunc, maxAttempts = 3, delay = 1000) {
        return new Promise(async (resolve, reject) => {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const result = await asyncFunc();
                    resolve(result);
                    return;
                } catch (error) {
                    if (attempt === maxAttempts) {
                        reject(error);
                        return;
                    }
                    await this.sleep(delay * attempt);
                }
            }
        });
    }
}

// 导出所有工具类
export default {
    StorageUtils,
    ValidationUtils,
    FormatUtils,
    DOMUtils,
    PerformanceUtils,
    MathUtils,
    StringUtils,
    AsyncUtils
};