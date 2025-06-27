/**
 * 格式过滤模块
 */
import { SUPPORTED_FORMATS } from '../constants.js';

export class FormatFilter {
    constructor(domManager) {
        this.dom = domManager;
    }
    
    /**
     * 获取选中的格式
     * @returns {string[]} 选中的格式数组
     */
    getSelectedFormats() {
        const selected = [];
        this.dom.elements.formatCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const format = checkbox.id.replace('format-', '');
                selected.push(format.toLowerCase());
            }
        });
        return selected;
    }
    
    /**
     * 根据格式过滤图片
     * @param {Array} images - 图片数组
     * @returns {Array} 过滤后的图片数组
     */
    filterImagesByFormat(images) {
        const selectedFormats = this.getSelectedFormats();
        if (selectedFormats.length === 0) {
            return images; // 如果没有选择任何格式，返回所有图片
        }
        
        return images.filter(image => {
            const ext = image.extension.toLowerCase().replace('.', '');
            return selectedFormats.some(format => {
                if (format === 'jpg') {
                    return ext === 'jpg' || ext === 'jpeg';
                }
                return ext === format;
            });
        });
    }
    
    /**
     * 检查文件是否为支持的图片格式
     * @param {string} filename - 文件名
     * @param {string[]} selectedFormats - 选中的格式（可选）
     * @returns {boolean} 是否为支持的格式
     */
    isImageFile(filename, selectedFormats = null) {
        const ext = filename.split('.').pop().toLowerCase();
        const formatsToCheck = selectedFormats || SUPPORTED_FORMATS;
        
        // 如果没有选择任何格式，检查是否为支持的格式
        if (!selectedFormats || selectedFormats.length === 0) {
            return SUPPORTED_FORMATS.includes(ext);
        }
        
        return formatsToCheck.some(format => {
            const formatLower = format.toLowerCase();
            if (formatLower === 'jpg') {
                return ext === 'jpg' || ext === 'jpeg';
            }
            return ext === formatLower;
        });
    }
    
    /**
     * 设置格式选择状态
     * @param {string} format - 格式名称
     * @param {boolean} checked - 是否选中
     */
    setFormatChecked(format, checked) {
        const checkbox = document.getElementById(`format-${format}`);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }
    
    /**
     * 获取指定格式的选择状态
     * @param {string} format - 格式名称
     * @returns {boolean} 是否选中
     */
    isFormatChecked(format) {
        const checkbox = document.getElementById(`format-${format}`);
        return checkbox ? checkbox.checked : false;
    }
    
    /**
     * 全选或取消全选格式
     * @param {boolean} selectAll - 是否全选
     */
    toggleAllFormats(selectAll) {
        this.dom.elements.formatCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
    }
    
    /**
     * 重置格式选择为默认状态
     */
    resetFormats() {
        // 默认选中常用格式
        const defaultFormats = ['jpg', 'png', 'gif'];
        
        this.dom.elements.formatCheckboxes.forEach(checkbox => {
            const format = checkbox.id.replace('format-', '');
            checkbox.checked = defaultFormats.includes(format.toLowerCase());
        });
    }
    
    /**
     * 获取格式统计信息
     * @param {Array} images - 图片数组
     * @returns {Object} 格式统计
     */
    getFormatStats(images) {
        const stats = {};
        
        images.forEach(image => {
            const ext = image.extension.toLowerCase().replace('.', '');
            const format = ext === 'jpeg' ? 'jpg' : ext;
            stats[format] = (stats[format] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * 更新格式选择器的显示状态
     * @param {Object} formatStats - 格式统计信息
     */
    updateFormatDisplay(formatStats) {
        this.dom.elements.formatCheckboxes.forEach(checkbox => {
            const format = checkbox.id.replace('format-', '').toLowerCase();
            const count = formatStats[format] || 0;
            const label = checkbox.nextElementSibling;
            
            if (label) {
                const formatName = label.textContent.split('(')[0].trim();
                label.textContent = `${formatName} (${count})`;
                
                // 如果没有该格式的文件，禁用复选框
                checkbox.disabled = count === 0;
                if (count === 0) {
                    checkbox.checked = false;
                }
            }
        });
    }
}