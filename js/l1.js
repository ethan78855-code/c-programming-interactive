/* Lecture 01 — Introduction to Computers and C Programming */
(function () {
  'use strict';

  const HELLO = `/* The first program */
#include <stdio.h>

int main()              // 主程式
{
    printf("Hello CCU!\\n");   // 印出一行字
    return 0;                 // 結束程式
}`;

  const HELLO_NOTES = [
    ['多行註解 /* … */', '用 <code>/*</code> 和 <code>*/</code> 包住的文字是<strong>註解</strong>，給人看的說明，編譯器會直接忽略。這種寫法可以跨好幾行。'],
    ['前置處理指令 #include', '以 <code>#</code> 開頭的是<strong>前置處理指令</strong>，在正式編譯「之前」就先被處理。<code>#include &lt;stdio.h&gt;</code> 把標準輸入輸出函式庫的<strong>標頭檔</strong>引入，這樣才能使用 <code>printf</code>、<code>scanf</code>。'],
    ['空行', '空行對編譯器沒有任何意義，但能把程式分段，讓人更好閱讀。'],
    ['main 函式：程式的進入點', '每個 C 程式都<strong>必須有、而且只能有一個</strong> <code>main</code> 函式。程式從 main 開始執行，也在 main 結束時結束。後面的 <code>// 主程式</code> 是<strong>單行註解</strong>。'],
    ['區塊開始 {', '大括號 <code>{ }</code> 包住的範圍稱為一個<strong>區塊（block）</strong>，這裡是 main 函式的主體。'],
    ['敘述式與 printf', '<code>printf()</code> 把文字輸出到螢幕；<code>\\n</code> 是<strong>跳脫序列</strong>，代表換行。每個<strong>敘述式（statement）</strong>都以分號 <code>;</code> 結尾。'],
    ['回傳值 return 0', '函式結束時回傳一個值代表執行結果。依照慣例 <code>return 0;</code> 代表「程式正常結束」；若省略，main 預設也會回傳 0。'],
    ['區塊結束 }', '對應第 5 行的 <code>{</code>，main 函式到此結束。'],
  ];

  const BUGS = {
    ok: { label: '正確版本', code: HELLO, stage: null },
    semi: {
      label: '少了分號',
      code: HELLO.replace('printf("Hello CCU!\\n");', 'printf("Hello CCU!\\n") '),
      stage: 'compile',
      line: 6,
      msg: "hello.c: In function 'main':\nhello.c:6:28: error: expected ';' before 'return'\n    6 |     printf(\"Hello CCU!\\n\")    // 印出一行字\n      |                            ^\n      |                            ;",
      why: '敘述式一定要用分號結尾。編譯器讀到下一行的 <code>return</code> 才發現上一句沒結束，所以錯誤位置常常指在「下一行」。',
    },
    typo: {
      label: '把 printf 拼錯',
      code: HELLO.replace('printf(', 'prinft('),
      stage: 'link',
      line: 6,
      msg: "hello.c:6:5: warning: implicit declaration of function 'prinft'; did you mean 'printf'?\n...\nld: hello.o: in function `main':\nhello.c:(.text+0x1e): undefined reference to `prinft'\ncollect2.exe: error: ld returned 1 exit status",
      why: '編譯器只看單一檔案，找不到 <code>prinft</code> 的宣告時只會警告；真正去找「實作在哪裡」的是<strong>連結器</strong>，函式庫裡沒有 prinft，於是在<strong>連結階段</strong>失敗。',
    },
    include: {
      label: '少了 #include',
      code: HELLO.replace('#include <stdio.h>\n', ''),
      stage: 'compile',
      line: 5,
      msg: "hello.c: In function 'main':\nhello.c:5:5: error: implicit declaration of function 'printf' [-Wimplicit-function-declaration]\nhello.c:1:1: note: include '<stdio.h>' or provide a declaration of 'printf'",
      why: '沒有引入 <code>stdio.h</code>，編譯器不認識 <code>printf</code>。舊版編譯器只會警告，新版 GCC（14 之後）直接視為錯誤，還會貼心地提示你該 include 哪個標頭檔。',
    },
    brace: {
      label: '少了右大括號',
      code: HELLO.replace(/\n}$/, ''),
      stage: 'compile',
      line: 7,
      msg: "hello.c: In function 'main':\nhello.c:7:5: error: expected declaration or statement at end of input\n    7 |     return 0;                 // 結束程式\n      |     ^~~~~~",
      why: '每個 <code>{</code> 都需要一個對應的 <code>}</code>。檔案讀完了區塊卻還沒關閉，編譯器只好在檔案結尾報錯。',
    },
  };

  const ADD = `#include <stdio.h>
int add(int x, int y);

int main(){
    int result;
    result = add(A, B);
    printf("The result is: %d\\n", result);
    return 0;
}

int add(int x, int y){
    return x + y;
}`;

  const STYLES = {
    kr: {
      label: 'K&amp;R 風格',
      code: `int main() {
    int i;
    for (i = 0; i < 3; i++) {
        printf("%d\\n", i);
    }
    return 0;
}`,
      note: '左大括號放在<strong>同一行</strong>的尾端。出自 C 語言作者 Kernighan &amp; Ritchie 的經典教科書，程式碼較緊湊。',
    },
    allman: {
      label: 'Allman 風格',
      code: `int main()
{
    int i;
    for (i = 0; i < 3; i++)
    {
        printf("%d\\n", i);
    }
    return 0;
}`,
      note: '左大括號<strong>另起一行</strong>，和右大括號上下對齊，區塊邊界一眼就看得出來。',
    },
    none: {
      label: '沒有縮排（反例）',
      code: `int main() {
int i;
for (i = 0; i < 3; i++) {
printf("%d\\n", i);
}
return 0;
}`,
      note: '編譯器照樣能編譯、執行結果也<strong>完全相同</strong>，但人很難看出哪一行屬於哪個區塊。請不要這樣寫！',
    },
  };

  const ESC_PRESETS = [
    ['Hello', 'Hello CCU!\\n'],
    ['\\t 對齊', 'Name:\\tAnn\\nScore:\\t100%%\\n'],
    ['引號', 'He said \\"Hi\\" and \'Bye\'\\n'],
    ['反斜線', 'C:\\\\Users\\\\ccu\\n'],
    ['\\r 回行首', '12345\\rAB\\n'],
    ['\\b 倒退', 'abc\\bX\\n'],
    ['\\0 結尾', 'Hello\\0World\\n'],
    ['練習：LV', '*       *     *\\n*        *   *\\n*         * *\\n*****      *\\n'],
  ];

  const HW = [
    ['鍵盤', 'hw'], ['printf 印出文字的程式', 'sw'], ['記憶體（RAM）', 'hw'], ['作業系統 Windows', 'sw'],
    ['處理器（CPU）', 'hw'], ['你寫的 hello.exe', 'sw'], ['硬碟', 'hw'], ['VS Code 編輯器', 'sw'], ['螢幕', 'hw'], ['編譯器 gcc', 'sw'],
  ];

  const PROMPT_ADDS = [
    ['count', '要多少個數字？', '使用者先輸入要計算幾個數字 n（1 ≤ n ≤ 100），接著輸入 n 個數字。'],
    ['format', '輸入格式？', '數字之間用空白或換行分隔，可以是整數或小數。'],
    ['sign', '允許正負？', '數字可以是正數、負數或 0。'],
    ['error', '例外和錯誤處理？', '如果 n 不在範圍內，或輸入了不是數字的內容，就印出錯誤訊息並請使用者重新輸入。'],
  ];

  const PIPE_STEPS = [
    { on: ['src'], done: [], title: '① 撰寫原始碼', text: '開發者用文字編輯器寫好高階的 C 程式碼，存成 <code>hello.c</code>。這時電腦<strong>還無法直接執行</strong>，必須經過轉換。' },
    { on: ['cc'], done: ['src'], arrows: [0], title: '② 編譯器（Compiler）運作', text: '編譯器檢查<strong>語法錯誤</strong>，並把人類易讀的 C 程式碼翻譯成機器語言。這個階段<strong>只處理單一原始碼檔案</strong>。' },
    { on: ['obj'], done: ['src', 'cc'], arrows: [0, 1], title: '③ 產生目的碼 hello.o', text: '得到二進位的<strong>目的檔（object file）</strong>。不過裡面只有「呼叫 printf」的指令，<strong>printf 本身的實作還不在這裡</strong>。' },
    { on: ['ld', 'lib', 'start'], done: ['src', 'cc', 'obj'], arrows: [0, 1, 2], title: '④ 連結器（Linker）組裝', text: '連結器把 <code>hello.o</code>、<strong>系統函式庫</strong>（例如 stdio 的 printf 實作）與<strong>啟動碼</strong>（進入 main 之前做環境初始化、記憶體配置、和作業系統交接）全部打包、組合並重新安排位址。' },
    { on: ['exe'], done: ['src', 'cc', 'obj', 'ld', 'lib', 'start'], arrows: [0, 1, 2, 3], title: '⑤ 執行檔 hello.exe 誕生', text: '得到完整的可執行檔，作業系統可以直接載入並執行。為什麼需要連結？因為單一檔案往往無法獨立運作，連結器把多個模組和現成函式庫無縫拼裝在一起。', run: true },
  ];

  function pipelineHtml() {
    const node = (k, cls, main, sub) =>
      `<button type="button" class="flow-node ${cls}" data-node="${k}">${main}<small>${sub}</small></button>`;
    const arrow = (k) => `<div class="flow-arrow" data-arrow="${k}"></div>`;
    return `
      <div class="flow l1-flow">
        ${node('src', 'flow-node--file', 'hello.c', '原始碼')}${arrow(0)}
        ${node('cc', 'flow-node--tool', '編譯器', 'Compiler')}${arrow(1)}
        ${node('obj', 'flow-node--file', 'hello.o', '目的碼')}${arrow(2)}
        ${node('ld', 'flow-node--tool', '連結器', 'Linker')}${arrow(3)}
        ${node('exe', 'flow-node--file', 'hello.exe', '執行檔')}
      </div>
      <div class="l1-flow-extra">
        <span class="l1-extra-label">一起送進連結器 ↗</span>
        <div class="flow">
          ${node('lib', 'flow-node--file', '系統函式庫', 'Library code')}
          ${node('start', 'flow-node--file', '啟動碼', 'Startup code')}
        </div>
      </div>
      <div class="l1-pipe-detail" aria-live="polite">
        <h5 id="l1-pipe-title"></h5>
        <p id="l1-pipe-text"></p>
        <div class="console" data-title="執行 hello.exe" id="l1-pipe-console" hidden></div>
      </div>`;
  }

  C.register({
    id: 'l1',
    order: 1,
    num: '01',
    title: '電腦與 C 程式入門',
    en: 'Introduction to Computers and C Programming',
    lede: '電腦是「硬體＋軟體」，程式就是指揮硬體做事的一組指令。這一講從為什麼要學程式開始，帶你看一支 C 程式如何從原始碼變成執行檔，並逐行拆解第一支程式 Hello CCU。',
    desc: '硬體與軟體、從 hello.c 到 hello.exe 的編譯與連結、main 函式、printf 與跳脫序列。',
    tags: ['編譯與連結', 'main', 'printf', '跳脫序列'],
    objectives: [
      '電腦如何透過「硬體＋軟體」運作，程式碼扮演的角色',
      '一支 C 程式從原始碼到可執行檔，經過哪些步驟',
      '如何建立開發環境，寫出、編譯並執行第一支 C 程式',
      'C 程式的基本組成：前置處理、main 函式、敘述式',
    ],
    recap: [
      '電腦 = 硬體 + 軟體；程式是指揮硬體做事的指令',
      '原始碼要經過「編譯 → 連結」才會變成可執行檔',
      '一支 C 程式至少要有：<code>#include</code>、<code>int main()</code>、以分號結尾的敘述式',
      '函式能把程式拆成小任務，讓程式更好讀、好除錯',
    ],
    practice: '修改 <code>printf()</code> 的輸出文字，讓畫面能印出由 <code>*</code> 組成的大寫字母 <strong>LV</strong>。（提示：到「跳脫序列」的遊樂場點「練習：LV」看看一種參考做法。）',

    sections() {
      return [
        C.section(
          'l1-why',
          '01',
          '為什麼要學程式設計',
          C.cards([
            { num: '01', title: '理論與計算的橋樑', body: '<p>把數學模型、公式轉換成電腦可執行的工具；數值計算與模擬都建立在程式之上。</p>' },
            { num: '02', title: '自動化重複的計算', body: '<p>把大量重複的運算交給程式完成，把時間留給真正需要思考的部分。</p>' },
            { num: '03', title: '訓練結構化的解題力', body: '<p>拆解問題、設計流程、除錯驗證——這是跨領域都通用的核心能力。</p>' },
          ]) +
            `<h3>有了 AI 幫忙寫 Code，為什麼還要學？</h3>` +
            C.prose(`<p>有計算機了，為什麼還要學四則運算？有 GPS 了，為什麼還要學看地圖？同樣的道理：</p>
<ul>
<li>你必須要能<strong>「審查」AI 寫的程式碼</strong>，判斷它對不對。</li>
<li>C 是在教你<strong>「電腦怎麼運作」</strong>，不只是在教語法。</li>
<li>下 prompt 給 AI 本身就需要程式語言的能力——你得知道要把什麼講清楚。</li>
</ul>`) +
            C.widget({
              id: 'l1-prompt',
              title: '把需求說清楚：一個 prompt 的進化',
              tag: '互動',
              hint: '「幫我寫一個程式算平均」其實很模糊。點下面的問題，把缺少的規格補進 prompt。',
              body: `
                <div class="l1-prompt-box">
                  <p class="l1-prompt-text" id="l1-prompt-text"></p>
                </div>
                <div class="progress" id="l1-prompt-meter" style="--p:0%">規格完整度 0%</div>
                <p class="feedback" id="l1-prompt-fb"></p>`,
              controls: PROMPT_ADDS.map(([k, q]) => `<button type="button" class="chip" data-add="${k}" aria-pressed="false">${q}</button>`).join('') +
                '<span class="spacer"></span><button type="button" class="btn btn--sm btn--ghost" data-act="prompt-reset">⟲ 重設</button>',
            })
        ),
        C.section(
          'l1-hwsw',
          '02',
          '電腦如何運作：硬體與軟體',
          C.cards([
            { num: 'HW', title: '硬體 Hardware', body: '<p>鍵盤、螢幕、滑鼠、硬碟、記憶體、處理器……這些<strong>看得到、摸得到</strong>的裝置統稱為硬體。</p>' },
            { num: 'SW', title: '軟體 Software', body: '<p>由人撰寫的一組指令，<strong>指揮硬體</strong>執行動作並做出判斷；程式依序處理資料，完成特定任務。</p>' },
          ]) +
            C.callout('key', '一句話記住', '<p><strong>程式（program）</strong>＝讓電腦知道「做什麼」與「怎麼做」的一組指令。</p>') +
            C.widget({
              id: 'l1-hw',
              title: '小測驗：這是硬體還是軟體？',
              tag: '測驗',
              hint: '看得到摸得到的是硬體；一組指令則是軟體。',
              body: `
                <div class="l1-sorter">
                  <div class="l1-sorter-item" id="l1-hw-item"></div>
                  <div class="btn-group">
                    <button type="button" class="btn btn--primary" data-ans="hw">🖐 硬體</button>
                    <button type="button" class="btn btn--primary" data-ans="sw">📄 軟體</button>
                  </div>
                </div>
                <p class="feedback" id="l1-hw-fb"></p>
                <dl class="kv"><div><dt>題目</dt><dd id="l1-hw-n">1 / 10</dd></div><div><dt>答對</dt><dd id="l1-hw-score">0</dd></div></dl>`,
              controls: '<button type="button" class="btn btn--sm" data-act="hw-next">下一題 →</button><span class="spacer"></span><button type="button" class="btn btn--sm btn--ghost" data-act="hw-reset">⟲ 重新開始</button>',
            })
        ),
        C.section(
          'l1-whyc',
          '03',
          '程式語言的選擇：為什麼是 C？',
          C.prose(`<p>程式語言是人與電腦溝通的媒介，不同語言各有適合的應用場景。</p>
<ul>
<li>C 語言<strong>歷史悠久、語法精簡</strong>，是許多現代語言（C++、Java…）的設計基礎。</li>
<li>學好 C，能更早接觸<strong>記憶體、資料型態</strong>等底層概念，之後學其他語言會更快上手。</li>
<li>想了解各語言的流行程度，可參考 TIOBE Index 排行榜（tiobe.com/tiobe-index）。</li>
</ul>`) +
            `<h3>建立開發環境（IDE）</h3>` +
            C.prose(`<p>記事本也能寫程式，但沒有語法提示、除錯工具，效率較低。建議使用<strong>整合開發環境（IDE）</strong>，例如 Code::Blocks、Dev-C++、VS Code。這門課建議安裝 <strong>VS Code 或 Code::Blocks</strong>，並同時安裝 <strong>MinGW 編譯器</strong>。</p>`) +
            C.callout('tip', 'IDE 幫你做了什麼？', '<p>按下「建置並執行」時，IDE 其實在背後依序呼叫了<strong>編譯器</strong>與<strong>連結器</strong>，再幫你執行產生的 .exe——下一節就把這個過程拆開來看。</p>')
        ),
        C.section(
          'l1-pipeline',
          '04',
          '從原始碼到執行檔：編譯與連結',
          C.prose('<p>文字編輯器寫好 <code>hello.c</code> 後，先「<strong>編譯</strong>」成 <code>hello.o</code>，再與系統函式庫、啟動碼一起「<strong>連結</strong>」成執行檔 <code>hello.exe</code>。按「下一步」或直接點任一個方塊，看看每個階段在做什麼。</p>') +
            C.widget({
              id: 'l1-pipe',
              title: '編譯 → 連結 流程動畫',
              tag: '逐步',
              hint: '方塊可以點，會直接跳到該階段。',
              body: pipelineHtml(),
              controls: '<div id="l1-pipe-stepper"></div>',
            })
        ),
        C.section(
          'l1-hello',
          '05',
          '第一支 C 程式：Hello CCU',
          C.prose('<p>把下面的程式存成 <code>hello.c</code>，用 IDE 編譯並執行後，畫面會印出 <code>Hello CCU!</code>。<strong>點選任一行程式碼</strong>，右邊會解釋這一行在做什麼。</p>') +
            C.widget({
              id: 'l1-anat',
              title: '逐行拆解 hello.c',
              tag: '點選',
              hint: '點程式碼的每一行，或用下方按鈕執行程式。',
              body: `<div class="widget-split">
                  <div>${C.code(HELLO, { id: 'l1-hello-code', cls: 'l1-clickable' })}</div>
                  <div>
                    <div class="l1-note" id="l1-hello-note"><h5>👈 點一行程式碼</h5><p>每一行都有它的任務：前置處理、main 函式、敘述式、回傳值……</p></div>
                    <div class="console" data-title="輸出" id="l1-hello-out"><span class="dim">（尚未執行）</span></div>
                  </div>
                </div>`,
              controls: '<button type="button" class="btn btn--primary" data-act="hello-run">▶ 編譯並執行</button><button type="button" class="btn" data-act="hello-tour">逐行導覽</button><span class="spacer"></span><button type="button" class="btn btn--ghost btn--sm" data-act="hello-clear">清除輸出</button>',
            }) +
            `<h3>如果寫錯了會怎樣？</h3>` +
            C.prose('<p>初學者最常遇到的錯誤，有些在<strong>編譯階段</strong>就被抓到，有些要到<strong>連結階段</strong>才爆出來。選一種錯誤，看看編譯器（GCC / MinGW）會怎麼說。</p>') +
            C.widget({
              id: 'l1-bugs',
              title: '錯誤製造機',
              tag: '互動',
              hint: '切換不同的錯誤版本，對照錯誤訊息與發生的階段。',
              body: `<div class="widget-split">
                  <div id="l1-bug-code"></div>
                  <div>
                    <div class="flow l1-mini-flow">
                      <div class="flow-node" data-stage="compile">編譯</div><div class="flow-arrow"></div>
                      <div class="flow-node" data-stage="link">連結</div><div class="flow-arrow"></div>
                      <div class="flow-node" data-stage="run">執行</div>
                    </div>
                    <div class="console" data-title="編譯器訊息" id="l1-bug-msg"></div>
                    <p class="feedback" id="l1-bug-why"></p>
                  </div>
                </div>`,
              controls: C.seg('bug', Object.entries(BUGS).map(([k, v]) => [k, v.label]), 'ok', '選擇錯誤類型'),
            })
        ),
        C.section(
          'l1-func',
          '06',
          '函式初探',
          C.prose(`<p>函式分兩種：<strong>函式庫裡已經寫好的</strong>（include 之後直接呼叫，例如 <code>printf()</code>、<code>scanf()</code>），以及<strong>自己寫的</strong>（在其他函式裡呼叫它）。一個函式的長相如下，點每個部分看說明：</p>`) +
            C.widget({
              id: 'l1-fanat',
              title: '函式的組成',
              tag: '點選',
              body: `<div class="l1-anatomy" role="group" aria-label="函式組成">
                  <button type="button" class="l1-part" data-c="1" data-part="0">int</button>
                  <button type="button" class="l1-part" data-c="2" data-part="1">add</button><span class="l1-punct">(</span><button type="button" class="l1-part" data-c="3" data-part="2">int x, int y</button><span class="l1-punct">) {</span>
                  <br><span class="l1-indent"></span><button type="button" class="l1-part" data-c="4" data-part="3">return x + y;</button>
                  <br><span class="l1-punct">}</span>
                </div>
                <p class="feedback is-info" id="l1-fanat-fb">格式：<code>[回傳值的型別] [function 名稱] ([傳進來的參數]) { [function 主體] return [回傳的值] }</code></p>`,
            }) +
            `<h3>為什麼要把程式拆成函式？</h3>` +
            C.cards([
              { num: '01', title: '化整為零', body: '<p>把大任務拆成小任務，每個函式只負責一件事。</p>' },
              { num: '02', title: '好除錯、好維護', body: '<p>出錯時可以一個一個函式檢查，不必整支程式重寫。</p>' },
              { num: '03', title: '可重複使用', body: '<p>寫好的函式可以重複呼叫，避免一直複製貼上。</p>' },
            ]) +
            C.callout('tip', '整理房間的比喻', '<p>整理房間時，你不會把所有東西都塞進同一個櫃子——要找東西時會很麻煩。同理，把所有程式都塞在 main 裡，出錯時要從頭慢慢找還是整個砍掉重練？有寫 function 的話，就能一個一個檢查，不僅有效率，畫面也簡潔。</p>') +
            C.widget({
              id: 'l1-add',
              title: '追蹤 add(6, 8) 的呼叫過程',
              tag: '逐步',
              hint: '可以改傳入的兩個數字再重新追蹤。%d 是格式指定字，代表用 10 進位整數印出變數。',
              body: `<div class="widget-split">
                  <div id="l1-add-code"></div>
                  <div>
                    <div class="stack" id="l1-add-stack"></div>
                    <p class="feedback is-info" id="l1-add-note"></p>
                    <div class="console" data-title="輸出" id="l1-add-out"></div>
                  </div>
                </div>`,
              controls: `<div id="l1-add-stepper"></div><span class="spacer"></span>
                ${C.field('第一個引數', '<input type="number" id="l1-add-a" value="6" min="-999" max="999" style="width:6em">')}
                ${C.field('第二個引數', '<input type="number" id="l1-add-b" value="8" min="-999" max="999" style="width:6em">')}`,
            })
        ),
        C.section(
          'l1-style',
          '07',
          '區塊、縮排與程式碼風格',
          C.prose(`<ul>
<li>以大括號 <code>{ }</code> 包住的程式碼稱為一個<strong>區塊（block）</strong>。</li>
<li>區塊內的敘述式建議都<strong>往內縮排一層</strong>（一個 tab），方便閱讀。</li>
<li>團隊或大型專案常會遵循統一的 coding style。左大括號放同一行（K&amp;R）或另起一行（Allman），<strong>效果相同，選一種風格用到底</strong>。</li>
</ul>`) +
            C.widget({
              id: 'l1-style-w',
              title: 'K&R vs Allman：同一段程式，三種排版',
              tag: '切換',
              body: `<div class="widget-split"><div id="l1-style-code"></div><div><p class="feedback is-info" id="l1-style-note"></p><div class="console" data-title="執行結果（三種寫法都一樣）">0\n1\n2</div></div></div>`,
              controls: C.seg('style', Object.entries(STYLES).map(([k, v]) => [k, v.label]), 'kr', '程式碼風格'),
            })
        ),
        C.section(
          'l1-escape',
          '08',
          '跳脫序列（escape sequence）',
          C.prose(`<p>用反斜線 <code>\\</code> 加上一個字元，表示螢幕上打不出來的特殊字元，例如換行、tab。反斜線稱為<strong>跳脫字元（escape character）</strong>：編譯器看到它時，會和下一個字元組成跳脫序列。</p>`) +
            C.table(
              ['跳脫序列', '說明'],
              [
                ['<code>\\n</code>', '換行（newline）'],
                ['<code>\\t</code>', '水平 tab（跳到下一個 8 的倍數欄位）'],
                ['<code>\\\\</code>', '反斜線'],
                ["<code>\\'</code>", '單引號'],
                ['<code>\\"</code>', '雙引號'],
                ['<code>\\0</code>', '字串結尾、空字元（null character）'],
                ['<code>\\r</code>', '回行首（carriage return）'],
                ['<code>\\b</code>', '倒退鍵（backspace）'],
              ]
            ) +
            C.callout('warn', '% 不是跳脫序列', '<p><code>%</code> 在 printf 裡有特別意義（格式指定字的開頭），要印出 % 本身必須寫成 <code>%%</code>。</p>') +
            C.widget({
              id: 'l1-esc',
              title: '跳脫序列遊樂場',
              tag: '互動',
              hint: '在雙引號裡輸入文字（就像寫在 printf 裡），下方即時顯示真正存進記憶體的字元與螢幕上的樣子。',
              body: `
                <label class="field field--inline l1-esc-field"><span>printf("</span><input type="text" id="l1-esc-in" spellcheck="false" autocomplete="off"><span>");</span></label>
                <div class="cells cells--tight" id="l1-esc-cells"></div>
                <div class="console" data-title="螢幕輸出" id="l1-esc-out"></div>
                <p class="feedback" id="l1-esc-fb"></p>`,
              controls: ESC_PRESETS.map(([l, v], k) => `<button type="button" class="chip" data-preset="${k}">${C.esc(l)}</button>`).join(''),
            })
        ),
      ].join('');
    },

    css: `
      .l1-flow { flex-wrap: wrap; }
      .l1-flow .flow-node, .l1-flow-extra .flow-node { cursor: pointer; font: inherit; }
      .l1-flow-extra { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s3); margin-left: auto; justify-content: flex-end; }
      .l1-flow-extra .flow { gap: var(--s3); }
      .l1-extra-label { font-family: var(--font-mono); font-size: .8rem; color: var(--muted); }
      .l1-pipe-detail { border: 1px dashed var(--line-strong); border-radius: var(--r-sm); padding: var(--s4); background: var(--surface); }
      .l1-pipe-detail h5, .l1-note h5 { margin: 0 0 var(--s2); font-size: 1rem; color: var(--ink); }
      .l1-pipe-detail p, .l1-note p { margin: 0; color: var(--ink-2); line-height: 1.75; }
      .l1-pipe-detail .console { margin-top: var(--s3); }
      .l1-clickable .line { cursor: pointer; }
      .l1-clickable .line:hover { background: color-mix(in srgb, var(--accent-2) 14%, transparent); }
      .l1-note { border-left: 4px solid var(--accent-2); padding: var(--s3) var(--s4); background: var(--surface-2); border-radius: 0 var(--r-sm) var(--r-sm) 0; margin-bottom: var(--s4); min-height: 7.5em; }
      .l1-prompt-box { border: 1px solid var(--line-strong); border-radius: var(--r-sm); background: var(--surface); padding: var(--s4); }
      .l1-prompt-text { margin: 0; line-height: 1.9; }
      .l1-prompt-text .l1-added { background: var(--hi); color: #1b2033; border-radius: 3px; padding: 0 2px; }
      .l1-sorter { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s4); }
      .l1-sorter-item { flex: 1 1 220px; font-family: var(--font-serif); font-weight: 900; font-size: 1.45rem; color: var(--ink); padding: var(--s3) var(--s4); border: 2px dashed var(--line-strong); border-radius: var(--r-sm); text-align: center; }
      .l1-anatomy { font-family: var(--font-mono); font-size: 1.05rem; line-height: 2.6; background: var(--code-bg); color: var(--code-ink); padding: var(--s4) var(--s5); border-radius: var(--r-sm); }
      .l1-part { font: inherit; color: inherit; background: transparent; border: 0; border-bottom: 3px solid var(--c, var(--accent)); padding: 0 4px; cursor: pointer; border-radius: 3px 3px 0 0; }
      .l1-part[data-c="1"] { --c: var(--c1); } .l1-part[data-c="2"] { --c: var(--c2); } .l1-part[data-c="3"] { --c: var(--c3); } .l1-part[data-c="4"] { --c: var(--c4); }
      .l1-part:hover, .l1-part.is-on { background: color-mix(in srgb, var(--c) 35%, transparent); }
      .l1-indent { display: inline-block; width: 2.4em; }
      .l1-mini-flow .flow-node { min-width: 0; }
      .l1-esc-field { display: flex; width: 100%; align-items: center; gap: 4px; flex-wrap: nowrap; font-family: var(--font-mono); font-size: .95rem; }
      .l1-esc-field > span { white-space: nowrap; color: var(--muted); }
      .l1-esc-field input { flex: 1; min-width: 0; font-family: var(--font-mono); }
      #l1-esc-cells .cell { min-width: 2.2em; }
    `,

    mount(root) {
      const $ = (s) => root.querySelector(s);
      const $$ = (s) => Array.from(root.querySelectorAll(s));

      /* ---- prompt builder ---- */
      const promptOn = new Set();
      const renderPrompt = () => {
        const base = '幫我寫一個程式，可以讀使用者輸入的數字，然後算平均。';
        const adds = PROMPT_ADDS.filter(([k]) => promptOn.has(k)).map(([, , t]) => `<span class="l1-added">${t}</span>`);
        $('#l1-prompt-text').innerHTML = base + (adds.length ? ' ' + adds.join(' ') : '');
        const pct = Math.round((promptOn.size / PROMPT_ADDS.length) * 100);
        const m = $('#l1-prompt-meter');
        m.style.setProperty('--p', pct + '%');
        m.textContent = `規格完整度 ${pct}%`;
        const fb = $('#l1-prompt-fb');
        const missing = PROMPT_ADDS.filter(([k]) => !promptOn.has(k)).map(([, q]) => q);
        fb.className = 'feedback ' + (missing.length ? 'is-info' : 'is-ok');
        fb.innerHTML = missing.length
          ? `AI 還得自己猜：${missing.join('、')}`
          : '規格完整了！能把需求寫得這麼精確，靠的正是對程式（輸入、輸出、例外處理）的理解。';
      };
      root.querySelector('#l1-prompt .widget-controls').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.act === 'prompt-reset') {
          promptOn.clear();
          $$('#l1-prompt [data-add]').forEach((c) => {
            c.classList.remove('is-on');
            c.setAttribute('aria-pressed', 'false');
          });
        } else if (b.dataset.add) {
          const k = b.dataset.add;
          promptOn.has(k) ? promptOn.delete(k) : promptOn.add(k);
          b.classList.toggle('is-on', promptOn.has(k));
          b.setAttribute('aria-pressed', String(promptOn.has(k)));
        }
        renderPrompt();
      });
      renderPrompt();

      /* ---- hardware / software quiz ---- */
      let hwOrder = [];
      let hwI = 0;
      let hwScore = 0;
      let hwAnswered = false;
      const shuffle = (a) => {
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };
      const hwReset = () => {
        hwOrder = shuffle(HW.slice());
        hwI = 0;
        hwScore = 0;
        hwShow();
      };
      const hwShow = () => {
        hwAnswered = false;
        const done = hwI >= hwOrder.length;
        $('#l1-hw-item').textContent = done ? `完成！${hwScore} / ${hwOrder.length}` : hwOrder[hwI][0];
        $('#l1-hw-n').textContent = `${Math.min(hwI + 1, hwOrder.length)} / ${hwOrder.length}`;
        $('#l1-hw-score').textContent = hwScore;
        $$('#l1-hw [data-ans]').forEach((b) => (b.disabled = done));
        const fb = $('#l1-hw-fb');
        fb.className = 'feedback' + (done ? ' is-info' : '');
        fb.textContent = done ? '按「重新開始」再玩一次。' : '';
        $('#l1-hw [data-act="hw-next"]').disabled = true;
      };
      root.querySelector('#l1-hw').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.ans && !hwAnswered && hwI < hwOrder.length) {
          hwAnswered = true;
          const [name, ans] = hwOrder[hwI];
          const ok = b.dataset.ans === ans;
          if (ok) hwScore++;
          const fb = $('#l1-hw-fb');
          fb.className = 'feedback ' + (ok ? 'is-ok' : 'is-err');
          fb.textContent = (ok ? '答對！' : '再想想：') + `「${name}」是${ans === 'hw' ? '硬體——看得到、摸得到的裝置' : '軟體——一組指揮硬體的指令'}。`;
          $('#l1-hw-score').textContent = hwScore;
          $$('#l1-hw [data-ans]').forEach((x) => (x.disabled = true));
          $('#l1-hw [data-act="hw-next"]').disabled = false;
        } else if (b.dataset.act === 'hw-next') {
          hwI++;
          hwShow();
        } else if (b.dataset.act === 'hw-reset') hwReset();
      });
      hwReset();

      /* ---- pipeline ---- */
      let typeTimer = null;
      const typeOut = (el, text, speed = 45) => {
        if (typeTimer) C.stop(typeTimer);
        el.textContent = '';
        if (C.reduced()) {
          el.textContent = text;
          return;
        }
        let k = 0;
        typeTimer = C.every(() => {
          k++;
          el.textContent = text.slice(0, k);
          if (k >= text.length) {
            C.stop(typeTimer);
            typeTimer = null;
          }
        }, speed);
      };
      const pipeRender = (i) => {
        const s = PIPE_STEPS[i];
        $$('#l1-pipe .flow-node').forEach((n) => {
          n.classList.toggle('is-active', s.on.includes(n.dataset.node));
          n.classList.toggle('is-done', s.done.includes(n.dataset.node));
        });
        $$('#l1-pipe .flow-arrow').forEach((a) => {
          const k = +a.dataset.arrow;
          a.classList.toggle('is-done', (s.arrows || []).includes(k) && k < (s.arrows || []).length - 1);
          a.classList.toggle('is-active', (s.arrows || []).length - 1 === k);
        });
        $('#l1-pipe-title').innerHTML = s.title;
        $('#l1-pipe-text').innerHTML = s.text;
        const con = $('#l1-pipe-console');
        con.hidden = !s.run;
        if (s.run) typeOut(con, '> hello.exe\nHello CCU!');
      };
      const pipe = C.stepper($('#l1-pipe-stepper'), { count: PIPE_STEPS.length, render: pipeRender, interval: 1800 });
      $$('#l1-pipe .flow-node').forEach((n) =>
        n.addEventListener('click', () => {
          const k = PIPE_STEPS.findIndex((s) => s.on.includes(n.dataset.node));
          pipe.stop();
          pipe.go(k);
        })
      );

      /* ---- hello anatomy ---- */
      const helloPre = $('#l1-hello-code');
      const showNote = (ln) => {
        const [t, d] = HELLO_NOTES[ln - 1];
        $('#l1-hello-note').innerHTML = `<h5>第 ${ln} 行：${t}</h5><p>${d}</p>`;
        C.setLines(helloPre, ln);
      };
      C.$$('.line', helloPre).forEach((el, k) => {
        el.tabIndex = 0;
        el.setAttribute('role', 'button');
        el.addEventListener('click', () => {
          stopTour();
          showNote(k + 1);
        });
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            stopTour();
            showNote(k + 1);
          }
        });
      });
      let tour = null;
      const tourBtn = $('#l1-anat [data-act="hello-tour"]');
      const stopTour = () => {
        if (tour) C.stop(tour);
        tour = null;
        tourBtn.textContent = '逐行導覽';
        tourBtn.setAttribute('aria-pressed', 'false');
      };
      root.querySelector('#l1-anat .widget-controls').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const out = $('#l1-hello-out');
        if (b.dataset.act === 'hello-run') {
          stopTour();
          C.setLines(helloPre, 6);
          typeOut(out, '$ gcc hello.c -o hello\n$ ./hello\nHello CCU!');
        } else if (b.dataset.act === 'hello-clear') {
          out.innerHTML = '<span class="dim">（尚未執行）</span>';
        } else if (b.dataset.act === 'hello-tour') {
          if (tour) return stopTour();
          let ln = 1;
          showNote(ln);
          b.textContent = '⏸ 停止導覽';
          b.setAttribute('aria-pressed', 'true');
          tour = C.every(() => {
            ln++;
            if (ln > HELLO_NOTES.length) return stopTour();
            showNote(ln);
          }, 2600);
        }
      });

      /* ---- bug maker ---- */
      const showBug = (k) => {
        const b = BUGS[k];
        $('#l1-bug-code').innerHTML = C.code(b.code);
        const pre = $('#l1-bug-code .code');
        if (b.line) C.setLines(pre, b.line);
        const order = ['compile', 'link', 'run'];
        const failAt = b.stage ? order.indexOf(b.stage) : 99;
        $$('#l1-bugs [data-stage]').forEach((n) => {
          const idx = order.indexOf(n.dataset.stage);
          n.classList.toggle('is-done', idx < failAt);
          n.classList.toggle('is-active', idx === failAt);
          n.classList.toggle('is-dim', idx > failAt);
        });
        const msg = $('#l1-bug-msg');
        const why = $('#l1-bug-why');
        if (!b.stage) {
          msg.textContent = '$ gcc hello.c -o hello\n（沒有任何訊息，編譯與連結都成功）\n$ ./hello\nHello CCU!';
          why.className = 'feedback is-ok';
          why.innerHTML = '一切正常：編譯 ✓ 連結 ✓ 執行 ✓';
        } else {
          msg.innerHTML = '$ gcc hello.c -o hello\n<span class="err">' + C.esc(b.msg) + '</span>';
          why.className = 'feedback is-err';
          why.innerHTML = `<strong>${b.stage === 'link' ? '連結階段失敗' : '編譯階段失敗'}：</strong>${b.why}`;
        }
      };
      C.onSeg(root, 'bug', showBug);
      showBug('ok');

      /* ---- function anatomy ---- */
      const PARTS = [
        '<strong>回傳值的型別</strong>：<code>int</code> 表示這個函式最後會交回一個整數。不回傳任何值時寫 <code>void</code>。',
        '<strong>函式名稱</strong>：<code>add</code>，呼叫時就寫 <code>add(…)</code>。命名規則和變數相同。',
        '<strong>參數列</strong>：呼叫者傳進來的資料。<code>int x, int y</code> 表示要接兩個整數，在函式裡叫做 x 和 y。',
        '<strong>函式主體與 return</strong>：<code>{ }</code> 裡是要做的事，<code>return</code> 把結果交回呼叫的地方，函式也就此結束。',
      ];
      $$('#l1-fanat .l1-part').forEach((p) =>
        p.addEventListener('click', () => {
          $$('#l1-fanat .l1-part').forEach((x) => x.classList.toggle('is-on', x === p));
          const fb = $('#l1-fanat-fb');
          fb.className = 'feedback is-info';
          fb.innerHTML = PARTS[+p.dataset.part];
        })
      );

      /* ---- add() trace ---- */
      const argA = $('#l1-add-a');
      const argB = $('#l1-add-b');
      const num = (el, d) => {
        const v = parseInt(el.value, 10);
        return Number.isFinite(v) ? C.clamp(v, -999, 999) : d;
      };
      const addSteps = () => {
        const a = num(argA, 6);
        const b = num(argB, 8);
        const sum = a + b;
        const main = (r) => ({ name: 'main()', vars: [`result = ${r}`] });
        return [
          { line: 2, stack: [], note: '第 2 行是<strong>函式原型（prototype）</strong>：先告訴編譯器 add 接兩個 int、回傳 int，main 才能在 add 定義之前呼叫它。', out: '' },
          { line: 4, stack: [{ name: 'main()', vars: ['（還沒有變數）'] }], note: '程式從 <strong>main</strong> 開始執行，main 的堆疊框被建立。', out: '' },
          { line: 5, stack: [main('?（垃圾值）')], note: '宣告區域變數 result，還沒給值，裡面是不確定的垃圾值。', out: '' },
          { line: 6, stack: [main('?'), { name: `add(${a}, ${b})`, vars: [`x = ${a}`, `y = ${b}`] }], note: `呼叫 <code>add(${a}, ${b})</code>：把 ${a} 與 ${b} <strong>複製</strong>給參數 x、y，然後跳到 add 執行。`, out: '', newTop: true },
          { line: 12, stack: [main('?'), { name: `add(${a}, ${b})`, vars: [`x = ${a}`, `y = ${b}`, `return ${sum}`] }], note: `計算 x + y = ${a} + ${b} = <strong>${sum}</strong>，用 return 交回呼叫處。`, out: '' },
          { line: 6, stack: [main(sum)], note: `add 結束、堆疊框被移除；回傳值 ${sum} 存進 result。`, out: '' },
          { line: 7, stack: [main(sum)], note: '<code>printf</code> 遇到 <code>%d</code>，就把 result 以 10 進位整數印出來。', out: C.printf('The result is: %d\n', sum) },
          { line: 8, stack: [], note: '<code>return 0;</code>，程式正常結束，main 的堆疊框也被移除。', out: C.printf('The result is: %d\n', sum) },
        ];
      };
      let steps = addSteps();
      const renderAdd = (i) => {
        const s = steps[i];
        const src = ADD.replace('add(A, B)', `add(${num(argA, 6)}, ${num(argB, 8)})`);
        const host = $('#l1-add-code');
        if (host.dataset.src !== src) {
          host.innerHTML = C.code(src);
          host.dataset.src = src;
        }
        C.setLines($('#l1-add-code .code'), s.line);
        const stack = $('#l1-add-stack');
        stack.innerHTML = s.stack
          .map(
            (f, k) =>
              `<div class="frame${k === s.stack.length - 1 ? ' is-top' : ''}${k === s.stack.length - 1 && s.newTop ? ' is-new' : ''}"><div class="frame-name">${f.name}</div><ul class="frame-vars">${f.vars
                .map((v) => `<li>${v}</li>`)
                .join('')}</ul></div>`
          )
          .join('');
        $('#l1-add-note').innerHTML = s.note;
        $('#l1-add-out').textContent = s.out || '';
      };
      const addStepper = C.stepper($('#l1-add-stepper'), { count: () => steps.length, render: renderAdd, interval: 1600 });
      [argA, argB].forEach((el) =>
        el.addEventListener('input', () => {
          steps = addSteps();
          addStepper.refresh();
        })
      );

      /* ---- code style ---- */
      const showStyle = (k) => {
        $('#l1-style-code').innerHTML = C.code(STYLES[k].code);
        $('#l1-style-note').innerHTML = STYLES[k].note;
      };
      C.onSeg(root, 'style', showStyle);
      showStyle('kr');

      /* ---- escape playground ---- */
      const escIn = $('#l1-esc-in');
      const NAMES = { '\n': '\\n', '\t': '\\t', '\r': '\\r', '\b': '\\b', '\0': '\\0', '\\': '\\', "'": "'", '"': '"' };
      const renderEsc = () => {
        const raw = escIn.value;
        const fb = $('#l1-esc-fb');
        const msgs = [];
        // printf-level: %% -> %, lone % warns
        const unesc = C.unescape(raw);
        let printed = '';
        const loneSpec = /%(?!%)[-+ #0-9.]*[a-zA-Z]?/.exec(unesc.replace(/%%/g, ''));
        printed = unesc.replace(/%%/g, '%');
        if (loneSpec) msgs.push(`注意：<code>${C.esc(loneSpec[0])}</code> 會被 printf 當成格式指定字，但這裡沒有提供對應的引數，結果不可預期。要印 % 請寫 <code>%%</code>。`);
        let unknown = false;
        raw.replace(/\\([\s\S]?)/g, (m, c) => {
          if (!/[ntrb0-7\\'"x?afv]/.test(c)) unknown = true;
          return '';
        });
        if (unknown) msgs.push('有不認得的跳脫序列（例如結尾只有一個 <code>\\</code>），編譯器會警告「unknown escape sequence」。');
        if (raw.replace(/\\[\s\S]?/g, '').includes('"')) msgs.push('字串裡的雙引號要寫成 <code>\\"</code>，否則字串會提早結束、造成編譯錯誤。');
        const chars = Array.from(unesc);
        const cut = chars.indexOf('\0');
        $('#l1-esc-cells').innerHTML =
          chars
            .slice(0, 60)
            .map((ch, k) => {
              const special = NAMES[ch] && (ch.charCodeAt(0) < 32 || ch === '\0');
              const after = cut >= 0 && k > cut;
              const label = ch === ' ' ? '␣' : special ? NAMES[ch] : ch;
              return `<div class="cell${ch === '\0' ? ' is-null' : special ? ' is-hi' : ''}${after ? ' is-dim' : ''}"><span class="cell-idx">${k}</span><span class="cell-val">${C.esc(label)}</span><span class="cell-sub">${ch.charCodeAt(0)}</span></div>`;
            })
            .join('') +
          (cut < 0 ? `<div class="cell is-null"><span class="cell-idx">${chars.length}</span><span class="cell-val">\\0</span><span class="cell-sub">自動</span></div>` : '');
        $('#l1-esc-out').textContent = C.terminal(printed) || ' ';
        if (cut >= 0) msgs.unshift('<code>\\0</code> 代表字串結尾，printf 讀到它就停止，後面的字元（灰色）不會被印出。');
        fb.className = 'feedback ' + (msgs.length ? 'is-info' : 'is-ok');
        fb.innerHTML = msgs.length ? msgs.join('<br>') : `共 ${chars.length} 個字元（不含編譯器自動加上的 <code>\\0</code>）。標上底色的格子是螢幕上看不見的控制字元。`;
      };
      escIn.value = ESC_PRESETS[1][1];
      escIn.addEventListener('input', renderEsc);
      root.querySelector('#l1-esc .widget-controls').addEventListener('click', (e) => {
        const b = e.target.closest('[data-preset]');
        if (!b) return;
        escIn.value = ESC_PRESETS[+b.dataset.preset][1];
        $$('#l1-esc [data-preset]').forEach((x) => x.classList.toggle('is-on', x === b));
        renderEsc();
      });
      renderEsc();
    },
  });
})();
