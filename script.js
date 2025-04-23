// Theme toggle logic (unchanged)
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkTheme', isDark);
});
if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
}

// Random integer generation (unchanged logic, range handled in obfuscate)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
     // Ensure result is within range, including min and max
    let result = Math.floor(Math.random() * (max - min + 1)) + min;
    // Added check to ensure multiplier is not 1 if min is 1 (for safety, though range 1000-10000 doesn't need it)
    // For multiply, we need result > 1. For offset, 0 is fine but min=1000 prevents it.
    // The range 1000-10000 naturally avoids 0 and 1.
    return result;
}

// --- OBFUSCATION FUNCTION ---
function obfuscate(method, inputText) {
    const input = inputText || document.getElementById("input").value.trim();
    const outputElement = document.getElementById("output"); // Get output element

    // При пустом вводе просто алерт и очистка вывода
    if (!input && !inputText) {
        alert("Введи Lua-код сначала!");
        outputElement.textContent = ''; // Очищаем вывод
        outputElement.style.borderColor = "#4CAF50"; // Сброс цвета рамки
        return "";
    }

    if (!inputText) { // Clear output and statuses only if called by user button
        outputElement.textContent = 'Генерация...'; // Статус генерации
        outputElement.style.borderColor = "#4CAF50"; // Цвет рамки при обработке
        document.getElementById("status").textContent = '';
        document.getElementById("statusV2").textContent = '';
        document.getElementById("statusV3").textContent = '';
    } else {
        // Если вызывается из многослойной обфускации, очищать статус только при первом шаге v1
        // Многослойные функции сами управляют своим статусом
    }

    let output = "";
    try {
        if (method === "ascii") { let e = ""; for (let i = 0; i < input.length; i++) e += "\\" + input.charCodeAt(i); output = `loadstring("${e}")()`; }
        else if (method === "hex") { let h = ""; for (let i = 0; i < input.length; i++) h += "\\x" + input.charCodeAt(i).toString(16).padStart(2, "0"); output = `loadstring("${h}")()`; }
        else if (method === "unicode") { let u = ""; for (let i = 0; i < input.length; i++) u += "\\u{" + input.charCodeAt(i).toString(16).padStart(4, "0") + "}"; output = `loadstring("${u}")()`; }
        else if (method === "number") { let n = []; for (let i = 0; i < input.length; i++) n.push(input.charCodeAt(i)); output = `loadstring(string.char(${n.join(",")}))()`; }
        else if (method === "base3") { let b = []; for (let i = 0; i < input.length; i++) b.push(input.charCodeAt(i).toString(3).padStart(6, '0')); output = `loadstring((function() local s="" for t in ("${b.join('')}"):gmatch("%d%d%d%d%d%d") do s=s..string.char(tonumber(t,3)) end return s end)())()`; }
        else if (method === "binary") { let b = ""; for (let i = 0; i < input.length; i++) b += input.charCodeAt(i).toString(2).padStart(8, '0'); output = `loadstring((function() local s="" for c in ("${b}"):gmatch("%d%d%d%d%d%d%d%d") do s=s..string.char(tonumber(c,2)) end return s end)())()`; }
        else if (method === "base4") { let b = []; for (let i = 0; i < input.length; i++) b.push(input.charCodeAt(i).toString(4).padStart(4, '0')); output = `loadstring((function() local s="" for t in ("${b.join('')}"):gmatch("%d%d%d%d") do s=s..string.char(tonumber(t,4)) end return s end)())()`; }
        else if (method === "base5") { let b = []; for (let i = 0; i < input.length; i++) b.push(input.charCodeAt(i).toString(5).padStart(4, '0')); output = `loadstring((function() local s="" for t in ("${b.join('')}"):gmatch("%d%d%d%d") do s=s..string.char(tonumber(t,5)) end return s end)())()`; }
        // Семеричная (Base 7) обфускация - Возвращена
        else if (method === "octal") {
             let o = [];
             for (let i = 0; i < input.length; i++) {
                 // Преобразуем код символа в строку Base 7, дополняем нулями до 3 цифр (т.к. 255 в Base 7 = 513)
                 o.push(input.charCodeAt(i).toString(7).padStart(3, '0'));
             }
             // Lua-код для декодирования: разбивает строку на чанки по 3 цифры и преобразует в Base 7
             output = `loadstring((function() local s="" for t in ("${o.join('')}"):gmatch("%d%d%d") do s=s..string.char(tonumber(t,7)) end return s end)())()`;
        }
         // Восьмеричная (Base 8) обфускация - НОВАЯ
         else if (method === "octal8") {
             let o = [];
             for (let i = 0; i < input.length; i++) {
                 // Преобразуем код символа в строку Base 8, дополняем нулями до 3 цифр (т.к. 255 в Base 8 = 377)
                 o.push(input.charCodeAt(i).toString(8).padStart(3, '0'));
             }
             // Lua-код для декодирования: разбивает строку на чанки по 3 цифры и преобразует в Base 8
             output = `loadstring((function() local s="" for t in ("${o.join('')}"):gmatch("%d%d%d") do s=s..string.char(tonumber(t,8)) end return s end)())()`;
         }
        else if (method === "interleave") { let p=[[],[]]; for(let i=0;i<input.length;i++)p[i%2].push(input.charCodeAt(i)); output = `loadstring((function(a,b)local s=''for i=1,math.max(#a,#b)do if a[i]then s=s..string.char(a[i])end if b[i]then s=s..string.char(b[i])end end return s end)({${p[0].join(',')}},{${p[1].join(',')}}))()`; }
        else if (method === "prime") { const pr=[2,3,5,7,11,13,17,19,23,29]; let t=[]; for(let i=0;i<input.length;i++){const p=pr[i%pr.length];t.push(input.charCodeAt(i)*p);t.push(p);} output = `loadstring((function(t)local s=''for i=1,#t,2 do s=s..string.char(t[i]//t[i+1])end return s end)({${t.join(',')}}))()`; }
        else if (method === "offset") { const of=5; let t=[]; for(let i=0;i<input.length;i++)t.push(input.charCodeAt(i)+of); output = `loadstring(string.char(${t.join(',')}):gsub('.',function(c)return string.char(c:byte()-${of})end))()`; }
        else if (method === "multiply") { const mu=2; let t=[]; for(let i=0;i<input.length;i++)t.push(input.charCodeAt(i)*mu); output = `loadstring(string.char(${t.join(',')}):gsub('.',function(c)return string.char(c:byte()//${mu})end))()`; }

        // --- Random Obfuscation with Large Range (Logic unchanged) ---
        else if (method === "random_offset") {
             const ov = getRandomInt(1000, 10000);
             let t = [];
             for (let i = 0; i < input.length; i++) {
                 let offsettedCode = input.charCodeAt(i) + ov;
                 t.push(offsettedCode);
             }
             output = `loadstring((function(codes, offset) local s = ''; for i = 1, #codes do s = s .. string.char(codes[i] - offset) end return s end)({${t.join(',')}}, ${ov}))()`;
        }
        else if (method === "random_multiply") {
             let mv;
             do { mv = getRandomInt(1000, 10000); } while (mv === 0 || mv === 1);
             let t = [];
             for (let i = 0; i < input.length; i++) {
                  let multipliedCode = input.charCodeAt(i) * mv;
                 t.push(multipliedCode);
             }
             output = `loadstring((function(codes, multiplier) local s = ''; for i = 1, #codes do s = s .. string.char(math.floor(codes[i] / multiplier)) end return s end)({${t.join(',')}}, ${mv}))()`;
        }
        // --- End Random Obfuscation ---

        else { console.warn("Unknown method:", method); output = `--[[ Неизвестный метод: ${method} ]]`; }
    } catch (error) {
         console.error(`Error during ${method} obfuscation:`, error);
         output = `--[[ Ошибка обфускации (${method}): ${error.message} ]]`;
         // В случае ошибки обфускации, показываем сообщение в output
         if (!inputText) { // Если это не шаг многослойной обфускации
            outputElement.textContent = output;
            outputElement.style.borderColor = "#ff9800"; // Цвет рамки при ошибке
         }
         return ""; // Возвращаем пустую строку при ошибке для многослойной обфускации
    }

    // Только обновляем output, если это не шаг многослойной обфускации
     if (!inputText) {
        outputElement.textContent = output;
        outputElement.style.borderColor = "#4CAF50"; // Цвет рамки при успехе
    }
    return output; // Возвращаем сгенерированный код для многослойной обфускации
}

