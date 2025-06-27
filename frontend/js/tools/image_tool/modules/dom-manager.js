/**
 * DOM元素管理模块
 */
import { toCamelCase } from './utils.js';

export class DomManager {
    constructor() {
        this.elements = this.initializeElements();
    }
    
    /**
     * 初始化所有必需的DOM元素
     * @returns {Object} 包含所有DOM元素的对象
     */
    initializeElements() {
        const requiredElements = [
            'folder-path', 'browse-btn', 'scan-btn', 
            'status', 'results-area', 'empty-state',
            'image-count', 'image-table', 'image-table-body',
            'image-modal', 'modal-image', 'modal-close'
        ];
        
        const elements = {};
        
        // 检查并获取必需元素
        for (const id of requiredElements) {
            const element = document.getElementById(id);
            if (!element) {
                throw new Error(`Required element not found: ${id}`);
            }
            elements[toCamelCase(id)] = element;
        }
        
        // 获取其他元素
        elements.formatCheckboxes = document.querySelectorAll('.format-filters input[type="checkbox"]');
        elements.inputGroup = document.querySelector('.input-group');
        elements.sortableHeaders = document.querySelectorAll('.sortable');
        
        return elements;
    }
    
    /**
     * 获取指定的DOM元素
     * @param {string} elementName - 元素名称（camelCase）
     * @returns {HTMLElement|null} DOM元素
     */
    getElement(elementName) {
        return this.elements[elementName] || null;
    }
    
    /**
     * 检查所有必需元素是否存在
     * @returns {boolean} 是否所有元素都存在
     */
    validateElements() {
        const requiredElements = [
            'folderPath', 'browseBtn', 'scanBtn', 
            'status', 'resultsArea', 'emptyState',
            'imageCount', 'imageTable', 'imageTableBody',
            'imageModal', 'modalImage', 'modalClose'
        ];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                console.error(`Missing required element: ${elementName}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 显示或隐藏元素
     * @param {string} elementName - 元素名称
     * @param {boolean} show - 是否显示
     */
    toggleElement(elementName, show) {
        const element = this.getElement(elementName);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }
    
    /**
     * 设置元素的文本内容
     * @param {string} elementName - 元素名称
     * @param {string} text - 文本内容
     */
    setText(elementName, text) {
        const element = this.getElement(elementName);
        if (element) {
            element.textContent = text;
        }
    }
    
    /**
     * 设置元素的HTML内容
     * @param {string} elementName - 元素名称
     * @param {string} html - HTML内容
     */
    setHTML(elementName, html) {
        const element = this.getElement(elementName);
        if (element) {
            element.innerHTML = html;
        }
    }
    
    /**
     * 添加CSS类
     * @param {string} elementName - 元素名称
     * @param {string} className - CSS类名
     */
    addClass(elementName, className) {
        const element = this.getElement(elementName);
        if (element) {
            element.classList.add(className);
        }
    }
    
    /**
     * 移除CSS类
     * @param {string} elementName - 元素名称
     * @param {string} className - CSS类名
     */
    removeClass(elementName, className) {
        const element = this.getElement(elementName);
        if (element) {
            element.classList.remove(className);
        }
    }
    
    /**
     * 设置元素属性
     * @param {string} elementName - 元素名称
     * @param {string} attribute - 属性名
     * @param {string} value - 属性值
     */
    setAttribute(elementName, attribute, value) {
        const element = this.getElement(elementName);
        if (element) {
            element.setAttribute(attribute, value);
        }
    }
    
    /**
     * 获取元素属性值
     * @param {string} elementName - 元素名称
     * @param {string} attribute - 属性名
     * @returns {string|null} 属性值
     */
    getAttribute(elementName, attribute) {
        const element = this.getElement(elementName);
        return element ? element.getAttribute(attribute) : null;
    }
}