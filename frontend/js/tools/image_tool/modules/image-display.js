/**
 * 图片显示模块
 */
import { SORT_DIRECTIONS, SORT_COLUMNS } from '../constants.js';
import { formatFileSize } from './utils.js';

export class ImageDisplay {
    constructor(domManager) {
        this.dom = domManager;
        this.currentImages = [];
        this.sortColumn = SORT_COLUMNS.PATH;
        this.sortDirection = SORT_DIRECTIONS.ASC;
    }
    
    /**
     * 设置当前图片数据
     * @param {Array} images - 图片数组
     */
    setImages(images) {
        this.currentImages = images;
    }
    
    /**
     * 获取当前图片数据
     * @returns {Array} 当前图片数组
     */
    getImages() {
        return this.currentImages;
    }
    
    /**
     * 排序并显示图片
     */
    sortAndDisplay() {
        if (this.currentImages.length === 0) return;
        
        this.sortImages();
        this.displayImages();
    }
    
    /**
     * 对图片进行排序
     */
    sortImages() {
        this.currentImages.sort((a, b) => {
            let aVal, bVal;
            
            switch (this.sortColumn) {
                case SORT_COLUMNS.SIZE:
                    aVal = a.size;
                    bVal = b.size;
                    break;
                case SORT_COLUMNS.EXTENSION:
                    aVal = a.extension.toLowerCase();
                    bVal = b.extension.toLowerCase();
                    break;
                default: // path
                    aVal = a.path.toLowerCase();
                    bVal = b.path.toLowerCase();
            }
            
            if (aVal < bVal) return this.sortDirection === SORT_DIRECTIONS.ASC ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === SORT_DIRECTIONS.ASC ? 1 : -1;
            return 0;
        });
    }
    
    /**
     * 显示图片列表
     */
    displayImages() {
        this.dom.setHTML('imageTableBody', '');
        this.updateImageCount();
        
        this.currentImages.forEach((image, index) => {
            const row = this.createImageRow(image, index);
            this.dom.elements.imageTableBody.appendChild(row);
        });
    }
    
    /**
     * 创建图片行元素
     * @param {Object} image - 图片对象
     * @param {number} index - 索引
     * @returns {HTMLElement} 行元素
     */
    createImageRow(image, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="path-cell" title="${image.path}">
                <div class="path-content">
                    <span class="path-text">${image.path}</span>
                    <button class="copy-btn" data-path="${image.path.replace(/"/g, '&quot;')}">📋</button>
                </div>
            </td>
            <td class="size-cell">${formatFileSize(image.size)}</td>
            <td class="type-cell">
                <span class="file-type">${image.extension.toUpperCase()}</span>
            </td>
            <td class="preview-cell">
                <button class="preview-btn" data-url="${(image.url || image.path).replace(/"/g, '&quot;')}">👁️ 预览</button>
            </td>
        `;
        
        // 添加行点击事件
        row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('copy-btn') && !e.target.classList.contains('preview-btn')) {
                this.previewImage(image.url || image.path);
            }
        });
        
        return row;
    }
    
    /**
     * 更新图片数量显示
     */
    updateImageCount() {
        this.dom.setText('imageCount', `共 ${this.currentImages.length} 张图片`);
    }
    
    /**
     * 设置排序
     * @param {string} column - 排序列
     */
    setSorting(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === SORT_DIRECTIONS.ASC ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC;
        } else {
            this.sortColumn = column;
            this.sortDirection = SORT_DIRECTIONS.ASC;
        }
        
        this.updateSortIndicators();
        this.sortAndDisplay();
    }
    
    /**
     * 更新排序指示器
     */
    updateSortIndicators() {
        // 清除所有排序指示器
        this.dom.elements.sortableHeaders.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        
        // 添加当前排序指示器
        const currentHeader = document.querySelector(`[data-column="${this.sortColumn}"]`);
        if (currentHeader) {
            currentHeader.classList.add(`sort-${this.sortDirection}`);
        }
    }
    
    /**
     * 显示空状态
     */
    showEmptyState() {
        this.dom.toggleElement('resultsArea', false);
        this.dom.toggleElement('emptyState', true);
    }
    
    /**
     * 显示结果区域
     */
    showResults() {
        this.dom.toggleElement('emptyState', false);
        this.dom.toggleElement('resultsArea', true);
    }
    
    /**
     * 清空显示
     */
    clear() {
        this.currentImages = [];
        this.dom.setHTML('imageTableBody', '');
        this.dom.setText('imageCount', '共 0 张图片');
        this.showEmptyState();
    }
    
    /**
     * 预览图片（由外部模块处理）
     * @param {string} imagePathOrUrl - 图片路径或URL
     */
    previewImage(imagePathOrUrl) {
        // 这个方法将由事件处理器调用模态框管理器
        if (window.imageToolModalManager) {
            window.imageToolModalManager.previewImage(imagePathOrUrl);
        }
    }
    
    /**
     * 获取当前排序状态
     * @returns {Object} 排序状态
     */
    getSortState() {
        return {
            column: this.sortColumn,
            direction: this.sortDirection
        };
    }
    
    /**
     * 设置排序状态
     * @param {string} column - 排序列
     * @param {string} direction - 排序方向
     */
    setSortState(column, direction) {
        this.sortColumn = column;
        this.sortDirection = direction;
        this.updateSortIndicators();
    }
    
    /**
     * 过滤显示的图片
     * @param {Function} filterFn - 过滤函数
     */
    filterImages(filterFn) {
        const filteredImages = this.currentImages.filter(filterFn);
        const originalImages = this.currentImages;
        
        this.currentImages = filteredImages;
        this.displayImages();
        
        // 返回原始数据以便恢复
        return originalImages;
    }
    
    /**
     * 搜索图片
     * @param {string} searchTerm - 搜索词
     * @returns {Array} 搜索结果
     */
    searchImages(searchTerm) {
        if (!searchTerm.trim()) {
            return this.currentImages;
        }
        
        const term = searchTerm.toLowerCase();
        return this.currentImages.filter(image => 
            image.path.toLowerCase().includes(term) ||
            image.extension.toLowerCase().includes(term)
        );
    }
}