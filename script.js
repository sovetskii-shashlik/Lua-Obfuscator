// Переключение темы
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    // Сохраняем предпочтение темы в localStorage
    localStorage.setItem('darkTheme', isDark);
});

// Проверяем сохранённую тему при загрузке
if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
}

// Все методы обфускации в одну строку
function obfuscate(method, inputText) {
    const input = inputText || document.getElementById("input").value.trim();
    if (!input) {
        alert("Введи Lua-код сначала!");
        return "";
    }

    let output = "";
    
    // 1. ASCII обфускация (\104\101\108\108\111)
    if (method === "ascii") {
        let escaped = "";
        for (let i = 0; i < input.length; i++) {
            escaped += "\\" + input.charCodeAt(i);
        }
        output = `loadstring("${escaped}")()`;
    }
    
    // 2. HEX обфускация (\x68\x65\x6c\x6c\x6f)
    else if (method === "hex") {
        let hexStr = "";
        for (let i = 0; i < input.length; i++) {
            hexStr += "\\x" + input.charCodeAt(i).toString(16).padStart(2, "0");
        }
        output = `loadstring("${hexStr}")()`;
    }
    
    // 3. Unicode обфускация (\u{0068}\u{0065}\u{006c}\u{006c}\u{006f})
    else if (method === "unicode") {
        let unicodeStr = "";
        for (let i = 0; i < input.length; i++) {
            unicodeStr += "\\u{" + input.charCodeAt(i).toString(16).padStart(4, "0") + "}";
        }
        output = `loadstring("${unicodeStr}")()`;
    }
    
    // 4. Числовая обфускация (string.char(104,101,108,108,111))
    else if (method === "number") {
        let numbers = [];
        for (let i = 0; i < input.length; i++) {
            numbers.push(input.charCodeAt(i));
        }
        output = `loadstring(string.char(${numbers.join(",")}))()`;
    }
    
    // 5. Троичная обфускация (ternary)
    else if (method === "ternary") {
        let ternaryParts = [];
        for (let i = 0; i < input.length; i++) {
            ternaryParts.push(input.charCodeAt(i).toString(3).padStart(6, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${ternaryParts.join('')}"):gmatch("%d%d%d%d%d%d") do s=s..string.char(tonumber(t,3)) end return s end)())()`;
    }
    
    // 6. Бинарная обфускация (01101000 01100101...)
    else if (method === "binary") {
        let binaryStr = "";
        for (let i = 0; i < input.length; i++) {
            binaryStr += input.charCodeAt(i).toString(2).padStart(8, '0');
        }
        output = `loadstring((function() local s="" for b in ("${binaryStr}"):gmatch("%d%d%d%d%d%d%d%d") do s=s..string.char(tonumber(b,2)) end return s end)())()`;
    }
    
    // 7. Чересполосица (перемешивание символов)
    else if (method === "interleave") {
        let parts = [[], []];
        for (let i = 0; i < input.length; i++) {
            parts[i%2].push(input.charCodeAt(i));
        }
        output = `loadstring((function(a,b)local s=''for i=1,math.max(#a,#b)do if a[i]then s=s..string.char(a[i])end if b[i]then s=s..string.char(b[i])end end return s end)({${parts[0].join(',')}},{${parts[1].join(',')}}))()`;
    }

    // 8. Простое число (умножение на простые числа)
    else if (method === "prime") {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
        let transformed = [];
        for (let i = 0; i < input.length; i++) {
            const prime = primes[i % primes.length];
            transformed.push(input.charCodeAt(i) * prime);
            transformed.push(prime);
        }
        output = `loadstring((function(t)local s=''for i=1,#t,2 do s=s..string.char(t[i]//t[i+1])end return s end)({${transformed.join(',')}}))()`;
    }

    // 9. Смещение символов (добавление константы)
    else if (method === "offset") {
        const offset = 5;
        let transformed = [];
        for (let i = 0; i < input.length; i++) {
            transformed.push(input.charCodeAt(i) + offset);
        }
        output = `loadstring(string.char(${transformed.join(',')}):gsub('.',function(c)return string.char(c:byte()-${offset})end))()`;
    }
    
    if (!inputText) {
        document.getElementById("output").textContent = output;
    }
    return output;
}

// Функция для анимированной многослойной обфускации (версия 1)
function startMultiLayerObfuscation() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        alert("Введи Lua-код сначала!");
        return;
    }

    const btn = document.getElementById("multiObfuscateBtn");
    const status = document.getElementById("status");
    btn.disabled = true;
    btn.classList.add("processing");
    btn.textContent = "ОБФУСКАЦИЯ v1...";

    let currentCode = input;
    const steps = [
        { method: "offset", name: "Смещение (+5)" },
        { method: "unicode", name: "Unicode" },
        { method: "ternary", name: "Троичная система" }
    ];

    let step = 0;
    
    function processNextStep() {
        if (step >= steps.length) {
            // Завершение процесса
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1";
            status.textContent = "Многослойная обфускация v1 завершена!";
            return;
        }

        const currentMethod = steps[step];
        status.textContent = `Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`;
        
        // Обновляем текст в textarea
        document.getElementById("input").value = currentCode;
        
        // Применяем обфускацию
        currentCode = obfuscate(currentMethod.method, currentCode);
        
        // Показываем результат в output
        document.getElementById("output").textContent = currentCode;
        
        // Задержка перед следующим шагом (1 секунда)
        step++;
        setTimeout(processNextStep, 1000);
    }

    // Начинаем процесс
    processNextStep();
}

// Функция для анимированной многослойной обфускации (версия 2)
function startMultiLayerObfuscationV2() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        alert("Введи Lua-код сначала!");
        return;
    }

    const btn = document.getElementById("multiObfuscateBtnV2");
    const status = document.getElementById("statusV2");
    btn.disabled = true;
    btn.classList.add("processing");
    btn.textContent = "ОБФУСКАЦИЯ v2...";

    let currentCode = input;
    const steps = [
        { method: "prime", name: "Простое число" },
        { method: "hex", name: "HEX" },
        { method: "unicode", name: "Unicode" },
        { method: "ternary", name: "Троичная система" }
    ];

    let step = 0;
    
    function processNextStep() {
        if (step >= steps.length) {
            // Завершение процесса
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v2";
            status.textContent = "Многослойная обфускация v2 завершена!";
            return;
        }

        const currentMethod = steps[step];
        status.textContent = `Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`;
        
        // Обновляем текст в textarea
        document.getElementById("input").value = currentCode;
        
        // Применяем обфускацию
        currentCode = obfuscate(currentMethod.method, currentCode);
        
        // Показываем результат в output
        document.getElementById("output").textContent = currentCode;
        
        // Задержка перед следующим шагом (1 секунда)
        step++;
        setTimeout(processNextStep, 1000);
    }

    // Начинаем процесс
    processNextStep();
}

