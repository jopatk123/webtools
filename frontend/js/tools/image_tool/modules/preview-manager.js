/**
 * 图片预览管理模块
 */
import { showNotification } from './utils.js';
import { NOTIFICATION_TYPES } from '../constants.js';

export class PreviewManager {
    constructor(domManager) {
        this.dom = domManager;
        this.currentImages = [];
        this.currentIndex = 0;
        this.previewModal = null;
        this.isInitialized = false;
        
        this.initializePreviewModal();
    }
    
    /**
     * 初始化预览模态框
     */
    initializePreviewModal() {
        // 动态加载预览模态框HTML
        this.loadPreviewHTML().then(() => {
            this.setupPreviewEvents();
            this.isInitialized = true;
        });
    }
    
    /**
     * 加载预览HTML
     */
    async loadPreviewHTML() {
        try {
            const response = await fetch('../../../components/image_preview.html');
            const html = await response.text();
            
            // 创建临时容器来解析HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 将预览模态框添加到body
            this.previewModal = tempDiv.firstElementChild;
            document.body.appendChild(this.previewModal);
            
        } catch (error) {
            console.error('加载预览界面失败:', error);
            showNotification('预览界面加载失败', NOTIFICATION_TYPES.ERROR);
        }
    }
    
    /**
     * 设置预览事件
     */
    setupPreviewEvents() {
        if (!this.previewModal) return;
        
        // 关闭按钮
        const closeBtn = this.previewModal.querySelector('#close-preview-btn');
        closeBtn?.addEventListener('click', () => this.closePreview());
        
        // 上一张/下一张按钮
        const prevBtn = this.previewModal.querySelector('#prev-image-btn');
        const nextBtn = this.previewModal.querySelector('#next-image-btn');
        
        prevBtn?.addEventListener('click', () => this.showPrevious());
        nextBtn?.addEventListener('click', () => this.showNext());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (!this.isPreviewOpen()) return;
            
            switch (e.key) {
                case 'Escape':
                    this.closePreview();
                    break;
                case 'ArrowLeft':
                    this.showPrevious();
                    break;
                case 'ArrowRight':
                    this.showNext();
                    break;
            }
        });
        
        // 点击背景关闭
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) {
                this.closePreview();
            }
        });
    }
    
    /**
     * 预览图片
     * @param {string} imagePath - 图片路径
     * @param {Array} allImages - 所有图片数组
     */
    previewImage(imagePath, allImages = []) {
        if (!this.isInitialized) {
            showNotification('预览界面尚未初始化', NOTIFICATION_TYPES.WARNING);
            return;
        }
        
        this.currentImages = allImages;
        this.currentIndex = allImages.findIndex(img => img.path === imagePath);
        
        if (this.currentIndex === -1) {
            this.currentIndex = 0;
        }
        
        this.showCurrentImage();
        this.openPreview();
    }
    
    /**
     * 显示当前图片
     */
    async showCurrentImage() {
        if (!this.previewModal || this.currentImages.length === 0) return;
        
        const currentImage = this.currentImages[this.currentIndex];
        const previewImg = this.previewModal.querySelector('#preview-image');
        const loadingSpinner = this.previewModal.querySelector('#preview-loading');
        
        // 显示加载状态
        loadingSpinner?.classList.add('active');
        previewImg?.classList.add('loading');
        
        try {
            // 设置图片源
            const imageSrc = this.getImageSrc(currentImage);
            previewImg.src = imageSrc;
            
            // 等待图片加载
            await this.waitForImageLoad(previewImg);
            
            // 更新图片信息
            this.updateImageInfo(currentImage);
            
            // 更新导航按钮状态
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('图片加载失败:', error);
            showNotification('图片加载失败', NOTIFICATION_TYPES.ERROR);
        } finally {
            // 隐藏加载状态
            loadingSpinner?.classList.remove('active');
            previewImg?.classList.remove('loading');
        }
    }
    
    /**
     * 获取图片源地址
     * @param {Object} image - 图片对象
     * @returns {string} 图片源地址
     */
    getImageSrc(image) {
        if (image.url && image.url.startsWith('blob:')) {
            return image.url;
        }
        
        // 对于本地文件路径，使用API端点
        return `/api/get-image?path=${encodeURIComponent(image.path)}`;
    }
    
    /**
     * 等待图片加载完成
     * @param {HTMLImageElement} img - 图片元素
     * @returns {Promise} 加载Promise
     */
    waitForImageLoad(img) {
        return new Promise((resolve, reject) => {
            if (img.complete) {
                resolve();
                return;
            }
            
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('图片加载失败'));
        });
    }
    
    /**
     * 更新图片信息
     * @param {Object} image - 图片对象
     */
    async updateImageInfo(image) {
        if (!this.previewModal) return;
        
        // 基本信息
        this.setInfoValue('info-path', image.path);
        this.setInfoValue('info-size', this.formatFileSize(image.size));
        this.setInfoValue('info-type', image.extension.toUpperCase());
        
        // 获取图片尺寸
        const previewImg = this.previewModal.querySelector('#preview-image');
        if (previewImg && previewImg.naturalWidth) {
            this.setInfoValue('info-dimensions', `${previewImg.naturalWidth} × ${previewImg.naturalHeight}`);
        }
        
        // 修改时间
        if (image.lastModified) {
            const date = new Date(image.lastModified);
            this.setInfoValue('info-modified', date.toLocaleString());
        }
        
        // GPS信息（如果有的话）
        try {
            const gpsInfo = await this.extractGPSInfo(image);
            this.setInfoValue('info-gps', gpsInfo || '无');
        } catch (error) {
            this.setInfoValue('info-gps', '无');
        }
    }
    
    /**
     * 设置信息值
     * @param {string} id - 元素ID
     * @param {string} value - 值
     */
    setInfoValue(id, value) {
        const element = this.previewModal?.querySelector(`#${id}`);
        if (element) {
            element.textContent = value;
        }
    }
    
    /**
     * 提取GPS信息
     * @param {Object} image - 图片对象
     * @returns {Promise<string>} GPS信息
     */
    async extractGPSInfo(image) {
        // 这里可以使用EXIF.js库来提取GPS信息
        // 暂时返回无，后续可以扩展
        return null;
    }
    
    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
    
    /**
     * 更新导航按钮状态
     */
    updateNavigationButtons() {
        if (!this.previewModal) return;
        
        const prevBtn = this.previewModal.querySelector('#prev-image-btn');
        const nextBtn = this.previewModal.querySelector('#next-image-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentIndex <= 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentIndex >= this.currentImages.length - 1;
        }
    }
    
    /**
     * 显示上一张图片
     */
    showPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.showCurrentImage();
        }
    }
    
    /**
     * 显示下一张图片
     */
    showNext() {
        if (this.currentIndex < this.currentImages.length - 1) {
            this.currentIndex++;
            this.showCurrentImage();
        }
    }
    
    /**
     * 打开预览
     */
    openPreview() {
        if (this.previewModal) {
            this.previewModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * 关闭预览
     */
    closePreview() {
        if (this.previewModal) {
            this.previewModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * 检查预览是否打开
     * @returns {boolean} 是否打开
     */
    isPreviewOpen() {
        return this.previewModal?.classList.contains('active') || false;
    }
}