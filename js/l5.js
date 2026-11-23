/* =========================================================
   l5.js — Lecture 05：字元、字串、檔案與亂數
   Character/String Functions, File I/O, and Randomization
   ========================================================= */
(function () {
  'use strict';
  const esc = C.esc;

  /* ---------- character helpers (C locale, ASCII) ---------- */
  const SHOW = { '\n': '\\n', '\0': '\\0', '\t': '\\t', ' ': '␠', '\r': '\\r' };
  const vis = (ch) => SHOW[ch] || ch;
  const cc = (ch) => (ch === '\0' ? 0 : ch.charCodeAt(0));
  const isupper = (c) => c >= 'A' && c <= 'Z' && c.length === 1;
  const islower = (c) => c >= 'a' && c <= 'z' && c.length === 1;
  const isalpha = (c) => isupper(c) || islower(c);
  const isdigit = (c) => c >= '0' && c <= '9' && c.length === 1;
  const isalnum = (c) => isalpha(c) || isdigit(c);
  const isspace = (c) => c.length === 1 && ' \t\n\v\f\r'.includes(c);
  const ispunct = (c) => {
    const k = cc(c);
    return k > 32 && k < 127 && !isalnum(c);
  };
  const toupper = (c) => (islower(c) ? c.toUpperCase() : c);
  const tolower = (c) => (isupper(c) ? c.toLowerCase() : c);
  const slen = (arr) => {
    let i = 0;
    while (i < arr.length && arr[i] !== '\0') i++;
    return i;
  };
  const sval = (arr) => arr.slice(0, slen(arr)).join('');

  /** one memory/char cell; tag 'button' makes it clickable */
  function cellHtml(ch, idx, cls, attrs) {
    const nul = ch === '\0';
    const tag = attrs ? 'button' : 'div';
    const k = ch === '?' && /is-dim/.test(cls || '') ? '?' : cc(ch);
    return `<${tag} class="cell${nul ? ' is-null' : ''}${cls ? ' ' + cls : ''}"${
      attrs ? ' type="button" ' + attrs : ''
    }><span class="cell-idx">[${idx}]</span><span class="cell-val">${esc(vis(ch))}</span><span class="cell-sub">${k}</span></${tag}>`;
  }
  const emptyCells = (t) => `<span class="l5-empty">${t || '（空）'}</span>`;

  /* ---------- MSVC-style rand() ---------- */
  function makeRand() {
    let s = 1; // without srand(), C behaves as if srand(1)
    return {
      srand(x) {
        s = Number(x) >>> 0;
      },
      rand() {
        s = (Math.imul(s, 214013) + 2531011) >>> 0;
        return (s >>> 16) & 0x7fff;
      },
      get state() {
        return s;
      },
    };
  }

  /* =========================================================
     Source code (from the course gist)
     ========================================================= */
  const SRC_CHARFN = String.raw`#include <stdio.h>
#include <ctype.h>
int main()
{
    char ch;
    printf("Please type anything: ");
    while((ch = getchar()) != '\n'){
        if(isalpha(ch))
            printf("%c is an alphabet.\n", ch);
        else if(isdigit(ch))
            printf("%c is a number.\n", ch);
        else if(isspace(ch))
            printf("%c is a space.\n", ch);
        else if(ispunct(ch))
            printf("%c is punctuation.\n", ch);
    }
    return 0;
}`;

  const SRC_STRFN = String.raw`#include <stdio.h>
#include <string.h>

int main()
{
    char str1[] = "Hello CCU!";
    char str2[25] = {'L', 'o', 'v', 'e', ' ', 'C', 'C', 'U', '\0'};
    char input_str[10];
    printf("Type a string: ");
    scanf("%9s", input_str);
    printf("Input string: %s, length: %zu\n", input_str, strlen(input_str));
    printf("str1: %s, length: %zu\n", str1, strlen(str1));
    printf("str2: %s, length: %zu\n", str2, strlen(str2));

    strcpy(str1, str2);
    printf("\nstr1 (after copy): %s\n", str1);

    strcat(str2, " Math");
    printf("Concatenate string: %s, length: %zu\n", str2, strlen(str2));

    printf("%d\n", strcmp(str1, str2));
    strcpy(str2, str1);
    printf("%d\n", strcmp(str1, str2));

    printf("%c: %d\n", str2[0], str2[0]);
    printf("%c: %d\n", str2[5], str2[5]);
    return 0;
}`;

  const srcCmp = (mode) =>
    String.raw`#include <stdio.h>
#include <string.h>

int main()
{
    char input[100];
    puts("請輸入 yes 或 no：");
    ` +
    (mode === 'scanf' ? String.raw`scanf("%s", input);              // 改用 scanf` : String.raw`fgets(input, sizeof(input), stdin);`) +
    String.raw`
    input[strcspn(input, "\n")] = 0; //去除換行符號
    if (strcmp(input, "yes") == 0) {
        puts("你選擇了 yes!");
    } else if (strcmp(input, "no") == 0) {
        puts("你選擇了 no!");
    } else {
        puts("輸入不正確，只能輸入 yes 或 no。");
    }
    return 0;
}`;

  const srcFile = (n) => String.raw`#include <stdio.h>
int main(){
    FILE *file = fopen("example.txt", "r");
    if (file == NULL) {
        printf("Fail to open the file!\n");
        return 1;
    }
    char line[${n}];
    while (fgets(line, sizeof(line), file) != NULL){
        printf("%s", line);
    }
    fclose(file);
    return 0;
}`;

  const SRC_RANDNUM = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main()
{
    int num;
    srand(time(NULL));
    for(int i = 0; i < 5; i++){
        num = rand()%10 + 1;      // Random alphabet 版：rand()%26 + 97
        printf("%d\n", num);
    }
    return 0;
}`;

  const SRC_PW = String.raw`#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main() {
    char password[100];
    int hasUpper = 0, hasLower = 0, hasDigit = 0, hasSpecial = 0;
    int i;
    while(1){
        printf("Please enter a password: ");
        fgets(password, sizeof(password), stdin);
        password[strcspn(password, "\n")] = 0;  // 去除換行

        for (i = 0; i < strlen(password); i++) {
            if (isupper(password[i])) hasUpper = 1;
            else if (islower(password[i])) hasLower = 1;
            else if (isdigit(password[i])) hasDigit = 1;
            else if (ispunct(password[i])) hasSpecial = 1;
        }

        if(!hasUpper)
            printf("- Missing uppercase letters\n");
        if(!hasLower)
            printf("- Missing lowercase letters\n");
        if(!hasDigit)
            printf("- Missing numbers\n");
        if(!hasSpecial)
            printf("- Missing special characters\n");

        if(hasUpper && hasLower && hasDigit && hasSpecial){
            printf("Your password is secure.\n");
            break;
        }
        else {
            printf("Password requirements not met. Please try again.\n");
            hasUpper = 0;
            hasLower = 0;
            hasDigit = 0;
            hasSpecial = 0;
        }
    }
    return 0;
}`;

  const SRC_MAZE = String.raw`int check_position(int x, int y){
    if(map[x][y] == '*'){
        print_map(x, y);
        printf("撞到牆啦！Game Over.\n");
        return 0;
    }
    else if(map[x][y] == 'E'){
        print_map(x, y);
        printf("恭喜抵達終點！\n");
        return 0;
    }
    else
        return 1;
}

/* main() 裡的遊戲迴圈（節錄） */
while(1){
    print_map(px, py);
    printf("請用 W(上)A(左)S(下)D(右) 控制移動\n");
    move = _getch();
    nx = px;
    ny = py;
    if(move=='W' || move=='w') nx--;
    else if(move=='S' || move=='s') nx++;
    else if(move=='A' || move=='a') ny--;
    else if(move=='D' || move=='d') ny++;
    else continue; // 非法按鍵忽略

    if(check_position(nx, ny) == 1){
        px = nx;
        py = ny;
    }
    else
        break;
}`;

  const MAP_DEFAULT = [
    '*********',
    'S       *',
    '* *** * *',
    '*   * * *',
    '*** * ***',
    '*   *   *',
    '** ***  *',
    '*       *',
    '*******E*',
  ].join('\n');

  const DEFAULT_FILE = 'Hello CCU!\nThis is example.txt.\nC programming is fun, and fgets reads one line at a time.\n';

  /* =========================================================
     Section HTML
     ========================================================= */
  function secGetchar() {
    return C.section(
      'l5-getchar',
      '01',
      'getchar() 與 putchar()',
      C.prose(`
<p><code>getchar()</code> 從<strong>標準輸入</strong>（通常是鍵盤）讀取<strong>一個字元</strong>，回傳它的編碼；<code>putchar(c)</code> 則輸出一個字元。看起來很單純，但有個關鍵角色：<strong>字元緩衝區（buffer）</strong>。</p>
<p>你在鍵盤上打字時，作業系統<mark>不會</mark>馬上把字元交給程式，而是先存在緩衝區裡；直到按下 <kbd>Enter</kbd>，才把<strong>整行字（連同換行字元 <code>'\\n'</code>）一次送出</strong>。之後每呼叫一次 <code>getchar()</code>，就從這條「輸入流」的最前面拿走一個字元。</p>`) +
        C.widget({
          id: 'l5-gc',
          title: '鍵盤緩衝區：getchar() 一次拿一個字元',
          tag: '逐步動畫',
          hint: '在「鍵盤」輸入框打幾個字（例如 Hi 5!），觀察字元先堆在緩衝區；按 Enter 之後，課堂範例 Char function 的 while 迴圈才開始一個一個讀。',
          body: `<div class="widget-split">
  ${C.code(SRC_CHARFN, { id: 'l5-gc-code' })}
  <div>
    <label class="field l5-wide"><span>你的鍵盤（打字後按 Enter 送出）</span><input type="text" id="l5-gc-kb" maxlength="20" placeholder="例如：Hi 5!" autocomplete="off" spellcheck="false"></label>
    <p class="l5-label">① 鍵盤緩衝區：作業系統暫存中，程式還拿不到</p>
    <div class="cells cells--tight" id="l5-gc-buf"></div>
    <p class="l5-label">② stdin 輸入流：按下 Enter 後一次送給程式，getchar() 從最前面取</p>
    <div class="cells cells--tight" id="l5-gc-stream"></div>
    <dl class="kv"><div><dt>getchar() 呼叫次數</dt><dd id="l5-gc-calls">0</dd></div><div class="is-hi"><dt>最近一次回傳</dt><dd id="l5-gc-last">—</dd></div></dl>
    <p class="feedback is-info" id="l5-gc-status"></p>
    <div class="console" data-title="程式輸出" id="l5-gc-out"></div>
  </div>
</div>`,
          controls: `<button type="button" class="btn btn--primary" id="l5-gc-enter">按下 Enter ⏎</button>
<button type="button" class="btn" id="l5-gc-reset">⟲ 重新執行程式</button>`,
        }) +
        `<h3>getchar() 和 scanf() 比較</h3>` +
        C.cards([
          {
            num: 'A',
            title: 'getchar()',
            body: `<p>每次只讀<strong>一個字元</strong>，<strong>包含換行符</strong>。適合逐字元輸入，例如單一選擇或需要精確監控每個鍵入時；不適合讀入整行或字串。</p>`,
          },
          {
            num: 'B',
            title: 'scanf()',
            body: `<p>依格式指定字讀整數、浮點數、字串等結構化資料。<strong>遇到空格、換行或 Tab 會提前結束字串讀取</strong>，不適合讀含空格的整句話；讀入數值與字元時要小心緩衝區殘留的 <code>'\\n'</code> 影響後續輸入。</p>`,
          },
        ])
    );
  }

  function secCtype() {
    return C.section(
      'l5-ctype',
      '02',
      '常用的字元函數（ctype.h）',
      C.prose(`
<p>引入 <code>#include &lt;ctype.h&gt;</code> 之後，就能用一組現成的函數判斷或轉換「單一字元」。判斷類函數在條件成立時回傳<strong>非 0（真）</strong>、不成立回傳 <strong>0（假）</strong>；轉換類函數回傳轉換後的字元，不是字母就原樣回傳。</p>
<ul>
<li><code>isalpha(c)</code> 字母、<code>isdigit(c)</code> 數字、<code>isalnum(c)</code> 字母或數字</li>
<li><code>isspace(c)</code> 空白（space、tab、換行…）、<code>ispunct(c)</code> 標點符號</li>
<li><code>isupper(c)</code> / <code>islower(c)</code> 大寫／小寫字母、<code>toupper(c)</code> / <code>tolower(c)</code> 轉大寫／小寫</li>
</ul>`) +
        C.widget({
          id: 'l5-ct',
          title: '字元分類器：每個 ctype 函數怎麼看你的字',
          tag: '互動',
          hint: '輸入任意文字，表格會列出每個字元在各函數下的結果；點左欄的函數名稱可以高亮那一列並看說明。',
          body: `<label class="field l5-wide"><span>要分類的文字（最多 16 個字元）</span><input type="text" id="l5-ct-in" value="Hi, C99!" maxlength="16" autocomplete="off" spellcheck="false"></label>
<div id="l5-ct-table"></div>
<p class="feedback is-info" id="l5-ct-fb"></p>`,
          controls: `<span class="muted">試試看：</span>
<button type="button" class="btn btn--sm" data-preset="Hello, CCU 2025!">Hello, CCU 2025!</button>
<button type="button" class="btn btn--sm" data-preset="a1 B2#_">a1 B2#_</button>
<button type="button" class="btn btn--sm" data-preset="(x+y)*3=z">(x+y)*3=z</button>`,
        })
    );
  }

  function secString() {
    return C.section(
      'l5-string',
      '03',
      '常用的字串函式（string.h）',
      C.prose(`
<p>C 沒有原生的字串型態，字串就是<strong>以 <code>'\\0'</code> 結尾的字元陣列</strong>。<code>#include &lt;string.h&gt;</code> 提供的函式，全都是靠「一路走到 <code>'\\0'</code> 為止」來運作：</p>
<ul>
<li><code>strlen(str)</code>：計算字串長度（不含 <code>'\\0'</code>）</li>
<li><code>strcpy(str1, str2)</code>：把 str2 複製到 str1</li>
<li><code>strcat(str1, str2)</code>：把 str2 串接到 str1 後面</li>
<li><code>strcmp(str1, str2)</code>：依 ASCII 碼逐字元比較。str1 排在前面回傳<strong>負值</strong>、<mark>相同回傳 0（要特別記住！）</mark>、排在後面回傳<strong>正值</strong></li>
</ul>
<p>這些函式<strong>不會檢查目的陣列夠不夠大</strong>——空間不足時照樣往後寫，這就是惡名昭彰的緩衝區溢位。</p>`) +
        C.widget({
          id: 'l5-s',
          title: '字串函式實驗室：看每個位元組怎麼變',
          tag: '互動',
          hint: '按下方按鈕執行字串函式；格子會逐格動畫。點任何一格，會像 printf("%c: %d\\n", str[i], str[i]) 一樣印出字元和它的 ASCII 碼。',
          body: `<div class="row">
  <label class="field"><span>char str1[] = "…"（自動決定大小）</span><input type="text" id="l5-s-in1" value="Hello CCU!" maxlength="24" autocomplete="off" spellcheck="false"></label>
  <label class="field"><span>char str2[25] = "…"</span><input type="text" id="l5-s-in2" value="Love CCU" maxlength="24" autocomplete="off" spellcheck="false"></label>
</div>
<div class="l5-arr"><div class="l5-arr-head"><strong>str1</strong><code id="l5-s-declA"></code></div><div class="cells cells--tight" id="l5-s-a"></div></div>
<div class="l5-arr"><div class="l5-arr-head"><strong>str2</strong><code id="l5-s-declB"></code></div><div class="cells cells--tight" id="l5-s-b"></div></div>
<p class="feedback is-info" id="l5-s-fb"></p>
<div class="console" data-title="printf 輸出" id="l5-s-out"></div>`,
          controls: `<button type="button" class="btn btn--primary btn--sm" data-op="len1">strlen(str1)</button>
<button type="button" class="btn btn--sm" data-op="len2">strlen(str2)</button>
<button type="button" class="btn btn--sm" data-op="cpy">strcpy(str1, str2)</button>
<button type="button" class="btn btn--sm" data-op="cat2">strcat(str2, " Math")</button>
<button type="button" class="btn btn--sm" data-op="cat1">strcat(str1, str2)</button>
<button type="button" class="btn btn--sm" data-op="cmp">strcmp(str1, str2)</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost btn--sm" data-op="reset">⟲ 重設</button>`,
        }) +
        C.callout(
          'warn',
          '緩衝區溢位（buffer overflow）',
          `<p>試試按 <code>strcat(str1, str2)</code>：<code>"Hello CCU!"</code> 加上 <code>"Love CCU"</code> 需要 19 格，但 <code>str1</code> 只有 11 格。真正的 C 程式不會阻止你，多出來的字元會蓋掉隔壁的記憶體，結果是<strong>未定義行為</strong>。所以宣告陣列時要預留足夠空間，例如 <code>char str2[25]</code>。</p>`
        ) +
        `<h3>課堂範例：String functions</h3>` +
        C.code(SRC_STRFN) +
        C.callout('tip', '提醒', `<p>用 <code>%d</code> 印字元，會印出它對應的 ASCII code。例如 <code>printf("%c: %d\\n", str2[0], str2[0]);</code> 印出 <code>L: 76</code>。</p>`)
    );
  }

  function secFgets() {
    return C.section(
      'l5-fgets',
      '04',
      'puts() 與 fgets()：安全讀取一整行',
      C.prose(`
<p><code>puts(str)</code> 輸出一個字串並<strong>自動換行</strong>。<code>fgets(str, n, stream)</code> 則從指定的輸入流讀取一行：</p>
<ul>
<li><code>str</code>：用來儲存輸入內容的字元陣列</li>
<li><code>n</code>：最多能讀取的字元數（<strong>包含 <code>'\\0'</code></strong>），所以最多存 n−1 個字元，不會溢位</li>
<li><code>stream</code>：輸入來源，通常是 <code>stdin</code>（鍵盤），也可以是檔案</li>
</ul>
<p>fgets 能讀進<strong>含空格的整行</strong>，安全又適合較長、較複雜的輸入；但它會把按 Enter 產生的 <code>'\\n'</code> 也存進陣列。常見的去除方法是 <code>input[strcspn(input, "\\n")] = 0;</code>——<code>strcspn(str1, str2)</code> 會檢查 str1 開頭有連續多少個字元<strong>不屬於</strong> str2 裡的字元，也就剛好是第一個 <code>'\\n'</code> 的位置。</p>`) +
        C.widget({
          id: 'l5-fg',
          title: 'fgets + strcspn：把 \'\\n\' 換成 \'\\0\'',
          tag: '逐步操作',
          hint: '依序按 ① ② ③，看 input 陣列怎麼變。也可以跳過 ② 直接按 ③，看看沒去掉換行會發生什麼事。',
          body: `${C.seg('l5-fg-mode', [['fgets', 'fgets(input, …, stdin)'], ['scanf', 'scanf("%s", input)']], 'fgets', '讀取方式')}
<div class="row">
  <label class="field"><span>使用者在鍵盤輸入（按 Enter 前）</span><input type="text" id="l5-fg-in" value="yes" maxlength="30" autocomplete="off" spellcheck="false"></label>
  <div class="row" role="group" aria-label="範例輸入">
    <button type="button" class="chip" data-fgp="yes">yes</button>
    <button type="button" class="chip" data-fgp="no">no</button>
    <button type="button" class="chip" data-fgp="Hello CCU">Hello CCU</button>
  </div>
</div>
<div class="widget-split">
  <div>
    <p class="l5-label">char input[100]（只畫出用到的格子）</p>
    <div class="cells cells--tight" id="l5-fg-cells"></div>
    <div id="l5-fg-resthost"></div>
    <p class="feedback is-info" id="l5-fg-fb"></p>
    <div class="console" data-title="程式輸出" id="l5-fg-out"></div>
  </div>
  <div id="l5-fg-codehost"></div>
</div>`,
          controls: `<button type="button" class="btn btn--primary btn--sm" data-fg="span">① strcspn(input, "\\n")</button>
<button type="button" class="btn btn--sm" data-fg="zero" id="l5-fg-zero">② input[…] = 0</button>
<button type="button" class="btn btn--sm" data-fg="cmp">③ strcmp 比對 yes／no</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost btn--sm" data-fg="reread">⟲ 重新讀取</button>`,
        }) +
        C.callout(
          'key',
          'scanf 與 fgets 的取捨',
          `<p>用 <code>scanf("%s")</code> 字串裡不會有 <code>'\\n'</code>，因為它遇到空白就自動結束輸入；代價是讀不到含空格的整句話，而且剩下的字元（包括 <code>'\\n'</code>）還留在緩衝區。要讀整行，用 fgets 再配 strcspn 去掉換行。</p>`
        )
    );
  }

  function secFile() {
    return C.section(
      'l5-file',
      '05',
      '檔案讀取：fopen() → fgets() → fclose()',
      C.prose(`
<p>讀檔案分成三個步驟：</p>
<ol>
<li><strong>fopen</strong> 拿到檔名（路徑），由作業系統查詢硬碟、找出檔案，並建立一個 <code>FILE</code> 結構</li>
<li>把 <code>FILE</code> 結構的<strong>位址</strong>回傳給程式，也就是 <code>FILE *file</code> 指標；找不到檔案時回傳 <code>NULL</code>，<mark>一定要檢查</mark></li>
<li>用這個指標搭配 <code>fgets</code>、<code>fread</code> 等函數操作檔案，作業系統負責把資料「搬進記憶體」給你；讀完記得 <code>fclose</code></li>
</ol>
<p>fgets 會把換行符號 <code>'\\n'</code> 一起讀進字串，讀到換行、緩衝區滿（n−1 個字元）或檔案結尾就停；搭配 <code>while</code> 迴圈一直讀，直到 fgets 回傳 <code>NULL</code> 代表檔案結束。</p>`) +
        C.widget({
          id: 'l5-file',
          title: '逐行讀檔模擬：fgets 每次搬多少？',
          tag: '逐步執行',
          hint: '編輯 example.txt 的內容、把緩衝區調小（例如 8），再用下方按鈕一步步執行；會看到一行被拆成好幾次 fgets 才讀完。勾選「檔案不存在」看 fopen 失敗的情況。',
          body: `<div class="flow" id="l5-file-flow">
  <div class="flow-node flow-node--tool">fopen()<small>交出檔名</small></div><div class="flow-arrow"></div>
  <div class="flow-node">作業系統<small>查詢硬碟、建立 FILE 結構</small></div><div class="flow-arrow"></div>
  <div class="flow-node flow-node--file">FILE *file<small>回傳位址給指標</small></div><div class="flow-arrow"></div>
  <div class="flow-node flow-node--tool">fgets()<small>把資料搬進記憶體</small></div><div class="flow-arrow"></div>
  <div class="flow-node flow-node--tool">fclose()<small>關檔、釋放</small></div>
</div>
<div class="row">
  <label class="field l5-grow"><span>example.txt 的內容</span><textarea id="l5-file-txt" rows="4" spellcheck="false">${esc(DEFAULT_FILE)}</textarea></label>
  <div class="l5-col">
    <label class="field"><span>緩衝區大小 sizeof(line) = <output id="l5-file-nout">50</output></span><input type="range" id="l5-file-n" min="4" max="50" value="50"></label>
    <label class="field field--inline"><input type="checkbox" id="l5-file-missing"><span>檔案不存在</span></label>
  </div>
</div>
<div class="widget-split">
  <div id="l5-file-codehost"></div>
  <div>
    <dl class="kv"><div><dt>file 指標</dt><dd id="l5-file-ptr">—</dd></div><div><dt>fgets 呼叫次數</dt><dd id="l5-file-calls">0</dd></div><div><dt>fgets 回傳</dt><dd id="l5-file-ret">—</dd></div></dl>
    <p class="l5-label">char line[<span id="l5-file-nlabel">50</span>] 緩衝區</p>
    <div class="cells cells--tight" id="l5-file-buf"></div>
    <p class="feedback is-info" id="l5-file-fb"></p>
    <div class="console" data-title="程式輸出" id="l5-file-out"></div>
  </div>
</div>`,
          controls: `<div id="l5-file-step"></div>`,
        }) +
        C.callout('warn', '開檔兩件事', `<p>① 開檔後<strong>檢查是否為 NULL</strong>（檔名打錯、路徑不對、沒有權限都會失敗）；② 讀完<strong>記得 fclose</strong>，把作業系統借給你的資源還回去。</p>`)
    );
  }

  function secRandom() {
    return C.section(
      'l5-random',
      '06',
      '亂數：rand() 與 srand()',
      C.prose(`
<p>要產生亂數，先引入 <code>&lt;stdlib.h&gt;</code> 和 <code>&lt;time.h&gt;</code>，流程是：</p>
<ol>
<li><code>srand(time(NULL))</code>：用「現在時間（秒）」設定<strong>種子（seed）</strong></li>
<li><code>rand()</code>：回傳一個介於 0 到 <code>RAND_MAX</code> 之間的整數</li>
<li><code>rand() % (Y - X + 1) + X</code>：取模把範圍限制在 [X, Y]</li>
</ol>
<p><code>rand()</code> 產生的是<strong>偽隨機數（pseudo-random）</strong>：它其實是一條用公式算出來的固定數列，種子只是決定「從哪裡開始」。<mark>每次用相同的種子，得到的序列就完全一樣</mark>；如果完全不呼叫 srand，就等於 <code>srand(1)</code>，每次執行結果都相同。</p>`) +
        C.widget({
          id: 'l5-rng',
          title: '偽隨機數產生器：同一個種子，同一串數字',
          tag: '互動',
          hint: '這裡實作 Windows（MSVC）C 函式庫的 rand 公式：state = state × 214013 + 2531011，回傳 (state >> 16) & 0x7FFF。先按幾次 rand()，再用同一個 seed 呼叫 srand，就會看到數列重演。',
          body: `<dl class="kv">
  <div><dt>目前種子（最近一次 srand）</dt><dd id="l5-rng-seed">1（預設）</dd></div>
  <div><dt>內部狀態 state</dt><dd id="l5-rng-state">—</dd></div>
  <div><dt>RAND_MAX</dt><dd>32767</dd></div>
</dl>
<p class="l5-label">rand() 回傳的數列（下方小字是 rand() % 10 + 1）</p>
<div class="cells" id="l5-rng-seq"></div>
<p class="feedback is-info" id="l5-rng-fb"></p>`,
          controls: `<label class="field field--inline"><span>seed</span><input type="number" id="l5-rng-in" value="2025" min="0" max="4294967295"></label>
<button type="button" class="btn btn--sm" id="l5-rng-srand">srand(seed)</button>
<button type="button" class="btn btn--sm" id="l5-rng-time">srand(time(NULL))</button>
<button type="button" class="btn btn--primary btn--sm" id="l5-rng-one">rand()</button>
<button type="button" class="btn btn--sm" id="l5-rng-five">rand() × 5</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost btn--sm" id="l5-rng-clear">清除數列</button>`,
        }) +
        C.widget({
          id: 'l5-h',
          title: '亂數分佈直方圖：rand() % (Y − X + 1) + X 夠平均嗎？',
          tag: '圖表',
          hint: '設定範圍與樣本數後按「產生」。虛線是每個值的期望次數 N ÷ (Y − X + 1)；樣本越多，長條越接近虛線。',
          body: `${C.seg('l5-h-mode', [['num', '數字：rand() % (Y−X+1) + X'], ['alpha', '字母：rand() % 26 + 97']], 'num', '亂數種類')}
<div class="l5-hist-wrap"><div class="bar-chart bar-chart--cols l5-hist" id="l5-h-chart" style="--chart-h:150px"></div></div>
<dl class="kv"><div><dt>樣本數 N</dt><dd id="l5-h-n-out">—</dd></div><div><dt>每個值的期望次數</dt><dd id="l5-h-exp">—</dd></div><div><dt>最少／最多</dt><dd id="l5-h-mm">—</dd></div></dl>
<p class="l5-label">課堂範例程式的執行結果（每次都先 srand(time(NULL))）</p>
<div class="console" data-title="終端機" id="l5-h-out"><span class="dim">按下方「執行 Random number」或「執行 Random alphabet」</span></div>`,
          controls: `<label class="field field--inline"><span>X</span><input type="number" id="l5-h-x" value="1" min="-50" max="100"></label>
<label class="field field--inline"><span>Y</span><input type="number" id="l5-h-y" value="10" min="-50" max="100"></label>
<label class="field"><span>N = <output id="l5-h-nlabel">1000</output></span><input type="range" id="l5-h-n" min="100" max="20000" step="100" value="1000"></label>
<button type="button" class="btn btn--primary btn--sm" id="l5-h-go">產生 N 個亂數</button>
<span class="spacer"></span>
<button type="button" class="btn btn--sm" id="l5-h-num">執行 Random number</button>
<button type="button" class="btn btn--sm" id="l5-h-alpha">執行 Random alphabet</button>`,
        }) +
        `<h3>課堂範例：Random number／Random alphabet</h3>` +
        C.code(SRC_RANDNUM) +
        C.callout(
          'tip',
          '為什麼 + 97？',
          `<p>小寫 <code>'a'</code> 的 ASCII 碼是 97，<code>rand() % 26</code> 得到 0～25，加上 97 就是 97～122，也就是 <code>'a'</code>～<code>'z'</code>，用 <code>%c</code> 印出來就是隨機字母。</p>`
        )
    );
  }

  function secPw() {
    return C.section(
      'l5-pw',
      '07',
      '綜合練習：簡易密碼檢查器',
      C.prose(`
<p>練習題要求：密碼必須同時有<strong>大寫字母、小寫字母、數字、特殊字元</strong>。做法是用 fgets 讀入一整行、strcspn 去掉換行，再用第 2 節的 ctype.h 函數<strong>逐字元檢查</strong>，用四個旗標（flag）變數記錄有沒有出現過。</p>`) +
        C.widget({
          id: 'l5-pw',
          title: '即時密碼檢查器',
          tag: '互動',
          hint: '一邊打字一邊看四個條件；按「送出」會像 C 程式一樣印出缺少哪些條件。這只是示範，請不要輸入你真正在用的密碼。',
          body: `<label class="field l5-wide"><span>Please enter a password:</span><input type="text" id="l5-pw-in" maxlength="40" placeholder="試試 Abc123!" autocomplete="off" spellcheck="false"></label>
<div class="cells cells--tight" id="l5-pw-cells"></div>
<div class="legend"><span data-c="1">大寫 isupper</span><span data-c="2">小寫 islower</span><span data-c="3">數字 isdigit</span><span data-c="4">特殊字元 ispunct</span></div>
<div class="row" id="l5-pw-pills"></div>
<div class="progress" id="l5-pw-bar" style="--p:0%">符合 0 / 4 項</div>
<div class="console" data-title="終端機" id="l5-pw-out"></div>`,
          controls: `<button type="button" class="btn btn--primary" id="l5-pw-send">送出（按 Enter）</button>
<button type="button" class="btn btn--sm" data-pw="abc">abc</button>
<button type="button" class="btn btn--sm" data-pw="Abc123">Abc123</button>
<button type="button" class="btn btn--sm" data-pw="Abc123!">Abc123!</button>
<span class="spacer"></span>
<button type="button" class="btn btn--ghost btn--sm" id="l5-pw-reset">⟲ 重新執行</button>`,
        }) +
        `<h3>參考程式：PW checker</h3>` +
        C.code(SRC_PW)
    );
  }

  function secMaze() {
    return C.section(
      'l5-maze',
      '08',
      '綜合練習：走迷宮遊戲',
      C.prose(`
<p>遊戲規則：用 <code>fgets()</code> 從 <code>map.txt</code> 讀取地圖（<code>*</code> 是牆、<code>S</code> 是起點、<code>E</code> 是終點），玩家用 <kbd>W</kbd>（上）<kbd>A</kbd>（左）<kbd>S</kbd>（下）<kbd>D</kbd>（右）控制方向；走到終點或撞到牆，遊戲就結束。</p>
<p>注意按鍵讀取：一般的 <code>getchar()</code>／<code>scanf()</code> 要等你按 Enter（還記得第 1 節的緩衝區嗎？）。Windows 的 <code>_getch()</code>（<code>conio.h</code>）可以<strong>即時讀取單個字元、不須按 Enter</strong>；macOS／Linux 沒有這個函數，需要改用其他方式讀單一按鍵。</p>`) +
        C.widget({
          id: 'l5-mz',
          title: '走迷宮：@ 從 S 走到 E',
          tag: '遊戲',
          hint: '先點一下迷宮（取得焦點），再用 W A S D 或方向鍵移動；手機可以用方向鍵盤。右邊會同步標示 C 程式正在執行哪幾行。',
          body: `<div class="widget-split">
  <div>
    <div class="maze" id="l5-mz-grid" tabindex="0" role="application" aria-label="迷宮，使用 W A S D 或方向鍵移動"></div>
    <div class="dpad" id="l5-mz-dpad">
      <button type="button" data-dir="up" aria-label="上（W）">W</button>
      <button type="button" data-dir="left" aria-label="左（A）">A</button>
      <button type="button" data-dir="right" aria-label="右（D）">D</button>
      <button type="button" data-dir="down" aria-label="下（S）">S</button>
    </div>
  </div>
  <div>
    <dl class="kv"><div><dt>玩家 (px, py)</dt><dd id="l5-mz-pos">—</dd></div><div><dt>按鍵 → (nx, ny)</dt><dd id="l5-mz-next">—</dd></div><div><dt>步數</dt><dd id="l5-mz-steps">0</dd></div></dl>
    <div class="console" data-title="終端機" id="l5-mz-out"></div>
    ${C.code(SRC_MAZE, { id: 'l5-mz-code' })}
  </div>
</div>
<details class="l5-details" id="l5-mz-editor">
  <summary>自訂地圖（練習：設計你自己的關卡）</summary>
  <p class="widget-caption">用 <code>*</code> 畫牆、空白當走道，必須剛好有一個 <code>S</code> 和一個 <code>E</code>；最多 20 × 20。超出每行長度的位置當作牆。</p>
  <textarea id="l5-mz-map" rows="9" spellcheck="false">${esc(MAP_DEFAULT)}</textarea>
  <div class="row"><button type="button" class="btn btn--sm" id="l5-mz-load">載入地圖</button><button type="button" class="btn btn--ghost btn--sm" id="l5-mz-default">還原課堂地圖</button></div>
  <p class="feedback" id="l5-mz-mapfb"></p>
</details>`,
          controls: `<button type="button" class="btn btn--primary" id="l5-mz-restart">⟲ 重新開始</button>
<span class="spacer"></span>
<span class="muted">鍵盤：<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 或方向鍵</span>`,
        })
    );
  }

  /* =========================================================
     Widgets — mount functions
     ========================================================= */
  function mountGetchar(root) {
    const $ = (s) => root.querySelector(s);
    const kb = $('#l5-gc-kb');
    const bufEl = $('#l5-gc-buf');
    const streamEl = $('#l5-gc-stream');
    const statusEl = $('#l5-gc-status');
    const out = $('#l5-gc-out');
    const pre = $('#l5-gc-code');
    const enterBtn = $('#l5-gc-enter');
    let st;
    let timer = null;
    function fresh() {
      if (timer) C.stop(timer);
      timer = null;
      st = { stream: [], echo: null, lines: [], calls: 0, phase: 'wait', last: null, msg: '' };
    }
    const cellsOf = (arr, hiFirst) =>
      arr.length ? arr.map((ch, i) => cellHtml(ch, i, hiFirst && i === 0 ? 'is-hi' : '')).join('') : emptyCells();
    function render() {
      bufEl.innerHTML = cellsOf(Array.from(kb.value), false);
      streamEl.innerHTML = cellsOf(st.stream, st.phase === 'run');
      let html = 'Please type anything: ';
      if (st.echo !== null) {
        html += `<span class="in">${esc(st.echo)}</span>\n` + st.lines.map(esc).join('\n') + (st.lines.length ? '\n' : '');
      }
      if (st.phase === 'done') html += '<span class="dim">[程式結束：return 0]</span>';
      else if (st.phase === 'wait') html += '<span class="cursor"></span>';
      out.innerHTML = html;
      $('#l5-gc-calls').textContent = st.calls;
      $('#l5-gc-last').textContent = st.last == null ? '—' : `'${vis(st.last)}' (${cc(st.last)})`;
      enterBtn.disabled = st.phase === 'run';
      if (st.phase === 'wait') {
        const n = Array.from(kb.value).length;
        statusEl.innerHTML = n
          ? `getchar() 等待中…緩衝區已經有 <strong>${n}</strong> 個字元，但要等你按下 Enter，作業系統才會把整行交給程式。`
          : 'getchar() 等待中…在「鍵盤」打字試試看：字元會先堆在緩衝區，程式一個字也拿不到。';
      } else statusEl.innerHTML = st.msg;
    }
    function tick() {
      if (!st.stream.length) {
        C.stop(timer);
        timer = null;
        return;
      }
      const ch = st.stream.shift();
      st.calls++;
      st.last = ch;
      if (ch === '\n') {
        st.phase = 'done';
        C.stop(timer);
        timer = null;
        C.setLines(pre, [7, 17]);
        st.msg = `第 ${st.calls} 次 getchar() 回傳 <code>'\\n'</code>（換行）→ 條件 <code>(ch != '\\n')</code> 為假，離開 while 迴圈，<code>return 0</code> 結束程式。再打一行字按 Enter 會重新執行。`;
      } else {
        let cond = 0;
        let line = 0;
        let msg = '';
        if (isalpha(ch)) [cond, line, msg] = [8, 9, `${ch} is an alphabet.`];
        else if (isdigit(ch)) [cond, line, msg] = [10, 11, `${ch} is a number.`];
        else if (isspace(ch)) [cond, line, msg] = [12, 13, `${ch} is a space.`];
        else if (ispunct(ch)) [cond, line, msg] = [14, 15, `${ch} is punctuation.`];
        if (msg) st.lines.push(msg);
        C.setLines(pre, [7, cond, line].filter(Boolean));
        st.msg =
          `第 ${st.calls} 次 getchar() 從輸入流最前面取出 <code>'${esc(vis(ch))}'</code>（ASCII ${cc(ch)}）→ ` +
          (msg
            ? `${isalpha(ch) ? 'isalpha' : isdigit(ch) ? 'isdigit' : isspace(ch) ? 'isspace' : 'ispunct'}(ch) 成立，印出「${esc(msg)}」`
            : '不是 ASCII 的字母／數字／空白／標點，四個條件都不成立，什麼也不印（中文字在 C 裡會被拆成好幾個位元組）');
      }
      render();
    }
    function send() {
      if (st.phase === 'run') return;
      if (st.phase === 'done') fresh();
      st.echo = kb.value;
      st.stream = Array.from(kb.value).concat('\n');
      kb.value = '';
      st.phase = 'run';
      st.msg = '按下 Enter！整行字連同 <code>\'\\n\'</code> 一次送進 stdin，getchar() 開始逐字讀取…';
      C.setLines(pre, 7);
      render();
      timer = C.every(tick, C.reduced() ? 250 : 750);
    }
    kb.addEventListener('input', render);
    kb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    });
    enterBtn.addEventListener('click', send);
    $('#l5-gc-reset').addEventListener('click', () => {
      fresh();
      kb.value = '';
      C.setLines(pre, 7);
      render();
      statusEl.innerHTML = '已重新執行程式：畫面印出提示文字，getchar() 停在第 7 行等待輸入。';
    });
    fresh();
    C.setLines(pre, 7);
    render();
  }

  function mountCtype(root) {
    const $ = (s) => root.querySelector(s);
    const inp = $('#l5-ct-in');
    const host = $('#l5-ct-table');
    const fb = $('#l5-ct-fb');
    const FN = [
      ['isalpha', '判斷是否為字母', isalpha],
      ['isdigit', '判斷是否為數字', isdigit],
      ['isalnum', '判斷是否為字母或數字', isalnum],
      ['isspace', '判斷是否為空白（space、tab、換行等）', isspace],
      ['isupper', '是否為大寫字母', isupper],
      ['islower', '是否為小寫字母', islower],
      ['ispunct', '是否為標點符號（可印出、但不是字母數字也不是空白）', ispunct],
      ['toupper', '轉換為大寫字母（不是小寫字母就原樣回傳）', toupper, true],
      ['tolower', '轉換為小寫字母（不是大寫字母就原樣回傳）', tolower, true],
    ];
    let sel = 'isalpha';
    function render() {
      const chars = Array.from(inp.value).slice(0, 16);
      if (!chars.length) {
        host.innerHTML = `<p class="l5-empty">請在上面輸入一些字元。</p>`;
        fb.textContent = '';
        return;
      }
      const head =
        '<tr><th scope="col">函式 ＼ 字元</th>' +
        chars.map((c) => `<th scope="col">'${esc(vis(c))}'<small>${cc(c)}</small></th>`).join('') +
        '</tr>';
      const body = FN.map(([name, , f, conv]) => {
        const tds = chars
          .map((c) => {
            if (conv) {
              const r = f(c);
              return `<td class="${r !== c ? 'l5-chg' : 'l5-no'}">${esc(vis(r))}</td>`;
            }
            return f(c) ? '<td class="l5-yes">✓</td>' : '<td class="l5-no">·</td>';
          })
          .join('');
        return `<tr data-row="${name}"><th scope="row"><button type="button" class="chip" data-fn="${name}" aria-pressed="false">${name}(c)</button></th>${tds}</tr>`;
      }).join('');
      host.innerHTML = `<div class="table-wrap"><table class="table l5-ct"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
      select();
    }
    function select() {
      const chars = Array.from(inp.value).slice(0, 16);
      if (!chars.length) return;
      host.querySelectorAll('tr[data-row]').forEach((tr) => {
        const on = tr.dataset.row === sel;
        tr.classList.toggle('is-hi', on);
        const b = tr.querySelector('button[data-fn]');
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const [name, desc, f, conv] = FN.find((x) => x[0] === sel);
      const nonAscii = chars.some((c) => cc(c) > 127);
      if (conv) {
        const changed = chars.filter((c) => f(c) !== c).length;
        fb.innerHTML = `<strong>${name}(c)</strong>：${desc}。「${esc(chars.join(''))}」經過轉換後變成「<strong>${esc(
          chars.map(f).join('')
        )}</strong>」，共有 ${changed} 個字元被改變。`;
      } else {
        const hits = chars.filter(f);
        fb.innerHTML = `<strong>${name}(c)</strong>：${desc}。在這 ${chars.length} 個字元裡，有 <strong>${hits.length}</strong> 個讓它回傳非 0（真）${
          hits.length ? '：' + hits.map((c) => `<code>'${esc(vis(c))}'</code>`).join(' ') : ''
        }。`;
      }
      if (nonAscii) fb.innerHTML += ' 中文等非 ASCII 字元不在 ctype 函式的判斷範圍內，這裡一律當作「否」。';
    }
    host.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-fn]');
      if (!b) return;
      sel = b.dataset.fn;
      select();
    });
    inp.addEventListener('input', render);
    root.querySelectorAll('#l5-ct [data-preset]').forEach((b) =>
      b.addEventListener('click', () => {
        inp.value = b.dataset.preset;
        render();
      })
    );
    render();
  }

  function mountStrLab(root) {
    const $ = (s) => root.querySelector(s);
    const in1 = $('#l5-s-in1');
    const in2 = $('#l5-s-in2');
    const elA = $('#l5-s-a');
    const elB = $('#l5-s-b');
    const fb = $('#l5-s-fb');
    const out = $('#l5-s-out');
    const ops = Array.from(root.querySelectorAll('#l5-s [data-op]'));
    const SIZE_B = 25;
    let A, B, clsA, clsB, outLines;
    let busy = false;
    let timer = null;
    const say = (kind, html) => {
      fb.className = 'feedback is-' + kind;
      fb.innerHTML = html;
    };
    const clearCls = () => {
      clsA = {};
      clsB = {};
    };
    function stopAnim() {
      if (timer) C.stop(timer);
      timer = null;
      busy = false;
    }
    function declare() {
      stopAnim();
      const a = Array.from(in1.value).slice(0, 24);
      const b = Array.from(in2.value).slice(0, 24);
      A = a.concat('\0');
      B = b.concat('\0');
      while (B.length < SIZE_B) B.push('\0');
      clearCls();
      outLines = [];
      say(
        'info',
        `str1 用初始值決定大小：${a.length} 個字元 + <code>'\\0'</code> = <strong>${A.length} 格</strong>；str2 固定 <strong>25 格</strong>，沒用到的位置自動補 0。`
      );
      render();
    }
    function arrHtml(arr, cls, name) {
      const n = slen(arr);
      return arr
        .map((ch, i) => cellHtml(ch, i, (cls[i] || '') + (i > n && !cls[i] ? ' is-dim' : ''), `data-arr="${name}" data-i="${i}" aria-label="${name}[${i}]"`))
        .join('');
    }
    function render() {
      elA.innerHTML = arrHtml(A, clsA, 'str1');
      elB.innerHTML = arrHtml(B, clsB, 'str2');
      $('#l5-s-declA').textContent = `char str1[${A.length}]   內容 "${sval(A)}"   strlen = ${slen(A)}`;
      $('#l5-s-declB').textContent = `char str2[25]   內容 "${sval(B)}"   strlen = ${slen(B)}`;
      out.innerHTML = outLines.length ? outLines.map(esc).join('\n') : '<span class="dim">（按下方按鈕執行字串函式）</span>';
      ops.forEach((b) => {
        if (b.dataset.op !== 'reset') b.disabled = busy;
      });
    }
    function run(frames, finish) {
      stopAnim();
      busy = true;
      let k = 0;
      const step = () => {
        if (k < frames.length) {
          frames[k++]();
          render();
        } else {
          stopAnim();
          finish();
          render();
        }
      };
      if (C.reduced()) {
        frames.forEach((f) => f());
        busy = false;
        finish();
        render();
        return;
      }
      step();
      timer = C.every(step, 150);
    }
    function opStrlen(which) {
      const arr = which === 1 ? A : B;
      const name = which === 1 ? 'str1' : 'str2';
      clearCls();
      const cls = which === 1 ? clsA : clsB;
      const n = slen(arr);
      const frames = [];
      for (let i = 0; i <= n; i++)
        frames.push(() => {
          for (const k in cls) delete cls[k];
          for (let j = 0; j < i; j++) cls[j] = 'is-ok';
          cls[i] = 'is-hi';
        });
      say('info', `strlen(${name})：從 [0] 開始一格一格往後數…`);
      run(frames, () => {
        say(
          'ok',
          `strlen(${name}) = <strong>${n}</strong>：數到 [${n}] 的 <code>'\\0'</code> 就停，<code>'\\0'</code> 本身不算。陣列「大小」是 ${arr.length} 格，「長度」是 ${n}——兩者不一樣！`
        );
        outLines.push(`${name}: ${sval(arr)}, length: ${n}`);
      });
    }
    function overflow(what, need, have, name) {
      clearCls();
      const arr = name === 'str1' ? A : B;
      const cls = name === 'str1' ? clsA : clsB;
      arr.forEach((_, i) => (cls[i] = 'is-err'));
      say(
        'err',
        `⚠ ${what} 需要 <strong>${need}</strong> 格，但 ${name} 只有 <strong>${have}</strong> 格！真正的 C 程式不會擋你，多出來的字元會寫進 ${name} 後面不屬於它的記憶體——這就是<strong>緩衝區溢位（buffer overflow）</strong>，屬於未定義行為：可能覆蓋其他變數、讓程式當掉，甚至被拿來攻擊。這裡已阻止這次操作。`
      );
      outLines.push(`⚠ ${what}：${name} 空間不足，拒絕執行`);
      render();
    }
    function opStrcpy() {
      const n = slen(B);
      if (n + 1 > A.length) return overflow('strcpy(str1, str2)', n + 1, A.length, 'str1');
      clearCls();
      const frames = [];
      for (let i = 0; i <= n; i++)
        frames.push(() => {
          A[i] = B[i];
          clsB = {};
          clsA = {};
          for (let j = 0; j < i; j++) clsA[j] = 'is-ok';
          clsA[i] = 'is-hi is-new';
          clsB[i] = 'is-hi';
        });
      say('info', 'strcpy(str1, str2)：把 str2 的字元一個一個抄到 str1，連 <code>\'\\0\'</code> 也要抄…');
      run(frames, () => {
        clearCls();
        say(
          'ok',
          `複製完成：str2 的 ${n} 個字元加上 <code>'\\0'</code> 都進了 str1。` +
            (A.length > n + 1
              ? ` [${n + 1}] 之後變淡的格子是<strong>舊資料</strong>，還留在記憶體裡；但 [${n}] 已經是 <code>'\\0'</code>，printf 讀到那裡就停，所以不會印出來。`
              : '')
        );
        outLines.push(`str1 (after copy): ${sval(A)}`);
      });
    }
    function opStrcat(dstName, src, label) {
      const dst = dstName === 'str1' ? A : B;
      const start = slen(dst);
      const need = start + src.length + 1;
      if (need > dst.length) return overflow(label, need, dst.length, dstName);
      clearCls();
      const frames = [];
      for (let j = 0; j <= src.length; j++)
        frames.push(() => {
          dst[start + j] = j < src.length ? src[j] : '\0';
          const cls = {};
          for (let k = start; k < start + j; k++) cls[k] = 'is-ok';
          cls[start + j] = 'is-hi is-new';
          if (dstName === 'str1') {
            clsA = cls;
            clsB = {};
          } else {
            clsB = cls;
            clsA = {};
          }
        });
      say('info', `${label}：先找到 ${dstName} 原本的 <code>'\\0'</code>（在 [${start}]），從那裡開始接上新字元…`);
      run(frames, () => {
        clearCls();
        say('ok', `串接完成：原本 [${start}] 的 <code>'\\0'</code> 被覆蓋，接上 ${src.length} 個字元，最後在 [${start + src.length}] 補上新的 <code>'\\0'</code>。長度變成 ${slen(dst)}。`);
        outLines.push(`Concatenate string: ${sval(dst)}, length: ${slen(dst)}`);
      });
    }
    function opStrcmp() {
      clearCls();
      let i = 0;
      while (A[i] === B[i] && A[i] !== '\0' && i < A.length - 1 && i < B.length - 1) i++;
      const d = cc(A[i] || '\0') - cc(B[i] || '\0');
      const frames = [];
      for (let j = 0; j <= i; j++)
        frames.push(() => {
          clsA = {};
          clsB = {};
          for (let k = 0; k < j; k++) clsA[k] = clsB[k] = 'is-ok';
          clsA[j] = clsB[j] = j < i ? 'is-hi' : d === 0 ? 'is-ok' : 'is-err';
        });
      say('info', 'strcmp(str1, str2)：兩個字串從 [0] 開始逐字元比較 ASCII 碼…');
      run(frames, () => {
        if (d === 0) {
          say('ok', `兩個字串完全相同（比到 [${i}] 兩邊都是 <code>'\\0'</code>），strcmp 回傳 <strong>0</strong>。記住：「相同」回傳的是 0，不是 1！所以要寫 <code>if (strcmp(a, b) == 0)</code>。`);
        } else {
          say(
            d < 0 ? 'err' : 'info',
            `在 [${i}] 第一次不同：<code>'${esc(vis(A[i]))}'</code>(${cc(A[i])}) vs <code>'${esc(vis(B[i]))}'</code>(${cc(B[i])})，差 ${d} → strcmp 回傳<strong>${
              d < 0 ? '負值' : '正值'
            }</strong>，代表 str1 在字典順序上排在 str2 ${d < 0 ? '前面' : '後面'}。（C 標準只保證正負號：有的編譯器印出 ${d < 0 ? '-1' : '1'}，有的直接回傳差值 ${d}。）`
          );
        }
        outLines.push(`strcmp(str1, str2) → ${d === 0 ? '0' : d < 0 ? '負值' : '正值'}（字元差 ${d}）`);
      });
    }
    root.querySelector('#l5-s .widget-controls').addEventListener('click', (e) => {
      const b = e.target.closest('[data-op]');
      if (!b || b.disabled) return;
      const op = b.dataset.op;
      if (op === 'reset') return declare();
      if (busy) return;
      if (op === 'len1') opStrlen(1);
      else if (op === 'len2') opStrlen(2);
      else if (op === 'cpy') opStrcpy();
      else if (op === 'cat2') opStrcat('str2', Array.from(' Math'), 'strcat(str2, " Math")');
      else if (op === 'cat1') opStrcat('str1', B.slice(0, slen(B)), 'strcat(str1, str2)');
      else if (op === 'cmp') opStrcmp();
    });
    const cellClick = (e) => {
      const b = e.target.closest('button[data-arr]');
      if (!b) return;
      const name = b.dataset.arr;
      const i = +b.dataset.i;
      const arr = name === 'str1' ? A : B;
      if (!busy) {
        clearCls();
        (name === 'str1' ? clsA : clsB)[i] = 'is-hi';
      }
      const ch = arr[i];
      const line = `${ch === '\0' ? '' : ch}: ${cc(ch)}`;
      say(
        'info',
        `<code>printf("%c: %d\\n", ${name}[${i}], ${name}[${i}]);</code> → <code>${esc(line)}</code>　同一個字元，<code>%c</code> 印出字元本身，<code>%d</code> 印出它的 ASCII 碼${
          ch === '\0' ? '（<code>\'\\0\'</code> 的編碼是 0，%c 印出來什麼也看不到）' : ''
        }。`
      );
      outLines.push(line);
      render();
    };
    elA.addEventListener('click', cellClick);
    elB.addEventListener('click', cellClick);
    in1.addEventListener('input', declare);
    in2.addEventListener('input', declare);
    declare();
  }

  function mountFgets(root) {
    const $ = (s) => root.querySelector(s);
    const inp = $('#l5-fg-in');
    const cellsEl = $('#l5-fg-cells');
    const restHost = $('#l5-fg-resthost');
    const fb = $('#l5-fg-fb');
    const out = $('#l5-fg-out');
    const codeHost = $('#l5-fg-codehost');
    const zeroBtn = $('#l5-fg-zero');
    let mode = 'fgets';
    let buf = [];
    let rest = [];
    let stage = 0;
    let nIdx = -1;
    let hi = {};
    const pre = () => $('#l5-fg-code');
    const say = (kind, html) => {
      fb.className = 'feedback is-' + kind;
      fb.innerHTML = html;
    };
    const firstStop = () => {
      let i = 0;
      while (i < buf.length && buf[i] !== '\n' && buf[i] !== '\0') i++;
      return i;
    };
    function render() {
      cellsEl.innerHTML = buf.map((ch, i) => cellHtml(ch, i, hi[i] || '')).join('') + '<span class="l5-empty">… 共 100 格</span>';
      restHost.innerHTML = rest.length
        ? `<p class="l5-label">還留在 stdin 緩衝區、沒被讀走的字元</p><div class="cells cells--tight">${rest
            .map((ch, i) => cellHtml(ch, i, 'is-dim'))
            .join('')}</div>`
        : '';
      zeroBtn.textContent = nIdx >= 0 ? `② input[${nIdx}] = 0` : '② input[strcspn(…)] = 0';
    }
    function read() {
      const line = inp.value;
      hi = {};
      if (mode === 'fgets') {
        buf = Array.from(line).slice(0, 98).concat(['\n', '\0']);
        rest = [];
        say('info', `fgets 讀進整行「${esc(line)}」，<strong>連同按下 Enter 產生的 <code>'\\n'</code></strong> 一起存進 input，最後補上 <code>'\\0'</code>。`);
      } else {
        const m = line.match(/^(\s*)(\S*)([\s\S]*)$/);
        buf = Array.from(m[2]).concat('\0');
        rest = Array.from(m[3]).concat('\n');
        say(
          'info',
          `scanf("%s") 先跳過開頭空白，讀到下一個空白就停：只讀進「${esc(m[2])}」${
            m[3] ? `，剩下的「${esc(m[3])}」和 <code>'\\n'</code> 還留在緩衝區，會被下一次讀取拿到` : '；按 Enter 產生的 <code>\'\\n\'</code> 則留在緩衝區'
          }。`
        );
      }
      stage = 0;
      nIdx = -1;
      codeHost.innerHTML = C.code(srcCmp(mode), { id: 'l5-fg-code' });
      C.setLines(pre(), 8);
      out.innerHTML = `請輸入 yes 或 no：\n<span class="in">${esc(line)}</span>`;
      render();
    }
    function doSpan() {
      nIdx = firstStop();
      stage = Math.max(stage, 1);
      hi = {};
      for (let i = 0; i < nIdx; i++) hi[i] = 'is-ok';
      hi[nIdx] = 'is-hi';
      C.setLines(pre(), 9);
      if (buf[nIdx] === '\n')
        say('info', `strcspn(input, "\\n") 回傳 <strong>${nIdx}</strong>：開頭連續 ${nIdx} 個字元都不是 <code>'\\n'</code>，所以 input[${nIdx}] 就是第一個 <code>'\\n'</code> 的位置。`);
      else
        say('info', `strcspn(input, "\\n") 回傳 <strong>${nIdx}</strong>：整個字串都沒有 <code>'\\n'</code>，它數到 <code>'\\0'</code> 就停。scanf 讀進來的字串本來就不含換行，這一步沒有副作用。`);
      render();
    }
    function doZero() {
      if (nIdx < 0) nIdx = firstStop();
      const was = buf[nIdx];
      buf[nIdx] = '\0';
      stage = 2;
      hi = {};
      for (let i = 0; i < nIdx; i++) hi[i] = 'is-ok';
      hi[nIdx] = 'is-hi is-new';
      C.setLines(pre(), 9);
      say(
        'ok',
        was === '\n'
          ? `input[${nIdx}] = 0：把 <code>'\\n'</code> 換成 <code>'\\0'</code>（數值 0），字串在這裡提早結束，變成乾淨的「${esc(sval(buf))}」。`
          : `input[${nIdx}] 本來就是 <code>'\\0'</code>，再寫一次 0 不影響結果。`
      );
      render();
    }
    function doCmp() {
      const s = sval(buf);
      let msg;
      let lines;
      if (s === 'yes') [msg, lines] = ['你選擇了 yes!', [10, 11]];
      else if (s === 'no') [msg, lines] = ['你選擇了 no!', [12, 13]];
      else [msg, lines] = ['輸入不正確，只能輸入 yes 或 no。', [14, 15]];
      C.setLines(pre(), lines);
      out.innerHTML = `請輸入 yes 或 no：\n<span class="in">${esc(inp.value)}</span>\n${esc(msg)}`;
      const hasNl = buf.slice(0, slen(buf)).includes('\n');
      if (hasNl && (inp.value === 'yes' || inp.value === 'no'))
        say(
          'err',
          `明明輸入了「${esc(inp.value)}」卻被判定不正確？因為還沒做步驟 ②，字串其實是 <code>"${esc(inp.value)}\\n"</code>，多了一個換行，strcmp 比對 <code>"${esc(
            inp.value
          )}"</code> 不等於 0。這就是為什麼 fgets 之後要先去掉 <code>'\\n'</code>！`
        );
      else
        say(
          s === 'yes' || s === 'no' ? 'ok' : 'info',
          `strcmp(input, "yes") ${s === 'yes' ? '== 0' : '≠ 0'}${s === 'yes' ? '' : `，strcmp(input, "no") ${s === 'no' ? '== 0' : '≠ 0'}`} → puts 印出「${esc(msg)}」並自動換行。`
        );
    }
    C.onSeg(root, 'l5-fg-mode', (v) => {
      mode = v;
      read();
    });
    root.querySelector('#l5-fg .widget-controls').addEventListener('click', (e) => {
      const b = e.target.closest('[data-fg]');
      if (!b) return;
      const a = b.dataset.fg;
      if (a === 'span') doSpan();
      else if (a === 'zero') doZero();
      else if (a === 'cmp') doCmp();
      else if (a === 'reread') read();
    });
    root.querySelectorAll('#l5-fg [data-fgp]').forEach((b) =>
      b.addEventListener('click', () => {
        inp.value = b.dataset.fgp;
        read();
      })
    );
    inp.addEventListener('input', read);
    read();
  }

  function mountFile(root) {
    const $ = (s) => root.querySelector(s);
    const txt = $('#l5-file-txt');
    const range = $('#l5-file-n');
    const missing = $('#l5-file-missing');
    const codeHost = $('#l5-file-codehost');
    const nodes = Array.from(root.querySelectorAll('#l5-file-flow .flow-node'));
    const arrows = Array.from(root.querySelectorAll('#l5-file-flow .flow-arrow'));
    let steps = [];
    let N = 50;
    const describe = (s) => s.replace(/\n/g, '\\n');
    function build() {
      N = +range.value;
      const text = txt.value;
      const list = [];
      let mem = new Array(N).fill('?');
      let out = '';
      let calls = 0;
      const snap = (o) => list.push(Object.assign({ mem: o.mem === null ? null : (o.mem || mem).slice(), out, calls, ptr: '—', ret: '—' }, o, { mem: o.mem === null ? null : (o.mem || mem).slice() }));
      snap({ line: 3, node: 0, mem: null, fb: '呼叫 <code>fopen("example.txt", "r")</code>：把檔名和模式 "r"（唯讀）交給作業系統…' });
      if (missing.checked) {
        snap({ line: 3, node: 1, mem: null, ptr: 'NULL', fb: '作業系統在硬碟上<strong>找不到</strong> example.txt，沒辦法建立 FILE 結構 → fopen 回傳 <code>NULL</code>。', err: true });
        out = 'Fail to open the file!\n';
        snap({ line: [4, 5], node: 1, mem: null, ptr: 'NULL', fb: '<code>file == NULL</code> 成立：印出錯誤訊息。如果沒有這個檢查，下一步拿 NULL 去 fgets 程式就會當掉。', err: true });
        snap({ line: 6, node: 1, mem: null, ptr: 'NULL', fb: '<code>return 1;</code> 用非 0 的回傳值告訴作業系統「程式異常結束」。', err: true });
        return list;
      }
      snap({ line: 3, node: 1, mem: null, fb: '作業系統查詢硬碟、找到檔案，在記憶體裡建立一個 <code>FILE</code> 結構（記錄檔案在哪、讀到哪裡、緩衝區…）。' });
      snap({ line: 3, node: 2, mem: null, ptr: '0x5f3a10', fb: 'fopen 回傳這個 FILE 結構的<strong>位址</strong>，存進 <code>file</code> 指標。之後操作檔案都靠它。' });
      snap({ line: 4, node: 2, mem: null, ptr: '0x5f3a10', fb: '<code>file != NULL</code>，開檔成功，跳過錯誤處理。' });
      snap({ line: 8, node: 2, ptr: '0x5f3a10', fb: `<code>char line[${N}];</code> 準備 ${N} 格的緩衝區，裡面還是未初始化的垃圾值（?）。` });
      let pos = 0;
      let lastUsed = -1;
      const chars = Array.from(text);
      while (pos < chars.length) {
        let chunk = [];
        while (pos < chars.length && chunk.length < N - 1) {
          const ch = chars[pos++];
          chunk.push(ch);
          if (ch === '\n') break;
        }
        calls++;
        chunk.forEach((ch, i) => (mem[i] = ch));
        mem[chunk.length] = '\0';
        const why =
          chunk[chunk.length - 1] === '\n'
            ? "遇到 <code>'\\n'</code> 就停（<code>'\\n'</code> 也存進緩衝區）"
            : chunk.length === N - 1
            ? `已經讀滿 ${N - 1} 個字元（留 1 格給 <code>'\\0'</code>），這行剩下的部分留給下一次 fgets`
            : '碰到檔案結尾';
        const marks = {};
        for (let i = 0; i <= chunk.length; i++) marks[i] = i === chunk.length ? '' : 'is-new is-alloc';
        snap({ line: 9, node: 3, ptr: '0x5f3a10', ret: 'line', marks, used: chunk.length, fb: `第 ${calls} 次 fgets：讀進「${esc(describe(chunk.join('')))}」——${why}，最後補 <code>'\\0'</code>。回傳 line（不是 NULL），進入迴圈。` });
        out += chunk.join('');
        lastUsed = chunk.length;
        snap({ line: 10, node: 3, ptr: '0x5f3a10', ret: 'line', marks: {}, used: chunk.length, fb: '<code>printf("%s", line)</code> 從 [0] 印到 <code>\'\\0\'</code> 為止。字串裡的 <code>\'\\n\'</code> 讓輸出換行。' });
      }
      calls++;
      snap({ line: 9, node: 3, ptr: '0x5f3a10', ret: 'NULL', used: lastUsed, fb: `第 ${calls} 次 fgets：已經到檔案結尾（EOF），什麼也沒讀到，回傳 <code>NULL</code>（緩衝區保持原樣）→ while 條件不成立，離開迴圈。` });
      snap({ line: 12, node: 4, ptr: '0x5f3a10', ret: 'NULL', used: lastUsed, fb: '<code>fclose(file)</code>：關閉檔案，把 FILE 結構和作業系統資源還回去。' });
      snap({ line: 13, node: 5, ptr: '(已關閉)', ret: 'NULL', used: lastUsed, fb: '<code>return 0;</code> 程式正常結束。' });
      return list;
    }
    function render(i) {
      const s = steps[i];
      nodes.forEach((n, k) => {
        n.classList.toggle('is-done', k < s.node);
        n.classList.toggle('is-active', k === s.node);
      });
      arrows.forEach((a, k) => {
        a.classList.toggle('is-done', k < s.node - 1);
        a.classList.toggle('is-active', k === s.node - 1);
      });
      C.setLines($('#l5-file-code'), s.line);
      $('#l5-file-ptr').textContent = s.ptr;
      $('#l5-file-calls').textContent = s.calls;
      $('#l5-file-ret').textContent = s.ret;
      const bufEl = $('#l5-file-buf');
      if (!s.mem) bufEl.innerHTML = emptyCells('（還沒宣告 line）');
      else
        bufEl.innerHTML = s.mem
          .map((ch, k) => {
            let cls = '';
            if (ch === '?') cls = 'is-dim';
            else if (s.used >= 0 && k > s.used) cls = 'is-dim';
            if (s.marks && s.marks[k]) cls = s.marks[k];
            return cellHtml(ch, k, cls);
          })
          .join('');
      const fb = $('#l5-file-fb');
      fb.className = 'feedback ' + (s.err ? 'is-err' : 'is-info');
      fb.innerHTML = s.fb;
      const out = $('#l5-file-out');
      out.innerHTML = s.out ? (s.err ? `<span class="err">${esc(s.out)}</span>` : esc(s.out)) : '<span class="dim">（尚無輸出）</span>';
    }
    let stepper;
    function rebuild() {
      N = +range.value;
      $('#l5-file-nout').textContent = N;
      $('#l5-file-nlabel').textContent = N;
      codeHost.innerHTML = C.code(srcFile(N), { id: 'l5-file-code' });
      steps = build();
      if (stepper) stepper.reset();
    }
    rebuild();
    stepper = C.stepper($('#l5-file-step'), { count: () => steps.length, render, interval: 1100 });
    txt.addEventListener('input', rebuild);
    range.addEventListener('input', rebuild);
    missing.addEventListener('change', rebuild);
  }

  function mountRng(root) {
    const $ = (s) => root.querySelector(s);
    const r = makeRand();
    const seqEl = $('#l5-rng-seq');
    const fb = $('#l5-rng-fb');
    const seedIn = $('#l5-rng-in');
    let seq = []; // every value since the last srand (absolute positions)
    let viewStart = 0; // "清除數列" only hides earlier values
    let prevRun = null; // what this same seed produced last time
    let curSeed = null;
    let srandCount = 0;
    const history = new Map(); // seed -> values generated after it
    const say = (kind, html) => {
      fb.className = 'feedback is-' + kind;
      fb.innerHTML = html;
    };
    function render() {
      $('#l5-rng-seed').textContent = curSeed === null ? '1（沒呼叫 srand）' : String(curSeed);
      $('#l5-rng-state').textContent = '0x' + r.state.toString(16).toUpperCase().padStart(8, '0');
      const from = Math.max(viewStart, seq.length - 24);
      const shown = seq.slice(from);
      seqEl.innerHTML = shown.length
        ? shown
            .map((v, k) => {
              const i = from + k;
              const match = prevRun && prevRun[i] === v;
              return `<div class="cell${match ? ' is-ok' : ''}${i === seq.length - 1 ? ' is-new' : ''}"><span class="cell-idx">#${i + 1}</span><span class="cell-val">${v}</span><span class="cell-sub">→ ${(v % 10) + 1}</span></div>`;
            })
            .join('')
        : emptyCells('（按 rand() 產生數字）');
    }
    function remember() {
      const k = curSeed === null ? 1 : curSeed;
      const old = history.get(k);
      if (!old || seq.length >= old.length) history.set(k, seq.slice());
    }
    function doSrand(x, how) {
      // archive the sequence produced by the previous seed
      remember();
      curSeed = Number(x) >>> 0;
      r.srand(curSeed);
      srandCount++;
      const before = history.get(curSeed);
      prevRun = before && before.length ? before.slice() : null;
      seq = [];
      viewStart = 0;
      if (before && before.length)
        say(
          'ok',
          `第 ${srandCount} 次呼叫 ${how}：種子 ${curSeed} <strong>之前用過</strong>！接下來 rand() 會重演完全相同的數列：${before
            .slice(0, 6)
            .join(', ')}${before.length > 6 ? ', …' : ''}（重複的數字會標成綠色）。`
        );
      else say('info', `第 ${srandCount} 次呼叫 ${how}：種子設為 <strong>${curSeed}</strong>，數列從頭開始。按 rand() 取數字；之後再用同一個種子 srand 一次，就會看到一模一樣的數列。`);
      render();
    }
    function gen(n) {
      for (let i = 0; i < n; i++) seq.push(r.rand());
      remember();
      const last = seq[seq.length - 1];
      say('info', `rand() 回傳 <strong>${last}</strong>（0 ～ 32767 之間）；<code>rand() % 10 + 1</code> = ${(last % 10) + 1}，<code>rand() % 26 + 97</code> = ${(last % 26) + 97}（'${String.fromCharCode((last % 26) + 97)}'）。`);
      render();
    }
    $('#l5-rng-srand').addEventListener('click', () => {
      const v = Math.max(0, Math.floor(Number(seedIn.value) || 0));
      doSrand(v, `srand(${v})`);
    });
    $('#l5-rng-time').addEventListener('click', () => {
      const t = Math.floor(Date.now() / 1000);
      seedIn.value = t;
      doSrand(t, `srand(time(NULL))（time(NULL) = ${t}，從 1970/1/1 起算的秒數）`);
    });
    $('#l5-rng-one').addEventListener('click', () => gen(1));
    $('#l5-rng-five').addEventListener('click', () => gen(5));
    $('#l5-rng-clear').addEventListener('click', () => {
      viewStart = seq.length;
      say('info', `數列畫面已清除（已產生 ${seq.length} 個；產生器的內部狀態沒有改變，繼續按 rand() 會接著產生第 ${seq.length + 1} 個數字）。`);
      render();
    });
    seedIn.addEventListener('change', () => say('info', `種子欄位改成 ${seedIn.value}，按「srand(seed)」才會真正設定。`));
    say('info', '目前還沒呼叫 srand，C 會當作 srand(1)。按 rand() 看看第一個數字（MSVC 的 rand 在種子 1 時第一個是 41）。');
    render();
  }

  function mountHist(root) {
    const $ = (s) => root.querySelector(s);
    const r = makeRand();
    r.srand(Math.floor(Date.now() / 1000));
    const chart = $('#l5-h-chart');
    const xIn = $('#l5-h-x');
    const yIn = $('#l5-h-y');
    const nIn = $('#l5-h-n');
    const out = $('#l5-h-out');
    let mode = 'num';
    let lastT = null;
    let runs = 0;
    function generate() {
      const N = +nIn.value;
      $('#l5-h-nlabel').textContent = N;
      let X;
      let Y;
      if (mode === 'alpha') {
        X = 97;
        Y = 122;
      } else {
        X = Math.round(+xIn.value || 0);
        Y = Math.round(+yIn.value || 0);
        if (Y < X) [X, Y] = [Y, X];
        if (Y - X + 1 > 40) Y = X + 39;
      }
      const k = Y - X + 1;
      const counts = new Array(k).fill(0);
      for (let i = 0; i < N; i++) counts[(r.rand() % k + k) % k]++;
      const exp = N / k;
      const max = Math.max(exp, ...counts);
      const hiIdx = counts.indexOf(Math.max(...counts));
      chart.style.setProperty('--chart-h', '150px');
      chart.innerHTML = counts
        .map((c, i) => {
          const v = X + i;
          const lab = mode === 'alpha' ? String.fromCharCode(v) : String(v);
          return `<div class="bar-row${i === hiIdx ? ' is-hi' : ''}" title="${esc(lab)}：${c} 次"><span class="bar-label">${esc(lab)}</span><div class="bar-track"><div class="bar-fill" style="height:${(
            (c / max) *
            100
          ).toFixed(1)}%"></div><span class="l5-exp" style="bottom:${((exp / max) * 100).toFixed(1)}%"></span></div><span class="bar-value">${c}</span></div>`;
        })
        .join('');
      $('#l5-h-n-out').textContent = N.toLocaleString();
      $('#l5-h-exp').textContent = exp.toFixed(1);
      $('#l5-h-mm').textContent = `${Math.min(...counts)} ／ ${Math.max(...counts)}`;
      xIn.disabled = yIn.disabled = mode === 'alpha';
    }
    function demo(kind) {
      const t = Math.floor(Date.now() / 1000);
      const g = makeRand();
      g.srand(t);
      const vals = [];
      for (let i = 0; i < 5; i++) {
        const v = g.rand();
        vals.push(kind === 'num' ? String((v % 10) + 1) : String.fromCharCode((v % 26) + 97));
      }
      runs++;
      const same = lastT === t;
      lastT = t;
      const block =
        `<span class="dim">$ ./${kind === 'num' ? 'random_number' : 'random_alphabet'}    # 第 ${runs} 次執行，time(NULL) = ${t}</span>\n` +
        (kind === 'num' ? vals.join('\n') : vals.join('')) +
        (same ? '\n<span class="in">↑ 和上一次在同一秒內執行，種子相同，所以結果一模一樣！</span>' : '');
      const prev = out.querySelector('.dim') && runs === 1 ? '' : out.innerHTML + '\n';
      out.innerHTML = (prev + block).split('\n').slice(-24).join('\n');
      out.scrollTop = out.scrollHeight;
    }
    C.onSeg(root, 'l5-h-mode', (v) => {
      mode = v;
      generate();
    });
    $('#l5-h-go').addEventListener('click', generate);
    nIn.addEventListener('input', () => ($('#l5-h-nlabel').textContent = nIn.value));
    nIn.addEventListener('change', generate);
    xIn.addEventListener('change', generate);
    yIn.addEventListener('change', generate);
    $('#l5-h-num').addEventListener('click', () => demo('num'));
    $('#l5-h-alpha').addEventListener('click', () => demo('alpha'));
    generate();
  }

  function mountPw(root) {
    const $ = (s) => root.querySelector(s);
    const inp = $('#l5-pw-in');
    const out = $('#l5-pw-out');
    let log = [];
    let finished = false;
    const RULES = [
      ['hasUpper', '大寫字母', 'uppercase letters', isupper],
      ['hasLower', '小寫字母', 'lowercase letters', islower],
      ['hasDigit', '數字', 'numbers', isdigit],
      ['hasSpecial', '特殊字元', 'special characters', ispunct],
    ];
    function check(pw) {
      const chars = Array.from(pw);
      return RULES.map((r) => chars.some(r[3]));
    }
    function messages(pw) {
      const f = check(pw);
      const lines = [];
      RULES.forEach((r, i) => {
        if (!f[i]) lines.push(`- Missing ${r[2]}`);
      });
      if (f.every(Boolean)) lines.push('Your password is secure.');
      else lines.push('Password requirements not met. Please try again.');
      return lines;
    }
    function render() {
      const pw = inp.value;
      const chars = Array.from(pw);
      $('#l5-pw-cells').innerHTML = chars.length
        ? chars
            .map((ch, i) => {
              const c = isupper(ch) ? 1 : islower(ch) ? 2 : isdigit(ch) ? 3 : ispunct(ch) ? 4 : 0;
              return `<div class="cell"${c ? ` data-c="${c}"` : ''}><span class="cell-idx">[${i}]</span><span class="cell-val">${esc(vis(ch))}</span><span class="cell-sub">${cc(ch)}</span></div>`;
            })
            .join('')
        : emptyCells('（還沒輸入）');
      const f = check(pw);
      $('#l5-pw-pills').innerHTML = RULES.map((r, i) => `<span class="${f[i] ? 'pill-ok' : 'pill-err'}">${r[0]} = ${f[i] ? 1 : 0}（${r[1]}）</span>`).join('');
      const n = f.filter(Boolean).length;
      const bar = $('#l5-pw-bar');
      bar.style.setProperty('--p', (n / 4) * 100 + '%');
      bar.textContent = `符合 ${n} / 4 項` + (n === 4 ? '：安全！' : '');
      let html = log.join('\n');
      if (!finished) {
        html += (html ? '\n' : '') + `Please enter a password: <span class="in">${esc(pw)}</span><span class="cursor"></span>`;
        if (pw) html += '\n<span class="dim">' + messages(pw).map((l) => '（預覽）' + esc(l)).join('\n') + '</span>';
      }
      out.innerHTML = html;
      out.scrollTop = out.scrollHeight;
    }
    function send() {
      if (finished) {
        log.push('<span class="dim">[程式已經結束，按「重新執行」再試一次]</span>');
        render();
        return;
      }
      const pw = inp.value;
      const lines = messages(pw);
      log.push(`Please enter a password: <span class="in">${esc(pw)}</span>`);
      lines.forEach((l) => log.push(/secure/.test(l) ? `<span class="in">${esc(l)}</span>` : esc(l)));
      log = log.slice(-30);
      if (check(pw).every(Boolean)) {
        finished = true;
        log.push('<span class="dim">[break 跳出 while(1)，return 0]</span>');
      }
      inp.value = '';
      render();
    }
    inp.addEventListener('input', render);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    });
    $('#l5-pw-send').addEventListener('click', send);
    root.querySelectorAll('#l5-pw [data-pw]').forEach((b) =>
      b.addEventListener('click', () => {
        inp.value = b.dataset.pw;
        render();
      })
    );
    $('#l5-pw-reset').addEventListener('click', () => {
      log = [];
      finished = false;
      inp.value = '';
      render();
    });
    render();
  }

  function mountMaze(root) {
    const $ = (s) => root.querySelector(s);
    const grid = $('#l5-mz-grid');
    const out = $('#l5-mz-out');
    const pre = $('#l5-mz-code');
    const mapTa = $('#l5-mz-map');
    const mapFb = $('#l5-mz-mapfb');
    let map = MAP_DEFAULT.split('\n');
    let H;
    let W;
    let sx;
    let sy;
    let px;
    let py;
    let steps;
    let over;
    let crash;
    let trail;
    let games = 0;
    let shakeT = null;
    function at(x, y) {
      if (x < 0 || y < 0 || x >= H || y >= W) return '*';
      const ch = map[x][y];
      return ch === undefined ? '*' : ch;
    }
    function start() {
      H = map.length;
      W = map[0].length;
      for (let i = 0; i < H; i++)
        for (let j = 0; j < map[i].length; j++)
          if (map[i][j] === 'S') {
            sx = i;
            sy = j;
          }
      px = sx;
      py = sy;
      steps = 0;
      over = null;
      crash = null;
      trail = new Set();
      games++;
      grid.style.setProperty('--cols', W);
      C.setLines(pre, [18, 19, 20]);
      $('#l5-mz-next').textContent = '—';
      render(`<span class="dim">第 ${games} 局開始</span>\n請用 W(上)A(左)S(下)D(右) 控制移動`);
    }
    function render(msg) {
      let html = '';
      for (let i = 0; i < H; i++)
        for (let j = 0; j < W; j++) {
          const ch = at(i, j);
          let cls = 'maze-cell';
          if (ch === '*') cls += ' is-wall';
          if (ch === 'S') cls += ' is-start';
          if (ch === 'E') cls += ' is-end';
          if (trail.has(i + ',' + j)) cls += ' is-trail';
          const here = crash ? crash[0] === i && crash[1] === j : px === i && py === j;
          if (here) cls += ' is-player';
          if (crash && here) cls += ' l5-crash';
          html += `<div class="${cls}"></div>`;
        }
      grid.innerHTML = html;
      $('#l5-mz-pos').textContent = `(${px}, ${py})`;
      $('#l5-mz-steps').textContent = steps;
      if (msg != null) out.innerHTML = msg;
    }
    function move(dir) {
      if (over) {
        out.innerHTML = `${over === 'win' ? '恭喜抵達終點！' : '撞到牆啦！Game Over.'}\n<span class="dim">遊戲已結束（while 迴圈已經 break）。按「重新開始」再玩一次。</span>`;
        return;
      }
      const D = { up: ['W', -1, 0, 23, 'nx--'], down: ['S', 1, 0, 24, 'nx++'], left: ['A', 0, -1, 25, 'ny--'], right: ['D', 0, 1, 26, 'ny++'] }[dir];
      if (!D) return;
      const nx = px + D[1];
      const ny = py + D[2];
      const ch = at(nx, ny);
      $('#l5-mz-next').textContent = `${D[0]}：${D[4]} → (${nx}, ${ny})`;
      if (ch === '*') {
        crash = [nx, ny];
        over = 'lose';
        C.setLines(pre, [D[3], 29, 2, 3, 4, 5]);
        render(`請用 W(上)A(左)S(下)D(右) 控制移動\n<span class="err">撞到牆啦！Game Over.</span>${
          nx < 0 || ny < 0 || nx >= H || ny >= W ? '\n<span class="dim">（走出地圖範圍：在 C 裡是存取陣列界外的未定義行為，這裡當作撞牆）</span>' : ''
        }`);
        grid.classList.remove('l5-shake');
        void grid.offsetWidth;
        grid.classList.add('l5-shake');
        if (shakeT) C.stop(shakeT);
        shakeT = C.after(() => grid.classList.remove('l5-shake'), 450);
        return;
      }
      trail.add(px + ',' + py);
      px = nx;
      py = ny;
      steps++;
      if (ch === 'E') {
        over = 'win';
        C.setLines(pre, [D[3], 29, 7, 8, 9, 10]);
        render(`請用 W(上)A(左)S(下)D(右) 控制移動\n<span class="in">恭喜抵達終點！</span>\n<span class="dim">共走了 ${steps} 步</span>`);
        return;
      }
      C.setLines(pre, [D[3], 29, 30, 31]);
      render(`請用 W(上)A(左)S(下)D(右) 控制移動\n<span class="dim">按下 ${D[0]}，check_position 回傳 1，移動到 (${px}, ${py})</span>`);
    }
    const KEYMAP = { w: 'up', W: 'up', ArrowUp: 'up', s: 'down', S: 'down', ArrowDown: 'down', a: 'left', A: 'left', ArrowLeft: 'left', d: 'right', D: 'right', ArrowRight: 'right' };
    // keys work while the maze or the d-pad has focus (never while typing in the map editor)
    $('#l5-mz').addEventListener('keydown', (e) => {
      if (e.target.closest('textarea, input, summary') || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!e.target.closest('#l5-mz-grid, #l5-mz-dpad')) return;
      const dir = KEYMAP[e.key];
      if (!dir) return;
      e.preventDefault();
      move(dir);
    });
    grid.addEventListener('click', () => grid.focus());
    $('#l5-mz-dpad').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-dir]');
      if (b) move(b.dataset.dir);
    });
    $('#l5-mz-restart').addEventListener('click', start);
    function loadMap(text) {
      const rows = text.replace(/\r/g, '').split('\n');
      while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
      const all = rows.join('');
      const nS = (all.match(/S/g) || []).length;
      const nE = (all.match(/E/g) || []).length;
      if (!rows.length || !rows[0].length) return '地圖是空的，第一行不能是空白行（寬度以第一行長度為準）。';
      if (rows.length > 20 || rows.some((r) => r.length > 20)) return '地圖最大 20 × 20。';
      if (nS !== 1) return `地圖必須剛好有一個 S（現在有 ${nS} 個）。`;
      if (nE !== 1) return `地圖必須剛好有一個 E（現在有 ${nE} 個）。`;
      const w = rows[0].length;
      for (const ch of ['S', 'E']) {
        const r = rows.findIndex((row) => row.includes(ch));
        if (rows[r].indexOf(ch) >= w) return `${ch} 在第 ${r + 1} 行的第 ${rows[r].indexOf(ch) + 1} 欄，超出地圖寬度（寬度以第一行長度 ${w} 為準）。`;
      }
      map = rows;
      return null;
    }
    $('#l5-mz-load').addEventListener('click', () => {
      const err = loadMap(mapTa.value);
      if (err) {
        mapFb.className = 'feedback is-err';
        mapFb.textContent = err;
        return;
      }
      mapFb.className = 'feedback is-ok';
      mapFb.textContent = `地圖載入成功：${map.length} 列 × ${map[0].length} 欄（width = strlen(map[0])）。`;
      start();
    });
    $('#l5-mz-default').addEventListener('click', () => {
      mapTa.value = MAP_DEFAULT;
      map = MAP_DEFAULT.split('\n');
      mapFb.className = 'feedback is-info';
      mapFb.textContent = '已還原課堂的 map.txt。';
      start();
    });
    start();
  }

  /* =========================================================
     Register
     ========================================================= */
  C.register({
    id: 'l5',
    order: 5,
    num: '05',
    title: '字元、字串、檔案與亂數',
    en: 'Character/String Functions, File I/O, and Randomization',
    lede: 'C 沒有內建的字串型態，只有以 \'\\0\' 結尾的字元陣列。這一講從鍵盤緩衝區出發，看 getchar 怎麼一次拿一個字元、string.h 怎麼一路走到 \'\\0\'、fgets 怎麼把檔案一行一行搬進記憶體，最後用 rand 產生（其實可預測的）亂數。',
    desc: 'getchar 與鍵盤緩衝區、ctype／string.h 函式、fgets 讀檔、rand 亂數，最後玩一場走迷宮。',
    tags: ['getchar', 'string.h', 'fopen', 'rand()'],
    objectives: [
      'getchar／putchar 與 ctype.h 常用字元函數的用法',
      'string.h 常用字串函式，以及 puts／fgets 安全讀取字串的方式',
      '如何用 fopen 開啟並讀取檔案內容',
      '如何用 rand／srand 產生隨機數值與隨機字母',
    ],
    sections: () => secGetchar() + secCtype() + secString() + secFgets() + secFile() + secRandom() + secPw() + secMaze(),
    recap: [
      'getchar／putchar 逐字元讀寫；scanf 遇空白會提前結束讀取',
      'ctype.h 提供 isalpha／isdigit 等字元判斷函數，string.h 提供字串處理函式',
      'fgets 搭配 strcspn 可以安全讀取一整行並去除換行符',
      'fopen 開檔要記得檢查是否為 NULL，讀完要 fclose',
      'srand(time(NULL)) 設定種子，rand() % (Y−X+1) + X 產生指定範圍亂數',
    ],
    practice: '完成簡易密碼檢查器，並試著把走迷宮遊戲的地圖換成你自己設計的關卡（可以先用上面的「自訂地圖」試玩）。',
    css: `
.l5-label { margin: var(--s3) 0 var(--s1); font-size: .8rem; font-weight: 500; color: var(--muted); }
.l5-label + .cells { margin-top: 0; }
.l5-empty { align-self: center; padding: 10px 4px; font-family: var(--font-mono); font-size: .8rem; color: var(--muted); }
.l5-wide { display: flex; width: 100%; }
.l5-wide input { width: 100%; }
.l5-grow { flex: 1 1 260px; display: flex; }
.l5-grow textarea { width: 100%; resize: vertical; }
.l5-col { display: flex; flex-direction: column; gap: var(--s3); }
.l5-ct th, .l5-ct td { text-align: center; padding: 4px 8px; font-family: var(--font-mono); white-space: nowrap; }
.l5-ct th[scope="row"] { text-align: left; }
.l5-ct thead small { display: block; font-size: .65rem; font-weight: 500; color: var(--muted); }
.l5-ct .l5-yes { color: var(--ok); font-weight: 700; }
.l5-ct .l5-no { color: var(--muted); opacity: .55; }
.l5-ct .l5-chg { color: var(--accent); font-weight: 700; }
.l5-ct tr.is-hi > * { background: var(--hi); }
.l5-arr { margin-top: var(--s4); }
.l5-arr .cells { margin-top: var(--s2); }
.l5-arr-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s2); font-size: .85rem; }
.l5-arr-head code { font-size: .78rem; color: var(--muted); background: none; }
.l5-hist-wrap { overflow-x: auto; }
.l5-hist { min-width: 260px; }
.l5-hist .bar-track { position: relative; }
.l5-hist .bar-label { font-size: .7rem; }
.l5-hist .bar-value { font-size: .62rem; color: var(--muted); }
.l5-exp { position: absolute; left: -3px; right: -3px; height: 0; border-top: 2px dashed var(--accent-2); pointer-events: none; }
#l5-mz-code { max-height: 340px; overflow: auto; }
.maze.l5-shake { animation: shake .4s; }
.maze-cell.l5-crash { background: color-mix(in srgb, var(--err) 55%, var(--surface)); }
.maze:focus-visible { outline: 3px solid var(--accent-2); outline-offset: 3px; }
.l5-details { margin-top: var(--s4); padding: var(--s3) var(--s4); border: 1px dashed var(--line-strong); border-radius: var(--r-sm); background: var(--surface); }
.l5-details summary { cursor: pointer; font-weight: 700; color: var(--ink); }
.l5-details textarea { display: block; width: 100%; margin: var(--s2) 0; font-family: var(--font-mono); line-height: 1.2; }
#l5-pw-bar { margin: var(--s3) 0; }
`,
    mount(root) {
      mountGetchar(root);
      mountCtype(root);
      mountStrLab(root);
      mountFgets(root);
      mountFile(root);
      mountRng(root);
      mountHist(root);
      mountPw(root);
      mountMaze(root);
    },
  });
})();
