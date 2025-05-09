// === Theme Toggle ===
const themeToggle = document.getElementById('themeToggle');
const urlToggleBtn = document.getElementById('urlToggleBtn');
const codeObfuscatorDiv = document.getElementById('codeObfuscator');
const urlObfuscatorDiv = document.getElementById('urlObfuscator');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkTheme', isDark);
});

if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
} else {
    themeToggle.textContent = '🌙';
}

// === View Switch ===
urlToggleBtn.addEventListener('click', () => {
    const isCodeVisible = codeObfuscatorDiv.style.display !== 'none';
    codeObfuscatorDiv.style.display = isCodeVisible ? 'none' : 'block';
    urlObfuscatorDiv.style.display = isCodeVisible ? 'block' : 'none';
    urlToggleBtn.textContent = isCodeVisible ? '📄' : '🔗';
    urlToggleBtn.title = isCodeVisible ? 'Переключить на обфускатор кода' : 'Переключить на URL обфускатор';

    document.getElementById("status").textContent = '';
    document.getElementById("statusV2").textContent = '';
    document.getElementById("statusV3").textContent = '';
});

// === Obfuscation Logic ===
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function obfuscate(method, inputText) {
    const input = inputText || document.getElementById("input").value.trim();
    const outputElement = document.getElementById("output");

    if (!input) {
        alert("Введи Lua-код сначала!");
        outputElement.textContent = '';
        return "";
    }

    if (!inputText) {
        outputElement.textContent = 'Генерация...';
    }

    let output = "";
    try {
        switch (method) {
            case "ascii":
                output = `loadstring("${[...input].map(c => "\\" + c.charCodeAt(0)).join("")}")()`;
                break;
            case "hex":
                output = `loadstring("${[...input].map(c => "\\x" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")}")()`;
                break;
            case "unicode":
                output = `loadstring("${[...input].map(c => "\\u{" + c.charCodeAt(0).toString(16).padStart(4, "0") + "}").join("")}")()`;
                break;
            case "number":
                output = `loadstring(string.char(${[...input].map(c => c.charCodeAt(0)).join(",")}))()`;
                break;
            case "base3":
                let base3 = [...input].map(c => c.charCodeAt(0).toString(3).padStart(6, '0')).join('');
                output = `loadstring((function() local s="" for t in ("${base3}"):gmatch("%d%d%d%d%d%d") do s=s..string.char(tonumber(t,3)) end return s end)())()`;
                break;
            case "binary":
                let binary = [...input].map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
                output = `loadstring((function() local s="" for c in ("${binary}"):gmatch("%d%d%d%d%d%d%d%d") do s=s..string.char(tonumber(c,2)) end return s end)())()`;
                break;
            case "base4":
            case "base5":
            case "octal":
            case "octal8":
            case "interleave":
            case "prime":
                output = "-- Не реализовано";
                break;
            case "offset":
                output = `loadstring(string.char(${[...input].map(c => c.charCodeAt(0) + 5).join(',')}):gsub('.',function(c)return string.char(c:byte()-5)end))()`;
                break;
            case "multiply":
                output = `loadstring(string.char(${[...input].map(c => c.charCodeAt(0) * 2).join(',')}):gsub('.',function(c)return string.char(c:byte()//2)end))()`;
                break;
            case "random_offset":
                let of = getRandomInt(1000, 10000);
                output = `loadstring((function(c,o)local s='' for i=1,#c do s=s..string.char(c[i]-o) end return s end)({${[...input].map(c => c.charCodeAt(0) + of).join(',')}},${of}))()`;
                break;
            case "random_multiply":
                let mv;
                do { mv = getRandomInt(2, 50); } while (mv === 1);
                output = `loadstring((function(c,m)local s='' for i=1,#c do s=s..string.char(math.floor(c[i]/m)) end return s end)({${[...input].map(c => c.charCodeAt(0) * mv).join(',')}},${mv}))()`;
                break;
            default:
                output = `--[[ Неизвестный метод: ${method} ]]`;
        }
    } catch (err) {
        output = `--[[ Ошибка обфускации (${method}): ${err.message} ]]`;
    }

    if (!inputText) outputElement.textContent = output;
    return output;
}

