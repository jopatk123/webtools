/**
 * 图片显示模块
 */
import { SORT_DIRECTIONS, SORT_COLUMNS } from '../constants.js';
import { formatFileSize } from './utils.js';

export class ImageDisplay {
    constructor(domManager) {
        this.dom = domManager;
        this.modalManager = null; // 初始化为null
        this.currentImages = [];
        this.sortColumn = SORT_COLUMNS.PATH;
        this.sortDirection = SORT_DIRECTIONS.ASC;
    }

    /**
     * 设置模态框管理器
     * @param {ModalManager} modalManager - 模态框管理器实例
     */
    setModalManager(modalManager) {
        this.modalManager = modalManager;
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
        if (this.currentImages.length === 0) {
            // 显示空状态
            this.displayImages();
            this.showEmptyState();
            return;
        }
        
        this.sortImages();
        this.displayImages();
        this.showResults();
    }
    
    /**
     * 对图片进行排序
     */
    sortImages() {
        this.currentImages.sort((a, b) => {
            let aVal, bVal;
            
            switch (this.sortColumn) {
                case SORT_COLUMNS.SIZE:
                case 'size':
                    aVal = a.size;
                    bVal = b.size;
                    break;
                case SORT_COLUMNS.EXTENSION:
                case 'type':
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
     * 创建图片行
     * @param {Object} image - 图片信息
     * @param {number} index - 索引
     * @returns {HTMLTableRowElement} 表格行元素
     */
    createImageRow(image, index) {
        const row = document.createElement('tr');
        row.dataset.imagePath = image.path;
        
        // 序号列
        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;
        row.appendChild(indexCell);
        
        // 添加点击选择功能
        row.addEventListener('click', (e) => {
            // 如果点击的是按钮，不触发行选择
            if (e.target.tagName === 'BUTTON') return;
            
            this.toggleRowSelection(row);
        });
        
        // 路径列
        const pathCell = document.createElement('td');
        pathCell.className = 'path-cell';
        pathCell.textContent = image.path;
        pathCell.title = image.path; // 完整路径提示
        row.appendChild(pathCell);
        
        // 大小列
        const sizeCell = document.createElement('td');
        sizeCell.className = 'sortable-cell';
        sizeCell.dataset.sort = 'size';
        sizeCell.textContent = formatFileSize(image.size);
        row.appendChild(sizeCell);
        
        // 类型列
        const typeCell = document.createElement('td');
        typeCell.className = 'sortable-cell';
        typeCell.dataset.sort = 'type';
        typeCell.textContent = image.extension.toUpperCase();
        row.appendChild(typeCell);
        
        // 操作列
        const actionCell = document.createElement('td');
        actionCell.className = 'action-cell';
        
        // 预览按钮
        const previewBtn = document.createElement('button');
        previewBtn.className = 'preview-btn';
        previewBtn.textContent = '预览';
        previewBtn.dataset.url = image.url; // 使用 blob URL 进行预览
        actionCell.appendChild(previewBtn);
        
        // 复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '复制';
        copyBtn.dataset.path = image.path;
        actionCell.appendChild(copyBtn);
        
        row.appendChild(actionCell);
        
        return row;
    }
    
    /**
     * 切换行选择状态
     * @param {HTMLTableRowElement} row - 表格行元素
     */
    toggleRowSelection(row) {
        row.classList.toggle('selected');
        this.updateRemoveButtonState();
    }
    
    /**
     * 获取选中的图片路径
     * @returns {Array} 选中的图片路径数组
     */
    getSelectedImagePaths() {
        const selectedRows = this.dom.elements.imageTableBody.querySelectorAll('tr.selected');
        return Array.from(selectedRows).map(row => row.dataset.imagePath);
    }
    
    /**
     * 移除选中的图片
     */
    removeSelectedImages() {
        const selectedPaths = this.getSelectedImagePaths();
        if (selectedPaths.length === 0) return;
        
        // 从当前图片数组中移除选中的图片
        this.currentImages = this.currentImages.filter(image => 
            !selectedPaths.includes(image.path)
        );
        
        // 重新显示
        this.sortAndDisplay();
        
        // 更新按钮状态
        this.updateRemoveButtonState();
    }
    
    /**
     * 更新移除按钮状态
     */
    updateRemoveButtonState() {
        const removeBtn = document.getElementById('remove-selected-btn');
        const selectedCount = this.getSelectedImagePaths().length;
        
        if (removeBtn) {
            removeBtn.disabled = selectedCount === 0;
            removeBtn.textContent = selectedCount > 0 ? `移除选中 (${selectedCount})` : '移除选中';
        }
    }
    
    /**
     * 导出扫描结果
     */
    exportResults() {
        if (this.currentImages.length === 0) {
            alert('没有可导出的图片数据');
            return;
        }
        
        // 创建导出数据
        const exportData = {
            exportTime: new Date().toISOString(),
            totalCount: this.currentImages.length,
            images: this.currentImages.map(image => ({
                path: image.path,
                size: image.size,
                extension: image.extension,
                sizeFormatted: formatFileSize(image.size)
            }))
        };
        
        // 创建下载链接
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `image_scan_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        URL.revokeObjectURL(url);
        
        alert(`已导出 ${this.currentImages.length} 张图片的扫描结果`);
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
    
    /**
     * 获取选中的图片索引
     * @returns {Array} 选中的图片索引数组
     */
    getSelectedIndices() {
        const checkboxes = this.dom.elements.imageTableBody.querySelectorAll('.row-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
    }
    
    /**
     * 移除选中的图片
     */
    removeSelectedImages() {
        const checkedBoxes = this.dom.elements.imageTable.querySelectorAll('.row-checkbox:checked');
        const pathsToRemove = Array.from(checkedBoxes).map(checkbox => checkbox.value);
        
        // 从图片列表中移除选中的图片
        this.currentImages = this.currentImages.filter(image => !pathsToRemove.includes(image.path));
        
        // 重新显示
        this.sortAndDisplay();
        
        // 更新计数
        this.updateImageCount();
        
        // 重置全选状态
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }
        
        // 更新移除按钮状态
        this.updateRemoveButtonState();
    }
    
    /**
     * 全选/取消全选
     * @param {boolean} checked - 是否选中
     */
    selectAll(checked) {
        const checkboxes = this.dom.elements.imageTableBody.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
        });
        this.updateRemoveButtonState();
    }
    
    /**
     * 更新移除按钮状态
     */
    updateRemoveButtonState() {
        const selectedCount = this.getSelectedIndices().length;
        const removeBtn = document.getElementById('remove-selected-btn');
        if (removeBtn) {
            removeBtn.disabled = selectedCount === 0;
            removeBtn.textContent = selectedCount > 0 ? `移除选中 (${selectedCount})` : '移除选中';
        }
    }
    
    /**
     * 更新全选复选框状态
     */
    updateSelectAllState() {
        const allCheckboxes = this.dom.elements.imageTableBody.querySelectorAll('.row-checkbox');
        const checkedCheckboxes = this.dom.elements.imageTableBody.querySelectorAll('.row-checkbox:checked');
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        
        if (selectAllCheckbox && allCheckboxes.length > 0) {
            if (checkedCheckboxes.length === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (checkedCheckboxes.length === allCheckboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        }
    }
}