// 图片工具模块
export class ImageTools {
    constructor() {
        this.imageFiles = [];
        this.currentImageIndex = -1;
        this.init();
    }

    init() {
        // 绑定事件监听器
        this.bindEvents();
    }

    bindEvents() {
        const fileInput = document.getElementById('imageFileInput');
        fileInput?.addEventListener('change', (e) => this.handleFileSelection(e.target.files));

        const imageList = document.getElementById('imageList');
        imageList?.addEventListener('click', (e) => {
            const item = e.target.closest('.image-item');
            if (item) {
                const index = Array.from(item.parentElement.children).indexOf(item);
                this.selectImage(index);
            }
        });

        document.querySelector('button[onclick="window.ToolboxApp.getModule(\'imageTools\').selectImageFolder()"]')?.addEventListener('click', () => this.selectImageFolder());
        document.querySelector('button[onclick="window.ToolboxApp.getModule(\'imageTools\').loadImages()"]')?.addEventListener('click', () => this.loadImages());
    }

    // 选择图片文件夹
    selectImageFolder() {
        const fileInput = document.getElementById('imageFileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    // 处理文件选择
    handleFileSelection(files) {
        this.imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );
        
        // 更新路径显示
        const pathInput = document.getElementById('imagePath');
        if (pathInput && this.imageFiles.length > 0) {
            pathInput.value = this.imageFiles[0].webkitRelativePath.split('/')[0];
        }
        
        this.displayImageList();
    }

    // 加载图片（当用户点击加载按钮时）
    loadImages() {
        if (this.imageFiles.length === 0) {
            alert('请先选择图片文件夹');
            return;
        }
        this.displayImageList();
    }

    // 显示图片列表
    displayImageList() {
        const imageList = document.getElementById('imageList');
        if (!imageList) return;

        if (this.imageFiles.length === 0) {
            imageList.innerHTML = '<div class="no-images">未找到图片文件</div>';
            return;
        }

        let html = '<div class="image-grid">';
        
        this.imageFiles.forEach((file, index) => {
            const fileSize = this.formatFileSize(file.size);
            const fileType = file.type.split('/')[1].toUpperCase();
            
            html += `
                <div class="image-item">
                    <div class="image-thumbnail">
                        <i class="fas fa-image"></i>
                    </div>
                    <div class="image-details">
                        <div class="image-name" title="${file.name}">${file.name}</div>
                        <div class="image-meta">
                            <span class="file-size">${fileSize}</span>
                            <span class="file-type">${fileType}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        imageList.innerHTML = html;
        
        // 生成缩略图
        this.generateThumbnails();
    }

    // 生成缩略图
    generateThumbnails() {
        const thumbnails = document.querySelectorAll('.image-thumbnail');
        
        this.imageFiles.forEach((file, index) => {
            if (thumbnails[index]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    thumbnails[index].innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 选择图片进行预览
    selectImage(index) {
        if (index < 0 || index >= this.imageFiles.length) return;
        
        this.currentImageIndex = index;
        const file = this.imageFiles[index];
        
        // 更新选中状态
        document.querySelectorAll('.image-item').forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
        
        this.previewImage(file);
    }

    // 预览图片
    previewImage(file) {
        const previewContainer = document.getElementById('imagePreview');
        const infoContainer = document.getElementById('imageInfo');
        
        if (!previewContainer || !infoContainer) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // 显示图片预览
            previewContainer.innerHTML = `
                <div class="preview-image-container">
                    <img src="${e.target.result}" alt="${file.name}" class="preview-image">
                </div>
            `;
            
            // 获取图片信息
            this.getImageInfo(e.target.result, file);
        };
        
        reader.readAsDataURL(file);
    }

    // 获取图片信息
    getImageInfo(imageSrc, file) {
        const img = new Image();
        img.onload = () => {
            const fileSize = this.formatFileSize(file.size);
            const dimensions = `${img.width} × ${img.height}`;
            const fileType = file.type;
            
            // 尝试获取EXIF信息（包括GPS信息）
            this.extractEXIFData(file).then(exifData => {
                let gpsInfo = '无';
                if (exifData && exifData.GPS) {
                    const lat = exifData.GPS.GPSLatitude;
                    const lon = exifData.GPS.GPSLongitude;
                    const latRef = exifData.GPS.GPSLatitudeRef;
                    const lonRef = exifData.GPS.GPSLongitudeRef;
                    
                    if (lat && lon) {
                        const latitude = this.convertDMSToDD(lat, latRef);
                        const longitude = this.convertDMSToDD(lon, lonRef);
                        gpsInfo = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    }
                }
                
                const infoContainer = document.getElementById('imageInfo');
                infoContainer.innerHTML = `
                    <div class="info-section">
                        <h4>基本信息</h4>
                        <div class="info-item">
                            <span class="info-label">文件名:</span>
                            <span class="info-value">${file.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">尺寸:</span>
                            <span class="info-value">${dimensions}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">大小:</span>
                            <span class="info-value">${fileSize}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">格式:</span>
                            <span class="info-value">${fileType}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">经纬度:</span>
                            <span class="info-value">${gpsInfo}</span>
                        </div>
                    </div>
                `;
            });
        };
        
        img.src = imageSrc;
    }

    // 提取EXIF数据
    async extractEXIFData(file) {
        return new Promise((resolve) => {
            // 简化的EXIF读取，实际项目中可以使用exif-js库
            // 这里只是模拟，实际GPS信息提取需要专门的库
            resolve(null);
        });
    }

    // 转换DMS格式到DD格式
    convertDMSToDD(dms, ref) {
        let dd = dms[0] + dms[1]/60 + dms[2]/3600;
        if (ref === 'S' || ref === 'W') {
            dd = dd * -1;
        }
        return dd;
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 全局函数，供HTML调用
function selectImageFolder() {
    if (window.ToolboxApp) {
        window.ToolboxApp.getModule('imageTools').selectImageFolder();
    }
}

function loadImages() {
    if (window.ToolboxApp) {
        window.ToolboxApp.getModule('imageTools').loadImages();
    }
}

export { ImageTools };