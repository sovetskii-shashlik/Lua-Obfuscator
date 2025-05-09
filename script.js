// --- Theme toggle logic ---
const themeToggle = document.getElementById('themeToggle');
const urlToggleBtn = document.getElementById('urlToggleBtn'); // Get the new button

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    // Store theme preference
    localStorage.setItem('darkTheme', isDark);
});

// Apply saved theme on load
if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
} else {
     themeToggle.textContent = '🌙'; // Ensure correct icon on light theme load
}

// --- View Toggle Logic ---
const codeObfuscatorDiv = document.getElementById('codeObfuscator');
const urlObfuscatorDiv = document.getElementById('urlObfuscator');

urlToggleBtn.addEventListener('click', () => {
     const isCodeViewVisible = codeObfuscatorDiv.style.display !== 'none';

     if (isCodeViewVisible) {
         codeObfuscatorDiv.style.display = 'none';
         urlObfuscatorDiv.style.display = 'block'; // Or flex/grid if needed, block is simplest
         urlToggleBtn.textContent = '📄'; // Icon for code file
         urlToggleBtn.title = 'Переключить на обфускатор кода';
         // Clear statuses when switching away from code obfuscator
         document.getElementById("status").textContent = '';
         document.getElementById("statusV2").textContent = '';
         document.getElementById("statusV3").textContent = '';
     } else {
         urlObfuscatorDiv.style.display = 'none';
         codeObfuscatorDiv.style.display = 'block';
         urlToggleBtn.textContent = '🔗'; // Icon for link
         urlToggleBtn.title = 'Переключить на URL обфускатор';
     }
});

// --- Code Obfuscator Functions (Original, slightly adapted) ---

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
}

