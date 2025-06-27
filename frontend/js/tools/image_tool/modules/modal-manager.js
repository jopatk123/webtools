/**
 * 模态框管理模块
 */
import { showNotification } from './utils.js';
import { NOTIFICATION_TYPES } from '../constants.js';

export class ModalManager {
    constructor(domManager) {
        this.dom = domManager;
        this.initializeEvents();
        
        // 将实例暴露给全局，供其他模块调用
        window.imageToolModalManager = this;
    }
    
    /**
     * 初始化模态框事件
     */
    initializeEvents() {
        // 关闭按钮事件
        this.dom.elements.modalClose.addEventListener('click', () => this.closeModal());
        
        // 点击模态框背景关闭
        this.dom.elements.imageModal.addEventListener('click', (e) => {
            if (e.target === this.dom.elements.imageModal) {
                this.closeModal();
            }
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });
        
        // 阻止模态框内容区域的点击事件冒泡
        const modalContent = this.dom.elements.imageModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    /**
     * 预览图片
     * @param {string} imagePathOrUrl - 图片路径或URL
     */
    previewImage(imagePathOrUrl) {
        const modalImage = this.dom.elements.modalImage;
        const imageModal = this.dom.elements.imageModal;
        
        // 设置图片源
        const src = imagePathOrUrl.startsWith('blob:') 
            ? imagePathOrUrl 
            : `file:///${imagePathOrUrl.replace(/\\/g, '/')}`;

        modalImage.src = src;
        modalImage.alt = imagePathOrUrl;
        
        // 显示模态框
        this.openModal();

        // 处理图片加载错误
        modalImage.onerror = () => {
            showNotification('图片加载失败', NOTIFICATION_TYPES.ERROR);
            
            // 如果是 blob URL 加载失败，可能是因为它已被撤销
            if (!src.startsWith('blob:')) {
                // 对于文件路径，可以尝试API端点作为后备
                modalImage.src = `/api/get-image?path=${encodeURIComponent(imagePathOrUrl)}`;
                modalImage.onerror = () => { // 第二次尝试失败
                    showNotification('图片加载失败', NOTIFICATION_TYPES.ERROR);
                    this.closeModal();
                };
            } else {
                this.closeModal();
            }
        };
        
        // 图片加载成功
        modalImage.onload = () => {
            this.adjustImageSize();
        };
    }
    
    /**
     * 打开模态框
     */
    openModal() {
        const imageModal = this.dom.elements.imageModal;
        imageModal.style.display = 'flex';
        
        // 添加打开动画类
        setTimeout(() => {
            imageModal.classList.add('modal-open');
        }, 10);
        
        // 禁用页面滚动
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        const imageModal = this.dom.elements.imageModal;
        const modalImage = this.dom.elements.modalImage;
        
        // 添加关闭动画
        imageModal.classList.remove('modal-open');
        
        setTimeout(() => {
            imageModal.style.display = 'none';
            modalImage.src = '';
            modalImage.alt = '';
        }, 300);
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }
    
    /**
     * 检查模态框是否打开
     * @returns {boolean} 是否打开
     */
    isModalOpen() {
        return this.dom.elements.imageModal.style.display === 'flex';
    }
    
    /**
     * 调整图片大小以适应屏幕
     */
    adjustImageSize() {
        const modalImage = this.dom.elements.modalImage;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        
        // 重置样式
        modalImage.style.maxWidth = `${maxWidth}px`;
        modalImage.style.maxHeight = `${maxHeight}px`;
        modalImage.style.width = 'auto';
        modalImage.style.height = 'auto';
    }
    
    /**
     * 设置模态框标题
     * @param {string} title - 标题文本
     */
    setModalTitle(title) {
        const titleElement = this.dom.elements.imageModal.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    /**
     * 添加模态框操作按钮
     * @param {string} text - 按钮文本
     * @param {Function} callback - 点击回调
     * @returns {HTMLElement} 按钮元素
     */
    addModalAction(text, callback) {
        const actionsContainer = this.dom.elements.imageModal.querySelector('.modal-actions');
        if (!actionsContainer) {
            return null;
        }
        
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'modal-action-btn';
        button.addEventListener('click', callback);
        
        actionsContainer.appendChild(button);
        return button;
    }
    
    /**
     * 清除所有模态框操作按钮
     */
    clearModalActions() {
        const actionsContainer = this.dom.elements.imageModal.querySelector('.modal-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = '';
        }
    }
    
    /**
     * 设置模态框加载状态
     * @param {boolean} loading - 是否加载中
     */
    setModalLoading(loading) {
        const modalImage = this.dom.elements.modalImage;
        const loadingIndicator = this.dom.elements.imageModal.querySelector('.modal-loading');
        
        if (loading) {
            modalImage.style.display = 'none';
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
        } else {
            modalImage.style.display = 'block';
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        if (this.isModalOpen()) {
            this.adjustImageSize();
        }
    }
    
    /**
     * 销毁模态框管理器
     */
    destroy() {
        // 移除事件监听器
        this.dom.elements.modalClose.removeEventListener('click', this.closeModal);
        this.dom.elements.imageModal.removeEventListener('click', this.closeModal);
        
        // 清除全局引用
        if (window.imageToolModalManager === this) {
            delete window.imageToolModalManager;
        }
    }
}