// === Полное содержимое script.js ===

// --- Логика переключения темы ---
const themeToggle = document.getElementById('themeToggle');
const urlToggleBtn = document.getElementById('urlToggleBtn'); // Получаем кнопку переключения режимов

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    // Сохраняем предпочтения темы в localStorage
    localStorage.setItem('darkTheme', isDark);
});

// Применяем сохраненную тему при загрузке страницы
if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
} else {
     themeToggle.textContent = '🌙'; // Убеждаемся, что иконка корректна при светлой теме
}

// --- Логика переключения режимов (код/URL) ---
const codeObfuscatorDiv = document.getElementById('codeObfuscator');
const urlObfuscatorDiv = document.getElementById('urlObfuscator');

// Устанавливаем начальное состояние (обфускатор кода виден, URL скрыт)
codeObfuscatorDiv.style.display = 'block';
urlObfuscatorDiv.style.display = 'none';
urlToggleBtn.textContent = '🔗'; // Иконка для ссылки (указывает, что переключит на URL режим)
urlToggleBtn.title = 'Переключить на URL обфускатор';


urlToggleBtn.addEventListener('click', () => {
     const isCodeViewVisible = codeObfuscatorDiv.style.display !== 'none';

     if (isCodeViewVisible) {
         codeObfuscatorDiv.style.display = 'none'; // Скрываем обфускатор кода
         urlObfuscatorDiv.style.display = 'block'; // Показываем URL обфускатор
         urlToggleBtn.textContent = '📄'; // Иконка для файла кода
         urlToggleBtn.title = 'Переключить на обфускатор кода';
         // Очищаем поля обфускатора кода при переключении на URL
         document.getElementById("status").textContent = '';
         document.getElementById("statusV2").textContent = '';
         document.getElementById("statusV3").textContent = '';
         document.getElementById("codeOutput").textContent = ''; // Исправлен ID
         document.getElementById("input").value = '';
     } else {
         urlObfuscatorDiv.style.display = 'none'; // Скрываем URL обфускатор
         codeObfuscatorDiv.style.display = 'block'; // Показываем обфускатор кода
         urlToggleBtn.textContent = '🔗'; // Иконка для ссылки
         urlToggleBtn.title = 'Переключить на URL обфускатор';
         // Очищаем поля URL обфускатора при переключении на код
         document.getElementById("urlInput").value = ''; // Исправлен ID
         document.getElementById("urlOutputContainer").innerHTML = ''; // Исправлен ID
     }
});


// --- Вспомогательная функция для обфускатора кода ---

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
}

// --- Функции обфускации кода (Адаптированы для байтов UTF-8) ---

