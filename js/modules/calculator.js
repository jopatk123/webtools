// 计算器模块
export class Calculator {
    constructor() {
        this.expression = '';
        this.historyArr = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateHistory();
    }

    bindEvents() {
        // 键盘支持
        document.addEventListener('keydown', (e) => {
            const calculatorSection = document.getElementById('calculator');
            if (calculatorSection && calculatorSection.classList.contains('active')) {
                this.handleKeyboard(e);
            }
        });

        // 按钮点击
        const calculatorDOM = document.getElementById('calculator');
        if (calculatorDOM) {
            calculatorDOM.addEventListener('click', (e) => {
                const target = e.target;
                if (target.tagName === 'BUTTON') {
                    const value = target.dataset.value;
                    if (value) {
                        this.appendToCalc(value);
                    } else if (target.id === 'calcClear') {
                        this.clear();
                    } else if (target.id === 'calcDelete') {
                        this.deleteLast();
                    } else if (target.id === 'calcEquals') {
                        this.calculate();
                    } else if (target.id === 'calcClearHistory') {
                        this.clearHistory();
                    } else if (target.id === 'taxCalculate') {
                        this.calculateTax();
                    } else if (target.id === 'amountConvert') {
                        this.convertAmountToChinese();
                    }
                }
            });
        }
    }

    handleKeyboard(e) {
        const key = e.key;
        if ('0123456789+-*/.'.includes(key)) {
            e.preventDefault();
            this.appendToCalc(key === '*' ? '×' : key === '/' ? '÷' : key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            e.preventDefault();
            this.clear();
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.deleteLast();
        }
    }

    appendToCalc(value) {
        this.expression += value;
        document.getElementById('calcDisplay').value = this.expression;
    }

    clear() {
        this.expression = '';
        document.getElementById('calcDisplay').value = '';
    }

    deleteLast() {
        this.expression = this.expression.slice(0, -1);
        document.getElementById('calcDisplay').value = this.expression;
    }

    calculate() {
        try {
            const expression = this.expression.replace(/×/g, '*').replace(/÷/g, '/');
            const result = eval(expression);
            document.getElementById('calcDisplay').value = result;
            
            if (this.expression) {
                this.historyArr.unshift(`${this.expression} = ${result}`);
                if (this.historyArr.length > 10) this.historyArr.length = 10;
                this.updateHistory();
            }
            this.expression = result.toString();
        } catch (error) {
            document.getElementById('calcDisplay').value = '错误';
            this.expression = '';
        }
    }

    updateHistory() {
        const historyDiv = document.getElementById('calcHistory');
        if (this.historyArr.length === 0) {
            historyDiv.innerHTML = '<div class="history-placeholder">暂无计算历史</div>';
        } else {
            historyDiv.innerHTML = this.historyArr.map(item => `<div class="history-item">${item}</div>`).join('');
        }
    }

    clearHistory() {
        this.historyArr = [];
        this.updateHistory();
    }

    // 税率计算
    calculateTax() {
        const amount = parseFloat(document.getElementById('taxAmount').value);
        const rate = parseFloat(document.getElementById('taxRate').value);
        if (isNaN(amount) || isNaN(rate)) {
            document.getElementById('taxResult').textContent = '请输入有效的金额和税率';
            return;
        }
        const tax = amount * rate / 100;
        const withTax = amount + tax;
        const withoutTax = amount;
        const result = `不含税金额: ${withoutTax}\n税额: ${tax}\n含税金额: ${withTax}`;
        document.getElementById('taxResult').textContent = result;
    }

    // 金额转大写
    convertAmountToChinese() {
        const num = document.getElementById('amountInput').value.trim();
        if (!num || isNaN(num)) {
            document.getElementById('amountResult').textContent = '请输入有效的金额';
            return;
        }
        document.getElementById('amountResult').textContent = this.numberToChinese(num);
    }

    numberToChinese(num) {
        const CN_NUM = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
        const CN_UNIT = ['','拾','佰','仟'];
        const CN_SECTION = ['','万','亿','兆'];
        const CN_DECIMAL = ['角','分','厘'];
        const CN_INTEGER = '整';
        const CN_YUAN = '元';
        
        num = parseFloat(num);
        if (num === 0) return '零元整';
        
        let chnStr = '';
        let integerNum = Math.floor(num);
        let decimalNum = Math.round((num - integerNum) * 1000);
        
        // 整数部分
        let unitPos = 0;
        let zero = true;
        while(integerNum > 0) {
            let section = integerNum % 10000;
            if (!zero) chnStr = CN_NUM[0] + chnStr;
            let strInsSec = this.sectionToChinese(section, CN_NUM, CN_UNIT);
            if(section !== 0) strInsSec += CN_SECTION[unitPos];
            chnStr = strInsSec + chnStr;
            zero = (section < 1000) && (section > 0);
            integerNum = Math.floor(integerNum / 10000);
            unitPos++;
        }
        chnStr += CN_YUAN;
        
        // 小数部分
        if (decimalNum === 0) {
            chnStr += CN_INTEGER;
        } else {
            let dec = decimalNum.toString().padStart(3, '0');
            for (let i = 0; i < 3; i++) {
                if (dec[i] !== '0') {
                    chnStr += CN_NUM[parseInt(dec[i])] + CN_DECIMAL[i];
                }
            }
        }
        
        // 处理连续零
        chnStr = chnStr.replace(/零{2,}/g, '零');
        chnStr = chnStr.replace(/零(万|亿|兆|元)/g, '$1');
        chnStr = chnStr.replace(/亿万/g, '亿');
        chnStr = chnStr.replace(/零角零分零厘$/, '整');
        chnStr = chnStr.replace(/零角零分$/, '整');
        chnStr = chnStr.replace(/零分零厘$/, '整');
        chnStr = chnStr.replace(/零厘$/, '');
        return chnStr;
    }

    sectionToChinese(section, CN_NUM, CN_UNIT) {
        let strIns = '', chnStr = '';
        let unitPos = 0;
        let zero = true;
        while(section > 0) {
            let v = section % 10;
            if(v === 0) {
                if(!zero) {
                    zero = true;
                    chnStr = CN_NUM[0] + chnStr;
                }
            } else {
                zero = false;
                strIns = CN_NUM[v] + CN_UNIT[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            section = Math.floor(section / 10);
        }
        return chnStr;
    }
}

export { Calculator };