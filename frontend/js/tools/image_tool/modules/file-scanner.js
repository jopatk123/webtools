/**
 * 文件扫描模块
 */
import { SUPPORTED_FORMATS, STATUS_TYPES } from '../constants.js';
import { showStatus } from './utils.js';

export class FileScanner {
    constructor(domManager, formatFilter) {
        this.dom = domManager;
        this.formatFilter = formatFilter;
    }
    
    /**
     * 使用现代文件系统API扫描文件
     * @param {FileSystemDirectoryHandle} dirHandle - 目录句柄
     * @returns {Promise<Array>} 图片文件数组
     */
    async scanWithHandle(dirHandle) {
        this.setLoadingState(true);
        
        try {
            const files = await this.listFiles(dirHandle);
            const selectedFormats = this.formatFilter.getSelectedFormats();
            
            const imageFiles = files.filter(file => {
                return this.formatFilter.isImageFile(file.name, selectedFormats);
            });

            const processedImages = await Promise.all(imageFiles.map(async file => ({
                path: file.name, 
                size: file.size,
                type: file.type,
                extension: file.name.split('.').pop(),
                url: URL.createObjectURL(file),
                handle: file // 保存文件对象本身以便需要时使用
            })));

            return processedImages;
        } catch (error) {
            console.error('Error scanning with handle:', error);
            showStatus(this.dom.elements.status, '扫描文件夹时出错', STATUS_TYPES.ERROR);
            throw error;
        } finally {
            this.setLoadingState(false);
        }
    }
    
    /**
     * 使用传统路径方式扫描文件
     * @param {string} folderPath - 文件夹路径
     * @returns {Promise<Array>} 图片文件数组
     */
    async scanWithPath(folderPath) {
        this.setLoadingState(true);
        
        try {
            const response = await fetch(`/api/scan-images?path=${encodeURIComponent(folderPath)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            const allImages = data.images || [];
            return this.formatFilter.filterImagesByFormat(allImages);
        } catch (error) {
            console.error('扫描错误:', error);
            showStatus(this.dom.elements.status, '扫描失败: ' + error.message, STATUS_TYPES.ERROR);
            throw error;
        } finally {
            this.setLoadingState(false);
        }
    }
    
    /**
     * 递归列出目录中的所有文件
     * @param {FileSystemDirectoryHandle} dirHandle - 目录句柄
     * @returns {Promise<Array>} 文件数组
     */
    async listFiles(dirHandle) {
        const files = [];
        
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file') {
                const file = await entry.getFile();
                files.push(file);
            } else if (entry.kind === 'directory') {
                // 递归扫描子目录
                const subFiles = await this.listFiles(entry);
                files.push(...subFiles);
            }
        }
        
        return files;
    }
    
    /**
     * 设置加载状态
     * @param {boolean} loading - 是否正在加载
     */
    setLoadingState(loading) {
        const scanBtn = this.dom.elements.scanBtn;
        
        if (loading) {
            showStatus(this.dom.elements.status, '正在扫描...', STATUS_TYPES.LOADING);
            scanBtn.disabled = true;
            scanBtn.classList.add('loading');
            this.dom.toggleElement('resultsArea', false);
            this.dom.toggleElement('emptyState', false);
        } else {
            scanBtn.disabled = false;
            scanBtn.classList.remove('loading');
        }
    }
    
    /**
     * 验证文件夹路径
     * @param {string} folderPath - 文件夹路径
     * @returns {boolean} 路径是否有效
     */
    validateFolderPath(folderPath) {
        if (!folderPath || folderPath.trim() === '') {
            showStatus(this.dom.elements.status, '请先选择一个文件夹', STATUS_TYPES.ERROR);
            return false;
        }
        
        // 检查路径格式（简单验证）
        if (folderPath.includes('<') || folderPath.includes('>')) {
            showStatus(this.dom.elements.status, '文件夹路径格式无效', STATUS_TYPES.ERROR);
            return false;
        }
        
        return true;
    }
    
    /**
     * 清理blob URLs
     * @param {Array} images - 图片数组
     */
    cleanupBlobUrls(images) {
        images.forEach(img => {
            if (img.url && img.url.startsWith('blob:')) {
                URL.revokeObjectURL(img.url);
            }
        });
    }
    
    /**
     * 获取扫描统计信息
     * @param {Array} allImages - 所有图片
     * @param {Array} filteredImages - 过滤后的图片
     * @returns {Object} 统计信息
     */
    getScanStats(allImages, filteredImages) {
        return {
            total: allImages.length,
            filtered: filteredImages.length,
            formats: this.formatFilter.getFormatStats(allImages)
        };
    }
    
    /**
     * 生成扫描结果消息
     * @param {Object} stats - 统计信息
     * @returns {Object} 包含消息和类型的对象
     */
    generateScanMessage(stats) {
        const { total, filtered } = stats;
        
        if (total === 0) {
            return {
                message: '未找到图片文件',
                type: STATUS_TYPES.WARNING
            };
        }
        
        if (filtered === 0) {
            return {
                message: `找到 ${total} 张图片，但没有符合选定格式的图片`,
                type: STATUS_TYPES.WARNING
            };
        }
        
        if (filtered === total) {
            return {
                message: `成功扫描到 ${filtered} 张图片`,
                type: STATUS_TYPES.SUCCESS
            };
        }
        
        return {
            message: `成功扫描到 ${filtered} 张图片（共 ${total} 张）`,
            type: STATUS_TYPES.SUCCESS
        };
    }
}