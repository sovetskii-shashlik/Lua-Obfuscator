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

    // 5. Троичная обфускация (base3)
    else if (method === "base3") {
        let base3Parts = [];
        for (let i = 0; i < input.length; i++) {
            base3Parts.push(input.charCodeAt(i).toString(3).padStart(6, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${base3Parts.join('')}"):gmatch("%d%d%d%d%d%d") do s=s..string.char(tonumber(t,3)) end return s end)())()`;
    }

    // 6. Бинарная обфускация (binary)
    else if (method === "binary") {
        let binaryStr = "";
        for (let i = 0; i < input.length; i++) {
            binaryStr += input.charCodeAt(i).toString(2).padStart(8, '0');
        }
        output = `loadstring((function() local s="" for b in ("${binaryStr}"):gmatch("%d%d%d%d%d%d%d%d") do s=s..string.char(tonumber(b,2)) end return s end)())()`;
    }

    // 7. Четверичная обфускация (base4)
    else if (method === "base4") {
        let base4Parts = [];
        for (let i = 0; i < input.length; i++) {
            base4Parts.push(input.charCodeAt(i).toString(4).padStart(4, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${base4Parts.join('')}"):gmatch("%d%d%d%d") do s=s..string.char(tonumber(t,4)) end return s end)())()`;
    }

    // 8. Пятиричная обфускация (base5)
    else if (method === "base5") {
        let base5Parts = [];
        for (let i = 0; i < input.length; i++) {
            base5Parts.push(input.charCodeAt(i).toString(5).padStart(4, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${base5Parts.join('')}"):gmatch("%d%d%d%d") do s=s..string.char(tonumber(t,5)) end return s end)())()`;
    }

    // 9. Восьмеричная обфускация (octal)
    else if (method === "octal") {
        let octalParts = [];
        for (let i = 0; i < input.length; i++) {
            octalParts.push(input.charCodeAt(i).toString(8).padStart(3, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${octalParts.join('')}"):gmatch("%d%d%d") do s=s..string.char(tonumber(t,8)) end return s end)())()`;
    }

    // 10. Чересполосица (перемешивание символов)
    else if (method === "interleave") {
        let parts = [[], []];
        for (let i = 0; i < input.length; i++) {
            parts[i % 2].push(input.charCodeAt(i));
        }
        output = `loadstring((function(a,b)local s=''for i=1,math.max(#a,#b)do if a[i]then s=s..string.char(a[i])end if b[i]then s=s..string.char(b[i])end end return s end)({${parts[0].join(',')}},{${parts[1].join(',')}}))()`;
    }

    // 11. Простое число (умножение на простые числа)
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

    // 12. Смещение символов (добавление константы)
    else if (method === "offset") {
        const offset = 5;
        let transformed = [];
        for (let i = 0; i < input.length; i++) {
            transformed.push(input.charCodeAt(i) + offset);
        }
        output = `loadstring(string.char(${transformed.join(',')}):gsub('.',function(c)return string.char(c:byte()-${offset})end))()`;
    }

    if (!inputText) { // Only update output div if called directly by button click
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
        { method: "base3", name: "Base3" }
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

        // Update the textarea to show intermediate step results (optional, but matches original)
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
        { method: "base3", name: "Base3" }
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

        // Update the textarea
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
        { method: "base3", name: "Base3" },
        { method: "unicode", name: "Unicode" },
        { method: "binary", name: "Binary" }
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

        // Update the textarea
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
        // Note: This deobfuscation logic is very basic and heuristic.
        // It will likely only work for the exact formats produced by the obfuscate function
        // and won't handle nested or more complex obfuscation.
        // Also, the 'fakeEval' part is highly unsafe and should NOT be used in production.

        if (input.includes("\\x") && input.includes("loadstring")) {
            // HEX обфускация
            // Extract the string content within the loadstring call
            const stringMatch = input.match(/loadstring\(["'](.*?)["']\)/);
            if (stringMatch && stringMatch[1]) {
                 const hexStr = stringMatch[1];
                // Replace hex escape sequences with their characters
                output = hexStr.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
                     return String.fromCharCode(parseInt(hex, 16));
                });
            }
        }
        else if (input.includes("\\u{") && input.includes("loadstring")) {
            // Unicode обфускация
             const stringMatch = input.match(/loadstring\(["'](.*?)["']\)/);
             if (stringMatch && stringMatch[1]) {
                  const unicodeStr = stringMatch[1];
                 // Replace unicode escape sequences
                 output = unicodeStr.replace(/\\u\{([0-9a-fA-F]+)\}/g, (match, code) => {
                     return String.fromCharCode(parseInt(code, 16));
                 });
             }
        }
        else if (input.includes("\\") && /\\\d{1,3}/.test(input) && input.includes("loadstring")) {
            // ASCII обфускация
             const stringMatch = input.match(/loadstring\(["'](.*?)["']\)/);
             if (stringMatch && stringMatch[1]) {
                  const asciiStr = stringMatch[1];
                 // Replace ASCII escape sequences
                 output = asciiStr.replace(/\\\d{1,3}/g, (match) => {
                     return String.fromCharCode(parseInt(match.substring(1)));
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
         else if (input.includes("tonumber(t,3)") && input.includes(":gmatch") && input.includes("loadstring")) {
             // Base3 обфускация
             const base3Match = input.match(/"([012]+)"/);
             if (base3Match && base3Match[1]) {
                 const base3Str = base3Match[1];
                 for (let i = 0; i < base3Str.length; i += 6) {
                     const base3Chunk = base3Str.substr(i, 6);
                     // Ensure the chunk is valid base3 before parsing
                     if (/^[012]+$/.test(base3Chunk)) {
                         output += String.fromCharCode(parseInt(base3Chunk, 3));
                     } else {
                         throw new Error("Invalid Base3 chunk");
                     }
                 }
             }
         }
         else if (input.includes("tonumber(b,2)") && input.includes(":gmatch") && input.includes("loadstring")) {
             // Binary обфускация
             const binaryMatch = input.match(/"([01]+)"/);
             if (binaryMatch && binaryMatch[1]) {
                 const binaryStr = binaryMatch[1];
                 for (let i = 0; i < binaryStr.length; i += 8) {
                     const binaryChunk = binaryStr.substr(i, 8);
                     // Ensure the chunk is valid binary
                     if (/^[01]+$/.test(binaryChunk)) {
                          output += String.fromCharCode(parseInt(binaryChunk, 2));
                     } else {
                         throw new Error("Invalid Binary chunk");
                     }
                 }
             }
         }
        else if (input.includes("tonumber(t,4)") && input.includes(":gmatch") && input.includes("loadstring")) {
            // Base4 обфускация
             const base4Match = input.match(/"([0-3]+)"/);
             if (base4Match && base4Match[1]) {
                 const base4Str = base4Match[1];
                 for (let i = 0; i < base4Str.length; i += 4) {
                     const base4Chunk = base4Str.substr(i, 4);
                      if (/^[0-3]+$/.test(base4Chunk)) {
                         output += String.fromCharCode(parseInt(base4Chunk, 4));
                     } else {
                         throw new Error("Invalid Base4 chunk");
                     }
                 }
             }
        }
        else if (input.includes("tonumber(t,5)") && input.includes(":gmatch") && input.includes("loadstring")) {
            // Base5 обфускация
             const base5Match = input.match(/"([0-4]+)"/);
             if (base5Match && base5Match[1]) {
                 const base5Str = base5Match[1];
                 for (let i = 0; i < base5Str.length; i += 4) {
                     const base5Chunk = base5Str.substr(i, 4);
                      if (/^[0-4]+$/.test(base5Chunk)) {
                         output += String.fromCharCode(parseInt(base5Chunk, 5));
                     } else {
                         throw new Error("Invalid Base5 chunk");
                     }
                 }
             }
        }
        else if (input.includes("tonumber(t,8)") && input.includes(":gmatch") && input.includes("loadstring")) {
            // Octal обфускация
             const octalMatch = input.match(/"([0-7]+)"/);
             if (octalMatch && octalMatch[1]) {
                 const octalStr = octalMatch[1];
                 for (let i = 0; i < octalStr.length; i += 3) {
                     const octalChunk = octalStr.substr(i, 3);
                      if (/^[0-7]+$/.test(octalChunk)) {
                         output += String.fromCharCode(parseInt(octalChunk, 8));
                     } else {
                         throw new Error("Invalid Octal chunk");
                     }
                 }
             }
        }
        else if (input.includes("math.max(#a,#b)") && input.includes("loadstring")) {
            // Чересполосица
            const arrayMatches = input.match(/\{([^}]+)\}/g);
            if (arrayMatches && arrayMatches.length >= 2) {
                const array1 = arrayMatches[0].slice(1, -1).split(',').map(Number);
                const array2 = arrayMatches[1].slice(1, -1).split(',').map(Number);
                for (let i = 0; i < Math.max(array1.length, array2.length); i++) {
                    if (!isNaN(array1[i])) output += String.fromCharCode(array1[i]);
                    if (!isNaN(array2[i])) output += String.fromCharCode(array2[i]);
                }
            }
        }
        else if (input.includes("t[i]//t[i+1]") && input.includes("loadstring")) {
            // Простое число
            const arrayMatch = input.match(/\{([^}]+)\}/);
            if (arrayMatch && arrayMatch[1]) {
                const numbers = arrayMatch[1].split(',').map(Number);
                for (let i = 0; i < numbers.length; i += 2) {
                     // Check if the division is valid
                    if (!isNaN(numbers[i]) && !isNaN(numbers[i+1]) && numbers[i+1] !== 0) {
                         output += String.fromCharCode(numbers[i] / numbers[i+1]);
                    } else {
                        throw new Error("Invalid numbers for Prime deobfuscation");
                    }
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
                     if (!isNaN(code) && !isNaN(offset)) {
                       output += String.fromCharCode(code - offset);
                    } else {
                         throw new Error("Invalid numbers for Offset deobfuscation");
                    }
                });
            }
        }
        else {
            // If not recognized, try a simple approach: remove loadstring and surrounding quotes/parentheses
            // This is a very weak deobfuscation attempt.
            const simpleMatch = input.match(/loadstring\(\s*["'](.*?)["']\s*\)\(\)/s);
            if (simpleMatch && simpleMatch[1]) {
                 output = simpleMatch[1];
                 // Simple unescape for common escapes if any remain
                 output = output.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
            } else {
                 // Fallback to indicating failure
                 output = "Не удалось распознать тип обфускации или применить простую деобфускацию.";
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
            // Make the textarea invisible and remove it from the flow
            textarea.style.position = "fixed";
            textarea.style.top = "0";
            textarea.style.left = "0";
            textarea.style.width = "1px";
            textarea.style.height = "1px";
            textarea.style.padding = "0";
            textarea.style.border = "none";
            textarea.style.outline = "none";
            textarea.style.boxShadow = "none";
            textarea.style.background = "transparent";

            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");
                 const btn = document.querySelector(".copy-btn");
                 btn.textContent = "Скопировано (fallback)";
                 btn.classList.add("copied"); // Add copied class for feedback

                 setTimeout(() => {
                     btn.textContent = "КОПИРОВАТЬ";
                     btn.classList.remove("copied");
                 }, 2000);

            } catch (e) {
                console.error("Fallback copying failed: ", e);
                 const btn = document.querySelector(".copy-btn");
                 btn.textContent = "Не удалось скопировать";
                 setTimeout(() => {
                      btn.textContent = "КОПИРОВАТЬ";
                 }, 2000);
            } finally {
                 document.body.removeChild(textarea);
            }
        });
}

// Автовыделение при клике на результат
document.getElementById("output").addEventListener("click", function() {
    const range = document.createRange();
    range.selectNode(this);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
});