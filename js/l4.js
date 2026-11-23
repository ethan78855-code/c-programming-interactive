/* =========================================================
   Lecture 04 — 迴圈、巢狀迴圈與二維陣列
   ========================================================= */
(function () {
  'use strict';

  /* ---------- code ---------- */
  const INC = String.raw`int a = 5, b = 5, c, d;
c = a++;   // 後置：先把 a 的值給 c，a 再 +1
d = --b;   // 前置：b 先 -1，再把值給 d
c = ++a;   // 前置：a 先 +1，再把值給 c
d = b--;   // 後置：先把 b 的值給 d，b 再 -1
printf("a=%d b=%d c=%d d=%d\n", a, b, c, d);`;

  const forCode = (n) => String.raw`#include <stdio.h>

int main()
{
    int a;
    for (a = 0; a < ${n}; a++)
        printf("%d\n", a);
    return 0;
}`;

  const ASCII = String.raw`#include <stdio.h>

int main(void)
{
    char ch;
    for (ch = 'a'; ch <= 'z'; ch++)
        printf("The ASCII code for %c is %d.\n", ch, ch);
    return 0;
}`;

  const SQUARE = String.raw`#include <stdio.h>

int main()
{
    int length, a, b;
    printf("Enter the side length of the square: ");
    scanf("%d", &length);
    for(a = 0; a < length; a++){
        for(b = 0; b < length; b++){
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`;

  const RIGHT = String.raw`#include <stdio.h>

int main()
{
    int height, a, b;
    printf("Enter the height of the right triangle: ");
    scanf("%d", &height);
    for(a = 0; a < height; a++){
        for(b = 0; b <= a; b++){
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`;

  const EQUI = String.raw`#include <stdio.h>

int main()
{
    int height, i, j, k;
    printf("Enter the height of the equilateral triangle: ");
    scanf("%d", &height);
    k = 0;
    for(i = 0; i < height; i++){
        for(j = 0; j < 2*height-1; j++){
            if(j < (height-1) - k || j > (height-1) + k)
                printf(" ");
            else
                printf("*");
        }
        k++;
        printf("\n");
    }
    return 0;
}`;

  const INV = String.raw`/* 練習參考解答：倒三角形 */
#include <stdio.h>

int main()
{
    int height, i, j, k;
    printf("Enter the height of the inverted triangle: ");
    scanf("%d", &height);
    k = height - 1;          // 第一列最寬
    for(i = 0; i < height; i++){
        for(j = 0; j < 2*height-1; j++){
            if(j < (height-1) - k || j > (height-1) + k)
                printf(" ");
            else
                printf("*");
        }
        k--;                 // 每往下一列就變窄
        printf("\n");
    }
    return 0;
}`;

  const ARM = String.raw`#include <stdio.h>
#include <math.h> //使用pow()函數

int main() {
    int units, tens, hundreds;
    int sum_of_cubes;
    printf("100到999之間的水仙花數有:\n");

    //迴圈遍歷所有三位數
    for (int i = 100; i <= 999; i++) {
        //拆解位數並計算總合
        units = i % 10;
        tens = (i / 10) % 10;
        hundreds = i / 100;
        sum_of_cubes = pow(units, 3) + pow(tens, 3) + pow(hundreds, 3);
        //條件判斷
        if (sum_of_cubes == i) {
            printf("%d\n", i);
        }
    }
    return 0;
}`;

  const MAT = String.raw`#include <stdio.h>

#define ROW_A 2   // 矩陣 A 的列數
#define COL_A 3   // 矩陣 A 的欄數
#define ROW_B 3   // 矩陣 B 的列數（必須等於 A 的欄數）
#define COL_B 2   // 矩陣 B 的欄數

int main() {
    int i,j,k;
    int sum;

    // 宣告兩個矩陣 A (2x3) 與 B (3x2)
    int A[ROW_A][COL_A] = {{2, 2, 4},{3, 2, 2}};

    int B[ROW_B][COL_B] = {{3, 2},{4, 1},{2, 8}};

    // 結果矩陣 C 大小為 (ROW_A x COL_B)
    int C[ROW_A][COL_B] = {0};

    // 矩陣乘法計算: C = A * B
    for(i = 0; i < ROW_A; i++) {
        for(j = 0; j < COL_B; j++) {
            sum = 0;
            for (k = 0; k < COL_A; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    printf("矩陣 A * 矩陣 B 結果為：\n");
    for (int i = 0; i < ROW_A; i++) {
        for (int j = 0; j < COL_B; j++) {
            printf("%5d ", C[i][j]);
        }
        printf("\n");
    }
    return 0;
}`;

  const whileCode = (s) => String.raw`int a = ${s};
while (a < 3) {
    printf("%d ", a);
    a++;
}
printf("\n結束，a = %d\n", a);`;

  const doCode = (s) => String.raw`int a = ${s};
do {
    printf("%d ", a);
    a++;
} while (a < 3);
printf("\n結束，a = %d\n", a);`;

  const NFACT = String.raw`#include <stdio.h>

int main(){
  int n, result = 1;
  printf("Calculate n-factorial: ");
  scanf("%d", &n);
  while(n){
    result = result * n;
    n--;
  }
  printf("%d\n", result);
  return 0;
}`;

  const POS = String.raw`#include <stdio.h>

int main()
{
    int num;
    int i;
    printf("Enter a number: ");
    scanf("%d", &num);
    printf("The number can also be represented as: ");
    i = 1;
    while(num){
        if(num/10 != 0){
            printf("%d*%d + ", num%10, i);
            num = num / 10;
            i = i * 10;
        }
        else{
            printf("%d*%d\n", num%10, i);
            num = num / 10;
        }
    }
    return 0;
}`;

  const POS_REV = String.raw`/* 練習參考解答：由高位數印到低位數 */
#include <stdio.h>

int main()
{
    int num, div = 1;
    printf("Enter a number: ");
    scanf("%d", &num);
    printf("The number can also be represented as: ");
    while (num / div >= 10)      // 找出最高位的位值
        div = div * 10;
    while (div) {
        if (div != 1)
            printf("%d*%d + ", num / div, div);
        else
            printf("%d*%d\n", num / div, div);
        num = num % div;
        div = div / 10;
    }
    return 0;
}`;

  const ATM = String.raw`#include <stdio.h>

int main() {
    int balance = 20000;
    int choice = 0;
    const int correct_pin = 2025;
    int entered_pin;
    int is_password_correct = 0; //用來記錄密碼是否正確的flag
    int amount_to_withdraw, amount_to_deposit;

    //主選單(while 迴圈)，只要使用者不選4，迴圈就一直跑
    while (choice != 4){
        printf("\n*** 歡迎使用簡易 ATM ***\n");
        printf("1. 查詢餘額\n");
        printf("2. 提款\n");
        printf("3. 存款\n");
        printf("4. 退出\n");
        printf("請選擇服務項目 (1-4): ");
        scanf("%d", &choice);
        printf("--------------------\n");

        //查詢餘額
        if (choice == 1)
            printf("您的帳戶餘額為: %d 元\n", balance);

        //提款
        else if(choice == 2){
            //for 迴圈驗證密碼，最多3次機會
            for(int i = 0; i < 3; i++){
                printf("請輸入密碼: ");
                scanf("%d", &entered_pin);
                if(entered_pin == correct_pin){
                    is_password_correct = 1;
                    printf("密碼正確！\n");
                    break; // 密碼正確，跳出for迴圈
                }
                else
                    if (i < 2) //i=0, i=1時提示還有幾次機會
                        printf("密碼錯誤，您還有 %d 次機會。\n", 2 - i);
            }

            if(is_password_correct){
                is_password_correct = 0; //flag歸零，以用作下次驗證
                printf("請輸入提款金額: ");
                scanf("%d", &amount_to_withdraw);
                if((amount_to_withdraw <= balance) && (amount_to_withdraw > 0)){
                    balance -= amount_to_withdraw;
                    printf("提款成功，您的餘額為: %d 元\n", balance);
                }
                else
                    printf("提款失敗，餘額不足或金額無效。\n");
            }
            else
                printf("密碼錯誤次數過多，交易取消。\n");
        }

        //存款
        else if(choice == 3){
            printf("請輸入存款金額: ");
            scanf("%d", &amount_to_deposit);
            if(amount_to_deposit > 0){
                balance += amount_to_deposit;
                printf("存款成功，您的餘額為: %d 元\n", balance);
            }
            else
                printf("存款金額必須大於 0。\n");
        }

        //退出
        else if(choice == 4)
            printf("感謝您的使用，再見！\n");

        //無效輸入
        else
            printf("無效的選項，請重新輸入。\n");

        printf("--------------------\n");
    }
    return 0;
}`;

  const TEST_WIDTH = String.raw`#define NUMBER 1699.999

void test_width(void)
{
    printf("01: %f~\n", NUMBER);
    printf("02: %5.1f~\n", NUMBER);
    printf("03: %9.2f~\n", NUMBER);
    printf("04: %10.2f~\n", NUMBER);
    printf("05: %10.3f~\n", NUMBER);
    printf("06: %-10.3f~\n", NUMBER); //加負號表示靠左對齊，不加表示靠右對齊
    printf("07: %+9.2f~\n", NUMBER);
    printf("08: %010.2f~\n", NUMBER);
    printf("09: %e~\n", NUMBER);
    printf("10: %12.3e~\n", NUMBER);
    printf("11: %+7d\n", 123);
    printf("12: %+7d\n", -123);
    printf("13: %+-8.2f~\n", -123.4);
    printf("14: %08.2f~\n", 123.4);
}`;

  /* ---------- helpers ---------- */
  const lineOf = (src, needle, from = 0) => {
    const lines = src.split('\n');
    for (let k = from; k < lines.length; k++) if (lines[k].includes(needle)) return k + 1;
    return -1;
  };
  const fieldNum = (id, label, value, min, max) =>
    C.field(label, `<input type="number" id="${id}" value="${value}"${min != null ? ` min="${min}"` : ''}${max != null ? ` max="${max}"` : ''}>`);
  const rangeField = (id, label, value, min, max) =>
    `<label class="field"><span>${label} <output id="${id}-v">${value}</output></span><input type="range" id="${id}" min="${min}" max="${max}" value="${value}"></label>`;
  const kv = (pairs) => pairs.map(([k, v, hi]) => `<div${hi ? ' class="is-hi"' : ''}><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  const charCells = (s, opts = {}) =>
    `<div class="cells cells--tight l4-outcells">${Array.from(s)
      .map(
        (ch, k) =>
          `<div class="cell${ch === ' ' ? ' is-dim' : ''}${opts.markLast && k === s.length - 1 ? ' l4-tilde' : ''}"><span class="cell-idx">${k + 1}</span><span class="cell-val">${
            ch === ' ' ? '·' : C.esc(ch)
          }</span></div>`
      )
      .join('')}</div>`;

  /* =========================================================
     Section HTML
     ========================================================= */
  function sections() {
    const s1 =
      C.prose(`<p>寫 <code>a = a + b</code> 太冗長了，工程師設計了 <strong>賦值運算子（assignment operators）</strong>：<code>a += b</code> 代表「把自己加上 b」。還有專門「加 1／減 1」的<strong>遞增／遞減運算子（increment／decrement）</strong>，這在迴圈裡天天會用到。</p>`) +
      `<div class="widget-split">` +
      C.table(
        ['運算子', '說明', '範例', '等同於'],
        [
          ['<code>=</code>', '賦值', '<code>a = b</code>', '—'],
          ['<code>+=</code>', '加法賦值', '<code>a += b</code>', '<code>a = a + b</code>'],
          ['<code>-=</code>', '減法賦值', '<code>a -= b</code>', '<code>a = a - b</code>'],
          ['<code>*=</code>', '乘法賦值', '<code>a *= b</code>', '<code>a = a * b</code>'],
          ['<code>/=</code>', '除法賦值', '<code>a /= b</code>', '<code>a = a / b</code>'],
          ['<code>%=</code>', '取餘數賦值', '<code>a %= b</code>', '<code>a = a % b</code>'],
        ]
      ) +
      C.table(
        ['運算子', '說明', '寫法'],
        [
          ['<code>++</code>', '遞增（自增 1）', '<code>++a</code> 前置／<code>a++</code> 後置'],
          ['<code>--</code>', '遞減（自減 1）', '<code>--a</code> 前置／<code>a--</code> 後置'],
        ]
      ) +
      `</div>` +
      C.widget({
        id: 'l4-asg',
        title: '複合賦值計算機',
        hint: '設定 a、b 並選擇運算子，看 a op= b 怎麼展開；按「執行」會真的更新 a，可以連續按好幾次。',
        body: `<ol class="l4-steps" id="l4-asg-steps"></ol><div class="cells" id="l4-asg-cells"></div><div class="console" data-title="執行紀錄" id="l4-asg-log"></div>`,
        controls: `${fieldNum('l4-asg-a', 'a', 7)}${fieldNum('l4-asg-b', 'b', 3)}
${C.seg('l4-asgop', [['+', '+='], ['-', '-='], ['*', '*='], ['/', '/='], ['%', '%=']], '+', '運算子')}
<button type="button" class="btn btn--primary" id="l4-asg-go">執行 a += b</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" id="l4-asg-reset">重設</button>`,
      }) +
      C.callout('key', '前置 vs 後置', '<p><code>++a</code>（前置）：<strong>先加 1，再拿去運算</strong>；<code>a++</code>（後置）：<strong>先拿目前的值去運算，之後才加 1</strong>。單獨一行 <code>a++;</code> 和 <code>++a;</code> 效果一樣，差別只在「同一個運算式裡還要用到它的值」的時候。</p>') +
      C.widget({
        id: 'l4-inc',
        title: 'a++ 和 ++a 差在哪？',
        hint: '一步一步執行，注意每一行「先賦值還是先加減」的順序；黃色是這一步剛改變的變數。',
        body: `<div class="widget-split">${C.code(INC, { id: 'l4-inc-code' })}<div><dl class="kv" id="l4-inc-kv"></dl><p class="feedback is-info" id="l4-inc-note"></p><div class="console" data-title="輸出" id="l4-inc-out"></div></div></div>`,
        controls: `<div id="l4-inc-step"></div>`,
      });

    const s2 =
      C.prose(`<p><strong>for 迴圈</strong>會自動處理「計數器控制式重複」的所有細節：初始值、繼續的條件、每圈的遞增，全部寫在同一行。很適合<strong>已經知道要重複幾次</strong>的情況。點點看下面語法的每一個部分：</p>`) +
      C.widget({
        id: 'l4-anat',
        title: 'for 迴圈語法解析',
        tag: '圖解',
        hint: '點擊 for 敘述的每個部分，看它的角色與執行時機。',
        body: `<div class="l4-anat-line" id="l4-anat-line"><span class="tk-kw">for</span> ( <button type="button" class="l4-part" data-part="init" aria-pressed="true">int counter = 1</button>; <button type="button" class="l4-part" data-part="cond" aria-pressed="false">counter &lt;= 10</button>; <button type="button" class="l4-part" data-part="upd" aria-pressed="false">counter++</button> ) <button type="button" class="l4-part" data-part="body" aria-pressed="false">{ 迴圈本體 }</button></div>
<div class="l4-anat-labels"><span>關鍵字 for</span><span>控制變數的初始值</span><span>迴圈繼續的條件</span><span>控制變數的遞增</span></div>
<p class="feedback is-info" id="l4-anat-info"></p>`,
      }) +
      C.callout('tip', '補充：C99 以後', '<p>自 C99 版本以後，for 的初始處可以直接宣告變數（<code>for (int counter = 1; ...)</code>），但<strong>這個變數不能在 for 迴圈外面使用</strong>。</p>') +
      C.prose(`<p>講義的例子從 0 數到 9：<code>a</code> 初始值為 0 進入迴圈，每跑完一輪 <code>a</code> 就遞增，接著判斷 <code>a</code> 是否小於 10——小於就繼續、不小於就結束。因為迴圈本體只有一行，<code>{}</code> 可以拿掉。用下面的逐步執行看清楚「① → ② → ③ → ④ → ② …」的順序：</p>`) +
      C.widget({
        id: 'l4-forrun',
        title: 'for 迴圈執行順序',
        hint: '調整結束值 N，用「下一步」或「自動播放」追蹤每一個階段：注意條件在每一圈「開始前」檢查，更新在每一圈「結束後」執行。',
        body: `<div class="widget-split"><div id="l4-forrun-code"></div><div>
<div class="flow l4-cycle" id="l4-forrun-flow">
  <div class="flow-node" data-ph="init">① 初始化<small>a = 0</small></div><div class="flow-arrow"></div>
  <div class="flow-node" data-ph="cond">② 條件<small id="l4-forrun-condlbl">a &lt; N ?</small></div><div class="flow-arrow"></div>
  <div class="flow-node" data-ph="body">③ 本體<small>printf</small></div><div class="flow-arrow"></div>
  <div class="flow-node" data-ph="upd">④ 更新<small>a++ → 回到 ②</small></div><div class="flow-arrow"></div>
  <div class="flow-node flow-node--tool" data-ph="exit">結束<small>條件為假</small></div>
</div>
<dl class="kv" id="l4-forrun-kv"></dl>
<div class="console" data-title="輸出" id="l4-forrun-out"></div></div></div>`,
        controls: `${rangeField('l4-forrun-n', '結束值 N', 4, 1, 10)}<span class="spacer"></span><div id="l4-forrun-step"></div>`,
      }) +
      `<h3>為什麼 char 可以拿來比大小、做 ++？</h3>` +
      C.prose(`<p>char 在 C 語言內<strong>本質上是一種整數型別</strong>：每個字元其實都對應一個 ASCII（或 Unicode）數值，例如 <code>'a'</code> 就是 97。所以 <code>for (ch = 'a'; ch &lt;= 'z'; ch++)</code> 完全合法，而且用 <code>%c</code> 印出字元、<code>%d</code> 印出它的編碼。</p>`) +
      C.widget({
        id: 'l4-ascii',
        title: 'ASCII 碼對照表',
        hint: '點任一個字元查看它的十進位、十六進位、八進位與二進位；或執行講義的 a~z 範例。',
        body: `<div class="widget-split"><div>${C.code(ASCII, { id: 'l4-ascii-code' })}<dl class="kv" id="l4-ascii-kv"></dl><p class="feedback is-info" id="l4-ascii-note"></p></div><div><div class="cells l4-ascii" id="l4-ascii-grid"></div></div></div>
<div class="console" data-title="輸出" id="l4-ascii-out"></div>`,
        controls: `<button type="button" class="btn btn--primary" id="l4-ascii-run">▶ 執行範例：a 到 z</button>
${C.field('查詢字元', '<input type="text" id="l4-ascii-q" maxlength="1" value="A" autocomplete="off" style="width:5em">')}
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" id="l4-ascii-clear">清除輸出</button>`,
      });

    const s3 =
      C.prose(`<p><strong>巢狀迴圈（nested loop）</strong>就是「迴圈裡面還有迴圈」。畫圖形時最好懂：<strong>外層迴圈決定現在是第幾列</strong>，<strong>內層迴圈決定這一列要印幾個字元</strong>，內層跑完再印一個 <code>\\n</code> 換行。外層每跑一圈，內層就要從頭到尾完整跑一遍。</p>`) +
      C.widget({
        id: 'l4-star',
        title: '星星圖案產生器',
        hint: '選擇圖案和高度後按播放：右邊的格子會依照 i（列）、j（欄）的順序一格一格印出來，左邊同步標出正在執行的程式碼。',
        body: `<div class="widget-split"><div id="l4-star-code"></div><div><dl class="kv" id="l4-star-kv"></dl><div class="l4-star-wrap"><div class="grid-matrix l4-stargrid" id="l4-star-grid"></div></div><div class="console" data-title="輸出" id="l4-star-out"></div></div></div>`,
        controls: `${C.seg('l4-shape', [['square', '正方形'], ['right', '直角三角形'], ['equi', '正三角形'], ['inv', '倒三角形〔練習〕']], 'equi', '圖案')}
${rangeField('l4-star-h', '高度', 4, 1, 9)}
<button type="button" class="btn btn--primary" id="l4-star-play" aria-pressed="false">▶ 播放</button>
<button type="button" class="btn" id="l4-star-next">下一步</button>
<button type="button" class="btn" id="l4-star-fin">直接完成</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" id="l4-star-reset">重設</button>`,
      }) +
      `<h3>Armstrong Number（水仙花數、自戀數）</h3>` +
      C.prose(`<p>一個 N 位數，如果<strong>各位數字的 N 次方和等於該數本身</strong>，就叫做 Armstrong Number。例如 153 是 3 位數：1³ + 5³ + 3³ = 1 + 125 + 27 = <strong>153</strong>。講義用一個 for 迴圈掃過所有三位數，再用 <code>%</code> 和 <code>/</code> 拆出個、十、百位數檢查。</p>`) +
      C.widget({
        id: 'l4-arm',
        title: '掃描 100 ~ 999 的水仙花數',
        hint: '按「開始掃描」看迴圈逐一檢查每個三位數；右邊可以輸入任何數字自己驗證。',
        body: `<div class="widget-split"><div>${C.code(ARM, { id: 'l4-arm-code' })}</div><div>
<div class="l4-armnow" id="l4-arm-now"></div>
<div class="progress" id="l4-arm-prog" style="--p:0%">i = 100</div>
<p class="caption">找到的水仙花數：</p>
<div class="cells" id="l4-arm-found"></div>
<h4 class="l4-sub">自己驗證任意數字</h4>
${fieldNum('l4-arm-test', '輸入一個正整數', 9474, 0, 999999999)}
<p class="feedback" id="l4-arm-verdict"></p>
</div></div>`,
        controls: `<button type="button" class="btn btn--primary" id="l4-arm-scan" aria-pressed="false">▶ 開始掃描</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" id="l4-arm-reset">重設</button>`,
      });

    const s4 =
      C.prose(`<p>二維陣列 <code>int A[2][3]</code> 可以想成 2 列（row）× 3 欄（column）的表格，用 <code>A[i][j]</code> 取第 i 列、第 j 欄。講義用它來做<strong>矩陣乘法（matrix multiplication）</strong>：</p>
<ul>
<li>兩矩陣 A 和 B 相乘，要確保 <strong>A 的欄數（column）＝ B 的列數（row）</strong>。A 是 2×3、B 是 3×2，結果 C 是 2×2。</li>
<li>結果矩陣的元素 <code>C[i][j]</code> ＝ A 的第 i 列和 B 的第 j 欄，<strong>對應元素相乘後加總</strong>：<code>C[i][j] = Σ A[i][k] × B[k][j]</code>。</li>
<li>所以需要<strong>三層</strong>巢狀迴圈：i 跑列、j 跑欄、k 負責把對應元素相乘再累加到 <code>sum</code>。</li>
</ul>`) +
      C.widget({
        id: 'l4-mat',
        title: '矩陣乘法視覺化',
        hint: '點 C 的任一格，看它由 A 的哪一列和 B 的哪一欄算出；也可以修改 A、B 的數字，或用逐步執行追蹤三層迴圈。',
        body: `<div class="l4-matrow" id="l4-mat-row"></div>
<p class="feedback is-info l4-formula" id="l4-mat-formula"></p>
<details class="l4-details"><summary>顯示完整程式碼（講義範例）</summary>${C.code(MAT, { id: 'l4-mat-code' })}</details>`,
        controls: `<div id="l4-mat-step"></div><span class="spacer"></span><button type="button" class="btn btn--ghost" id="l4-mat-reset">還原講義數字</button>`,
      });

    const s5 =
      C.cards([
        {
          num: 'while',
          title: 'while (條件式) { }',
          body: '<p>當條件成立時，就做 {} 裡的敘述，直到條件不成立才跳出迴圈。<strong>先檢查條件，再決定要不要執行</strong>，所以可能一次都不執行。</p>',
        },
        {
          num: 'do',
          title: 'do { } while (條件式);',
          body: '<p>和 while 類似，差別是<strong>先執行程式，再檢查條件</strong>。因為動作執行前不做檢查，所以 do...while <strong>一定會執行至少一次</strong>。別忘了結尾的分號！</p>',
        },
      ]) +
      C.widget({
        id: 'l4-wd',
        title: 'while vs do...while',
        hint: '把起始值 a 調到 3 以上（條件一開始就不成立），再逐步執行比較：while 一次都不跑，do...while 還是會先跑一次。',
        body: `<div class="widget-split">
<div><h4 class="l4-sub">while：先檢查</h4><div id="l4-wd-c1"></div><dl class="kv" id="l4-wd-k1"></dl><div class="console" data-title="輸出" id="l4-wd-o1"></div></div>
<div><h4 class="l4-sub">do...while：先執行</h4><div id="l4-wd-c2"></div><dl class="kv" id="l4-wd-k2"></dl><div class="console" data-title="輸出" id="l4-wd-o2"></div></div>
</div>`,
        controls: `${rangeField('l4-wd-s', '起始值 a', 3, 0, 5)}<span class="spacer"></span><div id="l4-wd-step"></div>`,
      }) +
      C.prose(`<p>while 迴圈很適合「不確定要跑幾次、直到某個狀況才停」的情境。講義用它算 <strong>n 階乘（n-factorial）</strong>：1 × 2 × 3 × … × n。<code>while(n)</code> 的意思是「n 不是 0 就繼續」，每圈把 result 乘上 n，再讓 n 減 1。</p>`) +
      C.widget({
        id: 'l4-fact',
        title: 'n 階乘：while 迴圈追蹤表',
        hint: '輸入 n 並按播放，逐列看 result 和 n 怎麼變化；試試 n = 13，看看 int 溢位會發生什麼事。',
        body: `<div class="widget-split">${C.code(NFACT, { id: 'l4-fact-code' })}<div><div class="table-wrap"><table class="table"><thead><tr><th>第幾圈</th><th>while(n) 檢查</th><th>result = result * n</th><th>n--</th></tr></thead><tbody id="l4-fact-rows"></tbody></table></div><p class="feedback" id="l4-fact-note"></p><div class="console" data-title="輸出" id="l4-fact-out"></div></div></div>`,
        controls: `${fieldNum('l4-fact-n', 'n', 5, 0, 20)}<button type="button" class="btn btn--primary" id="l4-fact-play">▶ 逐列播放</button>
<span class="spacer"></span>
<div class="btn-group">${[0, 5, 12, 13].map((v) => `<button type="button" class="btn btn--sm" data-n="${v}">n = ${v}</button>`).join('')}</div>`,
      }) +
      `<h3>位值記數法（Positional Notation）</h3>` +
      C.prose(`<p>例如 2546 = 6×1 + 4×10 + 5×100 + 2×1000。講義的程式用 <code>num % 10</code> 取出最低位、<code>num / 10</code> 把最低位丟掉，每圈把位值 i 乘以 10，所以會<strong>從個位數開始</strong>印。如果印的順序要反過來，該怎麼做？切換到「反向（練習）」看參考解法。</p>`) +
      C.widget({
        id: 'l4-pos',
        title: '位值記數法追蹤',
        hint: '輸入一個整數，用逐步執行觀察每一圈的 num、num % 10 和位值 i。',
        body: `<div class="widget-split"><div id="l4-pos-code"></div><div><div class="table-wrap"><table class="table"><thead id="l4-pos-head"></thead><tbody id="l4-pos-rows"></tbody></table></div><div class="console" data-title="輸出" id="l4-pos-out"></div></div></div>`,
        controls: `${fieldNum('l4-pos-n', 'num', 2546, 0, 999999999)}
${C.seg('l4-posdir', [['fwd', '正向（講義）'], ['rev', '反向（練習）']], 'fwd', '印出順序')}
<span class="spacer"></span><div id="l4-pos-step"></div>`,
      });

    const s6 =
      C.prose(`<p>這個練習把前面學的全部綜合起來：一開始顯示 ATM 選單（查詢餘額、提款、存款、退出），依照使用者的選擇執行對應功能。主選單用 <strong>while 迴圈</strong>一直重複、密碼驗證用 <strong>for 迴圈</strong>給 3 次機會、各種判斷用 <strong>if...else</strong>。下面的終端機完整模擬講義的程式，<strong>密碼是 2025</strong>，初始餘額 20000 元。</p>`) +
      C.widget({
        id: 'l4-atm',
        title: '簡易 ATM 模擬器',
        tag: '可以玩',
        hint: '在輸入框打數字後按 Enter 或「送出」（就像 scanf 等你輸入）；也可以按快捷鍵。試試看連續輸錯 3 次密碼！',
        body: `<div class="console l4-atm-con" data-title="ATM 終端機" id="l4-atm-con" aria-live="polite"></div>
<div class="row"><input type="text" id="l4-atm-in" inputmode="numeric" autocomplete="off" placeholder="輸入數字後按 Enter" aria-label="ATM 輸入"><button type="button" class="btn btn--primary" id="l4-atm-send">送出</button></div>
<details class="l4-details"><summary>顯示完整程式碼（講義範例）</summary>${C.code(ATM)}</details>`,
        controls: `<span class="caption">快捷輸入：</span><div class="btn-group">${['1', '2', '3', '4', '2025', '5000']
          .map((v) => `<button type="button" class="btn btn--sm" data-atm="${v}">${v}</button>`)
          .join('')}</div>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost" id="l4-atm-reboot">重新開機</button>`,
      });

    const s7 =
      C.prose(`<p>printf 的格式指定字其實可以寫得更完整：<code>%[旗標][寬度][.精度]指定字</code>。</p>
<ul>
<li><strong>旗標（flags）</strong>：控制靠左對齊、補 0，或指定顯示正負號、進位開頭（如 0X）。</li>
<li><strong>欄位寬度（width）</strong>：最少占用的字數，不足時預設<strong>靠右對齊</strong>（左邊補空白），可以用旗標改成補 0 或靠左。內容比寬度長時不會被截斷。</li>
<li><strong>精度（precision）</strong>：對浮點數是<strong>小數位數</strong>（預設 6，會四捨五入）；對整數是<strong>最少顯示的位數</strong>，不足補 0。</li>
</ul>`) +
      C.table(
        ['旗標', '效果'],
        [
          ['<code>-</code>', '靠左對齊（右邊補空白）'],
          ['<code>0</code>', '用前導的 0 填補欄位'],
          ['<code>+</code>', '正數前顯示 +，負數前顯示 -'],
          ['（空白）', '正數前空一格，負數前顯示 -'],
          ['<code>#</code>', '8／16 進位前加 0／0x；浮點數強制顯示小數點'],
        ]
      ) +
      C.widget({
        id: 'l4-fmt',
        title: '格式字串產生器',
        hint: '勾選旗標、拖動寬度與精度，看輸出的每一個字元落在哪一格（灰色點＝空白，~ 是講義用來標示結尾的記號）。',
        body: `<div id="l4-fmt-code"></div><div class="l4-fmt-out" id="l4-fmt-cells"></div><ul class="l4-steps" id="l4-fmt-notes"></ul>`,
        controls: `<div class="btn-group" role="group" aria-label="旗標">${[
          ['-', '-'],
          ['0', '0'],
          ['+', '+'],
          [' ', '空白'],
          ['#', '#'],
        ]
          .map(([f, l]) => `<button type="button" class="chip" data-flag="${f === ' ' ? 'sp' : f}" aria-pressed="false">旗標 ${l}</button>`)
          .join('')}</div>
${rangeField('l4-fmt-w', '寬度', 10, 0, 15)}
${rangeField('l4-fmt-p', '精度', 3, -1, 8)}
${C.seg('l4-fmtspec', [['f', '%f'], ['e', '%e'], ['d', '%d'], ['x', '%x'], ['o', '%o']], 'f', '指定字')}
${C.field('數值', '<input type="text" id="l4-fmt-val" value="1699.999" autocomplete="off" style="width:8em">')}`,
      }) +
      C.widget({
        id: 'l4-tw',
        title: '執行講義的 test_width()',
        tag: '範例',
        hint: '逐行執行講義的 14 個 printf，比較每一行的格式和輸出（這些輸出和真正的 C 編譯器結果一致）。',
        body: `<div class="widget-split">${C.code(TEST_WIDTH, { id: 'l4-tw-code' })}<div class="console" data-title="輸出" id="l4-tw-out"></div></div>`,
        controls: `<button type="button" class="btn btn--primary" id="l4-tw-run">▶ 執行 test_width()</button><button type="button" class="btn" id="l4-tw-all">一次印出全部</button><span class="spacer"></span><button type="button" class="btn btn--ghost" id="l4-tw-clear">清除</button>`,
      }) +
      C.prose(`<p>寬度和精度也可以用 <code>*</code> 代替，改由<strong>後面的引數</strong>決定。講義的 <code>test_precision()</code> 讓使用者輸入寬度和精度，例如輸入 width = 8、precision = 2，就會印出寬度至少 8 個字元、小數 2 位的 rate 值：</p>`) +
      C.widget({
        id: 'l4-sp',
        title: '%*.*f：用變數指定寬度與精度',
        body: `<div id="l4-sp-code"></div><div class="console" data-title="輸出" id="l4-sp-out"></div><div id="l4-sp-cells"></div>`,
        controls: `${rangeField('l4-sp-w', 'width', 8, 0, 15)}${rangeField('l4-sp-p', 'precision', 2, 0, 6)}`,
      });

    return (
      C.section('l4-assign', '01', '賦值與遞增／遞減運算子', s1) +
      C.section('l4-for', '02', 'for 迴圈', s2) +
      C.section('l4-nested', '03', '巢狀迴圈', s3) +
      C.section('l4-matrix', '04', '二維陣列：矩陣乘法', s4) +
      C.section('l4-while', '05', 'while 與 do...while 迴圈', s5) +
      C.section('l4-atm-sec', '06', '綜合練習：簡易 ATM', s6) +
      C.section('l4-printf', '07', 'printf 格式化輸出', s7)
    );
  }

  /* =========================================================
     Widgets
     ========================================================= */

  /* ---- compound assignment ---- */
  function mountAsg(root) {
    const $ = (id) => C.$('#' + id, root);
    let op = '+';
    const log = [];
    const calc = (a, b) => {
      if ((op === '/' || op === '%') && b === 0) return null;
      if (op === '+') return a + b;
      if (op === '-') return a - b;
      if (op === '*') return a * b;
      if (op === '/') return Math.trunc(a / b);
      return a % b;
    };
    const vals = () => [parseInt($('l4-asg-a').value, 10) || 0, parseInt($('l4-asg-b').value, 10) || 0];
    function render() {
      const [a, b] = vals();
      const r = calc(a, b);
      $('l4-asg-go').textContent = `執行 a ${op}= b`;
      $('l4-asg-steps').innerHTML = `<li><code>a ${op}= b;</code></li><li>等同於 <code>a = a ${op} b;</code></li><li>代入：<code>a = ${a} ${op} ${b}</code></li><li>${
        r === null ? '<span class="pill-err">除以 0：未定義行為！</span>' : `結果：<code>a = ${r}</code>${op === '/' && a % b !== 0 ? '　<span class="muted">（整數除法，小數被捨去）</span>' : ''}`
      }</li>`;
      $('l4-asg-cells').innerHTML = `<div class="cell"><span class="cell-idx">執行前 a</span><span class="cell-val">${a}</span></div><div class="cell is-dim"><span class="cell-val">→</span></div><div class="cell ${
        r === null ? 'is-err' : 'is-hi'
      }"><span class="cell-idx">執行後 a</span><span class="cell-val">${r === null ? '?' : r}</span></div>`;
      $('l4-asg-log').textContent = log.slice(-6).join('\n') || '（按「執行」把結果寫回 a）';
    }
    C.onSeg(root, 'l4-asgop', (v) => {
      op = v;
      render();
    });
    ['l4-asg-a', 'l4-asg-b'].forEach((id) => $(id).addEventListener('input', render));
    $('l4-asg-go').addEventListener('click', () => {
      const [a, b] = vals();
      const r = calc(a, b);
      if (r === null) log.push(`a ${op}= ${b}  →  除以 0，無法執行`);
      else {
        log.push(`a ${op}= ${b}  →  a = ${r}`);
        $('l4-asg-a').value = r;
      }
      render();
    });
    $('l4-asg-reset').addEventListener('click', () => {
      $('l4-asg-a').value = 7;
      $('l4-asg-b').value = 3;
      log.length = 0;
      render();
    });
    render();
  }

  /* ---- a++ vs ++a ---- */
  function mountInc(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l4-inc-code');
    const S = [
      { line: 1, v: { a: 5, b: 5, c: '?', d: '?' }, ch: ['a', 'b'], note: '宣告：a、b 都是 5；c、d 還沒給值（垃圾值）。' },
      { line: 2, v: { a: 5, b: 5, c: 5, d: '?' }, ch: ['c'], note: '<code>c = a++</code>（後置）：先把 a 目前的值 5 給 c…' },
      { line: 2, v: { a: 6, b: 5, c: 5, d: '?' }, ch: ['a'], note: '…這一行運算完，a 才 +1 變成 6。所以 c = 5、a = 6。' },
      { line: 3, v: { a: 6, b: 4, c: 5, d: '?' }, ch: ['b'], note: '<code>d = --b</code>（前置）：b 先 -1 變成 4…' },
      { line: 3, v: { a: 6, b: 4, c: 5, d: 4 }, ch: ['d'], note: '…再把 b 的新值 4 給 d。所以 b = 4、d = 4。' },
      { line: 4, v: { a: 7, b: 4, c: 5, d: 4 }, ch: ['a'], note: '<code>c = ++a</code>（前置）：a 先 +1 變成 7…' },
      { line: 4, v: { a: 7, b: 4, c: 7, d: 4 }, ch: ['c'], note: '…再把 7 給 c。' },
      { line: 5, v: { a: 7, b: 4, c: 7, d: 4 }, ch: ['d'], note: '<code>d = b--</code>（後置）：先把 b 目前的值 4 給 d…' },
      { line: 5, v: { a: 7, b: 3, c: 7, d: 4 }, ch: ['b'], note: '…之後 b 才 -1 變成 3。' },
      { line: 6, v: { a: 7, b: 3, c: 7, d: 4 }, ch: [], note: '印出最後結果。', out: 'a=7 b=3 c=7 d=4' },
    ];
    C.stepper($('l4-inc-step'), {
      count: S.length,
      interval: 1300,
      render(i) {
        const s = S[i];
        C.setLines(pre, s.line);
        $('l4-inc-kv').innerHTML = kv(['a', 'b', 'c', 'd'].map((k) => [k, s.v[k], s.ch.includes(k)]));
        $('l4-inc-note').innerHTML = s.note;
        $('l4-inc-out').textContent = s.out || '';
      },
    });
  }

  /* ---- for anatomy ---- */
  function mountAnat(root) {
    const $ = (id) => C.$('#' + id, root);
    const INFO = {
      init: '<strong>① 控制變數的初始值</strong>：迴圈開始前<strong>只執行一次</strong>，設定計數器的起點。C99 起可以在這裡宣告變數（如 <code>int counter</code>），但它只在 for 迴圈內有效。',
      cond: '<strong>② 迴圈繼續的條件</strong>：<strong>每一圈開始前</strong>都會檢查。成立（非 0）就執行迴圈本體，不成立（0）就跳出迴圈。這個例子會在 counter 變成 11 時結束。',
      upd: '<strong>④ 控制變數的遞增</strong>：<strong>每次本體執行完之後</strong>才執行，然後再回到 ② 檢查條件。也可以寫成 <code>counter += 2</code>、<code>counter--</code> 等。',
      body: '<strong>③ 迴圈本體</strong>：條件成立時要重複執行的敘述。如果只有一行敘述，<code>{}</code> 可以省略。這個 for 迴圈的本體總共會執行 10 次（counter = 1 ~ 10）。',
    };
    const show = (p) => {
      C.$$('.l4-part', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.part === p)));
      $('l4-anat-info').innerHTML = INFO[p];
    };
    $('l4-anat-line').addEventListener('click', (e) => {
      const b = e.target.closest('.l4-part');
      if (b) show(b.dataset.part);
    });
    show('init');
  }

  /* ---- for execution order ---- */
  function mountForRun(root) {
    const $ = (id) => C.$('#' + id, root);
    let N = 4;
    let steps = [];
    let pre;
    function build() {
      N = +$('l4-forrun-n').value;
      $('l4-forrun-n-v').textContent = N;
      $('l4-forrun-code').innerHTML = C.code(forCode(N), { id: 'l4-forrun-pre' });
      pre = $('l4-forrun-pre');
      $('l4-forrun-condlbl').textContent = `a < ${N} ?`;
      steps = [{ ph: 'init', a: 0, out: '', n: 0, note: '執行初始化 a = 0（只做這一次）' }];
      let a = 0;
      let out = '';
      let n = 0;
      while (true) {
        const ok = a < N;
        steps.push({ ph: 'cond', a, out, n, cond: ok, note: `檢查 ${a} < ${N} → ${ok ? '1（成立，進入本體）' : '0（不成立，跳出迴圈）'}` });
        if (!ok) break;
        out += a + '\n';
        n++;
        steps.push({ ph: 'body', a, out, n, note: `執行本體：printf 印出 ${a}` });
        a++;
        steps.push({ ph: 'upd', a, out, n, note: `更新 a++ → a 變成 ${a}，回到 ② 再檢查` });
      }
      steps.push({ ph: 'exit', a, out, n, note: `迴圈結束：本體共執行 ${n} 次，此時 a = ${a}` });
    }
    const forLine = () => lineOf(forCode(N), 'for (');
    build();
    const st = C.stepper($('l4-forrun-step'), {
      count: () => steps.length,
      interval: 800,
      render(i) {
        const s = steps[i];
        C.$$('#l4-forrun-flow .flow-node', root).forEach((nd) => {
          nd.classList.toggle('is-active', nd.dataset.ph === s.ph);
        });
        C.setLines(pre, s.ph === 'body' ? forLine() + 1 : s.ph === 'exit' ? lineOf(forCode(N), 'return') : forLine());
        $('l4-forrun-kv').innerHTML = kv([
          ['a', s.a, s.ph === 'upd' || s.ph === 'init'],
          [`a < ${N}`, s.ph === 'cond' ? (s.cond ? '1 成立' : '0 不成立') : '—', s.ph === 'cond'],
          ['本體已執行', `${s.n} 次`, s.ph === 'body'],
        ]);
        $('l4-forrun-out').textContent = s.out + '\n▸ ' + s.note;
      },
    });
    $('l4-forrun-n').addEventListener('input', () => {
      build();
      st.reset();
    });
  }

  /* ---- ASCII table ---- */
  function mountAscii(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l4-ascii-code');
    const grid = $('l4-ascii-grid');
    let timer = null;
    let out = '';
    let html = '';
    for (let c = 32; c <= 126; c++) {
      const ch = String.fromCharCode(c);
      html += `<button type="button" class="cell" data-code="${c}" aria-label="字元 ${c === 32 ? '空白' : C.esc(ch)}，ASCII ${c}"><span class="cell-val">${c === 32 ? '␣' : C.esc(ch)}</span><span class="cell-sub">${c}</span></button>`;
    }
    grid.innerHTML = html;
    function select(c, fromRun) {
      C.$$('.cell', grid).forEach((el) => el.classList.toggle('is-hi', +el.dataset.code === c));
      const ch = String.fromCharCode(c);
      $('l4-ascii-kv').innerHTML = kv([
        ['字元 %c', c === 32 ? "' '" : `'${C.esc(ch)}'`, true],
        ['十進位 %d', c],
        ['十六進位 %X', '0x' + c.toString(16).toUpperCase()],
        ['八進位 %o', '0' + c.toString(8)],
        ['二進位', c.toString(2).padStart(8, '0')],
      ]);
      let note = '';
      if (c >= 65 && c <= 90) note = `大寫字母：'${ch}' + 32 = '${String.fromCharCode(c + 32)}'（${c + 32}），大小寫剛好差 32。`;
      else if (c >= 97 && c <= 122) note = `小寫字母：'${ch}' − 32 = '${String.fromCharCode(c - 32)}'（${c - 32}）。字母是連續編碼的，所以 ch++ 會得到下一個字母。`;
      else if (c >= 48 && c <= 57) note = `數字字元 '${ch}' 的編碼是 ${c}，不是 ${ch}！要轉成數值得寫 <code>ch - '0'</code> = ${c - 48}。`;
      else note = c === 32 ? '空白字元也有編碼：32。' : '標點符號也一樣有自己的 ASCII 碼。';
      $('l4-ascii-note').innerHTML = note;
      if (!fromRun) {
        out += C.printf('The ASCII code for %c is %d.\n', ch, c);
        $('l4-ascii-out').textContent = out.split('\n').slice(-8).join('\n');
      }
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
      $('l4-ascii-run').textContent = '▶ 執行範例：a 到 z';
    }
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('.cell[data-code]');
      if (!b) return;
      stop();
      C.setLines(pre, []);
      select(+b.dataset.code);
    });
    $('l4-ascii-q').addEventListener('input', () => {
      const v = $('l4-ascii-q').value;
      if (!v) return;
      const c = v.charCodeAt(0);
      if (c >= 32 && c <= 126) {
        stop();
        select(c);
      } else $('l4-ascii-note').textContent = '只示範 ASCII 32 ~ 126 的可列印字元。';
    });
    $('l4-ascii-run').addEventListener('click', () => {
      if (timer) return stop();
      let c = 97;
      out = '';
      $('l4-ascii-run').textContent = '⏸ 暫停';
      const tick = () => {
        C.setLines(pre, [lineOf(ASCII, 'for ('), lineOf(ASCII, 'printf')]);
        select(c, true);
        out += C.printf('The ASCII code for %c is %d.\n', String.fromCharCode(c), c);
        $('l4-ascii-out').textContent = out.trimEnd();
        $('l4-ascii-out').scrollTop = $('l4-ascii-out').scrollHeight;
        c++;
        if (c > 122) stop();
      };
      tick();
      if (c <= 122) timer = C.every(tick, 220);
    });
    $('l4-ascii-clear').addEventListener('click', () => {
      stop();
      out = '';
      $('l4-ascii-out').textContent = '';
    });
    select(65, true);
  }

  /* ---- star patterns ---- */
  function mountStar(root) {
    const $ = (id) => C.$('#' + id, root);
    const SRC = { square: SQUARE, right: RIGHT, equi: EQUI, inv: INV };
    let shape = 'equi';
    let h = 4;
    let ev = [];
    let cols = 0;
    let pos = 0;
    let timer = null;
    let pre;
    let L = {};
    function build() {
      h = +$('l4-star-h').value;
      $('l4-star-h-v').textContent = h;
      const src = SRC[shape];
      $('l4-star-code').innerHTML = C.code(src, { id: 'l4-star-pre' });
      pre = $('l4-star-pre');
      const two = shape === 'equi' || shape === 'inv';
      L = {
        outer: lineOf(src, two ? 'for(i = 0' : 'for(a = 0'),
        inner: lineOf(src, two ? 'for(j = 0' : 'for(b = 0'),
        star: lineOf(src, 'printf("*")'),
        space: lineOf(src, 'printf(" ")'),
        nl: lineOf(src, 'printf("\\n")'),
      };
      ev = [];
      cols = two ? 2 * h - 1 : h;
      for (let i = 0; i < h; i++) {
        if (shape === 'square') for (let j = 0; j < h; j++) ev.push({ t: '*', i, j });
        else if (shape === 'right') for (let j = 0; j <= i; j++) ev.push({ t: '*', i, j });
        else {
          const k = shape === 'equi' ? i : h - 1 - i;
          for (let j = 0; j < 2 * h - 1; j++) ev.push({ t: j < h - 1 - k || j > h - 1 + k ? ' ' : '*', i, j, k });
        }
        ev.push({ t: 'nl', i });
      }
      pos = 0;
    }
    function render() {
      const grid = Array.from({ length: h }, () => Array(cols).fill(null));
      let out = '';
      for (let p = 0; p < pos; p++) {
        const e = ev[p];
        if (e.t === 'nl') out += '\n';
        else {
          grid[e.i][e.j] = e.t;
          out += e.t;
        }
      }
      const cur = ev[pos - 1];
      const g = $('l4-star-grid');
      g.style.setProperty('--cols', cols);
      g.innerHTML = grid
        .map((row, i) =>
          row
            .map((v, j) => {
              const isCur = cur && cur.t !== 'nl' && cur.i === i && cur.j === j;
              const cls = v === '*' ? ' is-alloc' : v === ' ' ? ' l4-space' : ' is-dim';
              return `<div class="cell${cls}${isCur ? ' is-hi' : ''}"><span class="cell-val">${v === '*' ? '*' : v === ' ' ? '·' : ''}</span></div>`;
            })
            .join('')
        )
        .join('');
      $('l4-star-out').textContent = out || ' ';
      const two = shape === 'equi' || shape === 'inv';
      const iv = two ? 'i' : 'a';
      const jv = two ? 'j' : 'b';
      if (!cur) {
        C.setLines(pre, L.outer);
        $('l4-star-kv').innerHTML = kv([[iv + '（列）', '—'], [jv + '（欄）', '—'], ['動作', '準備開始']]);
      } else if (cur.t === 'nl') {
        C.setLines(pre, L.nl);
        $('l4-star-kv').innerHTML = kv([[iv + '（列）', cur.i, true], [jv + '（欄）', '內層結束'], ['動作', '印 \\n 換行', true]]);
      } else {
        C.setLines(pre, [L.inner, cur.t === '*' ? L.star : L.space]);
        const extra = two ? [['k', cur.k]] : [];
        $('l4-star-kv').innerHTML = kv([[iv + '（列）', cur.i], [jv + '（欄）', cur.j, true], ['動作', cur.t === '*' ? '印 *' : '印空白', true], ...extra]);
      }
      $('l4-star-next').disabled = pos >= ev.length;
      $('l4-star-fin').disabled = pos >= ev.length;
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
      $('l4-star-play').textContent = '▶ 播放';
      $('l4-star-play').setAttribute('aria-pressed', 'false');
    }
    function play() {
      if (timer) return stop();
      if (pos >= ev.length) pos = 0;
      $('l4-star-play').textContent = '⏸ 暫停';
      $('l4-star-play').setAttribute('aria-pressed', 'true');
      timer = C.every(() => {
        pos++;
        render();
        if (pos >= ev.length) stop();
      }, h > 6 ? 90 : 160);
    }
    C.onSeg(root, 'l4-shape', (v) => {
      shape = v;
      stop();
      build();
      render();
    });
    $('l4-star-h').addEventListener('input', () => {
      stop();
      build();
      render();
    });
    $('l4-star-play').addEventListener('click', play);
    $('l4-star-next').addEventListener('click', () => {
      stop();
      if (pos < ev.length) pos++;
      render();
    });
    $('l4-star-fin').addEventListener('click', () => {
      stop();
      pos = ev.length;
      render();
    });
    $('l4-star-reset').addEventListener('click', () => {
      stop();
      pos = 0;
      render();
    });
    build();
    pos = ev.length;
    render();
  }

  /* ---- Armstrong numbers ---- */
  function mountArm(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l4-arm-code');
    let i = 100;
    let found = [];
    let timer = null;
    const breakdown = (n) => {
      const ds = String(n).split('').map(Number);
      const p = ds.length;
      const sup = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
      const pw = String(p).split('').map((d) => sup[+d]).join('');
      const terms = ds.map((d) => d ** p);
      const sum = terms.reduce((a, b) => a + b, 0);
      return { txt: `${ds.map((d) => d + pw).join(' + ')} = ${terms.join(' + ')} = ${sum}`, sum, ok: sum === n };
    };
    function paintNow(n) {
      const b = breakdown(n);
      $('l4-arm-now').innerHTML = `<span class="l4-armnum${b.ok ? ' is-ok' : ''}">${n}</span><span class="mono">${b.txt}</span> ${b.ok ? '<span class="pill-ok">是水仙花數！</span>' : ''}`;
      const p = Math.round(((n - 100) / 899) * 100);
      $('l4-arm-prog').style.setProperty('--p', p + '%');
      $('l4-arm-prog').textContent = `i = ${n}`;
      $('l4-arm-found').innerHTML = found.length
        ? found.map((f) => `<div class="cell is-ok is-new"><span class="cell-val">${f}</span></div>`).join('')
        : '<span class="muted">（還沒找到）</span>';
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
      $('l4-arm-scan').textContent = i > 999 ? '▶ 重新掃描' : i > 100 ? '▶ 繼續掃描' : '▶ 開始掃描';
      $('l4-arm-scan').setAttribute('aria-pressed', 'false');
    }
    function tick() {
      for (let s = 0; s < 6 && i <= 999; s++, i++) {
        if (breakdown(i).ok) {
          found.push(i);
          paintNow(i);
          C.setLines(pre, [lineOf(ARM, 'if (sum_of_cubes'), lineOf(ARM, 'printf("%d')]);
          i++;
          return;
        }
      }
      C.setLines(pre, [lineOf(ARM, 'units = '), lineOf(ARM, 'sum_of_cubes =')]);
      paintNow(Math.min(i - 1, 999));
      if (i > 999) {
        stop();
        C.setLines(pre, []);
      }
    }
    $('l4-arm-scan').addEventListener('click', () => {
      if (timer) return stop();
      if (i > 999) {
        i = 100;
        found = [];
      }
      $('l4-arm-scan').textContent = '⏸ 暫停';
      $('l4-arm-scan').setAttribute('aria-pressed', 'true');
      tick();
      timer = C.every(tick, 45);
    });
    $('l4-arm-reset').addEventListener('click', () => {
      i = 100;
      found = [];
      stop();
      paintNow(100);
      C.setLines(pre, []);
    });
    function test() {
      const n = parseInt($('l4-arm-test').value, 10);
      const v = $('l4-arm-verdict');
      if (isNaN(n) || n < 0) {
        v.className = 'feedback is-err';
        v.textContent = '請輸入一個正整數。';
        return;
      }
      const b = breakdown(n);
      v.className = 'feedback ' + (b.ok ? 'is-ok' : 'is-err');
      v.innerHTML = `${String(n).length} 位數：<span class="mono">${b.txt}</span>　${b.ok ? `→ ${n} <strong>是</strong> Armstrong 數` : `→ ${b.sum} ≠ ${n}，<strong>不是</strong>`}`;
    }
    $('l4-arm-test').addEventListener('input', test);
    paintNow(100);
    test();
  }

  /* ---- matrix multiplication ---- */
  function mountMat(root) {
    const $ = (id) => C.$('#' + id, root);
    const A0 = [
      [2, 2, 4],
      [3, 2, 2],
    ];
    const B0 = [
      [3, 2],
      [4, 1],
      [2, 8],
    ];
    let A = A0.map((r) => r.slice());
    let B = B0.map((r) => r.slice());
    let sel = { i: 0, j: 1 };
    let steps = [];
    let mode = 'select';
    let cur = null;
    const pre = $('l4-mat-code');
    const mul = () => [0, 1].map((i) => [0, 1].map((j) => A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]));
    function buildSteps() {
      steps = [];
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) {
          let sum = 0;
          for (let k = 0; k < 3; k++) {
            const prev = sum;
            sum += A[i][k] * B[k][j];
            steps.push({ t: 'k', i, j, k, prev, sum });
          }
          steps.push({ t: 'set', i, j, sum });
        }
    }
    function layout() {
      const mat = (name, M, rows, cols, editable) =>
        `<div class="l4-matblock"><div class="l4-matname">${name} <small>${rows}×${cols}</small></div><div class="grid-matrix" style="--cols:${cols}">${M.map((r, i) =>
          r
            .map(
              (v, j) =>
                `<div class="cell" data-m="${name}" data-i="${i}" data-j="${j}">${
                  editable ? `<input type="number" value="${v}" data-m="${name}" data-i="${i}" data-j="${j}" aria-label="${name}[${i}][${j}]">` : ''
                }<span class="cell-sub">[${i}][${j}]</span></div>`
            )
            .join('')
        ).join('')}</div></div>`;
      $('l4-mat-row').innerHTML =
        mat('A', A, 2, 3, true) +
        '<span class="l4-matop">×</span>' +
        mat('B', B, 3, 2, true) +
        '<span class="l4-matop">=</span>' +
        `<div class="l4-matblock"><div class="l4-matname">C <small>2×2</small></div><div class="grid-matrix" style="--cols:2">${[0, 1]
          .map((i) =>
            [0, 1]
              .map(
                (j) =>
                  `<button type="button" class="cell" data-m="C" data-i="${i}" data-j="${j}" aria-label="C[${i}][${j}]"><span class="cell-val" data-cv></span><span class="cell-sub">[${i}][${j}]</span></button>`
              )
              .join('')
          )
          .join('')}</div></div>`;
    }
    function paint() {
      const Cm = mul();
      const cells = C.$$('.l4-matrow .cell', root);
      cells.forEach((el) => el.classList.remove('is-hi', 'is-alloc', 'is-dim'));
      const get = (m, i, j) => cells.find((el) => el.dataset.m === m && +el.dataset.i === i && +el.dataset.j === j);
      const f = $('l4-mat-formula');
      if (mode === 'select') {
        const { i, j } = sel;
        for (let k = 0; k < 3; k++) {
          get('A', i, k).classList.add('is-hi');
          get('B', k, j).classList.add('is-hi');
        }
        get('C', i, j).classList.add('is-hi');
        C.$$('[data-m="C"] [data-cv]', root).forEach((el) => {
          const c = el.closest('.cell');
          el.textContent = Cm[+c.dataset.i][+c.dataset.j];
        });
        f.innerHTML = `<code>C[${i}][${j}]</code> = A 第 ${i} 列 · B 第 ${j} 欄 = ${[0, 1, 2]
          .map((k) => `A[${i}][${k}]×B[${k}][${j}]`)
          .join(' + ')}<br>= ${[0, 1, 2].map((k) => `${A[i][k]}×${B[k][j]}`).join(' + ')} = ${[0, 1, 2]
          .map((k) => A[i][k] * B[k][j])
          .join(' + ')} = <strong>${Cm[i][j]}</strong>`;
        C.setLines(pre, []);
      } else {
        const s = cur;
        const done = new Map();
        for (const st of steps) {
          if (st === s) break;
          if (st.t === 'set') done.set(st.i + ',' + st.j, st.sum);
        }
        if (s.t === 'set') done.set(s.i + ',' + s.j, s.sum);
        C.$$('[data-m="C"] [data-cv]', root).forEach((el) => {
          const c = el.closest('.cell');
          const key = c.dataset.i + ',' + c.dataset.j;
          el.textContent = done.has(key) ? done.get(key) : key === s.i + ',' + s.j ? s.sum : '?';
          if (!done.has(key) && key !== s.i + ',' + s.j) c.classList.add('is-dim');
        });
        for (let k = 0; k < 3; k++) {
          get('A', s.i, k).classList.add('is-alloc');
          get('B', k, s.j).classList.add('is-alloc');
        }
        get('C', s.i, s.j).classList.add('is-hi');
        if (s.t === 'k') {
          get('A', s.i, s.k).classList.add('is-hi');
          get('B', s.k, s.j).classList.add('is-hi');
          f.innerHTML = `i = ${s.i}, j = ${s.j}, k = ${s.k}：<code>sum += A[${s.i}][${s.k}] * B[${s.k}][${s.j}]</code> → sum = ${s.prev} + ${A[s.i][s.k]}×${B[s.k][s.j]} = <strong>${s.sum}</strong>${
            s.k === 0 ? '　<span class="muted">（進入 k 迴圈前先 sum = 0）</span>' : ''
          }`;
          C.setLines(pre, lineOf(MAT, 'sum += A'));
        } else {
          f.innerHTML = `k 迴圈結束：<code>C[${s.i}][${s.j}] = sum</code> = <strong>${s.sum}</strong>`;
          C.setLines(pre, lineOf(MAT, 'C[i][j] = sum'));
        }
      }
    }
    layout();
    buildSteps();
    const st = C.stepper($('l4-mat-step'), {
      count: () => steps.length,
      interval: 1000,
      render(k) {
        if (!steps.length) return;
        cur = steps[k];
        mode = 'step';
        paint();
      },
    });
    st.stop();
    mode = 'select';
    paint();
    $('l4-mat-row').addEventListener('click', (e) => {
      const c = e.target.closest('button.cell[data-m="C"]');
      if (!c) return;
      st.stop();
      mode = 'select';
      sel = { i: +c.dataset.i, j: +c.dataset.j };
      paint();
    });
    $('l4-mat-row').addEventListener('mouseover', (e) => {
      const c = e.target.closest('button.cell[data-m="C"]');
      if (!c || mode !== 'select') return;
      sel = { i: +c.dataset.i, j: +c.dataset.j };
      paint();
    });
    $('l4-mat-row').addEventListener('input', (e) => {
      const inp = e.target.closest('input[data-m]');
      if (!inp) return;
      const v = parseInt(inp.value, 10) || 0;
      (inp.dataset.m === 'A' ? A : B)[+inp.dataset.i][+inp.dataset.j] = v;
      buildSteps();
      if (mode === 'step') {
        mode = 'select';
        st.stop();
      }
      paint();
    });
    $('l4-mat-reset').addEventListener('click', () => {
      A = A0.map((r) => r.slice());
      B = B0.map((r) => r.slice());
      layout();
      buildSteps();
      st.stop();
      mode = 'select';
      sel = { i: 0, j: 1 };
      paint();
    });
  }

  /* ---- while vs do-while ---- */
  function mountWD(root) {
    const $ = (id) => C.$('#' + id, root);
    let s = 3;
    let E1 = [];
    let E2 = [];
    function sim() {
      s = +$('l4-wd-s').value;
      $('l4-wd-s-v').textContent = s;
      $('l4-wd-c1').innerHTML = C.code(whileCode(s), { id: 'l4-wd-p1' });
      $('l4-wd-c2').innerHTML = C.code(doCode(s), { id: 'l4-wd-p2' });
      // while
      E1 = [];
      let a = s;
      let out = '';
      let n = 0;
      E1.push({ line: 1, a, out, n, note: `a = ${s}` });
      for (let g = 0; g < 20; g++) {
        const ok = a < 3;
        E1.push({ line: 2, a, out, n, note: `檢查 ${a} < 3 → ${ok ? '成立' : '不成立，跳出'}` });
        if (!ok) break;
        out += a + ' ';
        n++;
        E1.push({ line: 3, a, out, n, note: `印出 ${a}` });
        a++;
        E1.push({ line: 4, a, out, n, note: `a++ → ${a}` });
      }
      E1.push({ line: 6, a, out: out + `\n結束，a = ${a}`, n, note: '迴圈結束', end: true });
      // do-while
      E2 = [];
      a = s;
      out = '';
      n = 0;
      E2.push({ line: 1, a, out, n, note: `a = ${s}` });
      E2.push({ line: 2, a, out, n, note: '進入 do：不檢查，直接執行！' });
      for (let g = 0; g < 20; g++) {
        out += a + ' ';
        n++;
        E2.push({ line: 3, a, out, n, note: `印出 ${a}` });
        a++;
        E2.push({ line: 4, a, out, n, note: `a++ → ${a}` });
        const ok = a < 3;
        E2.push({ line: 5, a, out, n, note: `檢查 ${a} < 3 → ${ok ? '成立，回到 do' : '不成立，跳出'}` });
        if (!ok) break;
      }
      E2.push({ line: 6, a, out: out + `\n結束，a = ${a}`, n, note: '迴圈結束', end: true });
    }
    function paint(k, E, p, kvId, oId) {
      const e = E[Math.min(k, E.length - 1)];
      C.setLines($(p), e.line);
      $(kvId).innerHTML = kv([
        ['a', e.a],
        ['本體執行次數', e.n, e.end],
        ['目前', e.note],
      ]);
      $(oId).textContent = e.out || ' ';
    }
    sim();
    const st = C.stepper($('l4-wd-step'), {
      count: () => Math.max(E1.length, E2.length),
      interval: 800,
      render(k) {
        paint(k, E1, 'l4-wd-p1', 'l4-wd-k1', 'l4-wd-o1');
        paint(k, E2, 'l4-wd-p2', 'l4-wd-k2', 'l4-wd-o2');
      },
    });
    $('l4-wd-s').addEventListener('input', () => {
      sim();
      st.reset();
    });
  }

  /* ---- n factorial ---- */
  function mountFact(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l4-fact-code');
    let timer = null;
    let rows = [];
    function compute() {
      let n = C.clamp(parseInt($('l4-fact-n').value, 10) || 0, 0, 20);
      const n0 = n;
      let result = 1;
      let big = 1n;
      rows = [];
      let it = 0;
      while (n) {
        it++;
        const before = result;
        result = Math.imul(result, n);
        big *= BigInt(n);
        rows.push({ it, n, before, result, overflow: BigInt(result) !== big, big });
        n--;
      }
      return { n0, result, big, overflow: BigInt(result) !== big };
    }
    function render(upto) {
      const r = compute();
      const shown = rows.slice(0, upto);
      $('l4-fact-rows').innerHTML =
        shown
          .map(
            (w) =>
              `<tr${w.overflow ? ' class="l4-ovf"' : ''}><td class="num">${w.it}</td><td>n = ${w.n} → 繼續</td><td class="mono">${w.before} × ${w.n} = ${w.result}${
                w.overflow ? ' <span class="pill-err">溢位</span>' : ''
              }</td><td>n = ${w.n - 1}</td></tr>`
          )
          .join('') + (upto >= rows.length ? `<tr><td class="num">—</td><td>n = 0 → <strong>停止</strong></td><td colspan="2">while(0) 為假，跳出迴圈</td></tr>` : '');
      const fin = upto >= rows.length;
      $('l4-fact-out').textContent = `Calculate n-factorial: ${r.n0}` + (fin ? `\n${r.result}` : '');
      C.setLines(pre, fin ? lineOf(NFACT, 'printf("%d') : [lineOf(NFACT, 'result = result'), lineOf(NFACT, 'n--')]);
      const note = $('l4-fact-note');
      if (!fin) {
        note.className = 'feedback';
        note.textContent = '';
      } else if (r.overflow) {
        note.className = 'feedback is-err';
        note.innerHTML = `<strong>int 溢位！</strong>真正的 ${r.n0}! = ${r.big.toString()}，超過 int 上限 2,147,483,647，結果「繞回」變成 ${r.result}。int 最多只能正確算到 12!。`;
      } else {
        note.className = 'feedback is-ok';
        note.innerHTML = r.n0 === 0 ? '<code>while(n)</code> 在 n = 0 時一開始就不成立，迴圈一次都不執行，所以 0! = 1。' : `${r.n0}! = ${r.result}，共執行 ${rows.length} 圈。`;
      }
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
    }
    $('l4-fact-n').addEventListener('input', () => {
      stop();
      render(Infinity);
    });
    root.querySelectorAll('#l4-fact [data-n]').forEach((b) =>
      b.addEventListener('click', () => {
        $('l4-fact-n').value = b.dataset.n;
        stop();
        render(Infinity);
      })
    );
    $('l4-fact-play').addEventListener('click', () => {
      stop();
      compute();
      let k = 0;
      render(0);
      timer = C.every(() => {
        k++;
        render(k);
        if (k > rows.length) stop();
      }, 600);
    });
    render(Infinity);
  }

  /* ---- positional notation ---- */
  function mountPos(root) {
    const $ = (id) => C.$('#' + id, root);
    let dir = 'fwd';
    let E = [];
    let pre;
    let n0 = 2546;
    function sim() {
      n0 = C.clamp(parseInt($('l4-pos-n').value, 10) || 0, 0, 999999999);
      const src = dir === 'fwd' ? POS : POS_REV;
      $('l4-pos-code').innerHTML = C.code(src, { id: 'l4-pos-pre' });
      pre = $('l4-pos-pre');
      E = [];
      const head = `The number can also be represented as: `;
      let out = '';
      if (dir === 'fwd') {
        $('l4-pos-head').innerHTML = '<tr><th>num</th><th>num % 10</th><th>i</th><th>印出</th></tr>';
        let num = n0;
        let i = 1;
        E.push({ line: lineOf(src, 'i = 1;'), rows: [], out, note: 'i = 1' });
        const rows = [];
        while (num) {
          const d = num % 10;
          let piece;
          if (Math.trunc(num / 10) !== 0) {
            piece = `${d}*${i} + `;
            rows.push([num, d, i, piece]);
            out += piece;
            E.push({ line: lineOf(src, 'printf("%d*%d + "'), rows: rows.slice(), out });
            num = Math.trunc(num / 10);
            i *= 10;
          } else {
            piece = `${d}*${i}\\n`;
            rows.push([num, d, i, piece]);
            out += `${d}*${i}\n`;
            E.push({ line: lineOf(src, 'printf("%d*%d\\n"'), rows: rows.slice(), out });
            num = Math.trunc(num / 10);
          }
        }
        E.push({ line: lineOf(src, 'return 0'), rows: rows.slice(), out, end: true });
      } else {
        $('l4-pos-head').innerHTML = '<tr><th>num</th><th>div</th><th>num / div</th><th>印出</th></tr>';
        let num = n0;
        let div = 1;
        while (Math.trunc(num / div) >= 10) div *= 10;
        E.push({ line: lineOf(src, 'div = div * 10'), rows: [], out, note: `找到最高位的位值 div = ${div}` });
        const rows = [];
        while (div) {
          const q = Math.trunc(num / div);
          const piece = div !== 1 ? `${q}*${div} + ` : `${q}*${div}\\n`;
          rows.push([num, div, q, piece]);
          out += div !== 1 ? piece : `${q}*${div}\n`;
          E.push({ line: div !== 1 ? lineOf(src, 'printf("%d*%d + "') : lineOf(src, 'printf("%d*%d\\n"'), rows: rows.slice(), out });
          num = num % div;
          div = Math.trunc(div / 10);
        }
        E.push({ line: lineOf(src, 'return 0'), rows: rows.slice(), out, end: true });
      }
      E.forEach((e) => (e.out = `Enter a number: ${n0}\n${head}` + e.out));
    }
    sim();
    const st = C.stepper($('l4-pos-step'), {
      count: () => E.length,
      interval: 900,
      render(k) {
        const e = E[k];
        C.setLines(pre, e.line);
        $('l4-pos-rows').innerHTML =
          e.rows.map((r, idx) => `<tr${idx === e.rows.length - 1 && !e.end ? ' class="is-hi"' : ''}>${r.map((c) => `<td class="mono">${c}</td>`).join('')}</tr>`).join('') ||
          `<tr><td colspan="4" class="muted">${e.note || (n0 === 0 ? 'num = 0：while(num) 一開始就不成立' : '')}</td></tr>`;
        $('l4-pos-out').textContent = e.out;
      },
    });
    const refresh = () => {
      sim();
      st.stop();
      st.go(E.length - 1);
    };
    $('l4-pos-n').addEventListener('input', refresh);
    C.onSeg(root, 'l4-posdir', (v) => {
      dir = v;
      refresh();
    });
    refresh();
  }

  /* ---- ATM ---- */
  function mountAtm(root) {
    const $ = (id) => C.$('#' + id, root);
    const con = $('l4-atm-con');
    const inp = $('l4-atm-in');
    let segs = [];
    let gen = null;
    let finished = false;
    function draw() {
      con.innerHTML = segs.map((s) => (s.cls ? `<span class="${s.cls}">${C.esc(s.t)}</span>` : C.esc(s.t))).join('') + (finished ? '' : '<span class="cursor"></span>');
      con.scrollTop = con.scrollHeight;
    }
    const out = (t, cls) => {
      segs.push({ t, cls });
    };
    function* program() {
      let balance = 20000;
      let choice = 0;
      const correct_pin = 2025;
      let entered_pin;
      let is_password_correct = 0;
      let amt;
      while (choice !== 4) {
        out('\n*** 歡迎使用簡易 ATM ***\n1. 查詢餘額\n2. 提款\n3. 存款\n4. 退出\n請選擇服務項目 (1-4): ');
        choice = yield;
        out('--------------------\n');
        if (choice === 1) out(C.printf('您的帳戶餘額為: %d 元\n', balance));
        else if (choice === 2) {
          for (let i = 0; i < 3; i++) {
            out('請輸入密碼: ');
            entered_pin = yield;
            if (entered_pin === correct_pin) {
              is_password_correct = 1;
              out('密碼正確！\n');
              break;
            } else if (i < 2) out(C.printf('密碼錯誤，您還有 %d 次機會。\n', 2 - i));
          }
          if (is_password_correct) {
            is_password_correct = 0;
            out('請輸入提款金額: ');
            amt = yield;
            if (amt <= balance && amt > 0) {
              balance -= amt;
              out(C.printf('提款成功，您的餘額為: %d 元\n', balance));
            } else out('提款失敗，餘額不足或金額無效。\n');
          } else out('密碼錯誤次數過多，交易取消。\n');
        } else if (choice === 3) {
          out('請輸入存款金額: ');
          amt = yield;
          if (amt > 0) {
            balance += amt;
            out(C.printf('存款成功，您的餘額為: %d 元\n', balance));
          } else out('存款金額必須大於 0。\n');
        } else if (choice === 4) out('感謝您的使用，再見！\n');
        else out('無效的選項，請重新輸入。\n');
        out('--------------------\n');
      }
      return 0;
    }
    function advance(v) {
      const r = gen.next(v);
      if (r.done) {
        finished = true;
        out('\n[程式結束：main 回傳 0。按「重新開機」再玩一次]', 'dim');
        inp.disabled = true;
        $('l4-atm-send').disabled = true;
      }
      draw();
    }
    function boot() {
      segs = [];
      finished = false;
      inp.disabled = false;
      $('l4-atm-send').disabled = false;
      inp.value = '';
      gen = program();
      gen.next();
      draw();
    }
    function submit(raw) {
      if (finished) return;
      raw = String(raw);
      out(raw + '\n', 'in');
      const m = raw.trim().match(/^[+-]?\d+/);
      if (!m) {
        out('（scanf("%d") 讀不到整數！真正的程式會因為這些字元一直卡在緩衝區而陷入無限迴圈，這裡先幫你忽略，請重新輸入數字）\n', 'err');
        draw();
        return;
      }
      advance(parseInt(m[0], 10));
    }
    $('l4-atm-send').addEventListener('click', () => {
      submit(inp.value);
      inp.value = '';
      inp.focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit(inp.value);
        inp.value = '';
      }
    });
    root.querySelectorAll('#l4-atm [data-atm]').forEach((b) => b.addEventListener('click', () => submit(b.dataset.atm)));
    $('l4-atm-reboot').addEventListener('click', boot);
    boot();
  }

  /* ---- format builder ---- */
  function mountFmt(root) {
    const $ = (id) => C.$('#' + id, root);
    const flags = new Set();
    let spec = 'f';
    function render() {
      const w = +$('l4-fmt-w').value;
      const p = +$('l4-fmt-p').value;
      $('l4-fmt-w-v').textContent = w === 0 ? '無' : w;
      $('l4-fmt-p-v').textContent = p < 0 ? '無' : p;
      const order = ['-', '+', ' ', '0', '#'];
      const fl = order.filter((f) => flags.has(f)).join('');
      const fmt = `%${fl}${w > 0 ? w : ''}${p >= 0 ? '.' + p : ''}${spec}`;
      let raw = $('l4-fmt-val').value.trim();
      let val = parseFloat(raw);
      const notes = [];
      if (isNaN(val)) {
        val = 0;
        notes.push('<span class="pill-err">數值無法解析，先用 0 代替</span>');
      }
      const intSpec = spec === 'd' || spec === 'x' || spec === 'o';
      let arg = val;
      if (intSpec && !Number.isInteger(val)) {
        arg = Math.trunc(val);
        notes.push(`<span class="pill-info">%${spec} 需要整數：這裡先把 ${val} 轉成 ${arg}（真正的 C 中把 double 直接傳給 %${spec} 是未定義行為，要先寫 (int) 轉型）</span>`);
      }
      const argTxt = intSpec ? String(arg) : raw || '0';
      const res = C.printf(fmt + '~', arg);
      $('l4-fmt-code').innerHTML = C.code(`printf("${fmt}~", ${argTxt});`, { cls: 'code--plain' });
      $('l4-fmt-cells').innerHTML = charCells(res, { markLast: true }) + `<p class="caption">共輸出 ${res.length - 1} 個字元（不含 ~）${w > 0 ? `，寬度設定為 ${w}` : ''}</p>`;
      if (flags.has('-')) notes.push('<strong>-</strong>：靠左對齊，空白補在右邊');
      if (flags.has('0')) {
        if (flags.has('-')) notes.push('<strong>0</strong>：和 - 同時出現時會被忽略（靠左就不能在左邊補 0）');
        else if (intSpec && p >= 0) notes.push('<strong>0</strong>：整數有指定精度時 0 旗標被忽略');
        else notes.push('<strong>0</strong>：用 0 取代左邊的空白補滿寬度');
      }
      if (flags.has('+')) notes.push('<strong>+</strong>：正數也顯示 + 號');
      if (flags.has(' ')) notes.push(flags.has('+') ? '<strong>空白</strong>：和 + 同時出現時被忽略' : '<strong>空白</strong>：正數前面空一格，讓正負數對齊');
      if (flags.has('#')) notes.push(spec === 'x' ? '<strong>#</strong>：16 進位前加 0x' : spec === 'o' ? '<strong>#</strong>：8 進位前加 0' : '<strong>#</strong>：強制顯示小數點（精度 0 時看得出差別）');
      const natural = C.printf(`%${fl}${p >= 0 ? '.' + p : ''}${spec}`, arg).length;
      if (w > 0)
        notes.push(
          natural >= w
            ? `<strong>寬度 ${w}</strong>：內容本身就有 ${natural} 個字元，${natural > w ? '比寬度長，<strong>不會被截斷</strong>' : '剛好填滿'}`
            : `<strong>寬度 ${w}</strong>：內容 ${natural} 個字元，不足的 ${w - natural} 格補${flags.has('0') && !flags.has('-') && !(intSpec && p >= 0) ? ' 0' : '空白'}`
        );
      if (p >= 0) notes.push(intSpec ? `<strong>精度 .${p}</strong>：整數最少顯示 ${p} 位，不足補 0` : `<strong>精度 .${p}</strong>：小數點後 ${p} 位（四捨五入）`);
      else if (!intSpec) notes.push('<strong>沒有指定精度</strong>：浮點數預設 6 位小數');
      $('l4-fmt-notes').innerHTML = notes.map((n) => `<li>${n}</li>`).join('');
    }
    root.querySelectorAll('#l4-fmt [data-flag]').forEach((b) =>
      b.addEventListener('click', () => {
        const f = b.dataset.flag === 'sp' ? ' ' : b.dataset.flag;
        if (flags.has(f)) flags.delete(f);
        else flags.add(f);
        b.setAttribute('aria-pressed', String(flags.has(f)));
        render();
      })
    );
    ['l4-fmt-w', 'l4-fmt-p', 'l4-fmt-val'].forEach((id) => $(id).addEventListener('input', render));
    C.onSeg(root, 'l4-fmtspec', (v) => {
      spec = v;
      render();
    });
    render();
  }

  /* ---- test_width ---- */
  function mountTW(root) {
    const $ = (id) => C.$('#' + id, root);
    const pre = $('l4-tw-code');
    const lines = TEST_WIDTH.split('\n');
    const N = 1699.999;
    const calls = [];
    lines.forEach((l, k) => {
      const m = l.match(/printf\("([^"]*)\\n", ([^)]+)\)/);
      if (m) calls.push({ line: k + 1, fmt: m[1], arg: m[2].trim() === 'NUMBER' ? N : parseFloat(m[2]) });
    });
    let timer = null;
    let shown = 0;
    function draw() {
      $('l4-tw-out').textContent = calls
        .slice(0, shown)
        .map((c) => C.printf(c.fmt, c.arg))
        .join('\n');
      C.setLines(pre, shown > 0 && shown <= calls.length ? calls[shown - 1].line : []);
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
      $('l4-tw-run').textContent = '▶ 執行 test_width()';
    }
    $('l4-tw-run').addEventListener('click', () => {
      if (timer) return stop();
      if (shown >= calls.length) shown = 0;
      $('l4-tw-run').textContent = '⏸ 暫停';
      const tick = () => {
        shown++;
        draw();
        if (shown >= calls.length) stop();
      };
      tick();
      timer = C.every(tick, 450);
    });
    $('l4-tw-all').addEventListener('click', () => {
      stop();
      shown = calls.length;
      draw();
    });
    $('l4-tw-clear').addEventListener('click', () => {
      stop();
      shown = 0;
      draw();
    });
    draw();
  }

  /* ---- %*.*f ---- */
  function mountSP(root) {
    const $ = (id) => C.$('#' + id, root);
    function render() {
      const w = +$('l4-sp-w').value;
      const p = +$('l4-sp-p').value;
      $('l4-sp-w-v').textContent = w;
      $('l4-sp-p-v').textContent = p;
      $('l4-sp-code').innerHTML = C.code(String.raw`double rate = 123.45;
int width = ${w}, precision = ${p};   // 使用者輸入的值
printf("rate: '%*.*f'\n", width, precision, rate);   // 等同於 "%${w}.${p}f"`);
      const s = C.printf("rate: '%*.*f'", w, p, 123.45);
      $('l4-sp-out').textContent = `Enter a width and a precision: ${w} ${p}\n${s}`;
      $('l4-sp-cells').innerHTML = charCells(C.printf('%*.*f', w, p, 123.45));
    }
    ['l4-sp-w', 'l4-sp-p'].forEach((id) => $(id).addEventListener('input', render));
    render();
  }

  /* =========================================================
     Register
     ========================================================= */
  C.register({
    id: 'l4',
    order: 4,
    num: '04',
    title: '迴圈與二維陣列',
    en: 'Loops, Nested Loops, and 2D Arrays',
    lede: '電腦最擅長的就是「重複」。這一講學會 for、while、do...while 三種迴圈，用巢狀迴圈畫出圖案、用二維陣列做矩陣乘法，最後把 printf 的寬度、精度與旗標一次弄懂。',
    desc: '賦值與 ++/-- 運算子、三種迴圈、巢狀迴圈畫圖、矩陣乘法與 printf 格式化輸出。',
    tags: ['for / while', '巢狀迴圈', '矩陣乘法', 'printf 格式'],
    objectives: [
      '賦值運算子與遞增／遞減運算子的用法',
      'for、while、do...while 三種迴圈的語法與差異',
      '如何用巢狀迴圈畫出正方形、三角形等圖案',
      '如何用二維陣列處理矩陣乘法，以及 printf 格式化輸出的細節',
    ],
    sections,
    recap: [
      'for 迴圈把控制變數初始值、條件、遞增全部寫在一行，適合已知次數的重複',
      'while 先檢查條件再執行；do...while 先執行一次才檢查條件',
      '巢狀迴圈＝迴圈中還有迴圈，常用來處理二維圖形或二維陣列',
      'printf 的旗標、寬度、精度可以精準控制輸出格式',
    ],
    practice: '把巢狀迴圈的正三角形改寫成倒三角形。（可以在「星星圖案產生器」切換到「倒三角形〔練習〕」對照參考解答，但先自己試試看！）',
    css: `
.l4-steps{margin:var(--s3) 0;padding-left:1.4em;font-size:.92rem;line-height:1.8}
.l4-steps li{margin:2px 0}
.l4-sub{margin:var(--s4) 0 var(--s2);font-size:.95rem}
.l4-anat-line{font-family:var(--font-mono);font-size:1.1rem;font-weight:700;line-height:2.4;padding:var(--s3) var(--s4);background:var(--code-bg);color:var(--code-ink);border-radius:var(--r-sm);overflow-x:auto;white-space:normal}
.l4-part{font:inherit;color:inherit;background:color-mix(in srgb,var(--code-ink) 10%,transparent);border:1.5px dashed color-mix(in srgb,var(--code-ink) 40%,transparent);border-radius:6px;padding:2px 8px;cursor:pointer}
.l4-part:hover{border-color:var(--accent-2)}
.l4-part[aria-pressed="true"]{background:var(--hi);color:var(--ink);border-style:solid;border-color:var(--accent-2)}
.l4-anat-labels{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s2)}
.l4-anat-labels span{font-size:.78rem;color:var(--muted);padding:1px 8px;border:1px solid var(--line);border-radius:99px}
.l4-ascii .cell{min-width:40px;min-height:44px;padding:2px 4px}
.l4-stargrid .cell{min-width:28px;min-height:28px;padding:0;font-size:.95rem}
.l4-stargrid{gap:3px}
.l4-star-wrap{overflow-x:auto;padding:4px 2px}
.l4-part{white-space:nowrap}
.l4-stargrid{grid-template-columns:repeat(var(--cols),minmax(0,28px));max-width:100%}
.l4-stargrid .cell{min-width:0;min-height:0;width:auto;aspect-ratio:1/1}
@media (max-width:899.98px){
  .l4-anat-line{font-size:.95rem;line-height:2.7;padding:var(--s2) var(--s3)}
  .l4-stargrid{gap:2px}
  .l4-stargrid .cell{font-size:clamp(.55rem,3.2vw,.95rem);border-radius:4px}
}
.l4-space .cell-val{color:var(--muted)}
.l4-armnow{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s3);min-height:3rem;margin-bottom:var(--s3)}
.l4-armnum{font-family:var(--font-mono);font-size:2rem;font-weight:700;color:var(--ink)}
.l4-armnum.is-ok{color:var(--ok)}
.l4-matrow{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s3)}
.l4-matblock{display:flex;flex-direction:column;gap:4px}
.l4-matname{font-family:var(--font-mono);font-weight:700;color:var(--ink-2)}
.l4-matname small{font-weight:400;color:var(--muted)}
.l4-matop{font-family:var(--font-mono);font-size:1.4rem;font-weight:700;color:var(--muted)}
.l4-matrow .cell input{width:3.4em;min-height:30px;padding:2px 4px;text-align:center;font-weight:700}
.l4-matrow .cell{padding:3px}
.l4-matrow button.cell .cell-val{font-size:1.15rem}
.l4-formula{line-height:1.9}
.l4-details{margin-top:var(--s4)}
.l4-details summary{cursor:pointer;font-weight:700;color:var(--accent)}
.l4-ovf>*{background:color-mix(in srgb,var(--err) 8%,transparent)}
.l4-atm-con{max-height:360px;min-height:220px;overflow-y:auto}
#l4-atm-in{flex:1 1 180px}
.l4-outcells .cell{min-width:30px;min-height:46px;padding:2px 3px}
.l4-outcells .cell.l4-tilde{opacity:.55;border-style:dashed}
.l4-fmt-out{overflow-x:auto}
.l4-cycle .flow-node{min-width:72px}
.table tbody tr.is-hi>*{background:var(--hi);color:var(--ink);font-weight:700}
`,
    mount(root) {
      mountAsg(root);
      mountInc(root);
      mountAnat(root);
      mountForRun(root);
      mountAscii(root);
      mountStar(root);
      mountArm(root);
      mountMat(root);
      mountWD(root);
      mountFact(root);
      mountPos(root);
      mountAtm(root);
      mountFmt(root);
      mountTW(root);
      mountSP(root);
    },
  });
})();
