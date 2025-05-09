// --- Theme toggle logic ---
const themeToggle = document.getElementById('themeToggle');
const urlToggleBtn = document.getElementById('urlToggleBtn');

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

// --- View Toggle Logic ---
const codeObfuscatorDiv = document.getElementById('codeObfuscator');
const urlObfuscatorDiv = document.getElementById('urlObfuscator');

urlToggleBtn.addEventListener('click', () => {
     const isCodeViewVisible = codeObfuscatorDiv.style.display !== 'none';

     if (isCodeViewVisible) {
         codeObfuscatorDiv.style.display = 'none';
         urlObfuscatorDiv.style.display = 'block';
         urlToggleBtn.textContent = '📄'; // Icon for code file
         urlToggleBtn.title = 'Переключить на обфускатор кода';
         // Clear statuses when switching away
         document.getElementById("status").textContent = '';
         document.getElementById("statusV2").textContent = '';
         document.getElementById("statusV3").textContent = '';
         document.getElementById("output").textContent = '';
         document.getElementById("input").value = '';
     } else {
         urlObfuscatorDiv.style.display = 'none';
         codeObfuscatorDiv.style.display = 'block';
         urlToggleBtn.textContent = '🔗'; // Icon for link
         urlToggleBtn.title = 'Переключить на URL обфускатор';
         // Clear URL input/output when switching away
         document.getElementById("urlInput").value = '';
         document.getElementById("urlOutputContainer").innerHTML = '';
     }
});