// Функция для анимированной многослойной обфускации (версия 3)
function startMultiLayerObfuscationV3() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        alert("Введи Lua-код сначала!");
        return;
    }

    const btn = document.getElementById("multiObfuscateBtnV3");
    const status = document.getElementById("statusV3");
    btn.disabled = true;
    btn.classList.add("processing");
    btn.textContent = "ОБФУСКАЦИЯ v3...";

    let currentCode = input;
    const steps = [
        { method: "hex", name: "HEX" },
        { method: "ternary", name: "Троичная система" },
        { method: "unicode", name: "Unicode" },
        { method: "binary", name: "Бинарный" }
    ];

    let step = 0;
    
    function processNextStep() {
        if (step >= steps.length) {
            // Завершение процесса
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v3";
            status.textContent = "Многослойная обфускация v3 завершена!";
            return;
        }

        const currentMethod = steps[step];
        status.textContent = `Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`;
        
        // Обновляем текст в textarea
        document.getElementById("input").value = currentCode;
        
        // Применяем обфускацию
        currentCode = obfuscate(currentMethod.method, currentCode);
        
        // Показываем результат в output
        document.getElementById("output").textContent = currentCode;
        
        // Задержка перед следующим шагом (1 секунда)
        step++;
        setTimeout(processNextStep, 1000);
    }

    // Начинаем процесс
    processNextStep();
}

