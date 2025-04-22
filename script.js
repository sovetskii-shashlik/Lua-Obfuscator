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

    // ... (остальные методы обфускации остаются такими же)
    // Полный код будет в следующем сообщении
    
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

// ... (остальные функции остаются такими же)
// Полный код будет в следующем сообщении

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

// --- Сохранение файла ---
const saveButton = document.getElementById('saveButton');
const saveFileDialog = document.getElementById('saveFileDialog');
const fileNameInput = document.getElementById('fileNameInput');
const saveFileOkBtn = document.getElementById('saveFileOkBtn');
const saveFileCancelBtn = document.getElementById('saveFileCancelBtn');
const formatDialog = document.getElementById('formatDialog');
const saveLuaBtn = document.getElementById('saveLuaBtn');
const saveTextBtn = document.getElementById('saveTextBtn');

let currentFileName = '';

// Show the file name dialog
saveButton.addEventListener('click', () => {
    const outputText = document.getElementById("output").textContent.trim();
    if (!outputText) {
        alert("Нет кода для сохранения. Сначала проведите обфускацию.");
        return;
    }
    saveFileDialog.style.display = 'flex';
    fileNameInput.value = '';
    fileNameInput.focus();
    formatDialog.style.display = 'none';
});

// Handle OK button in file name dialog
saveFileOkBtn.addEventListener('click', () => {
    const filename = fileNameInput.value.trim();
    if (filename) {
        currentFileName = filename;
        saveFileDialog.style.display = 'none';
        formatDialog.style.display = 'flex';
    } else {
        alert("Введите имя файла!");
        fileNameInput.focus();
    }
});

// Handle Enter key in file name input
fileNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        saveFileOkBtn.click();
    }
});

// Handle Cancel button in file name dialog
saveFileCancelBtn.addEventListener('click', () => {
    saveFileDialog.style.display = 'none';
});

// Handle format selection
saveLuaBtn.addEventListener('click', () => {
    downloadFile(currentFileName, 'lua');
    formatDialog.style.display = 'none';
});

saveTextBtn.addEventListener('click', () => {
    downloadFile(currentFileName, 'txt');
    formatDialog.style.display = 'none';
});

// Function to download the file
function downloadFile(filename, format) {
    const outputText = document.getElementById("output").textContent;
    const blob = new Blob([outputText], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Автовыделение при клике на результат
document.getElementById("output").addEventListener("click", function() {
    const range = document.createRange();
    range.selectNode(this);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
});
