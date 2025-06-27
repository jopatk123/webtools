// 应用配置文件
export const CONFIG = {
    // 应用基本信息
    APP: {
        NAME: '我的工具箱',
        VERSION: '2.0.0',
        DESCRIPTION: '模块化的在线工具集合',
        AUTHOR: 'ToolboxApp',
        BUILD_DATE: new Date().toISOString().split('T')[0]
    },

    // 功能模块配置
    MODULES: {
        CALCULATOR: {
            ENABLED: true,
            MAX_HISTORY: 10,
            PRECISION: 10
        },
        TEXT_TOOLS: {
            ENABLED: true,
            MAX_TEXT_LENGTH: 100000
        },
        CONVERTERS: {
            ENABLED: true,
            COLOR_FORMATS: ['HEX', 'RGB', 'HSL'],
            TIMESTAMP_FORMATS: ['UNIX', 'ISO', 'LOCAL']
        },
        GENERATORS: {
            ENABLED: true,
            PASSWORD: {
                MIN_LENGTH: 4,
                MAX_LENGTH: 50,
                DEFAULT_LENGTH: 12
            },
            QR_CODE: {
                DEFAULT_SIZE: 200,
                MARGIN: 2
            }
        }
    },

    // UI配置
    UI: {
        THEME: {
            DEFAULT: 'light',
            STORAGE_KEY: 'toolbox-theme'
        },
        NOTIFICATIONS: {
            DEFAULT_DURATION: 3000,
            POSITION: 'top-right'
        },
        ANIMATIONS: {
            ENABLED: true,
            DURATION: 300
        }
    },

    // 存储配置
    STORAGE: {
        PREFIX: 'toolbox-',
        KEYS: {
            THEME: 'theme',
            CALCULATOR_HISTORY: 'calc-history',
            USER_PREFERENCES: 'user-prefs'
        }
    },

    // API配置（如果需要外部服务）
    API: {
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3
    },

    // 开发配置
    DEV: {
        DEBUG: false,
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        PERFORMANCE_MONITORING: false
    },

    // 功能限制
    LIMITS: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_CONCURRENT_OPERATIONS: 5,
        RATE_LIMIT: {
            REQUESTS_PER_MINUTE: 60
        }
    },

    // 错误消息
    MESSAGES: {
        ERRORS: {
            GENERIC: '操作失败，请重试',
            NETWORK: '网络连接失败',
            VALIDATION: '输入数据无效',
            PERMISSION: '权限不足',
            NOT_SUPPORTED: '浏览器不支持此功能'
        },
        SUCCESS: {
            GENERIC: '操作成功',
            COPIED: '已复制到剪贴板',
            SAVED: '保存成功',
            GENERATED: '生成成功'
        },
        INFO: {
            LOADING: '正在加载...',
            PROCESSING: '正在处理...',
            WELCOME: '欢迎使用工具箱'
        }
    },

    // 工具分类
    TOOL_CATEGORIES: {
        CALCULATOR: {
            ID: 'calculator',
            NAME: '计算工具',
            ICON: 'fas fa-calculator',
            TOOLS: ['basic-calc', 'tax-calc', 'amount-converter']
        },
        TEXT_TOOLS: {
            ID: 'text-tools',
            NAME: '文本工具',
            ICON: 'fas fa-font',
            TOOLS: ['text-transform', 'word-count', 'json-formatter']
        },
        CONVERTER: {
            ID: 'converter',
            NAME: '转换工具',
            ICON: 'fas fa-exchange-alt',
            TOOLS: ['color-converter', 'timestamp-converter', 'url-encoder', 'base64-encoder']
        },
        GENERATOR: {
            ID: 'generator',
            NAME: '生成工具',
            ICON: 'fas fa-magic',
            TOOLS: ['password-generator', 'qr-generator', 'uuid-generator']
        },
        UTILITY: {
            ID: 'utility',
            NAME: '实用工具',
            ICON: 'fas fa-cogs',
            TOOLS: ['file-tools', 'image-tools']
        }
    },

    // 快捷键配置
    SHORTCUTS: {
        CALCULATOR: {
            CLEAR: ['Escape', 'c', 'C'],
            CALCULATE: ['Enter', '='],
            DELETE: ['Backspace']
        },
        GLOBAL: {
            TOGGLE_THEME: ['Alt+t'],
            SEARCH: ['Ctrl+f', 'Cmd+f']
        }
    },

    // 性能配置
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300,
        THROTTLE_DELAY: 100,
        LAZY_LOAD: true,
        CACHE_DURATION: 24 * 60 * 60 * 1000 // 24小时
    }
};

// 获取配置值的辅助函数
export function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

// 设置配置值的辅助函数（仅用于运行时配置）
export function setConfig(path, newValue) {
    const keys = path.split('.');
    let obj = CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in obj) || typeof obj[key] !== 'object') {
            obj[key] = {};
        }
        obj = obj[key];
    }
    
    obj[keys[keys.length - 1]] = newValue;
}

// 验证配置的函数
export function validateConfig() {
    const requiredPaths = [
        'APP.NAME',
        'APP.VERSION',
        'MODULES.CALCULATOR.ENABLED',
        'UI.THEME.DEFAULT'
    ];
    
    for (const path of requiredPaths) {
        if (getConfig(path) === null) {
            console.warn(`配置缺失: ${path}`);
            return false;
        }
    }
    
    return true;
}

export default CONFIG;