// --- Multi-Layer Functions (Logic unchanged, relies on updated obfuscate) ---
// Многослойные функции сами управляют статусами
function startMultiLayerObfuscation() {
    const input = document.getElementById("input").value.trim();
    const outputElement = document.getElementById("output");
    if (!input) { alert("Введи Lua-код сначала!"); return; }

    outputElement.textContent = 'Запуск многослойной обфускации v1...';
    outputElement.style.borderColor = "#4CAF50";

    const btn = document.getElementById("multiObfuscateBtn");
    const status = document.getElementById("status");
    document.getElementById("statusV2").textContent = ''; document.getElementById("statusV3").textContent = ''; // Очищаем статусы других версий

    btn.disabled = true; btn.classList.add("processing"); btn.textContent = "ОБФУСКАЦИЯ v1..."; status.textContent = "Запуск v1...";
    let currentCode = input; const steps = [ { method: "random_offset", name: "Смещение (Рандом)" }, { method: "unicode", name: "Unicode" }, { method: "base3", name: "Base3" } ]; let step = 0;
    function processNextStep() {
        if (step >= steps.length) { btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1"; status.textContent = "Обфускация v1 завершена!"; return; }
        const currentMethod = steps[step]; status.textContent = `v1 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`; const obfuscatedStep = obfuscate(currentMethod.method, currentCode);
        if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) { // Проверяем на пустую строку или комментарий ошибки
            status.textContent = `v1 Ошибка на шаге ${step + 1}. Прервано.`;
            btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1";
            // Сообщение об ошибке уже должно быть в outputElement из функции obfuscate
            outputElement.style.borderColor = "#ff9800";
            return;
        }
        currentCode = obfuscatedStep; outputElement.textContent = currentCode; outputElement.style.borderColor = "#4CAF50"; step++; setTimeout(processNextStep, 500);
    } processNextStep();
}
function startMultiLayerObfuscationV2() {
     const input = document.getElementById("input").value.trim();
     const outputElement = document.getElementById("output");
     if (!input) { alert("Введи Lua-код сначала!"); return; }

     outputElement.textContent = 'Запуск многослойной обфускации v2...';
     outputElement.style.borderColor = "#4CAF50";

     const btn = document.getElementById("multiObfuscateBtnV2"); const status = document.getElementById("statusV2");
     document.getElementById("status").textContent = ''; document.getElementById("statusV3").textContent = ''; // Очищаем статусы других версий

     btn.disabled = true; btn.classList.add("processing"); btn.textContent = "ОБФУСКАЦИЯ v2..."; status.textContent = "Запуск v2...";
     let currentCode = input; const steps = [ { method: "prime", name: "Простое число" }, { method: "hex", name: "HEX" }, { method: "random_multiply", name: "Умножение (Рандом)" }, { method: "base4", name: "Base4" } ]; let step = 0;
     function processNextStep() {
         if (step >= steps.length) { btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v2"; status.textContent = "Обфускация v2 завершена!"; return; }
         const currentMethod = steps[step]; status.textContent = `v2 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`; const obfuscatedStep = obfuscate(currentMethod.method, currentCode);
         if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) {
            status.textContent = `v2 Ошибка на шаге ${step + 1}. Прервано.`;
            btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v2";
            outputElement.style.borderColor = "#ff9800";
            return;
         }
         currentCode = obfuscatedStep; outputElement.textContent = currentCode; outputElement.style.borderColor = "#4CAF50"; step++; setTimeout(processNextStep, 500);
     } processNextStep();
}
function startMultiLayerObfuscationV3() {
     const input = document.getElementById("input").value.trim();
     const outputElement = document.getElementById("output");
     if (!input) { alert("Введи Lua-код сначала!"); return; }

     outputElement.textContent = 'Запуск многослойной обфускации v3...';
     outputElement.style.borderColor = "#4CAF50";

     const btn = document.getElementById("multiObfuscateBtnV3"); const status = document.getElementById("statusV3");
     document.getElementById("status").textContent = ''; document.getElementById("statusV2").textContent = ''; // Очищаем статусы других версий

     btn.disabled = true; btn.classList.add("processing"); btn.textContent = "ОБФУСКАЦИЯ v3..."; status.textContent = "Запуск v3...";
     let currentCode = input; const steps = [ { method: "random_offset", name: "Смещение (Рандом)" }, { method: "hex", name: "HEX" }, { method: "base5", name: "Base5" }, { method: "random_multiply", name: "Умножение (Рандом)" }, { method: "binary", name: "Binary" } ]; let step = 0;
     function processNextStep() {
         if (step >= steps.length) { btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v3"; status.textContent = "Обфускация v3 завершена!"; return; }
         const currentMethod = steps[step]; status.textContent = `v3 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`; const obfuscatedStep = obfuscate(currentMethod.method, currentCode);
         if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) {
            status.textContent = `v3 Ошибка на шаге ${step + 1}. Прервано.`;
            btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v3";
            outputElement.style.borderColor = "#ff9800";
            return;
         }
         currentCode = obfuscatedStep; outputElement.textContent = currentCode; outputElement.style.borderColor = "#4CAF50"; step++; setTimeout(processNextStep, 500);
     } processNextStep();
}


