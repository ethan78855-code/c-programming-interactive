/* Lecture 02 — 資料型態、運算子與輸入輸出 */
(function () {
  'use strict';
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const showCh = (ch) => (ch === ' ' ? '␣' : ch === '\n' ? '⏎' : ch === '\t' ? '⇥' : ch);

  /* ---------------- example code (from the course gist) ---------------- */
  const CODE_DECL = String.raw`int a;            // 宣告一個整數變數 a
int b = 5;        // 宣告時直接給初始值
float x, y, z;    // 一次宣告多個同型態的變數，用逗號隔開
a = 10;           // 之後再賦值`;

  const CODE_SCOPE = String.raw`#include <stdio.h>

int var = 10;
void Calculate();

int main()
{
    int var = 5;
    Calculate();
    printf("Local variable var = %d\n", var);
    return 0;
}

void Calculate(){
    var = var + 1;
    printf("Global variable var = %d\n", var);
}`;

  const CODE_SPEC = String.raw`#include <stdio.h>
#include <stdlib.h>

int main()
{
    printf("印出字元: %c\n", 'D');
    printf("印出字元編碼: %d\n", 'D');
    printf("印出字元: %c\n", 68);
    printf("10進位: %d\n", 27);
    printf("8進位: %o\n", 27);
    printf("16進位: %x\n", 27);
    printf("16進位: %X\n", 27);
    printf("科學記號: %e\n", 0.000123);
    printf("科學記號: %E\n", 0.000123);
    printf("浮點數: %f\n", 1.23e-04);
    return 0;
}`;
  const SPEC_LINES = [
    ['印出字元: %c\n', 'D'],
    ['印出字元編碼: %d\n', 'D'],
    ['印出字元: %c\n', 68],
    ['10進位: %d\n', 27],
    ['8進位: %o\n', 27],
    ['16進位: %x\n', 27],
    ['16進位: %X\n', 27],
    ['科學記號: %e\n', 0.000123],
    ['科學記號: %E\n', 0.000123],
    ['浮點數: %f\n', 1.23e-4],
  ];

  const CODE_DATE = String.raw`#include <stdio.h>

int main()
{
    int x, y, z;
    printf("Enter year/month/day: ");
    scanf("%d/%d/%d", &x, &y, &z);
    printf("%d年%d月%d日\n", x, y, z);
    return 0;
}`;

  const CODE_DIV = String.raw`#include <stdio.h>

int main()
{
    int x, y;
    printf("Please input the value of x:");
    scanf("%d", &x);
    printf("Please input the value of y:");
    scanf("%d", &y);
    printf("x/y = %f\n", (float)x/y); //強制轉換x型態為float
    printf("x/y = %d...%d\n", x/y, x%y);
    return 0;
}`;

  const CODE_BMI = String.raw`#include <stdio.h>
#include <math.h>

int main(void)
{
    float height, weight, bmi;
    printf("Input your height (m) and weight (kg):");
    scanf("%f%f", &height, &weight);
    bmi = weight / pow(height,2);
    printf("Your BMI is %f\n", bmi);
}`;

  const CODE_STAT = String.raw`#include <stdio.h>
#include <math.h>
float Cal_Average(float w, float x, float y, float z);
float Cal_Variance(float w, float x, float y, float z, float avg_Var);
float Cal_Std(float var_Std);

int main()
{
    float avg, var, std;
    float a, b, c, d;
    printf("Please enter four numbers: \n");
    scanf("%f%f%f%f", &a, &b, &c, &d);
    avg = Cal_Average(a, b, c, d);
    var = Cal_Variance(a, b, c, d, avg);
    std = Cal_Std(var);
    printf("Mean: %f, Variance: %f, Standard deviation: %f", avg, var, std);
    return 0;
}

float Cal_Average(float w, float x, float y, float z)
{
    float avg = (w+x+y+z)/4;
    return avg;
}

float Cal_Variance(float w, float x, float y, float z, float avg_Var)
{
    float var = (pow(w-avg_Var, 2)+pow(x-avg_Var, 2)+pow(y-avg_Var, 2)+pow(z-avg_Var, 2))/4;
    return var;
}

float Cal_Std(float var_Std)
{
    float std = sqrt(var_Std);
    return std;
}`;

  const CODE_DEBUG = String.raw`#include <stdio.h>

int main()
{
    float fahr, celsius;
    fahr = 50;
    celsius = 9 * (fahr - 32) / 5; \*convert fahr to celsius
    printf("%d degrees Fahrenheit = %d degrees Celsius\n", Fahr);
    return 0;
}`;
  const CODE_DEBUG_FIX = String.raw`#include <stdio.h>

int main()
{
    float fahr, celsius;
    fahr = 50;
    celsius = 5 * (fahr - 32) / 9; /* convert fahr to celsius */
    printf("%f degrees Fahrenheit = %f degrees Celsius\n", fahr, celsius);
    return 0;
}`;

  /* ---------------- data ---------------- */
  const KEYWORDS = new Set(
    ('auto break case char const continue default do double else enum extern float for goto if int long register return ' +
      'short signed sizeof static struct switch typedef union unsigned void volatile while inline restrict _Bool _Complex _Imaginary').split(' ')
  );
  const BLOCK_NAMES = ['score', 'total'];

  const TYPES = [
    { k: 'char', bytes: 1, signed: true, fmt: '%c／%d', kind: 'int', note: 'char 是否有號由編譯器決定，常見為 -128 ~ 127' },
    { k: 'short', bytes: 2, signed: true, fmt: '%hd', kind: 'int' },
    { k: 'int', bytes: 4, signed: true, fmt: '%d', kind: 'int' },
    { k: 'unsigned int', bytes: 4, signed: false, fmt: '%u', kind: 'int', note: '無號整數不能表示負數' },
    { k: 'long', bytes: 4, signed: true, fmt: '%ld', kind: 'int', note: 'Windows（MinGW）為 4 bytes；64 位元 Linux／macOS 為 8 bytes' },
    { k: 'long long', bytes: 8, signed: true, fmt: '%lld', kind: 'int' },
    { k: 'float', bytes: 4, fmt: '%f', kind: 'float', range: '約 ±3.4 × 10³⁸', prec: '約 7 位有效數字' },
    { k: 'double', bytes: 8, fmt: '%f／%lf', kind: 'double', range: '約 ±1.7 × 10³⁰⁸', prec: '約 15～16 位有效數字' },
  ];

  const SPEC_INFO = {
    '%c': ['int', '以字元方式輸出：把整數當成 ASCII 編碼，印出對應的字元。'],
    '%d': ['int', '以 10 進位整數輸出；字元常數（如 \'D\'）會印出它的 ASCII 編碼。'],
    '%o': ['int', '以 8 進位整數輸出（逢 8 進 1）。'],
    '%x': ['int', '以 16 進位整數輸出，使用小寫 a–f。'],
    '%X': ['int', '以 16 進位整數輸出，使用大寫 A–F。'],
    '%f': ['float', '以小數形式輸出浮點數，預設印到小數點後 6 位。'],
    '%e': ['float', '以科學記號輸出：m.dddddd e±xx，代表 m.dddddd × 10^±xx。'],
    '%E': ['float', '和 %e 相同，但指數符號用大寫 E。'],
    '%u': ['int', '以無號整數輸出；負數的位元會被當成很大的正數解讀（2³² + x）。'],
    '%%': ['none', '印出「%」符號本身；% 不是跳脫序列，所以要寫成 %%，而且不需要對應的引數。'],
  };

  const SCANF_FORMATS = {
    date: { fmt: '%d/%d/%d', vars: ['x', 'y', 'z'], decl: 'int x, y, z;' },
    two: { fmt: '%d%d', vars: ['x', 'y'], decl: 'int x, y;' },
    dc: { fmt: '%d %c', vars: ['n', 'c'], decl: 'int n; char c;' },
    c: { fmt: '%c', vars: ['c'], decl: 'char c;' },
    ff: { fmt: '%f%f', vars: ['height', 'weight'], decl: 'float height, weight;' },
  };

  /* ---------------- helpers ---------------- */
  const fmtBig = (b) => b.toLocaleString('en-US');
  const trimNum = (t) => (t.includes('e') ? t.replace(/\.?0+e/, 'e') : t.includes('.') ? t.replace(/\.?0+$/, '') : t);
  function intRange(t) {
    const bits = BigInt(t.bytes * 8);
    if (t.signed) return [-(1n << (bits - 1n)), (1n << (bits - 1n)) - 1n];
    return [0n, (1n << bits) - 1n];
  }
  function bitsOfInt(v, bytes) {
    const bits = BigInt(bytes * 8);
    const mod = 1n << bits;
    return (((v % mod) + mod) % mod).toString(2).padStart(bytes * 8, '0');
  }
  function bitsOfFloat(x, bytes) {
    const dv = new DataView(new ArrayBuffer(8));
    if (bytes === 4) {
      dv.setFloat32(0, x);
      return dv.getUint32(0).toString(2).padStart(32, '0');
    }
    dv.setFloat64(0, x);
    return dv.getUint32(0).toString(2).padStart(32, '0') + dv.getUint32(4).toString(2).padStart(32, '0');
  }
  function byteCells(bits, kind) {
    const bytes = bits.length / 8;
    const expBits = kind === 'float' ? 8 : 11;
    let out = '';
    for (let b = 0; b < bytes; b++) {
      let val = '';
      for (let k = 0; k < 8; k++) {
        const i = b * 8 + k;
        const ch = bits[i];
        if (kind === 'int') val += ch;
        else {
          const cls = i === 0 ? 'l2-s' : i <= expBits ? 'l2-e' : 'l2-m';
          val += `<span class="${cls}">${ch}</span>`;
        }
      }
      out += `<div class="cell"><span class="cell-idx">byte ${bytes - 1 - b}</span><span class="cell-val">${val}</span><span class="cell-sub">0x${parseInt(
        bits.slice(b * 8, b * 8 + 8),
        2
      )
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')}</span></div>`;
    }
    return out;
  }

  /* mini scanf: returns {items, pos, stop, status, ret} */
  function miniScanf(fmt, input, vars) {
    const isWs = (c) => c === ' ' || c === '\n' || c === '\t';
    const marks = Array.from(input, () => ({ role: 'rest' }));
    const results = [];
    let pos = 0;
    let vi = 0;
    let status = 'done';
    let stopAt = -1;
    const skipWs = () => {
      while (pos < input.length && isWs(input[pos])) {
        marks[pos] = { role: 'ws' };
        pos++;
      }
    };
    outer: for (let f = 0; f < fmt.length; f++) {
      const fc = fmt[f];
      if (isWs(fc)) {
        skipWs();
        if (pos >= input.length && f < fmt.length - 1) {
          status = 'wait';
          break;
        }
        continue;
      }
      if (fc === '%') {
        const conv = fmt[++f];
        const name = vars[vi];
        if (conv === 'c') {
          if (pos >= input.length) {
            status = 'wait';
            break;
          }
          marks[pos] = { role: 'var', v: vi };
          results.push({ name, value: input[pos], kind: 'c' });
          pos++;
          vi++;
          continue;
        }
        skipWs();
        if (pos >= input.length) {
          status = 'wait';
          break;
        }
        const rest = input.slice(pos);
        const re = conv === 'd' ? /^[+-]?\d+/ : /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/;
        const m = rest.match(re);
        if (!m) {
          status = 'fail';
          stopAt = pos;
          break outer;
        }
        for (let k = 0; k < m[0].length; k++) marks[pos + k] = { role: 'var', v: vi };
        results.push({ name, value: conv === 'd' ? parseInt(m[0], 10) : Math.fround(parseFloat(m[0])), kind: conv });
        pos += m[0].length;
        vi++;
        continue;
      }
      // literal character must match exactly
      if (pos >= input.length) {
        status = 'wait';
        break;
      }
      if (input[pos] === fc) {
        marks[pos] = { role: 'lit' };
        pos++;
      } else {
        status = 'fail';
        stopAt = pos;
        break;
      }
    }
    return { results, marks, pos, status, stopAt, ret: results.length };
  }

  /* ---------------- markup ---------------- */
  function sections() {
    const s1 = C.section(
      'l2-vars',
      '01',
      '變數（Variable）的宣告與命名',
      C.prose(`<p>變數就像記憶體裡一個有名字的「抽屜」。在 C 語言裡，<strong>使用任何新變數之前都要先宣告</strong>，讓編譯器（compiler）知道在這個 <code>{ }</code> 範圍內會用到哪些變數、各要準備多大的空間。</p>
<ul><li>宣告格式：<code>[變數型態] [變數名稱];</code></li><li>宣告時可以直接給初始值，也可以之後再賦值</li><li>一次可以宣告多個同型態的變數，用逗號隔開</li></ul>`) +
        C.code(CODE_DECL) +
        C.cards([
          { num: '1', title: '不能使用關鍵字', body: '<p>不能用 C 的 keywords（如 <code>int</code>、<code>return</code>）當名稱。</p>' },
          { num: '2', title: '只能包含三類字元', body: '<p>大小寫英文字母、底線 <code>_</code>、數字。</p>' },
          { num: '3', title: '第一個字元有限制', body: '<p>只能用字母或底線開頭，<strong>不能用數字開頭</strong>。</p>' },
          { num: '4', title: '同區塊內不能重名', body: '<p>同一個區塊 <code>{ }</code> 裡不能有兩個同名變數。</p>' },
        ]) +
        C.widget({
          id: 'l2-name',
          title: '變數名稱檢查器',
          tag: '互動',
          hint: '輸入一個名字，或點下方的範例，看看它違反了哪一條命名規則。假設目前的區塊裡已經宣告了 int score, total;',
          body: `<div class="row">${C.field('變數名稱', '<input type="text" id="l2-name-in" value="my_score" autocomplete="off" spellcheck="false">')}
<div class="row" id="l2-name-presets">${['2nd_place', 'my_score', 'int', 'total-sum', '_temp', 'MAX_SIZE', 'total', '學生']
            .map((n) => `<button type="button" class="chip" data-name="${n}">${n}</button>`)
            .join('')}</div></div>
<ul class="l2-rules" id="l2-name-rules"></ul>
<p class="feedback" id="l2-name-verdict"></p>`,
        }) +
        C.callout('tip', '小提醒', '<p>C 語言<strong>區分大小寫</strong>：<code>score</code>、<code>Score</code>、<code>SCORE</code> 是三個不同的名字。取名時盡量有意義，例如 <code>total_price</code> 比 <code>tp</code> 好讀。</p>')
    );

    const s2 = C.section(
      'l2-types',
      '02',
      '常見的變數型態',
      C.prose('<p>型態（type）決定了這個抽屜<strong>有多大</strong>、裡面的 0 與 1 要<strong>怎麼解讀</strong>。整數型態只能存整數；浮點數型態可以存小數，但精度有限。</p>') +
        C.table(
          ['型態', '說明', '數值範圍（近似值）'],
          [
            ['<code>int</code>', '整數，不含小數（例：42, -7）', '-2,147,483,648 ~ 2,147,483,647'],
            ['<code>float</code>', '單精度浮點數（例：3.14）', '約 ±3.4×10⁻³⁸ ~ 10³⁸'],
            ['<code>double</code>', '雙精度浮點數，比 float 精確', '約 ±1.7×10⁻³⁰⁸ ~ 10³⁰⁸'],
            ['<code>char</code>', "字元（例：'A'）", '0 ~ 255 或 -128 ~ 127'],
            ['<code>long</code>', '長整數，比 int 表示更大的數字', '-9,223,372,036,854,775,808 ~ 9,223,372,036,854,775,807（8 bytes 時）'],
            ['<code>short</code>', '短整數，記憶體小、範圍有限', '-32,768 ~ 32,767'],
            ['<code>unsigned</code>', '無號整數，不能為負', '0 ~ 4,294,967,295'],
            ['<code>void</code>', '無型別，常用於函式不回傳值時', '無適用範圍'],
            ['<code>bool</code>', '布林值，表示真假（需 <code>#include &lt;stdbool.h&gt;</code>）', '0（false）或 1（true）'],
          ]
        ) +
        C.callout('key', '重點', '<p>C 語言<strong>沒有原生的字串型態</strong>，字串是用「字元陣列」表示，會在後面 Strings 主題介紹。</p>') +
        C.widget({
          id: 'l2-type',
          title: '型態大小與溢位實驗',
          tag: '圖表',
          hint: '點一個型態看它佔幾個 bytes、能存的範圍；再把數字「存進去」，觀察超出範圍時發生什麼事（溢位 overflow）。',
          body: `<div class="widget-split">
  <div>
    <div class="bar-chart" id="l2-type-bars" style="--label-w:96px">${TYPES.map(
      (t, i) =>
        `<button type="button" class="bar-row" data-i="${i}" data-c="${t.kind === 'int' ? (t.signed ? 1 : 3) : t.kind === 'float' ? 2 : 4}" aria-pressed="false"><span class="bar-label">${t.k}</span><span class="bar-track"><span class="bar-fill" style="width:${(t.bytes / 8) * 100}%;display:block"></span></span><span class="bar-value">${t.bytes} B</span></button>`
    ).join('')}</div>
    <div class="legend"><span data-c="1">有號整數</span><span data-c="3">無號整數</span><span data-c="2">float</span><span data-c="4">double</span></div>
  </div>
  <div>
    <dl class="kv" id="l2-type-kv"></dl>
    <p class="caption" id="l2-type-note"></p>
  </div>
</div>
<div class="row">${C.field('存進這個型態的值', '<input type="text" id="l2-type-in" value="130" autocomplete="off" spellcheck="false">')}
<div class="row" id="l2-type-presets">${['127', '128', '300', '-1', '2147483648', "'A'", '3.99', '3.14159265358979', '16777217']
            .map((v) => `<button type="button" class="chip" data-v2="${C.esc(v)}">${C.esc(v)}</button>`)
            .join('')}</div></div>
<div class="console" data-title="存入結果" id="l2-type-out"></div>
<div class="scroll-x"><div class="cells cells--nowrap l2-bytes" id="l2-type-bits"></div></div>
<div class="legend" id="l2-type-legend"></div>`,
        })
    );

    const s3 = C.section(
      'l2-scope',
      '03',
      '變數的作用範圍：全域與區域',
      C.prose('<p>變數宣告的<strong>位置</strong>決定它在哪裡看得到（作用範圍 scope）、活多久（生命週期 lifetime）。</p>') +
        `<div class="card-grid l2-two">
<div class="card"><span class="card-num">G</span><h4>全域變數 Global</h4><ul><li><b>定義位置：</b>所有函式之外（檔案最外層）</li><li><b>作用範圍：</b>整個檔案（用 <code>extern</code> 可跨檔案），所有函式都能存取和修改</li><li><b>生命週期：</b>程式執行期間都存在</li><li><b>用途：</b>多個函式之間共享資料或狀態</li></ul></div>
<div class="card"><span class="card-num">L</span><h4>區域變數 Local</h4><ul><li><b>定義位置：</b>函式或區塊 <code>{ }</code> 之內</li><li><b>作用範圍：</b>只在該函式或區塊內有效</li><li><b>生命週期：</b>進入時建立，離開時釋放</li><li><b>用途：</b>函式內部暫存資料，不影響函式外的狀態</li></ul></div>
</div>` +
        C.widget({
          id: 'l2-scope-w',
          title: '先猜再追蹤：全域與區域變數',
          tag: '逐步執行',
          hint: '先想想看：程式最後印出的兩行分別是什麼？選一個答案，再用「下一步」逐行追蹤。',
          body: `<div class="quiz" id="l2-scope-quiz"><p class="quiz-q">這支程式會依序印出哪兩行？</p>
<div class="quiz-options">
<button type="button" class="quiz-option" data-ok="0">Global variable var = 6<br>Local variable var = 6</button>
<button type="button" class="quiz-option" data-ok="1">Global variable var = 11<br>Local variable var = 5</button>
<button type="button" class="quiz-option" data-ok="0">Global variable var = 11<br>Local variable var = 11</button>
</div><p class="feedback" id="l2-scope-fb"></p></div>
<div class="widget-split">
  ${C.code(CODE_SCOPE, { id: 'l2-scope-code' })}
  <div>
    <div class="l2-box"><h5>全域區（整個程式執行期間都存在）</h5><div id="l2-scope-global"></div></div>
    <h5 class="l2-h5">呼叫堆疊（call stack）</h5>
    <div class="stack" id="l2-scope-stack"></div>
    <p class="feedback is-info" id="l2-scope-exp"></p>
    <div class="console" data-title="輸出" id="l2-scope-out"></div>
  </div>
</div>`,
          controls: '<div id="l2-scope-step"></div>',
        })
    );

    const s4 = C.section(
      'l2-printf',
      '04',
      '格式指定字與 printf',
      C.prose(`<p>使用 <code>printf</code>／<code>scanf</code> 輸出或輸入變數時，要用<strong>格式指定字（format specifier）</strong>標明格式。它們都以 <code>%</code> 開頭，例如 <code>%d</code> 是 10 進位整數、<code>%f</code> 是小數格式。</p>
<ul><li><code>printf</code> 的第一個引數是<strong>格式化字串</strong>，之後的引數依序對應裡面的格式指定字，例如 <code>printf("x = %d, y = %d", x, y);</code></li>
<li>如果格式化字串裡沒有任何格式指定字，就不需要第二個以後的引數，例如 <code>printf("Hello CCU!");</code></li></ul>`) +
        C.table(
          ['格式', '說明', '格式', '說明'],
          [
            ['<code>%c</code>', '以字元方式輸出', '<code>%e</code>, <code>%E</code>', '科學記號顯示浮點數'],
            ['<code>%d</code>', '10 進位整數輸出', '<code>%%</code>', '顯示「%」符號本身'],
            ['<code>%o</code>', '8 進位整數輸出', '<code>%s</code>', '以字串輸出'],
            ['<code>%x</code>, <code>%X</code>', '16 進位整數輸出', '<code>%p</code>', '輸出指標位址'],
            ['<code>%f</code>', '浮點數輸出', '<code>%u</code>', '無號整數輸出'],
          ]
        ) +
        C.widget({
          id: 'l2-pf',
          title: 'printf 實驗室',
          tag: '互動',
          hint: "選一個格式指定字，輸入一個值（數字，或用單引號包住的字元如 'D'），看 printf 會印出什麼。",
          body: `${C.seg(
            'l2spec',
            Object.keys(SPEC_INFO).map((k) => [k, k]),
            '%c',
            '格式指定字'
          )}
<div class="row">${C.field('引數的值', '<input type="text" id="l2-pf-in" value="\'D\'" autocomplete="off" spellcheck="false">')}
<div class="row" id="l2-pf-presets">${["'D'", '68', '27', '-1', '3.14', '0.000123'].map((v) => `<button type="button" class="chip" data-pv="${C.esc(v)}">${C.esc(v)}</button>`).join('')}</div></div>
<div id="l2-pf-stmt"></div>
<div class="console" data-title="輸出" id="l2-pf-out"></div>
<p class="feedback" id="l2-pf-exp"></p>`,
        }) +
        C.callout('key', '同一個字元，兩種印法', "<p>字元 <code>'D'</code> 在電腦裡其實存成編碼 68。<code>%c</code> 印出字元本身，<code>%d</code> 印出它的編碼數字；反過來 <code>printf(\"%c\", 68)</code> 也會印出 D。</p>") +
        C.widget({
          id: 'l2-spec',
          title: '講義範例：Specifiers',
          tag: '執行',
          hint: '按「執行」看這支程式每一行的輸出。',
          body: `<div class="widget-split">${C.code(CODE_SPEC, { id: 'l2-spec-code' })}<div class="console" data-title="輸出" id="l2-spec-out"><span class="dim">（按下「執行」）</span></div></div>`,
          controls: '<button type="button" class="btn btn--primary" id="l2-spec-run">▶ 執行</button><button type="button" class="btn btn--ghost" id="l2-spec-clear">清除輸出</button>',
        })
    );

    const s5 = C.section(
      'l2-scanf',
      '05',
      'scanf：讀取使用者輸入',
      C.prose(`<p><code>scanf</code> 從鍵盤讀取使用者輸入，並透過變數的<strong>記憶體位址</strong>（用 <code>&amp;</code> 取得）把值存進變數，例如 <code>scanf("%d%d", &amp;x, &amp;y);</code>。第一個引數是格式化字串，之後依序是每個格式指定字對應的「變數位址」。</p>
<ul>
<li>格式字串中<strong>除了格式指定字，其餘文字都必須與輸入完全匹配</strong>；一旦不匹配，scanf 會立刻停止讀取，後面的變數就不會被賦值。</li>
<li>格式字串中的一個空白字元（空格或 <code>\\n</code>），會讓 scanf 讀取並捨棄輸入中一個或多個連續的空白字元。</li>
<li>讀整數或浮點數（<code>%d</code>、<code>%f</code>）時，前面的換行與空白會自動跳過；但讀<strong>字元</strong>（<code>%c</code>）時，換行（Enter）或空白<strong>不會</strong>自動跳過。</li>
</ul>`) +
        C.code(CODE_DATE) +
        C.callout('warn', '常見錯誤', '<p>忘記加 <code>&amp;</code>：<code>scanf("%d", x);</code> 會把 x 裡的垃圾值當成位址寫入，程式可能當掉。<code>printf</code> 只需要「值」所以不用 <code>&amp;</code>，<code>scanf</code> 要「寫入」變數所以需要位址。</p>') +
        C.widget({
          id: 'l2-scan',
          title: 'scanf 配對模擬器',
          tag: '互動',
          hint: '選擇格式字串、輸入一行文字（最後會自動加上 Enter ⏎），觀察每個字元被誰讀走、scanf 在哪裡停下。',
          body: `${C.seg(
            'l2fmt',
            [
              ['date', '%d/%d/%d'],
              ['two', '%d%d'],
              ['dc', '%d %c'],
              ['c', '%c'],
              ['ff', '%f%f'],
            ],
            'date',
            '格式字串'
          )}
<div class="row">${C.field('鍵盤輸入', '<input type="text" id="l2-scan-in" value="2025/9/20" autocomplete="off" spellcheck="false">')}
<div class="row" id="l2-scan-presets">${['2025/9/20', '2025 9 20', '2025/ 9/20', '  7 8', '7 x', ' A', '1.70 65']
            .map((v) => `<button type="button" class="chip" data-sv="${C.esc(v)}">${C.esc(v.replace(/ /g, '␣'))}</button>`)
            .join('')}</div></div>
<div id="l2-scan-stmt"></div>
<div class="scroll-x"><div class="cells cells--nowrap" id="l2-scan-cells"></div></div>
<dl class="kv" id="l2-scan-kv"></dl>
<p class="feedback" id="l2-scan-exp"></p>`,
        }) +
        C.callout('tip', '試試看', '<p>講義範例輸入 <code>2025/9/20</code> 會印出「2025年9月20日」。改成 <code>2025 9 20</code>：因為格式中的 <code>/</code> 是「一般文字」，輸入的空白與它不匹配，scanf 讀完 2025 就停下來，y 和 z 都沒被賦值。</p>')
    );

    const s6 = C.section(
      'l2-div',
      '06',
      '相除與取餘數（Division and Modulus）',
      C.prose(`<ul>
<li>兩個<strong>整數</strong>相除，小數點後會被無條件捨去：<code>7 / 2 = 3</code>（更精確地說是「向 0 截斷」）。</li>
<li><code>%</code> 只能用在整數之間，結果是除法的<strong>餘數</strong>：<code>7 % 2 = 1</code>。</li>
<li>浮點數與整數混合運算時，整數會自動被<strong>提升（implicit conversion）</strong>成浮點數再運算；也可以用 <code>(float)x</code> 強制轉型。</li>
</ul>`) +
        C.code(CODE_DIV) +
        C.widget({
          id: 'l2-dv',
          title: '整數除法視覺化',
          tag: '圖解',
          hint: '調整 x 與 y：x 個點被分成每組 y 個，能分成幾組就是商 x / y，剩下湊不滿一組的就是餘數 x % y。',
          body: `<div class="row">
${C.field('x <output id="l2-dv-xo">17</output>', '<input type="range" id="l2-dv-xr" min="-60" max="60" value="17">')}
${C.field('x', '<input type="number" id="l2-dv-x" value="17" step="1">')}
${C.field('y <output id="l2-dv-yo">5</output>', '<input type="range" id="l2-dv-yr" min="-12" max="12" value="5">')}
${C.field('y', '<input type="number" id="l2-dv-y" value="5" step="1">')}
</div>
<dl class="kv" id="l2-dv-kv"></dl>
<div class="l2-dots" id="l2-dv-dots"></div>
<p class="feedback" id="l2-dv-exp"></p>
<h5 class="l2-h5">隱式轉換小測驗：點一個運算式看結果</h5>
<div class="row" id="l2-dv-chips">${[
            ['7 / 2', '3', '兩個都是 int → 整數除法，小數被捨去。'],
            ['7 / 2.0', '3.500000', '2.0 是 double，7 會被自動提升成 7.0 再相除。'],
            ['(float)7 / 2', '3.500000', '先把 7 強制轉型成 float，另一邊的 2 也跟著被提升。'],
            ['(float)(7 / 2)', '3.000000', '括號內先做整數除法得到 3，再轉成 3.0 —— 太晚轉型了！'],
            ['7 % 2', '1', '7 = 3 × 2 + 1，餘數是 1。'],
            ['-7 / 2', '-3', 'C 的整數除法向 0 截斷：-3.5 → -3（不是 -4）。'],
            ['-7 % 2', '-1', '餘數的正負號跟被除數相同：-7 = (-3) × 2 + (-1)。'],
            ['7.0 % 2', '編譯錯誤', '% 只能用在整數之間；浮點數取餘要用 math.h 的 fmod()。'],
          ]
            .map((c) => `<button type="button" class="chip" data-expr="${C.esc(c[0])}" data-res="${C.esc(c[1])}" data-why="${C.esc(c[2])}">${C.esc(c[0])}</button>`)
            .join('')}</div>
<p class="feedback" id="l2-dv-chipfb"></p>`,
        })
    );

    const s7 = C.section(
      'l2-practice',
      '07',
      '綜合練習',
      `<h3>計算 BMI</h3>` +
        C.prose('<p>BMI = 體重（kg）÷ 身高（m）²。引入 <code>math.h</code> 才能使用 <code>pow()</code> 等數學函式；<code>pow(height, 2)</code> 就是 height 的平方。</p>') +
        C.widget({
          id: 'l2-bmi',
          title: 'BMI 計算機（照著 C 的 float 精度計算）',
          tag: '執行',
          hint: '輸入身高與體重，看程式印出的結果和 BMI 落在哪個區間（台灣國健署標準）。',
          body: `<div class="widget-split">${C.code(CODE_BMI)}<div>
<div class="row">${C.field('身高 height（m）', '<input type="number" id="l2-bmi-h" value="1.70" step="0.01" min="0.5" max="2.5">')}${C.field('體重 weight（kg）', '<input type="number" id="l2-bmi-w" value="65" step="0.5" min="10" max="300">')}</div>
<div class="console" data-title="執行結果" id="l2-bmi-out"></div>
<div class="l2-gauge" aria-hidden="true"><span style="flex:4.5;background:var(--c1)"></span><span style="flex:5.5;background:var(--ok)"></span><span style="flex:3;background:var(--warn)"></span><span style="flex:7;background:var(--err)"></span><i id="l2-bmi-mark"></i></div>
<div class="l2-gauge-labels"><span>過輕 &lt;18.5</span><span>正常</span><span>過重 ≥24</span><span>肥胖 ≥27</span></div>
<p class="feedback" id="l2-bmi-fb"></p></div></div>`,
          controls: '<button type="button" class="btn btn--primary" id="l2-bmi-run">▶ 重新執行</button><button type="button" class="btn btn--ghost" id="l2-bmi-rand">隨機一個人</button>',
        }) +
        `<h3>平均、變異數與標準差</h3>` +
        C.prose('<p><code>main</code> 先宣告函式原型，再依序呼叫三個函式。每個函式只負責一件事，呼應 Lecture 01「為什麼要寫函式」的概念。</p>') +
        C.widget({
          id: 'l2-stat',
          title: '函式呼叫流程：Cal_Average → Cal_Variance → Cal_Std',
          tag: '逐步執行',
          hint: '輸入四個數字，用「下一步」看 main 依序把工作交給三個函式。',
          body: `<div class="row">${[2, 4, 4, 6]
            .map((v, i) => C.field('abcd'[i], `<input type="number" class="l2-stat-in" value="${v}" step="any">`))
            .join('')}</div>
<div class="flow" id="l2-stat-flow"><div class="flow-node flow-node--tool">main()<small>讀入 a, b, c, d</small></div><div class="flow-arrow"></div><div class="flow-node flow-node--tool">Cal_Average()<small>算平均</small></div><div class="flow-arrow"></div><div class="flow-node flow-node--tool">Cal_Variance()<small>算變異數</small></div><div class="flow-arrow"></div><div class="flow-node flow-node--tool">Cal_Std()<small>算標準差</small></div></div>
<dl class="kv" id="l2-stat-kv"></dl>
<div class="widget-split">${C.code(CODE_STAT, { id: 'l2-stat-code' })}<div><p class="feedback is-info" id="l2-stat-exp"></p><div class="console" data-title="輸出" id="l2-stat-out"></div></div></div>`,
          controls: '<div id="l2-stat-step"></div>',
        }) +
        C.callout('key', '為什麼要拆成函式？', '<p>三個函式各自只負責一件事：出錯時可以一個一個檢查；之後別的程式要算標準差，也能直接重複使用 <code>Cal_Std</code>。</p>') +
        `<h3>除錯挑戰（Debug）</h3>` +
        C.prose('<p>課程範例裡有一支「華氏轉攝氏」的程式，但它藏了好幾個錯誤。點選你認為有錯的程式行（可以點多行），再按「檢查答案」。</p>') +
        C.widget({
          id: 'l2-dbg',
          title: '找出程式裡的錯誤',
          tag: '挑戰',
          hint: '提示：攝氏 = 5 × (華氏 − 32) ÷ 9。注意註解寫法、格式指定字、變數名稱大小寫和引數個數。',
          body: `<div id="l2-dbg-code">${C.code(CODE_DEBUG, { id: 'l2-dbg-pre' })}</div><p class="feedback" id="l2-dbg-fb"></p>`,
          controls: '<button type="button" class="btn btn--primary" id="l2-dbg-check">檢查答案</button><button type="button" class="btn" id="l2-dbg-fix">顯示修正後的程式</button><button type="button" class="btn btn--ghost" id="l2-dbg-reset">重來</button>',
        })
    );
    return s1 + s2 + s3 + s4 + s5 + s6 + s7;
  }

  /* ---------------- mount ---------------- */
  function mount(root) {
    mountName(root);
    mountTypes(root);
    mountScope(root);
    mountPrintf(root);
    mountSpec(root);
    mountScanf(root);
    mountDiv(root);
    mountBmi(root);
    mountStat(root);
    mountDebug(root);
  }

  function mountName(root) {
    const inp = $('#l2-name-in', root);
    const rules = $('#l2-name-rules', root);
    const verdict = $('#l2-name-verdict', root);
    function check() {
      const n = inp.value.trim();
      const r = [];
      const kw = KEYWORDS.has(n);
      const chars = n.length > 0 && /^[A-Za-z0-9_]+$/.test(n);
      const first = n.length > 0 && /^[A-Za-z_]/.test(n);
      const dup = BLOCK_NAMES.includes(n);
      const bad = n.length ? Array.from(new Set(n.replace(/[A-Za-z0-9_]/g, ''))).join(' ') : '';
      r.push([!kw, '不是 C 的關鍵字（keyword）', kw ? `<code>${C.esc(n)}</code> 是保留給 C 語言本身的關鍵字` : '']);
      r.push([chars, '只包含英文字母、數字、底線 _', !n.length ? '名稱不能是空的' : chars ? '' : `出現不允許的字元：<code>${C.esc(bad)}</code>`]);
      r.push([first, '以字母或底線開頭', first || !n.length ? '' : `第一個字元是 <code>${C.esc(n[0])}</code>`]);
      r.push([!dup, '同一區塊內沒有重名', dup ? `區塊裡已經有 <code>int ${C.esc(n)};</code> 了` : '目前區塊已有：score, total']);
      rules.innerHTML = r
        .map(([ok, t, why]) => `<li><span class="${ok ? 'pill-ok' : 'pill-err'}">${ok ? '通過' : '違反'}</span><span>${t}</span>${why ? `<small class="muted">${why}</small>` : ''}</li>`)
        .join('');
      const all = r.every((x) => x[0]);
      verdict.className = 'feedback ' + (all ? 'is-ok' : 'is-err');
      verdict.innerHTML = all
        ? `✓ <code>${C.esc(n)}</code> 是合法的變數名稱，可以寫 <code>int ${C.esc(n)} = 0;</code>`
        : `✗ <code>${C.esc(n || '（空白）')}</code> 不能當變數名稱。${/[^\x00-\x7f]/.test(n) ? '（部分新版編譯器接受 Unicode 名稱，但課堂規則與可攜性都建議只用英數與底線。）' : ''}`;
      $$('#l2-name-presets .chip', root).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.name === n)));
    }
    inp.addEventListener('input', check);
    $('#l2-name-presets', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-name]');
      if (!b) return;
      inp.value = b.dataset.name;
      check();
    });
    check();
  }

  function mountTypes(root) {
    const bars = $('#l2-type-bars', root);
    const kv = $('#l2-type-kv', root);
    const note = $('#l2-type-note', root);
    const inp = $('#l2-type-in', root);
    const out = $('#l2-type-out', root);
    const bitsEl = $('#l2-type-bits', root);
    const legend = $('#l2-type-legend', root);
    let sel = 2;
    function select(i) {
      sel = i;
      $$('.bar-row', bars).forEach((b, k) => {
        b.setAttribute('aria-pressed', String(k === i));
        b.classList.toggle('is-hi', k === i);
      });
      const t = TYPES[i];
      let rows = [
        ['型態', `<code>${t.k}</code>`],
        ['大小', `${t.bytes} bytes = ${t.bytes * 8} bits`],
      ];
      if (t.kind === 'int') {
        const [lo, hi] = intRange(t);
        rows.push(['最小值', fmtBig(lo)], ['最大值', fmtBig(hi)]);
      } else rows.push(['範圍', t.range], ['精度', t.prec]);
      rows.push(['printf 格式', `<code>${t.fmt}</code>`]);
      kv.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
      note.textContent = t.note || (t.kind === 'int' ? `${t.bytes * 8} 個位元最多能表示 2^${t.bytes * 8} 種不同的數。` : '浮點數用 IEEE 754 格式儲存：符號位元＋指數＋尾數。');
      store();
    }
    function store() {
      const t = TYPES[sel];
      const raw = inp.value.trim();
      let lines = [];
      let bits = '';
      let ok = true;
      const charM = raw.match(/^'(.)'$/);
      if (t.kind === 'int') {
        let big;
        const notes = [];
        if (/^[+-]?\d+$/.test(raw)) big = BigInt(raw);
        else if (charM) {
          big = BigInt(charM[1].charCodeAt(0));
          notes.push(`字元 ${raw} 的 ASCII 編碼是 ${big}`);
        } else {
          const x = Number(raw);
          if (!raw || !isFinite(x)) ok = false;
          else {
            big = BigInt(Math.trunc(x));
            if (x !== Math.trunc(x)) notes.push(`轉成整數時小數部分被捨去：${raw} → ${Math.trunc(x)}`);
          }
        }
        if (ok) {
          const bitsN = BigInt(t.bytes * 8);
          const mod = 1n << bitsN;
          let v = ((big % mod) + mod) % mod;
          if (t.signed && v >= mod / 2n) v -= mod;
          bits = bitsOfInt(v, t.bytes);
          lines.push(`${t.k} v = ${raw};`);
          lines.push(`實際存進去的值：${fmtBig(v)}`);
          notes.forEach((n) => lines.push('· ' + n));
          if (v !== big) {
            const [lo, hi] = intRange(t);
            lines.push(`<span class="err">⚠ 溢位（overflow）！${fmtBig(big)} 超出 ${fmtBig(lo)} ~ ${fmtBig(hi)}，只保留最低 ${t.bytes * 8} 個位元，結果「繞回」成 ${fmtBig(v)}。</span>`);
          } else lines.push('<span class="dim">✓ 在範圍內，原封不動存入。</span>');
        }
        legend.innerHTML = '';
      } else {
        const x = charM ? charM[1].charCodeAt(0) : Number(raw);
        if (!raw || isNaN(x)) ok = false;
        else {
          const v = t.kind === 'float' ? Math.fround(x) : x;
          bits = bitsOfFloat(v, t.bytes);
          lines.push(`${t.k} v = ${raw};`);
          lines.push(`實際存進去的值 ≈ ${isFinite(v) ? trimNum(v.toPrecision(t.kind === 'float' ? 12 : 17)) : 'inf'}`);
          lines.push(`printf("%f", v) → ${C.printf('%f', v)}`);
          if (!isFinite(v)) lines.push('<span class="err">⚠ 超出範圍，變成無限大（inf）。</span>');
          else if (v !== x) lines.push(`<span class="err">⚠ 精度不足：誤差約 ${Math.abs(v - x).toExponential(2)}。float 只有約 7 位有效數字，存不下完全相同的值。</span>`);
          else if (trimNum(v.toPrecision(17)) !== String(x) && !/e/.test(String(x)))
            lines.push(`<span class="dim">ℹ ${C.esc(String(x))} 在二進位是無限循環小數，只能存「最接近的近似值」；double 誤差極小（約第 17 位），平常看不出來。</span>`);
          else lines.push('<span class="dim">✓ 這個值可以被精確表示。</span>');
        }
        legend.innerHTML = '<span style="--series:var(--err)">符號位元 sign</span><span style="--series:var(--c3)">指數 exponent</span><span style="--series:var(--accent)">尾數 mantissa</span>';
      }
      if (!ok) {
        out.innerHTML = `<span class="err">請輸入數字，例如 300、-1、3.99，或字元 'A'。</span>`;
        bitsEl.innerHTML = '';
        inp.setAttribute('aria-invalid', 'true');
        return;
      }
      inp.removeAttribute('aria-invalid');
      out.innerHTML = lines.join('\n');
      bitsEl.innerHTML = byteCells(bits, t.kind === 'int' ? 'int' : t.kind);
    }
    bars.addEventListener('click', (e) => {
      const b = e.target.closest('.bar-row');
      if (b) select(+b.dataset.i);
    });
    inp.addEventListener('input', store);
    $('#l2-type-presets', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-v2]');
      if (!b) return;
      inp.value = b.dataset.v2;
      store();
    });
    select(0);
  }

  function mountScope(root) {
    const pre = $('#l2-scope-code', root);
    const g = $('#l2-scope-global', root);
    const stack = $('#l2-scope-stack', root);
    const exp = $('#l2-scope-exp', root);
    const out = $('#l2-scope-out', root);
    const fb = $('#l2-scope-fb', root);
    // state per step: line, global value, frames [{name, var}], access target ('g'|'m'|null), output lines, text
    const S = [
      { ln: 3, gv: 10, fr: [], acc: 'g', out: 0, t: '程式一開始，全域變數 <code>var</code> 就被配置並初始化成 10，它會存在整個程式執行期間。' },
      { ln: [6, 7], gv: 10, fr: [{ n: 'main()' }], acc: null, out: 0, t: '進入 <code>main()</code>，堆疊上推入 main 的區塊（frame）。' },
      { ln: 8, gv: 10, fr: [{ n: 'main()', v: 5 }], acc: 'm', out: 0, t: 'main 宣告了<strong>同名的區域變數</strong> <code>var = 5</code>。在 main 裡面，區域 var 會「遮蔽（shadow）」全域 var。' },
      { ln: 9, gv: 10, fr: [{ n: 'main()', v: 5 }, { n: 'Calculate()' }], acc: null, out: 0, t: '呼叫 <code>Calculate()</code>，推入新的 frame。Calculate 裡<strong>沒有</strong>宣告自己的 var。' },
      { ln: 15, gv: 11, fr: [{ n: 'main()', v: 5 }, { n: 'Calculate()' }], acc: 'g', out: 0, t: 'Calculate 找不到區域 var，於是存取<strong>全域 var</strong>：讀到 10，加 1 後寫回 11。main 的 var 完全不受影響。' },
      { ln: 16, gv: 11, fr: [{ n: 'main()', v: 5 }, { n: 'Calculate()' }], acc: 'g', out: 1, t: '印出全域 var 的值：<code>Global variable var = 11</code>。' },
      { ln: 17, gv: 11, fr: [{ n: 'main()', v: 5 }], acc: null, out: 1, t: 'Calculate 結束，它的 frame 從堆疊彈出，回到 main。' },
      { ln: 10, gv: 11, fr: [{ n: 'main()', v: 5 }], acc: 'm', out: 2, t: '回到 main，這裡的 <code>var</code> 指的是 main 自己的區域變數，值仍是 5：<code>Local variable var = 5</code>。' },
      { ln: 11, gv: 11, fr: [], acc: null, out: 2, t: '<code>return 0;</code> main 結束，區域變數被釋放；全域變數直到程式完全結束才消失。' },
    ];
    const OUT = ['Global variable var = 11', 'Local variable var = 5'];
    let prevFrames = 0;
    function render(i) {
      const s = S[i];
      C.setLines(pre, s.ln);
      const shadowed = s.fr.length === 1 && s.fr[0].v !== undefined;
      g.innerHTML = `<span class="l2-var${s.acc === 'g' ? ' is-hi' : ''}${shadowed && s.acc !== 'g' ? ' is-shadowed' : ''}">int var = ${s.gv}</span>${
        shadowed && s.acc !== 'g' ? ' <small class="muted">← 在 main 裡被同名區域變數遮蔽</small>' : ''
      }`;
      stack.innerHTML = s.fr
        .map(
          (f, k) =>
            `<div class="frame${k === s.fr.length - 1 ? ' is-top' : ''}${k >= prevFrames ? ' is-new' : ''}"><div class="frame-name">${f.n}</div><ul class="frame-vars">${
              f.v !== undefined
                ? `<li><span class="l2-var${s.acc === 'm' ? ' is-hi' : ''}">int var = ${f.v}</span></li>`
                : '<li class="muted">（沒有區域變數）</li>'
            }</ul></div>`
        )
        .join('');
      prevFrames = s.fr.length;
      exp.innerHTML = s.t;
      out.innerHTML = OUT.slice(0, s.out).map(C.esc).join('\n') + (s.out < 2 ? '<span class="cursor"></span>' : '');
    }
    C.stepper($('#l2-scope-step', root), { count: S.length, render, interval: 1600 });
    $('#l2-scope-quiz', root).addEventListener('click', (e) => {
      const b = e.target.closest('.quiz-option');
      if (!b) return;
      $$('.quiz-option', root).forEach((o) => o.classList.remove('is-correct', 'is-wrong'));
      const ok = b.dataset.ok === '1';
      b.classList.add(ok ? 'is-correct' : 'is-wrong');
      fb.className = 'feedback ' + (ok ? 'is-ok' : 'is-err');
      fb.innerHTML = ok
        ? '答對了！Calculate() 改的是全域 var（10 → 11）；main 印的是自己的區域 var（5）。下面逐步追蹤驗證一次。'
        : '再想想：Calculate() 裡沒有區域 var，它改的是哪一個 var？main 裡印的 var 又是哪一個？用下方「下一步」追蹤看看。';
    });
  }

  function parseVal(s) {
    s = s.trim();
    let m = s.match(/^'(\\.|.)'$/);
    if (m) {
      const ch = C.unescape(m[1]);
      return { kind: 'char', v: ch, num: ch.charCodeAt(0), lit: s };
    }
    if (/^[+-]?\d+$/.test(s)) return { kind: 'int', v: parseInt(s, 10), num: parseInt(s, 10), lit: s };
    if (/^0[xX][0-9a-fA-F]+$/.test(s)) return { kind: 'int', v: parseInt(s, 16), num: parseInt(s, 16), lit: s };
    if (/^[+-]?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$/.test(s)) return { kind: 'float', v: Number(s), num: Number(s), lit: s };
    return null;
  }

  function mountPrintf(root) {
    let spec = '%c';
    const inp = $('#l2-pf-in', root);
    const stmt = $('#l2-pf-stmt', root);
    const out = $('#l2-pf-out', root);
    const exp = $('#l2-pf-exp', root);
    function run() {
      const [want, desc] = SPEC_INFO[spec];
      inp.disabled = spec === '%%';
      if (spec === '%%') {
        stmt.innerHTML = C.code('printf("%%\\n");', { cls: 'code--plain' });
        out.textContent = C.printf('%%');
        exp.className = 'feedback is-info';
        exp.innerHTML = desc;
        return;
      }
      const p = parseVal(inp.value);
      if (!p) {
        stmt.innerHTML = '';
        out.innerHTML = '<span class="err">看不懂這個值。請輸入整數（68）、小數（3.14）或字元（\'D\'）。</span>';
        exp.className = 'feedback';
        exp.textContent = '';
        return;
      }
      stmt.innerHTML = C.code(`printf("${spec}\\n", ${p.lit});`, { cls: 'code--plain' });
      const argIsFloat = p.kind === 'float';
      const mismatch = (want === 'int' && argIsFloat) || (want === 'float' && !argIsFloat);
      if (mismatch) {
        out.innerHTML = '<span class="err">？？？（未定義行為：可能印出任何東西）</span>';
        const fix = want === 'int' ? `(int)${p.lit}` : `(double)${p.lit}`;
        const fixed = want === 'int' ? C.printf(spec, Math.trunc(p.num)) : C.printf(spec, p.num);
        exp.className = 'feedback is-err';
        exp.innerHTML = `<span class="pill-err">型別不符</span> ${spec} 需要${want === 'int' ? '整數' : '浮點數（double）'}，但你給的是${
          argIsFloat ? '浮點數' : p.kind === 'char' ? '字元（會被當成 int）' : '整數'
        }。printf 不會自動幫你轉型，這在 C 裡是<strong>未定義行為（undefined behavior）</strong>。<br>正確寫法：<code>printf("${spec}", ${fix});</code> → <code>${C.esc(fixed)}</code>`;
        return;
      }
      const arg = p.kind === 'char' ? p.v : p.num;
      const res = C.printf(spec, arg);
      out.textContent = res;
      let extra = '';
      if (spec === '%c' && p.kind !== 'char') extra = `編碼 ${p.num} 對應的字元是「${C.esc(res)}」。`;
      if (spec === '%d' && p.kind === 'char') extra = `${p.lit} 在記憶體裡存成編碼 ${p.num}。`;
      if (spec === '%o') extra = `${p.num} 換成 8 進位是 ${C.printf('%o', p.num)}。`;
      if (spec === '%x' || spec === '%X') extra = `${p.num} 換成 16 進位是 ${C.printf(spec, p.num)}。`;
      if (spec === '%u' && p.num < 0) extra = `負數 ${p.num} 的位元被當成無號數：2³² + (${p.num}) = ${C.printf('%u', p.num)}。`;
      if ((spec === '%c' || spec === '%d') && p.kind === 'int' && (p.num < 0 || p.num > 255) && spec === '%c') extra += ' 超出 0~255，只取最低 8 位元。';
      exp.className = 'feedback is-ok';
      exp.innerHTML = `<span class="pill-ok">${spec}</span> ${desc} ${extra}`;
    }
    C.onSeg(root, 'l2spec', (v) => {
      spec = v;
      run();
    });
    inp.addEventListener('input', run);
    $('#l2-pf-presets', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-pv]');
      if (!b) return;
      inp.value = b.dataset.pv;
      if (spec === '%%') {
        spec = /^'/.test(b.dataset.pv) ? '%c' : /[.eE]/.test(b.dataset.pv) ? '%f' : '%d';
        C.setSeg(root, 'l2spec', spec);
      }
      run();
    });
    run();
  }

  function mountSpec(root) {
    const out = $('#l2-spec-out', root);
    const pre = $('#l2-spec-code', root);
    let timer = null;
    $('#l2-spec-run', root).addEventListener('click', () => {
      if (timer) C.stop(timer);
      out.textContent = '';
      let i = 0;
      const step = () => {
        if (i >= SPEC_LINES.length) {
          C.stop(timer);
          timer = null;
          C.setLines(pre, 16);
          out.insertAdjacentHTML('beforeend', '<span class="dim">\n（程式結束，回傳 0）</span>');
          return;
        }
        C.setLines(pre, 6 + i);
        out.insertAdjacentText('beforeend', C.printf(SPEC_LINES[i][0], SPEC_LINES[i][1]));
        i++;
      };
      step();
      timer = C.every(step, C.reduced() ? 30 : 380);
    });
    $('#l2-spec-clear', root).addEventListener('click', () => {
      if (timer) C.stop(timer);
      timer = null;
      C.setLines(pre, []);
      out.innerHTML = '<span class="dim">（按下「執行」）</span>';
    });
  }

  function mountScanf(root) {
    let key = 'date';
    const inp = $('#l2-scan-in', root);
    const cells = $('#l2-scan-cells', root);
    const kv = $('#l2-scan-kv', root);
    const exp = $('#l2-scan-exp', root);
    const stmt = $('#l2-scan-stmt', root);
    function run() {
      const F = SCANF_FORMATS[key];
      const input = inp.value + '\n';
      stmt.innerHTML = C.code(`${F.decl}\nscanf("${F.fmt}", ${F.vars.map((v) => '&' + v).join(', ')});`, { cls: 'code--plain' });
      const r = miniScanf(F.fmt, input, F.vars);
      cells.innerHTML = Array.from(input)
        .map((ch, i) => {
          const m = r.marks[i];
          let cls = 'cell';
          let sub = '';
          let dc = '';
          if (m.role === 'var') {
            dc = ` data-c="${m.v + 1}"`;
            sub = F.vars[m.v];
          } else if (m.role === 'ws') {
            cls += ' is-dim';
            sub = '略過';
          } else if (m.role === 'lit') {
            cls += ' is-dim';
            sub = '比對 ✓';
          } else if (i === r.stopAt) {
            cls += ' is-err';
            sub = '停在這';
          } else {
            sub = '留在緩衝區';
          }
          return `<div class="${cls}"${dc}><span class="cell-idx">${i}</span><span class="cell-val">${C.esc(showCh(ch))}</span><span class="cell-sub">${sub}</span></div>`;
        })
        .join('');
      kv.innerHTML =
        F.vars
          .map((v, i) => {
            const res = r.results[i];
            const val = res ? (res.kind === 'c' ? `'${C.esc(showCh(res.value))}'（${res.value.charCodeAt(0)}）` : res.kind === 'f' ? C.printf('%f', res.value) : res.value) : '未賦值';
            return `<div${res ? '' : ' class="is-hi"'}><dt>${v}</dt><dd>${val}</dd></div>`;
          })
          .join('') + `<div><dt>scanf 回傳值</dt><dd>${r.status === 'wait' && r.ret === 0 ? '（等待中）' : r.ret}</dd></div>`;
      let msg = '';
      let cls = 'is-ok';
      if (r.status === 'done') msg = `成功讀到 ${r.ret} 個值，全部變數都被賦值。`;
      else if (r.status === 'fail') {
        cls = 'is-err';
        const ch = input[r.stopAt];
        msg = `在第 ${r.stopAt} 個字元「${C.esc(showCh(ch))}」配對失敗，scanf 立刻停止，只成功讀到 ${r.ret} 個值；沒被賦值的變數保留原本的<strong>垃圾值</strong>，剩下的字元留在緩衝區。`;
      } else {
        cls = 'is-info';
        msg = `輸入已經讀完，但格式還沒配對完 —— 真實的 scanf 會<strong>繼續等待</strong>你輸入更多內容（游標停在那邊不動）。`;
      }
      if (key === 'date') {
        const v = (i) => (r.results[i] ? r.results[i].value : '(垃圾值)');
        msg += `<br>接著 <code>printf("%d年%d月%d日\\n", x, y, z);</code> 會印出：<strong>${C.esc(v(0) + '年' + v(1) + '月' + v(2) + '日')}</strong>`;
      }
      if (key === 'c' && input[0] === ' ') msg += '<br>注意：<code>%c</code> 不會跳過空白，所以讀到的是空格本身！在格式前加一個空白 <code>" %c"</code> 就能先略過空白。';
      exp.className = 'feedback ' + cls;
      exp.innerHTML = msg;
    }
    C.onSeg(root, 'l2fmt', (v) => {
      key = v;
      run();
    });
    inp.addEventListener('input', run);
    $('#l2-scan-presets', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-sv]');
      if (!b) return;
      inp.value = b.dataset.sv;
      run();
    });
    run();
  }

  function mountDiv(root) {
    const xr = $('#l2-dv-xr', root);
    const yr = $('#l2-dv-yr', root);
    const xi = $('#l2-dv-x', root);
    const yi = $('#l2-dv-y', root);
    const kv = $('#l2-dv-kv', root);
    const dots = $('#l2-dv-dots', root);
    const exp = $('#l2-dv-exp', root);
    function run(src) {
      if (src === 'r') {
        xi.value = xr.value;
        yi.value = yr.value;
      }
      const x = Math.trunc(Number(xi.value) || 0);
      const y = Math.trunc(Number(yi.value) || 0);
      xr.value = C.clamp(x, -60, 60);
      yr.value = C.clamp(y, -12, 12);
      $('#l2-dv-xo', root).textContent = x;
      $('#l2-dv-yo', root).textContent = y;
      if (y === 0) {
        kv.innerHTML = `<div><dt>x / y</dt><dd>—</dd></div><div><dt>x % y</dt><dd>—</dd></div>`;
        dots.innerHTML = '';
        exp.className = 'feedback is-err';
        exp.innerHTML = '除以 0 是<strong>未定義行為</strong>：整數除以 0 通常會讓程式直接當掉（例如 Windows 顯示程式已停止運作）。寫程式時要先檢查除數不是 0。';
        return;
      }
      const q = Math.trunc(x / y);
      const r = x - q * y;
      const f = Math.fround(Math.fround(x) / y);
      kv.innerHTML = [
        ['x / y（整數除法）', q],
        ['x % y（餘數）', r],
        ['(float)x / y', C.printf('%f', f)],
        ['驗算 (x/y)*y + x%y', `${q}×${y} + ${r} = ${q * y + r}`],
      ]
        .map(([k, v], i) => `<div${i < 2 ? ' class="is-hi"' : ''}><dt>${k}</dt><dd>${v}</dd></div>`)
        .join('');
      const ax = Math.abs(x);
      const ay = Math.abs(y);
      if (ax <= 60) {
        const full = Math.floor(ax / ay);
        const rem = ax % ay;
        let h = '';
        for (let g = 0; g < full; g++) h += `<div class="l2-group" title="第 ${g + 1} 組">${'<span class="l2-dot"></span>'.repeat(ay)}</div>`;
        if (rem) h += `<div class="l2-group is-rem" title="餘數">${'<span class="l2-dot"></span>'.repeat(rem)}</div>`;
        dots.innerHTML = h || '<span class="muted">（x = 0，沒有點）</span>';
      } else dots.innerHTML = '<span class="muted">（|x| 超過 60，只顯示數字）</span>';
      exp.className = 'feedback is-info';
      exp.innerHTML =
        x < 0 || y < 0
          ? `有負數時，C 的整數除法<strong>向 0 截斷</strong>：${x} / ${y} = ${(x / y).toFixed(3).replace(/\.?0+$/, '')} → ${q}；餘數的正負號<strong>跟被除數 x 相同</strong>，所以 ${x} % ${y} = ${r}。`
          : `${ax} 個點每 ${ay} 個一組，可以分成 <strong>${q}</strong> 組，剩下 <strong>${r}</strong> 個（螢光色那組）。小數部分直接被捨去，不會四捨五入。`;
    }
    xr.addEventListener('input', () => run('r'));
    yr.addEventListener('input', () => run('r'));
    xi.addEventListener('input', () => run('n'));
    yi.addEventListener('input', () => run('n'));
    const chipfb = $('#l2-dv-chipfb', root);
    $('#l2-dv-chips', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-expr]');
      if (!b) return;
      $$('#l2-dv-chips .chip', root).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      chipfb.className = 'feedback ' + (b.dataset.res === '編譯錯誤' ? 'is-err' : 'is-ok');
      chipfb.innerHTML = `<code>${C.esc(b.dataset.expr)}</code> → <strong>${C.esc(b.dataset.res)}</strong>　${C.esc(b.dataset.why)}`;
    });
    run('n');
  }

  function mountBmi(root) {
    const h = $('#l2-bmi-h', root);
    const w = $('#l2-bmi-w', root);
    const out = $('#l2-bmi-out', root);
    const mark = $('#l2-bmi-mark', root);
    const fb = $('#l2-bmi-fb', root);
    function run() {
      const hf = Math.fround(Number(h.value));
      const wf = Math.fround(Number(w.value));
      if (!(hf > 0) || !(wf > 0)) {
        out.innerHTML = '<span class="err">請輸入大於 0 的身高與體重。</span>';
        fb.textContent = '';
        return;
      }
      const bmi = Math.fround(wf / Math.pow(hf, 2));
      out.innerHTML = `Input your height (m) and weight (kg):<span class="in">${C.esc(h.value)} ${C.esc(w.value)}</span>\n${C.esc(C.printf('Your BMI is %f\n', bmi))}`;
      mark.style.left = C.clamp(((bmi - 14) / 20) * 100, 0, 100) + '%';
      const cat = bmi < 18.5 ? ['過輕', 'is-info'] : bmi < 24 ? ['正常範圍', 'is-ok'] : bmi < 27 ? ['過重', 'is-err'] : ['肥胖', 'is-err'];
      fb.className = 'feedback ' + cat[1];
      fb.innerHTML = `BMI = ${C.esc(w.value)} ÷ ${C.esc(h.value)}² ≈ ${bmi.toFixed(2)}，屬於「${cat[0]}」。注意 <code>%f</code> 預設印到小數點後 6 位。`;
    }
    h.addEventListener('input', run);
    w.addEventListener('input', run);
    $('#l2-bmi-run', root).addEventListener('click', () => {
      out.innerHTML = '<span class="cursor"></span>';
      C.after(run, 250);
    });
    $('#l2-bmi-rand', root).addEventListener('click', () => {
      h.value = (1.5 + Math.random() * 0.4).toFixed(2);
      w.value = String(Math.round(40 + Math.random() * 60));
      run();
    });
    run();
  }

  function mountStat(root) {
    const ins = $$('.l2-stat-in', root);
    const nodes = $$('#l2-stat-flow .flow-node', root);
    const kv = $('#l2-stat-kv', root);
    const exp = $('#l2-stat-exp', root);
    const out = $('#l2-stat-out', root);
    const pre = $('#l2-stat-code', root);
    const range = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
    let vals;
    function compute() {
      const [a, b, c, d] = ins.map((i) => Math.fround(Number(i.value) || 0));
      const avg = Math.fround(Math.fround(Math.fround(Math.fround(a + b) + c) + d) / 4);
      const v = Math.fround((Math.pow(a - avg, 2) + Math.pow(b - avg, 2) + Math.pow(c - avg, 2) + Math.pow(d - avg, 2)) / 4);
      const sd = Math.fround(Math.sqrt(v));
      vals = { a, b, c, d, avg, v, sd };
    }
    const STEPS = [
      { node: 0, ln: [11, 12], t: () => `main 印出提示並用 <code>scanf("%f%f%f%f", ...)</code> 讀入 a=${vals.a}, b=${vals.b}, c=${vals.c}, d=${vals.d}。` },
      { node: 1, ln: [13, ...range(20, 24)], t: () => `呼叫 <code>Cal_Average(a, b, c, d)</code>：(${vals.a}+${vals.b}+${vals.c}+${vals.d}) / 4 = ${C.printf('%f', vals.avg)}，回傳給 main 的 avg。` },
      { node: 2, ln: [14, ...range(26, 30)], t: () => `呼叫 <code>Cal_Variance(..., avg)</code>：每個數和平均的差平方，加總後除以 4 = ${C.printf('%f', vals.v)}。` },
      { node: 3, ln: [15, ...range(32, 36)], t: () => `呼叫 <code>Cal_Std(var)</code>：標準差 = √變異數 = ${C.printf('%f', vals.sd)}。` },
      { node: 4, ln: [16], t: () => '三個結果都拿到了，main 用一行 printf 把它們印出來。' },
    ];
    let cur = 0;
    function render(i) {
      cur = i;
      compute();
      const s = STEPS[i];
      nodes.forEach((n, k) => {
        n.classList.toggle('is-active', k === s.node || (s.node === 4 && k === 0));
        n.classList.toggle('is-done', k > 0 && k < s.node);
      });
      $$('#l2-stat-flow .flow-arrow', root).forEach((a, k) => {
        a.classList.toggle('is-done', k < s.node - 1 || (s.node === 4 && k < 3));
        a.classList.toggle('is-active', k === s.node - 1 && s.node < 4);
      });
      C.setLines(pre, s.ln);
      kv.innerHTML = [
        ['avg', i >= 1 ? C.printf('%f', vals.avg) : '?'],
        ['var', i >= 2 ? C.printf('%f', vals.v) : '?'],
        ['std', i >= 3 ? C.printf('%f', vals.sd) : '?'],
      ]
        .map(([k, v], j) => `<div${j === i - 1 ? ' class="is-hi"' : ''}><dt>${k}</dt><dd>${v}</dd></div>`)
        .join('');
      exp.innerHTML = s.t();
      out.innerHTML =
        `Please enter four numbers: \n<span class="in">${[vals.a, vals.b, vals.c, vals.d].join(' ')}</span>\n` +
        (i >= 4 ? C.esc(C.printf('Mean: %f, Variance: %f, Standard deviation: %f', vals.avg, vals.v, vals.sd)) : '<span class="cursor"></span>');
    }
    const st = C.stepper($('#l2-stat-step', root), { count: STEPS.length, render, interval: 1500 });
    ins.forEach((i) => i.addEventListener('input', () => render(cur)));
    void st;
  }

  function mountDebug(root) {
    const BUGS = { 7: '第 7 行：公式寫反了，應該是 5 * (fahr - 32) / 9；而且 \\* 不是註解，要寫成 /* ... */ 或 //。', 8: '第 8 行：fahr、celsius 是 float，要用 %f 而不是 %d；Fahr 大小寫寫錯（C 區分大小寫）；而且只給了 1 個引數，少了 celsius。' };
    const box = $('#l2-dbg-code', root);
    const fb = $('#l2-dbg-fb', root);
    function wire() {
      $$('.line', box).forEach((l) => {
        l.setAttribute('tabindex', '0');
        l.setAttribute('role', 'button');
        l.classList.add('l2-pick');
        const toggle = () => {
          l.classList.toggle('is-flag');
          l.setAttribute('aria-pressed', String(l.classList.contains('is-flag')));
        };
        l.addEventListener('click', toggle);
        l.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });
    }
    function reset() {
      box.innerHTML = C.code(CODE_DEBUG, { id: 'l2-dbg-pre' });
      fb.className = 'feedback';
      fb.textContent = '';
      wire();
    }
    $('#l2-dbg-check', root).addEventListener('click', () => {
      const lines = $$('.line', box);
      const picked = lines.map((l, i) => (l.classList.contains('is-flag') ? i + 1 : 0)).filter(Boolean);
      const hit = picked.filter((n) => BUGS[n]);
      const wrong = picked.filter((n) => !BUGS[n]);
      lines.forEach((l, i) => {
        l.classList.toggle('is-active', !!BUGS[i + 1]);
      });
      const ok = hit.length === 2 && wrong.length === 0;
      fb.className = 'feedback ' + (ok ? 'is-ok' : 'is-err');
      fb.innerHTML =
        (ok ? '全部找到了！' : `你找到 ${hit.length} / 2 行有錯${wrong.length ? `，另外第 ${wrong.join('、')} 行其實沒問題` : ''}。螢光標示的是有錯的行：`) +
        '<br>' +
        Object.values(BUGS).map(C.esc).join('<br>');
    });
    $('#l2-dbg-fix', root).addEventListener('click', () => {
      box.innerHTML = C.code(CODE_DEBUG_FIX, { id: 'l2-dbg-pre' });
      C.setLines($('#l2-dbg-pre', root), [7, 8]);
      fb.className = 'feedback is-ok';
      fb.innerHTML = '修正後的輸出：<code>' + C.esc(C.printf('%f degrees Fahrenheit = %f degrees Celsius', 50, Math.fround((5 * (50 - 32)) / 9))) + '</code>';
    });
    $('#l2-dbg-reset', root).addEventListener('click', reset);
    wire();
  }

  /* ---------------- register ---------------- */
  C.register({
    id: 'l2',
    order: 2,
    num: '02',
    title: '資料型態、運算子與輸入輸出',
    en: 'Data Types, Operators, and I/O',
    lede: '變數是記憶體裡一格一格有名字的抽屜；型態決定抽屜有多大、裡面的位元怎麼解讀。這一講學會宣告變數、分辨全域與區域，並用 printf／scanf 和使用者溝通。',
    desc: '型態大小與溢位、全域 vs 區域、printf 格式指定字、scanf 配對規則、整數除法。',
    tags: ['資料型態', 'printf', 'scanf', '% 取餘數'],
    objectives: [
      'C 語言常見的資料型態，以及變數的宣告與命名規則',
      '全域變數與區域變數的差異、作用範圍',
      '如何使用 printf／scanf 搭配格式指定字做輸出入',
      '除法與取餘數的運算規則，並透過範例練習',
    ],
    sections,
    recap: [
      '使用變數前必須先宣告：<code>[型態] [名稱];</code>，名稱要遵守四條命名規則',
      'C 的基本資料型態：int、float、double、char… 大小與儲存範圍各不同，超出範圍會溢位',
      '全域變數整個檔案共用；區域變數只在函式或區塊內有效，同名時區域變數會遮蔽全域變數',
      'printf／scanf 搭配格式指定字完成資料輸出入；scanf 要傳變數位址 <code>&amp;x</code>',
      '整數相除會捨去小數（向 0 截斷）；<code>%</code> 只能用在整數之間',
    ],
    practice:
      '① 讓使用者輸入英呎和英寸，轉換為公分，並用科學記號（<code>%e</code>）表示。② 讓使用者輸入三維空間的 2 點座標 (x1, y1, z1)、(x2, y2, z2)，練習用 <code>pow()</code> 和 <code>sqrt()</code> 計算兩點的歐基里得距離。',
    css: `
.l2-rules{list-style:none;margin:var(--s4) 0 0;padding:0;display:grid;gap:6px}
.l2-rules li{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;padding:6px 10px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm)}
.l2-rules li > span:first-child{min-width:4.6em;justify-content:center}
.l2-rules small{flex:1 1 100%;padding-left:calc(4.6em + 10px)}
@media (max-width:520px){.l2-rules small{padding-left:0}}
button.bar-row{width:100%;margin:0;padding:4px 6px;font:inherit;font-family:var(--font-mono);font-size:.82rem;color:inherit;text-align:left;background:transparent;border:1px solid transparent;border-radius:var(--r-sm);cursor:pointer;transition:background .15s,border-color .15s}
button.bar-row:hover{background:var(--surface-2);border-color:var(--line-strong)}
button.bar-row[aria-pressed="true"]{background:var(--hi);border-color:var(--accent-2)}
.l2-bytes .cell{min-width:86px}
.l2-bytes .cell-val{font-size:.82rem;letter-spacing:.04em}
.l2-s{color:var(--err)}.l2-e{color:var(--c3)}.l2-m{color:var(--accent)}
.l2-two .card ul{margin:0;padding-left:1.1em;font-size:.92rem;line-height:1.75}
.l2-box{padding:var(--s2) var(--s3);background:var(--surface);border:1.5px dashed var(--line-strong);border-radius:var(--r-sm)}
.l2-box h5,.l2-h5{margin:var(--s3) 0 var(--s2);font-size:.8rem;font-weight:500;color:var(--muted)}
.l2-box h5{margin-top:0}
.l2-var{display:inline-flex;align-items:center;gap:6px;padding:2px 10px;font-family:var(--font-mono);font-weight:700;border:1.5px solid var(--line-strong);border-radius:6px;transition:background .25s,border-color .25s,opacity .25s}
.l2-var.is-hi{background:var(--hi);border-color:var(--accent-2);color:var(--ink)}
.l2-var.is-shadowed{opacity:.45;text-decoration:line-through}
.l2-dots{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start;min-height:30px}
.l2-group{display:flex;flex-wrap:wrap;gap:3px;max-width:112px;padding:5px;border:1.5px dashed var(--line-strong);border-radius:8px;animation:cell-pop .35s var(--ease)}
.l2-group.is-rem{background:var(--hi);border:1.5px solid var(--accent-2)}
.l2-dot{width:12px;height:12px;border-radius:50%;background:var(--accent)}
.l2-group.is-rem .l2-dot{background:var(--accent-2)}
.l2-gauge{position:relative;display:flex;height:14px;margin:var(--s5) 0 4px;border-radius:99px;overflow:visible}
.l2-gauge span:first-child{border-radius:99px 0 0 99px}.l2-gauge span:nth-child(4){border-radius:0 99px 99px 0}
.l2-gauge i{position:absolute;top:-9px;width:0;height:0;margin-left:-7px;border:7px solid transparent;border-top:9px solid var(--ink);transition:left .4s var(--ease)}
.l2-gauge-labels{display:flex;justify-content:space-between;font-size:.72rem;color:var(--muted);gap:4px}
.code .line.l2-pick{cursor:pointer}
.code .line.l2-pick:hover{background:rgba(255,255,255,.06)}
.code .line.is-flag{background:color-mix(in srgb,var(--err) 28%,transparent);box-shadow:inset 3px 0 0 var(--err)}
`,
    mount,
  });
})();
