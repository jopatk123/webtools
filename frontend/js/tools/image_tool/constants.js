/**
 * 图片工具常量定义
 */

// 支持的图片格式
export const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

// 状态类型
export const STATUS_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    LOADING: 'loading',
    IDLE: 'idle'
};

// 排序方向
export const SORT_DIRECTIONS = {
    ASC: 'asc',
    DESC: 'desc'
};

// 排序列
export const SORT_COLUMNS = {
    PATH: 'path',
    SIZE: 'size',
    EXTENSION: 'extension'
};

// 通知类型
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// 文件大小单位
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

// 通知显示时间（毫秒）
export const NOTIFICATION_DURATION = 3000;

// 成功状态自动隐藏时间（毫秒）
export const SUCCESS_STATUS_DURATION = 3000;