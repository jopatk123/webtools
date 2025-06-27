/**
 * 工具函数模块
 */
import { FILE_SIZE_UNITS, NOTIFICATION_TYPES, NOTIFICATION_DURATION } from '../constants.js';

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + FILE_SIZE_UNITS[i];
}

/**
 * 显示通知消息
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型
 */
export function showNotification(message, type = NOTIFICATION_TYPES.INFO) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    const colors = {
        [NOTIFICATION_TYPES.SUCCESS]: '#10b981',
        [NOTIFICATION_TYPES.ERROR]: '#ef4444',
        [NOTIFICATION_TYPES.WARNING]: '#f59e0b',
        [NOTIFICATION_TYPES.INFO]: '#6366f1'
    };
    notification.style.backgroundColor = colors[type] || colors[NOTIFICATION_TYPES.INFO];
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, NOTIFICATION_DURATION);
}

/**
 * 显示状态消息
 * @param {HTMLElement} statusDiv - 状态显示元素
 * @param {string} message - 状态消息
 * @param {string} type - 状态类型
 */
export function showStatus(statusDiv, message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // 自动隐藏成功消息
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
        }, 3000);
    }
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('路径已复制到剪贴板', NOTIFICATION_TYPES.SUCCESS);
    } catch (error) {
        showNotification('复制失败', NOTIFICATION_TYPES.ERROR);
        throw error;
    }
}

/**
 * 将kebab-case转换为camelCase
 * @param {string} str - kebab-case字符串
 * @returns {string} camelCase字符串
 */
export function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}