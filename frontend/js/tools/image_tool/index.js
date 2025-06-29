/**
 * 图片工具主入口文件
 * 整合所有模块，提供统一的初始化接口
 */
import { DomManager } from './modules/dom-manager.js';
import { FormatFilter } from './modules/format-filter.js';
import { FileScanner } from './modules/file-scanner.js';
import { ImageDisplay } from './modules/image-display.js';
import { ModalManager } from './modules/modal-manager.js';
import { PreviewManager } from './modules/preview-manager.js';
import { EventHandler } from './modules/event-handler.js';
import { showNotification, showStatus } from './modules/utils.js';
import { NOTIFICATION_TYPES, STATUS_TYPES } from './constants.js';

/**
 * 图片工具应用类
 */
class ImageToolApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }
    
    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('开始初始化图片工具...');
            const statusElement = document.getElementById('status');
            showStatus(statusElement, '正在初始化图片工具...', STATUS_TYPES.LOADING);
            
            // 初始化DOM管理器
            console.log('初始化DOM管理器...');
            this.modules.domManager = new DomManager();
            
            // 检查必需的DOM元素
            console.log('验证DOM元素...');
            if (!this.modules.domManager.validateElements()) {
                throw new Error('缺少必需的DOM元素');
            }
            console.log('DOM元素验证通过');
            
            // 初始化格式过滤器
            this.modules.formatFilter = new FormatFilter(this.modules.domManager);
            
            // 初始化文件扫描器
            this.modules.fileScanner = new FileScanner(
                this.modules.domManager, 
                this.modules.formatFilter
            );
            
            // 初始化图片显示器
            this.modules.imageDisplay = new ImageDisplay(
                this.modules.domManager,
                this.modules.formatFilter
            );
            
            // 初始化模态框管理器
            this.modules.modalManager = new ModalManager(this.modules.domManager);
            
            // 初始化预览管理器
            this.modules.previewManager = new PreviewManager();
            
            // 初始化事件处理器
            console.log('初始化事件处理器...');
            this.modules.eventHandler = new EventHandler(
                this.modules.domManager,
                this.modules.fileScanner,
                this.modules.formatFilter,
                this.modules.imageDisplay,
                this.modules.modalManager,
                this.modules.previewManager
            );
            console.log('事件处理器初始化完成');
            
            // 设置模块间的引用关系
            this.setupModuleReferences();
            
            // 初始化完成
            this.isInitialized = true;
            showStatus(statusElement, '图片工具初始化完成', STATUS_TYPES.SUCCESS);
            
            // 自动隐藏成功状态
            setTimeout(() => {
                showStatus(statusElement, '', STATUS_TYPES.IDLE);
            }, 2000);
            
            console.log('图片工具初始化完成');
            
        } catch (error) {
            console.error('图片工具初始化失败:', error);
            const statusElement = document.getElementById('status');
            if (statusElement) {
                showStatus(statusElement, '初始化失败: ' + error.message, STATUS_TYPES.ERROR);
            }
            showNotification('图片工具初始化失败', NOTIFICATION_TYPES.ERROR);
        }
    }
    
    /**
     * 设置模块间的引用关系
     */
    setupModuleReferences() {
        // EventHandler 需要所有模块，已经在构造函数中注入

        // ImageDisplay 需要 ModalManager 来处理预览
        if (this.modules.imageDisplay && this.modules.modalManager) {
            this.modules.imageDisplay.setModalManager(this.modules.modalManager);
        }

        // FileScanner 完成扫描后，结果由 EventHandler 传递给 ImageDisplay
        // 因此 FileScanner 不需要直接引用 ImageDisplay

        // 将主应用实例暴露给全局，供调试使用
        window.imageToolApp = this;
    }
    
    /**
     * 获取指定模块
     * @param {string} moduleName - 模块名称
     * @returns {Object|null} 模块实例
     */
    getModule(moduleName) {
        return this.modules[moduleName] || null;
    }
    
    /**
     * 检查应用是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isReady() {
        return this.isInitialized;
    }
    
    /**
     * 重新初始化应用
     */
    async reinit() {
        if (this.isInitialized) {
            this.destroy();
        }
        await this.init();
    }
    
    /**
     * 销毁应用，清理所有资源
     */
    destroy() {
        try {
            // 销毁各个模块
            Object.values(this.modules).forEach(module => {
                if (module && typeof module.destroy === 'function') {
                    module.destroy();
                }
            });
            
            // 清空模块引用
            this.modules = {};
            this.isInitialized = false;
            
            // 清除全局引用
            if (window.imageToolApp === this) {
                delete window.imageToolApp;
            }
            
            console.log('图片工具已销毁');
            
        } catch (error) {
            console.error('销毁图片工具时出错:', error);
        }
    }
    
    /**
     * 获取应用状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            modules: Object.keys(this.modules),
            version: '2.0.0',
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * 导出当前配置
     * @returns {Object} 配置对象
     */
    exportConfig() {
        if (!this.isInitialized) {
            return null;
        }
        
        return {
            selectedFormats: this.modules.formatFilter?.getSelectedFormats() || [],
            sortConfig: this.modules.imageDisplay?.getSortConfig() || {},
            lastScanPath: this.modules.domManager?.elements.folderPath?.value || ''
        };
    }
    
    /**
     * 导入配置
     * @param {Object} config - 配置对象
     */
    importConfig(config) {
        if (!this.isInitialized || !config) {
            return;
        }
        
        try {
            // 恢复格式选择
            if (config.selectedFormats && this.modules.formatFilter) {
                this.modules.formatFilter.setSelectedFormats(config.selectedFormats);
            }
            
            // 恢复排序配置
            if (config.sortConfig && this.modules.imageDisplay) {
                this.modules.imageDisplay.setSortConfig(config.sortConfig);
            }
            
            // 恢复路径
            if (config.lastScanPath && this.modules.domManager) {
                this.modules.domManager.elements.folderPath.value = config.lastScanPath;
            }
            
            showNotification('配置已恢复', NOTIFICATION_TYPES.SUCCESS);
            
        } catch (error) {
            console.error('导入配置失败:', error);
            showNotification('配置恢复失败', NOTIFICATION_TYPES.ERROR);
        }
    }
}

// 创建全局应用实例
const app = new ImageToolApp();

// DOM加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    // 如果DOM已经加载完成，延迟一点时间确保动态内容已渲染
    setTimeout(() => app.init(), 100);
}

// 导出应用实例供外部使用
export default app;
export { ImageToolApp };

// 为了兼容性，也将应用实例挂载到全局
window.imageToolApp = app;