// Функция деобфускации
function deobfuscate() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        alert("Введите обфусцированный код сначала!");
        return;
    }

    let output = "";
    
    try {
        // Попробуем определить тип обфускации
        if (input.includes("\\x") && input.includes("loadstring")) {
            // HEX обфускация
            const hexMatches = input.match(/\\x([0-9a-fA-F]{2})/g);
            if (hexMatches) {
                hexMatches.forEach(match => {
                    const hex = match.substring(2);
                    output += String.fromCharCode(parseInt(hex, 16));
                });
            }
        } 
        else if (input.includes("\\u{") && input.includes("loadstring")) {
            // Unicode обфускация
            const uniMatches = input.match(/\\u\{([0-9a-fA-F]+)\}/g);
            if (uniMatches) {
                uniMatches.forEach(match => {
                    const code = match.substring(3, match.length - 1);
                    output += String.fromCharCode(parseInt(code, 16));
                });
            }
        }
        else if (input.includes("\\") && /\\\d{3}/.test(input) && input.includes("loadstring")) {
            // ASCII обфускация
            const asciiMatches = input.match(/\\\d{1,3}/g);
            if (asciiMatches) {
                asciiMatches.forEach(match => {
                    output += String.fromCharCode(parseInt(match.substring(1)));
                });
            }
        }
        else if (input.includes("string.char(") && input.includes("loadstring")) {
            // Числовая обфускация
            const charCodeMatches = input.match(/string\.char\(([^)]+)\)/);
            if (charCodeMatches && charCodeMatches[1]) {
                const codes = charCodeMatches[1].split(',').map(Number);
                codes.forEach(code => {
                    output += String.fromCharCode(code);
                });
            }
        }
        else if (input.includes("tonumber(t,3)") && input.includes("loadstring")) {
            // Троичная обфускация
            const ternaryMatch = input.match(/"([012]+)"/);
            if (ternaryMatch && ternaryMatch[1]) {
                const ternaryStr = ternaryMatch[1];
                for (let i = 0; i < ternaryStr.length; i += 6) {
                    const ternaryChunk = ternaryStr.substr(i, 6);
                    output += String.fromCharCode(parseInt(ternaryChunk, 3));
                }
            }
        }
        else if (input.includes("tonumber(b,2)") && input.includes("loadstring")) {
            // Бинарная обфускация
            const binaryMatch = input.match(/"([01]+)"/);
            if (binaryMatch && binaryMatch[1]) {
                const binaryStr = binaryMatch[1];
                for (let i = 0; i < binaryStr.length; i += 8) {
                    const binaryChunk = binaryStr.substr(i, 8);
                    output += String.fromCharCode(parseInt(binaryChunk, 2));
                }
            }
        }
        else if (input.includes("math.max(#a,#b)") && input.includes("loadstring")) {
            // Чересполосица
            const array1Match = input.match(/\{([^}]+)\}/g);
            if (array1Match && array1Match.length >= 2) {
                const array1 = array1Match[0].slice(1, -1).split(',').map(Number);
                const array2 = array1Match[1].slice(1, -1).split(',').map(Number);
                for (let i = 0; i < Math.max(array1.length, array2.length); i++) {
                    if (array1[i]) output += String.fromCharCode(array1[i]);
                    if (array2[i]) output += String.fromCharCode(array2[i]);
                }
            }
        }
        else if (input.includes("t[i]//t[i+1]") && input.includes("loadstring")) {
            // Простое число
            const arrayMatch = input.match(/\{([^}]+)\}/);
            if (arrayMatch && arrayMatch[1]) {
                const numbers = arrayMatch[1].split(',').map(Number);
                for (let i = 0; i < numbers.length; i += 2) {
                    output += String.fromCharCode(numbers[i] / numbers[i+1]);
                }
            }
        }
        else if (input.includes(":gsub('.',function(c)") && input.includes("loadstring")) {
            // Смещение
            const offsetMatch = input.match(/string\.char\(([^)]+)\)/);
            const offsetValueMatch = input.match(/c:byte\(\)-(\d+)/);
            if (offsetMatch && offsetMatch[1] && offsetValueMatch && offsetValueMatch[1]) {
                const offset = parseInt(offsetValueMatch[1]);
                const codes = offsetMatch[1].split(',').map(Number);
                codes.forEach(code => {
                    output += String.fromCharCode(code - offset);
                });
            }
        }
        else {
            // Если не распознано, попробуем выполнить как Lua-код (опасно!)
            try {
                // Это потенциально опасная операция, в реальном приложении нужно быть осторожным
                const fakeEval = new Function('return ' + input.replace(/loadstring/g, 'function(s) return s end'));
                output = fakeEval();
            } catch (e) {
                output = "Не удалось распознать тип обфускации: " + e.message;
            }
        }
    } catch (e) {
        output = "Ошибка деобфускации: " + e.message;
    }
    
    document.getElementById("output").textContent = output || "Не удалось деобфусцировать код";
}

// Функция копирования
function copyToClipboard() {
    const output = document.getElementById("output");
    const text = output.textContent;
    
    if (!text) {
        alert("Сначала сгенерируйте обфусцированный код!");
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            const btn = document.querySelector(".copy-btn");
            btn.textContent = "СКОПИРОВАНО!";
            btn.classList.add("copied");
            
            setTimeout(() => {
                btn.textContent = "КОПИРОВАТЬ";
                btn.classList.remove("copied");
            }, 2000);
        })
        .catch(err => {
            console.error("Ошибка копирования: ", err);
            // Fallback для старых браузеров
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            
            const btn = document.querySelector(".copy-btn");
            btn.textContent = "Скопировано (старый метод)";
            setTimeout(() => {
                btn.textContent = "КОПИРОВАТЬ";
            }, 2000);
        });
}

// Автовыделение при клике на результат
document.getElementById("output").addEventListener("click", function() {
    const range = document.createRange();
    range.selectNode(this);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
});