function obfuscate(method, inputText) {
    // Use the input from the *code* obfuscator section
    const input = inputText || document.getElementById("input").value.trim();
    // Use the output element from the *code* obfuscator section
    const outputElement = document.getElementById("output");

    if (!input && !inputText) {
        alert("Введи Lua-код сначала!");
        outputElement.textContent = '';
        outputElement.style.borderColor = "#4CAF50";
        return "";
    }

    if (!inputText) {
        outputElement.textContent = 'Генерация...';
        outputElement.style.borderColor = "#4CAF50";
         // Clear statuses only when triggered by code obfuscator buttons
        document.getElementById("status").textContent = '';
        document.getElementById("statusV2").textContent = '';
        document.getElementById("statusV3").textContent = '';
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
        else if (method === "octal") {
             let o = [];
             for (let i = 0; i < input.length; i++) {
                 o.push(input.charCodeAt(i).toString(7).padStart(3, '0'));
             }
             output = `loadstring((function() local s="" for t in ("${o.join('')}"):gmatch("%d%d%d") do s=s..string.char(tonumber(t,7)) end return s end)())()`;
        }
        else if (method === "octal8") {
             let o = [];
             for (let i = 0; i < input.length; i++) {
                 o.push(input.charCodeAt(i).toString(8).padStart(3, '0'));
             }
             output = `loadstring((function() local s="" for t in ("${o.join('')}"):gmatch("%d%d%d") do s=s..string.char(tonumber(t,8)) end return s end)())()`;
         }
        else if (method === "interleave") { let p=[[],[]]; for(let i=0;i<input.length;i++)p[i%2].push(input.charCodeAt(i)); output = `loadstring((function(a,b)local s=''for i=1,math.max(#a,#b)do if a[i]then s=s..string.char(a[i])end if b[i]then s=s..string.char(b[i])end end return s end)({${p[0].join(',')}},{${p[1].join(',')}}))()`; }
        else if (method === "prime") { const pr=[2,3,5,7,11,13,17,19,23,29]; let t=[]; for(let i=0;i<input.length;i++){const p=pr[i%pr.length];t.push(input.charCodeAt(i)*p);t.push(p);} output = `loadstring((function(t)local s=''for i=1,#t,2 do s=s..string.char(t[i]//t[i+1])end return s end)({${t.join(',')}}))()`; }
        else if (method === "offset") { const of=5; let t=[]; for(let i=0;i<input.length;i++)t.push(input.charCodeAt(i)+of); output = `loadstring(string.char(${t.join(',')}):gsub('.',function(c)return string.char(c:byte()-${of})end))()`; }
        else if (method === "multiply") { const mu=2; let t=[]; for(let i=0;i<input.length;i++)t.push(input.charCodeAt(i)*mu); output = `loadstring(string.char(${t.join(',')}):gsub('.',function(c)return string.char(c:byte()//${mu})end))()`; }

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

     if (!inputText) {
        outputElement.textContent = output;
        outputElement.style.borderColor = "#4CAF50";
    }
    return output;
}

// --- Multi-Layer Functions (Call the adapted obfuscate) ---
// These functions remain largely the same but rely on the updated obfuscate function
function startMultiLayerObfuscation() {
    const input = document.getElementById("input").value.trim();
    const outputElement = document.getElementById("output");
    if (!input) { alert("Введи Lua-код сначала!"); return; }

    outputElement.textContent = 'Запуск многослойной обфускации v1...';
    outputElement.style.borderColor = "#4CAF50";

    const btn = document.getElementById("multiObfuscateBtn");
    const status = document.getElementById("status");
    document.getElementById("statusV2").textContent = ''; document.getElementById("statusV3").textContent = '';

    btn.disabled = true; btn.classList.add("processing"); btn.textContent = "ОБФУСКАЦИЯ v1..."; status.textContent = "Запуск v1...";
    let currentCode = input; const steps = [ { method: "random_offset", name: "Смещение (Рандом)" }, { method: "unicode", name: "Unicode" }, { method: "base3", name: "Base3" } ]; let step = 0;
    function processNextStep() {
        if (step >= steps.length) { btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1"; status.textContent = "Обфускация v1 завершена!"; return; }
        const currentMethod = steps[step]; status.textContent = `v1 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`; const obfuscatedStep = obfuscate(currentMethod.method, currentCode);
        if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) {
            status.textContent = `v1 Ошибка на шаге ${step + 1}. Прервано.`;
            btn.disabled = false; btn.classList.remove("processing"); btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1";
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
     document.getElementById("status").textContent = ''; document.getElementById("statusV3").textContent = '';

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
     document.getElementById("status").textContent = ''; document.getElementById("statusV2").textContent = '';

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


// --- DEOBFUSCATION FUNCTION ---
function deobfuscate() {
    // Use the input from the *code* obfuscator section
    const input = document.getElementById("input").value.trim();
    // Use the output element from the *code* obfuscator section
    const outputElement = document.getElementById("output");

    // Clear statuses in the code obfuscator section
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

    try {
         const newRandomMatch = input.match(/loadstring\s*\(\s*\(function\(codes,\s*(offset|multiplier)\)\s*local s = ''; for i = 1, #codes do s = s \.\. string\.char\((?:codes\[i\]\s*-\s*\1|\s*math\.floor\(codes\[i\]\s*\/\s*\2\))\) end return s end\)\(\{([\d,\s]*)\},\s*(\d+)\)\)\(\)/s);
         if (!deobfuscated && newRandomMatch) {
              const type = newRandomMatch[1];
              const codesStr = newRandomMatch[3].trim();
              const value = parseInt(newRandomMatch[4]);
              const codes = (codesStr === '') ? [] : codesStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

              if (!isNaN(value) && (type === 'offset' ? value > 0 : value !== 0)) {
                   codes.forEach(code => {
                        if (!isNaN(code)) {
                            let originalCode;
                            if (type === 'offset') {
                                originalCode = code - value;
                            } else {
                                 if (value === 0) throw new Error("Делитель 0 при деобфускации.");
                                originalCode = Math.floor(code / value);
                            }
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
                   deobfuscated = true;
              }
         }

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

         if (!deobfuscated && input.includes("t[i]//t[i+1]") && input.includes("loadstring")) {
              const m=input.match(/loadstring\s*\(\s*\(function\(t\)\s*local s=''for i=1,#t,2 do s=s\.\.string\.char\(t\[i\]\/\/\s*t\[i\+1\]\)end return s end\)\(\{([\d,\s]*)\}\)\)\(\)/s);
              if(m&&(m[1]!==undefined)){
                 const s=m[1].trim();
                 if(s===''){ output=""; } else {
                    const n=s.split(',').map(x=>Number(x.trim())).filter(v => !isNaN(v));
                    if(n.length%2!==0)throw new Error("Простое число: Нечетное число элементов.");
                    for(let i=0;i<n.length;i+=2){
                        const v=n[i];
                        const p=n[i+1];
                        if(!isNaN(v)&&!isNaN(p)&&p!==0){
                            const charCode = Math.floor(v/p);
                            if (charCode >= 0 && charCode <= 255) output+=String.fromCharCode(charCode);
                            else throw new Error(`Простое число: Неверный деобфусцированный код (${charCode}).`);
                        } else throw new Error(`Простое число: Неверные числа (${v}, ${p}).`);
                    }
                 }
                 deobfuscated=true;
            }
         }


         const baseMethods = [
             {b:3, p:/tonumber\(t,3\)/, v:/^[012]+$/, c:6},
             {b:2, p:/tonumber\(b,2\)/, v:/^[01]+$/, c:8},
             {b:4, p:/tonumber\(t,4\)/, v:/^[0-3]+$/, c:4},
             {b:5, p:/tonumber\(t,5\)/, v:/^[0-4]+$/, c:4},
             {b:7, p:/tonumber\(t,7\)/, v:/^[0-6]+$/, c:3},
             {b:8, p:/tonumber\(t,8\)/, v:/^[0-7]+$/, c:3}
         ];
         for (const bm of baseMethods) {
              if (!deobfuscated && bm.p.test(input) && input.includes(":gmatch") && input.includes("loadstring")) {
                  const strMatch = input.match(/"([0-9]*)"/);
                   const gmatchDetailMatch = input.match(/:gmatch\("([^"]+)"\)/);
                   const chunkSize = gmatchDetailMatch && gmatchDetailMatch[1] && gmatchDetailMatch[1].length > 0 ? gmatchDetailMatch[1].length : bm.c;

                  if (strMatch && strMatch[1] !== undefined) {
                       const baseStr = strMatch[1];
                       if (baseStr === "") { output = ""; deobfuscated = true; break;}
                       if (bm.v.test(baseStr) && chunkSize > 0 && baseStr.length % chunkSize === 0) {
                           for (let i = 0; i < baseStr.length; i += chunkSize) {
                               const chunk = baseStr.substr(i, chunkSize);
                               const charCode = parseInt(chunk, bm.b);
                                if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) {
                                    output += String.fromCharCode(charCode);
                                } else {
                                     throw new Error(`Деобфускация Base${bm.b}: Неверный или внедиапазонный код (${charCode}) из чанка "${chunk}".`);
                                }
                           }
                           deobfuscated = true;
                           break;
                       }
                  }
              }
         }

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
         if (!deobfuscated && input.includes("\\u{") && input.includes("loadstring")) {
             let m = input.match(/loadstring\s*\(\s*["']((?:\\u\{[0-9a-fA-F]+\})+)"'\s*\)/);
              if (!m) {
                 m = input.match(/loadstring\s*\(\s*[']((?:\\u\{[0-9a-fA-F]+\})+)'\s*\)/);
             }
             if(m&&m[1]){
                 output=m[1].replace(/\\u\{([0-9a-fA-F]+)\}/g,(x,c)=>{
                     const charCode = parseInt(c,16);
                     if (!isNaN(charCode)) return String.fromCharCode(charCode);
                     throw new Error(`Деobfuscation Unicode: Неверный код (${c}).`);
                 });
                 deobfuscated = true;
             }
         }
         if (!deobfuscated && input.includes("string.char(") && input.includes("loadstring")) {
              const m=input.match(/loadstring\s*\(\s*string\.char\(([\d,\s]*)\)\)\(\)/s);
              if(m && m[1] !== undefined){
                  const s=m[1].trim();
                  if(s===''){ output=""; } else {
                      const c=s.split(',').map(x=>Number(x.trim())).filter(n => !isNaN(n));
                      c.forEach(cd=>{
                          if(!isNaN(cd) && cd >= 0 && cd <= 255) output+=String.fromCharCode(cd);
                          else throw new Error(`Деобфускация string.char: Неверный код (${cd}).`);
                      });
                  }
                  deobfuscated=true;
              }
         }

         if (!deobfuscated) {
             const m = input.match(/loadstring\(\s*["'](.*?)["']\s*\)\(\)/s);
             if (m && m[1] !== undefined) {
                 output = m[1].replace(/\\"/g,'"')
                             .replace(/\\'/g,"'")
                             .replace(/\\\\/g,"\\")
                             .replace(/\\n/g,"\n")
                             .replace(/\\t/g,"\t")
                             .replace(/\\r/g,"\r")
                             .replace(/\\f/g,"\f")
                             .replace(/\\v/g,"\v");

                 output = output.replace(/\\(\d{1,3})/g, (m, num) => {
                     const charCode = parseInt(num, 10);
                     if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) return String.fromCharCode(charCode);
                     console.warn(`Fallback: Could not decode numeric escape \\${num}.`);
                     return m;
                 })
                 .replace(/\\x([0-9a-fA-F]{2})/g, (m, hex) => {
                      const charCode = parseInt(hex,16);
                      if (!isNaN(charCode) && charCode >= 0 && charCode <= 255) return String.fromCharCode(charCode);
                       console.warn(`Fallback: Could not decode hex escape \\x${hex}.`);
                      return m;
                 })
                 .replace(/\\u\{([0-9a-fA-F]+)\}/g, (m, unicode) => {
                      const charCode = parseInt(unicode,16);
                      if (!isNaN(charCode)) return String.fromCharCode(charCode);
                      console.warn(`Fallback: Could not decode unicode escape \\u{${unicode}}.`);
                      return m;
                 });

                 console.warn("Fallback: извлечена строка из loadstring. Деобфускация может быть неполной или неточной.");
                 if (output !== "" || m[1].trim() === "") {
                     deobfuscated = true;
                 } else {
                     output = "Не удалось распознать тип обфускации или извлечь строку.";
                     outputElement.style.borderColor = "#ff9800";
                 }
             }
         }

         if (!deobfuscated) {
              output = "Не удалось распознать тип обфускации.";
              outputElement.style.borderColor = "#ff9800";
         } else if (output === "" && input !== "") {
             output = "Код деобфусцирован, но результат пуст (возможно, был пустой код после обфускации или проблема в данных).";
             outputElement.style.borderColor = "#ff9800";
         } else if (output !== "" && !output.startsWith('Ошибка деобфускации') && !output.startsWith('Не удалось распознать')) {
              outputElement.style.borderColor = "#4CAF50";
         }

    } catch (e) {
         console.error("Deobfuscation error:", e);
         output = `Ошибка деобфускации: ${e.message}`;
         outputElement.style.borderColor = "#ff9800";
    }

    outputElement.textContent = output;
}

// --- Copy to Clipboard (Code Obfuscator) ---
 function copyCodeToClipboard() {
    const output = document.getElementById("output");
    const text = output.textContent;

     const excludedTexts = ['Генерация...', 'Деобфускация...', 'Введите обфусцированный код сначала!', 'Не удалось распознать тип обфускации.', 'Ошибка обфускации', 'Ошибка деобфускации', 'Деобфускация завершена, но результат пуст', 'Запуск многослойной обфускации', 'Обфускация v1 завершена!', 'v1 Шаг', 'v1 Ошибка', 'Обфускация v2 завершена!', 'v2 Шаг', 'v2 Ошибка', 'Обфускация v3 завершена!', 'v3 Шаг', 'v3 Ошибка'];
     if (!text || excludedTexts.some(prefix => text.startsWith(prefix))) {
         alert("Нет кода для копирования.");
         return;
     }

    navigator.clipboard.writeText(text).then(() => {
         const btn = document.querySelector("#codeObfuscator .copy-btn"); // Select specific button
         const originalText = btn.textContent;
         btn.textContent = "СКОПИРОВАНО!";
         btn.classList.add("copied");
         setTimeout(() => {
             btn.textContent = originalText;
             btn.classList.remove("copied");
         }, 1500);
    }).catch(err => {
         console.error("Copy error: ", err);
         try {
              const ta = document.createElement("textarea");
              ta.value = text;
              ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.left = "-9999px"; ta.style.top = "-9999px";
              document.body.appendChild(ta);
              ta.select();
              const ok = document.execCommand("copy");
              document.body.removeChild(ta);
              const btn = document.querySelector("#codeObfuscator .copy-btn"); // Select specific button
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

// --- Auto-select on click (Code Obfuscator) ---
document.getElementById("output").addEventListener("click", function(event) {
    const excludedTexts = ['Генерация...', 'Деобфускация...', 'Введите обфусцированный код сначала!', 'Не удалось распознать тип обфускации.', 'Ошибка обфускации', 'Ошибка деобфускации', 'Деобфускация завершена, но результат пуст', 'Запуск многослойной обфускации', 'Обфускация v1 завершена!', 'v1 Шаг', 'v1 Ошибка', 'Обфускация v2 завершена!', 'v2 Шаг', 'v2 Ошибка', 'Обфускация v3 завершена!', 'v3 Шаг', 'v3 Ошибка'];
    if (!this.textContent || excludedTexts.some(prefix => this.textContent.startsWith(prefix))) {
         return;
     }
    try {
         const range = document.createRange();
         range.selectNodeContents(this);
         const selection = window.getSelection();
         selection.removeAllRanges();
         selection.addRange(range);
    } catch (e) {
         console.warn("Could not select text.", e);
    }
});


// --- URL Obfuscator Functions (Copied and Adapted) ---

function encodeUrl() {
    // Use input and output elements from the *URL* obfuscator section
    const url = document.getElementById('urlInput').value.trim();
    const urlOutputContainer = document.getElementById('urlOutputContainer');

    if (!url) {
        alert("Please enter a URL first");
        urlOutputContainer.innerHTML = ''; // Clear previous results
        return;
    }

    const safeChars = new Set(['/', '=', '+', '-', '_', '~', ':']); // Added '.' as safe based on common URL needs

    let result = "";
    let i = 0;

    if (url.startsWith("https://")) {
        result = "https://";
        i = 8;
    } else if (url.startsWith("http://")) {
        result = "http://";
        i = 7;
    }

    for (; i < url.length; i++) {
        const char = url[i];
        // Check if charCode is valid before encoding
         if (char.charCodeAt(0) > 255) {
             console.warn(`Skipping non-ASCII character in URL: ${char}`);
             result += char; // Append non-ASCII as-is, or handle error? Let's append as-is for now.
         } else if (safeChars.has(char)) {
            result += char;
        } else {
            result += "%" + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
        }
    }

    const loadstringCode = `loadstring(game:HttpGet("${result}"))()`;

    // Display results with professional formatting in the URL output container
    urlOutputContainer.innerHTML = `
        <div class="result-box">
            <span class="result-label">OBFUSCATED URL:</span>
            <div class="url-display">${result}</div>
        </div>

        <div class="result-box">
            <span class="result-label">READY-TO-USE LUA CODE:</span>
            <textarea id="urlLuaCode" readonly>${loadstringCode}</textarea>
            <button class="copy-btn" onclick="copyUrlToClipboard()">COPY TO CLIPBOARD</button>
        </div>
    `;
}

// --- Copy to Clipboard (URL Obfuscator) ---
function copyUrlToClipboard() {
    // Use the textarea from the *URL* obfuscator section
    const textarea = document.getElementById('urlLuaCode');
    if (!textarea) {
         alert("No code to copy."); // Handle case where textarea hasn't been created yet
         return;
    }

    textarea.select();
    // For modern browsers
    navigator.clipboard.writeText(textarea.value).then(() => {
         const btn = document.querySelector('#urlObfuscator .copy-btn'); // Select specific button
         const originalText = btn.textContent;
         btn.textContent = "COPIED!";
         btn.style.backgroundColor = "#4CAF50"; // Green feedback color
         // In dark mode, the green should also match
         if (document.body.classList.contains('dark-theme')) {
             btn.style.backgroundColor = "#2e7d32";
         }
         setTimeout(() => {
             btn.textContent = originalText;
             btn.style.backgroundColor = "#2196F3"; // Reset to blue
              if (document.body.classList.contains('dark-theme')) {
                btn.style.backgroundColor = "#1565c0";
            }
         }, 2000);
    }).catch(err => {
         console.error("Copy error (URL): ", err);
         // Fallback method
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
                    btn.style.backgroundColor = "#2196F3";
                     if (document.body.classList.contains('dark-theme')) {
                         btn.style.backgroundColor = "#1565c0";
                    }
               }, 2500); // Longer timeout for fallback message
         } catch (e) {
              console.error("Fallback copy failed (URL): ", e);
              alert("Failed to copy URL code.");
         }
    });
}

 // Prevent default form submission if container was a form (it's not, but good practice)
 // Ensure URL input doesn't trigger unexpected behaviour
 document.getElementById('urlInput').addEventListener('keypress', function(event) {
     if (event.key === 'Enter') {
         event.preventDefault(); // Prevent form submission
         encodeUrl(); // Trigger the function
     }
 });
