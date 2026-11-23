/* =========================================================
   Lecture 07 — 編譯、記憶體與參數傳遞
   From Source Code to Execution: Compilation, Memory, and Parameter Passing
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const hex = (n, w = 4) => '0x' + n.toString(16).toUpperCase().padStart(w, '0');

  /** monospace listing (assembly / hex dump) — `;` starts a comment */
  function plain(text, opts = {}) {
    return (
      `<pre class="code code--plain${opts.cls ? ' ' + opts.cls : ''}"${opts.title ? ` data-title="${C.esc(opts.title)}"` : ''}>` +
      text
        .split('\n')
        .map((l) => {
          const i = l.indexOf(';');
          let h = i >= 0 ? C.esc(l.slice(0, i)) + `<span class="tk-com">${C.esc(l.slice(i))}</span>` : C.esc(l);
          if (opts.mark) h = h.replace(opts.mark, (m) => `<span class="tk-esc">${m}</span>`);
          return `<span class="line">${h || ' '}</span>`;
        })
        .join('') +
      '</pre>'
    );
  }

  /* ---------------------------------------------------------
     Source snippets
     --------------------------------------------------------- */
  const HELLO = `#include <stdio.h>

int main()
{
    printf("Hello World!\\n");
    return 0;
}`;

  const ASM = `main:                     ; 組合語言（x86-64，示意）
    push   rbp              ; 建立 main 的堆疊框
    mov    rbp, rsp
    lea    rcx, [msg]       ; 把字串的位址當作參數
    call   printf           ; 呼叫 printf —— 位址還不知道！
    mov    eax, 0           ; return 0
    pop    rbp
    ret
msg:
    .string "Hello World!\\n"`;

  const HEXDUMP = `.text 區段（機器碼，示意）
0000  55 48 89 e5 48 8d 0d 00 00 00 00 e8 00 00 00 00
0010  b8 00 00 00 00 5d c3
符號表（symbol table）
  main     已定義   .text + 0x0000
  printf   未定義   UND   ; 等連結器補上真正位址`;

  const STARTUP = `_start:                   ; 啟動碼 Startup code（示意）
    設定堆疊、初始化全域變數
    準備 argc / argv
    call   main             ; 這時才進入 main()
    call   exit             ; 把 main 的回傳值交給作業系統

printf:                   ; 函式庫碼 Library code（已編譯好的機器碼）
    解析格式字串 → 轉換數字 → 寫到螢幕`;

  const LINKED = `連結前（Hello.o）          連結後（Hello.exe）
call printf                 call printf
e8 00 00 00 00      ──▶     e8 1b 15 00 00
(位址未知 UND)              (跳到 printf @ 0x00401530)

Hello.o ┐
Library ├──▶ 打包、組合、位址重定 (relocation) ──▶ Hello.exe
Startup ┘`;

  const VALUE_SRC = `#include <stdio.h>

void foo(int x) {
    x = 100;  // 只改到 x 的副本
}

int main() {
    int a = 10;
    foo(a);
    // a 還是 10
}`;

  const REF_SRC = `#include <stdio.h>

void foo(int *p) {
    *p = 100;  // 透過位址，直接改到 main 的 a
}

int main() {
    int a = 10;
    foo(&a);
    // a 變成 100
}`;

  const ARRAY_SRC = `#include <stdio.h>

void modifyArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        arr[i] = arr[i] * 10;  // 修改原陣列元素
    }
}

int main() {
    int data[5] = {1, 2, 3, 4, 5};

    printf("Before modification: ");
    for (int i = 0; i < 5; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");

    // 傳入陣列名稱，實際傳入指標 (call by reference)
    modifyArray(data, 5);

    printf("After modification: ");
    for (int i = 0; i < 5; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");

    return 0;
}`;

  const LAYOUT_SRC = `#include <stdio.h>
#include <stdlib.h>

int g = 5;            // 全域變數（有初始值）
static int s;         // 靜態變數（沒有初始值）

void helper(int n) {
    int local = n * 2;    // helper 的區域變數
}

int main() {
    int a = 10;                          // 區域變數
    static int cnt = 0;                  // 靜態區域變數
    int *p = malloc(4 * sizeof(int));    // p 在 stack，區塊在 heap
    helper(a);                           // 呼叫函式：堆疊長出新的框
    free(p);                             // 歸還 heap 區塊
    return 0;
}`;

  /* ---------------------------------------------------------
     Section 1 data — pipeline
     --------------------------------------------------------- */
  const PIPE = [
    { k: 'editor', label: 'Text Editor', small: '文字編輯器', type: 'tool' },
    { k: 'src', label: 'Hello.c', small: '原始碼 Source Code', type: 'file' },
    { k: 'cc', label: 'Compiler + Assembler', small: '編譯器＋組譯器', type: 'tool' },
    { k: 'obj', label: 'Hello.o', small: '目的碼 Object Code', type: 'file' },
    { k: 'lib', label: 'Library + Startup', small: '函式庫碼＋啟動碼', type: 'file' },
    { k: 'ld', label: 'Linker', small: '連結器', type: 'tool' },
    { k: 'exe', label: 'Hello.exe', small: '可執行檔 Executable', type: 'file' },
  ];
  const PEEK = {
    editor: {
      title: '① Text Editor（文字編輯器）',
      desc: '開發者使用文字編輯器（如 VS Code、Dev-C++）撰寫 C 程式碼。這一步只是在「打字」，產物是一個純文字檔。',
      body: () => C.code(HELLO) + '<p class="caption">存檔後就得到 <code>Hello.c</code>。</p>',
    },
    src: {
      title: '② Source Code（原始碼）Hello.c',
      desc: '人類可讀的 C 語言程式碼，包含變數、函式、邏輯等。CPU 看不懂這些英文字母和符號，必須經過翻譯。',
      body: () =>
        `<dl class="kv"><div><dt>檔案類型</dt><dd>純文字</dd></div><div><dt>誰看得懂</dt><dd>人類</dd></div><div class="is-hi"><dt>CPU 能直接執行嗎</dt><dd>不能</dd></div></dl>`,
    },
    cc: {
      title: '③ Compiler + Assembler（編譯器＋組譯器）',
      desc: '編譯器先把高階的 C 程式碼翻譯成組合語言（assembly）；組譯器再把組合語言翻譯成機器碼（0 和 1），產生目的檔案。',
      body: () =>
        plain(ASM, { mark: /call\s+printf/ }) +
        `<p class="caption">組譯器把每一條指令變成位元組，例如 <code>push rbp</code> → <code>0x55</code> → <code>0101 0101</code>。（組合語言為示意，實際內容依編譯器與平台而異）</p>`,
    },
    obj: {
      title: '④ Object Code（目的碼）Hello.o',
      desc: '編譯後的機器碼，但還不能直接執行：程式裡呼叫的 printf 並不在這個檔案裡，它的位址還是空的（00 00 00 00）。',
      body: () => plain(HEXDUMP, { mark: /e8 00 00 00 00|printf\s+未定義\s+UND/g }),
    },
    lib: {
      title: '⑤ Library code ＋ Startup code',
      desc: 'Library code：系統提供的標準函式庫（如 stdio.h 宣告的 printf 的實作）。Startup code：程式啟動時必需的初始化程式碼，負責在進入 main() 之前準備好環境。',
      body: () => plain(STARTUP),
    },
    ld: {
      title: '⑥ Linker（連結器）',
      desc: '連結器把目的碼、函式庫程式碼、啟動程式碼全部連結在一起，並找到所有外部函式（例如 printf）的實際位置，把空著的位址補上。',
      body: () => plain(LINKED, { mark: /e8 1b 15 00 00|0x00401530/g }),
    },
    exe: {
      title: '⑦ Executable Code（可執行檔）Hello.exe',
      desc: '最終的可執行檔是完整的 0 和 1 二進位碼。作業系統把它載入記憶體，CPU 逐條執行指令，碰到呼叫指令就跳到 printf，進行格式化、輸出。',
      body: () =>
        `<div class="console" data-title="終端機"><span class="dim">C:\\&gt; </span><span class="in">Hello.exe</span>\nHello World!\n<span class="dim">C:\\&gt; </span><span class="cursor"></span></div>`,
    },
  };

  function pipeFlow() {
    const node = (p, i) =>
      `<button type="button" class="flow-node flow-node--${p.type}" data-step="${i}" data-k="${p.k}">${p.label}<small>${p.small}</small></button>`;
    const main = [0, 1, 2, 3, 5, 6];
    return (
      `<div class="flow l7-pipe-flow">` +
      main.map((i, j) => (j ? '<div class="flow-arrow" data-to="' + i + '"></div>' : '') + node(PIPE[i], i)).join('') +
      `</div><div class="l7-side">${node(PIPE[4], 4)}<span class="l7-side-note">⤴ 與 Hello.o 一起送進 <b>Linker</b></span></div>`
    );
  }

  /* ---------------------------------------------------------
     Section 3 data — CPU
     --------------------------------------------------------- */
  const PROGRAM = [
    { asm: 'MOV R1, 6', c: '準備第一個數 6' },
    { asm: 'MOV R2, 8', c: '準備第二個數 8' },
    { asm: 'ADD R1, R2', c: 'R1 = R1 + R2' },
    { asm: 'STORE R1, [0x20]', c: 'result = R1' },
    { asm: 'HALT', c: '程式結束' },
  ];
  function cpuStates() {
    const s = { pc: 0, ir: '—', r1: '—', r2: '—', mem20: '?', alu: '待命', cu: '待命', phase: 'load', act: [], memHi: null };
    const out = [
      Object.assign({}, s, {
        act: ['mem'],
        msg: '① 程式碼載入：編譯好的機器碼已經放進記憶體（位址 0x00 ~ 0x04），資料 result 放在 0x20。PC 指向第一條指令 0x00。',
      }),
    ];
    for (let pc = 0; pc < PROGRAM.length; pc++) {
      const ins = PROGRAM[pc].asm;
      s.pc = pc;
      // fetch
      s.ir = ins;
      s.phase = 'fetch';
      s.alu = '待命';
      s.cu = '待命';
      out.push(
        Object.assign({}, s, {
          act: ['pc', 'ir', 'mem'],
          memHi: pc,
          msg: `② 取指（Fetch）：依照 PC = ${hex(pc, 2)}，從記憶體抓出指令「${ins}」放進指令暫存器 IR。`,
        })
      );
      // decode
      s.phase = 'decode';
      const what = {
        0: '把常數 6 搬進暫存器 R1',
        1: '把常數 8 搬進暫存器 R2',
        2: '請 ALU 把 R1 和 R2 相加，結果寫回 R1',
        3: '把 R1 的值寫回記憶體位址 0x20（變數 result）',
        4: '這是停止指令，程式到此結束',
      }[pc];
      s.cu = what;
      out.push(Object.assign({}, s, { act: ['cu', 'ir'], msg: `③ 解碼（Decode）：控制單元 CU 解讀「${ins}」→ ${what}。` }));
      // execute
      s.phase = 'exec';
      const st = Object.assign({}, s, { act: [], memHi: null });
      if (pc === 0) {
        s.r1 = 6;
        st.act = ['r1'];
        st.msg = '④ 執行（Execute）：R1 ← 6。';
      } else if (pc === 1) {
        s.r2 = 8;
        st.act = ['r2'];
        st.msg = '④ 執行（Execute）：R2 ← 8。';
      } else if (pc === 2) {
        s.alu = '6 + 8 = 14';
        s.r1 = 14;
        st.act = ['alu', 'r1', 'r2'];
        st.msg = '④ 執行（Execute）：算術邏輯單元 ALU 完成 6 + 8 = 14，結果寫回暫存器 R1。';
      } else if (pc === 3) {
        s.alu = '待命';
        s.mem20 = 14;
        st.act = ['r1', 'mem'];
        st.memHi = 'd';
        st.msg = '④ 執行（Execute）：把 R1 的 14 寫回記憶體 0x20 —— 就像 C 的 result = add(6, 8);';
      } else {
        st.act = ['cu'];
        st.msg = '④ 執行：HALT，程式結束。這個「取指 → 解碼 → 執行」的循環會一直重複，直到程式結束為止。';
      }
      Object.assign(st, { r1: s.r1, r2: s.r2, mem20: s.mem20, alu: s.alu });
      if (pc < 4) st.msg += ` ⑤ 程式計數器更新：PC → ${hex(pc + 1, 2)}，回到取指。`;
      st.pcNext = pc < 4 ? pc + 1 : pc;
      out.push(st);
      s.pc = st.pcNext;
    }
    return out;
  }

  /* ---------------------------------------------------------
     Section 6 data — type sizes
     --------------------------------------------------------- */
  const TYPES = [
    { t: 'char', b: 1, range: '-128 ~ 127（signed）／0 ~ 255（unsigned）', note: '本質上是 1 byte 的整數，常用來存 ASCII 字元。' },
    { t: 'short', b: 2, range: '-32,768 ~ 32,767／0 ~ 65,535', note: '短整數，省空間但範圍小。' },
    { t: 'int', b: 4, range: '-2,147,483,648 ~ 2,147,483,647', note: '最常用的整數型態。' },
    { t: 'unsigned int', b: 4, range: '0 ~ 4,294,967,295', note: '無號整數：不存負數，所以正數範圍加倍。' },
    { t: 'long', b: 4, range: '-2,147,483,648 ~ 2,147,483,647', note: 'Windows（MinGW / MSVC）上為 4 bytes；64 位元 Linux / macOS 上為 8 bytes。' },
    { t: 'long long', b: 8, range: '約 ±9.22 × 10¹⁸', note: '保證至少 64 位元。' },
    { t: 'float', b: 4, range: '約 ±3.4 × 10³⁸', note: '單精度浮點數，精度約 7 位數字。' },
    { t: 'double', b: 8, range: '約 ±1.7 × 10³⁰⁸', note: '雙精度浮點數，精度約 15~16 位數字。' },
    { t: 'long double', b: 16, lo: 8, range: '約 ±1.1 × 10⁴⁹³²', note: '8 ~ 16 bytes（視編譯器而定），精度約 19 位以上。' },
  ];

  /* ---------------------------------------------------------
     Section 5 data — memory drawers
     --------------------------------------------------------- */
  const DECLS = {
    c: { name: 'c', type: 'char', size: 1, align: 1, c: '1', val: "'A'", decl: "char c = 'A';" },
    a: { name: 'a', type: 'int', size: 4, align: 4, c: '2', val: '10', decl: 'int a = 10;' },
    d: { name: 'd', type: 'double', size: 8, align: 8, c: '3', val: '3.14', decl: 'double d = 3.14;' },
    b: { name: 'b', type: 'int[5]', size: 20, align: 4, c: '4', val: '{1,2,3,4,5}', decl: 'int b[5] = {1, 2, 3, 4, 5};' },
  };
  const MEM_BASE = 0x1000;
  const MEM_N = 36;

  /* ---------------------------------------------------------
     CSS
     --------------------------------------------------------- */
  const css = `
.l7-side { display:flex; flex-wrap:wrap; align-items:center; gap: var(--s3); margin-top: calc(-1 * var(--s2)); }
.l7-side-note { font-size:.84rem; color: var(--muted); }
.l7-peek { border:1px solid var(--line-strong); border-radius: var(--r-lg); background: var(--surface); padding: var(--s4); }
.l7-peek h5 { margin:0 0 var(--s2); font-size:1rem; color: var(--ink); }
.l7-peek > p { margin:0 0 var(--s2); color: var(--ink-2); line-height:1.75; }
.l7-peek .code, .l7-peek .console, .l7-peek .kv { margin-bottom:0; }

.l7-race { display:grid; gap: var(--s4); }
.l7-lane { border:1px solid var(--line-strong); border-radius: var(--r-lg); padding: var(--s3) var(--s4); background: var(--surface); }
.l7-lane-head { display:flex; align-items:center; gap: var(--s2); flex-wrap:wrap; margin-bottom: var(--s2); }
.l7-lane-head strong { font-family: var(--font-mono); font-size:1.1rem; }
.l7-lane-head .badge { margin-left:auto; }
.l7-stages { display:flex; flex-wrap:wrap; gap:6px; margin-bottom: var(--s3); }
.l7-stages span { font-size:.78rem; padding:2px 10px; border-radius:99px; border:1px solid var(--line-strong); color: var(--muted); background: var(--surface-2); transition: background .15s, color .15s, border-color .15s; }
.l7-stages span.is-on { background: var(--hi); color: var(--ink); border-color: var(--accent-2); }
.l7-lane .bar-track { height: 16px; }
.l7-lane-foot { display:flex; justify-content:space-between; gap: var(--s3); margin-top: var(--s2); font-family: var(--font-mono); font-size:.8rem; color: var(--ink-2); }

.l7-cpu { display:grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: var(--s4); align-items:start; }
@container (max-width: 600px) { .l7-cpu { grid-template-columns: minmax(0,1fr); } }
.l7-box { border:1.5px solid var(--line-strong); border-radius: var(--r-lg); background: var(--surface); padding: var(--s3); transition: border-color .25s, box-shadow .25s; }
.l7-box > h5 { margin:0 0 var(--s2); font-size:.82rem; letter-spacing:.08em; color: var(--muted); font-weight:700; }
.l7-memrow { display:grid; grid-template-columns: 56px minmax(0,1fr); gap: var(--s2); align-items:center; padding:4px var(--s2); border-radius: var(--r-sm); font-family: var(--font-mono); font-size:.84rem; border:1px solid transparent; transition: background .25s, border-color .25s; }
.l7-memrow + .l7-memrow { margin-top:3px; }
.l7-memrow .addr { color: var(--muted); }
.l7-memrow.is-pc { border-color: var(--line-strong); }
.l7-memrow.is-pc .addr::after { content:" ◀PC"; color: var(--accent); font-weight:700; font-size:.7rem; }
.l7-memrow.is-hi { background: var(--hi); border-color: var(--accent-2); }
.l7-memrow.is-data { margin-top: var(--s3); border-top:1px dashed var(--line-strong); }
.l7-core { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--s2); }
.l7-reg, .l7-unit { border:1.5px solid var(--line); border-radius: var(--r-sm); padding: 6px var(--s3); background: var(--surface-2); transition: background .25s, border-color .25s, transform .25s; min-width:0; }
.l7-reg span, .l7-unit span { display:block; font-size:.72rem; color: var(--muted); font-weight:700; letter-spacing:.04em; }
.l7-reg b { font-family: var(--font-mono); font-size:1.05rem; color: var(--ink); overflow-wrap:anywhere; }
.l7-unit { grid-column: 1 / -1; }
.l7-unit p { margin:2px 0 0; font-size:.86rem; line-height:1.55; color: var(--ink); min-height:1.55em; }
.l7-reg.is-act, .l7-unit.is-act { background: var(--hi); border-color: var(--accent-2); transform: translateY(-1px); }
.l7-cycle { display:flex; flex-wrap:wrap; gap:6px; margin-bottom: var(--s3); }
.l7-cycle span { font-size:.8rem; font-weight:700; padding:3px 12px; border-radius:99px; border:1.5px solid var(--line-strong); color: var(--muted); }
.l7-cycle span.is-on { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }

.l7-trans { display:flex; flex-wrap:wrap; gap:5px; margin-top: calc(-1 * var(--s2)); }
.l7-tr { width:40px; display:flex; flex-direction:column; align-items:center; gap:2px; font-family: var(--font-mono); font-size:.62rem; color: var(--muted); }
.l7-tr i { width:22px; height:22px; border-radius:50%; border:2px solid var(--line-strong); background: var(--surface-2); transition: background .2s, box-shadow .2s, border-color .2s; }
.l7-tr.is-on i { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 0 12px color-mix(in srgb, var(--accent-2) 70%, transparent); }
.l7-tr.is-on { color: var(--accent-2); font-weight:700; }
@media (max-width: 420px) { .l7-tr { width:34px; } .l7-trans { gap:3px; } }

.l7-addrmap { display:flex; flex-wrap:wrap; align-items:center; gap: var(--s2); }
.l7-drawers { display:grid; grid-template-columns: repeat(12, minmax(38px, 1fr)); gap:4px; }
@container (max-width: 640px) { .l7-drawers { grid-template-columns: repeat(6, minmax(38px, 1fr)); } }
.l7-drawers .cell { min-width:0; min-height:50px; padding:2px; }
.l7-drawers .cell-val { font-size:.8rem; }
.l7-drawers .cell-idx, .l7-drawers .cell-sub { font-size:.58rem; }
.l7-drawers .cell.is-pad { opacity:.55; border-style:dashed; }
.l7-symtab button { font: inherit; color: inherit; background:none; border:0; padding:0; cursor:pointer; text-decoration: underline dotted; text-underline-offset:3px; }
.l7-symtab tr.is-hi td { background: var(--hi); }

.l7-sizes .bar-row { width:100%; background:none; border:0; padding:2px 0; color: inherit; font: inherit; font-family: var(--font-mono); font-size:.82rem; text-align:left; cursor:pointer; border-radius: var(--r-sm); }
.l7-sizes .bar-row:hover .bar-label { color: var(--accent); }
@media (pointer: coarse), (max-width: 640px) { .l7-sizes .bar-row { min-height: 36px; padding: 4px 0; } }
.l7-sizes { --label-w: 104px; --value-w: 64px; }
#l7-size-kv > div:nth-child(3) { grid-column: 1 / -1; }
#l7-size-kv dd { overflow-wrap: normal; word-break: normal; }

.l7-param { display:grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); gap: var(--s3); align-items:center; }
.l7-param-host { container-type: inline-size; }
@container (max-width: 380px) { .l7-param { grid-template-columns: minmax(0,1fr); } .l7-link { transform: rotate(90deg); justify-self:center; } }
.l7-frame { border:1.5px solid var(--line-strong); border-radius: var(--r-lg); padding: var(--s3); background: var(--surface); transition: opacity .3s, border-color .3s; }
.l7-frame.is-gone { opacity:.35; border-style:dashed; }
.l7-frame h5 { margin:0 0 var(--s2); font-family: var(--font-mono); font-size:.9rem; }
.l7-var { display:grid; grid-template-columns: auto 1fr; gap: 2px var(--s3); align-items:center; padding: var(--s2) var(--s3); border-radius: var(--r-sm); border:1.5px solid var(--line); background: var(--surface-2); font-family: var(--font-mono); transition: background .25s, border-color .25s; }
.l7-var .nm { font-weight:700; font-size:1.05rem; color: var(--ink); }
.l7-var .ad { font-size:.74rem; color: var(--muted); }
.l7-var .vl { grid-column: 1 / -1; font-size:1.3rem; font-weight:700; color: var(--accent); }
.l7-var.is-hi { background: var(--hi); border-color: var(--accent-2); }
.l7-link { font-family: var(--font-mono); font-size:.78rem; text-align:center; color: var(--muted); white-space:nowrap; }
.l7-link b { display:block; font-size:1.4rem; line-height:1; color: var(--line-strong); }
.l7-link.is-on { color: var(--accent-2); }
.l7-link.is-on b { color: var(--accent-2); }

.l7-arr { display:flex; flex-wrap:wrap; gap: var(--s3); align-items:flex-end; }
.l7-arr .cells { margin:0; }
.l7-ptr { font-family: var(--font-mono); font-size:.86rem; padding: var(--s2) var(--s3); border:1.5px dashed var(--line-strong); border-radius: var(--r-sm); color: var(--muted); transition: all .25s; }
.l7-ptr.is-on { border-style:solid; border-color: var(--accent); color: var(--ink); background: var(--accent-soft); }

.l7-layout { display:grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: var(--s4); align-items:start; }
@container (max-width: 680px) { .l7-layout { grid-template-columns: minmax(0,1fr); } }
.l7-layout .code .line[tabindex] { cursor:pointer; }
.l7-layout .code .line[tabindex]:hover { background: rgba(255,255,255,.06); }
.l7-mem { display:flex; flex-direction:column; border:2px solid var(--line-strong); border-radius: var(--r-lg); overflow:hidden; font-size:.84rem; }
.l7-mem-end { display:flex; justify-content:space-between; padding:2px var(--s3); font-family: var(--font-mono); font-size:.7rem; color: var(--muted); background: var(--surface-2); }
.l7-seg { padding: var(--s2) var(--s3); border-top:1px solid var(--line); background: var(--surface); transition: background .25s, box-shadow .25s; }
.l7-seg > header { display:flex; justify-content:space-between; gap: var(--s2); font-weight:700; color: var(--ink); }
.l7-seg > header small { font-weight:400; color: var(--muted); font-size:.74rem; text-align:right; }
.l7-seg.is-hi { background: var(--hi); box-shadow: inset 4px 0 0 var(--accent-2); }
.l7-seg-items { display:flex; flex-direction:column; gap:4px; margin-top:6px; }
.l7-seg[data-seg="heap"] .l7-seg-items { flex-direction:column-reverse; }
.l7-chip { display:flex; justify-content:space-between; gap: var(--s2); padding:3px var(--s2); border:1.5px solid var(--line-strong); border-radius: var(--r-sm); background: var(--surface-2); font-family: var(--font-mono); font-size:.78rem; transition: background .25s, border-color .25s; }
.l7-chip.is-hi { border-color: var(--accent-2); background: var(--hi); }
.l7-chip.is-new { animation: cell-pop .45s var(--ease); }
.l7-chip.is-freed { opacity:.5; border-style:dashed; text-decoration: line-through; }
.l7-chip.is-leak { border-color: var(--err); background: var(--err-soft); }
.l7-chip.is-frame { border-left:4px solid var(--accent); }
.l7-gap { padding: var(--s2) var(--s3); text-align:center; color: var(--muted); font-size:.76rem; border-top:1px dashed var(--line-strong); background: repeating-linear-gradient(-45deg, transparent 0 6px, color-mix(in srgb, var(--muted) 10%, transparent) 6px 7px); }
.cell[data-c="5"] { border-color: var(--c5); background: color-mix(in srgb, var(--c5) 14%, var(--surface)); }
.cell[data-c="6"] { border-color: var(--c6); background: color-mix(in srgb, var(--c6) 14%, var(--surface)); }
`;

  /* ---------------------------------------------------------
     Sections HTML
     --------------------------------------------------------- */
  function sections() {
    const s1 = C.section(
      'l7-pipeline',
      '01',
      '從原始碼到執行檔',
      C.prose(
        `<p>從撰寫程式碼到產生可執行檔，中間需要經過<strong>編譯</strong>、<strong>組譯</strong>與<strong>連結</strong>等階段。第 1 講我們看過簡化版的流程，這一講把「編譯器」拆開來看：它其實包含 <b>Compiler（編譯器）</b>與 <b>Assembler（組譯器）</b>兩個步驟。</p>
         <p>點下面任何一個節點，或用「下一步」照順序走，就能「放大」看到每個階段產出的東西長什麼樣子。</p>`
      ) +
        C.widget({
          id: 'l7-pipe',
          title: '編譯管線放大鏡',
          tag: '逐步',
          hint: '點擊節點直接跳到那個階段；下方面板會顯示該階段的產物。',
          body: pipeFlow() + `<div class="l7-peek" id="l7-peek" aria-live="polite"></div>`,
          controls: `<div id="l7-pipe-step"></div>`,
        }) +
        C.cards([
          { title: '編譯 Compile', body: '<p>C 編譯器把 <code>printf(...)</code> 翻譯成 CPU 能懂的指令，產生「呼叫 printf」的機器碼。</p>' },
          { title: '連結 Link', body: '<p>找到 C 標準函式庫中 printf 的位置，把這段機器碼放入可執行檔。</p>' },
          { title: '執行 Run', body: '<p>作業系統載入 .exe，CPU 逐條執行指令，碰到呼叫指令就跳到 printf，進行格式化、輸出。</p>' },
        ]) +
        C.callout(
          'key',
          '為什麼需要連結器？',
          '<p>Library code / Startup code 要和目的碼一起被 Linker 連結，才能找到所有外部函式（例如 <code>printf</code>）的實際位置，產生完整的可執行檔。</p>'
        )
    );

    const s2 = C.section(
      'l7-cvspy',
      '02',
      'C 與 Python 的比較',
      C.prose(
        `<p>同樣是「寫程式 → 執行」，Python 走的路和 C 很不一樣（補充）：</p>
         <ol>
           <li><b>編寫程式碼</b>：用文字編輯器（如 VS Code）編寫 <code>.py</code> 檔案。</li>
           <li><b>解析與語法檢查</b>：Python 直譯器讀取原始碼，進行「詞法分析」和「語法檢查」，有錯誤會直接回報。</li>
           <li><b>轉換為位元組碼（bytecode）</b>：語法正確時，把原始碼轉成更接近機器、但仍非真正 CPU 執行的位元組碼（<code>.pyc</code>）。</li>
           <li><b>由 Python 虛擬機（PVM）執行</b>：bytecode 交給 PVM 逐行解譯、執行。</li>
           <li><b>與作業系統互動</b>：PVM 執行時，必要時呼叫作業系統 API 進行輸入／輸出、網路等操作。</li>
         </ol>`
      ) +
        `<div class="card-grid">
          <div class="card"><span class="card-num">Py</span><h4>Python：直譯</h4><p>原始碼 → Bytecode → PVM 虛擬機解譯執行。逐條解譯、轉換為機器碼來執行，而不是一次性產生完整的機器碼檔案；每執行一條指令都需要解譯、轉換 ⇒ <b>速度較慢</b>。</p></div>
          <div class="card"><span class="card-num">C</span><h4>C / C++：編譯</h4><p>編譯階段就已經將程式全部直接翻譯成目標平台的機器碼；執行時 CPU 可以直接運行，不需要中間解譯層，硬體資源利用最佳化 ⇒ <b>速度快</b>。</p></div>
        </div>` +
        C.widget({
          id: 'l7-race',
          title: '編譯 vs 直譯 賽跑',
          tag: '示意動畫',
          hint: '兩邊執行同樣數量的指令。C 先花時間編譯一次，之後 CPU 直接跑；Python 每一條指令都要經過 PVM 解譯。（時間單位為示意，不是真實測量）',
          body: `<div class="l7-race">
            <div class="l7-lane" data-lane="c">
              <div class="l7-lane-head"><strong>C</strong><span class="muted">編譯式語言</span><span class="badge" id="l7-race-c-stat">待命</span></div>
              <div class="l7-stages" id="l7-race-c-st"><span data-st="compile">編譯＋組譯＋連結（只做一次）</span><span data-st="run">CPU 直接執行機器碼</span></div>
              <div class="bar-track"><div class="bar-fill" id="l7-race-c-bar" data-c="1" style="width:0%;background:var(--c1)"></div></div>
              <div class="l7-lane-foot"><span id="l7-race-c-count">0 條指令</span><span id="l7-race-c-time">時間 0</span></div>
            </div>
            <div class="l7-lane" data-lane="py">
              <div class="l7-lane-head"><strong>Python</strong><span class="muted">直譯式語言</span><span class="badge" id="l7-race-py-stat">待命</span></div>
              <div class="l7-stages" id="l7-race-py-st"><span data-st="parse">語法檢查 → bytecode</span><span data-st="fetch">取出 bytecode</span><span data-st="interp">PVM 解譯</span><span data-st="exec">執行</span></div>
              <div class="bar-track"><div class="bar-fill" id="l7-race-py-bar" style="width:0%;background:var(--c2)"></div></div>
              <div class="l7-lane-foot"><span id="l7-race-py-count">0 條指令</span><span id="l7-race-py-time">時間 0</span></div>
            </div>
          </div>
          <p class="feedback" id="l7-race-msg"></p>`,
          controls: `<button type="button" class="btn btn--primary" id="l7-race-run">▶ 開始賽跑</button>
            <button type="button" class="btn" id="l7-race-reset">⟲ 重設</button>
            <span class="spacer"></span>
            ${C.field('指令數 <output id="l7-race-n-out">30</output>', '<input type="range" id="l7-race-n" min="10" max="60" step="5" value="30">')}
            ${C.field('速度 <output id="l7-race-v-out">3</output>', '<input type="range" id="l7-race-v" min="1" max="5" value="3">')}`,
        })
    );

    const s3 = C.section(
      'l7-cpu',
      '03',
      'CPU 如何執行程式',
      C.prose(
        `<p>可執行檔被作業系統載入記憶體後，CPU 就照著下面的程序一條一條執行：</p>
         <ol>
           <li><b>程式碼載入</b>：人類寫的程式碼經編譯或直譯，轉成機器碼並儲存在記憶體中。</li>
           <li><b>取指（Fetch）</b>：CPU 依照<strong>程式計數器（PC, Program Counter）</strong>指定的位置，從記憶體抓取下一條指令。</li>
           <li><b>解碼（Decode）</b>：<strong>控制單元（CU, Control Unit）</strong>解讀指令內容，判斷需要執行的動作。</li>
           <li><b>執行（Execute）</b>：<strong>算術邏輯單元（ALU）</strong>完成運算，結果寫回暫存器或記憶體。</li>
           <li><b>重複進行</b>：程式計數器更新，跳至下一條指令，重複步驟直到程式結束。</li>
         </ol>
         <p>下面是一台迷你 CPU，正在執行第 1 講 <code>add(6, 8)</code> 的機器碼版本（指令為示意的簡化組合語言）。</p>`
      ) +
        C.widget({
          id: 'l7-cpuw',
          title: '取指 → 解碼 → 執行',
          tag: '逐步',
          hint: '按「下一步」看資料在記憶體、暫存器、CU、ALU 之間怎麼移動；亮起的元件就是這一步在工作的部分。',
          body: `<div class="l7-cycle" id="l7-cycle"><span data-ph="fetch">取指 Fetch</span><span data-ph="decode">解碼 Decode</span><span data-ph="exec">執行 Execute</span></div>
            <div class="l7-cpu">
              <div class="l7-box" id="l7-cpu-mem"><h5>記憶體 MEMORY</h5>
                ${PROGRAM.map(
                  (p, i) => `<div class="l7-memrow" data-addr="${i}"><span class="addr">${hex(i, 2)}</span><span>${p.asm}</span></div>`
                ).join('')}
                <div class="l7-memrow is-data" data-addr="d"><span class="addr">0x20</span><span>result = <b id="l7-cpu-m20">?</b></span></div>
              </div>
              <div class="l7-box" id="l7-cpu-core"><h5>CPU</h5>
                <div class="l7-core">
                  <div class="l7-reg" data-k="pc"><span>PC 程式計數器</span><b id="l7-cpu-pc">0x00</b></div>
                  <div class="l7-reg" data-k="ir"><span>IR 指令暫存器</span><b id="l7-cpu-ir">—</b></div>
                  <div class="l7-reg" data-k="r1"><span>R1 暫存器</span><b id="l7-cpu-r1">—</b></div>
                  <div class="l7-reg" data-k="r2"><span>R2 暫存器</span><b id="l7-cpu-r2">—</b></div>
                  <div class="l7-unit" data-k="cu"><span>CU 控制單元</span><p id="l7-cpu-cu">待命</p></div>
                  <div class="l7-unit" data-k="alu"><span>ALU 算術邏輯單元</span><p id="l7-cpu-alu">待命</p></div>
                </div>
              </div>
            </div>
            <p class="feedback is-info" id="l7-cpu-msg"></p>`,
          controls: `<div id="l7-cpu-step"></div>`,
        })
    );

    const bitsHtml = [128, 64, 32, 16, 8, 4, 2, 1]
      .map(
        (w, i) =>
          (i === 4 ? '<span class="bits-gap"></span>' : '') +
          `<button type="button" class="bit" data-w="${w}" aria-pressed="false" aria-label="位元 ${w}">0<span class="bit-label">${w}</span></button>`
      )
      .join('');
    const trHtml = [128, 64, 32, 16, 8, 4, 2, 1]
      .map((w, i) => (i === 4 ? '<span class="bits-gap" style="width:var(--s2)"></span>' : '') + `<span class="l7-tr" data-w="${w}"><i></i>OFF</span>`)
      .join('');
    const s4 = C.section(
      'l7-bits-sec',
      '04',
      '0 與 1：位元與位元組',
      C.prose(
        `<p>電腦的核心元件是<strong>電晶體（transistor）</strong>，它最穩定的狀態只有「導通（ON）」與「截止（OFF）」兩種。電腦只需要判斷有沒有電流：<b>「有電」= 1，「沒電」= 0</b>。這種二元判斷方式簡單、抗干擾能力強，不容易誤判。</p>
         <p>我們用大量「開關」的組合來表示數字與文字：<b>1 Byte = 8 Bits</b>，<code>00000000</code> = 0，<code>11111111</code> = 255。</p>`
      ) +
        C.widget({
          id: 'l7-byte',
          title: '1 Byte = 8 個電晶體開關',
          tag: '互動',
          hint: '點擊每一個位元切換 0 / 1，上方的電晶體會跟著「通電」或「斷電」。',
          body: `<div class="l7-trans" id="l7-trans" aria-hidden="true">${trHtml}</div>
            <div class="bits" id="l7-bits">${bitsHtml}</div>
            <dl class="kv">
              <div class="is-hi"><dt>十進位</dt><dd id="l7-byte-dec">0</dd></div>
              <div><dt>二進位</dt><dd id="l7-byte-bin">0000 0000</dd></div>
              <div><dt>十六進位</dt><dd id="l7-byte-hex">0x00</dd></div>
              <div><dt>通電的電晶體</dt><dd id="l7-byte-on">0 / 8</dd></div>
            </dl>`,
          controls: `<button type="button" class="btn btn--primary" id="l7-byte-rand">🎲 隨機</button>
            <button type="button" class="btn" id="l7-byte-all">全部打開（255）</button>
            <button type="button" class="btn" id="l7-byte-none">全部清除（0）</button>`,
        }) +
        C.callout(
          'key',
          '記憶體的最小單位是 Byte',
          '<p>電腦硬體所能<strong>定址（addressing）的最小單位是 Byte</strong>，因此我們討論記憶體時的最小單位是 Byte，而不是 Bit：每一個 Byte 都有自己的位址，一個 Bit 則沒有。</p>'
        )
    );

    const s5 = C.section(
      'l7-memory',
      '05',
      '記憶體與變數',
      C.prose(
        `<p>在電腦裡，<strong>「位址」與「內容」是不同的概念</strong>。可以把記憶體想像成一排巨大的「倉庫」或「房間」：</p>
         <ul>
           <li>每個房間都有一個獨一無二的「門牌號碼」—— 這就是<b>記憶體位址</b>。</li>
           <li>每個房間也有一個獨一無二的「暱稱」—— 這就是<b>變數名稱</b>。</li>
           <li>房間裡存放的東西（資料）就是<b>變數的值</b>；東西因為「型態」不同，占用的空間大小也不同。</li>
         </ul>
         <p>宣告 <code>int a = 10;</code> 時，編譯器會在記憶體中找到一塊能儲存整數的空間（通常是 4 bytes），把 10 放進去，並在<strong>符號表（symbol table）</strong>記下「a 對應到這個位址」：</p>`
      ) +
        `<div class="flow flow--keep l7-addrmap" aria-label="變數名稱對應位址再對應到值">
          <div class="flow-node">a<small>變數名稱（暱稱）</small></div><div class="flow-arrow"></div>
          <div class="flow-node flow-node--file">0x7ffc3a5e8b48<small>記憶體位址（門牌）</small></div><div class="flow-arrow"></div>
          <div class="flow-node is-done">10<small>記憶體中的內容</small></div>
        </div>` +
        C.callout(
          'tip',
          '變數名稱只是位址的暱稱',
          '<p>變數名稱（如 <code>a</code>）只是方便人類讀寫；CPU 只理解 0 與 1，唯一能定位資料的方式是記憶體位址。編譯器就扮演了把 C 語言翻譯成機器碼的「翻譯官」角色。</p>'
        ) +
        C.prose(
          `<p>宣告一個變數，就像跟櫃子（記憶體）要了一個抽屜；宣告一個陣列 <code>int b[5]</code>，則是要了<strong>編號連續</strong>的一堆抽屜（位址連續的空間）。下面每一格代表 <b>1 個 byte</b>，試著宣告幾個變數看看它們怎麼被放進去。</p>`
        ) +
        C.widget({
          id: 'l7-drawer',
          title: '記憶體抽屜：宣告變數',
          tag: '互動',
          hint: '每格 1 byte。按下宣告按鈕配置空間（依宣告順序、自然對齊 alignment，示意）；點符號表中的名稱，可以把它佔用的格子標亮。',
          body: `<div class="l7-drawers" id="l7-drawers"></div>
            <div class="table-wrap"><table class="table l7-symtab"><thead><tr><th>名稱</th><th>型態</th><th>起始位址</th><th>大小</th><th>值</th></tr></thead><tbody id="l7-symtab"></tbody></table></div>
            <p class="feedback" id="l7-drawer-msg"></p>`,
          controls: `<button type="button" class="btn" data-decl="c">char c</button>
            <button type="button" class="btn" data-decl="a">int a</button>
            <button type="button" class="btn" data-decl="d">double d</button>
            <button type="button" class="btn" data-decl="b">int b[5]</button>
            <span class="spacer"></span>
            <button type="button" class="btn btn--ghost" id="l7-drawer-reset">⟲ 重設</button>`,
        }) +
        C.callout(
          'warn',
          '試試看',
          '<p>依照 <code>char c → int a → double d → int b[5]</code> 的順序宣告，36 個 byte 剛好用完（中間有 3 個對齊用的空格）。換個順序（例如先宣告 <code>int b[5]</code>）會發生什麼事？</p>'
        ) +
        C.prose('<h3>Recall：scanf vs printf</h3>') +
        `<div class="card-grid">
          <div class="card"><span class="card-num">&amp;</span><h4>scanf：需要知道「位址」</h4><p>scanf 要把使用者輸入的資料<b>存到</b>變數裡。C 的函式只能拿到「值」，無法直接存取呼叫者的變數，所以必須用取址運算子 <code>&amp;</code> 把變數的記憶體位址交給它：<code>scanf("%d", &amp;a);</code></p></div>
          <div class="card"><span class="card-num">a</span><h4>printf：只需要「值」</h4><p>printf 只需要獲得變數的值來印出，不需要改變內容，所以直接傳入變數即可，不需要 <code>&amp;</code>：<code>printf("%d", a);</code></p></div>
        </div>`
    );

    const s6 = C.section(
      'l7-sizes-sec',
      '06',
      '變數型態與大小',
      C.prose('<p>不同型態佔用的記憶體大小不同，能表示的範圍也不同。用 <code>sizeof(型態)</code> 可以查到實際大小（單位是 byte）。</p>') +
        C.table(
          ['型態', '大小（bytes）', '範圍（十進位表示）'],
          [
            ['<code>char</code>', '1', '-128 ~ 127（signed）／0 ~ 255（unsigned）'],
            ['<code>short</code>', '2', '-32,768 ~ 32,767 ／0 ~ 65,535'],
            ['<code>int</code>', '4', '-2,147,483,648 ~ 2,147,483,647'],
            ['<code>unsigned int</code>', '4', '0 ~ 4,294,967,295'],
            ['<code>long</code>', '4', '-2,147,483,648 ~ 2,147,483,647'],
            ['<code>long long</code>', '8', '約 ±9.22 × 10¹⁸'],
            ['<code>float</code>', '4', '約 ±3.4 × 10³⁸，精度約 7 位數字'],
            ['<code>double</code>', '8', '約 ±1.7 × 10³⁰⁸，精度約 15~16 位數字'],
            ['<code>long double</code>', '8 ~ 16（視編譯器而定）', '約 ±1.1 × 10⁴⁹³²，精度約 19 位以上'],
          ]
        ) +
        C.widget({
          id: 'l7-sizew',
          title: '型態大小長條圖',
          tag: '圖表',
          hint: '點擊（或滑過）任一型態查看範圍與精度；切換單位看看 byte 與 bit 的換算（1 byte = 8 bits）。',
          body: `<div class="bar-chart l7-sizes" id="l7-sizes"></div>
            <dl class="kv" id="l7-size-kv"></dl>
            <p class="feedback is-info" id="l7-size-note"></p>`,
          controls: C.seg('l7-unit', [['byte', '單位：bytes'], ['bit', '單位：bits']], 'byte', '單位'),
        })
    );

    const s7 = C.section(
      'l7-param',
      '07',
      '參數傳遞：傳值 vs 傳址',
      C.prose(
        `<p>C/C++ 常見的兩種函式參數傳遞方式：</p>
         <ul>
           <li><b>傳值呼叫（call by value）</b>：傳遞的是變數的<strong>值</strong>，函式參數會複製一份原本變數的數值。在函式內修改參數，<em>不會</em>影響原本的變數，因為兩者在記憶體中是不同區域。</li>
           <li><b>傳址／參考呼叫（call by reference）</b>：傳遞的是原變數的<strong>記憶體位址</strong>（C 用指標實現）。副程式能直接修改原始變數的內容，主程式也會受到影響。</li>
         </ul>`
      ) +
        C.widget({
          id: 'l7-cbv',
          title: '傳值 vs 傳址：a 會不會被改掉？',
          tag: '逐步',
          hint: '先選擇傳遞方式，再按「下一步」追蹤 main 的 a 與 foo 的參數。',
          body: `<div class="widget-split">
              <div id="l7-cbv-code"></div>
              <div class="l7-param-host">
                <div class="l7-param">
                  <div class="l7-frame" id="l7-cbv-main"><h5>main()</h5>
                    <div class="l7-var" id="l7-cbv-a"><span class="nm">a</span><span class="ad">位址 0x1000</span><span class="vl" id="l7-cbv-aval">—</span></div>
                  </div>
                  <div class="l7-link" id="l7-cbv-link"><b>⟵</b><span id="l7-cbv-linktxt">複製數值</span></div>
                  <div class="l7-frame is-gone" id="l7-cbv-foo"><h5 id="l7-cbv-fooname">foo(int x)</h5>
                    <div class="l7-var" id="l7-cbv-x"><span class="nm" id="l7-cbv-xname">x</span><span class="ad">位址 0x2000</span><span class="vl" id="l7-cbv-xval">—</span></div>
                  </div>
                </div>
                <p class="feedback" id="l7-cbv-msg"></p>
              </div>
            </div>`,
          controls:
            C.seg('l7-cbv-mode', [['value', '傳值 call by value'], ['ref', '傳址 call by reference']], 'value', '傳遞方式') +
            `<span class="spacer"></span><div id="l7-cbv-step"></div>`,
        }) +
        C.prose(
          `<h3>陣列預設以傳址方式傳遞</h3>
           <p>陣列名稱就是指向陣列起始元素的指標。把陣列當作函式參數傳入時，函式拿到的是原陣列的記憶體位址，因此可以<strong>直接改動陣列元素</strong>。下面是課程範例 <code>Matrix (call by reference)</code>：</p>`
        ) +
        C.widget({
          id: 'l7-arrw',
          title: '陣列以傳址方式傳遞',
          tag: '逐步',
          hint: 'arr 只是一個存放位址的參數，它指向 main 的 data[0]；在 modifyArray 裡改 arr[i]，改到的就是 data[i]。',
          body: `<div class="widget-split">
              <div>${C.code(ARRAY_SRC, { id: 'l7-arr-code' })}</div>
              <div>
                <div class="l7-arr">
                  <div><div class="caption">main() 的 int data[5]</div><div class="cells cells--nowrap" id="l7-arr-cells"></div></div>
                  <div class="l7-ptr" id="l7-arr-ptr">modifyArray 尚未被呼叫</div>
                </div>
                <dl class="kv"><div><dt>i</dt><dd id="l7-arr-i">—</dd></div><div><dt>size</dt><dd id="l7-arr-size">—</dd></div></dl>
                <div class="console" data-title="輸出" id="l7-arr-out"></div>
                <p class="feedback" id="l7-arr-msg"></p>
              </div>
            </div>`,
          controls: `<div id="l7-arr-step"></div>`,
        }) +
        C.callout('key', '二維陣列呢？', '<p>若是二維陣列，傳遞的是指向陣列子陣列的指標，也就是二維陣列<strong>首列的位址</strong>，同樣可以在函式裡直接修改原本的元素。</p>')
    );

    const s8 = C.section(
      'l7-layout',
      '08',
      'C 語言記憶體配置',
      C.cards([
        {
          num: 'S',
          title: '靜態記憶體',
          body: '<p>儲存<b>全域變數、靜態變數和程式碼本身</b>。記憶體在程式運行期間一直存在，由編譯器負責配置；容量限制較小，但存取速度快，不需手動管理。</p>',
        },
        {
          num: 'A',
          title: '自動記憶體（Stack）',
          body: '<p>主要用於<b>函式內的區域變數</b>。函式呼叫時被分配，函式結束時自動釋放，使用的是堆疊（stack）空間；容量有限但重複利用，使用簡便且效率高。</p>',
        },
        {
          num: 'D',
          title: '動態記憶體（Heap）',
          body: '<p>程式運行期間用 <code>malloc()</code> 動態配置，也稱為堆積（heap）記憶體，需要用 <code>free()</code> 手動釋放。大小可在執行期決定，生命週期可跨越函式呼叫範圍。</p>',
        },
      ]) +
        C.callout(
          'warn',
          'Heap 要自己管理',
          '<p>跟自動記憶體不同，heap 的配置與釋放需要使用者自行管理，使用不當可能導致<strong>記憶體洩漏（memory leak）</strong>或錯誤（例如重複釋放 double free）。</p>'
        ) +
        C.widget({
          id: 'l7-mapw',
          title: '記憶體配置圖：變數住在哪裡？',
          tag: '互動',
          hint: '點程式碼中有變數的那一行，右邊會標出它住的區域；用下方按鈕呼叫函式、malloc、free，觀察 stack 與 heap 怎麼長大、縮小。',
          body: `<div class="l7-layout">
              <div>${C.code(LAYOUT_SRC, { id: 'l7-map-code' })}</div>
              <div>
                <div class="l7-mem" id="l7-mem">
                  <div class="l7-mem-end"><span>高位址 High address</span><span>0xFFFF…</span></div>
                  <section class="l7-seg" data-seg="stack"><header>Stack 堆疊 ↓<small>區域變數、函式參數<br>呼叫時配置、返回時釋放</small></header><div class="l7-seg-items" id="l7-seg-stack"></div></section>
                  <div class="l7-gap">↓ 未使用空間 ↑<br>stack 往下長、heap 往上長</div>
                  <section class="l7-seg" data-seg="heap"><header>Heap 堆積 ↑<small>malloc 配置<br>free 才會釋放</small></header><div class="l7-seg-items" id="l7-seg-heap"></div></section>
                  <section class="l7-seg" data-seg="bss"><header>.bss<small>未初始化／初始為 0 的<br>全域、靜態變數</small></header><div class="l7-seg-items" id="l7-seg-bss"></div></section>
                  <section class="l7-seg" data-seg="data"><header>.data<small>有初始值的<br>全域、靜態變數</small></header><div class="l7-seg-items" id="l7-seg-data"></div></section>
                  <section class="l7-seg" data-seg="text"><header>.text 程式碼<small>編譯後的機器碼<br>（唯讀）</small></header><div class="l7-seg-items" id="l7-seg-text"></div></section>
                  <div class="l7-mem-end"><span>低位址 Low address</span><span>0x0000…</span></div>
                </div>
              </div>
            </div>
            <p class="feedback is-info" id="l7-map-msg">點左邊程式碼中的任一行開始探索。</p>`,
          controls: `<button type="button" class="btn btn--primary" id="l7-map-call">呼叫 helper()</button>
            <button type="button" class="btn" id="l7-map-ret">函式返回</button>
            <button type="button" class="btn" id="l7-map-malloc">p = malloc(16)</button>
            <button type="button" class="btn" id="l7-map-free">free(p)</button>
            <span class="spacer"></span>
            <button type="button" class="btn btn--ghost" id="l7-map-reset">⟲ 重設</button>`,
        }) +
        C.table(
          ['', '靜態記憶體', '自動記憶體（stack）', '動態記憶體（heap）'],
          [
            ['存放什麼', '全域變數、static 變數、程式碼', '區域變數、函式參數', '<code>malloc()</code> 要來的區塊'],
            ['何時配置', '程式開始執行時', '呼叫函式時', '執行 <code>malloc()</code> 時'],
            ['何時釋放', '程式結束時', '函式返回時（自動）', '呼叫 <code>free()</code> 時（手動）'],
            ['誰負責管理', '編譯器', '編譯器／系統自動', '程式設計師自己'],
            ['大小決定時機', '編譯時', '編譯時', '執行期（可以很彈性）'],
            ['常見錯誤', '—', '回傳區域變數的位址', '忘記 free（洩漏）、重複 free'],
          ]
        )
    );

    return s1 + s2 + s3 + s4 + s5 + s6 + s7 + s8;
  }

  /* ---------------------------------------------------------
     Mount
     --------------------------------------------------------- */
  function mount(root) {
    mountPipeline(root);
    mountRace(root);
    mountCpu(root);
    mountByte(root);
    mountDrawers(root);
    mountSizes(root);
    mountCbv(root);
    mountArray(root);
    mountLayout(root);
  }

  /* 1 — pipeline */
  function mountPipeline(root) {
    const peek = $('#l7-peek', root);
    const nodes = $$('#l7-pipe .flow-node', root);
    const arrows = $$('#l7-pipe .flow-arrow', root);
    const st = C.stepper($('#l7-pipe-step', root), {
      count: PIPE.length,
      interval: 2200,
      render(i) {
        nodes.forEach((n) => {
          const k = +n.dataset.step;
          n.classList.toggle('is-active', k === i);
          n.classList.toggle('is-done', k < i);
          n.setAttribute('aria-pressed', String(k === i));
        });
        arrows.forEach((a) => {
          const to = +a.dataset.to;
          a.classList.toggle('is-done', to < i);
          a.classList.toggle('is-active', to === i);
        });
        const p = PIPE[i];
        const pk = PEEK[p.k];
        peek.innerHTML = `<h5>${pk.title}</h5><p>${pk.desc}</p>${pk.body()}`;
      },
    });
    nodes.forEach((n) =>
      n.addEventListener('click', () => {
        st.stop();
        st.go(+n.dataset.step);
      })
    );
  }

  /* 2 — race */
  function mountRace(root) {
    const el = (id) => $('#l7-race-' + id, root);
    const COMPILE_T = 6;
    const PARSE_T = 3;
    let N = 30;
    let t = 0;
    let timer = null;
    let fin = { c: null, py: null };
    const setStages = (lane, on) =>
      $$('#l7-race-' + lane + '-st span', root).forEach((s) => s.classList.toggle('is-on', s.dataset.st === on));
    function draw() {
      // C lane
      let cDone = 0;
      let cStage = null;
      if (t > 0 && t <= COMPILE_T) cStage = 'compile';
      else if (t > COMPILE_T) {
        cDone = Math.min(N, t - COMPILE_T);
        cStage = cDone < N ? 'run' : null;
      }
      if (cDone >= N && fin.c == null) fin.c = t;
      setStages('c', cStage);
      el('c-bar').style.width = (cDone / N) * 100 + '%';
      el('c-count').textContent = `${cDone} / ${N} 條指令`;
      el('c-time').textContent = `時間 ${fin.c != null ? fin.c : t}`;
      el('c-stat').textContent = fin.c != null ? `✓ 完成（時間 ${fin.c}）` : cStage === 'compile' ? `編譯中 ${t}/${COMPILE_T}` : cStage ? '執行中' : '待命';
      // Python lane
      let pDone = 0;
      let pStage = null;
      if (t > 0 && t <= PARSE_T) pStage = 'parse';
      else if (t > PARSE_T) {
        const k = t - PARSE_T;
        pDone = Math.min(N, Math.floor(k / 3));
        pStage = pDone < N ? ['fetch', 'interp', 'exec'][(k - 1) % 3] : null;
      }
      if (pDone >= N && fin.py == null) fin.py = t;
      setStages('py', pStage);
      el('py-bar').style.width = (pDone / N) * 100 + '%';
      el('py-count').textContent = `${pDone} / ${N} 條指令`;
      el('py-time').textContent = `時間 ${fin.py != null ? fin.py : t}`;
      el('py-stat').textContent =
        fin.py != null ? `✓ 完成（時間 ${fin.py}）` : pStage === 'parse' ? '語法檢查中' : pStage ? '逐條解譯中' : '待命';
      const msg = el('msg');
      if (fin.c != null && fin.py != null) {
        msg.className = 'feedback is-ok';
        msg.innerHTML = `C 在時間 <b>${fin.c}</b> 完成，Python 在時間 <b>${fin.py}</b> 完成。C 雖然一開始要先花時間編譯，但之後每條指令都由 CPU 直接執行；Python 的<strong>每一條</strong>指令都要先經過 PVM 解譯，指令越多差距越大。（示意）`;
      } else if (t > 0) {
        msg.className = 'feedback is-info';
        msg.textContent = fin.c != null ? 'C 已經跑完了，Python 還在一條一條解譯……' : '比賽進行中……';
      } else {
        msg.className = 'feedback';
        msg.textContent = '';
      }
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
      el('run').textContent = t > 0 && (fin.c == null || fin.py == null) ? '▶ 繼續' : '▶ 開始賽跑';
    }
    function tick() {
      if (!document.body.contains(root)) return stop();
      t++;
      draw();
      if (fin.c != null && fin.py != null) stop();
    }
    function start() {
      if (fin.c != null && fin.py != null) reset();
      const speed = +el('v').value;
      timer = C.every(tick, Math.round(260 / speed));
      el('run').textContent = '⏸ 暫停';
    }
    function reset() {
      stop();
      t = 0;
      fin = { c: null, py: null };
      draw();
      el('run').textContent = '▶ 開始賽跑';
    }
    el('run').addEventListener('click', () => (timer ? stop() : start()));
    el('reset').addEventListener('click', reset);
    el('n').addEventListener('input', () => {
      N = +el('n').value;
      el('n-out').textContent = N;
      reset();
    });
    el('v').addEventListener('input', () => {
      el('v-out').textContent = el('v').value;
      if (timer) {
        C.stop(timer);
        timer = null;
        start();
      }
    });
    draw();
  }

  /* 3 — CPU */
  function mountCpu(root) {
    const states = cpuStates();
    const set = (id, v) => ($('#l7-cpu-' + id, root).textContent = v);
    C.stepper($('#l7-cpu-step', root), {
      count: states.length,
      interval: 1500,
      render(i) {
        const s = states[i];
        set('pc', hex(s.pcNext != null ? s.pcNext : s.pc, 2));
        set('ir', s.ir);
        set('r1', s.r1);
        set('r2', s.r2);
        set('cu', s.cu);
        set('alu', s.alu);
        set('m20', s.mem20);
        set('msg', '');
        $('#l7-cpu-msg', root).textContent = s.msg;
        $$('[data-k]', $('#l7-cpu-core', root)).forEach((e) => e.classList.toggle('is-act', s.act.includes(e.dataset.k)));
        const memBox = $('#l7-cpu-mem', root);
        memBox.style.borderColor = s.act.includes('mem') ? 'var(--accent-2)' : '';
        const curPc = s.pcNext != null ? s.pcNext : s.pc;
        $$('.l7-memrow', memBox).forEach((r) => {
          const a = r.dataset.addr;
          r.classList.toggle('is-hi', String(s.memHi) === a);
          r.classList.toggle('is-pc', a === String(curPc));
        });
        $$('#l7-cycle span', root).forEach((c) => c.classList.toggle('is-on', c.dataset.ph === s.phase));
      },
    });
  }

  /* 4 — byte */
  function mountByte(root) {
    let v = 0b00101101;
    const bits = $$('#l7-bits .bit', root);
    const trs = $$('#l7-trans .l7-tr', root);
    function draw() {
      bits.forEach((b) => {
        const on = (v & +b.dataset.w) !== 0;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
        b.firstChild.nodeValue = on ? '1' : '0';
      });
      trs.forEach((t) => {
        const on = (v & +t.dataset.w) !== 0;
        t.classList.toggle('is-on', on);
        t.lastChild.nodeValue = on ? 'ON' : 'OFF';
      });
      const b = v.toString(2).padStart(8, '0');
      $('#l7-byte-dec', root).textContent = v;
      $('#l7-byte-bin', root).textContent = b.slice(0, 4) + ' ' + b.slice(4);
      $('#l7-byte-hex', root).textContent = '0x' + v.toString(16).toUpperCase().padStart(2, '0');
      $('#l7-byte-on', root).textContent = `${b.split('').filter((x) => x === '1').length} / 8`;
    }
    bits.forEach((b) =>
      b.addEventListener('click', () => {
        v ^= +b.dataset.w;
        draw();
      })
    );
    $('#l7-byte-rand', root).addEventListener('click', () => {
      let n;
      do n = Math.floor(Math.random() * 256);
      while (n === v);
      v = n;
      draw();
    });
    $('#l7-byte-all', root).addEventListener('click', () => {
      v = 255;
      draw();
    });
    $('#l7-byte-none', root).addEventListener('click', () => {
      v = 0;
      draw();
    });
    draw();
  }

  /* 5 — memory drawers */
  function mountDrawers(root) {
    const grid = $('#l7-drawers', root);
    const tbody = $('#l7-symtab', root);
    const msg = $('#l7-drawer-msg', root);
    let used = []; // per byte: null | {name, k, pad}
    let syms = [];
    let hi = null;
    let fresh = new Set();
    function reset() {
      used = new Array(MEM_N).fill(null);
      syms = [];
      hi = null;
      fresh = new Set();
      $$('[data-decl]', root).forEach((b) => {
        b.disabled = false;
        b.classList.remove('is-done');
      });
      msg.className = 'feedback';
      msg.textContent = '';
      draw();
    }
    function next() {
      let n = 0;
      used.forEach((u, i) => {
        if (u) n = i + 1;
      });
      return n;
    }
    function draw() {
      grid.innerHTML = used
        .map((u, i) => {
          const addr = (MEM_BASE + i).toString(16).toUpperCase();
          if (!u) return `<div class="cell is-dim"><span class="cell-idx">${addr}</span><span class="cell-val">·</span><span class="cell-sub">&nbsp;</span></div>`;
          if (u.pad)
            return `<div class="cell is-pad"><span class="cell-idx">${addr}</span><span class="cell-val">pad</span><span class="cell-sub">對齊</span></div>`;
          const d = DECLS[u.name];
          const label = u.name === 'b' ? `b[${Math.floor(u.k / 4)}]` : u.name;
          const cls = ['cell'];
          if (hi === u.name) cls.push('is-hi');
          if (fresh.has(i)) cls.push('is-new');
          return `<div class="${cls.join(' ')}" data-c="${d.c}"><span class="cell-idx">${addr}</span><span class="cell-val">${label}</span><span class="cell-sub">+${u.k}</span></div>`;
        })
        .join('');
      fresh = new Set();
      tbody.innerHTML = syms.length
        ? syms
            .map(
              (s) =>
                `<tr class="${hi === s.name ? 'is-hi' : ''}"><td><button type="button" data-sym="${s.name}" aria-pressed="${hi === s.name}">${s.name}</button></td><td><code>${DECLS[s.name].type}</code></td><td><code>${hex(s.addr)}</code></td><td>${DECLS[s.name].size} bytes</td><td><code>${DECLS[s.name].val}</code></td></tr>`
            )
            .join('')
        : '<tr><td colspan="5" class="muted">（符號表是空的 —— 還沒有宣告任何變數）</td></tr>';
    }
    $$('[data-decl]', root).forEach((btn) =>
      btn.addEventListener('click', () => {
        const d = DECLS[btn.dataset.decl];
        const start0 = next();
        const start = Math.ceil(start0 / d.align) * d.align;
        if (start + d.size > MEM_N) {
          msg.className = 'feedback is-err';
          msg.innerHTML = `✗ 放不下了！<code>${d.decl}</code> 需要 ${d.size} bytes（起始位址要對齊 ${d.align} 的倍數），但從 ${hex(
            MEM_BASE + start
          )} 開始只剩 ${Math.max(0, MEM_N - start)} bytes 連續空間。陣列一定要<strong>連續</strong>的抽屜。`;
          return;
        }
        for (let i = start0; i < start; i++) used[i] = { pad: true };
        for (let k = 0; k < d.size; k++) {
          used[start + k] = { name: d.name, k };
          fresh.add(start + k);
        }
        syms.push({ name: d.name, addr: MEM_BASE + start });
        hi = d.name;
        btn.disabled = true;
        btn.classList.add('is-done');
        msg.className = 'feedback is-ok';
        msg.innerHTML =
          `✓ <code>${d.decl}</code> → 配置 ${d.size} bytes，位址 ${hex(MEM_BASE + start)} ~ ${hex(MEM_BASE + start + d.size - 1)}` +
          (start > start0 ? `；為了對齊 ${d.align} 的倍數，前面空出 ${start - start0} 個 byte（padding）。` : '。') +
          (d.name === 'b' ? ' 陣列的 5 個 int 緊緊相鄰：b[i] 的位址 = b 的位址 + i × 4。' : '');
        draw();
      })
    );
    tbody.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-sym]');
      if (!b) return;
      hi = hi === b.dataset.sym ? null : b.dataset.sym;
      const s = syms.find((x) => x.name === b.dataset.sym);
      const d = DECLS[s.name];
      msg.className = 'feedback is-info';
      msg.innerHTML = hi
        ? `符號表：<code>${s.name}</code> → 位址 <code>${hex(s.addr)}</code>，佔 ${d.size} bytes。CPU 看不到「${s.name}」這個名字，只看得到這個位址。`
        : '已取消標示。';
      draw();
    });
    $('#l7-drawer-reset', root).addEventListener('click', reset);
    reset();
  }

  /* 6 — sizes chart */
  function mountSizes(root) {
    const chart = $('#l7-sizes', root);
    const kv = $('#l7-size-kv', root);
    const note = $('#l7-size-note', root);
    let unit = 'byte';
    let sel = 'int';
    function fmt(t) {
      const m = unit === 'bit' ? 8 : 1;
      return t.lo ? `${t.lo * m}–${t.b * m}` : String(t.b * m);
    }
    function draw() {
      chart.innerHTML = TYPES.map(
        (t, i) =>
          `<button type="button" class="bar-row${t.t === sel ? ' is-hi' : ''}" data-t="${t.t}" data-c="${(i % 6) + 1}" aria-pressed="${t.t === sel}"><span class="bar-label">${t.t}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${(t.b / 16) * 100}%"></span></span><span class="bar-value">${fmt(
            t
          )}</span></button>`
      ).join('');
      const t = TYPES.find((x) => x.t === sel);
      kv.innerHTML = `<div class="is-hi"><dt>型態</dt><dd>${t.t}</dd></div><div><dt>sizeof(${t.t})</dt><dd>${fmt(t)} ${unit === 'bit' ? 'bits' : 'bytes'}</dd></div><div><dt>範圍</dt><dd style="font-size:.9rem">${t.range}</dd></div>`;
      note.textContent = t.note + (unit === 'bit' ? `　（${t.lo ? t.lo + '~' + t.b : t.b} bytes × 8 = ${fmt(t)} bits）` : '');
    }
    chart.addEventListener('click', (e) => {
      const b = e.target.closest('[data-t]');
      if (!b) return;
      sel = b.dataset.t;
      draw();
    });
    chart.addEventListener('mouseover', (e) => {
      const b = e.target.closest('[data-t]');
      if (!b || b.dataset.t === sel) return;
      sel = b.dataset.t;
      draw();
    });
    C.onSeg(root, 'l7-unit', (v) => {
      unit = v;
      draw();
    });
    draw();
  }

  /* 7a — call by value / reference */
  function mountCbv(root) {
    let mode = 'value';
    const codeHost = $('#l7-cbv-code', root);
    const g = (id) => $('#l7-cbv-' + id, root);
    const STEPS = {
      value: [
        { line: 8, a: 10, foo: false, msg: '<code>int a = 10;</code>：main 的 a 住在位址 0x1000，值為 10。' },
        { line: [9, 3], a: 10, foo: true, x: 10, link: true, msg: '<code>foo(a);</code>：把 a 的<strong>值</strong> 10 複製一份給參數 x。x 住在另一個位址 0x2000。' },
        { line: 4, a: 10, foo: true, x: 100, hx: true, link: true, msg: '<code>x = 100;</code>：只改到 x 這個<strong>副本</strong>，main 的 a 完全沒被碰到。' },
        { line: [5, 9], a: 10, foo: 'gone', x: 100, msg: 'foo 結束返回：x 跟著 foo 的堆疊框一起被釋放。' },
        { line: 10, a: 10, foo: 'gone', ha: true, msg: '結果：a <strong>還是 10</strong>。傳值呼叫時，函式內修改參數不會影響原本的變數。', ok: true },
      ],
      ref: [
        { line: 8, a: 10, foo: false, msg: '<code>int a = 10;</code>：main 的 a 住在位址 0x1000，值為 10。' },
        { line: [9, 3], a: 10, foo: true, x: '0x1000', link: true, msg: '<code>foo(&amp;a);</code>：傳進去的是 a 的<strong>位址</strong> 0x1000，指標 p 存著這個位址 —— p「指向」a。' },
        { line: 4, a: 100, foo: true, x: '0x1000', link: true, ha: true, msg: '<code>*p = 100;</code>：沿著 p 存的位址找到 0x1000，直接把那裡的值改成 100 —— 改到的就是 main 的 a！' },
        { line: [5, 9], a: 100, foo: 'gone', x: '0x1000', msg: 'foo 結束返回：p 被釋放，但 a 已經被改掉了。' },
        { line: 10, a: 100, foo: 'gone', ha: true, msg: '結果：a <strong>變成 100</strong>。傳址呼叫讓函式能直接修改呼叫者的變數（scanf 就是這樣運作的）。', ok: true },
      ],
    };
    function renderCode() {
      codeHost.innerHTML = C.code(mode === 'value' ? VALUE_SRC : REF_SRC, { id: 'l7-cbv-pre' });
      g('fooname').textContent = mode === 'value' ? 'foo(int x)' : 'foo(int *p)';
      g('xname').textContent = mode === 'value' ? 'x' : 'p';
      g('linktxt').textContent = mode === 'value' ? '複製數值' : '指向 0x1000（可直接改原值）';
    }
    const st = C.stepper(g('step'), {
      count: () => STEPS[mode].length,
      interval: 1600,
      render(i) {
        const s = STEPS[mode][i];
        C.setLines($('#l7-cbv-pre', root), s.line);
        g('aval').textContent = s.a;
        g('foo').classList.toggle('is-gone', s.foo !== true);
        g('xval').textContent = s.foo === false ? '—' : s.foo === 'gone' ? '（已釋放）' : s.x;
        g('x').classList.toggle('is-hi', !!s.hx);
        g('a').classList.toggle('is-hi', !!s.ha);
        g('link').classList.toggle('is-on', !!s.link);
        g('link').querySelector('b').textContent = mode === 'value' ? (s.link ? '⇢' : '⟵') : '⟵';
        const m = g('msg');
        m.className = 'feedback ' + (s.ok ? (mode === 'value' ? 'is-info' : 'is-ok') : '');
        m.innerHTML = s.msg;
      },
    });
    C.onSeg(root, 'l7-cbv-mode', (v) => {
      mode = v;
      renderCode();
      st.reset();
    });
    renderCode();
    st.reset();
  }

  /* 7b — array by reference */
  function mountArray(root) {
    const cells = $('#l7-arr-cells', root);
    const ptr = $('#l7-arr-ptr', root);
    const out = $('#l7-arr-out', root);
    const pre = $('#l7-arr-code', root);
    const steps = [];
    let data = [1, 2, 3, 4, 5];
    steps.push({ line: 10, data: data.slice(), out: '', ptr: false, i: '—', size: '—', msg: '宣告並初始化 data[5]：5 個 int 放在位址連續的記憶體中（0x3000 起，每個 4 bytes）。' });
    const before = 'Before modification: ' + data.map((x) => C.printf('%d ', x)).join('') + '\n';
    steps.push({ line: [12, 13, 14, 15, 16], data: data.slice(), out: before, ptr: false, i: '—', size: '—', msg: '先印出修改前的內容。' });
    steps.push({ line: [19, 3], data: data.slice(), out: before, ptr: true, i: '—', size: 5, msg: '<code>modifyArray(data, 5);</code>：傳進去的是陣列名稱 data，也就是 &amp;data[0] = 0x3000 這個<strong>位址</strong>，不是 5 個數字的副本。' });
    for (let i = 0; i < 5; i++) {
      data[i] *= 10;
      steps.push({
        line: [4, 5],
        data: data.slice(),
        out: before,
        ptr: true,
        hi: i,
        i,
        size: 5,
        msg: `i = ${i}：<code>arr[${i}] = arr[${i}] * 10;</code> → 位址 0x${(0x3000 + i * 4).toString(16).toUpperCase()} 的值變成 ${data[i]}，也就是 main 的 data[${i}]。`,
      });
    }
    steps.push({ line: [7, 19], data: data.slice(), out: before, ptr: false, i: '—', size: '—', msg: 'modifyArray 返回：參數 arr、size、i 都被釋放了，但 data 的內容已經被改掉。' });
    const after = before + 'After modification: ' + data.map((x) => C.printf('%d ', x)).join('') + '\n';
    steps.push({ line: [21, 22, 23, 24, 25], data: data.slice(), out: after, ptr: false, i: '—', size: '—', msg: '印出修改後的內容：每個元素都變成原本的 10 倍 —— 陣列是以傳址方式傳遞的。', ok: true });
    C.stepper($('#l7-arr-step', root), {
      count: steps.length,
      interval: 1300,
      render(k) {
        const s = steps[k];
        C.setLines(pre, s.line);
        cells.innerHTML = s.data
          .map(
            (v, i) =>
              `<div class="cell${s.hi === i ? ' is-hi' : ''}${s.ptr && i === 0 ? ' is-alloc' : ''}"><span class="cell-idx">data[${i}]</span><span class="cell-val">${v}</span><span class="cell-sub">0x${(
                0x3000 +
                i * 4
              )
                .toString(16)
                .toUpperCase()}</span></div>`
          )
          .join('');
        ptr.classList.toggle('is-on', s.ptr);
        ptr.innerHTML = s.ptr ? `modifyArray 的參數<br><b>arr = 0x3000</b> → 指向 data[0]` : 'modifyArray 不在執行中';
        $('#l7-arr-i', root).textContent = s.i;
        $('#l7-arr-size', root).textContent = s.size;
        out.textContent = s.out;
        const m = $('#l7-arr-msg', root);
        m.className = 'feedback' + (s.ok ? ' is-ok' : '');
        m.innerHTML = s.msg;
      },
    });
  }

  /* 8 — memory layout */
  function mountLayout(root) {
    const pre = $('#l7-map-code', root);
    const msg = $('#l7-map-msg', root);
    const lines = $$('.line', pre);
    const WHERE = {
      4: { seg: 'data', item: 'g', text: '<code>int g = 5;</code> 是<strong>有初始值的全域變數</strong> → 放在 <b>.data</b> 區段，從程式開始到結束都存在。' },
      5: { seg: 'bss', item: 's', text: '<code>static int s;</code> 是<strong>沒有初始值的靜態變數</strong> → 放在 <b>.bss</b> 區段，程式開始時自動清為 0。' },
      7: { seg: 'text', item: 'helper', text: '<code>helper</code> 函式本身編譯成機器碼，放在 <b>.text</b>（程式碼）區段。' },
      8: { seg: 'stack', item: 'helper', text: '<code>int local</code> 是 helper 的區域變數 → 只在 helper <strong>執行期間</strong>存在於 <b>stack</b> 上；按「呼叫 helper()」就能看到它出現。' },
      11: { seg: 'text', item: 'main', text: '<code>main</code> 函式的機器碼放在 <b>.text</b> 區段。' },
      12: { seg: 'stack', item: 'main', text: '<code>int a = 10;</code> 是區域變數（自動變數）→ 放在 <b>stack</b> 上 main 的堆疊框裡，main 結束時自動釋放。' },
      13: { seg: 'bss', item: 'cnt', text: '<code>static int cnt = 0;</code> 雖然寫在 main 裡，但它是<strong>靜態</strong>變數，不在 stack！初始值為 0 的靜態變數通常放在 <b>.bss</b>，整個程式執行期間都存在。' },
      14: { seg: 'heap', item: 'heap', text: '<code>int *p = malloc(...)</code>：指標變數 <b>p 本身在 stack</b>，它存的位址指向 <b>heap</b> 上那塊 16 bytes 的區塊。按「p = malloc(16)」試試看。' },
      15: { seg: 'stack', item: 'helper', text: '<code>helper(a);</code>：呼叫函式時，stack 往下長出一個新的堆疊框（放參數 n 和 local）；返回時自動移除。' },
      16: { seg: 'heap', item: 'heap', text: '<code>free(p);</code>：把 heap 區塊還給系統。heap 不會自己釋放，忘了 free 就會造成記憶體洩漏。' },
      17: { seg: 'stack', item: 'main', text: '<code>return 0;</code>：main 結束，它的堆疊框（a、p）被釋放；程式結束時所有記憶體都會交還給作業系統。' },
    };
    let frames;
    let blocks;
    let pTo;
    let hiSeg = null;
    let hiItem = null;
    let freshKey = null;
    let blockSeq = 0;
    function reset() {
      frames = [{ name: 'main()', vars: 'a = 10, p' }];
      blocks = [];
      pTo = null;
      hiSeg = null;
      hiItem = null;
      blockSeq = 0;
      C.setLines(pre, []);
      msg.className = 'feedback is-info';
      msg.textContent = '點左邊程式碼中的任一行開始探索。';
      draw();
    }
    const chip = (key, left, right, extra = '') =>
      `<div class="l7-chip${extra}${hiItem === key ? ' is-hi' : ''}${freshKey === key ? ' is-new' : ''}" data-item="${key}"><span>${left}</span><span class="muted">${right}</span></div>`;
    function draw() {
      const pBlock = blocks.find((b) => b.id === pTo);
      const pDesc = pTo == null ? 'NULL' : pBlock && !pBlock.freed ? `→ 區塊#${pTo}` : `→ 區塊#${pTo}（已釋放！）`;
      $('#l7-seg-stack', root).innerHTML = frames
        .map((f, i) =>
          chip(
            i === 0 ? 'main' : 'helper',
            `<b>${f.name}</b>`,
            i === 0 ? `a = 10, p ${pDesc}` : f.vars,
            ' is-frame'
          )
        )
        .join('');
      $('#l7-seg-heap', root).innerHTML = blocks.length
        ? blocks
            .map((b) =>
              chip(
                'heap',
                `區塊#${b.id}（16 bytes）`,
                b.freed ? '已 free' : b.leak ? '洩漏！沒人指向' : b.id === pTo ? '← p 指向這裡' : '',
                (b.freed ? ' is-freed' : '') + (b.leak && !b.freed ? ' is-leak' : '')
              ).replace('data-item="heap"', `data-item="heap" data-block="${b.id}"`)
            )
            .join('')
        : '<div class="muted" style="font-size:.78rem">（目前沒有 malloc 的區塊）</div>';
      $('#l7-seg-bss', root).innerHTML = chip('s', 's', '= 0（自動清為 0）') + chip('cnt', 'cnt', '= 0（main 的 static）');
      $('#l7-seg-data', root).innerHTML = chip('g', 'g', '= 5');
      $('#l7-seg-text', root).innerHTML = chip('main', 'main() 的機器碼', '唯讀') + chip('helper', 'helper() 的機器碼', '唯讀');
      $$('.l7-seg', root).forEach((s) => s.classList.toggle('is-hi', s.dataset.seg === hiSeg));
      // in the stack/text, "main"/"helper" keys appear twice: only highlight inside the highlighted segment
      $$('.l7-chip.is-hi', root).forEach((c) => {
        if (c.closest('.l7-seg').dataset.seg !== hiSeg) c.classList.remove('is-hi');
      });
      freshKey = null;
    }
    function say(kind, html) {
      msg.className = 'feedback is-' + kind;
      msg.innerHTML = html;
    }
    // clickable source lines
    Object.keys(WHERE).forEach((ln) => {
      const el = lines[+ln - 1];
      if (!el) return;
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.dataset.ln = ln;
    });
    function pick(ln) {
      const w = WHERE[ln];
      if (!w) return;
      C.setLines(pre, +ln);
      hiSeg = w.seg;
      hiItem = w.item;
      say('info', w.text);
      draw();
    }
    pre.addEventListener('click', (e) => {
      const l = e.target.closest('.line[tabindex]');
      if (l) pick(l.dataset.ln);
    });
    pre.addEventListener('keydown', (e) => {
      const l = e.target.closest('.line[tabindex]');
      if (l && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        pick(l.dataset.ln);
      }
    });
    $('#l7-map-call', root).addEventListener('click', () => {
      if (frames.length >= 5) {
        hiSeg = 'stack';
        hiItem = null;
        say('err', '✗ 堆疊框太多了！真實程式中無止境地呼叫函式（例如沒有終止條件的遞迴）會把 stack 用完，造成<strong>堆疊溢位（stack overflow）</strong>。');
        draw();
        return;
      }
      const depth = frames.length;
      frames.push({ name: 'helper(int n)', vars: depth === 1 ? 'n = 10, local = 20' : `n = ?, local = ?（第 ${depth} 層）` });
      C.setLines(pre, [15, 8]);
      hiSeg = 'stack';
      hiItem = 'helper';
      freshKey = 'helper';
      say('info', `呼叫 helper()：stack <strong>往低位址長出</strong>一個新的堆疊框，裡面放參數 n 與區域變數 local。目前共有 ${frames.length} 個堆疊框。`);
      draw();
    });
    $('#l7-map-ret', root).addEventListener('click', () => {
      hiSeg = 'stack';
      if (frames.length <= 1) {
        hiItem = 'main';
        say('warn', 'main() 是最底層的堆疊框：main 返回就代表整個程式結束。先按「呼叫 helper()」再試試看「函式返回」。');
        draw();
        return;
      }
      frames.pop();
      C.setLines(pre, [9, 15]);
      hiItem = frames.length > 1 ? 'helper' : 'main';
      say('ok', `函式返回：最上面的堆疊框被<strong>自動釋放</strong>，裡面的 local 也跟著消失（後進先出）。剩下 ${frames.length} 個堆疊框。`);
      draw();
    });
    $('#l7-map-malloc', root).addEventListener('click', () => {
      if (blocks.filter((b) => !b.freed).length >= 4) {
        hiSeg = 'heap';
        hiItem = 'heap';
        say('err', '✗ 示意的 heap 空間用完了：malloc 失敗時會回傳 <code>NULL</code>，使用前一定要檢查！先 free 一些區塊或按重設。');
        draw();
        return;
      }
      const old = blocks.find((b) => b.id === pTo && !b.freed);
      const id = ++blockSeq;
      blocks.push({ id, freed: false, leak: false });
      pTo = id;
      C.setLines(pre, 14);
      hiSeg = 'heap';
      hiItem = 'heap';
      freshKey = 'heap';
      if (old) {
        old.leak = true;
        say(
          'err',
          `⚠ 記憶體洩漏（memory leak）！p 原本指向區塊#${old.id}，現在被改成指向新的區塊#${id}，舊區塊再也沒有任何指標指向它，<strong>永遠無法 free</strong>。`
        );
      } else {
        say('ok', `✓ <code>p = malloc(4 * sizeof(int));</code>：heap <strong>往高位址長出</strong>區塊#${id}（16 bytes），p（在 stack 上）存著它的位址。`);
      }
      draw();
    });
    $('#l7-map-free', root).addEventListener('click', () => {
      hiSeg = 'heap';
      hiItem = 'heap';
      C.setLines(pre, 16);
      if (pTo == null) {
        say('info', '<code>p</code> 目前是 NULL：<code>free(NULL)</code> 什麼事都不會做。先按「p = malloc(16)」。');
        draw();
        return;
      }
      const b = blocks.find((x) => x.id === pTo);
      if (b.freed) {
        say('err', `✗ 重複釋放（double free）！區塊#${b.id} 已經 free 過了，再 free 一次是<strong>未定義行為</strong>，程式可能當掉。好習慣：free 之後寫 <code>p = NULL;</code>。`);
        draw();
        return;
      }
      b.freed = true;
      say('ok', `✓ <code>free(p);</code>：區塊#${b.id} 歸還給系統。注意 p 裡面<strong>還存著舊位址</strong>（懸置指標 dangling pointer），不要再透過它存取。`);
      draw();
    });
    $('#l7-map-reset', root).addEventListener('click', reset);
    reset();
  }

  /* ---------------------------------------------------------
     Register
     --------------------------------------------------------- */
  C.register({
    id: 'l7',
    order: 7,
    num: '07',
    title: '編譯、記憶體與參數傳遞',
    en: 'From Source Code to Execution: Compilation, Memory, and Parameter Passing',
    lede: '一支 C 程式要經過編譯、組譯與連結才變成執行檔；執行時 CPU 一條一條「取指、解碼、執行」，而每個變數都住在記憶體的某個門牌號碼裡。這一講把這條路從頭走一遍，再看清楚傳值與傳址的差別。',
    desc: '從 Hello.c 到 Hello.exe、CPU 的取指解碼執行、記憶體位址、傳值 vs 傳址與 stack / heap。',
    tags: ['編譯與連結', 'CPU 週期', '記憶體位址', '傳值／傳址'],
    objectives: [
      'C 程式從原始碼到可執行檔，中間經過哪些階段',
      'CPU 如何透過「取指、解碼、執行」的循環來執行程式',
      '記憶體位址與變數之間的對應關係',
      '傳值呼叫與傳址呼叫的差異，以及陣列為何以傳址方式傳遞',
      '靜態、自動、動態記憶體的差別與使用時機',
    ],
    sections,
    recap: [
      'C 程式要經過編譯（含組譯）與連結，才能從原始碼變成可執行檔',
      'CPU 透過「取指、解碼、執行」的循環，一步步執行記憶體中的指令',
      '變數只是記憶體位址的暱稱，編譯器用符號表把名稱對應到位址',
      '傳值呼叫複製變數的值，傳址／參考呼叫傳遞變數的位址，陣列預設以傳址方式傳遞',
      '靜態、自動、動態記憶體各有不同的生命週期，stack 和 heap 是最常用到的兩塊記憶體',
    ],
    practice: '試著畫出一段簡單程式的記憶體配置圖，標出哪些變數在 stack、哪些在 heap（可以用上面的「記憶體配置圖」對照檢查）。',
    css,
    mount,
  });
})();
