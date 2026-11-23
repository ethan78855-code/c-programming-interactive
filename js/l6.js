/* =========================================================
   Lecture 06 — Function Call Stack, Recursion, and Storage Classes
   ========================================================= */
(function () {
  'use strict';
  const C = window.C;
  const esc = C.esc;

  /* ---------- example code (from the course gist) ---------- */
  const SRC = {
    sumsq: String.raw`#include <stdio.h>

int square(int x) {
    return x * x;
}

int sumOfSquare(int a, int b) {
    return square(a) + square(b);
}

int main() {
    printf("%d\n", sumOfSquare(2, 3));
    return 0;
}`,
    fact: String.raw`#include <stdio.h>
int factorial(int n){
    if(n <= 1)
        return 1;
    else
        return n*factorial(n-1);
}

int main(){
    int a = factorial(5);
    printf("%d", a);
    return 0;
}`,
    factNoBase: String.raw`#include <stdio.h>
int factorial(int n){
    // 少了 base case：if(n <= 1) return 1;
    return n*factorial(n-1);
}

int main(){
    int a = factorial(5);
    printf("%d", a);
    return 0;
}`,
    fib: String.raw`#include <stdio.h>
int fib(int n){
    if(n <= 1)
        return n;
    else
        return fib(n-1)+fib(n-2);
}

int main(){
    int a = fib(8);
    printf("%d", a);
    return 0;
}`,
    fibLoop: String.raw`int fibLoop(int n){
    int prev = 0, curr = 1;
    if(n <= 1) return n;
    for(int i = 2; i <= n; i++){
        int next = prev + curr;   // 每一輪只做一次加法
        prev = curr;
        curr = next;
    }
    return curr;
}`,
    gcd: String.raw`#include <stdio.h>
int GCD(int a, int b){
    if(b == 0){
        return a;
    }
    return GCD(b, a%b);
}

int main(){
    int a = GCD(21, 12);
    printf("%d\n", a);
    return 0;
}`,
    rev: String.raw`#include <stdio.h>
void printReversely(){
    char word;
    if(scanf("%c", &word) != EOF && word != '\n'){
        printReversely();
        printf("%c", word);
    }
}

int main(){
    printReversely();
    printf("\n");
    return 0;
}`,
    mainRec: String.raw`#include <stdio.h>

int main(){
    static int sum = 0; //靜態變數，只會被宣告一次
    int input;
    printf("Input an integer (0 for ending): ");
    scanf("%d", &input);
    if(input){
        sum += input;
        main(); //呼叫自己
    }
    else
        printf("The total number is %d\n", sum);
    return 0;
}`,
    hanoi: String.raw`#include <stdio.h>

// n: 盤子數量, source: 起始柱, buffer: 緩衝柱, target: 目標柱
void hanoi(int n, char source, char buffer, char target) {

    // Base Case: 終止條件，如果只剩下1個盤子
    if (n == 1) {
        printf("Move the plate 1 from %c to %c\n", source, target);
        return;
    }

    // Step 1: 將 n-1 個盤子從 'source' 移到 'buffer' (利用 'target' 當暫存)
    hanoi(n - 1, source, target, buffer);

    // Step 2: 將第 n 個盤子從 'source' 移到 'target'
    printf("Move the plate %d from %c to %c\n", n, source, target);

    // Step 3: 將 n-1 個盤子從 'buffer' 移到 'target' (利用 'source' 當暫存)
    hanoi(n - 1, buffer, source, target);
}

int main() {
    int n;
    printf("Please enter the number of plates: ");
    scanf("%d", &n);
    printf("The moving process:\n");
    hanoi(n, 'A', 'B', 'C');
    return 0;
}`,
    autoCount: String.raw`void counting(){
    int count = 0;  //自動變數：每次呼叫都重新建立
    printf("%d ", count++);
}`,
    staticCount: String.raw`void counting(){
    static int count = 0; //靜態變數只宣告一次
    printf("%d ", count++);
}`,
    externWith: String.raw`#include <stdio.h>

void printGlobal(){
    extern int global;
    printf("%d", global);
}

int global = 10;

int main() {
    printGlobal();
    return 0;
}`,
    externWithout: String.raw`#include <stdio.h>

void printGlobal(){
    printf("%d", global);
}

int global = 10;

int main() {
    printGlobal();
    return 0;
}`,
  };

  /* ---------- shared: animated call-stack renderer ---------- */
  const frameHtml = (f, cls) =>
    `<div class="frame${cls}" data-key="${esc(f.key)}"><div class="frame-name">${f.name}</div>${
      f.vars && f.vars.length ? `<ul class="frame-vars">${f.vars.map((v) => `<li>${v}</li>`).join('')}</ul>` : ''
    }</div>`;

  function drawStack(host, frames, opts = {}) {
    if (!host) return;
    const prev = host._frames || [];
    let html = '';
    frames.forEach((f, i) => {
      const isNew = !opts.noAnim && (!prev[i] || prev[i].key !== f.key);
      html += frameHtml(f, (i === frames.length - 1 ? ' is-top' : '') + (isNew ? ' is-new' : '') + (f.dim ? ' is-dim' : ''));
    });
    let leaving = '';
    const samePrefix = frames.every((f, j) => !prev[j] || prev[j].key === f.key);
    if (!opts.noAnim && samePrefix) {
      for (let i = frames.length; i < prev.length; i++) leaving += frameHtml(prev[i], ' is-leaving');
    }
    host.innerHTML = html + leaving;
    if (leaving) C.after(() => host.querySelectorAll('.frame.is-leaving').forEach((e) => e.remove()), 420);
    host._frames = frames.map((f) => Object.assign({}, f));
  }

  const kv = (pairs) =>
    `<dl class="kv">${pairs
      .map(([k, v, hi]) => `<div${hi ? ' class="is-hi"' : ''}><dt>${k}</dt><dd>${v}</dd></div>`)
      .join('')}</dl>`;

  const fibv = (k) => {
    let a = 0;
    let b = 1;
    for (let i = 0; i < k; i++) [a, b] = [b, a + b];
    return a;
  };
  const fmt = (n) => Number(n).toLocaleString('en-US');

  /* =========================================================
     Section markup
     ========================================================= */
  function secStack() {
    return C.section(
      'l6-stack',
      '01',
      '函式呼叫堆疊（Call Stack）',
      C.prose(`
<p><strong>堆疊（stack）</strong>是一種「<mark>後進先出</mark>」（last-in first-out，<strong>LIFO</strong>）的資料結構：最後放進去的東西，會最先被拿出來，就像疊在一起的盤子，只能從最上面拿。</p>
<p>函式的呼叫正是一種堆疊機制。每當呼叫一個函式，電腦就把這個函式的「堆疊框」（stack frame，存放它的參數與區域變數）<strong>推入（push）</strong>堆疊頂端；函式 <code>return</code> 時，這個框就被<strong>彈出（pop）</strong>，控制權回到底下那一層。所以<strong>先呼叫 A、再呼叫 B，B 一定比 A 先結束</strong>。</p>`) +
        C.widget({
          id: 'l6-sandbox',
          title: '堆疊沙盒：push 與 pop',
          tag: '互動',
          hint: '按「push」把新函式放進堆疊，按「pop」把最上面的拿走。注意：永遠只能動最上面那一個。',
          body: `<div class="widget-split">
  <div><div class="stack l6-stack-sm" id="l6-sb-stack"></div></div>
  <div>
    <div id="l6-sb-kv"></div>
    <p class="caption">操作紀錄</p>
    <pre class="console" id="l6-sb-log" data-title="LOG"></pre>
    <p class="feedback" id="l6-sb-fb"></p>
  </div>
</div>`,
          controls: `<button type="button" class="btn btn--primary" data-act="push">push 下一個函式</button>
<button type="button" class="btn" data-act="pop">pop 最上面</button>
<button type="button" class="btn" data-act="demo">播放投影片示範：A → B → pop B → pop A</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" data-act="clear">清空</button>`,
        }) +
        C.prose(`<p>來看一個真正的程式。<code>main()</code> 呼叫 <code>sumOfSquare(2, 3)</code>，而 <code>sumOfSquare</code> 又先後呼叫 <code>square(a)</code> 與 <code>square(b)</code>。不論函式呼叫多複雜，都符合堆疊「先進後出」的規則：</p>`) +
        C.widget({
          id: 'l6-sos',
          title: 'sumOfSquare(2, 3) 的堆疊變化',
          tag: '逐步執行',
          hint: '對照投影片的 1 開始 → 2 開始 → 3 開始 → 3 結束 → 4 開始 → 4 結束 → 2 結束 → 1 結束。',
          body: `<div class="widget-split">
  <div>${C.code(SRC.sumsq, { id: 'l6-sos-code' })}</div>
  <div>
    <div id="l6-sos-kv"></div>
    <div class="stack" id="l6-sos-stack"></div>
    <pre class="console" id="l6-sos-out" data-title="輸出"></pre>
  </div>
</div>
<p class="feedback is-info" id="l6-sos-note"></p>`,
          controls: `<div id="l6-sos-step"></div>`,
        }) +
        C.callout('key', '重點', '<p><code>square(a)</code> 與 <code>square(b)</code> 先後被推入又彈出；<code>sumOfSquare(2,3)</code> 要等兩次 <code>square</code> 都結束才能 <code>return</code>。後進的先出，這就是 LIFO。</p>')
    );
  }

  function secConcept() {
    const chip = (t, sec) => (sec ? `<a class="chip" href="#/l6/${sec}">${t} →</a>` : `<span class="chip">${t}</span>`);
    return C.section(
      'l6-concept',
      '02',
      '遞迴（Recursion）的設計觀念',
      C.prose(`<p><strong>遞迴函式（recursive function）</strong>是一種可以<strong>直接或間接呼叫自己</strong>的函式。它在數學與組合問題、字串處理、路徑問題、幾何問題上都很常用。下面是一些經典的遞迴範例（有箭頭的可以點進本講的互動圖解）：</p>`) +
        `<div class="row l6-chips">${[
          chip('階乘計算', 'l6-fact'),
          chip('河內塔', 'l6-hanoi'),
          chip('輾轉相除法求最大公因數', 'l6-gcd'),
          chip('約瑟夫問題（Josephus problem）'),
          chip('費波南希數列', 'l6-fib'),
          chip('二元搜尋（Binary search）'),
          chip('合併排序（Merge sort）'),
          chip('快速排序（Quick sort）'),
          chip('整數拆分問題'),
        ].join('')}</div>` +
        C.prose('<p>遞迴函式解決問題的方法有兩大核心：</p>') +
        C.cards([
          {
            num: '01',
            title: '基本情況（base case）',
            body: '<p>這是遞迴的<strong>終止條件</strong>。遞迴函式只知道如何處理這種最簡單的狀況，不需要再呼叫自己就能直接給出答案。</p>',
          },
          {
            num: '02',
            title: '遞迴步驟（recursive step）',
            body: '<p>問題複雜時，拆成兩部分：<strong>目前能處理的邏輯</strong> ＋ <strong>規模更小、但性質相同的原始問題</strong>。關鍵：這一步必須讓問題逐漸<strong>收斂向 base case</strong>。</p>',
          },
        ]) +
        C.callout(
          'warn',
          '小心無窮遞迴',
          '<p>如果遞迴函式無法一步一步簡化成 base case，就會一直呼叫自己，堆疊框越疊越高，最終<strong>耗盡記憶體</strong>（stack overflow），程式當掉。下一節的階乘圖解可以勾選「拿掉 base case」親眼看看。</p>'
        )
    );
  }

  function secFact() {
    return C.section(
      'l6-fact',
      '03',
      '階乘計算（Factorial）',
      C.prose(`
<p>階乘的定義是 <code>n! = n × (n−1) × (n−2) × ⋯ × 2 × 1</code>，並且規定 <code>1! = 0! = 1</code>。仔細觀察可以發現，大問題裡面藏著一個小一號的同樣問題：</p>
<p class="center mono"><mark>4! = 4 × 3 × 2 × 1 = 4 × (3 × 2 × 1) = 4 × 3!</mark></p>
<p>於是得到遞迴式：</p>
<ul>
  <li><code>f(n) = 1</code>，當 <code>n = 0</code> 或 <code>1</code> → <strong>base case</strong>，直接 <code>return 1</code></li>
  <li><code>f(n) = n × f(n−1)</code>，當 <code>n &gt; 1</code> → <strong>recursive step</strong></li>
</ul>
<p>寫成 C 語言時，「<code>n *</code>」是<strong>這一層知道怎麼做</strong>的部分；「<code>factorial(n−1)</code>」是<strong>不知道答案、交給下一層</strong>處理的部分。每一層都在等下一層回傳，所以堆疊會先一路疊高，再一路拆回來。</p>`) +
        C.widget({
          id: 'l6-fact-w',
          title: 'factorial(n) 遞迴展開',
          tag: '逐步執行',
          hint: '先看堆疊「疊上去」（每層都在等），碰到 base case 後再「拆回來」，把回傳值一層層乘回去。',
          body: `<p class="l6-expr" id="l6-fact-expr"></p>
<div class="widget-split">
  <div id="l6-fact-codewrap"></div>
  <div>
    <div id="l6-fact-kv"></div>
    <div class="stack" id="l6-fact-stack"></div>
    <pre class="console" id="l6-fact-out" data-title="輸出"></pre>
  </div>
</div>
<p class="feedback is-info" id="l6-fact-note"></p>`,
          controls: `<div id="l6-fact-step"></div>
<span class="spacer"></span>
<label class="field field--inline"><span>n = <output id="l6-fact-nv">5</output></span><input type="range" id="l6-fact-n" min="1" max="8" value="5"></label>
<label class="field field--inline"><input type="checkbox" id="l6-fact-nobase"><span>拿掉 base case</span></label>`,
        })
    );
  }

  function secFib() {
    return C.section(
      'l6-fib',
      '04',
      '費波南希數列與指數複雜度',
      C.prose(`
<p>費波南希數列（Fibonacci sequence）以 0、1 開始，之後的每一個數都是<strong>前兩個數的和</strong>：</p>
<p class="center mono">0, 1, 1, 2, 3, 5, 8, 13, 21, 34, …</p>
<ul>
  <li><code>fib(n) = n</code>，當 <code>n = 0</code> 或 <code>1</code>（base case）</li>
  <li><code>fib(n) = fib(n−1) + fib(n−2)</code>，當 <code>n &gt; 1</code>（recursive step）</li>
</ul>`) +
        C.code(SRC.fib) +
        C.prose('<p>跟階乘不同，<code>fib</code> 的每一層會呼叫自己<strong>兩次</strong>，所以呼叫過程長成一棵「樹」。投影片畫的是 <code>fib(3)</code>；下面可以把 n 調大，看看同一個 <code>fib(k)</code> 被重複計算了幾次。</p>') +
        C.widget({
          id: 'l6-fibtree',
          title: 'fib(n) 呼叫樹',
          tag: '動畫',
          hint: '同一種顏色＝同一個 fib(k)。滑過或點一個節點，會標出所有重複的同名呼叫。按「自動播放」看電腦真正的執行順序（深度優先）。',
          body: `<div class="tree tree--wide" id="l6-fib-tree"></div>
<p class="caption" id="l6-fib-hint" hidden>↔ 這棵樹比螢幕寬，可以在框內左右滑動查看全部節點。</p>
<div class="widget-split">
  <div><div id="l6-fib-kv"></div><p class="caption">目前的呼叫堆疊（由下往上）</p><p class="l6-path" id="l6-fib-path"></p></div>
  <div><p class="caption">每個 fib(k) 總共被呼叫幾次</p><div class="bar-chart" id="l6-fib-bars" style="--label-w:64px"></div></div>
</div>`,
          controls: `<div id="l6-fib-step"></div>
<span class="spacer"></span>
<label class="field field--inline"><span>n = <output id="l6-fib-nv">5</output></span><input type="range" id="l6-fib-n" min="1" max="7" value="5"></label>`,
        }) +
        C.prose(`<p>這種重複計算讓遞迴版的呼叫次數暴增。投影片用一個粗略的說法：每多一層，呼叫總數最多變成 2 倍，所以約為 <strong>2ⁿ</strong> 次；精確算的話，<code>fib(n)</code> 一共會呼叫 <code>2·fib(n+1) − 1</code> 次（大約 1.618ⁿ），一樣是<strong>指數成長</strong>。電腦科學家把這種現象稱為<strong>指數等級複雜度（exponential complexity）</strong>。</p>`) +
        C.widget({
          id: 'l6-growth',
          title: '呼叫次數成長圖：遞迴 vs 迴圈',
          tag: '圖表',
          hint: '在圖上移動（或拖拉下方的 n）看每個 n 的實際次數；切換成「對數軸」才看得清楚指數成長是一條直線。',
          body: `<div class="legend"><span data-c="2">遞迴版 fib(n) 的呼叫次數</span><span data-c="3">迴圈版的迴圈次數（約 n）</span><span data-c="4">投影片的上界 2ⁿ</span></div>
<div class="l6-chart" id="l6-chart"></div>
<div id="l6-chart-kv"></div>`,
          controls: `${C.seg(
            'l6-axis',
            [
              ['lin', '線性軸'],
              ['log', '對數軸'],
            ],
            'lin',
            'Y 軸刻度'
          )}
<span class="spacer"></span>
<label class="field field--inline"><span>n = <output id="l6-chart-nv">20</output></span><input type="range" id="l6-chart-n" min="0" max="30" value="20"></label>`,
        }) +
        C.callout(
          'key',
          '投影片的數字',
          '<p>計算第 20 個 Fibonacci 數約需 2²⁰ 次函式呼叫，<strong>約一百萬次</strong>；第 30 個約需 2³⁰ 次，<strong>約十億次</strong>。（2ⁿ 是上界，實際是 21,891 次與 2,692,537 次——仍然多到不合理。）</p>'
        ) +
        C.prose('<p>課後練習要你「不用遞迴，改用迴圈」重寫——迴圈版只要從前往後加 n 次，就是上圖那條幾乎貼在地上的綠線：</p>') +
        C.code(SRC.fibLoop)
    );
  }

  function secGcd() {
    return C.section(
      'l6-gcd',
      '05',
      '輾轉相除法求最大公因數（GCD）',
      C.prose(`
<ol>
  <li>將兩整數代入 <code>r = a % b</code> 的 a 與 b 中，求出 r</li>
  <li>將上一步的 b 與 r 重新代入 <code>r = a % b</code> 的 a 與 b 中，求出新的 r</li>
  <li>重複直到 r 等於 0，此時的 b 就是兩整數的最大公因數</li>
</ol>
<p>寫成遞迴：base case 是 <code>b == 0</code>（直接回傳 a）；recursive step 是 <code>GCD(b, a % b)</code>。例如 <code>GCD(12, 18) → GCD(18, 12) → GCD(12, 6) → GCD(6, 0)</code>，b == 0，回傳 6。</p>`) +
        C.code(SRC.gcd) +
        C.widget({
          id: 'l6-gcd-w',
          title: 'GCD 遞迴呼叫與「切正方形」圖解',
          tag: '逐步執行',
          hint: '幾何意義：在 a × b 的長方形裡，不斷切下以短邊為邊長的正方形；a % b 就是切完剩下的部分。最後能剛好切完的正方形邊長，就是最大公因數。',
          body: `<div class="widget-split">
  <div><div class="stack l6-stack-sm" id="l6-gcd-stack"></div><div id="l6-gcd-kv"></div></div>
  <div><div class="l6-rect" id="l6-gcd-rect"></div></div>
</div>
<p class="feedback is-info" id="l6-gcd-note"></p>`,
          controls: `<div id="l6-gcd-step"></div>
<span class="spacer"></span>
<label class="field field--inline"><span>a</span><input type="number" id="l6-gcd-a" min="1" max="999" value="12"></label>
<label class="field field--inline"><span>b</span><input type="number" id="l6-gcd-b" min="1" max="999" value="18"></label>
<button type="button" class="btn btn--sm btn--ghost" data-preset="12,18">12, 18</button>
<button type="button" class="btn btn--sm btn--ghost" data-preset="21,12">21, 12</button>
<button type="button" class="btn btn--sm btn--ghost" data-preset="65,25">65, 25</button>`,
        })
    );
  }

  function secReverse() {
    return C.section(
      'l6-reverse',
      '06',
      '遞迴與堆疊的應用',
      C.prose(`<h3>利用呼叫堆疊倒著印出輸入的字母</h3>
<p>每次呼叫 <code>printReversely()</code> 都<strong>先讀入一個字元，再遞迴呼叫自己</strong>讀下一個；一路遞迴到讀到換行（或 EOF）才開始 return。<code>printf</code> 寫在遞迴呼叫<strong>之後</strong>，所以字元是在「拆堆疊」的過程中才被印出——最後讀的最先印，自然就反過來了。這正是函式呼叫堆疊「後進先出」的實際應用。</p>`) +
        C.widget({
          id: 'l6-rev-w',
          title: '倒著印出輸入',
          tag: '逐步執行',
          hint: '輸入一個字串，看每一層的區域變數 word 如何被「保管」在自己的堆疊框裡，等到回程才印出。',
          body: `<p class="caption">鍵盤緩衝區（scanf 一次讀一個字元，⏎ 代表 '\\n'）</p>
<div class="cells cells--nowrap" id="l6-rev-buf"></div>
<div class="widget-split">
  <div>${C.code(SRC.rev, { id: 'l6-rev-code' })}</div>
  <div><div class="stack" id="l6-rev-stack"></div><pre class="console" id="l6-rev-out" data-title="輸出"></pre></div>
</div>
<p class="feedback is-info" id="l6-rev-note"></p>`,
          controls: `<div id="l6-rev-step"></div>
<span class="spacer"></span>
<label class="field field--inline"><span>輸入</span><input type="text" id="l6-rev-in" value="CCU" maxlength="10" size="10" autocomplete="off" spellcheck="false"></label>`,
        }) +
        C.prose(`<h3>main 函式也能遞迴</h3>
<p>如同一般函式，<code>main</code> 也可以呼叫自己。下面的程式不斷讀入整數並累加，輸入 0 時印出總和。注意 <code>sum</code> 被宣告成 <code>static</code>：如果它是普通的區域變數，每次呼叫 <code>main()</code> 都會被重設為 0；宣告 <code>static</code> 後，它只會被初始化一次，才能<strong>跨層保留總和</strong>（第 08 節會詳細說明）。</p>`) +
        C.widget({
          id: 'l6-mainrec',
          title: 'main() 呼叫自己：累加器',
          tag: '模擬',
          hint: '輸入幾個整數按「送出」，最後輸入 0。觀察每層 main() 都有自己的 input，但 static sum 只有一份。',
          body: `<div class="widget-split">
  <div>${C.code(SRC.mainRec, { id: 'l6-mr-code' })}</div>
  <div>
    <div id="l6-mr-kv"></div>
    <div class="stack l6-stack-sm" id="l6-mr-stack"></div>
  </div>
</div>
<pre class="console" id="l6-mr-out" data-title="終端機"></pre>
<p class="feedback" id="l6-mr-fb"></p>`,
          controls: `<label class="field field--inline"><span>輸入整數</span><input type="number" id="l6-mr-in" value="5" step="1"></label>
<button type="button" class="btn btn--primary" data-act="send">送出</button>
<button type="button" class="btn" data-act="zero">輸入 0 結束</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" data-act="restart">重新執行程式</button>`,
        })
    );
  }

  function secHanoi() {
    return C.section(
      'l6-hanoi-sec',
      '07',
      '河內塔（Tower of Hanoi）',
      C.prose(`<p>傳說有一座被視為「宇宙中心」的神廟，廟裡的木板上豎立著三根細長的柱子。其中一根柱子上，依大小由下到上套著 <strong>64 片金盤</strong>，最大在最底層。天神要僧侶把這 64 個金盤從第一根柱子搬到第三根，但必須遵守兩條規則：</p>
<ul><li><strong>一次只能移動一個圓盤</strong></li><li><strong>無論何時，大盤子絕對不能疊在小盤子上面</strong></li></ul>
<p>傳說當僧侶完成最後一步的瞬間，世界將會毀滅——當然這只是傳說。（就算一秒搬一片，64 片也要 2⁶⁴ − 1 秒，約 5,800 億年。）</p>
<h3>遞迴設計：不去想每一步，只想三個大步驟</h3>
<p>假設有 A、B、C 三根柱子，要把 n 個圓盤從 A 移到 C（B 當緩衝）：</p>`) +
        C.cards([
          { num: '1', title: '先搬走上面 n−1 個', body: '<p>把上面的 n−1 個盤子看成一個整體，從 A 搬到 B（C 當緩衝）。</p>' },
          { num: '2', title: '搬最大的那一個', body: '<p>將剩下最大的第 n 個盤子，直接從 A 搬到 C。</p>' },
          { num: '3', title: '再把 n−1 個疊回來', body: '<p>最後把在 B 的那 n−1 個盤子，從 B 搬到 C（A 當緩衝）。</p>' },
        ]) +
        C.callout('key', '遞迴的精髓', '<p>把大問題化解為「移動 n−1 個盤子」的小問題，規模逐漸收斂向 base case（只剩 1 個盤子，直接搬）。總步數是 <strong>2ⁿ − 1</strong>。</p>') +
        C.widget({
          id: 'l6-hanoi-w',
          title: '河內塔：自己玩，或看遞迴自動解',
          tag: '遊戲',
          hint: '點一根柱子拿起最上面的盤子，再點另一根放下。按「自動解」看 hanoi() 遞迴如何一步步印出搬法。',
          body: `<div class="widget-split">
  <div>
    <div class="hanoi" id="l6-hanoi"></div>
    <div id="l6-hanoi-kv"></div>
    <p class="feedback" id="l6-hanoi-fb"></p>
  </div>
  <div>
    <p class="caption">目前執行到的遞迴呼叫（由外到內）</p>
    <p class="l6-path" id="l6-hanoi-call">—</p>
    <pre class="console l6-scroll" id="l6-hanoi-out" data-title="The moving process"></pre>
  </div>
</div>`,
          controls: `<button type="button" class="btn btn--primary" data-act="auto">▶ 自動解</button>
<button type="button" class="btn" data-act="pause" disabled>⏸ 暫停</button>
<button type="button" class="btn btn--ghost" data-act="reset">⟲ 重設</button>
<span class="spacer"></span>
<label class="field field--inline"><span>盤子 <output id="l6-hanoi-nv">3</output></span><input type="range" id="l6-hanoi-n" min="3" max="7" value="3"></label>
<label class="field field--inline"><span>速度 <output id="l6-hanoi-sv">3</output></span><input type="range" id="l6-hanoi-speed" min="1" max="5" value="3"></label>`,
        }) +
        C.code(SRC.hanoi, { id: 'l6-hanoi-code' })
    );
  }

  function secStorage() {
    return C.section(
      'l6-storage',
      '08',
      '變數的儲存類別（Storage Class）',
      C.prose(`<p>我們用<strong>識別字</strong>（identifier）當變數與函式的名稱，例如 <code>int a = 10;</code> 的 <code>a</code>。識別字還具有「儲存類別」的特性，決定它的<strong>儲存佔用期間</strong>（storage duration，什麼時候存在）以及<strong>能被參考的範圍</strong>（scope，哪裡看得到）。C 提供四種儲存類別指定詞（storage class specifiers）：</p>`) +
        C.table(
          ['儲存類別', '宣告位置', '存續期間', '可見範圍', '存放位置', '沒給初值時'],
          [
            ['<code>auto</code><br><small>自動變數（預設）</small>', '函式本體或參數列', '進入函式時建立，離開時釋放', '所在的函式／區塊', '堆疊（stack）', '不確定（垃圾值）'],
            ['<code>static</code><br><small>靜態變數</small>', '函式內或全域', '程式開始到結束；<strong>只初始化一次</strong>', '區域 static：所在區塊；全域 static：只限本檔案', '靜態資料區', '0'],
            ['<code>extern</code><br><small>外部變數</small>', '全域（全域變數預設就是 extern）', '程式開始到結束', '可在其他函式、甚至同專案的其他檔案用 extern 宣告取用', '靜態資料區', '0'],
            ['<code>register</code><br><small>暫存器變數</small>', '函式內', '同 auto', '同 auto', '建議編譯器放進 CPU 暫存器（可被忽略），不能用 &amp; 取址', '不確定'],
          ],
          'l6-sc'
        ) +
        C.prose(`<h3>自動變數 vs 靜態變數</h3>
<p><strong>自動變數</strong>（或稱內部變數）只能是區域變數。它從宣告處開始有效，離開函式時就釋放記憶體；下次進入函式時重新配置，<strong>無法保留舊值</strong>。函式的區域變數預設都是 <code>auto</code>，所以這個關鍵字幾乎不會被寫出來。</p>
<p><strong>靜態變數</strong>則和函式一樣，從程式開始執行到結束都存在，<strong>只會被宣告及初始化一次</strong>，下次呼叫時延續之前的值。</p>`) +
        C.widget({
          id: 'l6-counter',
          title: 'auto vs static 計數器',
          tag: '比較',
          hint: '分別呼叫兩個版本的 counting()，比較輸出，並看 count 住在哪裡：auto 版住在每次新建的堆疊框裡，static 版住在靜態資料區。',
          body: `<div class="widget-split">
  <div class="l6-col">
    <p class="l6-col-title"><span class="badge">auto</span> 自動變數版</p>
    ${C.code(SRC.autoCount)}
    <button type="button" class="btn btn--primary" data-act="call-auto">呼叫 counting()</button>
    <p class="caption">堆疊（每次呼叫新建一個框）</p>
    <div class="stack l6-stack-xs" id="l6-ct-astack"></div>
    <pre class="console" id="l6-ct-aout" data-title="輸出"></pre>
  </div>
  <div class="l6-col">
    <p class="l6-col-title"><span class="badge">static</span> 靜態變數版</p>
    ${C.code(SRC.staticCount)}
    <button type="button" class="btn btn--primary" data-act="call-static">呼叫 counting()</button>
    <p class="caption">靜態資料區（整個程式只有一份）</p>
    <div id="l6-ct-skv"></div>
    <div class="stack l6-stack-xs" id="l6-ct-sstack"></div>
    <pre class="console" id="l6-ct-sout" data-title="輸出"></pre>
  </div>
</div>`,
          controls: `<button type="button" class="btn btn--primary" data-act="loop5">兩邊都執行 for 迴圈呼叫 5 次</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" data-act="reset">⟲ 重新執行程式</button>`,
        }) +
        C.prose(`<h3>外部變數（extern）</h3>
<p>全域變數與函式若沒有指明儲存類別，預設就是 <code>extern</code>。它和 static 一樣屬於靜態儲存類別，從程式開始到結束都存在。<code>extern</code> 變數一定要有在全域範圍的定義，在區域宣告時<strong>不能設定初始值</strong>。</p>
<p>和全域 static 不同的地方是：在全域變數「範圍規則之外」的函式內（例如定義寫在函式後面），或是同專案的不同檔案，都可以藉由宣告同名的 <code>extern</code> 變數來取用它。</p>`) +
        C.widget({
          id: 'l6-extern',
          title: 'extern 編譯檢查',
          tag: '互動',
          hint: '編譯器由上往下讀。global 的定義寫在 printGlobal() 後面，printGlobal() 裡面能用到它嗎？勾選或取消 extern 宣告後按「編譯並執行」。',
          body: `<div class="widget-split">
  <div id="l6-ext-code"></div>
  <div><pre class="console" id="l6-ext-out" data-title="編譯器 / 輸出"></pre><p class="feedback" id="l6-ext-fb"></p></div>
</div>`,
          controls: `<button type="button" class="btn btn--primary" data-act="compile">編譯並執行</button>
<label class="field field--inline"><input type="checkbox" id="l6-ext-on" checked><span>在 printGlobal() 裡加上 <code>extern int global;</code></span></label>`,
        })
    );
  }

  function secConst() {
    return C.section(
      'l6-const',
      '09',
      '型別限定詞 const',
      C.prose(`<p>在 C 裡，<code>const</code> 是「型別限定詞」（type qualifier），用來宣告<strong>唯讀</strong>（不可被修改）的值。<code>const int x = 10;</code> 表示 x 是整數，但之後不能再寫 <code>x = 20;</code>。</p>
<p>和指標搭配時，要看 <code>const</code> 在 <code>*</code> 的<strong>左邊還是右邊</strong>：</p>
<ul>
  <li><code>const int *p;</code>（或 <code>int const *p;</code>）——「<code>*p</code> 是 const」：不能改<strong>指向的內容</strong>，但可以改指標指向哪裡</li>
  <li><code>int * const p = &amp;x;</code>——「<code>p</code> 是 const」：指標本身<strong>不能換指向</strong>，但指向的內容可以改</li>
  <li><code>const int * const p = &amp;x;</code>——兩個都鎖住</li>
</ul>`) +
        C.widget({
          id: 'l6-constw',
          title: 'const 指標規則實驗室',
          tag: '互動',
          hint: '先選一種宣告，再按下面的操作，看編譯器會不會讓你過。🔒 表示被鎖住、不能透過 p 修改的東西。',
          body: `<pre class="code code--plain l6-const-code" id="l6-const-code"></pre>
<div class="l6-ptr" id="l6-const-diagram"></div>
<div class="row"><span id="l6-const-pill"></span></div>
<p class="feedback" id="l6-const-fb"></p>`,
          controls: `${C.seg(
            'l6-cdecl',
            [
              ['a', 'const int *p'],
              ['b', 'int * const p'],
              ['c', 'const int * const p'],
            ],
            'a',
            '指標宣告'
          )}
<button type="button" class="btn btn--sm" data-op="write"><code>*p = 10;</code></button>
<button type="button" class="btn btn--sm" data-op="move"><code>p = &amp;other;</code></button>
<button type="button" class="btn btn--sm" data-op="read"><code>printf("%d", *p);</code></button>
<span class="spacer"></span>
<button type="button" class="btn btn--sm btn--ghost" data-op="reset">⟲ 重設</button>`,
        }) +
        C.prose('<h3>為什麼要用 const？</h3>') +
        C.cards([
          { num: '01', title: '防止意外修改', body: '<p>保護不該被改到的東西，例如函式參數、全域設定值。改到了編譯器會直接報錯。</p>' },
          { num: '02', title: '保證函式不亂改資料', body: '<p><code>void fun(const int *p)</code> 保證函式不會透過這個指標修改呼叫者的資料。</p>' },
          { num: '03', title: '讓意圖更清楚', body: '<p>一看到 <code>const</code> 就知道：這個值在這裡是唯讀的。</p>' },
        ])
    );
  }

  /* =========================================================
     Mount: wire every widget
     ========================================================= */
  function mountSandbox(root) {
    const w = C.$('#l6-sandbox', root);
    const stackEl = C.$('#l6-sb-stack', w);
    const kvEl = C.$('#l6-sb-kv', w);
    const log = C.$('#l6-sb-log', w);
    const fb = C.$('#l6-sb-fb', w);
    const LETTERS = 'ABCDEF';
    const MAX = 6;
    let st = [];
    let seq = 0;
    let lines = [];
    let demoTimers = [];
    const draw = () => {
      drawStack(
        stackEl,
        st.map((it, i) => ({ key: it.key, name: `${it.name}()`, vars: [`第 ${i + 1} 個進入`] }))
      );
      kvEl.innerHTML = kv([
        ['堆疊深度', `${st.length} / ${MAX}`],
        ['頂端（top）', st.length ? st[st.length - 1].name + '()' : '—', true],
        ['下一個 pop 的是', st.length ? st[st.length - 1].name + '()' : '（空）'],
      ]);
      log.textContent = lines.length ? lines.join('\n') : '（還沒有操作）';
    };
    const push = () => {
      if (st.length >= MAX) {
        fb.className = 'feedback is-err';
        fb.textContent = `堆疊已滿（這個沙盒最多 ${MAX} 層）。真實程式若無限制地呼叫函式，堆疊空間用完就會發生 stack overflow。`;
        return;
      }
      const name = LETTERS[st.length];
      st.push({ name, key: name + ++seq });
      lines.push(`push ${name}()   → 堆疊：${st.map((s) => s.name).join(' ')}`);
      fb.className = 'feedback is-info';
      fb.textContent = `${name}() 被呼叫，放到最上面。`;
      draw();
    };
    const pop = () => {
      if (!st.length) {
        fb.className = 'feedback is-err';
        fb.textContent = '堆疊是空的，沒有東西可以 pop。';
        return;
      }
      const it = st.pop();
      lines.push(`pop  ${it.name}()   → 堆疊：${st.map((s) => s.name).join(' ') || '（空）'}`);
      fb.className = 'feedback is-ok';
      fb.textContent = `${it.name}() 執行完畢、return，從最上面被拿走。${st.length ? `控制權回到 ${st[st.length - 1].name}()。` : '堆疊清空了。'}`;
      draw();
    };
    const cancelDemo = () => {
      demoTimers.forEach(C.stop);
      demoTimers = [];
    };
    w.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a !== 'demo') cancelDemo();
      if (a === 'push') push();
      else if (a === 'pop') pop();
      else if (a === 'clear') {
        st = [];
        lines = [];
        fb.className = 'feedback';
        fb.textContent = '';
        draw();
      } else if (a === 'demo') {
        cancelDemo();
        st = [];
        lines = ['示範：先呼叫 A、再呼叫 B → B 先結束 → A 才結束'];
        draw();
        const ops = [push, push, pop, pop];
        ops.forEach((fn, i) => demoTimers.push(C.after(fn, 500 + i * 900)));
        fb.className = 'feedback is-info';
        fb.textContent = '播放中……';
      }
    });
    draw();
  }

  function mountSumSq(root) {
    const w = C.$('#l6-sos', root);
    const code = C.$('#l6-sos-code', w);
    const stackEl = C.$('#l6-sos-stack', w);
    const out = C.$('#l6-sos-out', w);
    const note = C.$('#l6-sos-note', w);
    const kvEl = C.$('#l6-sos-kv', w);
    const M = (vars) => ({ key: 'main', name: 'main()', vars });
    const S = (vars) => ({ key: 'sos', name: 'sumOfSquare(2, 3)', vars: ['a = 2', 'b = 3'].concat(vars || []) });
    const steps = [
      { tag: '1 開始', lines: [11, 12], frames: [M(['需要 sumOfSquare(2, 3) 的值'])], out: '', note: 'main() 開始執行，它的堆疊框被推入（push）。執行到 printf 時需要 sumOfSquare(2, 3) 的值，於是呼叫它。' },
      { tag: '2 開始', lines: [7, 8], frames: [M(['等待 sumOfSquare 回傳…']), S()], out: '', note: 'sumOfSquare(2, 3) 被推入堆疊，參數 a = 2、b = 3 存在它自己的堆疊框裡。' },
      { tag: '3 開始', lines: [3, 4], frames: [M(['等待…']), S(['等待 square(a)…']), { key: 'sqa', name: 'square(a)', vars: ['x = 2'] }], out: '', note: '計算 square(a)：square 被推入堆疊頂端，參數 x 拿到 a 的值 2。' },
      { tag: '3 結束', lines: [8], frames: [M(['等待…']), S(['square(a) = 4'])], out: '', note: 'square 回傳 2 × 2 = 4，然後被彈出（pop），控制權回到 sumOfSquare。' },
      { tag: '4 開始', lines: [3, 4], frames: [M(['等待…']), S(['square(a) = 4', '等待 square(b)…']), { key: 'sqb', name: 'square(b)', vars: ['x = 3'] }], out: '', note: '接著計算 square(b)：又一個 square 被推入，這次 x = 3。' },
      { tag: '4 結束', lines: [8], frames: [M(['等待…']), S(['square(a) = 4', 'square(b) = 9'])], out: '', note: 'square 回傳 3 × 3 = 9 並被彈出。兩次 square 都結束了，sumOfSquare 終於可以算出結果。' },
      { tag: '2 結束', lines: [12], frames: [M(['sumOfSquare(2, 3) = 13'])], out: '13', note: 'sumOfSquare 回傳 4 + 9 = 13 並被彈出，main 收到 13，由 printf 印出。' },
      { tag: '1 結束', lines: [13], frames: [], out: '13', note: 'main 執行 return 0; 也被彈出，堆疊清空、程式結束。最後進來的 square 最先離開，最先進來的 main 最後離開——後進先出。' },
    ];
    C.stepper(C.$('#l6-sos-step', w), {
      count: steps.length,
      interval: 1400,
      render(i) {
        const s = steps[i];
        C.setLines(code, s.lines);
        drawStack(stackEl, s.frames);
        out.textContent = s.out;
        note.textContent = s.note;
        kvEl.innerHTML = kv([
          ['投影片狀態', s.tag, true],
          ['堆疊深度', String(s.frames.length)],
        ]);
      },
    });
  }

  function mountFact(root) {
    const w = C.$('#l6-fact-w', root);
    const nIn = C.$('#l6-fact-n', w);
    const nOut = C.$('#l6-fact-nv', w);
    const noBase = C.$('#l6-fact-nobase', w);
    const codeWrap = C.$('#l6-fact-codewrap', w);
    const stackEl = C.$('#l6-fact-stack', w);
    const out = C.$('#l6-fact-out', w);
    const note = C.$('#l6-fact-note', w);
    const expr = C.$('#l6-fact-expr', w);
    const kvEl = C.$('#l6-fact-kv', w);
    const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
    const MAXSHOW = 7;
    let steps = [];
    let code = null;

    function build() {
      const n = +nIn.value;
      const broken = noBase.checked;
      nOut.textContent = n;
      const src = (broken ? SRC.factNoBase : SRC.fact).replace('factorial(5)', `factorial(${n})`);
      codeWrap.innerHTML = C.code(src, { id: 'l6-fact-code' });
      code = C.$('#l6-fact-code', codeWrap);
      const mainLine = broken ? 8 : 10;
      const main = (v) => ({ key: 'main', name: 'main()', vars: [v] });
      const fr = (k, v) => ({ key: 'f' + k, name: `factorial(${k})`, vars: [`n = ${k}`, v] });
      steps = [];
      steps.push({ frames: [main(`a = factorial(${n}) = ?`)], lines: [mainLine], out: '', expr: `factorial(${n})`, note: `main 呼叫 factorial(${n})，然後停在這一行等待結果。`, depth: 1 });
      if (broken) {
        const LIMIT = 12;
        const chain = [];
        for (let d = 0; d < LIMIT; d++) {
          const k = n - d;
          chain.push(fr(k, `${k} * factorial(${k - 1}) = ?`));
          steps.push({
            frames: [main('等待…')].concat(chain.slice()),
            lines: [4],
            out: '',
            expr: `${chain.map((f) => f.name.match(/\((-?\d+)\)/)[1]).join(' × ')} × factorial(${k - 1}) × …`,
            note: k <= 1 ? `n = ${k} 本來應該停下，但我們把 base case 拿掉了，只好繼續呼叫 factorial(${k - 1})……` : `factorial(${k}) 需要 factorial(${k - 1})，再推入一層。`,
            depth: chain.length + 1,
          });
        }
        steps.push({
          frames: [main('等待…')].concat(chain.slice()),
          lines: [4],
          out: 'Segmentation fault (stack overflow)',
          expr: '永遠到不了終點：n 一路變成 0、−1、−2……',
          note: '沒有 base case，遞迴永遠不會收斂，堆疊框越疊越多，最終耗盡堆疊記憶體，程式崩潰。這就是「無窮遞迴」。',
          depth: chain.length + 1,
          err: true,
        });
        return;
      }
      const chain = [];
      for (let k = n; k >= 1; k--) {
        chain.push(fr(k, k <= 1 ? 'n <= 1 → base case' : `${k} * factorial(${k - 1}) = ?`));
        const pre = [];
        for (let j = n; j > k; j--) pre.push(j);
        steps.push({
          frames: [main('等待…')].concat(chain.slice()),
          lines: k <= 1 ? [3, 4] : [3, 6],
          out: '',
          expr: k <= 1 ? `${pre.concat([1]).join(' × ')}` : `${pre.concat([`factorial(${k})`]).join(' × ').replace(`factorial(${k})`, `${k} × factorial(${k - 1})`)}`,
          note: k <= 1 ? `factorial(1) 碰到 base case（n <= 1），直接 return 1，不再呼叫自己。堆疊在這裡疊到最高：${chain.length + 1} 層。` : `factorial(${k}) 知道要算 ${k} × factorial(${k - 1})，但還不知道 factorial(${k - 1}) 是多少，只好先呼叫它、自己在這裡等。`,
          depth: chain.length + 1,
        });
      }
      // unwinding
      for (let k = 1; k <= n; k++) {
        const v = fact(k);
        const remain = chain.slice(0, n - k); // frames below factorial(k)
        const frames = [main(k === n ? `a = ${v}` : '等待…')].concat(
          remain.map((f, idx) => {
            const kk = n - idx;
            if (kk === k + 1) return Object.assign({}, f, { vars: [`n = ${kk}`, `${kk} * factorial(${k}) = ${kk} * ${v} = ${kk * v}`] });
            return f;
          })
        );
        const pre = [];
        for (let j = n; j > k; j--) pre.push(j);
        steps.push({
          frames,
          lines: k === n ? [mainLine] : [6],
          out: '',
          expr: pre.length ? `${pre.join(' × ')} × ${v}` : `${v}`,
          note: k === n ? `factorial(${n}) 回傳 ${v} 給 main，最後一個遞迴框也被彈出。` : `factorial(${k}) 回傳 ${v} 並被彈出；下一層把它乘上自己的 n：${k + 1} × ${v} = ${(k + 1) * v}。`,
          depth: frames.length,
        });
      }
      steps.push({ frames: [main(`a = ${fact(n)}`)], lines: [mainLine + 1], out: String(fact(n)), expr: `${n}! = ${fact(n)}`, note: `printf 印出 ${fact(n)}。總共呼叫了 ${n} 次 factorial，堆疊最高疊到 ${n + 1} 層（含 main）。`, depth: 1, done: true });
    }

    function render(i) {
      const s = steps[i];
      if (!s) return;
      C.setLines(code, s.lines);
      let frames = s.frames;
      const collapsed = frames.length > MAXSHOW + 1;
      if (collapsed) {
        const hidden = frames.length - MAXSHOW;
        frames = [{ key: 'more', name: `⋮ 下面還有 ${hidden} 層`, vars: [], dim: true }].concat(frames.slice(frames.length - MAXSHOW));
      }
      drawStack(stackEl, frames, { noAnim: collapsed });
      out.innerHTML = s.err ? `<span class="err">${esc(s.out)}</span>` : esc(s.out);
      expr.innerHTML = `<span class="muted">factorial(${nIn.value}) =</span> ${esc(s.expr)}`;
      note.textContent = s.note;
      note.className = 'feedback ' + (s.err ? 'is-err' : s.done ? 'is-ok' : 'is-info');
      kvEl.innerHTML = kv([
        ['堆疊深度（含 main）', String(s.depth), true],
        ['階段', i === 0 ? '呼叫' : s.done ? '完成' : s.err ? '崩潰' : s.frames.length > (steps[i - 1] ? steps[i - 1].frames.length : 0) ? '往下呼叫（push）' : '往回傳（pop）'],
      ]);
    }

    build();
    const stepper = C.stepper(C.$('#l6-fact-step', w), { count: () => steps.length, render, interval: 1000 });
    const rebuild = () => {
      stackEl._frames = [];
      build();
      stepper.reset();
    };
    nIn.addEventListener('input', rebuild);
    noBase.addEventListener('change', rebuild);
  }

  function buildFibTree(n) {
    let id = 0;
    const nodes = [];
    const events = [];
    function rec(k, depth, parent) {
      const node = { id: id++, k, depth, parent, children: [] };
      nodes.push(node);
      events.push({ t: 'in', id: node.id });
      if (k > 1) {
        node.children.push(rec(k - 1, depth + 1, node.id).id);
        node.children.push(rec(k - 2, depth + 1, node.id).id);
      }
      node.val = fibv(k);
      events.push({ t: 'out', id: node.id });
      return node;
    }
    rec(n, 0, -1);
    let leaf = 0;
    let maxDepth = 0;
    (function place(node) {
      maxDepth = Math.max(maxDepth, node.depth);
      if (!node.children.length) node.x = leaf++;
      else {
        node.children.forEach((c) => place(nodes[c]));
        node.x = (nodes[node.children[0]].x + nodes[node.children[1]].x) / 2;
      }
    })(nodes[0]);
    return { nodes, events, leaves: leaf, maxDepth };
  }

  function mountFibTree(root) {
    const w = C.$('#l6-fibtree', root);
    const host = C.$('#l6-fib-tree', w);
    const nIn = C.$('#l6-fib-n', w);
    const nOut = C.$('#l6-fib-nv', w);
    const kvEl = C.$('#l6-fib-kv', w);
    const pathEl = C.$('#l6-fib-path', w);
    const bars = C.$('#l6-fib-bars', w);
    let T = null;
    let gs = [];
    let sameK = null;
    const colorOf = (k) => `var(--c${(k % 6) + 1})`;

    function draw() {
      const n = +nIn.value;
      nOut.textContent = n;
      T = buildFibTree(n);
      const XS = 48;
      const YS = 66;
      const PAD = 28;
      const W = Math.max(120, T.leaves * XS + PAD * 2 - XS + 20);
      const H = T.maxDepth * YS + PAD * 2 + 26;
      const px = (node) => PAD + 10 + node.x * XS;
      const py = (node) => PAD + node.depth * YS;
      const svg = C.svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `fib(${n}) 的遞迴呼叫樹，共 ${T.nodes.length} 次呼叫` });
      const ge = C.svgEl('g');
      T.nodes.forEach((node) => {
        node.children.forEach((cid) => {
          const ch = T.nodes[cid];
          ge.appendChild(C.svgEl('line', { x1: px(node), y1: py(node), x2: px(ch), y2: py(ch), style: 'stroke:var(--line-strong);stroke-width:1.6' }));
        });
      });
      svg.appendChild(ge);
      gs = T.nodes.map((node) => {
        const g = C.svgEl('g', { class: 'fnode', 'data-id': node.id, 'data-k': node.k, style: `--k:${colorOf(node.k)}`, tabindex: '0', 'aria-label': `fib(${node.k})，按 Enter 標出所有重複的呼叫` });
        g.appendChild(C.svgEl('circle', { cx: px(node), cy: py(node), r: 18 }));
        g.appendChild(C.svgEl('text', { x: px(node), y: py(node) + 4, 'text-anchor': 'middle', class: 'fname' }, `f(${node.k})`));
        g.appendChild(C.svgEl('text', { x: px(node), y: py(node) + 33, 'text-anchor': 'middle', class: 'fval' }, ''));
        svg.appendChild(g);
        return g;
      });
      svg.style.width = `clamp(${Math.round(W * 0.6)}px, 100%, ${W}px)`;
      svg.style.display = 'block';
      host.innerHTML = '';
      host.appendChild(svg);
      const hint = C.$('#l6-fib-hint', w);
      if (hint) hint.hidden = !(host.scrollWidth > host.clientWidth + 4);
      // duplicate counts chart
      const counts = {};
      T.nodes.forEach((nd) => (counts[nd.k] = (counts[nd.k] || 0) + 1));
      const mx = Math.max(...Object.values(counts));
      let rows = '';
      for (let k = n; k >= 0; k--) {
        if (!counts[k]) continue;
        rows += `<div class="bar-row" data-k="${k}" style="--series:${colorOf(k)}"><span class="bar-label">fib(${k})</span><div class="bar-track"><div class="bar-fill" style="width:${(counts[k] / mx) * 100}%"></div></div><span class="bar-value">${counts[k]} 次</span></div>`;
      }
      bars.innerHTML = rows;
    }

    function markSame(k) {
      sameK = k;
      gs.forEach((g) => g.classList.toggle('is-same', k != null && g.dataset.k === String(k)));
      C.$$('.bar-row', bars).forEach((r) => r.classList.toggle('is-hi', k != null && r.dataset.k === String(k)));
    }

    function render(i) {
      if (!T) return;
      const entered = new Set();
      const exited = new Set();
      let cur = null;
      for (let e = 0; e < i; e++) {
        const ev = T.events[e];
        (ev.t === 'in' ? entered : exited).add(ev.id);
        cur = ev;
      }
      gs.forEach((g, idx) => {
        const node = T.nodes[idx];
        const isIn = entered.has(idx);
        const isOut = exited.has(idx);
        g.classList.toggle('is-todo', i > 0 && !isIn);
        g.classList.toggle('is-stack', isIn && !isOut);
        g.classList.toggle('is-done', isOut);
        g.classList.toggle('is-cur', !!cur && cur.id === idx);
        C.$('.fval', g).textContent = isOut ? `=${node.val}` : '';
      });
      const calls = entered.size;
      // path = nodes on stack
      let pathNodes = [];
      if (cur) {
        let id = cur.id;
        if (cur.t === 'out') id = T.nodes[cur.id].parent;
        while (id >= 0) {
          pathNodes.unshift(T.nodes[id]);
          id = T.nodes[id].parent;
        }
      }
      pathEl.innerHTML = pathNodes.length ? pathNodes.map((nd) => `<span class="chip">fib(${nd.k})</span>`).join(' → ') : i === 0 ? '（尚未開始）' : '（全部結束，回到 main）';
      const curNode = cur ? T.nodes[cur.id] : null;
      kvEl.innerHTML = kv([
        ['已呼叫次數', `${calls} / ${T.nodes.length}`, true],
        ['目前', curNode ? (cur.t === 'in' ? `呼叫 fib(${curNode.k})` : `fib(${curNode.k}) 回傳 ${curNode.val}`) : '—'],
        ['結果', exited.has(0) ? `fib(${T.nodes[0].k}) = ${T.nodes[0].val}` : '?'],
      ]);
      if (sameK != null) markSame(sameK);
    }

    host.addEventListener('mouseover', (e) => {
      const g = e.target.closest && e.target.closest('.fnode');
      if (g) markSame(+g.dataset.k);
    });
    host.addEventListener('mouseleave', () => markSame(null));
    host.addEventListener('click', (e) => {
      const g = e.target.closest && e.target.closest('.fnode');
      markSame(g ? +g.dataset.k : null);
    });
    host.addEventListener('keydown', (e) => {
      const g = e.target.closest && e.target.closest('.fnode');
      if (g && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        markSame(+g.dataset.k);
      }
    });

    draw();
    const stepper = C.stepper(C.$('#l6-fib-step', w), { count: () => (T ? T.events.length + 1 : 1), render, interval: 450 });
    nIn.addEventListener('input', () => {
      sameK = null;
      draw();
      stepper.reset();
    });
  }

  function mountGrowth(root) {
    const w = C.$('#l6-growth', root);
    const host = C.$('#l6-chart', w);
    const nIn = C.$('#l6-chart-n', w);
    const nOut = C.$('#l6-chart-nv', w);
    const kvEl = C.$('#l6-chart-kv', w);
    const N = 30;
    const calls = [];
    const loop = [];
    const pow2 = [];
    for (let n = 0; n <= N; n++) {
      calls.push(2 * fibv(n + 1) - 1);
      loop.push(n);
      pow2.push(Math.pow(2, n));
    }
    let VW = 640;
    const VH = 320;
    const M = { l: 70, r: 18, t: 16, b: 42 };
    let PW = VW - M.l - M.r;
    const fitWidth = () => {
      VW = Math.round(Math.min(640, Math.max(300, host.clientWidth || 640)));
      PW = VW - M.l - M.r;
    };
    const PH = VH - M.t - M.b;
    let mode = 'lin';
    let cur = +nIn.value;
    const X = (n) => M.l + (n / N) * PW;
    const LOGMAX = 10;
    const LIN_MAX = 3e6;
    const Y = (v) => (mode === 'lin' ? M.t + PH - (v / LIN_MAX) * PH : M.t + PH - (Math.log10(Math.max(1, v)) / LOGMAX) * PH);
    const wan = (v) => (v === 0 ? '0' : v >= 1e8 ? v / 1e8 + '億' : v >= 1e4 ? v / 1e4 + '萬' : String(v));
    const LOGLBL = ['1', '10', '100', '1千', '1萬', '10萬', '100萬', '1千萬', '1億', '10億', '100億'];

    function draw() {
      fitWidth();
      const svg = C.svgEl('svg', { viewBox: `0 0 ${VW} ${VH}`, class: 'l6-chart-svg', role: 'img', 'aria-label': 'fib(n) 呼叫次數成長圖' });
      const defs = C.svgEl('defs');
      const cp = C.svgEl('clipPath', { id: 'l6-clip' });
      cp.appendChild(C.svgEl('rect', { x: M.l, y: M.t, width: PW, height: PH }));
      defs.appendChild(cp);
      svg.appendChild(defs);
      // grid + y ticks
      const ticks = mode === 'lin' ? [0, 5e5, 1e6, 1.5e6, 2e6, 2.5e6, 3e6] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => Math.pow(10, e));
      ticks.forEach((t, idx) => {
        const y = Y(t);
        svg.appendChild(C.svgEl('line', { x1: M.l, x2: M.l + PW, y1: y, y2: y, style: 'stroke:var(--line);stroke-width:1' }));
        svg.appendChild(C.svgEl('text', { x: M.l - 8, y: y + 4, 'text-anchor': 'end', class: 'tick' }, mode === 'lin' ? wan(t) : LOGLBL[idx]));
      });
      for (let n = 0; n <= N; n += 5) {
        const x = X(n);
        svg.appendChild(C.svgEl('line', { x1: x, x2: x, y1: M.t + PH, y2: M.t + PH + 5, style: 'stroke:var(--line-strong)' }));
        svg.appendChild(C.svgEl('text', { x, y: M.t + PH + 20, 'text-anchor': 'middle', class: 'tick' }, String(n)));
      }
      svg.appendChild(C.svgEl('line', { x1: M.l, x2: M.l + PW, y1: M.t + PH, y2: M.t + PH, style: 'stroke:var(--ink-2);stroke-width:1.4' }));
      svg.appendChild(C.svgEl('line', { x1: M.l, x2: M.l, y1: M.t, y2: M.t + PH, style: 'stroke:var(--ink-2);stroke-width:1.4' }));
      svg.appendChild(C.svgEl('text', { x: M.l + PW / 2, y: VH - 4, 'text-anchor': 'middle', class: 'axis' }, '要計算的項數 n'));
      svg.appendChild(C.svgEl('text', { x: 14, y: M.t + PH / 2, 'text-anchor': 'middle', class: 'axis', transform: `rotate(-90 14 ${M.t + PH / 2})` }, mode === 'lin' ? '次數' : '次數（對數）'));
      const series = [
        [pow2, 'var(--c4)', '6 5'],
        [calls, 'var(--c2)', ''],
        [loop, 'var(--c3)', ''],
      ];
      const g = C.svgEl('g', { 'clip-path': 'url(#l6-clip)' });
      series.forEach(([arr, col, dash]) => {
        const pts = arr.map((v, n) => `${X(n).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
        g.appendChild(C.svgEl('polyline', { points: pts, style: `fill:none;stroke:${col};stroke-width:2.6;stroke-linejoin:round;${dash ? `stroke-dasharray:${dash};` : ''}` }));
      });
      svg.appendChild(g);
      // marker
      const mk = C.svgEl('g', { class: 'marker' });
      mk.appendChild(C.svgEl('line', { x1: X(cur), x2: X(cur), y1: M.t, y2: M.t + PH, style: 'stroke:var(--accent-2);stroke-width:1.5;stroke-dasharray:3 3' }));
      series.forEach(([arr, col]) => {
        const y = Y(arr[cur]);
        if (y >= M.t - 1) mk.appendChild(C.svgEl('circle', { cx: X(cur), cy: y, r: 5, style: `fill:var(--surface);stroke:${col};stroke-width:2.5` }));
      });
      svg.appendChild(mk);
      // capture layer
      const cap = C.svgEl('rect', { x: M.l, y: M.t, width: PW, height: PH, style: 'fill:transparent;cursor:crosshair' });
      svg.appendChild(cap);
      const pick = (e) => {
        const r = svg.getBoundingClientRect();
        if (!r.width) return;
        const vx = ((e.clientX - r.left) / r.width) * VW;
        const n = Math.round(((vx - M.l) / PW) * N);
        setN(C.clamp(n, 0, N));
      };
      cap.addEventListener('pointermove', pick);
      cap.addEventListener('click', pick);
      host.innerHTML = '';
      host.appendChild(svg);
      readout();
    }
    function readout() {
      nOut.textContent = cur;
      kvEl.innerHTML = kv([
        ['n', String(cur)],
        ['遞迴版呼叫次數', fmt(calls[cur]), true],
        ['迴圈版迴圈次數', fmt(loop[cur])],
        ['2ⁿ（投影片的估計）', fmt(pow2[cur])],
      ]);
    }
    function setN(n) {
      if (n === cur) return;
      cur = n;
      nIn.value = n;
      draw();
    }
    C.onSeg(w, 'l6-axis', (v) => {
      mode = v;
      draw();
    });
    nIn.addEventListener('input', () => {
      cur = +nIn.value;
      draw();
    });
    draw();
    let lastW = host.clientWidth;
    const onResize = () => {
      if (!document.body.contains(host)) return window.removeEventListener('resize', onResize);
      if (Math.abs(host.clientWidth - lastW) < 8) return;
      lastW = host.clientWidth;
      draw();
    };
    window.addEventListener('resize', onResize);
  }

  function mountGcd(root) {
    const w = C.$('#l6-gcd-w', root);
    const aIn = C.$('#l6-gcd-a', w);
    const bIn = C.$('#l6-gcd-b', w);
    const stackEl = C.$('#l6-gcd-stack', w);
    const kvEl = C.$('#l6-gcd-kv', w);
    const rectHost = C.$('#l6-gcd-rect', w);
    const note = C.$('#l6-gcd-note', w);
    let seq = [];
    let squares = [];
    let g = 1;

    function build() {
      let a = Math.max(1, Math.min(999, Math.floor(+aIn.value) || 1));
      let b = Math.max(1, Math.min(999, Math.floor(+bIn.value) || 1));
      aIn.value = a;
      bIn.value = b;
      seq = [[a, b]];
      while (b !== 0) {
        [a, b] = [b, a % b];
        seq.push([a, b]);
      }
      g = a;
      // geometric tiling of the a0 x b0 rectangle
      const A = seq[0][0];
      const B = seq[0][1];
      squares = [];
      let x = 0;
      let y = 0;
      let wd = A;
      let ht = B;
      while (wd > 0 && ht > 0 && squares.length < 400) {
        if (wd >= ht) {
          squares.push({ x, y, s: ht });
          x += ht;
          wd -= ht;
        } else {
          squares.push({ x, y, s: wd });
          y += wd;
          ht -= wd;
        }
      }
      const svgW = 300;
      const svgH = 240;
      const sc = Math.min(svgW / A, svgH / B);
      const svg = C.svgEl('svg', { viewBox: `-2 -2 ${A * sc + 4} ${B * sc + 4}`, width: Math.round(A * sc + 4), height: Math.round(B * sc + 4), role: 'img', 'aria-label': `${A} × ${B} 長方形切正方形` });
      squares.forEach((q) => {
        const si = seq.findIndex(([, bb]) => bb === q.s);
        const r = C.svgEl('rect', { x: q.x * sc, y: q.y * sc, width: q.s * sc, height: q.s * sc, class: 'sq', 'data-step': si, style: `--k:var(--c${(si % 6) + 1})` });
        svg.appendChild(r);
        if (q.s * sc >= 26) svg.appendChild(C.svgEl('text', { x: (q.x + q.s / 2) * sc, y: (q.y + q.s / 2) * sc + 4, 'text-anchor': 'middle', class: 'sqt' }, String(q.s)));
      });
      svg.appendChild(C.svgEl('rect', { x: 0, y: 0, width: A * sc, height: B * sc, style: 'fill:none;stroke:var(--ink-2);stroke-width:2' }));
      rectHost.innerHTML = `<p class="caption">${A} × ${B} 的長方形</p>`;
      rectHost.appendChild(svg);
    }

    function render(i) {
      const last = seq.length - 1;
      const k = Math.min(i, last);
      const frames = seq.slice(0, k + 1).map(([a, b], idx) => {
        let v;
        if (i > last) v = `return ${g}`;
        else if (b === 0) v = 'b == 0 → return a';
        else v = `${a} % ${b} = ${a % b} → GCD(${b}, ${a % b})`;
        if (idx < k && i <= last) v = `等待 GCD(${seq[idx + 1][0]}, ${seq[idx + 1][1]})…`;
        return { key: 'g' + idx, name: `GCD(${a}, ${b})`, vars: [v] };
      });
      drawStack(stackEl, frames);
      const [a, b] = seq[k];
      C.$$('.sq', rectHost).forEach((r) => {
        const st = +r.dataset.step;
        r.classList.toggle('is-cur', i <= last && st === k && b !== 0);
        r.classList.toggle('is-past', st < k || i > last);
        r.classList.toggle('is-gcd', (i > last || b === 0) && st === last - 1);
      });
      if (i > last) {
        note.className = 'feedback is-ok';
        note.textContent = `最後一層回傳 ${g}，這個值原封不動地一層層傳回 main。GCD(${seq[0][0]}, ${seq[0][1]}) = ${g}：邊長 ${g} 的正方形可以剛好鋪滿整個長方形。`;
      } else if (b === 0) {
        note.className = 'feedback is-ok';
        note.textContent = `b == 0，碰到 base case，直接回傳 a = ${a}。`;
      } else if (a < b) {
        note.className = 'feedback is-info';
        note.textContent = `${a} % ${b} = ${a}（a 比 b 小，餘數就是 a 自己），所以下一層 GCD(${b}, ${a}) 等於把兩數對調。`;
      } else {
        note.className = 'feedback is-info';
        note.textContent = `${a} ÷ ${b} 可以切出 ${Math.floor(a / b)} 個邊長 ${b} 的正方形（亮起來的），剩下 ${a % b}。問題縮小成 GCD(${b}, ${a % b})。`;
      }
      kvEl.innerHTML = kv([
        ['遞迴深度', String(k + 1)],
        ['目前', `GCD(${a}, ${b})`, true],
        ['最大公因數', i > last || b === 0 ? String(g) : '?'],
      ]);
    }

    build();
    const stepper = C.stepper(C.$('#l6-gcd-step', w), { count: () => seq.length + 1, render, interval: 1300 });
    const rebuild = () => {
      stackEl._frames = [];
      build();
      stepper.reset();
    };
    aIn.addEventListener('change', rebuild);
    bIn.addEventListener('change', rebuild);
    aIn.addEventListener('input', () => {
      if (aIn.value !== '') rebuild();
    });
    bIn.addEventListener('input', () => {
      if (bIn.value !== '') rebuild();
    });
    w.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-preset]');
      if (!b) return;
      const [x, y] = b.dataset.preset.split(',');
      aIn.value = x;
      bIn.value = y;
      rebuild();
    });
  }

  function mountReverse(root) {
    const w = C.$('#l6-rev-w', root);
    const input = C.$('#l6-rev-in', w);
    const buf = C.$('#l6-rev-buf', w);
    const code = C.$('#l6-rev-code', w);
    const stackEl = C.$('#l6-rev-stack', w);
    const out = C.$('#l6-rev-out', w);
    const note = C.$('#l6-rev-note', w);
    let s = 'CCU';
    let steps = [];
    const show = (ch) => (ch === '\n' ? '\\n' : ch === ' ' ? '␠' : ch);

    function build() {
      s = (input.value || '').replace(/[\r\n]/g, '').slice(0, 10);
      const L = s.length;
      const main = { key: 'main', name: 'main()', vars: [] };
      const frames = (d) => [main].concat(Array.from({ length: d }, (_, j) => ({ key: 'p' + j, name: `printReversely() 第 ${j + 1} 層`, vars: [`word = '${show(j < L ? s[j] : '\n')}'`] })));
      steps = [];
      steps.push({ fr: frames(0), read: -1, out: '', lines: [11], note: 'main 呼叫 printReversely()。' });
      for (let i = 0; i < L; i++) {
        steps.push({ fr: frames(i + 1), read: i, out: '', lines: [4, 5], note: `第 ${i + 1} 層讀到 '${show(s[i])}'，不是換行，所以「先」遞迴呼叫下一層——這一層的 printf 還沒輪到。` });
      }
      steps.push({ fr: frames(L + 1), read: L, out: '', lines: [4], note: `第 ${L + 1} 層讀到 '\\n'，if 條件不成立 → 這就是 base case，什麼都不印。` });
      steps.push({ fr: frames(L), read: L, out: '', lines: [8], note: `第 ${L + 1} 層直接 return、被彈出。現在開始「拆堆疊」。` });
      for (let i = L - 1; i >= 0; i--) {
        const printed = s.slice(i).split('').reverse().join('');
        steps.push({ fr: frames(i), read: L, out: printed, lines: [6, 7], note: `回到第 ${i + 1} 層：它的 word 是 '${show(s[i])}'，執行 printf 印出後 return、被彈出。` });
      }
      const rev = s.split('').reverse().join('');
      steps.push({ fr: [], read: L, out: rev + '\n', lines: [12, 13], note: `main 印出換行並結束。輸入 "${s}" → 輸出 "${rev}"：最後讀進來的字元最先被印出。`, done: true });
    }

    function render(i) {
      const st = steps[i];
      if (!st) return;
      const chars = s.split('').concat(['\n']);
      buf.innerHTML = chars
        .map((ch, k) => {
          const cls = k === st.read ? ' is-hi' : k < st.read ? ' is-alloc' : '';
          return `<div class="cell${cls}${ch === '\n' ? ' is-null' : ''}"><span class="cell-idx">${k + 1}</span><span class="cell-val">${ch === '\n' ? '⏎' : esc(show(ch))}</span><span class="cell-sub">${k === st.read ? '讀取' : k < st.read ? '已讀' : ''}</span></div>`;
        })
        .join('');
      C.setLines(code, st.lines);
      drawStack(stackEl, st.fr);
      out.textContent = st.out;
      note.textContent = st.note;
      note.className = 'feedback ' + (st.done ? 'is-ok' : 'is-info');
    }

    build();
    const stepper = C.stepper(C.$('#l6-rev-step', w), { count: () => steps.length, render, interval: 900 });
    input.addEventListener('input', () => {
      stackEl._frames = [];
      build();
      stepper.reset();
    });
  }

  function mountMainRec(root) {
    const w = C.$('#l6-mainrec', root);
    const input = C.$('#l6-mr-in', w);
    const code = C.$('#l6-mr-code', w);
    const stackEl = C.$('#l6-mr-stack', w);
    const out = C.$('#l6-mr-out', w);
    const kvEl = C.$('#l6-mr-kv', w);
    const fb = C.$('#l6-mr-fb', w);
    const MAXD = 10;
    let sum = 0;
    let inputs = [];
    let ended = false;
    let log = [];
    let popTimers = [];
    const PROMPT = 'Input an integer (0 for ending): ';

    const frames = () => inputs.map((v, i) => ({ key: 'm' + i, name: `main() 第 ${i + 1} 層`, vars: [`input = ${v}`] }));
    function paint(extra) {
      kvEl.innerHTML = kv([
        ['static sum（靜態區，只有一份）', String(sum), true],
        ['main() 層數', String(stackEl._frames ? stackEl._frames.length : 0)],
      ]);
      const lines = log.map((l) => (l.in != null ? `${esc(PROMPT)}<span class="in">${esc(l.in)}</span>` : esc(l.text)));
      if (!ended) lines.push(`${esc(PROMPT)}<span class="cursor"></span>`);
      out.innerHTML = lines.join('\n');
      if (extra) {
        fb.className = 'feedback ' + extra[0];
        fb.textContent = extra[1];
      }
    }
    function start() {
      popTimers.forEach(C.stop);
      popTimers = [];
      sum = 0;
      inputs = [];
      ended = false;
      log = [];
      stackEl._frames = [];
      inputs.push('?');
      drawStack(stackEl, [{ key: 'm0', name: 'main() 第 1 層', vars: ['input = ?'] }]);
      C.setLines(code, [6, 7]);
      input.disabled = false;
      paint(['is-info', '程式開始：第一層 main() 等待你輸入整數。']);
    }
    function send(v) {
      if (ended) {
        paint(['is-err', '程式已經結束了，按「重新執行程式」再玩一次。']);
        return;
      }
      if (!Number.isInteger(v)) {
        paint(['is-err', '請輸入整數（scanf 使用 %d）。']);
        return;
      }
      if (v !== 0 && inputs.length >= MAXD) {
        paint(['is-err', `這個示範最多疊 ${MAXD} 層，請輸入 0 結束。（真實程式可以疊更多，但堆疊空間終究有限。）`]);
        return;
      }
      inputs[inputs.length - 1] = v;
      log.push({ in: String(v) });
      if (v !== 0) {
        sum += v;
        inputs.push('?');
        drawStack(stackEl, frames());
        C.setLines(code, [9, 10]);
        paint(['is-info', `input = ${v} 不是 0：sum += ${v}（sum = ${sum}），然後 main() 呼叫自己，推入第 ${inputs.length} 層。新的一層有自己的 input，但 sum 沿用同一份。`]);
      } else {
        ended = true;
        input.disabled = true;
        log.push({ text: `The total number is ${sum}` });
        drawStack(stackEl, frames());
        C.setLines(code, [12, 13]);
        paint(['is-ok', `輸入 0：條件不成立，印出總和 ${sum}。接著每一層 main() 依序 return，從最深的一層開始彈出。`]);
        const depth = inputs.length;
        for (let d = depth - 1; d >= 0; d--) {
          popTimers.push(
            C.after(() => {
              drawStack(stackEl, frames().slice(0, d));
              C.setLines(code, [14]);
              paint();
              if (d === 0) {
                fb.className = 'feedback is-ok';
                fb.textContent = `全部 ${depth} 層 main() 都結束了，程式終止。若 sum 不是 static，每層都會被重設成 0，最後只會印出 0。`;
              }
            }, 500 + (depth - 1 - d) * 450)
          );
        }
      }
    }
    w.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      if (b.dataset.act === 'send') send(input.value === '' ? NaN : Number(input.value));
      else if (b.dataset.act === 'zero') send(0);
      else if (b.dataset.act === 'restart') start();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        send(input.value === '' ? NaN : Number(input.value));
      }
    });
    start();
  }

  function mountHanoi(root) {
    const w = C.$('#l6-hanoi-w', root);
    const host = C.$('#l6-hanoi', w);
    const nIn = C.$('#l6-hanoi-n', w);
    const nOut = C.$('#l6-hanoi-nv', w);
    const spIn = C.$('#l6-hanoi-speed', w);
    const spOut = C.$('#l6-hanoi-sv', w);
    const kvEl = C.$('#l6-hanoi-kv', w);
    const fb = C.$('#l6-hanoi-fb', w);
    const callEl = C.$('#l6-hanoi-call', w);
    const out = C.$('#l6-hanoi-out', w);
    const code = C.$('#l6-hanoi-code', root);
    const btnPause = C.$('[data-act="pause"]', w);
    const btnAuto = C.$('[data-act="auto"]', w);
    const NAMES = ['A', 'B', 'C'];
    const SPEED = [1300, 850, 500, 280, 120];
    let n = 3;
    let pegs = [];
    let sel = -1;
    let moves = 0;
    let log = [];
    let auto = null; // {list, i}
    let timer = null;
    let lastDrop = -1;
    let won = false;

    function gen(k, s, b, t, path, list) {
      const call = `hanoi(${k}, '${s}', '${b}', '${t}')`;
      const p = path.concat([call]);
      if (k === 1) {
        list.push({ disk: 1, from: s, to: t, path: p, line: 8 });
        return;
      }
      gen(k - 1, s, t, b, p, list);
      list.push({ disk: k, from: s, to: t, path: p, line: 16 });
      gen(k - 1, b, s, t, p, list);
    }

    function draw() {
      host.innerHTML = pegs
        .map(
          (pg, i) =>
            `<button type="button" class="peg${sel === i ? ' is-selected' : ''}" data-peg="${i}" aria-label="柱子 ${NAMES[i]}，${pg.length} 個盤子"><span class="peg-label">${NAMES[i]}</span>${pg
              .map((d, j) => `<span class="disk${i === lastDrop && j === pg.length - 1 ? ' is-new' : ''}" data-size="${d}">${d}</span>`)
              .join('')}</button>`
        )
        .join('');
      lastDrop = -1;
      const min = Math.pow(2, n) - 1;
      kvEl.innerHTML = kv([
        ['已移動', String(moves), true],
        ['最少步數 2ⁿ − 1', fmt(min)],
        ['狀態', won ? '完成！' : auto ? (timer ? '自動解中' : '已暫停') : '自己玩'],
      ]);
      out.textContent = log.length ? log.slice(-60).join('\n') : '（還沒有移動）';
      out.scrollTop = out.scrollHeight;
      btnPause.disabled = !auto || won;
      btnPause.textContent = timer ? '⏸ 暫停' : '▶ 繼續';
      btnAuto.textContent = auto && !won ? '⟲ 從頭自動解' : '▶ 自動解';
    }
    function reset(msg) {
      stopTimer();
      auto = null;
      n = +nIn.value;
      nOut.textContent = n;
      pegs = [Array.from({ length: n }, (_, i) => n - i), [], []];
      sel = -1;
      moves = 0;
      log = [];
      won = false;
      callEl.textContent = '—';
      C.setLines(code, []);
      fb.className = 'feedback' + (msg ? ' is-info' : '');
      fb.textContent = msg || '';
      draw();
    }
    function doMove(from, to) {
      const d = pegs[from].pop();
      pegs[to].push(d);
      moves++;
      lastDrop = to;
      log.push(`Move the plate ${d} from ${NAMES[from]} to ${NAMES[to]}`);
      if (pegs[2].length === n) {
        won = true;
        stopTimer();
        const min = Math.pow(2, n) - 1;
        fb.className = 'feedback is-ok';
        fb.textContent = moves === min ? `完成！用了 ${moves} 步，剛好是最少步數 2^${n} − 1 = ${min}。` : `完成！用了 ${moves} 步（最少是 ${min} 步），再挑戰看看能不能更少。`;
      }
    }
    function stopTimer() {
      if (timer) C.stop(timer);
      timer = null;
    }
    function tick() {
      if (!auto || won) return stopTimer(), draw();
      const m = auto.list[auto.i++];
      if (!m) {
        stopTimer();
        draw();
        return;
      }
      doMove(NAMES.indexOf(m.from), NAMES.indexOf(m.to));
      callEl.innerHTML = m.path.map((c, i) => `<span class="chip${i === m.path.length - 1 ? ' is-on' : ''}">${esc(c)}</span>`).join(' › ');
      C.setLines(code, [m.line]);
      if (!won) {
        fb.className = 'feedback is-info';
        fb.textContent = m.disk === 1 && m.line === 8 ? `base case：hanoi(1, …) 只剩一個盤子，直接把 1 號從 ${m.from} 搬到 ${m.to}。` : `Step 2：上面 ${m.disk - 1} 個已經移開，把最大的 ${m.disk} 號從 ${m.from} 搬到 ${m.to}。`;
      }
      draw();
    }
    function play() {
      stopTimer();
      timer = C.every(tick, SPEED[+spIn.value - 1]);
      draw();
    }
    w.addEventListener('click', (e) => {
      const peg = e.target.closest('.peg');
      if (peg) {
        const i = +peg.dataset.peg;
        if (won) {
          fb.className = 'feedback is-info';
          fb.textContent = '已經完成了！按「重設」或調整盤子數再玩一次。';
          return;
        }
        if (auto) {
          stopTimer();
          auto = null;
          callEl.textContent = '—（你接手了，改成手動模式）';
          C.setLines(code, []);
        }
        if (sel < 0) {
          if (!pegs[i].length) {
            fb.className = 'feedback is-err';
            fb.textContent = `柱子 ${NAMES[i]} 上沒有盤子可以拿。`;
          } else {
            sel = i;
            fb.className = 'feedback is-info';
            fb.textContent = `拿起 ${NAMES[i]} 最上面的 ${pegs[i][pegs[i].length - 1]} 號盤子，再點要放的柱子。`;
          }
        } else if (sel === i) {
          sel = -1;
          fb.className = 'feedback';
          fb.textContent = '放回原處。';
        } else {
          const d = pegs[sel][pegs[sel].length - 1];
          const top = pegs[i][pegs[i].length - 1];
          if (top !== undefined && top < d) {
            fb.className = 'feedback is-err';
            fb.textContent = `不行！${d} 號比 ${top} 號大，大盤子不能疊在小盤子上面。`;
            sel = -1;
          } else {
            const from = sel;
            sel = -1;
            doMove(from, i);
            if (!won) {
              fb.className = 'feedback';
              fb.textContent = `把 ${d} 號從 ${NAMES[from]} 搬到 ${NAMES[i]}。`;
            }
          }
        }
        draw();
        return;
      }
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'auto') {
        reset();
        auto = { list: [], i: 0 };
        gen(n, 'A', 'B', 'C', [], auto.list);
        log.push(`Please enter the number of plates: ${n}`, 'The moving process:');
        fb.className = 'feedback is-info';
        fb.textContent = `main 呼叫 hanoi(${n}, 'A', 'B', 'C')，共需 ${auto.list.length} 步。`;
        play();
      } else if (a === 'pause') {
        if (!auto) return;
        if (timer) {
          stopTimer();
          fb.className = 'feedback is-info';
          fb.textContent = '已暫停。按「繼續」接著播放，或直接點柱子自己接手。';
          draw();
        } else play();
      } else if (a === 'reset') reset('已重設。');
    });
    nIn.addEventListener('input', () => reset(`改成 ${nIn.value} 個盤子，最少需要 ${Math.pow(2, +nIn.value) - 1} 步。`));
    spIn.addEventListener('input', () => {
      spOut.textContent = spIn.value;
      if (timer) play();
    });
    reset();
  }

  function mountCounter(root) {
    const w = C.$('#l6-counter', root);
    const aStack = C.$('#l6-ct-astack', w);
    const sStack = C.$('#l6-ct-sstack', w);
    const aOut = C.$('#l6-ct-aout', w);
    const sOut = C.$('#l6-ct-sout', w);
    const sKv = C.$('#l6-ct-skv', w);
    let aText = '';
    let sText = '';
    let sCount = 0;
    let calls = 0;
    let timers = [];
    const paintStatic = (hi) => {
      sKv.innerHTML = kv([['static int count', String(sCount), hi]]);
    };
    function callAuto() {
      calls++;
      const key = 'a' + calls;
      drawStack(aStack, [{ key: 'main', name: 'main()', vars: [] }, { key, name: 'counting()', vars: ['count = 0（新建立）'] }]);
      aText += '0 ';
      aOut.textContent = aText;
      timers.push(
        C.after(() => {
          if (!aStack.isConnected) return;
          drawStack(aStack, [{ key: 'main', name: 'main()', vars: [] }, { key, name: 'counting()', vars: ['count++ → 1，但馬上要被釋放'] }]);
        }, 350)
      );
      timers.push(C.after(() => aStack.isConnected && drawStack(aStack, [{ key: 'main', name: 'main()', vars: ['counting() 結束，count 跟著消失'] }]), 800));
    }
    function callStatic() {
      calls++;
      const key = 's' + calls;
      const v = sCount;
      drawStack(sStack, [{ key: 'main', name: 'main()', vars: [] }, { key, name: 'counting()', vars: ['（沒有自己的 count）', `印出靜態區的 ${v}`] }]);
      sText += v + ' ';
      sOut.textContent = sText;
      sCount++;
      paintStatic(true);
      timers.push(C.after(() => sStack.isConnected && drawStack(sStack, [{ key: 'main', name: 'main()', vars: [`counting() 結束，但 count = ${sCount} 留在靜態區`] }]), 800));
    }
    function reset() {
      timers.forEach(C.stop);
      timers = [];
      aText = '';
      sText = '';
      sCount = 0;
      aStack._frames = [];
      sStack._frames = [];
      drawStack(aStack, [{ key: 'main', name: 'main()', vars: [] }], { noAnim: true });
      drawStack(sStack, [{ key: 'main', name: 'main()', vars: [] }], { noAnim: true });
      aOut.textContent = '';
      sOut.textContent = '';
      paintStatic(false);
    }
    w.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'call-auto') callAuto();
      else if (a === 'call-static') callStatic();
      else if (a === 'reset') reset();
      else if (a === 'loop5') {
        reset();
        for (let i = 0; i < 5; i++) {
          timers.push(
            C.after(() => {
              callAuto();
              callStatic();
            }, i * 950)
          );
        }
      }
    });
    reset();
  }

  function mountExtern(root) {
    const w = C.$('#l6-extern', root);
    const codeHost = C.$('#l6-ext-code', w);
    const cb = C.$('#l6-ext-on', w);
    const out = C.$('#l6-ext-out', w);
    const fb = C.$('#l6-ext-fb', w);
    let runs = 0;
    function showCode() {
      codeHost.innerHTML = C.code(cb.checked ? SRC.externWith : SRC.externWithout, { id: 'l6-ext-pre' });
      if (cb.checked) C.setLines(C.$('#l6-ext-pre', codeHost), [4]);
      out.innerHTML = '<span class="dim">程式碼改了，按「編譯並執行」看看結果。</span>';
      fb.className = 'feedback';
      fb.textContent = '';
    }
    function compile() {
      runs++;
      const pre = C.$('#l6-ext-pre', codeHost);
      if (cb.checked) {
        C.setLines(pre, [4]);
        out.innerHTML = `<span class="dim">$ gcc main.c -o main   # 第 ${runs} 次編譯</span>\n<span class="dim">編譯成功 ✓</span>\n$ ./main\n10`;
        fb.className = 'feedback is-ok';
        fb.innerHTML = '<code>extern int global;</code> 告訴編譯器：「有一個叫 global 的 int，定義在別處，稍後會找到」。連結時找到第 8 行的定義，印出 10。';
      } else {
        C.setLines(pre, [4]);
        out.innerHTML = `<span class="dim">$ gcc main.c -o main   # 第 ${runs} 次編譯</span>\n<span class="err">main.c: In function 'printGlobal':\nmain.c:4:18: error: 'global' undeclared (first use in this function)\n    4 |     printf("%d", global);\n      |                  ^~~~~~</span>`;
        fb.className = 'feedback is-err';
        fb.innerHTML = '✗ 編譯器由上往下讀，讀到第 4 行時還沒看到 global 的定義（在第 7 行），所以報錯。勾回 <code>extern</code> 宣告就能修好。';
      }
    }
    cb.addEventListener('change', showCode);
    C.$('[data-act="compile"]', w).addEventListener('click', compile);
    showCode();
  }

  function mountConst(root) {
    const w = C.$('#l6-constw', root);
    const codeEl = C.$('#l6-const-code', w);
    const diag = C.$('#l6-const-diagram', w);
    const pill = C.$('#l6-const-pill', w);
    const fb = C.$('#l6-const-fb', w);
    const DECL = {
      a: { text: 'const int *p = &x;', lockVal: true, lockPtr: false },
      b: { text: 'int * const p = &x;', lockVal: false, lockPtr: true },
      c: { text: 'const int * const p = &x;', lockVal: true, lockPtr: true },
    };
    let decl = 'a';
    let state;
    let history = [];
    const fresh = () => ({ x: 5, other: 20, target: 'x' });
    function paint() {
      const d = DECL[decl];
      const src = ['int x = 5, other = 20;', d.text].concat(history.map((h) => h.code + (h.ok ? '' : '   // ✗ 編譯錯誤'))).join('\n');
      codeEl.innerHTML = C.hl(src)
        .map((l, k) => `<span class="line${k >= 2 && !history[k - 2].ok ? ' is-active' : ''}">${l || ' '}</span>`)
        .join('');
      const cell = (name, val, sub, hi, lock) =>
        `<div class="cell${hi ? ' is-hi' : ''}"><span class="cell-idx">${name}</span><span class="cell-val">${val}</span><span class="cell-sub">${lock ? '🔒 唯讀' : sub}</span></div>`;
      diag.innerHTML = `<div class="l6-ptr-row">
  <div class="cells">${cell('p', state.target === 'x' ? '&amp;x' : '&amp;other', '指標', false, d.lockPtr)}</div>
  <span class="l6-arrow" aria-hidden="true">→</span>
  <div class="cells">${cell('x', state.x, state.target === 'x' ? '← p 指向這裡' : '', state.target === 'x', d.lockVal && state.target === 'x')}${cell('other', state.other, state.target === 'other' ? '← p 指向這裡' : '', state.target === 'other', d.lockVal && state.target === 'other')}</div>
</div>
<p class="caption">${d.lockVal ? '🔒 *p 是唯讀的：不能透過 p 改內容。' : '✎ *p 可以修改。'}　${d.lockPtr ? '🔒 p 本身是唯讀的：不能換指向。' : '✎ p 可以改成指向別的變數。'}</p>`;
    }
    function op(kind) {
      const d = DECL[decl];
      if (kind === 'reset') {
        state = fresh();
        history = [];
        pill.innerHTML = '';
        fb.className = 'feedback';
        fb.textContent = '';
        paint();
        return;
      }
      let ok = true;
      let codeLine = '';
      let msg = '';
      let err = '';
      if (kind === 'write') {
        codeLine = '*p = 10;';
        if (d.lockVal) {
          ok = false;
          err = "error: assignment of read-only location '*p'";
          msg = '「*p 是 const」：不能透過 p 修改它指向的內容。';
        } else {
          state[state.target] = 10;
          msg = `可以！p 本身鎖住了，但它指向的 ${state.target} 可以改，${state.target} 變成 10。`;
        }
      } else if (kind === 'move') {
        codeLine = 'p = &other;';
        if (d.lockPtr) {
          ok = false;
          err = "error: assignment of read-only variable 'p'";
          msg = '「p 是 const」：指標本身不能換指向。';
        } else {
          state.target = 'other';
          msg = '可以！p 改成指向 other。（就算 *p 是唯讀，p 本身可以移動。）';
        }
      } else if (kind === 'read') {
        codeLine = 'printf("%d", *p);';
        msg = `讀取永遠沒問題：const 只禁止「寫入」。印出 ${state[state.target]}。`;
      }
      history.push({ code: codeLine, ok });
      if (history.length > 4) history.shift();
      pill.innerHTML = ok ? `<span class="pill-ok">編譯成功</span>` : `<span class="pill-err">${esc(err)}</span>`;
      fb.className = 'feedback ' + (ok ? 'is-ok' : 'is-err');
      fb.textContent = msg;
      paint();
    }
    C.onSeg(w, 'l6-cdecl', (v) => {
      decl = v;
      op('reset');
      fb.className = 'feedback is-info';
      fb.textContent = `改用 ${DECL[v].text}。試試三種操作。`;
    });
    w.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-op]');
      if (b) op(b.dataset.op);
    });
    state = fresh();
    paint();
  }

  /* =========================================================
     Register
     ========================================================= */
  C.register({
    id: 'l6',
    order: 6,
    num: '06',
    title: '呼叫堆疊、遞迴與儲存類別',
    en: 'Function Call Stack, Recursion, and Storage Classes',
    lede: '函式呼叫其實是一疊「後進先出」的堆疊框。看懂堆疊，就看懂了遞迴：先一路往下呼叫，碰到 base case 再一路拆回來。最後認識 auto、static、extern、register 四種儲存類別與 const。',
    desc: '用動畫看呼叫堆疊的 push / pop，玩河內塔、看費氏數列呼叫樹如何指數爆炸。',
    tags: ['呼叫堆疊', '遞迴', '河內塔', 'static'],
    objectives: [
      '函式呼叫堆疊（call stack）如何運作，以及「後進先出」的概念',
      '遞迴函式的兩大設計核心：base case 與 recursive step',
      '經典遞迴範例：階乘、費波南希數列、輾轉相除法、河內塔',
      '遞迴可能帶來的指數複雜度問題',
      '四種變數儲存類別：auto、static、extern、register',
      '型別限定詞 const 的用法',
    ],
    sections() {
      return secStack() + secConcept() + secFact() + secFib() + secGcd() + secReverse() + secHanoi() + secStorage() + secConst();
    },
    recap: [
      '函式呼叫堆疊是後進先出（LIFO）的結構，遞迴正是善用了這個機制',
      '寫遞迴函式時，永遠先想清楚 base case，再想 recursive step 如何收斂向它',
      '階乘、費氏數列、輾轉相除法、河內塔都是練習遞迴思維的經典題目',
      '費氏數列的樸素遞迴會有指數複雜度，提醒我們注意演算法效率',
      'auto／static／extern／register 四種儲存類別，影響變數的存續期間與可見範圍',
    ],
    practice: '試著不用遞迴，改用迴圈重寫費波南希數列或河內塔，比較兩種寫法的差異。（本講第 04 節附了一個迴圈版 fib 給你對照。）',
    css: `
.l6-stack-sm { min-height: 140px; }
.l6-stack-xs { min-height: 96px; }
.l6-chips { margin: var(--s4) 0; }
.l6-expr {
  margin: 0; padding: var(--s3) var(--s4);
  font-family: var(--font-mono); font-size: 1.05rem; font-weight: 700;
  color: var(--ink); background: var(--hi); border-radius: var(--r-sm);
  overflow-wrap: anywhere;
}
.l6-path { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; font-family: var(--font-mono); font-size: .82rem; color: var(--muted); }
.l6-col { display: grid; gap: var(--s3); align-content: start; }
.l6-col > * { margin: 0; }
.l6-col-title { margin: 0; font-weight: 700; color: var(--ink); display: flex; gap: var(--s2); align-items: center; }
.l6-scroll { max-height: 260px; overflow-y: auto; }
/* fib tree */
.l6 .tree svg, #l6-fib-tree svg { display: block; }
#l6-fib-tree .fnode { cursor: pointer; }
#l6-fib-tree .fnode circle { fill: var(--surface); stroke: var(--k); stroke-width: 2.5; transition: fill .2s, stroke .2s, stroke-width .2s, opacity .2s; }
#l6-fib-tree .fnode text { font-family: var(--font-mono); }
#l6-fib-tree .fnode .fname { font-size: 11px; font-weight: 700; }
#l6-fib-tree .fnode .fval { font-size: 11px; font-weight: 700; fill: var(--ok); }
#l6-fib-tree .fnode.is-todo { opacity: .35; }
#l6-fib-tree .fnode.is-stack circle { fill: var(--surface-2); stroke-width: 3.5; }
#l6-fib-tree .fnode.is-done circle { fill: color-mix(in srgb, var(--k) 22%, var(--surface)); }
#l6-fib-tree .fnode.is-cur circle { fill: var(--hi); stroke: var(--accent-2); stroke-width: 4; }
#l6-fib-tree .fnode.is-same circle { stroke-width: 5; filter: drop-shadow(0 0 4px var(--k)); }
#l6-fib-tree .fnode:focus-visible { outline: none; }
#l6-fib-tree .fnode:focus-visible circle { stroke: var(--accent); stroke-width: 5; }
/* growth chart */
.l6-chart { overflow-x: auto; }
@media (max-width: 640px) {
  .l6-sc, .l6-sc tbody { display: block; border: 0; background: none; }
  .l6-sc thead { display: none; }
  .l6-sc tr { display: block; padding: var(--s3); margin-bottom: var(--s2); border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface); }
  .l6-sc td { display: block; position: relative; padding: 3px 0 3px 6.4em; border: 0; }
  .l6-sc td::before { position: absolute; left: 0; top: 4px; width: 6em; color: var(--muted); font-size: .76rem; font-weight: 700; }
  .l6-sc td:first-child { padding: 0 0 6px; margin-bottom: 4px; border-bottom: 1px dashed var(--line); font-size: 1rem; }
  .l6-sc td:nth-child(2)::before { content: "宣告位置"; }
  .l6-sc td:nth-child(3)::before { content: "存續期間"; }
  .l6-sc td:nth-child(4)::before { content: "可見範圍"; }
  .l6-sc td:nth-child(5)::before { content: "存放位置"; }
  .l6-sc td:nth-child(6)::before { content: "沒給初值時"; }
}
.l6-chart-svg { display: block; width: 100%; height: auto; color: var(--ink); }
.l6-chart-svg .tick { font-family: var(--font-mono); font-size: 11px; fill: var(--muted); }
.l6-chart-svg .axis { font-size: 12px; fill: var(--ink-2); }
/* gcd rectangle */
.l6-rect { overflow-x: auto; }
.l6-rect svg { display: block; max-width: 100%; height: auto; margin: 0 auto; }
.l6-rect .sq { fill: color-mix(in srgb, var(--k) 18%, var(--surface)); stroke: var(--surface); stroke-width: 1.5; transition: fill .25s; }
.l6-rect .sq.is-past { fill: color-mix(in srgb, var(--k) 40%, var(--surface)); }
.l6-rect .sq.is-cur { fill: var(--hi); stroke: var(--accent-2); stroke-width: 2.5; }
.l6-rect .sq.is-gcd { fill: color-mix(in srgb, var(--ok) 45%, var(--surface)); stroke: var(--ok); stroke-width: 2; }
.l6-rect .sqt { font-family: var(--font-mono); font-size: 12px; font-weight: 700; fill: var(--ink); }
/* const pointer diagram */
.l6-const-code { max-width: 100%; }
.l6-ptr-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s3); }
.l6-ptr-row .cells { margin: 0; }
.l6-arrow { font-size: 1.6rem; color: var(--accent); font-weight: 700; }
.l6-ptr .caption { margin: var(--s2) 0 0; }
`,
    mount(root) {
      mountSandbox(root);
      mountSumSq(root);
      mountFact(root);
      mountFibTree(root);
      mountGrowth(root);
      mountGcd(root);
      mountReverse(root);
      mountMainRec(root);
      mountHanoi(root);
      mountCounter(root);
      mountExtern(root);
      mountConst(root);
    },
  });
})();
