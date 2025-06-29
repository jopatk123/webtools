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
        this.previewWindow = null; // 添加预览窗口引用
        
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
        // 在新窗口中打开预览
        this.openPreviewInNewWindow(imagePath, allImages);
    }
    
    /**
     * 在新窗口中打开预览
     * @param {string} imagePath - 图片路径
     * @param {Array} allImages - 所有图片数组
     */
    openPreviewInNewWindow(imagePath, allImages = []) {
        // 检查是否已有预览窗口且未关闭
        if (this.previewWindow && !this.previewWindow.closed) {
            // 复用现有窗口，更新内容
            this.updatePreviewWindow(imagePath, allImages);
            this.previewWindow.focus(); // 将窗口置于前台
            return;
        }
        
        // 创建新窗口
        const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no';
        this.previewWindow = window.open('', 'imagePreview', windowFeatures);
        
        if (!this.previewWindow) {
            showNotification('无法打开预览窗口，请检查浏览器弹窗设置', NOTIFICATION_TYPES.ERROR);
            return;
        }
        
        // 创建预览窗口的HTML内容
        const previewHTML = this.createPreviewHTML(imagePath, allImages);
        this.previewWindow.document.write(previewHTML);
        this.previewWindow.document.close();
        
        // 设置窗口标题
        const fileName = imagePath.split(/[\\/]/).pop();
        this.previewWindow.document.title = `图片预览 - ${fileName}`;
        
        // 监听窗口关闭事件
        this.previewWindow.addEventListener('beforeunload', () => {
            this.previewWindow = null;
        });
    }
    
    /**
     * 更新现有预览窗口的内容
     * @param {string} imagePath - 图片路径
     * @param {Array} allImages - 所有图片数组
     */
    updatePreviewWindow(imagePath, allImages = []) {
        if (!this.previewWindow || this.previewWindow.closed) return;
        
        const currentIndex = allImages.findIndex(img => img.path === imagePath);
        const fileName = imagePath.split(/[\\/]/).pop();
        
        // 更新窗口内容
        if (this.previewWindow.updateImageContent) {
            this.previewWindow.updateImageContent(imagePath, allImages, currentIndex);
        } else {
            // 如果窗口还没有加载完成，重新写入HTML
            const previewHTML = this.createPreviewHTML(imagePath, allImages);
            this.previewWindow.document.open();
            this.previewWindow.document.write(previewHTML);
            this.previewWindow.document.close();
        }
        
        // 更新窗口标题
        this.previewWindow.document.title = `图片预览 - ${fileName}`;
    }
    
    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 创建预览窗口的HTML内容
     * @param {string} imagePath - 图片路径
     * @param {Array} allImages - 所有图片数组
     * @returns {string} HTML内容
     */
    createPreviewHTML(imagePath, allImages) {
        const fileName = imagePath.split(/[\\/]/).pop();
        const currentIndex = allImages.findIndex(img => img.path === imagePath);
        const currentImage = allImages[currentIndex] || { path: imagePath, size: 0, extension: '' };
        
        return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>图片预览 - ${fileName}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    background: #1a1a1a;
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    overflow: hidden;
                }
                
                .preview-container {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .preview-header {
                    background: rgba(0, 0, 0, 0.9);
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #333;
                }
                
                .preview-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .preview-info {
                    font-size: 14px;
                    color: #ccc;
                }
                
                .preview-main {
                    flex: 1;
                    display: flex;
                    position: relative;
                }
                
                .preview-content {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .preview-sidebar {
                    width: 300px;
                    background: rgba(0, 0, 0, 0.9);
                    border-left: 1px solid #333;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                
                .info-section {
                    margin-bottom: 20px;
                }
                
                .info-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #333;
                    padding-bottom: 5px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 13px;
                }
                
                .info-label {
                    color: #ccc;
                    min-width: 80px;
                }
                
                .info-value {
                    color: #fff;
                    text-align: right;
                    word-break: break-all;
                    max-width: 180px;
                }
                
                .toggle-sidebar {
                    position: absolute;
                    top: 50%;
                    right: 300px;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    width: 30px;
                    height: 60px;
                    cursor: pointer;
                    font-size: 16px;
                    z-index: 20;
                    border-radius: 5px 0 0 5px;
                    transition: all 0.3s ease;
                }
                
                .toggle-sidebar:hover {
                    background: rgba(0, 0, 0, 0.9);
                }
                
                .sidebar-hidden .preview-sidebar {
                    transform: translateX(100%);
                }
                
                .sidebar-hidden .toggle-sidebar {
                    right: 0;
                    border-radius: 5px 0 0 5px;
                }
                
                .preview-image {
                    max-width: 95%;
                    max-height: 95%;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                }
                
                .nav-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 10;
                }
                
                .nav-button:hover {
                    background: rgba(0, 0, 0, 0.9);
                    transform: translateY(-50%) scale(1.1);
                }
                
                .nav-button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                
                .prev-btn {
                    left: 20px;
                }
                
                .next-btn {
                    right: 20px;
                }
                
                .close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(220, 53, 69, 0.8);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 10;
                }
                
                .close-btn:hover {
                    background: rgba(220, 53, 69, 1);
                    transform: scale(1.1);
                }
                
                .loading {
                    color: #ccc;
                    font-size: 18px;
                }
                
                .error {
                    color: #ff6b6b;
                    font-size: 18px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="preview-container">
                <div class="preview-header">
                    <div class="preview-title">${fileName}</div>
                    <div class="preview-info">${currentIndex >= 0 ? `${currentIndex + 1} / ${allImages.length}` : ''}</div>
                </div>
                
                <div class="preview-main">
                    <div class="preview-content">
                        <img class="preview-image" src="${imagePath}" alt="${fileName}" 
                             onerror="this.style.display='none'; document.querySelector('.error-message').style.display='block'"
                             onload="updateImageInfo(this)">
                        
                        <div class="error-message error" style="display: none;">
                            <p>无法加载图片</p>
                            <p style="font-size: 14px; margin-top: 10px;">${imagePath}</p>
                        </div>
                        
                        ${allImages.length > 1 ? `
                            <button class="nav-button prev-btn" onclick="navigateImage(-1)" ${currentIndex <= 0 ? 'disabled' : ''}>‹</button>
                            <button class="nav-button next-btn" onclick="navigateImage(1)" ${currentIndex >= allImages.length - 1 ? 'disabled' : ''}>›</button>
                        ` : ''}
                        
                        <button class="close-btn" onclick="window.close()">×</button>
                    </div>
                    
                    <button class="toggle-sidebar" onclick="toggleSidebar()">‹</button>
                    
                    <div class="preview-sidebar">
                        <div class="info-section">
                            <div class="info-title">文件信息</div>
                            <div class="info-item">
                                <span class="info-label">文件名:</span>
                                <span class="info-value" id="file-name">${fileName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">文件大小:</span>
                                <span class="info-value" id="file-size">${this.formatFileSize(currentImage.size)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">文件类型:</span>
                                <span class="info-value" id="file-type">${currentImage.extension.toUpperCase()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">文件路径:</span>
                                <span class="info-value" id="file-path" title="${imagePath}">${imagePath}</span>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <div class="info-title">图片信息</div>
                            <div class="info-item">
                                <span class="info-label">分辨率:</span>
                                <span class="info-value" id="image-resolution">加载中...</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">宽度:</span>
                                <span class="info-value" id="image-width">-</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">高度:</span>
                                <span class="info-value" id="image-height">-</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">宽高比:</span>
                                <span class="info-value" id="image-ratio">-</span>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <div class="info-title">操作</div>
                            <button onclick="copyToClipboard('${imagePath}')" style="width: 100%; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">复制路径</button>
                            <button onclick="openInExplorer('${imagePath}')" style="width: 100%; padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">在资源管理器中显示</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                const allImages = ${JSON.stringify(allImages)};
                let currentIndex = ${currentIndex};
                let sidebarVisible = true;
                
                // 格式化文件大小
                function formatFileSize(bytes) {
                    if (bytes === 0) return '0 B';
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                }
                
                // 更新图片信息
                function updateImageInfo(img) {
                    if (img.complete && img.naturalWidth !== 0) {
                        const width = img.naturalWidth;
                        const height = img.naturalHeight;
                        const ratio = (width / height).toFixed(2);
                        
                        document.getElementById('image-resolution').textContent = \`\${width} × \${height}\`;
                        document.getElementById('image-width').textContent = \`\${width}px\`;
                        document.getElementById('image-height').textContent = \`\${height}px\`;
                        document.getElementById('image-ratio').textContent = ratio;
                    }
                }
                
                // 切换侧边栏
                function toggleSidebar() {
                    const container = document.querySelector('.preview-container');
                    const toggleBtn = document.querySelector('.toggle-sidebar');
                    
                    sidebarVisible = !sidebarVisible;
                    
                    if (sidebarVisible) {
                        container.classList.remove('sidebar-hidden');
                        toggleBtn.textContent = '‹';
                    } else {
                        container.classList.add('sidebar-hidden');
                        toggleBtn.textContent = '›';
                    }
                }
                
                // 复制到剪贴板
                function copyToClipboard(text) {
                    navigator.clipboard.writeText(text).then(() => {
                        alert('路径已复制到剪贴板');
                    }).catch(() => {
                        // 降级方案
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('路径已复制到剪贴板');
                    });
                }
                
                // 在资源管理器中显示
                function openInExplorer(path) {
                    alert('此功能需要桌面应用支持');
                }
                
                // 更新图片内容（供外部调用）
                function updateImageContent(imagePath, images, index) {
                    allImages.length = 0;
                    allImages.push(...images);
                    currentIndex = index;
                    
                    const currentImage = allImages[currentIndex] || { path: imagePath, size: 0, extension: '' };
                    const fileName = imagePath.split(/[\\\//]).pop();
                    
                    // 更新图片
                    const img = document.querySelector('.preview-image');
                    const errorMsg = document.querySelector('.error-message');
                    
                    img.style.display = 'block';
                    errorMsg.style.display = 'none';
                    img.src = imagePath;
                    
                    // 更新标题和信息
                    document.querySelector('.preview-title').textContent = fileName;
                    document.querySelector('.preview-info').textContent = \`\${currentIndex + 1} / \${allImages.length}\`;
                    
                    // 更新文件信息
                    document.getElementById('file-name').textContent = fileName;
                    document.getElementById('file-size').textContent = formatFileSize(currentImage.size);
                    document.getElementById('file-type').textContent = currentImage.extension.toUpperCase();
                    document.getElementById('file-path').textContent = imagePath;
                    document.getElementById('file-path').title = imagePath;
                    
                    // 重置图片信息
                    document.getElementById('image-resolution').textContent = '加载中...';
                    document.getElementById('image-width').textContent = '-';
                    document.getElementById('image-height').textContent = '-';
                    document.getElementById('image-ratio').textContent = '-';
                    
                    // 更新按钮状态
                    const prevBtn = document.querySelector('.prev-btn');
                    const nextBtn = document.querySelector('.next-btn');
                    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
                    if (nextBtn) nextBtn.disabled = currentIndex >= allImages.length - 1;
                    
                    // 更新操作按钮
                    const copyBtn = document.querySelector('.info-section button[onclick*="copyToClipboard"]');
                    const explorerBtn = document.querySelector('.info-section button[onclick*="openInExplorer"]');
                    if (copyBtn) copyBtn.setAttribute('onclick', \`copyToClipboard('\${imagePath}')\`);
                    if (explorerBtn) explorerBtn.setAttribute('onclick', \`openInExplorer('\${imagePath}')\`);
                }
                
                // 导航图片
                function navigateImage(direction) {
                    const newIndex = currentIndex + direction;
                    if (newIndex >= 0 && newIndex < allImages.length) {
                        const newImage = allImages[newIndex];
                        updateImageContent(newImage.path, allImages, newIndex);
                    }
                }
                
                // 暴露更新函数到全局
                window.updateImageContent = updateImageContent;
                
                // 键盘导航
                document.addEventListener('keydown', (e) => {
                    switch(e.key) {
                        case 'ArrowLeft':
                            navigateImage(-1);
                            break;
                        case 'ArrowRight':
                            navigateImage(1);
                            break;
                        case 'Escape':
                            window.close();
                            break;
                        case 'F11':
                            e.preventDefault();
                            break;
                    }
                });
                
                // 防止右键菜单
                document.addEventListener('contextmenu', (e) => e.preventDefault());
                
                // 初始化图片信息
                document.addEventListener('DOMContentLoaded', () => {
                    const img = document.querySelector('.preview-image');
                    if (img.complete) {
                        updateImageInfo(img);
                    }
                });
            </script>
        </body>
        </html>
        `;
    }
    
    /**
     * 旧的预览方法（保持兼容性）
     * @param {string} imagePath - 图片路径
     * @param {Array} allImages - 所有图片数组
     */
    previewImageOld(imagePath, allImages = []) {
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