// --- Code Obfuscator Functions (Adapted for UTF-8 Bytes) ---

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function obfuscate(method, inputText) {
    const input = inputText || document.getElementById("input").value.trim();
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
        document.getElementById("status").textContent = '';
        document.getElementById("statusV2").textContent = '';
        document.getElementById("statusV3").textContent = '';
    }

    let output = "";
    let bytes = new Uint8Array();
    try {
        const encoder = new TextEncoder();
        bytes = encoder.encode(input); // Get UTF-8 bytes array

        if (method === "ascii") {
            let e = "";
            for (const byte of bytes) {
                e += "\\" + byte; // Escape each byte value (0-255)
            }
            // Lua loadstring interprets escapes and creates a string byte-by-byte
            output = `loadstring("${e}")()`;
        } else if (method === "hex") {
            let h = "";
            for (const byte of bytes) {
                h += "\\x" + byte.toString(16).padStart(2, "0"); // Escape each byte as hex (00-FF)
            }
             // Lua loadstring interprets hex escapes and creates a string byte-by-byte
            output = `loadstring("${h}")()`;
        } else if (method === "unicode") {
             // NOTE: This method encodes JS string code points (\u{}).
             // It is NOT byte-based and might not work reliably in all Lua environments
             // for characters outside the Basic Multilingual Plane or depending on Lua's
             // internal string representation. Byte-based methods are preferred for robustness.
             let u = "";
             for (let i = 0; i < input.length; i++) {
                 // charCodeAt might give surrogate code units for non-BMP characters.
                 // This might result in invalid unicode escapes in Lua.
                 u += "\\u{" + input.charCodeAt(i).toString(16).padStart(4, "0") + "}";
             }
             output = `loadstring("${u}")()`;
        } else if (method === "number") {
            // Pass byte values (0-255) directly to string.char in Lua
            output = `loadstring(string.char(${Array.from(bytes).join(",")}))()`;
        } else if (method === "base3") {
            let b = "";
            for (const byte of bytes) {
                 // Pad each byte's base3 representation to 6 digits (max 255 is 22110 in base 3)
                b += byte.toString(3).padStart(6, '0');
            }
            // Lua function decodes base3 chunks back to byte values, puts in a table,
            // and uses string.char(unpack(bytes)) to form the string.
            output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 6 do table.insert(bytes, tonumber(data:sub(i, i+5), 3)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "binary") {
            let b = "";
            for (const byte of bytes) {
                b += byte.toString(2).padStart(8, '0'); // Pad each byte's binary to 8 digits
            }
             // Lua function decodes binary chunks back to byte values, puts in table, unpacks.
            output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 8 do table.insert(bytes, tonumber(data:sub(i, i+7), 2)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "base4") {
             let b = "";
             for (const byte of bytes) {
                  // Pad each byte's base4 representation to 4 digits (max 255 is 3333 in base 4)
                 b += byte.toString(4).padStart(4, '0');
             }
             // Lua function decodes base4 chunks back to byte values, puts in table, unpacks.
             output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 4 do table.insert(bytes, tonumber(data:sub(i, i+3), 4)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "base5") {
             let b = "";
             for (const byte of bytes) {
                 // Pad each byte's base5 representation to 4 digits (max 255 is 2010 in base 5)
                 b += byte.toString(5).padStart(4, '0');
             }
             // Lua function decodes base5 chunks back to byte values, puts in table, unpacks.
             output = `loadstring((function() local s="" local data="${b}" local bytes = {} for i = 1, #data, 4 do table.insert(bytes, tonumber(data:sub(i, i+3), 5)) end return string.char(unpack(bytes)) end)())()`;
        } else if (method === "octal") { // Base 7
              let o = "";
              for (const byte of bytes) {
                   // Pad each byte's base7 representation to 3 digits (max 255 is 513 in base 7)
                  o += byte.toString(7).padStart(3, '0');
              }
              // Lua function decodes base7 chunks back to byte values, puts in table, unpacks.
              output = `loadstring((function() local s="" local data="${o}" local bytes = {} for i = 1, #data, 3 do table.insert(bytes, tonumber(data:sub(i, i+2), 7)) end return string.char(unpack(bytes)) end)())()`;
         } else if (method === "octal8") { // Base 8
              let o = "";
              for (const byte of bytes) {
                   // Pad each byte's base8 representation to 3 digits (max 255 is 377 in base 8)
                  o += byte.toString(8).padStart(3, '0');
              }
              // Lua function decodes base8 chunks back to byte values, puts in table, unpacks.
              output = `loadstring((function() local s="" local data="${o}" local bytes = {} for i = 1, #data, 3 do table.insert(bytes, tonumber(data:sub(i, i+2), 8)) end return string.char(unpack(bytes)) end)())()`;
          } else if (method === "interleave") {
              let p1 = []; // Bytes at even indices
              let p2 = []; // Bytes at odd indices
              for (let i = 0; i < bytes.length; i++) {
                  if (i % 2 === 0) {
                      p1.push(bytes[i]);
                  } else {
                      p2.push(bytes[i]);
                  }
              }
              // Lua function interleaves byte values from two tables, puts in a new table, unpacks.
              output = `loadstring((function(a,b)local bytes={}local maxLen=math.max(#a,#b)for i=1,maxLen do if a[i]then table.insert(bytes,a[i])end if b[i]then table.insert(bytes,b[i])end end return string.char(unpack(bytes)) end)({${p1.join(',')}},{${p2.join(',')}}))()`;
          } else if (method === "prime") {
               const pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]; // Primes
               let t = []; // Paired values (byte * prime, prime)
               for (let i = 0; i < bytes.length; i++) {
                   const byte = bytes[i];
                   const prime = pr[i % pr.length];
                   t.push(byte * prime);
                   t.push(prime);
               }
               // Lua function iterates through pairs, calculates byte value (integer division), puts in table, unpacks.
               output = `loadstring((function(t)local bytes={}for i=1,#t,2 do table.insert(bytes, math.floor(t[i]/t[i+1]))end return string.char(unpack(bytes)) end)({${t.join(',')}}))()`;
           } else if (method === "offset") {
               const of = 5; // Fixed offset value
               let t = []; // Offsetted byte values
               for (const byte of bytes) {
                   t.push(byte + of);
               }
               // Lua function receives offsetted byte values, subtracts offset, puts in table, unpacks.
               output = `loadstring((function(codes, offset) local bytes = {}; for i = 1, #codes do table.insert(bytes, codes[i] - offset) end return string.char(unpack(bytes)) end)({${t.join(',')}}, ${of}))()`;
           } else if (method === "multiply") {
               const mu = 2; // Fixed multiplier value
               let t = []; // Multiplied byte values
               for (const byte of bytes) {
                   t.push(byte * mu);
               }
               // Lua function receives multiplied byte values, performs integer division, puts in table, unpacks.
               output = `loadstring((function(codes, multiplier) local bytes = {}; for i = 1, #codes do table.insert(bytes, math.floor(codes[i] / multiplier)) end return string.char(unpack(bytes)) end)({${t.join(',')}}, ${mu}))()`;
           } else if (method === "random_offset") {
                const ov = getRandomInt(1000, 10000); // Random offset value
                let t = []; // Offsetted byte values
                for (const byte of bytes) {
                    t.push(byte + ov);
                }
                // Lua function receives offsetted byte values, subtracts offset, puts in table, unpacks.
                output = `loadstring((function(codes, offset) local bytes = {}; for i = 1, #codes do table.insert(bytes, codes[i] - offset) end return string.char(unpack(bytes)) end)({${t.join(',')}}, ${ov}))()`;
           } else if (method === "random_multiply") {
                let mv;
                do { mv = getRandomInt(1000, 10000); } while (mv === 0 || mv === 1); // Random multiplier value (not 0 or 1)
                let t = []; // Multiplied byte values
                for (const byte of bytes) {
                    t.push(byte * mv);
                }
                // Lua function receives multiplied byte values, performs integer division, puts in table, unpacks.
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

     if (!inputText) {
        outputElement.textContent = output;
        outputElement.style.borderColor = "#4CAF50";
    }
    return output;
}

// --- Multi-Layer Functions (Use the adapted obfuscate) ---
// These functions chain the obfuscation steps. They should work correctly
// as long as each step produces a valid Lua loadstring that reconstructs
// the bytes, which are then fed as input to the next step.

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
    // Ensure methods used here are byte-compatible for reliability
    const steps = [
        { method: "random_offset", name: "Смещение (Рандом)" },
        // NOTE: Using "unicode" here might cause issues with non-ASCII
        // depending on Lua environment and the original input characters.
        // Consider replacing with a byte-based method like "hex" or "number".
        { method: "hex", name: "HEX" }, // Changed from unicode to hex for byte compatibility
        { method: "base3", name: "Base3" }
    ];
    let currentCode = input;
    let step = 0;

    function processNextStep() {
        if (step >= steps.length) {
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1";
            status.textContent = "Обфускация v1 завершена!";
            return;
        }
        const currentMethod = steps[step];
        status.textContent = `v1 Шаг ${step + 1}/${steps.length}: ${currentMethod.name}`;
        const obfuscatedStep = obfuscate(currentMethod.method, currentCode); // Pass previous step's output as input

        if (obfuscatedStep === "" || obfuscatedStep.startsWith('--[[')) {
            status.textContent = `v1 Ошибка на шаге ${step + 1}. Прервано.`;
            btn.disabled = false;
            btn.classList.remove("processing");
            btn.textContent = "МНОГОСЛОЙНАЯ ОБФУСКАЦИЯ v1";
            outputElement.style.borderColor = "#ff9800";
            return;
        }
        currentCode = obfuscatedStep;
        outputElement.textContent = currentCode; // Update output field after each step
        outputElement.style.borderColor = "#4CAF50";
        step++;
        setTimeout(processNextStep, 500); // Small delay to see steps
    }
    processNextStep();
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
     // Ensure methods used here are byte-compatible for reliability
     const steps = [
         { method: "prime", name: "Простое число" },
         { method: "hex", name: "HEX" },
         { method: "random_multiply", name: "Умножение (Рандом)" },
         { method: "base4", name: "Base4" }
     ];
     let currentCode = input; let step = 0;
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
     // Ensure methods used here are byte-compatible for reliability
     const steps = [
         { method: "random_offset", name: "Смещение (Рандом)" },
         { method: "hex", name: "HEX" },
         { method: "base5", name: "Base5" },
         { method: "random_multiply", name: "Умножение (Рандом)" },
         { method: "binary", name: "Binary" }
     ];
     let currentCode = input; let step = 0;
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


// --- DEOBFUSCATION FUNCTION (Adapted for UTF-8 Bytes) ---
function deobfuscate() {
    const input = document.getElementById("input").value.trim();
    const outputElement = document.getElementById("output");

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
    let byteValues = null; // Use null initially, becomes an array of bytes (0-255) if successful

    try {
         // --- Attempt to extract byte values based on obfuscation patterns ---

         // Pattern 1: Number (loadstring(string.char(b1, b2, ...))())
         if (!deobfuscated) {
              const m = input.match(/loadstring\s*\(\s*string\.char\(([\d,\s]*)\)\)\(\)/s);
              if(m && m[1] !== undefined){
                  const s=m[1].trim();
                  const codes = (s==='')?[]:s.split(',').map(x=>Number(x.trim())).filter(n => !isNaN(n));
                  let tempByteValues = [];
                  let isValid = true;
                  codes.forEach(cd => {
                      if(cd >= 0 && cd <= 255) {
                           tempByteValues.push(cd);
                      } else {
                           console.warn(`Деобфускация string.char: Неверный байт (${cd}).`);
                           isValid = false;
                      }
                  });
                  if (isValid) { byteValues = tempByteValues; deobfuscated = true; }
              }
         }

         // Pattern 2: BaseN (loadstring((function() ... local data="..." ... tonumber(data:sub(...), base) ... string.char(unpack(bytes)) end)())())
         const baseMethods = [
             {b:3, len: 6}, // 6 digits for base 3 (0-255)
             {b:2, len: 8}, // 8 digits for base 2 (0-255)
             {b:4, len: 4}, // 4 digits for base 4 (0-255)
             {b:5, len: 4}, // 4 digits for base 5 (0-255)
             {b:7, len: 3}, // 3 digits for base 7 (0-255)
             {b:8, len: 3}  // 3 digits for base 8 (0-255)
         ];
         for (const bm of baseMethods) {
              if (!deobfuscated) {
                   // Regex to find the pattern for BaseN (extracts the data string)
                   const basePattern = new RegExp(`loadstring\\s*\\(\\s*\\(function\\(\\).*?local data=["']([0-9]+)["'].*?tonumber\\(data:sub\\(i,\\s*i\\+${bm.len-1}\\),\\s*${bm.b}\\).*?string\\.char\\(unpack\\(bytes\\)\\).*?end\\)\\(\\)\\)`, 's');
                   const baseMatch = input.match(basePattern);

                   if (baseMatch && baseMatch[1] !== undefined) {
                       const baseStr = baseMatch[1]; // Extracted base-encoded string
                       if (baseStr.length % bm.len === 0) {
                           let tempByteValues = [];
                           let isValid = true;
                           for (let i = 0; i < baseStr.length; i += bm.len) {
                               const chunk = baseStr.substr(i, bm.len);
                               const byteValue = parseInt(chunk, bm.b); // Decode chunk to byte value
                                if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) {
                                    tempByteValues.push(byteValue);
                                } else {
                                     console.warn(`Деобфускация Base${bm.b}: Неверный или внедиапазонный байт (${byteValue}) из чанка "${chunk}".`);
                                     isValid = false;
                                     break;
                                }
                           }
                           if (isValid) { byteValues = tempByteValues; deobfuscated = true; }
                       }
                   }
              }
         }

         // Pattern 3: Interleave (loadstring((function(a,b)...string.char(unpack(bytes)) end)({p1},{p2}))())
         if (!deobfuscated) {
              const interleavePattern = /loadstring\s*\(\s*\(function\(a,b\).*?local bytes={}.*?table\.insert\(bytes,a\[i]\).*?table\.insert\(bytes,b\[i]\).*?return string\.char\(unpack\(bytes\)\) end\)\(\s*\{([\d,\s]*)\}\s*,\s*\{([\d,\s]*)\}\s*\)\)\(\)/s;
              const interleaveMatch = input.match(interleavePattern);
              if (interleaveMatch && interleaveMatch[1] !== undefined && interleaveMatch[2] !== undefined) {
                   const s1 = interleaveMatch[1].trim();
                   const s2 = interleaveMatch[2].trim();
                   // Parse arrays, filtering for valid byte values
                   const a1 = (s1 === '') ? [] : s1.split(',').map(x => Number(x.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 255);
                   const a2 = (s2 === '') ? [] : s2.split(',').map(x => Number(x.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 255);

                   let tempByteValues = [];
                   for (let i = 0; i < Math.max(a1.length, a2.length); i++) {
                       if (i < a1.length) tempByteValues.push(a1[i]);
                       if (i < a2.length) tempByteValues.push(a2[i]);
                   }
                   byteValues = tempByteValues;
                   deobfuscated = true;
              }
         }

         // Pattern 4: Prime (loadstring((function(t)...math.floor(t[i]/t[i+1])...string.char(unpack(bytes)) end)({pairs}))())
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
                              const byteValue = Math.floor(v / p); // Integer division
                              if (byteValue >= 0 && byteValue <= 255) {
                                  tempByteValues.push(byteValue);
                              } else {
                                   console.warn(`Деобфускация Простое число: Получен байт вне диапазона 0-255 (${byteValue}).`);
                                   isValid = false;
                                   break;
                              }
                          } else {
                               throw new Error(`Деобфускация Простое число: Неверные числа (${v}, ${p}).`);
                          }
                      }
                       if (isValid) { byteValues = tempByteValues; deobfuscated = true; }
                   }
              }
         }

         // Pattern 5: Offset/Multiply/Random Offset/Random Multiply (Function with codes, value, and unpack(bytes))
         // loadstring((function(codes, val) local bytes = {}; for ... bytes.push(codes[i] OP val); return string.char(unpack(bytes)) end)({codes}, val))()
          if (!deobfuscated) {
              // Capture the operation symbol ([-/]) and the value (digits)
              const mathOpPattern = /loadstring\s*\(\s*\(function\(codes,\s*(\w+)\)\s*local bytes = {};\s*for i = 1, #codes do\s*table\.insert\(bytes,\s*codes\[i\]\s*([+\-*/%])\s*\1\)\s*end\s*return string\.char\(unpack\(bytes\)\)\s*end\)\(\s*\{([\d,\s]*)\}\s*,\s*(\d+)\s*\)\)\(\)/s;
              const mathOpMatch = input.match(mathOpPattern);

              if (mathOpMatch) {
                  const operation = mathOpMatch[2]; // e.g., "+", "-", "*", "/"
                  const codesStr = mathOpMatch[3].trim();
                  const value = parseInt(mathOpMatch[4]);

                  const initialCodes = (codesStr === '') ? [] : codesStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

                   let tempByteValues = [];
                   let isValid = true;

                   if (!isNaN(value)) {
                       for (let i = 0; i < initialCodes.length; ++i) {
                           let code = initialCodes[i];
                           let byteValue = NaN; // Use NaN to indicate not calculated/invalid

                           if (operation === "-") { // Offset or Random Offset (Lua was byte + offset, JS undoes offset)
                                byteValue = code - value;
                           } else if (operation === "/") { // Multiply or Random Multiply (Lua was byte * multiplier, JS undoes division)
                                if (value !== 0) byteValue = Math.floor(code / value); // Use floor as Lua uses //
                                else { isValid = false; throw new Error("Делитель 0 при деобфускации (Умножение/Смещение)."); }
                           } else {
                                // If the regex matched but the operation isn't - or /, it's unexpected
                                console.warn(`Деобфускация (Мат. операция): Неизвестная операция "${operation}".`);
                                isValid = false;
                                break; // Stop processing
                           }

                           // Validate the resulting byte value
                            if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) {
                                 tempByteValues.push(byteValue);
                            } else {
                                 console.warn(`Деобфускация (Мат. операция): Получен байт вне диапазона 0-255 (${byteValue}) из кода ${code} и значения ${value}.`);
                                 isValid = false;
                                 break; // Stop processing
                            }
                       }
                   } else {
                        console.warn("Деобфускация (Мат. операция): Неверное значение для операции.");
                        isValid = false;
                   }

                   if (isValid) { byteValues = tempByteValues; deobfuscated = true; }
              }
          }


         // Pattern 6: ASCII (loadstring("\d\d\d...\d\d\d")()) - Manual parsing for bytes
         if (!deobfuscated) {
              const m = input.match(/loadstring\s*\(\s*["']((?:\\\d{1,3})+)"'\s*\)\(\)/s);
              if (m && m[1]) {
                 const escapedString = m[1]; // Extracted escaped string
                 let tempByteValues = [];
                 let i = 0;
                 let isValid = true;
                 while (i < escapedString.length) {
                     if (escapedString[i] === '\\' && i + 1 < escapedString.length) {
                         const digitMatch = escapedString.substring(i + 1).match(/^\d{1,3}/); // Match 1 to 3 digits after '\'
                         if (digitMatch) {
                             const byteValue = parseInt(digitMatch[0], 10); // Parse as decimal byte value
                             if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) {
                                 tempByteValues.push(byteValue);
                                 i += 1 + digitMatch[0].length; // Move past '\' and digits
                                 continue;
                             }
                         }
                     }
                     // If we reach here, it's not a valid \ddd escape or not a backslash
                     console.warn(`Деобфускация ASCII: Неожиданный символ или последовательность в экранированной строке: "${escapedString.substring(i, i+5)}..."`);
                     isValid = false; break; // Mark as invalid and stop
                 }

                 if (isValid) { byteValues = tempByteValues; deobfuscated = true; }
              }
         }

         // Pattern 7: HEX (loadstring("\xHH...\xHH")()) - Manual parsing for bytes
         if (!deobfuscated) {
              const m = input.match(/loadstring\s*\(\s*["']((?:\\x[0-9a-fA-F]{2})+)["']\s*\)\(\)/s);
              if (m && m[1]) {
                  const escapedString = m[1]; // Extracted escaped string
                  let tempByteValues = [];
                  let i = 0;
                  let isValid = true;
                  while (i < escapedString.length) {
                      // Check for \x followed by two hex digits
                      if (escapedString[i] === '\\' && escapedString[i+1] === 'x' && i + 3 < escapedString.length) {
                           const hex = escapedString.substring(i + 2, i + 4);
                           if (/^[0-9a-fA-F]{2}$/.test(hex)) {
                                const byteValue = parseInt(hex, 16); // Parse as hexadecimal byte value
                                if (!isNaN(byteValue) && byteValue >= 0 && byteValue <= 255) {
                                     tempByteValues.push(byteValue);
                                     i += 4; // Move past \xHH
                                     continue;
                                }
                           }
                      }
                      // If we reach here, it's not a valid \xHH escape or not a backslash
                      console.warn(`Деобфускация HEX: Неожиданный символ или последовательность в экранированной строке: "${escapedString.substring(i, i+5)}..."`);
                      isValid = false; break; // Mark as invalid and stop
                  }

                  if (isValid) { byteValues = tempByteValues; deobfuscated = true; }
              }
         }

         // Pattern 8: Unicode (loadstring("\u{...}...\u{...}")()) - Keep existing logic for now
         // This method does NOT produce a byteValues array. It uses JS string unescaping
         // which might not perfectly match Lua's byte-level string construction for
         // non-ASCII chars encoded this way. Using byte-based methods is more reliable.
         if (!deobfuscated && input.includes("\\u{")) {
             let m = input.match(/loadstring\s*\(\s*["']((?:\\u\{[0-9a-fA-F]+\})+)"'\s*\)/);
              if (!m) { // Also check for single quotes
                 m = input.match(/loadstring\s*\(\s*[']((?:\\u\{[0-9a-fA-F]+\})+)'\s*\)/);
             }
             if(m && m[1]){
                 try {
                     // Use JS replace with String.fromCharCode to interpret \u{} escapes
                     // This returns a JS string which might contain multi-byte UTF-16 sequences
                     // representing the original characters. This bypasses the byteValues -> TextDecoder step.
                     output = m[1].replace(/\\u\{([0-9a-fA-F]+)\}/g,(x,c)=>{
                         const charCode = parseInt(c,16); // Get code point
                         if (!isNaN(charCode)) return String.fromCharCode(charCode); // Convert code point to JS string part
                         // If parsing fails, assume invalid input for this method
                         throw new Error(`Деобфускация Unicode: Неверный код (${c}).`);
                     });
                     deobfuscated = true; // Mark as deobfuscated if replace worked without error
                 } catch (e) {
                     console.error("Деобфускация Unicode (String.fromCharCode):", e);
                      // If String.fromCharCode fails or code point is invalid, it throws.
                      // 'deobfuscated' remains false, allowing fallback.
                 }
             }
         }

         // Fallback: Attempt to extract simple string literal (less reliable for escaped non-ASCII)
         // This fallback is less reliable for non-ASCII characters if they were escaped
         // in a way that JS string literals don't automatically handle to produce
         // the correct UTF-16 string that maps to the original UTF-8 bytes.
         // However, for simple ASCII strings or cases where non-ASCII chars weren't escaped, it might work.
         // We will NOT attempt to re-encode this fallback string as bytes, as it's ambiguous.
         // We just take the JS string result after standard JS string literal interpretation.
         if (!deobfuscated) {
              const m = input.match(/loadstring\(\s*["'](.*?)["']\s*\)\(\)/s); // Capture content inside quotes
              if (m && m[1] !== undefined) {
                   // The captured string content will have standard JS string literal escapes processed
                   // e.g., \\ becomes \, \n becomes newline, \" becomes ".
                   // \xHH and \u{...} might also be processed by JS depending on strictness/context,
                   // but relying on this is fragile. The specific pattern matchers above are better.
                   output = m[1]; // Take the raw string content from the match group
                   console.warn("Fallback: извлечена строка из loadstring. Деобфускация может быть неполной или неточной для сложных экранирований.");
                   deobfuscated = true; // Mark as deobfuscated, even if potentially incomplete
              }
         }


         // --- Decode bytes using TextDecoder if byteValues were collected ---
         // This step is skipped if the Unicode method or Fallback method was successful,
         // as they directly produced the 'output' string.
         if (deobfuscated && byteValues !== null) { // Check if byteValues was successfully populated by a byte-based method
             if (byteValues.length > 0) {
                 try {
                     const decoder = new TextDecoder('utf-8'); // Decode the byte array as UTF-8
                     output = decoder.decode(new Uint8Array(byteValues));
                 } catch (decodeError) {
                     console.error("Deobfuscation (TextDecoder):", decodeError);
                     output = `Ошибка деобфускации (декодирование UTF-8): ${decodeError.message}`;
                     outputElement.style.borderColor = "#ff9800";
                     deobfuscated = false; // Mark as failed if decoding fails
                 }
             } else { // byteValues is an empty array (e.g., from empty input)
                 output = ""; // Successfully deobfuscated to an empty string
             }
         }


         // --- Final Status/Error Handling ---
         if (!deobfuscated) {
              // If output was set by a failed step (like Unicode error), keep it. Otherwise, use default.
              output = output || "Не удалось распознать тип обфускации.";
              outputElement.textContent = output; // Ensure error message is displayed
              outputElement.style.borderColor = "#ff9800";
         } else if (output === "" && input !== "") {
             // Successfully deobfuscated, but result is empty while input was not.
             // This might be valid for some inputs, but could also indicate an issue.
             output = "Код деобфусцирован, но результат пуст (возможно, был пустой код после обфускации или проблема в данных).";
              outputElement.textContent = output; // Display warning message
              outputElement.style.borderColor = "#ff9800"; // Use warning color
         } else if (output !== "" && !output.startsWith('Ошибка') && !output.startsWith('Не удалось')) {
             // Successfully deobfuscated and got non-empty result.
              outputElement.textContent = output; // Display success result
              outputElement.style.borderColor = "#4CAF50"; // Success color
         }
         // If output was set by Unicode method successfully, it falls through to here.
         // If output was set by Fallback successfully, it also falls through here.


    } catch (e) {
         console.error("Deobfuscation error:", e);
         output = `Ошибка деобфускации: ${e.message}`;
         outputElement.textContent = output; // Ensure error message is displayed
         outputElement.style.borderColor = "#ff9800";
    }
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
         const btn = document.querySelector("#codeObfuscator .copy-btn");
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
              const btn = document.querySelector("#codeObfuscator .copy-btn");
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


// --- URL Obfuscator Functions (Adapted for UTF-8 Bytes in URL Path/Query) ---

function encodeUrl() {
    const url = document.getElementById('urlInput').value.trim();
    const urlOutputContainer = document.getElementById('urlOutputContainer');

    if (!url) {
        alert("Please enter a URL first");
        urlOutputContainer.innerHTML = ''; // Clear previous results
        return;
    }

    // Define characters that are safe *in the path and query* and are single-byte ASCII
    // based on typical URL encoding conventions.
    const safeChars = new Set(['/', '=', '+', '-', '_', '~', ':', '.', '?', '&']);

    let result = "";
    let baseUrl = "";
    let pathAndQuery = "";

    // Attempt to split URL into base (scheme://host[:port]) and path/query
    const urlMatch = url.match(/^([a-zA-Z]+:\/\/[^\/]+)(\/.*)?$/);
    if (urlMatch) {
        baseUrl = urlMatch[1];
        pathAndQuery = urlMatch[2] || "";
        result += baseUrl; // Add base URL as-is (hostnames don't use percent encoding for non-ASCII usually)
    } else {
         // If it doesn't match scheme://host, treat the whole thing as potentially needing encoding.
         // This is less common for game:HttpGet, but safer than failing.
         pathAndQuery = url;
         console.warn("URL does not match standard scheme://host pattern. Attempting to encode the whole string except scheme/first part.");
         // If there's no scheme://host, maybe the user just entered a path? Or an invalid URL?
         // Let's just put the original string in result and encode the whole thing for safety if no scheme found.
         result = ""; // Reset result, will rebuild from encoded pathAndQuery
         pathAndQuery = url; // Encode the full input
    }


    const encoder = new TextEncoder();
    const pathAndQueryBytes = encoder.encode(pathAndQuery); // Get UTF-8 bytes for the part to encode

    for (const byte of pathAndQueryBytes) {
        const char = String.fromCharCode(byte); // Convert byte back to a char (will be 0-255)

        // Check if the byte corresponds to a safe character (and is ASCII)
        if (byte >= 0 && byte <= 127 && safeChars.has(char)) {
             result += char; // Append the safe character
         } else {
            // Encode the byte as %HH (e.g., a Cyrillic byte like 208 (D0) becomes %D0)
            result += "%" + byte.toString(16).toUpperCase().padStart(2, '0');
        }
    }

    const loadstringCode = `loadstring(game:HttpGet("${result}"))()`;

    // Display results with professional formatting
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
    const textarea = document.getElementById('urlLuaCode');
    if (!textarea) {
         alert("No code to copy.");
         return;
    }

    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
         const btn = document.querySelector('#urlObfuscator .copy-btn');
         const originalText = btn.textContent;
         const originalBg = btn.style.backgroundColor; // Store original color
         btn.textContent = "COPIED!";
         btn.style.backgroundColor = "#4CAF50"; // Green feedback color
         if (document.body.classList.contains('dark-theme')) {
             btn.style.backgroundColor = "#2e7d32"; // Dark theme green
         }
         setTimeout(() => {
             btn.textContent = originalText;
             btn.style.backgroundColor = originalBg; // Reset to original color
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

 // Trigger URL encoding on Enter key press in the URL input field
 document.getElementById('urlInput').addEventListener('keypress', function(event) {
     if (event.key === 'Enter') {
         event.preventDefault(); // Prevent default form submission behavior
         encodeUrl(); // Call the encode function
     }
 });
