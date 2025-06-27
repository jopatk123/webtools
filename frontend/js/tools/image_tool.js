/**
 * 图片工具 - 模块化版本入口文件
 * 这个文件保持原有的文件名，但内容已经重构为模块化架构
 */

// 导入主应用
import app from './image_tool/index.js';

// 为了保持向后兼容性，将一些常用功能暴露到全局
window.imageToolApp = app;

// 导出应用实例
export default app;

// 如果需要直接访问某些功能，可以在这里添加兼容性接口
// 例如：
// window.previewImage = (path) => app.getModule('modalManager')?.previewImage(path);
// window.scanImages = (path) => app.getModule('fileScanner')?.scanWithPath(path);