// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ========== //
const { Filesystem, Directory } = capacitorPlugins.Filesystem;
let isNativePlatform = false;

// ========== ИНИЦИАЛИЗАЦИЯ ========== //
document.addEventListener('DOMContentLoaded', async function() {
    // Проверяем, работает ли Capacitor
    if (typeof capacitorPlugins !== 'undefined') {
        isNativePlatform = true;
        console.log("Работаем в нативном окружении (Capacitor)");
    } else {
        console.log("Работаем в браузере");
    }

    initTheme();
    initButtons();
    initDialogs();
});

// ========== ТЕМА ========== //
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('darkTheme', isDark);
    });
}

// ========== КНОПКИ ========== //
function initButtons() {
    // Кнопки обфускации
    document.querySelectorAll('.buttons button').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.textContent.toLowerCase();
            obfuscate(method);
        });
    });
    
    // Копирование
    document.querySelector('.copy-btn').addEventListener('click', copyToClipboard);
    
    // Деобфускация
    document.querySelector('.deobfuscate-btn').addEventListener('click', deobfuscate);
    
    // Многослойная обфускация
    document.getElementById('multiObfuscateBtn').addEventListener('click', startMultiLayerObfuscation);
    document.getElementById('multiObfuscateBtnV2').addEventListener('click', startMultiLayerObfuscationV2);
    document.getElementById('multiObfuscateBtnV3').addEventListener('click', startMultiLayerObfuscationV3);
    
    // Сохранение
    document.getElementById('saveButton').addEventListener('click', startFileSaveProcess);
}

// ========== ДИАЛОГИ ========== //
function initDialogs() {
    // Диалог имени файла
    document.getElementById('saveFileOkBtn').addEventListener('click', function() {
        hideDialog('saveFileDialog');
        const filename = document.getElementById('fileNameInput').value.trim() || 'obfuscated_code';
        showDialog('formatDialog');
        window.pendingFilename = filename;
    });
    
    document.getElementById('saveFileCancelBtn').addEventListener('click', function() {
        hideDialog('saveFileDialog');
    });
    
    // Диалог формата
    document.getElementById('saveLuaBtn').addEventListener('click', function() {
        hideDialog('formatDialog');
        saveFile(window.pendingFilename + '.lua');
    });
    
    document.getElementById('saveTextBtn').addEventListener('click', function() {
        hideDialog('formatDialog');
        saveFile(window.pendingFilename + '.txt');
    });
}

// ========== СОХРАНЕНИЕ ФАЙЛА ========== //
async function startFileSaveProcess() {
    const content = document.getElementById("output").textContent.trim();
    if (!content) {
        showAlert("Нет данных для сохранения!");
        return;
    }
    showDialog('saveFileDialog');
    document.getElementById('fileNameInput').value = '';
    document.getElementById('fileNameInput').focus();
}

async function saveFile(filename) {
    const content = document.getElementById("output").textContent;
    
    try {
        if (isNativePlatform) {
            // Используем Capacitor Filesystem API
            await Filesystem.writeFile({
                path: `Download/${filename}`,
                data: content,
                directory: Directory.ExternalStorage,
                recursive: true
            });
            
            showAlert(`Файл сохранен в /storage/emulated/0/Download/${filename}`);
        } else {
            // Fallback для браузера
            const blob = new Blob([content], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showAlert(`Файл ${filename} сохранен в Загрузки`);
            }, 100);
        }
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        showAlert("Ошибка сохранения! Проверьте консоль для деталей.");
    }
}

