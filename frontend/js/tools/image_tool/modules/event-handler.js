/**
 * 事件处理模块
 */
import { showNotification, debounce } from './utils.js';
import { NOTIFICATION_TYPES } from '../constants.js';

export class EventHandler {
    constructor(domManager, fileScanner, formatFilter, imageDisplay, modalManager) {
        this.dom = domManager;
        this.fileScanner = fileScanner;
        this.formatFilter = formatFilter;
        this.imageDisplay = imageDisplay;
        this.modalManager = modalManager;
        
        this.initializeEvents();
    }
    
    /**
     * 初始化所有事件监听器
     */
    initializeEvents() {
        this.initializeBrowseEvents();
        this.initializeScanEvents();
        this.initializeFormatEvents();
        this.initializeTableEvents();
        this.initializeDragDropEvents();
        this.initializeKeyboardEvents();
        this.initializeWindowEvents();
    }
    
    /**
     * 初始化浏览相关事件
     */
    initializeBrowseEvents() {
        // 浏览文件夹按钮
        this.dom.elements.browseBtn.addEventListener('click', async () => {
            try {
                if ('showDirectoryPicker' in window) {
                    const directoryHandle = await window.showDirectoryPicker();
                    this.dom.elements.folderPath.value = directoryHandle.name;
                    await this.fileScanner.scanWithHandle(directoryHandle);
                } else {
                    showNotification('您的浏览器不支持现代文件系统API，请手动输入路径', NOTIFICATION_TYPES.WARNING);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('浏览文件夹失败:', error);
                    showNotification('浏览文件夹失败', NOTIFICATION_TYPES.ERROR);
                }
            }
        });
    }
    