function obfuscate(method, inputText) {
    // Используем ввод из секции обфускатора *кода*
    const input = inputText || document.getElementById("input").value.trim();
    // Используем элемент вывода из секции обфускатора *кода* (Исправлен ID)
    const outputElement = document.getElementById("codeOutput");

    if (!input && !inputText) {
        alert("Введи Lua-код сначала!");
        outputElement.textContent = '';
        outputElement.style.borderColor = "#4CAF50";
        return "";
    }

    if (!inputText) { // Если вызывается не из многослойной обфускации
        outputElement.textContent = 'Генерация...';
        outputElement.style.borderColor = "#4CAF50";
         // Очищаем статусы только при активации кнопками обфускатора кода
        document.getElementById("status").textContent = '';
        document.getElementById("statusV2").textContent = '';
        document.getElementById("statusV3").textContent = '';
    }

    let output = "";
    let bytes = new Uint8Array();
    try {
        const encoder = new TextEncoder();
        bytes = encoder.encode(input); // Получаем массив байтов UTF-8

        if (method === "ascii") {
            let e = "";
            for (const byte of bytes) {
                e += "\\" + byte; // Экранируем каждое значение байта (0-255)
            }
            // Lua loadstring интерпретирует экранированные символы и создает строку по байтам
            output = `loadstring("${e}")()`;
        } else if (method === "hex") {
            let h = "";
            for (const byte of bytes) {
                h += "\\x" + byte.toString(16).padStart(2, "0"); // Экранируем каждый байт как hex (00-FF)
            }
             // Lua loadstring интерпретирует hex-экранирование и создает строку по байтам
            output = `loadstring("${h}")()`;
        } else if (method === "unicode") {
             // ПРИМЕЧАНИЕ: Этот метод кодирует кодовые точки строк JS (\u{}).
             // Он НЕ основан напрямую на байтах и может работать ненадежно в некоторых Lua окружениях
             // для символов вне базовой многоязычной плоскости или в зависимости от внутреннего
             // представления строк в Lua. Байтовые методы предпочтительнее для надежности.
             let u = "";
             for (let i = 0; i < input.length; i++) {
                 // charCodeAt может возвращать суррогатные кодовые единицы для символов вне BMP.
                 // Это может привести к неверному unicode-экранированию в Lua.
                 u += "\\u{" + input.charCodeAt(i).toString(16).padStart(4, "0") + "}";
             }
             output = `loadstring("${u}")()`;
        } else if (method === "number") {
            // Передаем значения байтов (0-255) напрямую в string.char в Lua
            output = `loadstring(string.char(${Array.from(bytes).join(",")}))()`;
        } else if (method === "base3") {
            let b = "";
            for (const byte of bytes) {
                 // Дополняем base3 представление каждого байта до 6 цифр (макс 255 = 22110 в base 3)
                b += byte.toString(3).padStart(6, '0');
            }
            // Функция Lua декодирует base3 чанки обратно в значения байтов, помещает в таблицу,
            // и использует string.char(unpack(bytes)) для формирования строки.
            output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 6 do table.insert(bytes, tonumber(data:sub(i, i+5), 3)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "binary") {
            let b = "";
            for (const byte of bytes) {
                b += byte.toString(2).padStart(8, '0'); // Дополняем бинарное представление каждого байта до 8 цифр
            }
             // Функция Lua декодирует бинарные чанки обратно в значения байтов, помещает в таблицу, распаковывает.
            output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 8 do table.insert(bytes, tonumber(data:sub(i, i+7), 2)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "base4") {
             let b = "";
             for (const byte of bytes) {
                  // Дополняем base4 представление каждого байта до 4 цифр (макс 255 = 3333 в base 4)
                 b += byte.toString(4).padStart(4, '0');
             }
             // Функция Lua декодирует base4 чанки обратно в значения байтов, помещает в таблицу, распаковывает.
             output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 4 do table.insert(bytes, tonumber(data:sub(i, i+3), 4)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "base5") {
             let b = "";
             for (const byte of bytes) {
                 // Дополняем base5 представление каждого байта до 4 цифр (макс 255 = 2010 в base 5)
                 b += byte.toString(5).padStart(4, '0');
             }
             // Функция Lua декодирует base5 чанки обратно в значения байтов, помещает в таблицу, распаковывает.
             output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 4 do table.insert(bytes, tonumber(data:sub(i, i+3), 5)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "octal") { // Base 7
              let o = "";
              for (const byte of bytes) {
                   // Дополняем base7 представление каждого байта до 3 цифр (макс 255 = 513 в base 7)
                  o += byte.toString(7).padStart(3, '0');
              }
              // Функция Lua декодирует base7 чанки обратно в значения байтов, помещает в таблицу, распаковывает.
              output = `loadstring((function() local s="" local data="${o}" local bytes = {} for i = 1, #data, 3 do table.insert(bytes, tonumber(data:sub(i, i+2), 7)) end return string.char(unpack(bytes)) end)())()`;
         } else if (method === "octal8") { // Base 8
              let o = "";
              for (const byte of bytes) {
                   // Дополняем base8 представление каждого байта до 3 цифр (макс 255 = 377 в base 8)
                  o += byte.toString(8).padStart(3, '0');
              }
              // Функция Lua декодирует base8 чанки обратно в значения байтов, помещает в таблицу, распаковывает.
              output = `loadstring((function() local s="" local data="${o}" local bytes = {} for i = 1, #data, 3 do table.insert(bytes, tonumber(data:sub(i, i+2), 8)) end return string.char(unpack(bytes)) end)())()`;
          } else if (method === "interleave") {
              let p1 = []; // Байты на четных индексах
              let p2 = []; // Байты на нечетных индексах
              for (let i = 0; i < bytes.length; i++) {
                  if (i % 2 === 0) {
                      p1.push(bytes[i]);
                  } else {
                      p2.push(bytes[i]);
                  }
              }
              // Функция Lua чередует значения байтов из двух таблиц, помещает в новую, распаковывает.
              output = `loadstring((function(a,b)local bytes={}local maxLen=math.max(#a,#b)for i=1,maxLen do if a[i]then table.insert(bytes,a[i])end if b[i]then table.insert(bytes,b[i])end end return string.char(unpack(bytes)) end)({${p1.join(',')}},{${p2.join(',')}}))()`;
          } else if (method === "prime") {
               const pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]; // Простые числа
               let t = []; // Пары значений (байт * простое число, простое число)
               for (let i = 0; i < bytes.length; i++) {
                   const byte = bytes[i];
                   const prime = pr[i % pr.length];
                   t.push(byte * prime);
                   t.push(prime);
               }
               // Функция Lua итерирует по парам, вычисляет значение байта (целочисленное деление), помещает в таблицу, распаковывает.
               output = `loadstring((function(t)local bytes={}for i=1,#t,2 do table.insert(bytes, math.floor(t[i]/t[i+1]))end return string.char(unpack(bytes)) end)({${t.join(',')}}))()`;
           } else if (method === "offset") {
               const of = 5; // Фиксированное смещение
               let t = []; // Смещенные значения байтов
               for (const byte of bytes) {
                   t.push(byte + of);
               }
               // Функция Lua получает смещенные значения байтов, вычитает смещение, помещает в таблицу, распаковывает.
               output = `loadstring((function(codes, offset) local bytes = {}; for i = 1, #codes do table.insert(bytes, codes[i] - offset) end return string.char(unpack(bytes)) end)({${t.join(',')}}, ${of}))()`;
           } else if (method === "multiply") {
               const mu = 2; // Фиксированный множитель
               let t = []; // Умноженные значения байтов
               for (const byte of bytes) {
                   t.push(byte * mu);
               }
               // Функция Lua получает умноженные значения байтов, выполняет целочисленное деление, помещает в таблицу, распаковывает.
               output = `loadstring((function(codes, multiplier) local bytes = {}; for i = 1, #codes do table.insert(bytes, math.floor(codes[i] / multiplier)) end return string.char(unpack(bytes)) end)({${t.join(',')}}, ${mu}))()`;
           } else if (method === "random_offset") {
                const ov = getRandomInt(1000, 10000); // Случайное смещение
                let t = []; // Смещенные значения байтов
                for (const byte of bytes) {
                    t.push(byte + ov);
                }
                // Функция Lua получает смещенные значения байтов, вычитает смещение, помещает в таблицу, распаковывает.
                output = `loadstring((function(codes, offset) local bytes = {}; for i = 1, #codes do table.insert(bytes, codes[i] - offset) end return string.char(unpack(bytes)) end)({${t.join(',')}}, ${ov}))()`;
           } else if (method === "random_multiply") {
                let mv;
                do { mv = getRandomInt(1000, 10000); } while (mv === 0 || mv === 1); // Случайный множитель (не 0 и не 1)
                let t = []; // Умноженные значения байтов
                for (const byte of bytes) {
                    t.push(byte * mv);
                }
                // Функция Lua получает умноженные значения байтов, выполняет целочисленное деление, помещает в таблицу, распаковывает.
                output = `loadstring((function(codes, multiplier) local bytes = {}; for i = 1, #codes do table.insert(bytes, math.floor(codes[i] / multiplier)) end return string.char(unpack(bytes)) end)({${t.join(',')}}, ${mv}))()`;
           }
        else { console.warn("Unknown method:", method); output = `--[[ Неизвестный метод: ${method} ]]`; }

    } catch (error) {
         console.error(`Error during ${method} obfuscation:`, error);
         output = `--[[ Ошибка обфускации (${method}): ${error.message} ]]`;
         if (!inputText) {
            outputElement.textContent = output;
            outputElement.style.borderColor = "#ff9800";
         }
         return "";
    }

     if (!inputText) { // Если вызывается не из многослойной обфускации
        outputElement.textContent = output;
        outputElement.style.borderColor = "#4CAF50";
    }
    return output;
}

// --- Функции многослойной обфускации (Используют адаптированную obfuscate) ---
function startMultiLayerObfuscation() {
    const input = document.getElementById("input").value.trim();
    const outputElement = document.getElementById("codeOutput"); // Исправлен ID
    if (!input) { alert("Введи Lua-код сначала!"); return; }
    outputElement.textContent = 'Запуск многослойной обфускации v1...'; outputElement.style.borderColor = "#4CAF50";
    const btn = document.getElementById("multiObfuscateBtn"); const status = document.getElementById("status");
    document.getElementById("statusV2").textContent = ''; document.getElementById("statusV3").textContent = '';
    btn.disabled = true; btn.classList.add("processing"); btn.textContent = "ОБФУСКАЦИЯ v1..."; status.textContent = "Запуск v1...";
    const steps = [ { method: "random_offset", name: "Смещение (Рандом)" }, { method: "hex", name: "HEX" }, { method: "base3", name: "Base3" } ]; let currentCode = input; let step = 0;
    function processNextStep() {
        if (step >= steps.length) { btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1"; status.textContent = "Обфускация v1 завершена!"; return; }
        const currentMethod = steps[step]; status.textContent = `v1 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`; const obfuscatedStep = obfuscate(currentMethod.method, currentCode);
        if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) {
            status.textContent = `v1 Ошибка на шаге ${step + 1}. Прервано.`; btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1"; outputElement.style.borderColor = "#ff9800"; return;
        }
        currentCode = obfuscatedStep; outputElement.textContent = currentCode; outputElement.style.borderColor = "#4CAF50"; step++; setTimeout(processNextStep, 500);
    } processNextStep();
}
function startMultiLayerObfuscationV2() {
     const input = document.getElementById("input").value.trim();
     const outputElement = document.getElementById("codeOutput"); // Исправлен ID
     if (!input) { alert("Введи Lua-код сначала!"); return; }
     outputElement.textContent = 'Запуск многослойной обфускации v2...'; outputElement.style.borderColor = "#4CAF50";
     const btn = document.getElementById("multiObfuscateBtnV2"); const status = document.getElementById("statusV2");
     document.getElementById("status").textContent = ''; document.getElementById("statusV3").textContent = '';
     btn.disabled = true; btn.classList.add("processing"); btn.textContent = "ОБФУСКАЦИЯ v2..."; status.textContent = "Запуск v2...";
     const steps = [ { method: "prime", name: "Простое число" }, { method: "hex", name: "HEX" }, { method: "random_multiply", name: "Умножение (Рандом)" }, { method: "base4", name: "Base4" } ]; let currentCode = input; let step = 0;
     function processNextStep() {
         if (step >= steps.length) { btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v2"; status.textContent = "Обфускация v2 завершена!"; return; }
         const currentMethod = steps[step]; status.textContent = `v2 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`; const obfuscatedStep = obfuscate(currentMethod.method, currentCode);
         if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) {
            status.textContent = `v2 Ошибка на шаге ${step + 1}. Прервано.`; btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v2"; outputElement.style.borderColor = "#ff9800"; return;
         }
         currentCode = obfuscatedStep; outputElement.textContent = currentCode; outputElement.style.borderColor = "#4CAF50"; step++; setTimeout(processNextStep, 500);
     } processNextStep();
}
function startMultiLayerObfuscationV3() {
     const input = document.getElementById("input").value.trim();
     const outputElement = document.getElementById("codeOutput"); // Исправлен ID
     if (!input) { alert("Введи Lua-код сначала!"); return; }
     outputElement.textContent = 'Запуск многослойной обфускации v3...'; outputElement.style.borderColor = "#4CAF50";
     const btn = document.getElementById("multiObfuscateBtnV3"); const status = document.getElementById("statusV3");
     document.getElementById("status").textContent = ''; document.getElementById("statusV2").textContent = '';
     btn.disabled = true; btn.classList.add("processing"); btn.textContent = "ОБФУСКАЦИЯ v3..."; status.textContent = "Запуск v3...";
     const steps = [ { method: "random_offset", name: "Смещение (Рандом)" }, { method: "hex", name: "HEX" }, { method: "base5", name: "Base5" }, { method: "random_multiply", name: "Умножение (Рандом)" }, { method: "binary", name: "Binary" } ]; let currentCode = input; let step = 0;
     function processNextStep() {
         if (step >= steps.length) { btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v3"; status.textContent = "Обфускация v3 завершена!"; return; }
         const currentMethod = steps[step]; status.textContent = `v3 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`; const obfuscatedStep = obfuscate(currentMethod.method, currentCode);
         if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) {
            status.textContent = `v3 Ошибка на шаге ${step + 1}. Прервано.`; btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v3"; outputElement.style.borderColor = "#ff9800"; return;
         }
         currentCode = obfuscatedStep; outputElement.textContent = currentCode; outputElement.style.borderColor = "#4CAF50"; step++; setTimeout(processNextStep, 500);
     } processNextStep();
}


// --- Функция деобфускации (Адаптирована для байтов UTF-8) ---

function deobfuscate() {
    const input = document.getElementById("input").value.trim();
    const outputElement = document.getElementById("codeOutput"); // Исправлен ID

    document.getElementById("status").textContent = '';
    document.getElementById("statusV2").textContent = '';
    document.getElementById("statusV3").textContent = '';

    if (!input) {
        alert("Введите обфусцированный код сначала!");
        outputElement.textContent = '';
        outputElement.style.borderColor = "#4CAF50";
        return;
    }

    outputElement.textContent = 'Деобфускация...';
    outputElement.style.borderColor = "#2196F3";

    let output = "";
    let deobfuscated = false;
    let byteValues = null; // Используем null изначально, станет массивом байтов (0-255) при успехе

    try {
         // --- Пытаемся извлечь значения байтов на основе шаблонов обфускации ---

         // Шаблон 1: Number (loadstring(string.char(b1, b2, ...))())
         if (!deobfuscated) {
              const m = input.match(/loadstring\s*\(\s*string\.char\(([\d,\s]*)\)\)\(\)/s);
              if(m && m[1] !== undefined){
                  const s=m[1].trim();
                  const codes = (s==='')?[]:s.split(',').map(x=>Number(x.trim())).filter(n => !isNaN(n));
                  let tempByteValues = [];
                  let isValid = true;
                  codes.forEach(cd => {
                      if(cd >= 0 && cd <= 255) { // Проверяем, что значение находится в диапазоне байта
                           tempByteValues.push(cd);
                      } else {
                           console.warn(`Деобфускация string.char: Неверный байт (${cd}).`);
                           isValid = false; // Помечаем как неверное, если вне диапазона байта
                      }
                  });
                  if (isValid) { byteValues = tempByteValues; deobfuscated = true; } // Устанавливаем byteValues только если все байты валидны
              }
         }

         // Шаблон 2: BaseN (loadstring((function() ... local data="..." ... tonumber(data:sub(...), base) ... string.char(unpack(bytes)) end)())())
         const baseMethods = [
             {b:3, len: 6}, // 6 цифр для base 3 (0-255)
             {b:2, len: 8}, // 8 цифр для base 2 (0-255)
             {b:4, len: 4}, // 4 цифры для base 4 (0-255)
             {b:5, len: 4}, // 4 цифры для base 5 (0-255)
             {b:7, len: 3}, // 3 цифры для base 7 (0-255)
             {b:8, len: 3}  // 3 цифры для base 8 (0-255)
         ];
         for (const bm of baseMethods) {
              if (!deobfuscated) {
                   // Регулярка для поиска шаблона BaseN (извлекает строку данных)
                   const basePattern = new RegExp(`loadstring\\s*\\(\\s*\\(function\\(\\).*?local data=["']([0-9]+)["'].*?tonumber\\(data:sub\\(i,\\s*i\\+${bm.len-1}\\),\\s*${bm.b}\\).*?string\\.char\\(unpack\\(bytes\\)\\).*?end\\)\\(\\)\\)`, 's');
                   const baseMatch = input.match(basePattern);

                   if (baseMatch && baseMatch[1] !== undefined) {
                       const baseStr = baseMatch[1]; // Извлеченная строка, закодированная в Base
                       if (baseStr.length % bm.len === 0) { // Проверяем, что длина строки кратна длине чанка
                           let tempByteValues = [];
                           let isValid = true;
                           for (let i = 0; i < baseStr.length; i += bm.len) {
                               const chunk = baseStr.substr(i, bm.len);
                               const byteValue = parseInt(chunk, bm.b); // Декодируем чанк в значение байта
                                if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) { // Проверяем, что значение является валидным байтом
                                    tempByteValues.push(byteValue);
                                } else {
                                     console.warn(`Деобфускация Base${bm.b}: Неверный или внедиапазонный байт (${byteValue}) из чанка "${chunk}".`);
                                     isValid = false;
                                     break; // Останавливаемся, если найден неверный байт
                                }
                           }
                           if (isValid) { byteValues = tempByteValues; deobfuscated = true; } // Устанавливаем byteValues только если все байты валидны
                       }
                   }
              }
         }

         // Шаблон 3: Interleave (loadstring((function(a,b)...string.char(unpack(bytes)) end)({p1},{p2}))())
         if (!deobfuscated) {
              const interleavePattern = /loadstring\s*\(\s*\(function\(a,b\).*?local bytes={}.*?table\.insert\(bytes,a\[i]\).*?table\.insert\(bytes,b\[i]\).*?return string\.char\(unpack\(bytes\)\) end\)\(\s*\{([\d,\s]*)\}\s*,\s*\{([\d,\s]*)\}\s*\)\)\(\)/s;
              const interleaveMatch = input.match(interleavePattern);
              if (interleaveMatch && interleaveMatch[1] !== undefined && interleaveMatch[2] !== undefined) {
                   const s1 = interleaveMatch[1].trim();
                   const s2 = interleaveMatch[2].trim();
                   // Парсим массивы, фильтруя на валидные значения байтов
                   const a1 = (s1 === '') ? [] : s1.split(',').map(x => Number(x.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 255);
                   const a2 = (s2 === '') ? [] : s2.split(',').map(x => Number(x.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 255);

                   let tempByteValues = [];
                   for (let i = 0; i < Math.max(a1.length, a2.length); i++) {
                       if (i < a1.length) tempByteValues.push(a1[i]);
                       if (i < a2.length) tempByteValues.push(a2[i]);
                   }
                   // Проверяем, что все извлеченные значения - валидные байты (фильтр уже был, но на всякий случай)
                   if (tempByteValues.every(byte => byte >= 0 && byte <= 255)) {
                        byteValues = tempByteValues;
                        deobfuscated = true;
                   } else {
                       console.warn("Деобфускация Interleave: Извлечены невалидные байты.");
                   }
              }
         }

         // Шаблон 4: Prime (loadstring((function(t)...math.floor(t[i]/t[i+1])...string.char(unpack(bytes)) end)({pairs}))())
         if (!deobfuscated) {
              const primePattern = /loadstring\s*\(\s*\(function\(t\).*?local bytes={}.*?table\.insert\(bytes,\s*math\.floor\(t\[i\]\/\/\s*t\[i\+1\]\)\).*?return string\.char\(unpack\(bytes\)\) end\)\(\s*\{([\d,\s]*)\}\s*\)\)\(\)/s;
              const primeMatch = input.match(primePattern);
              if (primeMatch && primeMatch[1] !== undefined) {
                   const s = primeMatch[1].trim();
                   if (s === '') { byteValues = []; deobfuscated = true; } else {
                      const n = s.split(',').map(x => Number(x.trim())).filter(v => !isNaN(v));
                      if (n.length % 2 !== 0) throw new Error("Простое число: Нечетное число элементов.");
                      let tempByteValues = [];
                      let isValid = true;
                      for (let i = 0; i < n.length; i += 2) {
                          const v = n[i];
                          const p = n[i + 1];
                          if (!isNaN(v) && !isNaN(p) && p !== 0) {
                              const byteValue = Math.floor(v / p); // Целочисленное деление
                              if (byteValue >= 0 && byteValue <= 255) { // Проверяем, что результат - валидный байт
                                  tempByteValues.push(byteValue);
                              } else {
                                   console.warn(`Деобфускация Простое число: Получен байт вне диапазона 0-255 (${byteValue}).`);
                                   isValid = false;
                                   break; // Останавливаемся, если найден неверный байт
                              }
                          } else {
                               throw new Error(`Деобфускация Простое число: Неверные числа (${v}, ${p}).`);
                          }
                      }
                       if (isValid) { byteValues = tempByteValues; deobfuscated = true; } // Устанавливаем byteValues только если все байты валидны
                   }
              }
         }

         // Шаблон 5: Offset/Multiply/Random Offset/Random Multiply (Функция с codes, value и unpack(bytes))
         // loadstring((function(codes, val) local bytes = {}; for ... bytes.push(codes[i] OP val); return string.char(unpack(bytes)) end)({codes}, val))()
          if (!deobfuscated) {
              // Захватываем символ операции ([-/]) и значение (цифры)
              const mathOpPattern = /loadstring\s*\(\s*\(function\(codes,\s*(\w+)\)\s*local bytes = {};\s*for i = 1, #codes do\s*table\.insert\(bytes,\s*codes\[i\]\s*([+\-*/%])\s*\1\)\s*end\s*return string\.char\(unpack\(bytes\)\)\s*end\)\(\s*\{([\d,\s]*)\}\s*,\s*(\d+)\s*\)\)\(\)/s;
              const mathOpMatch = input.match(mathOpPattern);

              if (mathOpMatch) {
                  const operation = mathOpMatch[2]; // Например, "-", "/"
                  const codesStr = mathOpMatch[3].trim(); // Строка с обфусцированными числовыми кодами
                  const value = parseInt(mathOpMatch[4]); // Значение смещения или множителя

                  const initialCodes = (codesStr === '') ? [] : codesStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

                   let tempByteValues = [];
                   let isValid = true;

                   if (!isNaN(value)) {
                       for (let i = 1; i <= initialCodes.length; ++i) { // Массивы в Lua индексируются с 1
                           let code = initialCodes[i-1]; // Доступ к элементам по 0-индексам JS массива
                           let byteValue = NaN;

                           if (operation === "-") { // Offset или Random Offset (в Lua был байт + смещение, JS отменяет смещение)
                                byteValue = code - value;
                           } else if (operation === "/") { // Multiply или Random Multiply (в Lua был байт * множитель, JS отменяет деление)
                                if (value !== 0) byteValue = Math.floor(code / value); // Используем floor, т.к. в Lua используется //
                                else { isValid = false; throw new Error("Делитель 0 при деобфускации (Умножение/Смещение)."); }
                           } else {
                                // Если регулярка сработала, но операция не - или /, это неожиданно
                                console.warn(`Деобфускация (Мат. операция): Неизвестная операция "${operation}".`);
                                isValid = false;
                                break; // Останавливаемся
                           }

                           // Проверяем полученное значение байта
                            if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) {
                                 tempByteValues.push(byteValue);
                            } else {
                                 console.warn(`Деобфускация (Мат. операция): Получен байт вне диапазона 0-255 (${byteValue}) из кода ${code} и значения ${value}.`);
                                 isValid = false;
                                 break; // Останавливаемся
                            }
                       }
                   } else {
                        console.warn("Деобфускация (Мат. операция): Неверное значение для операции.");
                        isValid = false;
                   }

                   if (isValid) { byteValues = tempByteValues; deobfuscated = true; } // Устанавливаем byteValues только если все байты валидны
              }
          }


         // Шаблон 6: ASCII (loadstring("\d\d\d...\d\d\d")()) - Ручной парсинг для байтов
         if (!deobfuscated) {
              const m = input.match(/loadstring\s*\(\s*["']((?:\\\d{1,3})+)"'\s*\)\(\)/s); // Захватываем экранированную строку
              if (m && m[1]) {
                 const escapedString = m[1]; // Извлеченная экранированная строка
                 let tempByteValues = [];
                 let i = 0;
                 let isValid = true;
                 while (i < escapedString.length) {
                     if (escapedString[i] === '\\' && i + 1 < escapedString.length) {
                         const digitMatch = escapedString.substring(i + 1).match(/^\d{1,3}/); // Ищем 1-3 цифры после '\'
                         if (digitMatch) {
                             const byteValue = parseInt(digitMatch[0], 10); // Парсим как десятичное значение байта
                             if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) { // Проверяем, что значение - валидный байт
                                 tempByteValues.push(byteValue);
                                 i += 1 + digitMatch[0].length; // Перемещаемся за '\' и цифры
                                 continue; // Продолжаем цикл
                             }
                         }
                     }
                     // Если мы сюда дошли, это не валидное \ddd экранирование или не обратный слеш
                     console.warn(`Деобфускация ASCII: Неожиданный символ или последовательность в экранированной строке: "${escapedString.substring(i, i+5)}..."`);
                     isValid = false; break; // Помечаем как неверное и останавливаемся
                 }

                 if (isValid) { byteValues = tempByteValues; deobfuscated = true; } // Устанавливаем byteValues только если все байты валидны
              }
         }

         // Шаблон 7: HEX (loadstring("\xHH...\xHH")()) - Ручной парсинг для байтов
         if (!deobfuscated) {
              const m = input.match(/loadstring\s*\(\s*["']((?:\\x[0-9a-fA-F]{2})+)["']\s*\)\(\)/s); // Захватываем экранированную строку
              if (m && m[1]) {
                  const escapedString = m[1]; // Извлеченная экранированная строка
                  let tempByteValues = [];
                  let i = 0;
                  let isValid = true;
                  while (i < escapedString.length) {
                      // Проверяем на \x за которым следуют две шестнадцатеричные цифры
                      if (escapedString[i] === '\\' && escapedString[i+1] === 'x' && i + 3 < escapedString.length) {
                           const hex = escapedString.substring(i + 2, i + 4);
                           if (/^[0-9a-fA-F]{2}$/.test(hex)) { // Проверяем, что это две шестнадцатеричные цифры
                                const byteValue = parseInt(hex, 16); // Парсим как шестнадцатеричное значение байта
                                if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) { // Проверяем, что значение - валидный байт
                                     tempByteValues.push(byteValue);
                                     i += 4; // Перемещаемся за \xHH
                                     continue;
                                }
                           }
                      }
                      // Если мы сюда дошли, это не валидное \xHH экранирование или не обратный слеш
                      console.warn(`Деобфускация HEX: Неожиданный символ или последовательность в экранированной строке: "${escapedString.substring(i, i+5)}..."`);
                      isValid = false; break; // Помечаем как неверное и останавливаемся
                  }

                  if (isValid) { byteValues = tempByteValues; deobfuscated = true; } // Устанавливаем byteValues только если все байты валидны
              }
         }

         // Шаблон 8: Unicode (loadstring("\u{...}...\u{...}")()) - Сохраняем существующую логику
         // ПРИМЕЧАНИЕ: Этот метод НЕ формирует массив byteValues. Он использует парсинг строк JS,
         // который может не идеально соответствовать побайтовому построению строк в Lua для
         // не-ASCII символов, закодированных таким образом. Использование байтовых методов более надежно.
         if (!deobfuscated && input.includes("\\u{")) {
             let m = input.match(/loadstring\s*\(\s*["']((?:\\u\{[0-9a-fA-F]+\})+)"'\s*\)/);
              if (!m) { // Также проверяем одинарные кавычки
                 m = input.match(/loadstring\s*\(\s*[']((?:\\u\{[0-9a-fA-F]+\})+)'\s*\)/);
             }
             if(m && m[1]){
                 try {
                     // Используем JS replace с String.fromCharCode для интерпретации \u{} экранирований
                     // Это возвращает строку JS, которая может содержать многобайтовые UTF-16 последовательности,
                     // представляющие исходные символы. Это обходит шаг byteValues -> TextDecoder.
                     output = m[1].replace(/\\u\{([0-9a-fA-F]+)\}/g,(x,c)=>{
                         const charCode = parseInt(c,16); // Получаем кодовую точку
                         if (!isNaN(charCode)) return String.fromCharCode(charCode); // Преобразуем кодовую точку в часть строки JS
                         // Если парсинг не удался, считаем ввод для этого метода неверным
                         throw new Error(`Деобфускация Unicode: Неверный код (${c}).`);
                     });
                     deobfuscated = true; // Помечаем как деобфусцированное, если replace сработал без ошибки
                 } catch (e) {
                     console.error("Деобфускация Unicode (String.fromCharCode):", e);
                      // 'deobfuscated' остается false, позволяя перейти к запасным вариантам.
                 }
             }
         }


         // Запасной вариант: Попытка извлечь простую строковую константу (менее надежно для экранированных не-ASCII)
         // Если ни один другой шаблон не подошел, пробуем найти базовый loadstring("...")()
         // Это захватывает буквальное содержимое внутри кавычек. JS обработает свое стандартное экранирование (\\, \n, \", и т.д.),
         // но может неверно интерпретировать побайтовое экранирование Lua, такое как \208\180, как один символ.
         // Это последний вариант.
         if (!deobfuscated) {
              const m = input.match(/loadstring\(\s*["'](.*?)["']\s*\)\(\)/s); // Захватываем содержимое внутри кавычек
              if (m && m[1] !== undefined) {
                   // Захваченное содержимое строки будет иметь стандартное JS экранирование строк
                   // обработанным, например, \\ становится \, \n становится символом новой строки, \" становится ".
                   // \xHH и \u{...} также могут быть обработаны JS в зависимости от строгости/контекста,
                   // но полагаться на это ненадежно. Специфические парсеры шаблонов выше лучше.
                   output = m[1]; // Берем сырое содержимое строки из группы соответствия
                   console.warn("Fallback: извлечена строка из loadstring. Деобфускация может быть неполной или неточной для сложных экранирований.");
                   deobfuscated = true; // Помечаем как деобфусцированное, даже если потенциально неполно
              }
         }


         // --- Декодируем байты с помощью TextDecoder, если были собраны byteValues ---
         // Этот шаг пропускается, если метод Unicode или запасной вариант сработали успешно,
         // т.к. они напрямую установили строку 'output'.
         if (deobfuscated && byteValues !== null) { // Проверяем, был ли byteValues успешно заполнен байтовым методом
             if (byteValues.length > 0) {
                 try {
                     const decoder = new TextDecoder('utf-8'); // Декодируем массив байтов как UTF-8
                     output = decoder.decode(new Uint8Array(byteValues));
                 } catch (decodeError) {
                     console.error("Деобфускация (TextDecoder):", decodeError);
                     output = `Ошибка деобфускации (декодирование UTF-8): ${decodeError.message}`;
                     outputElement.style.borderColor = "#ff9800";
                     deobfuscated = false; // Помечаем как неудачное, если декодирование не удалось
                 }
             } else { // byteValues - пустой массив (например, из пустого ввода, который дал пустые байты)
                 output = ""; // Успешно деобфусцировано в пустую строку
             }
         }


         // --- Финальная обработка статуса/ошибок ---
         if (!deobfuscated) {
              // Если output был установлен неуспешным шагом (например, ошибка Unicode), сохраняем его. Иначе используем значение по умолчанию.
              output = output || "Не удалось распознать тип обфускации.";
              outputElement.textContent = output; // Убеждаемся, что сообщение об ошибке отображается
              outputElement.style.borderColor = "#ff9800";
         } else if (output === "" && input !== "") {
             // Успешно деобфусцировано, но результат пустой, хотя ввод не был пустым.
             // Это может быть верно для некоторых вводов (например, только комментарии), но также может указывать на проблему.
             output = "Код деобфусцирован, но результат пуст (возможно, был пустой код после обфускации).";
              outputElement.textContent = output; // Отображаем предупреждение
              outputElement.style.borderColor = "#ff9800"; // Цвет предупреждения
         } else if (output !== "") { // Проверяем, что output не пустой после успешной деобфускации
             // Успешно деобфусцировано и получен непустой результат.
              // Убеждаемся, что он не начинается с сообщений об ошибках от предыдущих шагов если они частично провалились.
              if (!output.startsWith('Ошибка') && !output.startsWith('Не удалось')) {
                  outputElement.textContent = output; // Отображаем успешный результат
                  outputElement.style.borderColor = "#4CAF50"; // Цвет успеха
              } else {
                   // Этот случай должен быть пойман !deobfuscated, но на всякий случай.
                   outputElement.textContent = output;
                   outputElement.style.borderColor = "#ff9800";
              }
         }
         // Если output пустой и input был пустым, он также успешно попадает сюда
         // и output остается "" что корректно.


    } catch (e) {
         console.error("Deobfuscation error:", e);
         output = `Ошибка деобфускации: ${e.message}`;
         outputElement.textContent = output; // Убеждаемся, что сообщение об ошибке отображается
         outputElement.style.borderColor = "#ff9800";
    }
}


// --- Функция копирования в буфер обмена (Обфускатор кода) ---
 function copyCodeToClipboard() {
    const output = document.getElementById("codeOutput"); // Исправлен ID
    const text = output.textContent;

     const excludedTexts = ['Генерация...', 'Деобфускация...', 'Введите обфусцированный код сначала!', 'Не удалось распознать тип обфускации.', 'Ошибка обфускации', 'Ошибка деобфускации', 'Деобфускация завершена, но результат пуст', 'Запуск многослойной обфускации', 'Обфускация v1 завершена!', 'v1 Шаг', 'v1 Ошибка', 'Обфускация v2 завершена!', 'v2 Шаг', 'v2 Ошибка', 'Обфускация v3 завершена!', 'v3 Шаг', 'v3 Ошибка'];
     if (!text || excludedTexts.some(prefix => text.startsWith(prefix))) {
         alert("Нет кода для копирования.");
         return;
     }

    // Используем современный API Clipboard, если доступен
    navigator.clipboard.writeText(text).then(() => {
         const btn = document.querySelector("#codeObfuscator .copy-btn"); // Выбираем конкретную кнопку в секции кода
         const originalText = btn.textContent;
         btn.textContent = "СКОПИРОВАНО!";
         btn.classList.add("copied"); // Добавляем класс для анимации/стиля
         setTimeout(() => {
             btn.textContent = originalText;
             btn.classList.remove("copied"); // Удаляем класс
         }, 1500);
    }).catch(err => {
         console.error("Copy error: ", err);
         // Запасной метод с execCommand
         try {
              const ta = document.createElement("textarea");
              ta.value = text;
              ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.left = "-9999px"; ta.style.top = "-9999px";
              document.body.appendChild(ta);
              ta.select();
              const ok = document.execCommand("copy");
              document.body.removeChild(ta);
              const btn = document.querySelector("#codeObfuscator .copy-btn"); // Выбираем конкретную кнопку в секции кода
              const originalText = btn.textContent;
              if (ok) {
                  btn.textContent = "Скопировано!";
                  btn.classList.add("copied");
              } else {
                   btn.textContent = "Ошибка копирования (fallback)";
              }
              setTimeout(() => {
                  btn.textContent = originalText;
                  btn.classList.remove("copied");
              }, 2000);
         } catch (e) {
              console.error("Fallback copy failed: ", e);
              alert("Не удалось скопировать текст.");
         }
    });
 }

// --- Автовыбор текста при клике (Обфускатор кода) ---
document.getElementById("codeOutput").addEventListener("click", function(event) { // Исправлен ID
    // Список текстов, при которых выбор не происходит
    const excludedTexts = ['Генерация...', 'Деобфускация...', 'Введите обфусцированный код сначала!', 'Не удалось распознать тип обфускации.', 'Ошибка обфускации', 'Ошибка деобфускации', 'Деобфускация завершена, но результат пуст', 'Запуск многослойной обфускации', 'Обфускация v1 завершена!', 'v1 Шаг', 'v1 Ошибка', 'Обфускация v2 завершена!', 'v2 Шаг', 'v2 Ошибка', 'Обфускация v3 завершена!', 'v3 Шаг', 'v3 Ошибка'];
    // Проверяем, является ли текущий текст одним из исключенных
    if (!this.textContent || excludedTexts.some(prefix => this.textContent.startsWith(prefix))) {
         return; // Если да, выходим
     }
    // Если нет, выбираем весь текст
    try {
         const range = document.createRange();
         range.selectNodeContents(this); // Выбрать содержимое элемента
         const selection = window.getSelection(); // Получить текущий объект Selection
         selection.removeAllRanges(); // Удалить все существующие диапазоны выбора
         selection.addRange(range); // Добавить новый диапазон выбора
    } catch (e) {
         console.warn("Could not select text.", e); // Выводим предупреждение, если не удалось выбрать
    }
});


// --- Функция URL обфускатора (Восстановлена к Вашей оригинальной логике) ---

function encodeUrl() {
    // Используем правильные элементы ввода и вывода из текущей структуры HTML
    const url = document.getElementById('urlInput').value.trim(); // Ввод - #urlInput (исправлен ID)
    const urlOutputContainer = document.getElementById('urlOutputContainer'); // Контейнер вывода - #urlOutputContainer (исправлен ID)

    if (!url) {
        alert("Please enter a URL first");
        urlOutputContainer.innerHTML = ''; // Очищаем предыдущие результаты
        return;
    }

    // Безопасные символы, которые не будут кодироваться - ТОЧНО как в Вашем оригинальном скрипте
    const safeChars = new Set(['/', '=', '+', '-', '_', '~', ':']);

    let result = "";
    let i = 0;

    // Сохраняем http:// или https:// в самом начале
    if (url.startsWith("https://")) {
        result = "https://";
        i = 8; // Начинаем кодирование после "https://"
    } else if (url.startsWith("http://")) {
        result = "http://";
        i = 7; // Начинаем кодирование после "http://"
    }
    // Если URL не начинается с http:// или https://, i остается 0, и вся строка обрабатывается с самого начала.

    // Кодируем остаток строки URL, символ за символом, используя charCodeAt(0)
    // Это повторяет точный цикл и логику из Вашего оригинального фрагмента скрипта.
    for (; i < url.length; i++) {
        const char = url[i];
        // Проверяем, находится ли символ в списке безопасных
        if (safeChars.has(char)) {
            result += char; // Добавляем безопасный символ напрямую
        } else {
            // Кодируем кодовую единицу символа (возвращаемую charCodeAt(0)) как %HH
            // Это может кодировать не-ASCII символы на основе их первой UTF-16 кодовой единицы
            // если они находятся вне диапазона ASCII, что соответствует оригинальному поведению.
             result += "%" + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
        }
    }

    // Генерируем финальный код loadstring
    const loadstringCode = `loadstring(game:HttpGet("${result}"))()`;

    // Отображаем результаты, используя правильный контейнер и ID элементов
    urlOutputContainer.innerHTML = `
        <div class="result-box">
            <span class="result-label">OBFUSCATED URL:</span>
            <div class="url-display">${result}</div>
        </div>

        <div class="result-box">
            <span class="result-label">READY-TO-USE LUA CODE:</span>
            <textarea id="urlLuaCode" readonly>${loadstringCode}</textarea> <button class="copy-btn" onclick="copyUrlToClipboard()">COPY TO CLIPBOARD</button> </div>
    `;
    // Сохраняем предупреждение как есть.
}

// --- Функция копирования в буфер обмена (URL обфускатор) - Адаптирована к текущим именам функций/ID ---
function copyUrlToClipboard() {
    // Используем правильный ID textarea из текущей структуры HTML
    const textarea = document.getElementById('urlLuaCode'); // ID элемента urlLuaCode (исправлен)

    if (!textarea) {
         alert("No code to copy.");
         return;
    }

    textarea.select();

    // Используем современный API Clipboard, если доступен
    navigator.clipboard.writeText(textarea.value).then(() => {
         const btn = document.querySelector('#urlObfuscator .copy-btn'); // Селектор, специфичный для секции URL
         const originalText = btn.textContent;
         const originalBg = btn.style.backgroundColor; // Сохраняем оригинальный цвет
         btn.textContent = "COPIED!";
         btn.style.backgroundColor = "#4CAF50"; // Зеленый цвет обратной связи
         if (document.body.classList.contains('dark-theme')) {
             btn.style.backgroundColor = "#2e7d32"; // Зеленый цвет для темной темы
         }
         setTimeout(() => {
             btn.textContent = originalText;
             btn.style.backgroundColor = originalBg; // Сбрасываем цвет на оригинальный
         }, 2000);
    }).catch(err => {
         console.error("Copy error (URL): ", err);
         // Запасной метод с execCommand
         try {
              const ta = document.createElement("textarea");
              ta.value = textarea.value;
               ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.left = "-9999px"; ta.style.top = "-9999px";
               document.body.appendChild(ta);
               ta.select();
               const ok = document.execCommand("copy");
               document.body.removeChild(ta);
               const btn = document.querySelector('#urlObfuscator .copy-btn');
               const originalText = btn.textContent;
               const originalBg = btn.style.backgroundColor;
               if (ok) {
                   btn.textContent = "Copied!";
                   btn.style.backgroundColor = "#4CAF50";
                    if (document.body.classList.contains('dark-theme')) {
                        btn.style.backgroundColor = "#2e7d32";
                    }
               } else {
                    btn.textContent = "Copy Error (fallback)";
               }
               setTimeout(() => {
                   btn.textContent = originalText;
                    btn.style.backgroundColor = originalBg;
               }, 2500);
         } catch (e) {
              console.error("Fallback copy failed (URL): ", e);
              alert("Failed to copy URL code.");
         }
    });
}

 // Обработчик нажатия Enter в поле ввода URL
 document.getElementById('urlInput').addEventListener('keypress', function(event) { // Исправлен ID
     if (event.key === 'Enter') {
         event.preventDefault(); // Отменяем стандартное поведение отправки формы
         encodeUrl(); // Вызываем функцию кодирования
     }
 });
