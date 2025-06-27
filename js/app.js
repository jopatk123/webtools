// 主应用管理模块
import { Calculator } from './modules/calculator.js';
import { ImageTools } from './modules/imageTools.js';
import { Converters } from './modules/converters.js';
import { Generators } from './modules/generators.js';
import { Navigation } from './modules/navigation.js';

class ToolboxApp {
    constructor() {
        this.modules = {
            calculator: null,
            imageTools: null,
            converters: null,
            generators: null,
            navigation: null
        };
    }

    init() {
        console.log('DOM fully loaded. Initializing app...');
        try {
            this.initModules();
            this.setupErrorHandling();
            console.log('Toolbox app initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('应用程序初始化失败，请检查控制台获取详细信息。');
        }
    }

    initModules() {
        console.log('Initializing modules...');
        // 实例化并初始化所有模块
        this.modules.navigation = new Navigation();
        this.modules.navigation.init();

        this.modules.calculator = new Calculator();
        // The calculator's constructor already calls init(), so we don't call it again.

        this.modules.imageTools = new ImageTools();
        this.modules.imageTools.init();

        this.modules.converters = new Converters();
        this.modules.converters.init();

        this.modules.generators = new Generators();
        this.modules.generators.init();

        console.log('All modules instantiated and initialized:', Object.keys(this.modules));
    }

    setupErrorHandling() {
        // 全局错误处理
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.showError('发生了一个错误，请刷新页面重试');
        });

        // Promise 错误处理
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise错误:', event.reason);
            this.showError('操作失败，请重试');
        });
    }

    showError(message) {
        if (this.modules.navigation) {
            this.modules.navigation.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (this.modules.navigation) {
            this.modules.navigation.showNotification(message, 'success');
        }
    }

    showInfo(message) {
        if (this.modules.navigation) {
            this.modules.navigation.showNotification(message, 'info');
        }
    }

    // 获取模块实例
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    // 重新初始化特定模块
    reinitModule(moduleName) {
        switch (moduleName) {
            case 'calculator':
                this.modules.calculator = new Calculator();
                break;
            case 'imageTools':
                this.modules.imageTools = new ImageTools();
                break;
            case 'converters':
                this.modules.converters = new Converters();
                break;
            case 'generators':
                this.modules.generators = new Generators();
                break;
            case 'navigation':
                this.modules.navigation = new Navigation();
                break;
            default:
                console.warn(`未知模块: ${moduleName}`);
        }
    }

    // 应用信息
    getAppInfo() {
        return {
            name: '我的工具箱',
            version: '2.0.0',
            modules: Object.keys(this.modules),
            description: '模块化的在线工具集合'
        };
    }
}

// Wait for the DOM to be fully loaded before initializing the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new ToolboxApp();
    window.ToolboxApp = app;
    app.init();
});