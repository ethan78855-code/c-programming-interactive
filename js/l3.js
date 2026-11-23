/* =========================================================
   Lecture 03 — 運算子、陣列、字串與流程控制
   ========================================================= */
(function () {
  'use strict';

  /* ---------- gist example code ---------- */
  const MODULUS = String.raw`#include <stdio.h>

int main()
{
    int num;
    printf("Enter a 3-digit number: ");
    scanf("%d", &num);
    printf("Hundreds: %d\n", num/100);
    printf("Tens: %d\n", (num/10)%10);
    printf("Units: %d\n", num%10);
    return 0;
}`;

  const DECODER = String.raw`#include <stdio.h>

int main()
{
    char list[] = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '\0'};
    int num;
    printf("Enter a 3-digit number: ");
    scanf("%3d", &num);
    printf("%c%c%c\n", list[num/100], list[(num/10)%10], list[num%10]);
    return 0;
}`;

  const LOGIC = String.raw`#include <stdio.h>

int main()
{
    int num = 25;
    printf("%d\n", num > 10 && num < 28);
    printf("%d\n", num > 30 || num < 20);
    printf("%d\n", num > 30 || num < 50);
    printf("%d\n", num != 26 && num < 28);
    printf("%d\n", !(num != 26 && num < 28));
    return 0;
}`;

  const TERN = String.raw`#include <stdio.h>

int main()
{
    int x;
    printf("Please enter a positive number: ");
    scanf("%d", &x);
    printf("Is x divisible by 4? %c\n", (x%4 == 0)?'Y':'N');
    return 0;
}`;

  const TERN_IF = String.raw`char ans;
if (x % 4 == 0)
    ans = 'Y';
else
    ans = 'N';
printf("Is x divisible by 4? %c\n", ans);`;

  const IF_SYNTAX = String.raw`if (條件1) {
    敘述1;
}
else if (條件2) {
    敘述2;
}
else {
    敘述3;
}`;

  const IFGRADE = String.raw`#include <stdio.h>

int main()
{
    char x;
    printf("Enter grade: ");
    scanf("%c", &x);
    if(x == 'A' || x == 'a')
        printf("Excellent!\n");
    else if(x == 'B' || x == 'b')
        printf("Good!\n");
    else if(x == 'C' || x == 'c')
        printf("Fair!\n");
    else
        printf("Poor!\n");
    return 0;
}`;

  const IFDIV = String.raw`#include <stdio.h>

int main()
{
    int x;
    printf("Enter a positive number: ");
    scanf("%d", &x);
    if(!(x%2))
        printf("x is an even number\n");
    else if(!(x%3))
        printf("x is not an even number but is divisible by 3");
    else
        printf("x is not an even number and is not divisible by 3\n");
    return 0;
}`;

  const IFFLAG = String.raw`#include <stdio.h>

int main()
{
    int flag;
    printf("Enter 0 (false) or 1 (True): ");
    scanf("%d", &flag);
    if(flag != 0 && flag != 1)
        printf("Invalid input!\n");
    else if(flag)
        printf("True\n");
    else
        printf("False\n");
    return 0;
}`;

  const SWITCH = String.raw`#include <stdio.h>

int main()
{
    char x;
    printf("Enter grade: ");
    scanf("%c", &x);
    switch(x){
        case 'A':
        case 'a':
            printf("Excellent!\n");
            break;
        case 'B':
        case 'b':
            printf("Good!\n");
            break;
        case 'C':
        case 'c':
            printf("Fair!\n");
            break;
        default:
            printf("Poor!\n");
    }
    return 0;
}`;

  /* ---------- small helpers ---------- */
  const lineOf = (src, needle, from = 0) => {
    const lines = src.split('\n');
    for (let k = from; k < lines.length; k++) if (lines[k].includes(needle)) return k + 1;
    return -1;
  };
  const bin = (n, w = 8) => ((n >>> 0) & (w >= 32 ? 0xffffffff : (1 << w) - 1)).toString(2).padStart(w, '0');
  const pill = (ok, text) => `<span class="${ok ? 'pill-ok' : 'pill-err'}">${text}</span>`;
  const bitsHTML = (v, w = 8, opts = {}) => {
    let s = `<div class="bits"${opts.id ? ` id="${opts.id}"` : ''}>`;
    for (let k = w - 1; k >= 0; k--) {
      const on = (v >>> k) & 1;
      const hi = opts.hi != null && (opts.hi >>> k) & 1 ? ' is-hi' : '';
      const dim = opts.dim != null && (opts.dim >>> k) & 1 ? ' is-dim' : '';
      if (opts.btn)
        s += `<button type="button" class="bit${on ? ' is-on' : ''}${hi}${dim}" data-bit="${k}" aria-pressed="${!!on}" aria-label="位元 ${k}（2 的 ${k} 次方）目前是 ${on}">${on}</button>`;
      else s += `<span class="bit${on ? ' is-on' : ''}${hi}${dim}">${on}</span>`;
      if (k % 4 === 0 && k) s += '<span class="bits-gap"></span>';
    }
    return s + '</div>';
  };
  const labelRow = (w = 8) => {
    let s = '<div class="bits l3-labels" aria-hidden="true">';
    for (let k = w - 1; k >= 0; k--) {
      s += `<span class="bit-label">${2 ** k}</span>`;
      if (k % 4 === 0 && k) s += '<span class="bits-gap"></span>';
    }
    return s + '</div>';
  };
  const fieldNum = (id, label, value, min, max, extra = '') =>
    C.field(label, `<input type="number" id="${id}" value="${value}"${min != null ? ` min="${min}"` : ''}${max != null ? ` max="${max}"` : ''} ${extra}>`);

  /* =========================================================
     Section HTML
     ========================================================= */
  function sections() {
    const s1 =
      C.prose(`<p>C 語言的<strong>算術運算子（arithmetic operators）</strong>跟數學課學的很像，但有兩個一定要記住的差別：<strong>兩個整數相除，小數部分會被直接捨去</strong>；而<strong>取餘數 <code>%</code> 只能用在整數之間</strong>。</p>`) +
      C.table(
        ['運算子', '說明', '範例', '當 a = 7、b = 2'],
        [
          ['<code>+</code>', '加法', '<code>a + b</code>', '<code>9</code>'],
          ['<code>-</code>', '減法', '<code>a - b</code>', '<code>5</code>'],
          ['<code>*</code>', '乘法', '<code>a * b</code>', '<code>14</code>'],
          ['<code>/</code>', '除法', '<code>a / b</code>', '<code>3</code>（小數被捨去）'],
          ['<code>%</code>', '取餘數（模）', '<code>a % b</code>', '<code>1</code>'],
        ]
      ) +
      `<h3>取餘數的妙用：拆出每一位數</h3>` +
      C.prose(`<p>把「除法」和「取餘數」搭配起來，就能把一個三位數拆成百位、十位、個位：</p>
<ul>
<li><code>num / 100</code> 取到<strong>百位數</strong>：例如 <code>246 / 100 = 2</code></li>
<li><code>(num / 10) % 10</code> 取到<strong>十位數</strong>：先除以 10 把個位「丟掉」（得到 24），再對 10 取餘數（得到 4）</li>
<li><code>num % 10</code> 取到<strong>個位數</strong>：<code>246 % 10 = 6</code></li>
</ul>`) +
      C.code(MODULUS) +
      C.prose(`<p>講義的「簡易解碼器（Simple Decoder）」再往前一步：用陣列 <code>list[]</code> 把 0~9 對應到 'A'~'J'，再拿拆出來的每一位數當作<strong>索引（index）</strong>去查表。<code>scanf("%3d")</code> 裡的 <code>3</code> 代表<strong>最多只讀 3 個字元</strong>，多打的數字不會被讀進 <code>num</code>。</p>`) +
      C.widget({
        id: 'l3-dec',
        title: '拆解位數 + 簡易解碼器',
        hint: '輸入任意數字（試試看打 5 位數），按「逐步解碼」看每一位數怎麼被拆出來、再拿去查 list[] 表。',
        body: `<div class="widget-split">
  ${C.code(DECODER, { id: 'l3-dec-code' })}
  <div>
    <p class="feedback is-info" id="l3-dec-scan"></p>
    <div class="cells" id="l3-dec-digits"></div>
    <ol class="l3-steps" id="l3-dec-steps"></ol>
    <p class="caption">查表：<code>list[]</code> 陣列（索引 0~9 → 'A'~'J'）</p>
    <div class="cells cells--tight" id="l3-dec-list"></div>
    <div class="console" data-title="輸出" id="l3-dec-out"></div>
  </div>
</div>`,
        controls: `${C.field('鍵盤輸入（scanf "%3d"）', '<input type="text" id="l3-dec-in" value="246" inputmode="numeric" autocomplete="off" maxlength="12">')}
<button type="button" class="btn btn--primary" id="l3-dec-go">逐步解碼 ▶</button>
<span class="spacer"></span>
<button type="button" class="btn" id="l3-dec-rand">隨機 3 位數</button>`,
      });

    const s2 =
      C.prose(`<p><strong>陣列（array）</strong>可以一次儲存多個<strong>相同資料型態</strong>的變數，不用宣告一堆 <code>a1, a2, a3…</code>。陣列在記憶體裡是一格接著一格<strong>連續排列</strong>的，用 <code>[索引]</code> 存取，索引從 <strong>0</strong> 開始。</p>`) +
      C.code(String.raw`int number[5] = {3, 5, 6, 9, 10};
char str[10] = "string";`) +
      `<div class="cells" aria-label="int number[5] 的記憶體示意">${[3, 5, 6, 9, 10]
        .map((v, k) => `<div class="cell"><span class="cell-idx">number[${k}]</span><span class="cell-val">${v}</span></div>`)
        .join('')}</div>` +
      C.prose(`<ul>
<li>編譯器需要知道陣列大小：要嘛直接寫 <code>[5]</code>，要嘛寫 <code>int a[] = {1, 2, 3};</code> 讓編譯器從<strong>初始值列表</strong>推算（大小是 3）。</li>
<li><strong>陣列名稱會被當成指向第一個元素的指標（pointer）</strong>：<code>number</code> 的值就是 <code>&amp;number[0]</code>，這在之後講到函式傳陣列時非常重要。</li>
<li>也可以宣告 n 維陣列：2 維 <code>int arr2[5][6];</code>、3 維 <code>int arr3[10][20][4];</code>、5 維 <code>int arr5[2][3][4][5][6];</code>。實務上最常見的是 1~3 維。</li>
</ul>`) +
      `<h3>字串（String）＝以 \\0 結尾的字元陣列</h3>` +
      C.prose(`<p>C 語言<strong>沒有</strong>專門的字串型態，字串本質上就是一個<strong>字元陣列</strong>：</p>`) +
      C.code(String.raw`char str[] = "string";
/* 等同於 */
char str[] = {'s', 't', 'r', 'i', 'n', 'g', '\0'};`) +
      C.callout(
        'key',
        '字串一定以 \\0 做結尾！',
        `<p><code>printf</code> 用 <code>%s</code> 印字串時，會從第一個字元開始一路往後讀，<strong>直到遇到 <code>'\\0'</code>（空字元，ASCII 0）才停</strong>。就像一列只知道往前開的火車，<code>\\0</code> 就是它的停車號誌。所以 <code>"string"</code> 雖然只有 6 個字母，卻要佔 <strong>7</strong> 格。<code>str[i]</code> 代表字串裡第 i 個字元。</p>`
      ) +
      C.widget({
        id: 'l3-str',
        title: '字串就是字元陣列',
        hint: '改變字串內容和陣列大小 N，觀察每一格的字元與 ASCII 碼；點任一格看 str[i]；按「printf 火車」看 %s 怎麼一路讀到 \\0。',
        body: `<div id="l3-str-decl"></div>
<p id="l3-str-status"></p>
<div class="cells l3-strcells" id="l3-str-cells"></div>
<p class="feedback" id="l3-str-info"></p>
<div class="console" data-title="printf(&quot;%s&quot;, str) 的輸出" id="l3-str-out"></div>`,
        controls: `${C.field('字串內容（ASCII）', '<input type="text" id="l3-str-in" value="string" maxlength="20" autocomplete="off">')}
${fieldNum('l3-str-n', '陣列大小 N', 10, 1, 24)}
<label class="field field--inline"><input type="checkbox" id="l3-str-auto"> 省略大小 <code>char str[]</code></label>
<button type="button" class="btn btn--primary" id="l3-str-go">▶ printf 火車出發</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" id="l3-str-reset">重設</button>`,
      });

    const s3 =
      C.prose(`<p>寫程式時常常要判斷「某件事是不是成立」，這時就用到<strong>關係運算子（relational operators）</strong>和<strong>邏輯運算子（logical operators）</strong>。在 C 語言裡，<strong>0 代表 false（假），非 0 的數字（通常是 1）代表 true（真）</strong>，比較的結果就是整數 0 或 1。</p>`) +
      `<div class="widget-split">` +
      C.table(
        ['運算子', '說明'],
        [
          ['<code>==</code>', '等於（注意是兩個等號！）'],
          ['<code>!=</code>', '不等於'],
          ['<code>&gt;</code> / <code>&lt;</code>', '大於 / 小於'],
          ['<code>&gt;=</code> / <code>&lt;=</code>', '大於或等於 / 小於或等於'],
        ]
      ) +
      C.table(
        ['運算子', '說明', '範例'],
        [
          ['<code>&amp;&amp;</code>', '邏輯與（AND）', '<code>a &amp;&amp; b</code>'],
          ['<code>||</code>', '邏輯或（OR）', '<code>a || b</code>'],
          ['<code>!</code>', '邏輯非（NOT）', '<code>!a</code>'],
        ]
      ) +
      `</div>` +
      C.widget({
        id: 'l3-tt',
        title: '真值表（Truth Table）',
        hint: '切換 A、B 的值，右邊三張真值表會標出目前對應的那一列；也可以直接點表格的列。',
        body: `<dl class="kv" id="l3-tt-kv"></dl><div class="l3-tables" id="l3-tt-tables"></div>`,
        controls: `<button type="button" class="btn btn--primary" id="l3-tt-a" aria-pressed="false">A = 0</button>
<button type="button" class="btn btn--primary" id="l3-tt-b" aria-pressed="false">B = 0</button>
<span class="spacer"></span>
<span class="caption">&amp;&amp;：兩個都真才真　||：有一個真就真　!：真假顛倒</span>`,
      }) +
      C.prose(`<p>下面是講義的範例程式：把 <code>num</code> 設成 25，印出 5 個邏輯運算式的結果。拖動滑桿改變 <code>num</code>，看每個運算式怎麼一步步算出 0 或 1。注意 <strong>短路求值（short-circuit）</strong>：<code>&amp;&amp;</code> 左邊已經是 0、或 <code>||</code> 左邊已經是 1 時，右邊根本不會被計算。</p>`) +
      C.widget({
        id: 'l3-num',
        title: 'num = 25 的邏輯判斷',
        hint: '拖動滑桿或按下方的數字，觀察 5 個 printf 的輸出如何改變。',
        body: `<div class="widget-split">${C.code(LOGIC, { id: 'l3-num-code' })}<div><div class="table-wrap"><table class="table l3-evaltable"><thead><tr><th>運算式</th><th>代入計算</th><th>結果</th></tr></thead><tbody id="l3-num-rows"></tbody></table></div><div class="console" data-title="輸出" id="l3-num-out"></div></div></div>`,
        controls: `<label class="field"><span>num = <output id="l3-num-v">25</output></span><input type="range" id="l3-num-r" min="0" max="60" value="25"></label>
<span class="spacer"></span>
<div class="btn-group">${[5, 15, 25, 26, 45].map((v) => `<button type="button" class="btn btn--sm" data-num="${v}">${v}</button>`).join('')}</div>`,
      }) +
      C.callout(
        'warn',
        '重要規則：C 語言沒有「連續比較」',
        `<p>數學上可以寫 <code>A &lt; B &lt; C</code>，但在 C 語言裡這樣寫<strong>不會報錯，卻會算錯</strong>！必須拆開寫成 <code>A &lt; B &amp;&amp; B &lt; C</code>。</p>`
      ) +
      C.widget({
        id: 'l3-chain',
        title: 'A < B < C 的陷阱',
        hint: '輸入 A、B、C，看 C 語言實際怎麼計算這兩種寫法。',
        body: `<div class="widget-split">
  <div><h4 class="l3-colhead">✗ 寫成 <code>A &lt; B &lt; C</code></h4><ol class="l3-steps" id="l3-chain-bad"></ol></div>
  <div><h4 class="l3-colhead">✓ 寫成 <code>A &lt; B &amp;&amp; B &lt; C</code></h4><ol class="l3-steps" id="l3-chain-good"></ol></div>
</div>
<p class="feedback" id="l3-chain-verdict"></p>`,
        controls: `${fieldNum('l3-chain-a', 'A', 5)}${fieldNum('l3-chain-b', 'B', 3)}${fieldNum('l3-chain-c', 'C', 2)}
<span class="spacer"></span>
<div class="btn-group">
<button type="button" class="btn btn--sm" data-abc="5,3,2">5 &lt; 3 &lt; 2</button>
<button type="button" class="btn btn--sm" data-abc="1,2,3">1 &lt; 2 &lt; 3</button>
<button type="button" class="btn btn--sm" data-abc="3,2,1">3 &lt; 2 &lt; 1</button>
</div>`,
      });

    const s4 =
      C.prose(`<p><strong>位元運算子（bitwise operators）</strong>不是看整個數字的真假，而是把整數拆成一個一個<strong>位元（bit）</strong>，對「對應位置」的每一個位元分別運算。</p>`) +
      C.table(
        ['運算子', '說明', '範例'],
        [
          ['<code>&amp;</code>', '每一對應位元都做 AND', '<code>a &amp; b</code>'],
          ['<code>|</code>', '每一對應位元都做 OR', '<code>a | b</code>'],
          ['<code>^</code>', '每一對應位元都做 XOR（不同才是 1）', '<code>a ^ b</code>'],
          ['<code>~</code>', '每一個位元都取反（NOT）', '<code>~a</code>'],
          ['<code>&lt;&lt;</code>', '左位移（每移 1 位 ≈ 乘以 2）', '<code>a &lt;&lt; 2</code>'],
          ['<code>&gt;&gt;</code>', '右位移（每移 1 位 ≈ 除以 2）', '<code>a &gt;&gt; 2</code>'],
        ]
      ) +
      C.callout('tip', '邏輯運算子 vs 位元運算子', `<p><code>&amp;&amp;</code>、<code>||</code> 判斷的是<strong>布林條件（真假值）</strong>；<code>&amp;</code>、<code>|</code> 則是針對整數的<strong>每個位元</strong>操作。初學者比較少用到位元運算與三元運算子，但在底層程式中非常常見。</p>`) +
      C.widget({
        id: 'l3-bits',
        title: '位元運算實驗室',
        hint: '點擊 a、b 的任一位元切換 0/1，選擇運算子，觀察結果的每一個位元怎麼算出來（以 8 位元 unsigned char 顯示）。',
        body: `<div class="l3-bitgrid">
  <div class="l3-bitrow"><span class="l3-bitname"></span>${labelRow(8)}<span></span></div>
  <div class="l3-bitrow"><span class="l3-bitname">a</span><div id="l3-bits-a"></div><span class="l3-bitval" id="l3-bits-av"></span></div>
  <div class="l3-bitrow" id="l3-bits-brow"><span class="l3-bitname">b</span><div id="l3-bits-b"></div><span class="l3-bitval" id="l3-bits-bv"></span></div>
  <div class="l3-bitrow l3-bitrule"><span class="l3-bitname l3-op" id="l3-bits-op">a &amp; b</span><span></span><span></span></div>
  <div class="l3-bitrow"><span class="l3-bitname">結果</span><div id="l3-bits-r"></div><span class="l3-bitval" id="l3-bits-rv"></span></div>
</div>
<p class="feedback is-info" id="l3-bits-explain"></p>`,
        controls: `${C.seg('l3-bitop', [['&', '&amp;'], ['|', '|'], ['^', '^'], ['~', '~'], ['<<', '&lt;&lt;'], ['>>', '&gt;&gt;']], '&', '運算子')}
<label class="field"><span>位移量 <output id="l3-bits-shv">2</output></span><input type="range" id="l3-bits-sh" min="0" max="7" value="2"></label>
<span class="spacer"></span>
<button type="button" class="btn" id="l3-bits-rand">隨機</button>
<button type="button" class="btn btn--ghost" id="l3-bits-clear">全部清 0</button>`,
      }) +
      `<h3>為什麼要用位元運算？效能！</h3>` +
      C.prose(`<p>在底層演算法與系統開發中，位元操作通常<strong>只需要 1 個 CPU 週期</strong>；相較之下，整數除法（DIV）或取模（MOD）在許多硬體上需要 <strong>10 到 40 個週期以上</strong>，在沒有硬體除法器的微控制器上甚至要用軟體迴圈模擬。下面看講義的兩個經典例子。</p>`) +
      `<h3>例一：環狀緩衝區（Circular Buffer）</h3>` +
      C.prose(`<p>在佇列（Queue）或通訊緩衝區中，索引走到尾端時要<strong>繞回開頭</strong>。若容量 N 是 2 的冪次（例如 N = 8 = 2³），以下兩種寫法結果完全相同：</p>`) +
      C.code(String.raw`index = (index + 1) % N;        // 取模：慢
index = (index + 1) & (N - 1);   // 位元運算：快`) +
      C.prose(`<p>為什麼？N = 8 的二進位是 <code>0000 1000</code>，N − 1 = 7 是 <code>0000 0111</code>。任何數 X 和 7 做 <code>&amp;</code>，效果就是<strong>只保留 X 最低的 3 個位元</strong>、其餘高位全部變 0 —— 這正好就是「除以 8 的餘數」。</p>`) +
      C.widget({
        id: 'l3-ring',
        title: '環狀緩衝區：index 繞圈圈',
        hint: '按下按鈕讓 index 前進一格；走到最後一格時看它怎麼靠 & (N − 1) 繞回 0。',
        body: `<div class="l3-ring-top">
  <div class="ring" id="l3-ring-svg"></div>
  <div>
    <p class="caption" id="l3-ring-cap"></p>
    <dl class="kv" id="l3-ring-kv"></dl>
  </div>
</div>
<div class="l3-bitgrid" id="l3-ring-calc"></div>
<div class="console" data-title="紀錄" id="l3-ring-log"></div>`,
        controls: `<button type="button" class="btn btn--primary" id="l3-ring-step">index = (index + 1) &amp; (N − 1)</button>
<button type="button" class="btn" id="l3-ring-auto" aria-pressed="false">▶ 自動前進</button>
<span class="spacer"></span>
${C.seg('l3-ringn', [['4', 'N = 4'], ['8', 'N = 8'], ['16', 'N = 16']], '8', '緩衝區大小')}
<button type="button" class="btn btn--ghost" id="l3-ring-reset">重設</button>`,
      }) +
      `<h3>例二：2 的冪次方檢測</h3>` +
      C.prose(`<p>檢查記憶體配置大小、對齊邊界或緩衝區容量是不是 2 的冪次，可以用一行 <code>n &amp; (n - 1)</code>：</p>
<ul>
<li>2 的冪次在二進位中<strong>只有一個位元是 1</strong>（例如 8 = <code>1000</code>）。</li>
<li>減 1 時會向高位<strong>借位</strong>：原本唯一的 1 變成 0，它右邊的位元全部變成 1（7 = <code>0111</code>）。</li>
<li>兩者做 <code>&amp;</code>，每一位都「一個 0 一個 1」，結果必定是 <strong>0</strong>。</li>
</ul>`) +
      C.widget({
        id: 'l3-pow2',
        title: '2 的冪次檢測：n & (n − 1)',
        hint: '輸入 n 或點選範例；黃框標出 n − 1 時因為借位而改變的位元。',
        body: `<div class="l3-bitgrid" id="l3-pow2-grid"></div><p class="feedback" id="l3-pow2-verdict"></p>`,
        controls: `${fieldNum('l3-pow2-n', 'n', 8, 0, 65535)}
<span class="spacer"></span>
<div class="btn-group">${[1, 6, 8, 12, 64, 100, 0].map((v) => `<button type="button" class="btn btn--sm" data-pow="${v}">${v}</button>`).join('')}</div>`,
      });

    const s5 =
      C.prose(`<p><strong>三元運算子（ternary operator）</strong><code>?:</code> 是 C 語言唯一需要三個運算元的運算子，可以看成<strong>簡易版的 if...else</strong>，而且它會「傳回一個值」：</p>`) +
      C.code(String.raw`(條件) ? (條件成立傳回值) : (條件不成立傳回值)`) +
      C.widget({
        id: 'l3-tern',
        title: '三元運算子：x 能被 4 整除嗎？',
        hint: '改變 x，左邊看 ?: 怎麼挑出 \'Y\' 或 \'N\'，右邊是完全等價的 if...else 寫法。',
        body: `<div class="widget-split">
  <div>${C.code(TERN, { id: 'l3-tern-code' })}<ol class="l3-steps" id="l3-tern-steps"></ol><div class="cells" id="l3-tern-pick"></div></div>
  <div><p class="caption">等價的 if...else 寫法：</p>${C.code(TERN_IF, { id: 'l3-tern-if' })}<div class="console" data-title="輸出" id="l3-tern-out"></div></div>
</div>`,
        controls: `${fieldNum('l3-tern-x', 'x', 12, null, null)}
<button type="button" class="btn" id="l3-tern-dec">x − 1</button>
<button type="button" class="btn btn--primary" id="l3-tern-inc">x + 1</button>`,
      });

    const s6 =
      C.code(IF_SYNTAX) +
      C.prose(`<ul>
<li><code>else if</code> 可以無限疊加下去；<code>else</code> 最多只能有一個，也可以省略。</li>
<li><code>()</code> 裡的值<strong>非 0（true）</strong>就執行 <code>{}</code> 的敘述，為 <strong>0（false）</strong>則不執行。如果敘述只有一行，<code>{}</code> 可以省略。</li>
<li><strong>程式只會執行最早（第一個）成立條件對應的區塊</strong>，後面的條件即使也成立，也不會再被檢查或執行。</li>
</ul>`) +
      C.widget({
        id: 'l3-grade',
        title: '成績等級流程圖（if...else if...else）',
        hint: '點一個成績等級，看程式從上到下逐一檢查條件：紅色＝不成立，黃色＝成立並執行，灰色＝根本沒被檢查。',
        body: `<div class="widget-split">${C.code(IFGRADE, { id: 'l3-grade-code' })}<div><div class="l3-fc" id="l3-grade-fc"></div><div class="console" data-title="輸出" id="l3-grade-out"></div></div></div>`,
        controls: `<div class="btn-group" role="group" aria-label="輸入的成績">${['A', 'a', 'B', 'b', 'C', 'c', 'D', 'F', '?']
          .map((g) => `<button type="button" class="chip" data-grade="${g}" aria-pressed="${g === 'b'}">${g}</button>`)
          .join('')}</div>
<span class="spacer"></span>
<button type="button" class="btn btn--primary" id="l3-grade-replay">重播 ▶</button>`,
      }) +
      C.widget({
        id: 'l3-div',
        title: '只執行第一個成立的條件',
        hint: '試試 x = 6：它是偶數、也是 3 的倍數，但程式只會印出第一個成立的分支。',
        body: `<div class="widget-split">${C.code(IFDIV, { id: 'l3-div-code' })}<div><div class="table-wrap"><table class="table"><thead><tr><th>條件</th><th>計算</th><th>狀態</th></tr></thead><tbody id="l3-div-rows"></tbody></table></div><p class="feedback" id="l3-div-note"></p><div class="console" data-title="輸出" id="l3-div-out"></div></div></div>`,
        controls: `${fieldNum('l3-div-x', 'x', 6, 1, 999)}
<span class="spacer"></span>
<div class="btn-group">${[6, 4, 9, 7, 12, 15].map((v) => `<button type="button" class="btn btn--sm" data-x="${v}">${v}</button>`).join('')}</div>`,
      }) +
      C.prose(`<p>講義另一個例子用 <code>&amp;&amp;</code> 檢查使用者輸入的是不是合法的布林值（只能是 0 或 1）：</p>`) +
      C.widget({
        id: 'l3-flag',
        title: '檢查輸入是否為合法的 0／1',
        tag: '範例',
        body: `<div class="widget-split">${C.code(IFFLAG, { id: 'l3-flag-code' })}<div><ol class="l3-steps" id="l3-flag-steps"></ol><div class="console" data-title="輸出" id="l3-flag-out"></div></div></div>`,
        controls: `<span class="caption">輸入 flag：</span>${C.seg('l3-flagv', [['0', '0'], ['1', '1'], ['2', '2'], ['-1', '-1'], ['7', '7']], '1', 'flag 的值')}`,
      });

    const s7 =
      C.prose(`<p>有時候需要檢查「某一個變數是不是幾個值中的某一個」，並針對不同情況做不同的事。這時用 <strong>switch</strong> 會比一長串 if...else 清楚：</p>
<ul>
<li>switch 包含一連串的 <code>case</code> 標籤，以及一個可有可無的 <code>default</code>。</li>
<li>switch 會檢查變數符合哪一個 <code>case</code>，<strong>從那一個 case 開始往下執行</strong>，直到遇到 <code>break</code> 才跳出整個 switch。</li>
<li><code>break</code>：程式遇到 break 會從當前的選擇敘述／迴圈跳出。</li>
<li><code>case 'A':</code> 和 <code>case 'a':</code> 之間沒有敘述，會一起「<strong>掉落（fall through）</strong>」執行下一個 case —— 很適合「多個值對應同一個動作」的情境。</li>
</ul>`) +
      C.callout('warn', '別忘了 break！', '<p>每組動作後面都要加 <code>break</code>，否則程式會繼續往下執行下一個 case 的敘述。下面的實驗可以把 break 拿掉，親眼看看會發生什麼事。</p>') +
      C.widget({
        id: 'l3-sw',
        title: 'switch 與 break 掉落（fall through）',
        hint: '選一個成績，勾選要「移除」哪幾個 break，按執行：黃色是目前執行的行，淡藍色是已執行過的行。',
        body: `<div class="widget-split">${C.code(SWITCH, { id: 'l3-sw-code' })}<div><p class="caption">執行過的敘述：</p><ol class="l3-steps" id="l3-sw-trace"></ol><div class="console" data-title="輸出" id="l3-sw-out"></div><p class="feedback" id="l3-sw-note"></p></div></div>`,
        controls: `<div class="btn-group" role="group" aria-label="輸入的成績">${['A', 'a', 'B', 'b', 'C', 'c', 'F']
          .map((g) => `<button type="button" class="chip" data-swg="${g}" aria-pressed="${g === 'A'}">${g}</button>`)
          .join('')}</div>
<label class="field field--inline"><input type="checkbox" class="l3-sw-rm" data-k="0"> 移除 break ①</label>
<label class="field field--inline"><input type="checkbox" class="l3-sw-rm" data-k="1"> 移除 break ②</label>
<label class="field field--inline"><input type="checkbox" class="l3-sw-rm" data-k="2"> 移除 break ③</label>
<span class="spacer"></span>
<button type="button" class="btn btn--primary" id="l3-sw-run">執行 ▶</button>`,
      });

    return (
      C.section('l3-arith', '01', '算術運算子與取餘數', s1) +
      C.section('l3-array', '02', '陣列與字串', s2) +
      C.section('l3-logic', '03', '關係與邏輯運算子', s3) +
      C.section('l3-bitwise', '04', '位元運算子', s4) +
      C.section('l3-ternary', '05', '三元運算子 ?:', s5) +
      C.section('l3-if', '06', 'if...else 選擇敘述式', s6) +
      C.section('l3-switch', '07', 'switch 多重選擇', s7)
    );
  }

  /* =========================================================
     Widgets
     ========================================================= */

  /* ---- 1. digit extractor + decoder ---- */
  function mountDecoder(root) {
    const $ = (id) => C.$('#' + id, root);
    const LIST = 'ABCDEFGHIJ';
    const pre = $('l3-dec-code');
    let timer = null;
    function parse(s) {
      const m = String(s).match(/^\s*(-\d{1,2}|\d{1,3})/);
      if (!m) return null;
      return { num: parseInt(m[1], 10), used: m[1], rest: String(s).trim().slice(m[1].length) };
    }
    function render(stage) {
      const raw = $('l3-dec-in').value;
      const p = parse(raw);
      const out = $('l3-dec-out');
      if (!p) {
        $('l3-dec-scan').innerHTML = `scanf 讀不到任何數字（輸入要以數字開頭）`;
        $('l3-dec-scan').className = 'feedback is-err';
        $('l3-dec-digits').innerHTML = '';
        $('l3-dec-steps').innerHTML = '';
        $('l3-dec-list').innerHTML = LIST.split('').map((ch, k) => `<div class="cell"><span class="cell-idx">[${k}]</span><span class="cell-val">'${ch}'</span></div>`).join('');
        out.textContent = 'Enter a 3-digit number: ' + raw;
        C.setLines(pre, []);
        return;
      }
      const n = p.num;
      $('l3-dec-scan').className = 'feedback is-info';
      $('l3-dec-scan').innerHTML =
        `scanf("%3d") 讀到 <code>${C.esc(p.used)}</code>，所以 <code>num = ${n}</code>` +
        (p.rest ? `；剩下的 <code>${C.esc(p.rest)}</code> 留在緩衝區沒被讀走` : '') +
        (n < 0 ? '　<span class="pill-err">負數會讓索引變成負的，list[負數] 越界！</span>' : '');
      const d = [Math.trunc(n / 100), Math.trunc(n / 10) % 10, n % 10];
      const names = ['百位', '十位', '個位'];
      const shown = String(Math.abs(n)).padStart(3, '0');
      $('l3-dec-digits').innerHTML = shown
        .split('')
        .map(
          (ch, k) =>
            `<div class="cell${stage === k + 1 ? ' is-hi' : stage > k + 1 ? ' is-alloc' : ''}"><span class="cell-idx">${names[k]}</span><span class="cell-val">${ch}</span></div>`
        )
        .join('');
      const exprs = [
        ['num / 100', `${n} / 100`, d[0]],
        ['(num / 10) % 10', `(${n} / 10) % 10 = ${Math.trunc(n / 10)} % 10`, d[1]],
        ['num % 10', `${n} % 10`, d[2]],
      ];
      $('l3-dec-steps').innerHTML = exprs
        .map(
          (e, k) =>
            `<li class="${stage === k + 1 ? 'is-current' : stage > k + 1 ? 'is-past' : 'is-future'}"><code>${e[0]}</code> → <code>${e[1]}</code> = <strong>${
              stage > k ? e[2] : '?'
            }</strong>${stage > k ? ` → <code>list[${e[2]}]</code> = <strong>${d.every((x) => x >= 0) ? `'${LIST[e[2]]}'` : '越界'}</strong>` : ''}</li>`
        )
        .join('');
      const usedNow = stage >= 1 && stage <= 3 ? d[stage - 1] : -1;
      const usedPast = new Set(stage >= 4 ? d : d.slice(0, Math.max(0, stage - 1)));
      $('l3-dec-list').innerHTML =
        LIST.split('')
          .map(
            (ch, k) =>
              `<div class="cell${k === usedNow ? ' is-hi' : usedPast.has(k) ? ' is-alloc' : ''}"><span class="cell-idx">[${k}]</span><span class="cell-val">'${ch}'</span></div>`
          )
          .join('') + `<div class="cell is-null"><span class="cell-idx">[10]</span><span class="cell-val">\\0</span></div>`;
      let text = 'Enter a 3-digit number: ' + raw + '\n';
      if (stage >= 4) text += n < 0 ? '（索引為負：未定義行為，輸出無法預測）' : d.map((x) => LIST[x]).join('');
      else if (stage > 0) text += d.slice(0, stage).map((x) => (x >= 0 ? LIST[x] : '?')).join('');
      out.textContent = text;
      C.setLines(pre, stage === 0 ? [lineOf(DECODER, 'scanf')] : [lineOf(DECODER, 'printf("%c')]);
    }
    function animate() {
      if (timer) C.stop(timer);
      let stage = 0;
      render(0);
      if (C.reduced()) return render(4);
      timer = C.every(() => {
        stage++;
        render(stage);
        if (stage >= 4) {
          C.stop(timer);
          timer = null;
        }
      }, 700);
    }
    $('l3-dec-in').addEventListener('input', () => {
      if (timer) C.stop(timer);
      render(4);
    });
    $('l3-dec-go').addEventListener('click', animate);
    $('l3-dec-rand').addEventListener('click', () => {
      $('l3-dec-in').value = String(100 + Math.floor(Math.random() * 900));
      animate();
    });
    render(4);
  }

  /* ---- 2. string as char array ---- */
  function mountString(root) {
    const $ = (id) => C.$('#' + id, root);
    let timer = null;
    let cells = [];
    const GARB = '#%&@$?';
    function model() {
      const raw = $('l3-str-in').value;
      const s = raw.replace(/[^\x20-\x7e]/g, '');
      const len = s.length;
      const auto = $('l3-str-auto').checked;
      let N = auto ? len + 1 : C.clamp(parseInt($('l3-str-n').value, 10) || 1, 1, 24);
      $('l3-str-n').disabled = auto;
      return { raw, s, len, N, auto };
    }
    function render() {
      stopTrain();
      const m = model();
      const { s, len, N, auto } = m;
      $('l3-str-decl').innerHTML = C.code(`char str[${auto ? '' : N}] = "${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";`);
      let status;
      if (m.raw !== s) status = '<span class="pill-info">已略過非 ASCII 字元（中文在記憶體中一個字佔多個 byte）</span> ';
      else status = '';
      if (N >= len + 1)
        status += `<span class="pill-ok">字串長度 ${len}，加上 \\0 共需 ${len + 1} 格；陣列有 ${N} 格</span>${
          N > len + 1 ? ' <span class="pill-info">用字串初始化時，沒用到的格子會自動補 0</span>' : ''
        }`;
      else if (N === len)
        status += `<span class="pill-err">陣列剛好 ${N} 格，沒有空間放 \\0！printf 會一路讀出陣列外（未定義行為）</span>`;
      else status += `<span class="pill-err">初始字串太長：編譯器會警告，只放得進前 ${N} 個字元，而且沒有 \\0</span>`;
      $('l3-str-status').innerHTML = status;
      cells = [];
      for (let k = 0; k < N; k++) {
        if (k < len) cells.push({ k, ch: s[k], code: s.charCodeAt(k), kind: 'char' });
        else if (k === len) cells.push({ k, ch: '\\0', code: 0, kind: 'null' });
        else cells.push({ k, ch: '\\0', code: 0, kind: 'pad' });
      }
      if (N <= len) for (let k = N; k < N + 3; k++) cells.push({ k, ch: GARB[k % GARB.length], code: '?', kind: 'oob' });
      $('l3-str-cells').innerHTML = cells
        .map(
          (c, idx) =>
            `<button type="button" class="cell${c.kind === 'null' ? ' is-null' : c.kind === 'pad' ? ' is-dim' : c.kind === 'oob' ? ' is-dim l3-oob' : ''}" data-i="${idx}"><span class="cell-idx">${
              c.kind === 'oob' ? '陣列外' : '[' + c.k + ']'
            }</span><span class="cell-val">${c.kind === 'char' ? (c.ch === ' ' ? '␣' : C.esc(c.ch)) : c.kind === 'oob' ? '?' : '\\0'}</span><span class="cell-sub">${c.code}</span></button>`
        )
        .join('');
      $('l3-str-info').className = 'feedback';
      $('l3-str-info').textContent = '';
      $('l3-str-out').textContent = '';
    }
    function hi(i) {
      C.$$('.cell', $('l3-str-cells')).forEach((el, k) => el.classList.toggle('is-hi', k === i));
    }
    function stopTrain() {
      if (timer) C.stop(timer);
      timer = null;
      $('l3-str-go').textContent = '▶ printf 火車出發';
    }
    function train() {
      if (timer) return stopTrain();
      let i = 0;
      let out = '';
      $('l3-str-out').textContent = '';
      $('l3-str-go').textContent = '⏸ 停車';
      const tick = () => {
        const c = cells[i];
        hi(i);
        const info = $('l3-str-info');
        if (!c) {
          stopTrain();
          info.className = 'feedback is-err';
          info.textContent = '一直沒遇到 \\0：真正的程式會繼續往記憶體後面讀，印出什麼完全無法預測（未定義行為）。';
          return;
        }
        if (c.kind === 'null' || c.kind === 'pad') {
          stopTrain();
          info.className = 'feedback is-ok';
          info.textContent = `在 str[${c.k}] 遇到 '\\0'，printf 停車！總共印出 ${out.length} 個字元。`;
          return;
        }
        out += c.ch;
        $('l3-str-out').textContent = out;
        info.className = c.kind === 'oob' ? 'feedback is-err' : 'feedback is-info';
        info.textContent = c.kind === 'oob' ? `已經開出陣列範圍了！讀到的是不屬於 str 的記憶體` : `讀到 str[${c.k}] = '${c.ch}'，印出來，繼續往下一格…`;
        i++;
      };
      tick();
      if (timer === null && $('l3-str-go').textContent.includes('停車')) timer = C.every(tick, 420);
    }
    $('l3-str-cells').addEventListener('click', (e) => {
      const b = e.target.closest('.cell[data-i]');
      if (!b) return;
      stopTrain();
      const c = cells[+b.dataset.i];
      hi(+b.dataset.i);
      const info = $('l3-str-info');
      if (c.kind === 'oob') {
        info.className = 'feedback is-err';
        info.textContent = `str[${c.k}] 已經超出陣列範圍（陣列只有 ${model().N} 格，索引 0 ~ ${model().N - 1}）`;
      } else {
        info.className = 'feedback is-info';
        info.innerHTML =
          c.kind === 'char'
            ? `<code>str[${c.k}]</code> = <code>'${C.esc(c.ch)}'</code>，ASCII 碼 ${c.code}`
            : `<code>str[${c.k}]</code> = <code>'\\0'</code>（ASCII 0）${c.kind === 'null' ? '——這就是字串的結尾記號' : '——初始化時補上的 0'}`;
      }
    });
    ['l3-str-in', 'l3-str-n'].forEach((id) => $(id).addEventListener('input', render));
    $('l3-str-auto').addEventListener('change', render);
    $('l3-str-go').addEventListener('click', train);
    $('l3-str-reset').addEventListener('click', () => {
      $('l3-str-in').value = 'string';
      $('l3-str-n').value = 10;
      $('l3-str-auto').checked = false;
      render();
    });
    render();
  }

  /* ---- 3a. truth table ---- */
  function mountTruth(root) {
    const $ = (id) => C.$('#' + id, root);
    let A = 1;
    let B = 0;
    function table(title, cols, rows, hiIdx) {
      return `<div class="table-wrap"><table class="table l3-tt"><caption>${title}</caption><thead><tr>${cols
        .map((c) => `<th>${c}</th>`)
        .join('')}</tr></thead><tbody>${rows
        .map(
          (r, k) =>
            `<tr class="${k === hiIdx ? 'is-hi' : ''}" data-ab="${r.ab}" tabindex="0">${r.v.map((x) => `<td class="num">${x}</td>`).join('')}</tr>`
        )
        .join('')}</tbody></table></div>`;
    }
    function render() {
      $('l3-tt-a').textContent = `A = ${A}`;
      $('l3-tt-b').textContent = `B = ${B}`;
      $('l3-tt-a').setAttribute('aria-pressed', String(!!A));
      $('l3-tt-b').setAttribute('aria-pressed', String(!!B));
      const and = A && B ? 1 : 0;
      const or = A || B ? 1 : 0;
      $('l3-tt-kv').innerHTML = [
        ['A && B', and],
        ['A || B', or],
        ['!A', A ? 0 : 1],
        ['!B', B ? 0 : 1],
      ]
        .map(([k, v]) => `<div class="${v ? 'is-hi' : ''}"><dt>${C.esc(k)}</dt><dd>${v} <small class="muted">${v ? '真' : '假'}</small></dd></div>`)
        .join('');
      const rows2 = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ];
      const idx = A * 2 + B;
      $('l3-tt-tables').innerHTML =
        table('A && B', ['A', 'B', 'A && B'], rows2.map(([a, b]) => ({ ab: `${a},${b}`, v: [a, b, a && b ? 1 : 0] })), idx) +
        table('A || B', ['A', 'B', 'A || B'], rows2.map(([a, b]) => ({ ab: `${a},${b}`, v: [a, b, a || b ? 1 : 0] })), idx) +
        table('!A', ['A', '!A'], [0, 1].map((a) => ({ ab: `${a},${B}`, v: [a, a ? 0 : 1] })), A);
    }
    $('l3-tt-a').addEventListener('click', () => {
      A = A ? 0 : 1;
      render();
    });
    $('l3-tt-b').addEventListener('click', () => {
      B = B ? 0 : 1;
      render();
    });
    const pick = (tr) => {
      const [a, b] = tr.dataset.ab.split(',').map(Number);
      A = a;
      B = b;
      render();
    };
    $('l3-tt-tables').addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-ab]');
      if (tr) pick(tr);
    });
    $('l3-tt-tables').addEventListener('keydown', (e) => {
      const tr = e.target.closest('tr[data-ab]');
      if (tr && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        pick(tr);
      }
    });
    render();
  }

  /* ---- 3b. num = 25 logical expressions ---- */
  function mountNum(root) {
    const $ = (id) => C.$('#' + id, root);
    const EX = [
      { src: 'num > 10 && num < 28', op: '&&', l: ['num > 10', (n) => n > 10], r: ['num < 28', (n) => n < 28] },
      { src: 'num > 30 || num < 20', op: '||', l: ['num > 30', (n) => n > 30], r: ['num < 20', (n) => n < 20] },
      { src: 'num > 30 || num < 50', op: '||', l: ['num > 30', (n) => n > 30], r: ['num < 50', (n) => n < 50] },
      { src: 'num != 26 && num < 28', op: '&&', l: ['num != 26', (n) => n !== 26], r: ['num < 28', (n) => n < 28] },
      { src: '!(num != 26 && num < 28)', not: true, op: '&&', l: ['num != 26', (n) => n !== 26], r: ['num < 28', (n) => n < 28] },
    ];
    const pre = $('l3-num-code');
    function render() {
      const n = +$('l3-num-r').value;
      $('l3-num-v').textContent = n;
      const outs = [];
      $('l3-num-rows').innerHTML = EX.map((e) => {
        const L = e.l[1](n) ? 1 : 0;
        const sub = (t) => t.replace('num', n);
        let calc;
        let v;
        if (e.op === '&&' && !L) {
          v = 0;
          calc = `${sub(e.l[0])} → ${L} &amp;&amp; <span class="muted">（右邊短路，不計算）</span>`;
        } else if (e.op === '||' && L) {
          v = 1;
          calc = `${sub(e.l[0])} → ${L} || <span class="muted">（右邊短路，不計算）</span>`;
        } else {
          const R = e.r[1](n) ? 1 : 0;
          v = e.op === '&&' ? L && R : L || R;
          v = v ? 1 : 0;
          calc = `${sub(e.l[0])} → ${L}　${e.op === '&&' ? '&amp;&amp;' : '||'}　${sub(e.r[0])} → ${R}`;
        }
        if (e.not) {
          calc = `!( ${calc} = ${v} )`;
          v = v ? 0 : 1;
        }
        outs.push(v);
        return `<tr><td><code>${C.esc(e.src)}</code></td><td class="mono">${calc}</td><td>${pill(v, String(v))}</td></tr>`;
      }).join('');
      $('l3-num-out').textContent = outs.join('\n');
      C.setLines(pre, [lineOf(LOGIC, 'int num')]);
      pre.querySelectorAll('.line')[lineOf(LOGIC, 'int num') - 1].innerHTML = C.hl(`    int num = ${n};`)[0];
    }
    $('l3-num-r').addEventListener('input', render);
    root.querySelectorAll('#l3-num [data-num]').forEach((b) =>
      b.addEventListener('click', () => {
        $('l3-num-r').value = b.dataset.num;
        render();
      })
    );
    render();
  }

  /* ---- 3c. A < B < C ---- */
  function mountChain(root) {
    const $ = (id) => C.$('#' + id, root);
    function render() {
      const a = +$('l3-chain-a').value || 0;
      const b = +$('l3-chain-b').value || 0;
      const c = +$('l3-chain-c').value || 0;
      const ab = a < b ? 1 : 0;
      const bad = ab < c ? 1 : 0;
      const bc = b < c ? 1 : 0;
      const good = ab && bc ? 1 : 0;
      $('l3-chain-bad').innerHTML = `
<li><code>A &lt; B &lt; C</code> 由左往右算，等於 <code>(A &lt; B) &lt; C</code></li>
<li>代入：<code>(${a} &lt; ${b}) &lt; ${c}</code></li>
<li><code>${a} &lt; ${b}</code> 的結果是 <strong>${ab}</strong>，所以變成 <code>${ab} &lt; ${c}</code></li>
<li>最後結果：${pill(bad, String(bad))}</li>`;
      $('l3-chain-good').innerHTML = `
<li>代入：<code>(${a} &lt; ${b}) &amp;&amp; (${b} &lt; ${c})</code></li>
<li><code>${a} &lt; ${b}</code> → <strong>${ab}</strong>${ab ? '' : '，左邊已經是 0，右邊短路不算'}</li>
${ab ? `<li><code>${b} &lt; ${c}</code> → <strong>${bc}</strong>，<code>1 &amp;&amp; ${bc}</code></li>` : ''}
<li>最後結果：${pill(good, String(good))}</li>`;
      const v = $('l3-chain-verdict');
      if (bad !== good) {
        v.className = 'feedback is-err';
        v.innerHTML = `陷阱！數學上「${a} &lt; ${b} &lt; ${c}」是<strong>${good ? '真' : '假'}</strong>，但 C 語言的 <code>A &lt; B &lt; C</code> 算出 <strong>${bad}</strong>。`;
      } else {
        v.className = 'feedback is-ok';
        v.innerHTML = `這組數字剛好兩種寫法結果相同（都是 ${good}），但這只是巧合——換成 5、3、2 或 3、2、1 試試看。`;
      }
    }
    ['l3-chain-a', 'l3-chain-b', 'l3-chain-c'].forEach((id) => $(id).addEventListener('input', render));
    root.querySelectorAll('#l3-chain [data-abc]').forEach((b) =>
      b.addEventListener('click', () => {
        const [a, bb, c] = b.dataset.abc.split(',');
        $('l3-chain-a').value = a;
        $('l3-chain-b').value = bb;
        $('l3-chain-c').value = c;
        render();
      })
    );
    render();
  }

  /* ---- 4a. bitwise lab ---- */
  function mountBits(root) {
    const $ = (id) => C.$('#' + id, root);
    let a = 172;
    let b = 202;
    let op = '&';
    const EXPL = {
      '&': '<strong>AND</strong>：對應的兩個位元<strong>都是 1</strong>，結果才是 1。常用來「遮罩」，只保留想要的位元。',
      '|': '<strong>OR</strong>：對應的兩個位元<strong>只要有一個是 1</strong>，結果就是 1。常用來把某些位元設成 1。',
      '^': '<strong>XOR</strong>：對應的兩個位元<strong>不同</strong>才是 1，相同就是 0。',
      '~': '<strong>NOT</strong>：每一個位元都<strong>顛倒</strong>，0 變 1、1 變 0（只看 a）。',
      '<<': '<strong>左位移</strong>：每個位元往左移，右邊補 0；左邊超出 8 位元的會被丟掉。左移 n 位 ≈ 乘以 2ⁿ。',
      '>>': '<strong>右位移</strong>：每個位元往右移，最右邊的被丟掉，左邊補 0（unsigned）。右移 n 位 ≈ 除以 2ⁿ（捨去小數）。',
    };
    const fmt = (v) => `= ${v}　<span class="muted">0x${v.toString(16).toUpperCase().padStart(2, '0')}</span>`;
    function render() {
      const sh = +$('l3-bits-sh').value;
      $('l3-bits-shv').textContent = sh;
      const shift = op === '<<' || op === '>>';
      const unary = op === '~';
      $('l3-bits-sh').disabled = !shift;
      let r;
      if (op === '&') r = a & b;
      else if (op === '|') r = a | b;
      else if (op === '^') r = a ^ b;
      else if (op === '~') r = ~a & 255;
      else if (op === '<<') r = (a << sh) & 255;
      else r = a >>> sh;
      $('l3-bits-a').innerHTML = bitsHTML(a, 8, { btn: true });
      $('l3-bits-b').innerHTML = bitsHTML(b, 8, { btn: true, dim: shift || unary ? 255 : null });
      $('l3-bits-r').innerHTML = bitsHTML(r, 8, { hi: op === '^' ? a ^ b : null });
      $('l3-bits-av').innerHTML = fmt(a);
      $('l3-bits-bv').innerHTML = shift ? `<span class="muted">（位移運算用不到 b）</span>` : unary ? `<span class="muted">（~ 只作用在 a）</span>` : fmt(b);
      $('l3-bits-rv').innerHTML = fmt(r);
      $('l3-bits-op').textContent = shift ? `a ${op} ${sh}` : unary ? '~a' : `a ${op} b`;
      $('l3-bits-explain').innerHTML =
        EXPL[op] +
        (shift ? `　例：${a} ${op} ${sh} = ${r}${op === '<<' && a << sh > 255 ? '（有位元被擠出 8 位元外）' : ''}` : '') +
        (unary ? '　<span class="muted">（真正的 C 中 ~a 會作用在整個 int 上，這裡只顯示最低 8 位元）</span>' : '');
    }
    $('l3-bits-a').addEventListener('click', (e) => {
      const bt = e.target.closest('.bit[data-bit]');
      if (!bt) return;
      a ^= 1 << +bt.dataset.bit;
      render();
    });
    $('l3-bits-b').addEventListener('click', (e) => {
      const bt = e.target.closest('.bit[data-bit]');
      if (!bt) return;
      b ^= 1 << +bt.dataset.bit;
      render();
    });
    C.onSeg(root, 'l3-bitop', (v) => {
      op = v;
      render();
    });
    $('l3-bits-sh').addEventListener('input', render);
    $('l3-bits-rand').addEventListener('click', () => {
      a = Math.floor(Math.random() * 256);
      b = Math.floor(Math.random() * 256);
      render();
    });
    $('l3-bits-clear').addEventListener('click', () => {
      a = 0;
      b = 0;
      render();
    });
    render();
  }

  /* ---- 4b. circular buffer ---- */
  function mountRing(root) {
    const $ = (id) => C.$('#' + id, root);
    let N = 8;
    let idx = 0;
    let visited = new Set([0]);
    let timer = null;
    const log = [];
    function drawRing() {
      const host = $('l3-ring-svg');
      host.innerHTML = '';
      const W = 240;
      const cx = W / 2;
      const cy = W / 2;
      const R = 88;
      const r = N > 8 ? 13 : 18;
      const svg = C.svgEl('svg', { viewBox: `0 0 ${W} ${W}`, width: W, height: W, role: 'img', 'aria-label': `環狀緩衝區，N = ${N}，index = ${idx}` });
      svg.appendChild(C.svgEl('circle', { cx, cy, r: R, style: 'fill:none;stroke:var(--line);stroke-width:2;stroke-dasharray:4 5' }));
      const ang = (k) => -Math.PI / 2 + (2 * Math.PI * k) / N;
      const px = (k, rr) => [cx + rr * Math.cos(ang(k)), cy + rr * Math.sin(ang(k))];
      const [ax, ay] = px(idx, R - r - 6);
      svg.appendChild(C.svgEl('line', { x1: cx, y1: cy, x2: ax, y2: ay, style: 'stroke:var(--accent-2);stroke-width:3;stroke-linecap:round' }));
      svg.appendChild(C.svgEl('circle', { cx: ax, cy: ay, r: 4, style: 'fill:var(--accent-2)' }));
      for (let k = 0; k < N; k++) {
        const [x, y] = px(k, R);
        const active = k === idx;
        svg.appendChild(
          C.svgEl('circle', {
            cx: x,
            cy: y,
            r,
            style: `fill:${active ? 'var(--hi)' : visited.has(k) ? 'var(--surface-2)' : 'var(--surface)'};stroke:${active ? 'var(--accent-2)' : 'var(--line-strong)'};stroke-width:${active ? 3 : 1.5}`,
          })
        );
        svg.appendChild(C.svgEl('text', { x, y: y + 4, 'text-anchor': 'middle', style: `font-size:${N > 8 ? 10 : 12}px;font-weight:700;fill:var(--ink)` }, String(k)));
      }
      svg.appendChild(C.svgEl('text', { x: cx, y: cy - 6, 'text-anchor': 'middle', style: 'font-size:12px;fill:var(--muted)' }, 'index'));
      svg.appendChild(C.svgEl('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', style: 'font-size:22px;font-weight:700;fill:var(--ink)' }, String(idx)));
      host.appendChild(svg);
    }
    function render() {
      drawRing();
      const nxt = idx + 1;
      const mask = N - 1;
      const res = nxt & mask;
      const keep = mask;
      $('l3-ring-cap').innerHTML = `目前 index = <strong>${idx}</strong>，按下按鈕會計算：`;
      $('l3-ring-calc').innerHTML = `
<div class="l3-bitrow"><span class="l3-bitname">index + 1</span>${bitsHTML(nxt, 8, { dim: ~keep & 255 })}<span class="l3-bitval">= ${nxt}</span></div>
<div class="l3-bitrow"><span class="l3-bitname">N − 1</span>${bitsHTML(mask, 8, { hi: mask })}<span class="l3-bitval">= ${mask}</span></div>
<div class="l3-bitrow l3-bitrule"><span class="l3-bitname l3-op">&amp;</span><span></span><span></span></div>
<div class="l3-bitrow"><span class="l3-bitname">結果</span>${bitsHTML(res, 8)}<span class="l3-bitval">= ${res}</span></div>`;
      $('l3-ring-kv').innerHTML = `<div class="is-hi"><dt>(index + 1) &amp; (N − 1)</dt><dd>${res}</dd></div><div><dt>(index + 1) % N</dt><dd>${nxt % N} ✓</dd></div>`;
      $('l3-ring-log').textContent = log.slice(-6).join('\n') || '（還沒移動）';
    }
    function step() {
      const nxt = (idx + 1) & (N - 1);
      log.push(`index: ${idx} → ${nxt}${nxt === 0 ? '　← 繞回開頭！' : ''}`);
      idx = nxt;
      visited.add(idx);
      render();
    }
    function stopAuto() {
      if (timer) C.stop(timer);
      timer = null;
      $('l3-ring-auto').textContent = '▶ 自動前進';
      $('l3-ring-auto').setAttribute('aria-pressed', 'false');
    }
    $('l3-ring-step').addEventListener('click', step);
    $('l3-ring-auto').addEventListener('click', () => {
      if (timer) return stopAuto();
      step();
      timer = C.every(step, 700);
      $('l3-ring-auto').textContent = '⏸ 暫停';
      $('l3-ring-auto').setAttribute('aria-pressed', 'true');
    });
    const reset = () => {
      stopAuto();
      idx = 0;
      visited = new Set([0]);
      log.length = 0;
      render();
    };
    $('l3-ring-reset').addEventListener('click', reset);
    C.onSeg(root, 'l3-ringn', (v) => {
      N = +v;
      reset();
    });
    render();
  }

  /* ---- 4c. power of two ---- */
  function mountPow2(root) {
    const $ = (id) => C.$('#' + id, root);
    function render() {
      let n = parseInt($('l3-pow2-n').value, 10);
      if (isNaN(n)) n = 0;
      n = C.clamp(n, 0, 65535);
      const w = n > 255 ? 16 : 8;
      const full = w === 16 ? 0xffff : 0xff;
      const m1 = (n - 1) & full;
      const and = n & m1;
      const changed = n ^ m1;
      $('l3-pow2-grid').innerHTML = `
<div class="l3-bitrow"><span class="l3-bitname">n</span>${bitsHTML(n, w)}<span class="l3-bitval">= ${n}</span></div>
<div class="l3-bitrow"><span class="l3-bitname">n − 1</span>${bitsHTML(m1, w, { hi: changed })}<span class="l3-bitval">= ${n === 0 ? '−1（所有位元都是 1）' : m1}</span></div>
<div class="l3-bitrow l3-bitrule"><span class="l3-bitname l3-op">&amp;</span><span></span><span></span></div>
<div class="l3-bitrow"><span class="l3-bitname">n &amp; (n−1)</span>${bitsHTML(and, w)}<span class="l3-bitval">= ${and}</span></div>`;
      const v = $('l3-pow2-verdict');
      if (n === 0) {
        v.className = 'feedback is-err';
        v.innerHTML = `n = 0 時 <code>n &amp; (n − 1)</code> 也是 0，但 <strong>0 不是 2 的冪次</strong>！所以完整的判斷要寫成 <code>n &gt; 0 &amp;&amp; (n &amp; (n - 1)) == 0</code>。`;
      } else if (and === 0) {
        v.className = 'feedback is-ok';
        v.innerHTML = `<code>${n} &amp; ${m1} = 0</code> → ${n} <strong>是</strong> 2 的冪次（2<sup>${Math.log2(n)}</sup>）。只有一個 1，減 1 後借位讓所有位元都「錯開」了。`;
      } else {
        v.className = 'feedback is-err';
        v.innerHTML = `<code>${n} &amp; ${m1} = ${and} ≠ 0</code> → ${n} <strong>不是</strong> 2 的冪次：它有不只一個 1，減 1 只影響最右邊那個 1，左邊的 1 還在。`;
      }
    }
    $('l3-pow2-n').addEventListener('input', render);
    root.querySelectorAll('#l3-pow2 [data-pow]').forEach((b) =>
      b.addEventListener('click', () => {
        $('l3-pow2-n').value = b.dataset.pow;
        render();
      })
    );
    render();
  }

  /* ---- 5. ternary ---- */
  function mountTern(root) {
    const $ = (id) => C.$('#' + id, root);
    function render() {
      let x = parseInt($('l3-tern-x').value, 10);
      if (isNaN(x)) x = 0;
      const r = x % 4;
      const ok = r === 0;
      $('l3-tern-steps').innerHTML = `
<li><code>x % 4</code> → <code>${x} % 4</code> = <strong>${r}</strong></li>
<li><code>${r} == 0</code> → <strong>${ok ? 1 : 0}</strong>（${ok ? '成立' : '不成立'}）</li>
<li><code>(${ok ? 1 : 0}) ? 'Y' : 'N'</code> → 選 <strong>'${ok ? 'Y' : 'N'}'</strong></li>`;
      $('l3-tern-pick').innerHTML = `<div class="cell ${ok ? 'is-hi' : 'is-dim'}"><span class="cell-idx">條件成立</span><span class="cell-val">'Y'</span></div><div class="cell ${
        ok ? 'is-dim' : 'is-hi'
      }"><span class="cell-idx">條件不成立</span><span class="cell-val">'N'</span></div>`;
      C.setLines($('l3-tern-code'), [lineOf(TERN, 'divisible')]);
      C.setLines($('l3-tern-if'), ok ? [2, 3, 6] : [2, 4, 5, 6]);
      $('l3-tern-out').textContent = `Please enter a positive number: ${x}\nIs x divisible by 4? ${ok ? 'Y' : 'N'}`;
    }
    $('l3-tern-x').addEventListener('input', render);
    $('l3-tern-dec').addEventListener('click', () => {
      $('l3-tern-x').value = (parseInt($('l3-tern-x').value, 10) || 0) - 1;
      render();
    });
    $('l3-tern-inc').addEventListener('click', () => {
      $('l3-tern-x').value = (parseInt($('l3-tern-x').value, 10) || 0) + 1;
      render();
    });
    render();
  }

  /* ---- 6a. grade flowchart ---- */
  function mountGrade(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l3-grade-code');
    const CONDS = [
      { c: "x == 'A' || x == 'a'", out: 'Excellent!', test: (g) => g === 'A' || g === 'a', cl: "x == 'A'", ol: 'Excellent' },
      { c: "x == 'B' || x == 'b'", out: 'Good!', test: (g) => g === 'B' || g === 'b', cl: "x == 'B'", ol: 'Good' },
      { c: "x == 'C' || x == 'c'", out: 'Fair!', test: (g) => g === 'C' || g === 'c', cl: "x == 'C'", ol: 'Fair' },
      { c: 'else', out: 'Poor!', test: () => true, cl: '    else\n', ol: 'Poor' },
    ];
    CONDS.forEach((k) => {
      k.line = k.c === 'else' ? lineOf(IFGRADE, 'else', lineOf(IFGRADE, 'Fair')) : lineOf(IFGRADE, k.cl);
      k.oline = lineOf(IFGRADE, k.ol);
    });
    let grade = 'b';
    let timer = null;
    $('l3-grade-fc').innerHTML =
      `<div class="flow-node flow-node--file l3-fc-start" id="l3-grade-start"></div>` +
      CONDS.map(
        (k, i) => `<div class="l3-fc-down">${i === 0 ? '↓' : '否 ↓'}</div>
<div class="l3-fc-row"><div class="flow-node l3-fc-cond" data-k="${i}">${k.c === 'else' ? 'else（以上皆非）' : C.esc(k.c) + ' ?'}</div><span class="l3-fc-yes">${
          k.c === 'else' ? '→' : '是 →'
        }</span><div class="flow-node flow-node--tool l3-fc-out" data-o="${i}">${k.out}</div></div>`
      ).join('');
    function paint(stage) {
      // stage = number of conditions evaluated so far
      $('l3-grade-start').textContent = `scanf → x = '${grade}'`;
      const hit = CONDS.findIndex((k) => k.test(grade));
      C.$$('.l3-fc-cond', root).forEach((n, i) => {
        n.classList.remove('is-active', 'is-false', 'is-dim');
        if (i < stage) n.classList.add(i === hit ? 'is-active' : 'is-false');
        else if (stage > hit) n.classList.add('is-dim');
      });
      C.$$('.l3-fc-out', root).forEach((n, i) => {
        n.classList.remove('is-active', 'is-dim');
        if (stage > hit && i === hit) n.classList.add('is-active');
        else if (stage > hit) n.classList.add('is-dim');
      });
      const cur = CONDS[Math.min(stage, CONDS.length) - 1];
      if (stage === 0) C.setLines(pre, [lineOf(IFGRADE, 'scanf')]);
      else if (stage - 1 === hit) C.setLines(pre, [cur.line, cur.oline]);
      else C.setLines(pre, [cur.line]);
      $('l3-grade-out').textContent = `Enter grade: ${grade}` + (stage > hit ? `\n${CONDS[hit].out}` : '');
    }
    function play() {
      if (timer) C.stop(timer);
      const hit = CONDS.findIndex((k) => k.test(grade));
      let stage = 0;
      paint(0);
      if (C.reduced()) return paint(hit + 1);
      timer = C.every(() => {
        stage++;
        paint(stage);
        if (stage > hit) {
          C.stop(timer);
          timer = null;
        }
      }, 600);
    }
    root.querySelectorAll('#l3-grade [data-grade]').forEach((b) =>
      b.addEventListener('click', () => {
        grade = b.dataset.grade;
        root.querySelectorAll('#l3-grade [data-grade]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        play();
      })
    );
    $('l3-grade-replay').addEventListener('click', play);
    paint(CONDS.findIndex((k) => k.test(grade)) + 1);
  }

  /* ---- 6b. only first true branch ---- */
  function mountDiv(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l3-div-code');
    const L1 = lineOf(IFDIV, 'if(!(x%2))');
    const L2 = lineOf(IFDIV, 'else if(!(x%3))');
    const L3 = lineOf(IFDIV, '    else', L2);
    function render() {
      let x = parseInt($('l3-div-x').value, 10);
      if (isNaN(x)) x = 0;
      const c1 = !(x % 2);
      const c2 = !(x % 3);
      let branch = c1 ? 1 : c2 ? 2 : 3;
      const st = (cond, k) => {
        if (k < branch) return '<span class="pill-err">不成立 → 往下檢查</span>';
        if (k === branch) return '<span class="pill-ok">成立 → 執行！</span>';
        return `<span class="pill-info">不會被檢查${cond ? '（其實也成立）' : ''}</span>`;
      };
      $('l3-div-rows').innerHTML = `
<tr${branch === 1 ? ' class="is-hi"' : ''}><td><code>!(x%2)</code></td><td class="mono">${x}%2 = ${x % 2} → !${x % 2} = ${c1 ? 1 : 0}</td><td>${st(c1, 1)}</td></tr>
<tr${branch === 2 ? ' class="is-hi"' : ''}><td><code>!(x%3)</code></td><td class="mono">${x}%3 = ${x % 3} → !${x % 3} = ${c2 ? 1 : 0}</td><td>${st(c2, 2)}</td></tr>
<tr${branch === 3 ? ' class="is-hi"' : ''}><td><code>else</code></td><td class="mono">—</td><td>${branch === 3 ? '<span class="pill-ok">前面都不成立 → 執行</span>' : '<span class="pill-info">不會執行</span>'}</td></tr>`;
      const outs = ['x is an even number\n', 'x is not an even number but is divisible by 3', 'x is not an even number and is not divisible by 3\n'];
      $('l3-div-out').textContent = `Enter a positive number: ${x}\n${outs[branch - 1]}`;
      const lines = [L1];
      if (branch === 1) lines.push(L1 + 1);
      if (branch >= 2) lines.push(L2);
      if (branch === 2) lines.push(L2 + 1);
      if (branch === 3) lines.push(L3, L3 + 1);
      C.setLines(pre, lines);
      const note = $('l3-div-note');
      if (c1 && c2) {
        note.className = 'feedback is-ok';
        note.innerHTML = `${x} 同時是偶數、也是 3 的倍數，兩個條件都成立——但只會執行<strong>第一個</strong>成立的分支，第二個條件根本不會被檢查。`;
      } else {
        note.className = 'feedback is-info';
        note.textContent = '試試 6、12 或 18：兩個條件都成立時會發生什麼事？';
      }
    }
    $('l3-div-x').addEventListener('input', render);
    root.querySelectorAll('#l3-div [data-x]').forEach((b) =>
      b.addEventListener('click', () => {
        $('l3-div-x').value = b.dataset.x;
        render();
      })
    );
    render();
  }

  /* ---- 6c. flag validation ---- */
  function mountFlag(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l3-flag-code');
    const L1 = lineOf(IFFLAG, 'if(flag != 0');
    const L2 = lineOf(IFFLAG, 'else if(flag)');
    const L3 = lineOf(IFFLAG, '    else', L2);
    function render(v) {
      const f = +v;
      const bad = f !== 0 && f !== 1;
      $('l3-flag-steps').innerHTML = `
<li><code>flag != 0 &amp;&amp; flag != 1</code> → <code>${f !== 0 ? 1 : 0} &amp;&amp; ${f !== 0 ? (f !== 1 ? 1 : 0) : '（短路）'}</code> = <strong>${bad ? 1 : 0}</strong></li>
${bad ? '' : `<li><code>flag</code> → <strong>${f ? 1 : 0}</strong>（非 0 即為真）</li>`}`;
      $('l3-flag-out').textContent = `Enter 0 (false) or 1 (True): ${f}\n${bad ? 'Invalid input!' : f ? 'True' : 'False'}`;
      C.setLines(pre, bad ? [L1, L1 + 1] : f ? [L1, L2, L2 + 1] : [L1, L2, L3, L3 + 1]);
    }
    C.onSeg(root, 'l3-flagv', render);
    render('1');
  }

  /* ---- 7. switch fall-through ---- */
  function mountSwitch(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l3-sw-code');
    const lines = SWITCH.split('\n');
    const brk = [];
    lines.forEach((l, k) => {
      if (l.trim() === 'break;') brk.push(k + 1);
    });
    const caseLine = (v) => lineOf(SWITCH, `case '${v}'`);
    const defLine = lineOf(SWITCH, 'default:');
    const endLine = lineOf(SWITCH, '    }', defLine);
    let grade = 'A';
    let timer = null;
    // mark break lines with numbers
    brk.forEach((ln, k) => {
      const el = pre.querySelectorAll('.line')[ln - 1];
      el.insertAdjacentHTML('beforeend', ` <span class="tk-com">// ${'①②③'[k]}</span>`);
    });
    function removed() {
      return new Set(C.$$('.l3-sw-rm', root).filter((c) => c.checked).map((c) => brk[+c.dataset.k]));
    }
    function trace() {
      const rm = removed();
      let start = caseLine(grade);
      if (start < 0) start = defLine;
      const seq = [lineOf(SWITCH, 'switch(x)')];
      const out = [];
      for (let ln = start; ln < endLine; ln++) {
        const t = lines[ln - 1].trim();
        if (t === 'break;') {
          if (rm.has(ln)) continue;
          seq.push(ln);
          break;
        }
        seq.push(ln);
        const m = t.match(/printf\("(.*)\\n"\)/);
        if (m) out.push(m[1]);
      }
      return { seq, out, rm };
    }
    function paintStatic() {
      const rm = removed();
      C.$$('.line', pre).forEach((el, k) => el.classList.toggle('l3-removed', rm.has(k + 1)));
    }
    function show(t, upto) {
      const seq = t.seq.slice(0, upto);
      C.setLines(pre, seq, 'l3-ran');
      C.setLines(pre, [seq[seq.length - 1]]);
      $('l3-sw-trace').innerHTML = seq
        .map((ln) => `<li><span class="muted">第 ${ln} 行</span>　<code>${C.esc(lines[ln - 1].trim())}</code></li>`)
        .join('');
      let shown = 0;
      const outs = [];
      seq.forEach((ln) => {
        if (/printf\("(?!Enter)/.test(lines[ln - 1])) outs.push(t.out[shown++]);
      });
      $('l3-sw-out').textContent = `Enter grade: ${grade}\n` + outs.join('\n');
      const note = $('l3-sw-note');
      if (upto >= t.seq.length) {
        if (t.out.length > 1) {
          note.className = 'feedback is-err';
          note.innerHTML = `少了 break，程式從 <code>case '${grade}'</code> 一路「掉落」執行了 ${t.out.length} 個 printf！`;
        } else {
          note.className = 'feedback is-ok';
          note.innerHTML =
            caseLine(grade) < 0
              ? `沒有任何 case 符合 '${grade}'，所以執行 <code>default</code>。`
              : `從 <code>case '${grade}'</code> 進入，遇到 break 就跳出 switch。${/[a-z]/.test(grade) ? '' : ` 注意 <code>case '${grade}':</code> 下面沒有敘述，會掉落到小寫的 case。`}`;
        }
      } else {
        note.className = 'feedback';
        note.textContent = '';
      }
    }
    function run() {
      if (timer) C.stop(timer);
      paintStatic();
      const t = trace();
      let k = 1;
      show(t, k);
      if (C.reduced()) return show(t, t.seq.length);
      timer = C.every(() => {
        k++;
        show(t, k);
        if (k >= t.seq.length) {
          C.stop(timer);
          timer = null;
        }
      }, 450);
    }
    root.querySelectorAll('#l3-sw [data-swg]').forEach((b) =>
      b.addEventListener('click', () => {
        grade = b.dataset.swg;
        root.querySelectorAll('#l3-sw [data-swg]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        run();
      })
    );
    C.$$('.l3-sw-rm', root).forEach((c) => c.addEventListener('change', run));
    $('l3-sw-run').addEventListener('click', run);
    paintStatic();
    const t = trace();
    show(t, t.seq.length);
  }

  /* =========================================================
     Register
     ========================================================= */
  C.register({
    id: 'l3',
    order: 3,
    num: '03',
    title: '運算子與流程控制',
    en: 'Operators, Arrays, Strings, and Control Flow',
    lede: '這一講把各種運算子一次整理清楚——算術、關係、邏輯、位元、三元——再認識陣列和以 \\0 結尾的字串，最後用 if...else 和 switch 讓程式學會「做選擇」。',
    desc: '算術／邏輯／位元／三元運算子、陣列與字串，以及 if...else 與 switch。',
    tags: ['位元運算', '字串 \\0', 'if...else', 'switch'],
    objectives: [
      'C 語言的算術、關係、邏輯、位元與三元運算子怎麼用',
      '陣列（array）與字串（string）的宣告方式與基本觀念',
      '如何用 if...else 依條件執行不同的程式區塊',
      '如何用 switch 敘述式處理多重選擇的情境',
    ],
    sections,
    recap: [
      '算術、關係、邏輯、位元、三元運算子：各自處理不同層次的運算',
      '陣列儲存同型態的一群變數；字串是以 <code>\\0</code> 結尾的字元陣列',
      'if...else 依條件執行不同區塊，只會執行第一個成立的條件',
      'switch 適合處理「同一變數對應多種數值」的多重選擇情境',
    ],
    practice: '把「簡易解碼器」改成可以解讀 26 個英文字母的版本。（提示：一個位數只有 0~9，要怎麼表示 26 種可能？）',
    css: `
.l3-steps{margin:var(--s3) 0;padding-left:1.4em;font-size:.92rem;line-height:1.8}
.l3-steps li{margin:2px 0}
.l3-steps li.is-current{background:var(--hi);border-radius:var(--r-sm);padding:0 var(--s2)}
.l3-steps li.is-future{opacity:.55}
.l3-steps code{font-size:.88em}
.l3-ring-top{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:var(--s5);align-items:center}
@media (max-width:640px){.l3-ring-top{grid-template-columns:minmax(0,1fr)}}
.l3-bitgrid{display:flex;flex-direction:column;gap:var(--s2);margin:var(--s3) 0}
.l3-bitrow{display:grid;grid-template-columns:6.5em max-content minmax(0,1fr);align-items:center;gap:var(--s3)}
.l3-bitrow .bits{margin:0;flex-wrap:nowrap}
.l3-bitname{font-family:var(--font-mono);font-weight:700;font-size:.9rem;color:var(--ink-2);text-align:right}
.l3-bitval{font-family:var(--font-mono);font-size:.9rem;color:var(--ink);min-width:0;overflow-wrap:anywhere}
.l3-op{color:var(--accent-2)}
.l3-bitrule{border-bottom:2px solid var(--ink-2);padding-bottom:2px}
.l3-labels .bit-label{width:40px}
@media (max-width:420px){.l3-labels .bit-label{width:33px}}
@media (max-width:350px){.l3-labels .bit-label{width:29px}}
@media (max-width:560px){.l3-bitrow{grid-template-columns:max-content;gap:2px}.l3-bitname{text-align:left}.l3-bitrow>span:empty{display:none}}
.l3-tables{display:flex;flex-wrap:wrap;gap:var(--s4)}
@media (max-width:1100px){
  .l3-evaltable,.l3-evaltable tbody{display:block;border:0;background:none}
  .l3-evaltable thead{display:none}
  .l3-evaltable tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--s3);align-items:center;padding:var(--s3);margin-bottom:var(--s2);border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface)}
  .l3-evaltable td{display:block;padding:0;border:0}
  .l3-evaltable td:first-child{grid-column:1/-1}
  .l3-evaltable td:first-child code{white-space:normal;word-break:break-word}
}
.l3-tables .table-wrap{flex:1 1 150px;margin:0}
@media (max-width:640px){.l3-tt{display:table;width:100%}.l3-tt th,.l3-tt td{padding:6px 8px;text-align:center}.l3-tables .table-wrap{flex:1 1 100%}}
@media (pointer:coarse),(max-width:640px){#l3-bits .seg>button,.seg>button{min-width:36px}}
.l3-tt caption{caption-side:top;text-align:left;font-family:var(--font-mono);font-weight:700;padding:0 0 var(--s1);color:var(--ink-2)}
.l3-tt tbody tr{cursor:pointer}
.table tbody tr.is-hi>*{background:var(--hi);color:var(--ink);font-weight:700}
.l3-evaltable td{font-size:.86rem}
.l3-colhead{margin:0 0 var(--s2);font-size:.95rem}
.l3-strcells .cell{min-width:44px}
.l3-oob{border-style:dashed}
.l3-fc{display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.l3-fc-row{display:flex;align-items:center;gap:var(--s2);flex-wrap:wrap}
.l3-fc-yes{font-size:.8rem;color:var(--muted);white-space:nowrap}
.l3-fc-down{font-size:.78rem;color:var(--muted);padding-left:var(--s5);line-height:1.6}
.l3-fc .flow-node{font-size:.8rem;min-width:0}
.flow-node.is-false{background:color-mix(in srgb,var(--err) 9%,var(--surface));border-color:var(--err);border-style:solid;color:var(--ink)}
.flow-node.is-false::after{content:"✗";position:absolute;top:-9px;right:-9px;display:grid;place-items:center;width:18px;height:18px;font-size:.66rem;color:var(--surface);background:var(--err);border-radius:50%}
.code .line.l3-ran{background:color-mix(in srgb,var(--accent) 22%,transparent)}
.code .line.l3-removed{text-decoration:line-through;opacity:.45}
`,
    mount(root) {
      mountDecoder(root);
      mountString(root);
      mountTruth(root);
      mountNum(root);
      mountChain(root);
      mountBits(root);
      mountRing(root);
      mountPow2(root);
      mountTern(root);
      mountGrade(root);
      mountDiv(root);
      mountFlag(root);
      mountSwitch(root);
    },
  });
})();
