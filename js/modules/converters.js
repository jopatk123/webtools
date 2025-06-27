// 转换工具模块
export class Converters {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('hexInput')?.addEventListener('input', () => this.convertColor());
        document.getElementById('timestampInput')?.addEventListener('input', () => this.convertTimestamp());
        document.getElementById('datetimeInput')?.addEventListener('change', () => this.convertDatetime());
        document.querySelector('button[onclick="getCurrentTimestamp()"]')?.addEventListener('click', () => this.getCurrentTimestamp());
        document.querySelector('button[onclick="encodeURL()"]')?.addEventListener('click', () => this.encodeURL());
        document.querySelector('button[onclick="decodeURL()"]')?.addEventListener('click', () => this.decodeURL());
        document.querySelector('button[onclick="encodeBase64()"]')?.addEventListener('click', () => this.encodeBase64());
        document.querySelector('button[onclick="decodeBase64()"]')?.addEventListener('click', () => this.decodeBase64());
    }

    // 颜色转换
    convertColor() {
        const hex = document.getElementById('hexInput').value;
        if (!hex.match(/^#[0-9A-Fa-f]{6}$/)) {
            return;
        }
        
        // 转换为RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        document.getElementById('rgbInput').value = `rgb(${r}, ${g}, ${b})`;
        
        // 转换为HSL
        const hsl = this.rgbToHsl(r, g, b);
        document.getElementById('hslInput').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        
        // 显示颜色预览
        document.getElementById('colorPreview').style.backgroundColor = hex;
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    // 时间戳转换
    convertTimestamp() {
        const timestamp = document.getElementById('timestampInput').value;
        if (!timestamp) return;
        
        const date = new Date(timestamp * 1000);
        const isoString = date.toISOString().slice(0, 16);
        document.getElementById('datetimeInput').value = isoString;
        
        const result = `本地时间: ${date.toLocaleString()}\nUTC时间: ${date.toUTCString()}\nISO格式: ${date.toISOString()}`;
        document.getElementById('timestampResult').textContent = result;
    }

    convertDatetime() {
        const datetime = document.getElementById('datetimeInput').value;
        if (!datetime) return;
        
        const date = new Date(datetime);
        const timestamp = Math.floor(date.getTime() / 1000);
        document.getElementById('timestampInput').value = timestamp;
        
        const result = `时间戳: ${timestamp}\n毫秒时间戳: ${date.getTime()}\n本地时间: ${date.toLocaleString()}`;
        document.getElementById('timestampResult').textContent = result;
    }

    getCurrentTimestamp() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        document.getElementById('timestampInput').value = timestamp;
        
        const isoString = now.toISOString().slice(0, 16);
        document.getElementById('datetimeInput').value = isoString;
        
        const result = `当前时间戳: ${timestamp}\n当前时间: ${now.toLocaleString()}`;
        document.getElementById('timestampResult').textContent = result;
    }

    // URL编码/解码
    encodeURL() {
        const input = document.getElementById('urlInput').value;
        const result = encodeURIComponent(input);
        document.getElementById('urlResult').value = result;
    }

    decodeURL() {
        const input = document.getElementById('urlInput').value;
        try {
            const result = decodeURIComponent(input);
            document.getElementById('urlResult').value = result;
        } catch (error) {
            document.getElementById('urlResult').value = '解码失败: ' + error.message;
        }
    }

    // Base64编码/解码
    encodeBase64() {
        const input = document.getElementById('base64Input').value;
        try {
            const result = btoa(unescape(encodeURIComponent(input)));
            document.getElementById('base64Result').value = result;
        } catch (error) {
            document.getElementById('base64Result').value = '编码失败: ' + error.message;
        }
    }

    decodeBase64() {
        const input = document.getElementById('base64Input').value;
        try {
            const result = decodeURIComponent(escape(atob(input)));
            document.getElementById('base64Result').value = result;
        } catch (error) {
            document.getElementById('base64Result').value = '解码失败: ' + error.message;
        }
    }
}

export { Converters };