// === Copy to Clipboard (Code) ===
function copyCodeToClipboard() {
    const text = document.getElementById("output").textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector("#codeObfuscator .copy-btn");
        const original = btn.textContent;
        btn.textContent = "СКОПИРОВАНО!";
        btn.classList.add("copied");
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove("copied");
        }, 1500);
    });
}

// === Auto Select Output ===
document.getElementById("output").addEventListener("click", function () {
    const excluded = ['Генерация...', 'Ошибка'];
    if (!this.textContent || excluded.some(x => this.textContent.startsWith(x))) return;
    const range = document.createRange();
    range.selectNodeContents(this);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
});

// === Multilayer Functions ===
function startMultiLayerObfuscation() {
    const input = document.getElementById("input").value.trim();
    if (!input) return alert("Введи Lua-код сначала!");
    const output = obfuscate('hex', obfuscate('ascii', input));
    document.getElementById("output").textContent = output;
    document.getElementById("status").textContent = "Обфускация v1 завершена!";
}

function startMultiLayerObfuscationV2() {
    const input = document.getElementById("input").value.trim();
    if (!input) return alert("Введи Lua-код сначала!");
    const output = obfuscate('unicode', obfuscate('number', input));
    document.getElementById("output").textContent = output;
    document.getElementById("statusV2").textContent = "Обфускация v2 завершена!";
}

function startMultiLayerObfuscationV3() {
    const input = document.getElementById("input").value.trim();
    if (!input) return alert("Введи Lua-код сначала!");
    const output = obfuscate('random_multiply', obfuscate('random_offset', input));
    document.getElementById("output").textContent = output;
    document.getElementById("statusV3").textContent = "Обфускация v3 завершена!";
}

// === URL Obfuscator ===
function encodeUrl() {
    const url = document.getElementById('urlInput').value.trim();
    const container = document.getElementById('urlOutputContainer');
    if (!url) return alert("Please enter a URL first");

    const safe = new Set(['/', '=', '+', '-', '_', '~', ':']);
    let encoded = "";
    let i = url.indexOf("://") + 3;
    let scheme = url.substring(0, i);
    let path = url.substring(i);

    for (const char of path) {
        const code = char.charCodeAt(0);
        if (safe.has(char)) encoded += char;
        else if (code <= 255) encoded += "%" + code.toString(16).toUpperCase().padStart(2, '0');
        else encoded += encodeURIComponent(char);
    }

    const finalUrl = scheme + encoded;
    const loadstringCode = `loadstring(game:HttpGet("${finalUrl}"))()`;
    container.innerHTML = `<div class="result-box">
        <span class="result-label">READY-TO-USE LUA CODE:</span>
        <textarea id="urlLuaCode" readonly>${loadstringCode}</textarea>
        <button class="copy-btn" onclick="copyUrlToClipboard()">COPY TO CLIPBOARD</button>
    </div>`;
}

function copyUrlToClipboard() {
    const textarea = document.getElementById('urlLuaCode');
    if (!textarea) return alert("No code to copy.");
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
        const btn = document.querySelector('#urlObfuscator .copy-btn');
        const originalText = btn.textContent;
        btn.textContent = "COPIED!";
        btn.style.backgroundColor = "#4CAF50";
        if (document.body.classList.contains('dark-theme')) btn.style.backgroundColor = "#2e7d32";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = "#2196F3";
            if (document.body.classList.contains('dark-theme')) btn.style.backgroundColor = "#1565c0";
        }, 2000);
    });
}

// Allow Enter to trigger encoding
document.getElementById('urlInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        encodeUrl();
    }
});