// ========== ОБФУСКАЦИЯ (полные функции без сокращений) ========== //
function obfuscate(method, inputText) {
    const input = inputText || document.getElementById("input").value.trim();
    if (!input) {
        showAlert("Введи Lua-код сначала!");
        return "";
    }

    let output = "";

    // ASCII обфускация (\104\101\108\108\111)
    if (method === "ascii") {
        let escaped = "";
        for (let i = 0; i < input.length; i++) {
            escaped += "\\" + input.charCodeAt(i);
        }
        output = `loadstring("${escaped}")()`;
    }

    // HEX обфускация (\x68\x65\x6c\x6c\x6f)
    else if (method === "hex") {
        let hexStr = "";
        for (let i = 0; i < input.length; i++) {
            hexStr += "\\x" + input.charCodeAt(i).toString(16).padStart(2, "0");
        }
        output = `loadstring("${hexStr}")()`;
    }

    // Unicode обфускация (\u{0068}\u{0065}\u{006c}\u{006c}\u{006f})
    else if (method === "unicode") {
        let unicodeStr = "";
        for (let i = 0; i < input.length; i++) {
            unicodeStr += "\\u{" + input.charCodeAt(i).toString(16).padStart(4, "0") + "}";
        }
        output = `loadstring("${unicodeStr}")()`;
    }

    // Числовая обфускация (string.char(104,101,108,108,111))
    else if (method === "number") {
        let numbers = [];
        for (let i = 0; i < input.length; i++) {
            numbers.push(input.charCodeAt(i));
        }
        output = `loadstring(string.char(${numbers.join(",")}))()`;
    }

    // Троичная обфускация (base3)
    else if (method === "base3") {
        let base3Parts = [];
        for (let i = 0; i < input.length; i++) {
            base3Parts.push(input.charCodeAt(i).toString(3).padStart(6, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${base3Parts.join('')}"):gmatch("%d%d%d%d%d%d") do s=s..string.char(tonumber(t,3)) end return s end)())()`;
    }

    // Бинарная обфускация (binary)
    else if (method === "binary") {
        let binaryStr = "";
        for (let i = 0; i < input.length; i++) {
            binaryStr += input.charCodeAt(i).toString(2).padStart(8, '0');
        }
        output = `loadstring((function() local s="" for b in ("${binaryStr}"):gmatch("%d%d%d%d%d%d%d%d") do s=s..string.char(tonumber(b,2)) end return s end)())()`;
    }

    // Четверичная обфускация (base4)
    else if (method === "base4") {
        let base4Parts = [];
        for (let i = 0; i < input.length; i++) {
            base4Parts.push(input.charCodeAt(i).toString(4).padStart(4, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${base4Parts.join('')}"):gmatch("%d%d%d%d") do s=s..string.char(tonumber(t,4)) end return s end)())()`;
    }

    // Пятиричная обфускация (base5)
    else if (method === "base5") {
        let base5Parts = [];
        for (let i = 0; i < input.length; i++) {
            base5Parts.push(input.charCodeAt(i).toString(5).padStart(4, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${base5Parts.join('')}"):gmatch("%d%d%d%d") do s=s..string.char(tonumber(t,5)) end return s end)())()`;
    }

    // Восьмеричная обфускация (octal)
    else if (method === "octal") {
        let octalParts = [];
        for (let i = 0; i < input.length; i++) {
            octalParts.push(input.charCodeAt(i).toString(8).padStart(3, '0'));
        }
        output = `loadstring((function() local s="" for t in ("${octalParts.join('')}"):gmatch("%d%d%d") do s=s..string.char(tonumber(t,8)) end return s end)())()`;
    }

    // Чересполосица (перемешивание символов)
    else if (method === "interleave") {
        let parts = [[], []];
        for (let i = 0; i < input.length; i++) {
            parts[i % 2].push(input.charCodeAt(i));
        }
        output = `loadstring((function(a,b)local s=''for i=1,math.max(#a,#b)do if a[i]then s=s..string.char(a[i])end if b[i]then s=s..string.char(b[i])end end return s end)({${parts[0].join(',')}},{${parts[1].join(',')}}))()`;
    }

    // Простое число (умножение на простые числа)
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

    // Смещение символов (добавление константы)
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

// ========== МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ ========== //
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

// ========== ДЕОБФУСКАЦИЯ ========== //
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

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ========== //
function showDialog(id) {
    document.getElementById(id).style.display = 'flex';
}

function hideDialog(id) {
    document.getElementById(id).style.display = 'none';
}

function showAlert(message) {
    alert(message);
}

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