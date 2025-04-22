// Переключение темы
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
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
        showAlert("Введи Lua-код сначала!");
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

    if (!inputText) {
        document.getElementById("output").textContent = output;
    }
    return output;
}

// Функция для анимированной многослойной обфускации (версия 1)
function startMultiLayerObfuscation() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        showAlert("Введи Lua-код сначала!");
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
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1";
            status.textContent = "Многослойная обфускация v1 завершена!";
            return;
        }

        const currentMethod = steps[step];
        status.textContent = `Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`;
        document.getElementById("input").value = currentCode;
        currentCode = obfuscate(currentMethod.method, currentCode);
        document.getElementById("output").textContent = currentCode;
        step++;
        setTimeout(processNextStep, 1000);
    }

    processNextStep();
}

// Функция для анимированной многослойной обфускации (версия 2)
function startMultiLayerObfuscationV2() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        showAlert("Введи Lua-код сначала!");
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
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v2";
            status.textContent = "Многослойная обфускация v2 завершена!";
            return;
        }

        const currentMethod = steps[step];
        status.textContent = `Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`;
        document.getElementById("input").value = currentCode;
        currentCode = obfuscate(currentMethod.method, currentCode);
        document.getElementById("output").textContent = currentCode;
        step++;
        setTimeout(processNextStep, 1000);
    }

    processNextStep();
}

// Функция для анимированной многослойной обфускации (версия 3)
function startMultiLayerObfuscationV3() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        showAlert("Введи Lua-код сначала!");
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
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v3";
            status.textContent = "Многослойная обфускация v3 завершена!";
            return;
        }

        const currentMethod = steps[step];
        status.textContent = `Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`;
        document.getElementById("input").value = currentCode;
        currentCode = obfuscate(currentMethod.method, currentCode);
        document.getElementById("output").textContent = currentCode;
        step++;
        setTimeout(processNextStep, 1000);
    }

    processNextStep();
}