// --- DEOBFUSCATION FUNCTION (Улучшено распознавание) ---
function deobfuscate() {
    const input = document.getElementById("input").value.trim();
    const outputElement = document.getElementById("output");

    // Clear statuses
    document.getElementById("status").textContent = '';
    document.getElementById("statusV2").textContent = '';
    document.getElementById("statusV3").textContent = '';

    if (!input) {
        alert("Введите обфусцированный код сначала!");
        outputElement.textContent = ''; // Очищаем вывод при пустом вводе
        outputElement.style.borderColor = "#4CAF50"; // Сброс цвета рамки
        return;
    }

    outputElement.textContent = 'Деобфускация...'; // Статус деобфускации
    outputElement.style.borderColor = "#2196F3"; // Цвет рамки при обработке

    let output = "";
    let deobfuscated = false;

    try {
         // --- Pattern matching order (complex to simple) ---

         // 1. Check for complex function structures (random_offset/multiply, interleave, prime)
         // New random offset/multiply structure
         const newRandomMatch = input.match(/loadstring\s*\(\s*\(function\(codes,\s*(offset|multiplier)\)\s*local s = ''; for i = 1, #codes do s = s \.\. string\.char\((?:codes\[i\]\s*-\s*\1|\s*math\.floor\(codes\[i\]\s*\/\s*\2\))\) end return s end\)\(\{([\d,\s]*)\},\s*(\d+)\)\)\(\)/s);
         if (!deobfuscated && newRandomMatch) {
              const type = newRandomMatch[1]; // 'offset' or 'multiplier'
              const codesStr = newRandomMatch[3].trim(); // Captured codes array string
              const value = parseInt(newRandomMatch[4]); // Captured offset/multiplier value
              // Преобразуем и фильтруем нечисловые значения сразу
              const codes = (codesStr === '') ? [] : codesStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

              if (!isNaN(value) && (type === 'offset' ? value > 0 : value !== 0)) { // Value should be > 0 for offset, non-zero for multiplier
                   codes.forEach(code => {
                        if (!isNaN(code)) { // Double check code is number
                            let originalCode;
                            if (type === 'offset') {
                                originalCode = code - value; // Subtract offset
                            } else { // type === 'multiplier'
                                 if (value === 0) throw new Error("Делитель 0 при деобфускации.");
                                originalCode = Math.floor(code / value); // Integer divide by multiplier
                            }
                             // Basic validation: check if result is within typical byte range
                             if (originalCode >= 0 && originalCode <= 255) {
                                  output += String.fromCharCode(originalCode);
                             } else {
                                  console.warn(`Деобфускация ${type}: Получен код вне диапазона 0-255 (${originalCode}).`);
                                  throw new Error(`Деобфускация ${type}: Получен код вне диапазона 0-255 (${originalCode}).`);
                             }
                        } else {
                             throw new Error(`Деобфускация ${type}: Неверный код в массиве (${code}).`);
                        }
                   });
                   deobfuscated = true; // Mark as deobfuscated if successful
              } else {
                   // Value was not valid, let other patterns try (though unlikely to match)
                    // No need to throw/return here, just don't mark deobfuscated.
              }
         }

         // Interleave
         if (!deobfuscated && input.includes("math.max(#a,#b)") && input.includes("loadstring") && input.includes("string.char(a[i])")) {
             const m=input.match(/loadstring\s*\(\s*\(function\(a,b\)\s*local s=''for i=1,math\.max\(#a,#b\)do if a\[i\]then s=s\.\.string\.char\(a\[i\]\)end if b\[i\]then s=s\.\.string\.char\(b\[i]\)end end return s end\)\(\{([\d,\s]*)\}\s*,\s*\{([\d,\s]*)\}\)\)\(\)/s);
             if(m&&(m[1]!==undefined)&&(m[2]!==undefined)){
                const s1=m[1].trim();
                const s2=m[2].trim();
                const a1=(s1==='')?[]:s1.split(',').map(x=>Number(x.trim())).filter(n => !isNaN(n));
                const a2=(s2==='')?[]:s2.split(',').map(x=>Number(x.trim())).filter(n => !isNaN(n));
                for(let i=0;i<Math.max(a1.length,a2.length);i++){
                   if(i<a1.length){
                       if(!isNaN(a1[i]) && a1[i] >= 0 && a1[i] <= 255) output+=String.fromCharCode(a1[i]);
                       else throw new Error(`Деобфускация interleave: Неверный код в массиве a (${a1[i]}).`);
                   }
                   if(i<a2.length){
                       if(!isNaN(a2[i]) && a2[i] >= 0 && a2[i] <= 255) output+=String.fromCharCode(a2[i]);
                       else throw new Error(`Деобфускация interleave: Неверный код в массиве b (${a2[i]}).`);
                   }
                }
                deobfuscated=true;
            }
         }

         // Prime
         if (!deobfuscated && input.includes("t[i]//t[i+1]") && input.includes("loadstring")) {
              const m=input.match(/loadstring\s*\(\s*\(function\(t\)\s*local s=''for i=1,#t,2 do s=s\.\.string\.char\(t\[i\]\/\/\s*t\[i\+1\]\)end return s end\)\(\{([\d,\s]*)\}\)\)\(\)/s);
              if(m&&(m[1]!==undefined)){
                 const s=m[1].trim();
                 if(s===''){
                     output=""; // Handle empty array case
                 } else {
                    const n=s.split(',').map(x=>Number(x.trim())).filter(v => !isNaN(v)); // Filter NaN
                    if(n.length%2!==0)throw new Error("Простое число: Нечетное число элементов.");
                    for(let i=0;i<n.length;i+=2){
                        const v=n[i];
                        const p=n[i+1];
                        if(!isNaN(v)&&!isNaN(p)&&p!==0){
                            const charCode = Math.floor(v/p); // Lua // is integer division
                            if (charCode >= 0 && charCode <= 255) output+=String.fromCharCode(charCode);
                            else throw new Error(`Простое число: Неверный деобфусцированный код (${charCode}).`);
                        } else throw new Error(`Простое число: Неверные числа (${v}, ${p}).`);
                    }
                 }
                 deobfuscated=true;
            }
         }


         // 2. Check for gsub patterns (old offset/multiply)
         // Check for OLD random offset/multiply structure (string.char(...):gsub) - renamed from oldRandomMatch
         if (!deobfuscated && input.includes(":gsub('.',function(c)") && input.includes("c:byte()") && input.includes("loadstring")) {
              const charCodeMatch = input.match(/string\.char\(([\d,\s]*)\)/);
              // Regex for the OLD structure: c:byte() - val OR c:byte() // val
              const gsubFuncMatch = input.match(/function\(c\)\s*return\s*string\.char\(\s*c:byte\(\)\s*(?:-\s*(\d+)|(?:\s*\/\/\s*(\d+)))\s*\)/);

              if (charCodeMatch && (charCodeMatch[1] !== undefined) && gsubFuncMatch) {
                  const codesStr = charCodeMatch[1].trim();
                  const codes = (codesStr === '') ? [] : codesStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)); // Filter NaN
                  let value = 0; let isOffset = false;
                  let foundValue = false;

                  if (gsubFuncMatch[1] !== undefined) {
                      value = parseInt(gsubFuncMatch[1]);
                      isOffset = true;
                      foundValue = !isNaN(value) && value > 0; // Offset should be > 0
                  }
                  else if (gsubFuncMatch[2] !== undefined) {
                      value = parseInt(gsubFuncMatch[2]);
                      isOffset = false;
                       foundValue = !isNaN(value) && value !== 0; // Multiplier should be non-zero
                  }

                  if (foundValue) {
                       if (!isOffset && value === 0) throw new Error("Делитель 0 (старый формат).");
                       codes.forEach(code => {
                            if (!isNaN(code)) {
                                 let originalCode;
                                 if (isOffset) { originalCode = code - value; } // Subtract offset
                                 else { originalCode = Math.floor(code / value); } // Integer divide by multiplier
                                 // The old format often produced codes > 255. This check is needed.
                                 if (originalCode >= 0 && originalCode <= 255) {
                                      output += String.fromCharCode(originalCode);
                                 } else {
                                      console.warn(`Деobfuscation (старый формат): Code out of range 0-255 (${originalCode}). Input: ${code}, Value: ${value}, Type: ${isOffset ? 'Offset' : 'Multiply'}`);
                                      throw new Error(`Деобфускация (старый формат): Получен код вне диапазона 0-255 (${originalCode}). Неверный тип обфускации или данные повреждены.`);
                                 }
                            } else { throw new Error(`Деобфускация (старый формат): Неверный код в массиве (${code}).`); }
                       });
                       deobfuscated = true;
                  }
                   // If !foundValue, let other patterns try.
              }
         }


         // 3. Check for base encoding patterns (tonumber(t, base))
         const baseMethods = [
             {b:3, p:/tonumber\(t,3\)/, v:/^[012]+$/, c:6},
             {b:2, p:/tonumber\(b,2\)/, v:/^[01]+$/, c:8},
             {b:4, p:/tonumber\(t,4\)/, v:/^[0-3]+$/, c:4},
             {b:5, p:/tonumber\(t,5\)/, v:/^[0-4]+$/, c:4},
             {b:7, p:/tonumber\(t,7\)/, v:/^[0-6]+$/, c:3}, // Base 7
             {b:8, p:/tonumber\(t,8\)/, v:/^[0-7]+$/, c:3}  // Base 8
         ];
         for (const bm of baseMethods) {
              // Check if the pattern for the base is present AND it looks like a gmatch structure
              if (!deobfuscated && bm.p.test(input) && input.includes(":gmatch") && input.includes("loadstring")) {
                  const strMatch = input.match(/"([0-9]*)"/);
                   // Attempt to capture chunk detail from gmatch regex
                   const gmatchDetailMatch = input.match(/:gmatch\("([^"]+)"\)/);
                   // Determine chunk size: use captured size if valid, otherwise use default from bm
                   const chunkSize = gmatchDetailMatch && gmatchDetailMatch[1] && gmatchDetailMatch[1].length > 0 ? gmatchDetailMatch[1].length : bm.c;

                  if (strMatch && strMatch[1] !== undefined) {
                       const baseStr = strMatch[1];
                       if (baseStr === "") { output = ""; deobfuscated = true; break;} // Handle empty string case
                       // Проверяем, что строка содержит только допустимые символы для данной базы И имеет правильную длину для чанков И размер чанка > 0
                       if (bm.v.test(baseStr) && chunkSize > 0 && baseStr.length % chunkSize === 0) {
                           for (let i = 0; i < baseStr.length; i += chunkSize) {
                               const chunk = baseStr.substr(i, chunkSize);
                               const charCode = parseInt(chunk, bm.b);
                                if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) { // Validate code range
                                    output += String.fromCharCode(charCode);
                                } else {
                                     throw new Error(`Деобфускация Base${bm.b}: Неверный или внедиапазонный код (${charCode}) из чанка "${chunk}".`);
                                }
                           }
                           deobfuscated = true;
                           break; // Прерываем цикл по baseMethods, как только нашли и деобфусцировали
                       }
                       // If regex matches but validation (v.test or chunk length) fails,
                       // it might be a false positive, so don't mark as deobfuscated.
                  }
              }
         }


         // 4. Check for simple loadstring("escaped string") patterns
         // ASCII (\ddd)
         // Added loadstring check to all simple escape patterns
         if (!deobfuscated && /loadstring\s*\(\s*["'](?:\\\d{1,3})+["']\s*\)\(\)/s.test(input) && input.includes("loadstring")) {
            const m = input.match(/loadstring\s*\(\s*["']((?:\\\d{1,3})+)["']\s*\)/);
            if (m && m[1]) {
                output = m[1].replace(/\\(\d{1,3})/g, (x, d) => {
                     const charCode = parseInt(d, 10);
                     if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) return String.fromCharCode(charCode);
                     throw new Error(`Деобфускация ASCII: Неверный код (${d}).`);
                });
                deobfuscated = true;
            }
         }
         // HEX (\xNN)
         if (!deobfuscated && input.includes("\\x") && input.includes("loadstring")) {
             const m=input.match(/loadstring\s*\(\s*["']((?:\\x[0-9a-fA-F]{2})+)["']\s*\)/);
             if(m&&m[1]){
                 output=m[1].replace(/\\x([0-9a-fA-F]{2})/g,(x,h)=>{
                     const charCode = parseInt(h,16);
                     if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) return String.fromCharCode(charCode);
                     throw new Error(`Деobfuscation HEX: Неверный код (${h}).`);
                 });
                 deobfuscated = true;
             }
         }
         // Unicode (\u{NNNN})
         if (!deobfuscated && input.includes("\\u{") && input.includes("loadstring")) {
             // Check for both single and double quotes
             let m = input.match(/loadstring\s*\(\s*["']((?:\\u\{[0-9a-fA-F]+\})+)"'\s*\)/); // Try double quotes first
              if (!m) { // If double quotes didn't match, try single quotes
                 m = input.match(/loadstring\s*\(\s*[']((?:\\u\{[0-9a-fA-F]+\})+)'\s*\)/);
             }

             if(m&&m[1]){
                 output=m[1].replace(/\\u\{([0-9a-fA-F]+)\}/g,(x,c)=>{
                     const charCode = parseInt(c,16);
                     // Unicode can be > 255, but Lua string.char limits? Let's allow higher for deobfuscation fidelity.
                     if (!isNaN(charCode)) return String.fromCharCode(charCode);
                     throw new Error(`Деобфускация Unicode: Неверный код (${c}).`);
                 });
                 deobfuscated = true;
             }
         }
         // string.char(...) - This is simple, but also a substring of other methods.
         // Keep it later in the checks.
         if (!deobfuscated && input.includes("string.char(") && input.includes("loadstring")) {
              // Check for the direct loadstring(string.char(...))() pattern
              const m=input.match(/loadstring\s*\(\s*string\.char\(([\d,\s]*)\)\)\(\)/s); // Precise regex for this specific pattern
              if(m && m[1] !== undefined){
                  const s=m[1].trim();
                  if(s===''){
                      output="";
                  } else {
                      const c=s.split(',').map(x=>Number(x.trim())).filter(n => !isNaN(n)); // Filter NaN
                      c.forEach(cd=>{
                          if(!isNaN(cd) && cd >= 0 && cd <= 255) output+=String.fromCharCode(cd);
                          else throw new Error(`Деобфускация string.char: Неверный код (${cd}).`);
                      });
                  }
                  deobfuscated=true;
              }
              // If the precise pattern didn't match, it might be string.char part of a complex method, so don't mark deobfuscated.
         }


         // 5. Fallback: try to extract string from loadstring argument if no other pattern matched
         // THIS IS POTENTIALLY DANGEROUS. Only as a last resort.
         if (!deobfuscated) {
             const m = input.match(/loadstring\(\s*["'](.*?)["']\s*\)\(\)/s); // Match loadstring("...") or loadstring('...')
             if (m && m[1] !== undefined) {
                 // Декодируем стандартные Lua escape-последовательности символов
                 output = m[1].replace(/\\"/g,'"')
                             .replace(/\\'/g,"'")
                             .replace(/\\\\/g,"\\")
                             .replace(/\\n/g,"\n")
                             .replace(/\\t/g,"\t")
                             .replace(/\\r/g,"\r")
                             .replace(/\\f/g,"\f")
                             .replace(/\\v/g,"\v");

                 // Attempt to decode numeric/hex/unicode escapes IF they weren't handled by specific patterns earlier
                 // This might be redundant if the specific patterns worked, but safer here.
                 output = output.replace(/\\(\d{1,3})/g, (m, num) => {
                     const charCode = parseInt(num, 10);
                     if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) return String.fromCharCode(charCode);
                     console.warn(`Fallback: Could not decode numeric escape \\${num}.`);
                     return m; // Return original escape sequence if invalid
                 })
                 .replace(/\\x([0-9a-fA-F]{2})/g, (m, hex) => {
                      const charCode = parseInt(hex,16);
                      if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) return String.fromCharCode(charCode);
                       console.warn(`Fallback: Could not decode hex escape \\x${hex}.`);
                      return m; // Return original escape sequence if invalid
                 })
                 .replace(/\\u\{([0-9a-fA-F]+)\}/g, (m, unicode) => {
                      const charCode = parseInt(unicode,16);
                      if (!isNaN(charCode)) return String.fromCharCode(charCode); // Allow higher for unicode
                      console.warn(`Fallback: Could not decode unicode escape \\u{${unicode}}.`);
                      return m; // Return original escape sequence if invalid
                 });


                 console.warn("Fallback: извлечена строка из loadstring. Деобфускация может быть неполной или неточной.");
                 // Если хоть что-то извлекли, считаем "частично" деобфусцированным,
                 // чтобы не показывать "Не удалось распознать".
                 if (output !== "" || m[1].trim() === "") { // Consider empty source string as a valid outcome for fallback
                     deobfuscated = true;
                 } else {
                     // If regex matched but resulted in empty output and source wasn't empty, something went wrong.
                     output = "Не удалось распознать тип обфускации или извлечь строку.";
                     outputElement.style.borderColor = "#ff9800";
                 }

             }
              // If regex didn't match loadstring("..."), then it's truly unrecognized by simple means.
         }


         // Финальная проверка результата и статуса
         if (!deobfuscated) {
              // Если ни один паттерн не сработал, включая fallback
              output = "Не удалось распознать тип обфускации.";
              outputElement.style.borderColor = "#ff9800"; // Цвет ошибки
         } else if (output === "" && input !== "") {
             // Если деобфускация прошла успешно (deobfuscated=true), но результат пустой строкой,
             // И исходный ввод не был пустым.
             output = "Код деобфусцирован, но результат пуст (возможно, был пустой код после обфускации или проблема в данных).";
             outputElement.style.borderColor = "#ff9800"; // Цвет предупреждения
         } else if (output !== "" && !output.startsWith('Ошибка деобфускации') && !output.startsWith('Не удалось распознать')) {
              // Успешная деобфускация с непустым результатом
              outputElement.style.borderColor = "#4CAF50"; // Цвет успеха
         }
         // Если output уже является сообщением об ошибке из блока try/catch, его текст и цвет рамки уже установлены.


    } catch (e) {
         // Общая ошибка при обработке известных паттернов
         console.error("Deobfuscation error:", e);
         output = `Ошибка деобфускации: ${e.message}`;
         outputElement.style.borderColor = "#ff9800"; // Цвет рамки при ошибке
         // Важно не ставить deobfuscated = true здесь, чтобы ошибка не скрылась за сообщением об успехе
    }

     // Обновляем текст вывода в любом случае
    outputElement.textContent = output;

}

// --- Copy to Clipboard ---
 function copyToClipboard() {
    const output = document.getElementById("output");
    const text = output.textContent;

    // Исключаем копирование служебных текстов
     const excludedTexts = ['Генерация...', 'Деобфускация...', 'Введите обфусцированный код сначала!', 'Не удалось распознать тип обфускации.', 'Ошибка обфускации', 'Ошибка деобфускации', 'Деобфускация завершена, но результат пуст'];
     // Проверяем, что текст не пустой и не начинается с одного из исключенных префиксов
     if (!text || excludedTexts.some(prefix => text.startsWith(prefix))) {
         alert("Нет кода для копирования.");
         return;
     }


    navigator.clipboard.writeText(text).then(() => {
         const btn = document.querySelector(".copy-btn");
         const originalText = btn.textContent;
         btn.textContent = "СКОПИРОВАНО!";
         btn.classList.add("copied");
         setTimeout(() => {
             btn.textContent = originalText;
             btn.classList.remove("copied");
         }, 1500);
    }).catch(err => {
         console.error("Copy error: ", err);
         // Fallback method for older browsers or specific environments
         try {
              const ta = document.createElement("textarea");
              ta.value = text;
              // Make it invisible and outside the viewport
              ta.style.position = "fixed";
              ta.style.opacity = "0";
              ta.style.left = "-9999px";
              ta.style.top = "-9999px";
              document.body.appendChild(ta);
              ta.select();
              const ok = document.execCommand("copy");
              document.body.removeChild(ta);
              const btn = document.querySelector(".copy-btn");
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
              }, 2000); // Give a bit more time for fallback message
         } catch (e) {
              console.error("Fallback copy failed: ", e);
              alert("Не удалось скопировать текст.");
         }
    });
 }

// --- Auto-select on click ---
document.getElementById("output").addEventListener("click", function(event) {
     // Исключаем выделение служебных текстов
    const excludedTexts = ['Генерация...', 'Деобфускация...', 'Введите обфусцированный код сначала!', 'Не удалось распознать тип обфускации.', 'Ошибка обфускации', 'Ошибка деобфускации', 'Деобфускация завершена, но результат пуст'];
    if (!this.textContent || excludedTexts.some(prefix => this.textContent.startsWith(prefix))) {
         // Если текст является служебным, не выделяем его
         return;
     }
     // Prevent re-selecting if already selected (опционально, может мешать на мобильных)
     // if (window.getSelection().toString() === this.textContent) {
     //     return;
     // }
    try {
                 const range = document.createRange();
                 range.selectNodeContents(this); // Выделяем все содержимое
                 const selection = window.getSelection();
                 selection.removeAllRanges(); // Снимаем текущее выделение
                 selection.addRange(range); // Добавляем новое выделение
            } catch (e) {
                 console.warn("Could not select text.", e);
            }
        });

         // Удален слушатель DOMContentLoaded, который устанавливал начальный плейсхолдер