    /**
     * 初始化扫描相关事件
     */
    initializeScanEvents() {
        // 扫描按钮
        this.dom.elements.scanBtn.addEventListener('click', async () => {
            const folderPath = this.dom.elements.folderPath.value.trim();
            if (!folderPath) {
                showNotification('请先选择或输入文件夹路径', NOTIFICATION_TYPES.WARNING);
                return;
            }
            
            await this.fileScanner.scanWithPath(folderPath);
        });
        
        // 文件夹路径输入框回车事件
        this.dom.elements.folderPath.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const folderPath = e.target.value.trim();
                if (folderPath) {
                    await this.fileScanner.scanWithPath(folderPath);
                }
            }
        });
    }
    
    /**
     * 初始化格式过滤相关事件
     */
    initializeFormatEvents() {
        // 格式过滤器变化事件
        this.dom.elements.formatFilters.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.handleFormatFilterChange();
            }
        });
        
        // 全选/取消全选
        const selectAllBtn = this.dom.elements.formatFilters.querySelector('.select-all-formats');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.formatFilter.selectAllFormats();
                this.handleFormatFilterChange();
            });
        }
        
        const deselectAllBtn = this.dom.elements.formatFilters.querySelector('.deselect-all-formats');
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                this.formatFilter.deselectAllFormats();
                this.handleFormatFilterChange();
            });
        }
    }
    
    /**
     * 初始化表格相关事件
     */
    initializeTableEvents() {
        // 表格排序事件
        this.dom.elements.imageTable.addEventListener('click', (e) => {
            const th = e.target.closest('th[data-sort]');
            if (th) {
                const sortBy = th.dataset.sort;
                this.imageDisplay.toggleSort(sortBy);
            }
        });
        
        // 表格行点击预览事件
        this.dom.elements.imageTable.addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-image-path]');
            if (row && !e.target.closest('button')) {
                const imagePath = row.dataset.imagePath;
                this.modalManager.previewImage(imagePath);
            }
        });
        
        // 复制路径按钮事件
        this.dom.elements.imageTable.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-path-btn')) {
                const imagePath = e.target.dataset.path;
                this.copyImagePath(imagePath);
            }
        });
    }
    
    /**
     * 初始化拖拽事件
     */
    initializeDragDropEvents() {
        const dropZone = this.dom.elements.folderPath;
        
        // 防止默认拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // 拖拽进入和悬停效果
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });
        
        // 拖拽离开效果
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });
        
        // 处理文件拖拽
        dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
    }
    
    /**
     * 初始化键盘事件
     */
    initializeKeyboardEvents() {
        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+F 聚焦搜索框
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = this.dom.elements.imageTable.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl+R 刷新扫描
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                const folderPath = this.dom.elements.folderPath.value.trim();
                if (folderPath) {
                    this.fileScanner.scanWithPath(folderPath);
                }
            }
        });
    }
    
    /**
     * 初始化窗口事件
     */
    initializeWindowEvents() {
        // 窗口大小变化
        window.addEventListener('resize', debounce(() => {
            this.modalManager.handleResize();
        }, 250));
        
        // 页面卸载前清理
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    /**
     * 防止默认拖拽行为
     * @param {Event} e - 事件对象
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    /**
     * 处理文件拖拽
     * @param {DragEvent} e - 拖拽事件
     */
    async handleDrop(e) {
        const dt = e.dataTransfer;
        const items = dt.items;
        
        if (items && items.length > 0) {
            const item = items[0];
            
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                
                if (entry && entry.isDirectory) {
                    // 处理文件夹拖拽
                    this.dom.elements.folderPath.value = entry.name;
                    
                    try {
                        // 使用现代API获取目录句柄
                        if ('showDirectoryPicker' in window) {
                            showNotification('请使用浏览按钮选择文件夹，拖拽功能在某些浏览器中可能受限', NOTIFICATION_TYPES.INFO);
                        } else {
                            showNotification('拖拽文件夹功能需要现代浏览器支持', NOTIFICATION_TYPES.WARNING);
                        }
                    } catch (error) {
                        console.error('处理拖拽文件夹失败:', error);
                        showNotification('处理拖拽文件夹失败', NOTIFICATION_TYPES.ERROR);
                    }
                } else {
                    showNotification('请拖拽文件夹，不是单个文件', NOTIFICATION_TYPES.WARNING);
                }
            }
        }
    }
    
    /**
     * 处理格式过滤器变化
     */
    handleFormatFilterChange() {
        const selectedFormats = this.formatFilter.getSelectedFormats();
        const currentImages = this.imageDisplay.getImages();
        
        if (currentImages.length > 0) {
            const filteredImages = this.formatFilter.filterImagesByFormat(currentImages, selectedFormats);
            this.imageDisplay.setImages(filteredImages);
            this.imageDisplay.displayImages();
            
            // 更新格式统计
            this.formatFilter.updateFormatStats(currentImages);
        }
    }
    
    /**
     * 复制图片路径
     * @param {string} imagePath - 图片路径
     */
    async copyImagePath(imagePath) {
        try {
            await navigator.clipboard.writeText(imagePath);
            showNotification('路径已复制到剪贴板', NOTIFICATION_TYPES.SUCCESS);
        } catch (error) {
            console.error('复制路径失败:', error);
            
            // 降级方案：使用传统方法
            const textArea = document.createElement('textarea');
            textArea.value = imagePath;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('路径已复制到剪贴板', NOTIFICATION_TYPES.SUCCESS);
            } catch (fallbackError) {
                showNotification('复制失败，请手动复制', NOTIFICATION_TYPES.ERROR);
            }
            
            document.body.removeChild(textArea);
        }
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        // 清理可能的定时器、事件监听器等
        // 这里可以添加具体的清理逻辑
    }
    
    /**
     * 销毁事件处理器
     */
    destroy() {
        this.cleanup();
        
        // 移除所有事件监听器
        // 注意：这里只是示例，实际实现中可能需要更详细的清理
        const elements = Object.values(this.dom.elements);
        elements.forEach(element => {
            if (element && element.cloneNode) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
    }
}