// Функция деобфускации
function deobfuscate() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
        showAlert("Введите обфусцированный код сначала!");
        return;
    }

    let output = "";

    try {
        if (input.includes("\\x") && input.includes("loadstring")) {
            const stringMatch = input.match(/loadstring\(["'](.*?)["']\)/);
            if (stringMatch && stringMatch[1]) {
                output = stringMatch[1].replace(/\\x([0-9a-fA-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
            }
        }
        else if (input.includes("\\u{") && input.includes("loadstring")) {
            const stringMatch = input.match(/loadstring\(["'](.*?)["']\)/);
            if (stringMatch && stringMatch[1]) {
                output = stringMatch[1].replace(/\\u\{([0-9a-fA-F]+)\}/g, (m, c) => String.fromCharCode(parseInt(c, 16)));
            }
        }
        else if (input.includes("\\") && /\\\d{1,3}/.test(input) && input.includes("loadstring")) {
            const stringMatch = input.match(/loadstring\(["'](.*?)["']\)/);
            if (stringMatch && stringMatch[1]) {
                output = stringMatch[1].replace(/\\\d{1,3}/g, (m) => String.fromCharCode(parseInt(m.substring(1))));
            }
        }
        else if (input.includes("string.char(") && input.includes("loadstring")) {
            const charCodeMatches = input.match(/string\.char\(([^)]+)\)/);
            if (charCodeMatches && charCodeMatches[1]) {
                output = charCodeMatches[1].split(',').map(Number).map(c => String.fromCharCode(c)).join('');
            }
        }
        else if (input.includes("tonumber(t,3)") && input.includes(":gmatch") && input.includes("loadstring")) {
            const base3Match = input.match(/"([012]+)"/);
            if (base3Match && base3Match[1]) {
                for (let i = 0; i < base3Match[1].length; i += 6) {
                    const chunk = base3Match[1].substr(i, 6);
                    if (/^[012]+$/.test(chunk)) output += String.fromCharCode(parseInt(chunk, 3));
                }
            }
        }
        else if (input.includes("tonumber(b,2)") && input.includes(":gmatch") && input.includes("loadstring")) {
            const binaryMatch = input.match(/"([01]+)"/);
            if (binaryMatch && binaryMatch[1]) {
                for (let i = 0; i < binaryMatch[1].length; i += 8) {
                    const chunk = binaryMatch[1].substr(i, 8);
                    if (/^[01]+$/.test(chunk)) output += String.fromCharCode(parseInt(chunk, 2));
                }
            }
        }
        else if (input.includes("tonumber(t,4)") && input.includes(":gmatch") && input.includes("loadstring")) {
            const base4Match = input.match(/"([0-3]+)"/);
            if (base4Match && base4Match[1]) {
                for (let i = 0; i < base4Match[1].length; i += 4) {
                    const chunk = base4Match[1].substr(i, 4);
                    if (/^[0-3]+$/.test(chunk)) output += String.fromCharCode(parseInt(chunk, 4));
                }
            }
        }
        else if (input.includes("tonumber(t,5)") && input.includes(":gmatch") && input.includes("loadstring")) {
            const base5Match = input.match(/"([0-4]+)"/);
            if (base5Match && base5Match[1]) {
                for (let i = 0; i < base5Match[1].length; i += 4) {
                    const chunk = base5Match[1].substr(i, 4);
                    if (/^[0-4]+$/.test(chunk)) output += String.fromCharCode(parseInt(chunk, 5));
                }
            }
        }
        else if (input.includes("tonumber(t,8)") && input.includes(":gmatch") && input.includes("loadstring")) {
            const octalMatch = input.match(/"([0-7]+)"/);
            if (octalMatch && octalMatch[1]) {
                for (let i = 0; i < octalMatch[1].length; i += 3) {
                    const chunk = octalMatch[1].substr(i, 3);
                    if (/^[0-7]+$/.test(chunk)) output += String.fromCharCode(parseInt(chunk, 8));
                }
            }
        }
        else if (input.includes("math.max(#a,#b)") && input.includes("loadstring")) {
            const arrayMatches = input.match(/\{([^}]+)\}/g);
            if (arrayMatches && arrayMatches.length >= 2) {
                const arr1 = arrayMatches[0].slice(1, -1).split(',').map(Number);
                const arr2 = arrayMatches[1].slice(1, -1).split(',').map(Number);
                for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
                    if (arr1[i] !== undefined) output += String.fromCharCode(arr1[i]);
                    if (arr2[i] !== undefined) output += String.fromCharCode(arr2[i]);
                }
            }
        }
        else if (input.includes("t[i]//t[i+1]") && input.includes("loadstring")) {
            const arrayMatch = input.match(/\{([^}]+)\}/);
            if (arrayMatch && arrayMatch[1]) {
                const nums = arrayMatch[1].split(',').map(Number);
                for (let i = 0; i < nums.length; i += 2) {
                    if (nums[i+1] !== 0) output += String.fromCharCode(nums[i] / nums[i+1]);
                }
            }
        }
        else if (input.includes(":gsub('.',function(c)") && input.includes("loadstring")) {
            const offsetMatch = input.match(/string\.char\(([^)]+)\)/);
            const offsetValue = input.match(/c:byte\(\)-(\d+)/);
            if (offsetMatch && offsetMatch[1] && offsetValue && offsetValue[1]) {
                const offset = parseInt(offsetValue[1]);
                offsetMatch[1].split(',').map(Number).forEach(c => {
                    output += String.fromCharCode(c - offset);
                });
            }
        }
        else {
            const simpleMatch = input.match(/loadstring\(\s*["'](.*?)["']\s*\)\(\)/s);
            if (simpleMatch && simpleMatch[1]) {
                output = simpleMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
            } else {
                output = "Не удалось распознать тип обфускации";
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
        showAlert("Сначала сгенерируйте обфусцированный код!");
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector(".copy-btn");
        btn.textContent = "СКОПИРОВАНО!";
        btn.classList.add("copied");
        setTimeout(() => {
            btn.textContent = "КОПИРОВАТЬ";
            btn.classList.remove("copied");
        }, 2000);
    }).catch(err => {
        console.error("Ошибка копирования:", err);
        // Fallback для старых браузеров
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            const btn = document.querySelector(".copy-btn");
            btn.textContent = "Скопировано (fallback)";
            btn.classList.add("copied");
            setTimeout(() => {
                btn.textContent = "КОПИРОВАТЬ";
                btn.classList.remove("copied");
            }, 2000);
        } catch (e) {
            console.error("Fallback copying failed:", e);
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

// --- Универсальное сохранение файла ---
const saveButton = document.getElementById('saveButton');
const saveFileDialog = document.getElementById('saveFileDialog');
const fileNameInput = document.getElementById('fileNameInput');
const saveFileOkBtn = document.getElementById('saveFileOkBtn');
const saveFileCancelBtn = document.getElementById('saveFileCancelBtn');
const formatDialog = document.getElementById('formatDialog');
const saveLuaBtn = document.getElementById('saveLuaBtn');
const saveTextBtn = document.getElementById('saveTextBtn');

let currentFileName = '';

// Показываем диалог сохранения
saveButton.addEventListener('click', () => {
    const outputText = document.getElementById("output").textContent.trim();
    if (!outputText) {
        showAlert("Нет кода для сохранения. Сначала проведите обфускацию.");
        return;
    }
    saveFileDialog.style.display = 'flex';
    fileNameInput.value = '';
    fileNameInput.focus();
    formatDialog.style.display = 'none';
});

// Обработчики диалогов
saveFileOkBtn.addEventListener('click', () => {
    const filename = fileNameInput.value.trim();
    if (filename) {
        currentFileName = filename;
        saveFileDialog.style.display = 'none';
        formatDialog.style.display = 'flex';
    } else {
        showAlert("Введите имя файла!");
        fileNameInput.focus();
    }
});

fileNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveFileOkBtn.click();
});

saveFileCancelBtn.addEventListener('click', () => {
    saveFileDialog.style.display = 'none';
});

// Выбор формата файла
saveLuaBtn.addEventListener('click', () => {
    saveFile(currentFileName, 'lua');
    formatDialog.style.display = 'none';
});

saveTextBtn.addEventListener('click', () => {
    saveFile(currentFileName, 'txt');
    formatDialog.style.display = 'none';
});

// Универсальная функция сохранения
function saveFile(filename, extension) {
    const content = document.getElementById("output").textContent;
    const fullFilename = `${filename}.${extension}`;
    const mimeType = extension === 'lua' ? 'text/x-lua' : 'text/plain';

    // 1. Попробовать стандартный метод Blob (работает в браузерах)
    if (typeof Blob !== 'undefined') {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fullFilename;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            showAlert(`Файл ${fullFilename} успешно сохранен!`);
            return;
        } catch (e) {
            console.error("Blob method failed:", e);
        }
    }

    // 2. Попробовать Cordova/PhoneGap (для мобильных приложений)
    if (window.cordova || window.Capacitor) {
        try {
            const path = cordova.file.externalRootDirectory + fullFilename;
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, 
                (dir) => {
                    dir.getFile(fullFilename, { create: true }, 
                        (file) => {
                            file.createWriter(
                                (writer) => {
                                    writer.write(content);
                                    showAlert(`Файл сохранен в: ${path}`);
                                }, 
                                (error) => showAlert("Ошибка записи: " + error.code)
                            );
                        }, 
                        (error) => showAlert("Ошибка создания файла: " + error.code)
                    );
                }, 
                (error) => showAlert("Ошибка доступа к хранилищу: " + error.code)
            );
            return;
        } catch (e) {
            console.error("Cordova method failed:", e);
        }
    }

    // 3. Попробовать Electron (для десктоп приложений)
    if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
        try {
            const fs = require('fs');
            const { dialog } = require('electron').remote;
            
            dialog.showSaveDialog({
                title: 'Сохранить файл',
                defaultPath: fullFilename,
                filters: [
                    { name: 'Lua Files', extensions: ['lua'] },
                    { name: 'Text Files', extensions: ['txt'] }
                ]
            }).then(result => {
                if (!result.canceled && result.filePath) {
                    fs.writeFileSync(result.filePath, content);
                    showAlert(`Файл сохранен в: ${result.filePath}`);
                }
            });
            return;
        } catch (e) {
            console.error("Electron method failed:", e);
        }
    }

    // 4. Ultimate fallback - открыть в новом окне
    try {
        const newWindow = window.open("", "_blank");
        newWindow.document.write(`<pre>${content}</pre>`);
        newWindow.document.title = fullFilename;
        showAlert("Не удалось сохранить файл. Код открыт в новом окне.");
    } catch (e) {
        console.error("All methods failed:", e);
        showAlert("Ошибка при сохранении файла. Скопируйте код вручную.");
    }
}

// Вспомогательная функция для показа сообщений
function showAlert(message) {
    alert(message);
}

// Автовыделение при клике на результат
document.getElementById("output").addEventListener("click", function() {
    const range = document.createRange();
    range.selectNode(this);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
});
