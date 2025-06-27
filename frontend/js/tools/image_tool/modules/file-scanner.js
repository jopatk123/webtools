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
        console.log('scanWithHandle: 开始扫描', dirHandle.name);
        this.setLoadingState(true);
        
        try {
            console.log('scanWithHandle: 调用 listFiles...');
            const files = await this.listFiles(dirHandle);
            console.log(`scanWithHandle: listFiles 完成, 找到 ${files.length} 个文件/目录条目。`);
            
            const selectedFormats = this.formatFilter.getSelectedFormats();
            
            const imageFiles = files.filter(file => {
                return this.formatFilter.isImageFile(file.name, selectedFormats);
            });
            console.log(`scanWithHandle: 过滤后剩下 ${imageFiles.length} 个图片文件。`);

            const processedImages = await Promise.all(imageFiles.map(async file => ({
                path: file.relativePath || file.name, // 优先使用 relativePath
                size: file.size,
                type: file.type,
                extension: file.name.split('.').pop(),
                url: URL.createObjectURL(file),
                handle: file // 保存文件对象本身以便需要时使用
            })));
            console.log('scanWithHandle: 图片处理完成。');

            return processedImages;
        } catch (error) {
            console.error('scanWithHandle: 扫描时捕获到错误:', error);
            showStatus(this.dom.elements.status, '扫描文件夹时出错', STATUS_TYPES.ERROR);
            throw error;
        } finally {
            console.log('scanWithHandle: 执行 finally 块, 重置加载状态。');
            this.setLoadingState(false);
        }
    }
    
    /**
     * 使用传统路径方式扫描文件
     * @param {string} folderPath - 文件夹路径
     * @returns {Promise<Array>} 图片文件数组
     */
    async scanWithPath(folderPath) {
        // This method is deprecated as backend scanning is insecure and not feasible.
        // We will show a notification to the user and do nothing.
        showStatus(this.dom.elements.status, '手动输入路径扫描已被禁用，请使用“浏览”按钮选择文件夹。', STATUS_TYPES.WARNING);
        return [];
    }
    
    /**
     * 递归列出目录中的所有文件
     * @param {FileSystemDirectoryHandle} dirHandle - 目录句柄
     * @returns {Promise<Array>} 文件数组
     */
    async listFiles(dirHandle, path = '') {
        const files = [];
        console.log(`listFiles: 正在扫描目录: ${path || dirHandle.name}`);
        
        for await (const entry of dirHandle.values()) {
            const newPath = path ? `${path}/${entry.name}` : entry.name;
            if (entry.kind === 'file') {
                try {
                    const file = await entry.getFile();
                    // 附加相对路径，以便调试
                    file.relativePath = newPath;
                    files.push(file);
                } catch (e) {
                    console.warn(`无法访问文件: ${newPath}`, e);
                }
            } else if (entry.kind === 'directory') {
                // 递归扫描子目录
                const subFiles = await this.listFiles(entry, newPath);
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
            // 清除加载状态消息
            showStatus(this.dom.elements.status, '', '');
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