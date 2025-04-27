/**
 * 计算器核心脚本
 * 功能：
 * 1. 实时显示输入过程（如 "6 - 2"）
 * 2. 计算后只显示结果（不显示历史如 "6 - 2 = 4"）
 * 3. 支持连续运算（如 6 - 2 = 4，接着 - 3 = 1）
 * 4. 退格键可删除输入
 */

// 等待页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取显示器和所有按钮
    const display = document.getElementById('displayBar');
    const buttons = document.querySelectorAll('[id^="bar"]');

    // 计算器状态变量
    let currentValue = '0';      // 当前输入的值（默认0）
    let previousValue = '';      // 前一个值（用于存储运算数）
    let operation = null;        // 当前运算符（+ - × ÷ %）
    let waitingForNewValue = false; // 是否等待输入新数字（按下运算符后为true）
    let currentExpression = '';  // 当前构建的表达式（如 "6 - 2"）

    // === 核心函数 === //

    /**
     * 更新显示器内容
     */
    function updateDisplay() {
        // 优先显示表达式，否则显示当前值
        display.textContent = currentExpression || currentValue;
    }

    /**
     * 处理数字输入（0-9）
     * @param {string} digit 输入的数字
     */
    function inputDigit(digit) {
        if (waitingForNewValue) {
            // 运算符已按下，开始新输入
            currentExpression = currentValue + ' ' + operation + ' ';
            currentValue = digit;
            waitingForNewValue = false;
        } else {
            // 正常输入（避免"012"这样的无效数字）
            currentValue = currentValue === '0' ? digit : currentValue + digit;
        }

        // 更新表达式（如 "6 - 2"）
        if (currentExpression) {
            currentExpression = currentExpression.split(' ')[0] + ' ' + operation + ' ' + currentValue;
        } else {
            currentExpression = currentValue;
        }
        updateDisplay();
    }

    /**
     * 处理小数点输入
     */
    function inputDecimal() {
        if (waitingForNewValue) {
            // 运算符后输入小数点，自动补零
            currentExpression = currentValue + ' ' + operation + ' ';
            currentValue = '0.';
            waitingForNewValue = false;
        } else if (!currentValue.includes('.')) {
            // 当前值没有小数点时才添加
            currentValue += '.';
        }

        // 更新表达式（如 "3.14 + 2."）
        if (currentExpression) {
            currentExpression = currentExpression.split(' ')[0] + ' ' + operation + ' ' + currentValue;
        } else {
            currentExpression = currentValue;
        }
        updateDisplay();
    }

    /**
     * 处理运算符（+ - × ÷ %）
     * @param {string} nextOperator 运算符
     */
    function handleOperator(nextOperator) {
        if (operation && !waitingForNewValue) {
            // 连续按运算符时，先计算前一步（如 6 + 3 → 按"-"时先计算9）
            calculate(false);
        }

        previousValue = currentValue;
        operation = nextOperator;
        waitingForNewValue = true;

        // 更新表达式（如 "6 -"）
        currentExpression = currentValue + ' ' + operation;
        updateDisplay();
    }

    /**
     * 执行计算
     * @param {boolean} showResult 是否显示结果（按=时为true）
     */
    function calculate(showResult = true) {
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);

        // 无效输入检查
        if (isNaN(prev) || isNaN(current)) return;

        let result;
        switch (operation) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '×': result = prev * current; break;
            case '÷': result = prev / current; break;
            case '%': result = prev % current; break;
            default: return;
        }

        if (showResult) {
            // 按=时清空表达式，只显示结果
            currentExpression = '';
            currentValue = String(result);
        } else {
            // 连续运算时保留内部状态
            currentValue = String(result);
        }

        // 重置状态
        operation = null;
        previousValue = '';
        waitingForNewValue = true;
        updateDisplay();
    }

    /**
     * 清除所有状态（C按钮）
     */
    function clearAll() {
        currentValue = '0';
        previousValue = '';
        operation = null;
        waitingForNewValue = false;
        currentExpression = '';
        updateDisplay();
    }

    /**
     * 删除最后一位（←按钮）
     */
    function deleteLastChar() {
        if (currentExpression) {
            // 删除表达式中的字符（如 "6 - 2" → "6 -"）
            currentExpression = currentExpression.slice(0, -1);
            const parts = currentExpression.split(' ');
            if (parts.length === 1) {
                currentValue = parts[0] || '0';
            } else if (parts.length === 3) {
                currentValue = parts[2] || '0';
            }
        } else {
            // 删除当前值的最后一位（如 "123" → "12"）
            currentValue = currentValue.slice(0, -1) || '0';
        }
        updateDisplay();
    }

    // === 按钮事件绑定 === //
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            let value = button.textContent;

            // 转换HTML特殊字符为运算符
            const operatorMap = { '−': '-', '×': '×', '÷': '÷' };
            if (operatorMap[value]) value = operatorMap[value];

            // 分类处理按钮
            if (!isNaN(value) || value === '.') {
                // 数字或小数点
                if (value === '.') inputDecimal();
                else inputDigit(value);
            } else {
                // 功能按钮
                switch (value) {
                    case 'C': clearAll(); break;
                    case '←': deleteLastChar(); break;
                    case '=': calculate(true); break;
                    case '+': case '-': case '×': case '÷': case '%': 
                        handleOperator(value); break;
                }
            }
        });
    });

    // 初始化显示
    updateDisplay();
});
