/* Lecture 02 補充 — 進位系統 */
(function () {
  'use strict';
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sup = (n) => String(n).split('').map((d) => SUP[d]).join('');
  const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const sub = (n) => String(n).split('').map((d) => SUB[d]).join('');
  const DIG = '0123456789ABCDEF';
  const BASE_NAME = { 2: '二進位', 8: '八進位', 10: '十進位', 16: '十六進位' };
  const toBase = (n, b, w) => n.toString(b).toUpperCase().padStart(w || 1, '0');

  function sections() {
    const s1 = C.section(
      'l2b-concept',
      '01',
      '核心概念：滿幾進一',
      C.prose(`<p>為什麼人類習慣 10 進位，而電腦只懂 2 進位？其實所有進位制都是同一套規則，只是「滿幾進一」不同。</p>
<p>我們日常用的是 10 進位；時間則是 60 進位（60 秒進 1 分、60 分進 1 小時）。電腦由電晶體組成，只有「通電／不通電」兩種狀態，因此誕生了 2 進位。</p>`) +
        C.cards([
          { num: 'B', title: '基底（Base／Radix）', body: '<p>這個系統允許使用的「數字符號總個數」。10 進位有 0–9 共 10 個符號。</p>' },
          { num: '+1', title: '逢滿進位', body: '<p>計數達到基底數量時，該位歸零，並向左邊的位數進 1。</p>' },
          { num: 'W', title: '位置權重（Position Weight）', body: '<p>每一位代表基底的次方。例如十位數是 10¹，個位數是 10⁰。</p>' },
        ]) +
        C.widget({
          id: 'l2b-odo',
          title: '進位計數器（里程表）',
          tag: '互動',
          hint: '選一個基底，按「+1」或「自動數數」。注意每一位到達「基底 − 1」之後再加 1，就會歸零並向左進位。',
          body: `${C.seg(
            'l2bodo',
            [
              ['2', '2 進位'],
              ['8', '8 進位'],
              ['10', '10 進位'],
              ['16', '16 進位'],
            ],
            '10',
            '基底'
          )}
<div class="scroll-x"><div class="cells cells--nowrap l2b-odo" id="l2b-odo-cells"></div></div>
<dl class="kv" id="l2b-odo-kv"></dl>
<p class="feedback is-info" id="l2b-odo-fb"></p>`,
          controls:
            '<button type="button" class="btn btn--primary" id="l2b-odo-inc">+1</button><button type="button" class="btn" id="l2b-odo-dec">−1</button><button type="button" class="btn" id="l2b-odo-play" aria-pressed="false">▶ 自動數數</button><button type="button" class="btn" id="l2b-odo-jump">跳到快要進位</button><span class="spacer"></span><button type="button" class="btn btn--ghost" id="l2b-odo-zero">歸零</button>',
        })
    );

    const s2 = C.section(
      'l2b-weight',
      '02',
      '10 進位與位置權重展開',
      C.prose(`<p><strong>10 進位（Decimal）</strong>總共有 0–9 十個符號，規則是「逢 10 進 1」：數到 9 之後沒有獨立的符號，必須進位變成 10。</p>
<p>數字 345 其實代表 <code>3 × 10² + 4 × 10¹ + 5 × 10⁰</code>。10 進位對人類非常直觀，但對電子電路來說，要精確辨識 10 種不同的電壓水準非常困難又容易出錯，這就是數位世界不採用 10 進位的原因。</p>
<p>同樣的「位置權重展開」適用於任何基底，把每一位乘上「基底的次方」再加總，就能換回 10 進位。</p>`) +
        C.widget({
          id: 'l2b-exp',
          title: '位置權重展開器',
          tag: '圖解',
          hint: '選基底、輸入一個數，看每一位的權重與貢獻；也可以點下面的範例。',
          body: `${C.seg(
            'l2bexp',
            [
              ['2', '2 進位'],
              ['8', '8 進位'],
              ['10', '10 進位'],
              ['16', '16 進位'],
            ],
            '10',
            '基底'
          )}
<div class="row">${C.field('數字', '<input type="text" id="l2b-exp-in" value="345" autocomplete="off" spellcheck="false" maxlength="10">')}
<div class="row" id="l2b-exp-presets">${[
            ['10', '345'],
            ['2', '1011'],
            ['8', '755'],
            ['16', '2F'],
            ['16', 'FF'],
            ['2', '11111111'],
          ]
            .map(([b, v]) => `<button type="button" class="chip" data-b="${b}" data-n="${v}">${v}${sub(b)}</button>`)
            .join('')}</div></div>
<div class="scroll-x"><div class="cells cells--nowrap" id="l2b-exp-cells"></div></div>
<div class="console" data-title="展開" id="l2b-exp-out"></div>`,
        })
    );

    const s3 = C.section(
      'l2b-bases',
      '03',
      '2、8、16 進位',
      C.cards([
        {
          num: '2',
          title: '電腦的母語：2 進位（Binary）',
          body: '<p>只有 0 與 1 兩個符號，「逢 2 進 1」，所以 1 + 1 = 10（讀作「一零」，不是十）。對應電晶體的開關：0 代表斷路／低電壓（Off），1 代表通路／高電壓（On）。</p><p>例：1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰ = 11₁₀</p>',
        },
        {
          num: '8',
          title: '歷史的橋樑：8 進位（Octal）',
          body: '<p>0–7 共 8 個符號，「逢 8 進 1」。因為 8 = 2³，<strong>一個 8 進位數字剛好對應 3 個位元</strong>。早期系統（如 Unix 的 <code>chmod 755</code>）常用它來縮短冗長的 2 進位。</p>',
        },
        {
          num: '16',
          title: '程式員的好幫手：16 進位（Hex）',
          body: '<p>0–9 加上 A–F 共 16 個符號，A=10、B=11、C=12、D=13、E=14、F=15。因為 16 = 2⁴，<strong>一個 16 進位字元剛好對應 4 個位元</strong>（半個位元組 nibble）。常用於記憶體位址、網頁色碼、除錯。</p>',
        },
      ]) +
        C.widget({
          id: 'l2b-conv',
          title: '進位轉換器',
          tag: '互動',
          hint: '點位元切換 0／1，或在任一欄輸入數字，其他欄會同步更新。下方顯示「3 個一組 → 8 進位」與「4 個一組 → 16 進位」的分組方式。',
          body: `${C.seg(
            'l2bbits',
            [
              ['8', '8 位元（1 byte）'],
              ['16', '16 位元（2 bytes）'],
            ],
            '8',
            '位元數'
          )}
<div class="scroll-x"><div class="bits" id="l2b-bits"></div></div>
<div class="l2b-conv-fields">
${C.field('10 進位 Dec', '<input type="text" id="l2b-dec" data-base="10" inputmode="numeric" autocomplete="off">')}
${C.field('2 進位 Bin', '<input type="text" id="l2b-bin" data-base="2" autocomplete="off">')}
${C.field('8 進位 Oct', '<input type="text" id="l2b-oct" data-base="8" autocomplete="off">')}
${C.field('16 進位 Hex', '<input type="text" id="l2b-hex" data-base="16" autocomplete="off">')}
</div>
<p class="feedback" id="l2b-conv-fb"></p>
<h5 class="l2b-h5">每 3 個位元一組 → 8 進位</h5>
<div class="scroll-x"><div class="l2b-groups" id="l2b-g3"></div></div>
<h5 class="l2b-h5">每 4 個位元一組 → 16 進位</h5>
<div class="scroll-x"><div class="l2b-groups" id="l2b-g4"></div></div>
<div class="console" data-title="在 C 程式裡" id="l2b-conv-c"></div>`,
          controls:
            '<button type="button" class="btn btn--primary" id="l2b-inc">+1</button><button type="button" class="btn" id="l2b-shl">左移 &lt;&lt; 1（×2）</button><button type="button" class="btn" id="l2b-rand">隨機</button><span class="spacer"></span><button type="button" class="btn btn--ghost" id="l2b-all">全部為 1</button><button type="button" class="btn btn--ghost" id="l2b-clr">清除</button>',
        }) +
        C.callout(
          'key',
          'C 語言裡的進位寫法',
          '<p>常數加 <code>0x</code> 開頭是 16 進位（<code>0x2F</code>），加 <code>0</code> 開頭是 8 進位（<code>057</code>）；輸出時用 <code>%d</code>、<code>%o</code>、<code>%x</code>／<code>%X</code> 選擇要用哪一種進位顯示同一個數。</p>'
        )
    );

    const rows = [];
    for (let n = 0; n < 16; n++) rows.push(n);
    const s4 = C.section(
      'l2b-table',
      '04',
      '四種進位制對照表（0–15）',
      C.prose('<p>這張表值得熟記：2 進位每多一位就翻倍；16 進位的 A–F 正好接在 9 後面。<strong>點任一列</strong>，會把它載入上方的進位轉換器。</p>') +
        `<div class="table-wrap"><table class="table l2b-table" id="l2b-tbl"><thead><tr><th>十進位 Dec</th><th>二進位 Bin</th><th>八進位 Oct</th><th>十六進位 Hex</th></tr></thead><tbody>${rows
          .map(
            (n) =>
              `<tr tabindex="0" role="button" data-n="${n}" aria-label="載入 ${n}"><td class="num">${n}</td><td><code>${toBase(n, 2, 4)}</code></td><td class="num">${toBase(n, 8)}</td><td class="num"><b>${toBase(n, 16)}</b></td></tr>`
          )
          .join('')}</tbody></table></div>`
    );

    const s5 = C.section(
      'l2b-apps',
      '05',
      '實際應用：權限與色碼',
      C.prose('<p>8 進位與 16 進位最大的用處，是把又長又難讀的 2 進位<strong>壓縮</strong>成短短幾個字。下面是兩個你會在真實世界遇到的例子。</p>') +
        C.widget({
          id: 'l2b-chmod',
          title: 'Unix 檔案權限：chmod 755',
          tag: '互動',
          hint: '每個 8 進位數字 = 3 個位元 = r（讀）w（寫）x（執行）。點格子切換權限，或調整三個數字。',
          body: `<div class="row l2b-chmod-digits">${['擁有者 owner', '群組 group', '其他人 others']
            .map(
              (lbl, i) =>
                `<div class="l2b-digit"><span class="muted">${lbl}</span><div class="row"><button type="button" class="btn btn--sm" data-d="${i}" data-step="-1" aria-label="${lbl} 減 1">−</button><span class="cell" id="l2b-cm-d${i}"><span class="cell-val">7</span></span><button type="button" class="btn btn--sm" data-d="${i}" data-step="1" aria-label="${lbl} 加 1">+</button></div></div>`
            )
            .join('')}</div>
<div class="l2b-rwx" id="l2b-rwx"></div>
<div class="console" data-title="終端機" id="l2b-cm-out"></div>`,
          controls: ['755', '644', '700', '777', '600'].map((p) => `<button type="button" class="chip" data-perm="${p}">${p}</button>`).join(''),
        }) +
        C.widget({
          id: 'l2b-color',
          title: '網頁色碼 #RRGGBB',
          tag: '互動',
          hint: '一個顏色由紅、綠、藍三個 byte 組成，每個 byte（0–255）剛好用 2 個 16 進位字元表示。',
          body: `<div class="widget-split"><div>
<div class="l2b-swatch" id="l2b-sw"></div>
<div class="row">${C.field('挑選顏色', '<input type="color" id="l2b-col" value="#2b4fc7">')}${C.field('色碼', '<input type="text" id="l2b-hexcol" value="#2B4FC7" maxlength="7" autocomplete="off" spellcheck="false">')}</div>
</div><div>
${['R', 'G', 'B']
  .map(
    (c, i) =>
      `<div class="l2b-ch">${C.field(`${c} <output id="l2b-o${c}">0</output>`, `<input type="range" min="0" max="255" value="0" id="l2b-r${c}" data-ch="${i}">`)}<code id="l2b-t${c}"></code></div>`
  )
  .join('')}
</div></div>`,
          controls: [
            ['#FF0000', '紅'],
            ['#00A86B', '翡翠綠'],
            ['#FFD700', '金'],
            ['#808080', '灰'],
            ['#000000', '黑'],
            ['#FFFFFF', '白'],
          ]
            .map(([v, n]) => `<button type="button" class="chip" data-col="${v}"><span class="l2b-dotc" style="background:${v}"></span>${n} ${v}</button>`)
            .join(''),
        })
    );

    const s6 = C.section(
      'l2b-quiz',
      '06',
      '練習題',
      C.widget({
        id: 'l2b-q1',
        title: 'Q & A：把 16 進位的 0x2F 轉成 10 進位',
        tag: '測驗',
        body: `<div class="quiz"><p class="quiz-q"><code>0x2F</code> 等於 10 進位的多少？</p>
<div class="quiz-options">${[45, 47, 32, 215]
          .map((v) => `<button type="button" class="quiz-option" data-v="${v}">${v}</button>`)
          .join('')}</div><p class="feedback" id="l2b-q1-fb"></p></div>`,
      }) +
        C.widget({
          id: 'l2b-q2',
          title: '隨機練習：換算成 10 進位',
          tag: '練習',
          hint: '按「再來一題」產生新題目，輸入答案後按「檢查」或 Enter。',
          body: `<p class="l2b-qtext" id="l2b-q2-q"></p>
<div class="row">${C.field('10 進位答案', '<input type="number" id="l2b-q2-in" autocomplete="off">')}<span class="badge" id="l2b-q2-score">答對 0 / 0</span></div>
<p class="feedback" id="l2b-q2-fb"></p>`,
          controls: '<button type="button" class="btn btn--primary" id="l2b-q2-check">檢查</button><button type="button" class="btn" id="l2b-q2-new">再來一題</button><span class="spacer"></span><button type="button" class="btn btn--ghost" id="l2b-q2-show">看解答</button>',
        })
    );
    return s1 + s2 + s3 + s4 + s5 + s6;
  }

  /* ---------------- mount ---------------- */
  function mount(root) {
    mountOdo(root);
    mountExpand(root);
    const conv = mountConverter(root);
    mountTable(root, conv);
    mountChmod(root);
    mountColor(root);
    mountQuiz(root);
  }

  function mountOdo(root) {
    let base = 10;
    let n = 0;
    let timer = null;
    const cells = $('#l2b-odo-cells', root);
    const kv = $('#l2b-odo-kv', root);
    const fb = $('#l2b-odo-fb', root);
    const playBtn = $('#l2b-odo-play', root);
    const width = () => (base === 2 ? 8 : 4);
    const max = () => Math.pow(base, width());
    function render(prev, msg) {
      const w = width();
      const cur = toBase(n, base, w);
      const old = prev == null ? cur : toBase(prev, base, w);
      cells.innerHTML = Array.from(cur)
        .map((d, i) => {
          const p = w - 1 - i;
          const changed = d !== old[i];
          const carried = changed && d === '0' && prev != null && n > prev;
          return `<div class="cell${changed ? ' is-new' : ''}${carried ? ' is-hi' : ''}"><span class="cell-idx">${base}${sup(p)}</span><span class="cell-val">${d}</span><span class="cell-sub">×${Math.pow(base, p)}</span></div>`;
        })
        .join('');
      kv.innerHTML = [
        [`${BASE_NAME[base]}寫法`, `${cur}${sub(base)}`],
        ['十進位的值', n],
        ['可用符號', base === 16 ? '0–9, A–F' : `0–${base - 1}`],
      ]
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
        .join('');
      fb.innerHTML = msg || `在 ${base} 進位中，每一位最大只能到 <b>${DIG[base - 1]}</b>，再加 1 就要歸零並進位。`;
    }
    function inc(step) {
      const prev = n;
      n += step;
      let msg = '';
      if (n >= max()) {
        n = 0;
        msg = `⚠ ${width()} 位數全部用完，再進位已經沒有位置可以放 → 歸零（這就是「溢位 overflow」）。`;
      } else if (n < 0) {
        n = max() - 1;
        msg = '從 0 再減 1，繞回最大值。';
      } else if (step > 0) {
        const cur = toBase(n, base, width());
        const zeros = (cur.match(/0+$/) || [''])[0].length;
        if (zeros > 0) msg = `進位！最右邊 ${zeros} 位從 ${DIG[base - 1]} 變回 0，並向左邊進 1（螢光色的位數）。`;
      }
      render(prev, msg);
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
      playBtn.textContent = '▶ 自動數數';
      playBtn.setAttribute('aria-pressed', 'false');
    }
    $('#l2b-odo-inc', root).addEventListener('click', () => inc(1));
    $('#l2b-odo-dec', root).addEventListener('click', () => inc(-1));
    $('#l2b-odo-zero', root).addEventListener('click', () => {
      stop();
      n = 0;
      render(null, '已歸零。');
    });
    $('#l2b-odo-jump', root).addEventListener('click', () => {
      const prev = n;
      // set the lowest digits to base-1 so the next +1 causes a multi-digit carry
      const k = 2;
      n = (Math.floor(n / Math.pow(base, k)) + 1) * Math.pow(base, k) - 1;
      if (n >= max()) n = max() - 1;
      render(prev, `現在最右邊幾位都是 ${DIG[base - 1]}，按「+1」看看連續進位！`);
    });
    playBtn.addEventListener('click', () => {
      if (timer) return stop();
      timer = C.every(() => {
        if (!document.body.contains(playBtn)) return stop();
        inc(1);
      }, C.reduced() ? 900 : base === 2 ? 450 : 260);
      playBtn.textContent = '⏸ 暫停';
      playBtn.setAttribute('aria-pressed', 'true');
    });
    C.onSeg(root, 'l2bodo', (v) => {
      base = +v;
      if (n >= max()) n = n % max();
      if (timer) {
        stop();
        playBtn.click();
      }
      render(null, `切換到 ${base} 進位：同一個數量 ${n}，寫法變成 ${toBase(n, base, width())}${sub(base)}。`);
    });
    render(null);
  }

  function mountExpand(root) {
    let base = 10;
    const inp = $('#l2b-exp-in', root);
    const cells = $('#l2b-exp-cells', root);
    const out = $('#l2b-exp-out', root);
    function run() {
      const s = inp.value.trim().toUpperCase().replace(/^0X/, '');
      const valid = s.length > 0 && Array.from(s).every((ch) => DIG.indexOf(ch) >= 0 && DIG.indexOf(ch) < base);
      if (!valid) {
        inp.setAttribute('aria-invalid', 'true');
        const bad = Array.from(s).filter((ch) => !(DIG.indexOf(ch) >= 0 && DIG.indexOf(ch) < base));
        cells.innerHTML = '';
        out.innerHTML = `<span class="err">${s ? `「${C.esc(bad.join(' '))}」不是 ${base} 進位可以用的符號（只能用 ${base === 16 ? '0–9、A–F' : '0–' + (base - 1)}）。` : '請輸入一個數字。'}</span>`;
        return;
      }
      inp.removeAttribute('aria-invalid');
      const L = s.length;
      let total = 0;
      const terms = [];
      const parts = [];
      cells.innerHTML = Array.from(s)
        .map((ch, i) => {
          const p = L - 1 - i;
          const d = DIG.indexOf(ch);
          const val = d * Math.pow(base, p);
          total += val;
          terms.push(`${base === 16 && d > 9 ? `${ch}(${d})` : d} × ${base}${sup(p)}`);
          parts.push(val);
          return `<div class="cell"${d ? ` data-c="${(i % 4) + 1}"` : ''}><span class="cell-idx">${base}${sup(p)} = ${Math.pow(base, p)}</span><span class="cell-val">${ch}</span><span class="cell-sub">= ${val}</span></div>`;
        })
        .join('');
      out.textContent = `${s}${sub(base)}\n= ${terms.join(' + ')}\n= ${parts.join(' + ')}\n= ${total}${sub(10)}`;
    }
    C.onSeg(root, 'l2bexp', (v) => {
      base = +v;
      run();
    });
    inp.addEventListener('input', run);
    $('#l2b-exp-presets', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-n]');
      if (!b) return;
      base = +b.dataset.b;
      C.setSeg(root, 'l2bexp', base);
      inp.value = b.dataset.n;
      run();
    });
    run();
  }

  function mountConverter(root) {
    let bits = 8;
    let n = 47;
    const bitsEl = $('#l2b-bits', root);
    const fb = $('#l2b-conv-fb', root);
    const fields = { 10: $('#l2b-dec', root), 2: $('#l2b-bin', root), 8: $('#l2b-oct', root), 16: $('#l2b-hex', root) };
    const max = () => Math.pow(2, bits) - 1;
    function groups(size) {
      const b = n.toString(2).padStart(bits, '0');
      const padLen = Math.ceil(bits / size) * size;
      const pb = b.padStart(padLen, '0');
      let html = '';
      for (let i = 0; i < padLen; i += size) {
        const g = pb.slice(i, i + size);
        const k = i / size;
        const padded = i < padLen - bits ? padLen - bits - i : 0;
        html += `<div class="l2b-group" data-c="${(k % 4) + 1}"><span class="l2b-gbits">${Array.from(g)
          .map((ch, j) => `<span class="${j < padded ? 'l2b-pad' : ''}">${ch}</span>`)
          .join('')}</span><span class="l2b-gdig">${parseInt(g, 2).toString(16).toUpperCase()}</span></div>`;
      }
      return html;
    }
    function render(skip) {
      bitsEl.innerHTML = Array.from({ length: bits }, (_, k) => {
        const p = bits - 1 - k;
        const on = (n >> p) & 1;
        return `${k > 0 && k % 4 === 0 ? '<span class="bits-gap"></span>' : ''}<button type="button" class="bit${on ? ' is-on' : ''}" data-p="${p}" aria-pressed="${!!on}" aria-label="第 ${p} 位元，權重 ${Math.pow(2, p)}">${on}<span class="bit-label">${Math.pow(2, p)}</span></button>`;
      }).join('');
      for (const b of [10, 2, 8, 16]) {
        if (+skip === b) continue;
        fields[b].value = b === 2 ? n.toString(2).padStart(bits, '0') : toBase(n, b);
        fields[b].removeAttribute('aria-invalid');
      }
      $('#l2b-g3', root).innerHTML = groups(3);
      $('#l2b-g4', root).innerHTML = groups(4);
      const on = [];
      for (let p = bits - 1; p >= 0; p--) if ((n >> p) & 1) on.push(Math.pow(2, p));
      fb.className = 'feedback is-info';
      fb.innerHTML = `${n} = ${on.length ? on.join(' + ') : '0'}（亮起的位元權重加總）`;
      $('#l2b-conv-c', root).textContent = `int n = ${n};            // 也可以寫 0x${toBase(n, 16)} 或 0${toBase(n, 8)}\nprintf("%d %o %X", n, n, n);\n→ ${C.printf('%d %o %X', n, n, n)}`;
    }
    bitsEl.addEventListener('click', (e) => {
      const b = e.target.closest('.bit');
      if (!b) return;
      n ^= 1 << +b.dataset.p;
      render();
    });
    Object.values(fields).forEach((f) =>
      f.addEventListener('input', () => {
        const base = +f.dataset.base;
        let s = f.value.trim().toUpperCase();
        if (base === 16) s = s.replace(/^0X/, '');
        const ok = s.length > 0 && Array.from(s).every((ch) => DIG.indexOf(ch) >= 0 && DIG.indexOf(ch) < base);
        const v = ok ? parseInt(s, base) : NaN;
        if (!ok || v > max()) {
          f.setAttribute('aria-invalid', 'true');
          fb.className = 'feedback is-err';
          fb.textContent = !ok ? `「${f.value}」不是合法的 ${BASE_NAME[base]}數字。` : `超出 ${bits} 位元能表示的範圍（最大 ${max()}）。`;
          return;
        }
        n = v;
        render(base);
      })
    );
    C.onSeg(root, 'l2bbits', (v) => {
      bits = +v;
      n = n & max();
      render();
    });
    $('#l2b-inc', root).addEventListener('click', () => {
      n = (n + 1) & max();
      render();
    });
    $('#l2b-shl', root).addEventListener('click', () => {
      const lost = (n >> (bits - 1)) & 1;
      n = (n << 1) & max();
      render();
      if (lost) fb.innerHTML += '　⚠ 最左邊的 1 被擠出去了（溢位）。';
    });
    $('#l2b-rand', root).addEventListener('click', () => {
      n = Math.floor(Math.random() * (max() + 1));
      render();
    });
    $('#l2b-all', root).addEventListener('click', () => {
      n = max();
      render();
    });
    $('#l2b-clr', root).addEventListener('click', () => {
      n = 0;
      render();
    });
    render();
    return {
      load(v) {
        n = v & max();
        render();
      },
    };
  }

  function mountTable(root, conv) {
    const tbl = $('#l2b-tbl', root);
    const pick = (tr) => {
      $$('tr[data-n]', tbl).forEach((r) => r.classList.toggle('is-hi', r === tr));
      conv.load(+tr.dataset.n);
      const w = $('#l2b-conv', root);
      if (w && w.scrollIntoView) w.scrollIntoView({ behavior: C.reduced() ? 'auto' : 'smooth', block: 'center' });
    };
    tbl.addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-n]');
      if (tr) pick(tr);
    });
    tbl.addEventListener('keydown', (e) => {
      const tr = e.target.closest('tr[data-n]');
      if (tr && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        pick(tr);
      }
    });
  }

  function mountChmod(root) {
    let d = [7, 5, 5];
    const rwx = $('#l2b-rwx', root);
    const out = $('#l2b-cm-out', root);
    const W = ['擁有者', '群組', '其他人'];
    const P = [
      ['r', '讀', 4],
      ['w', '寫', 2],
      ['x', '執行', 1],
    ];
    function render() {
      d.forEach((v, i) => ($(`#l2b-cm-d${i} .cell-val`, root).textContent = v));
      rwx.innerHTML = d
        .map(
          (v, i) =>
            `<div class="l2b-rwx-row"><span class="l2b-rwx-who">${W[i]}<b>${v} = ${v.toString(2).padStart(3, '0')}₂</b></span><div class="bits">${P.map(
              ([c, name, wgt]) =>
                `<button type="button" class="bit${v & wgt ? ' is-on' : ''}" data-who="${i}" data-w="${wgt}" aria-pressed="${!!(v & wgt)}" aria-label="${W[i]}${name}權限">${v & wgt ? c : '-'}<span class="bit-label">${name} ${wgt}</span></button>`
            ).join('')}</div></div>`
        )
        .join('');
      const str = '-' + d.map((v) => P.map(([c, , w]) => (v & w ? c : '-')).join('')).join('');
      out.textContent = `$ chmod ${d.join('')} filename\n$ ls -l filename\n${str}  1 user  staff  1024  filename`;
      $$('[data-perm]', root).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.perm === d.join(''))));
    }
    root.querySelector('#l2b-chmod').addEventListener('click', (e) => {
      const st = e.target.closest('[data-step]');
      if (st) {
        const i = +st.dataset.d;
        d[i] = (d[i] + +st.dataset.step + 8) % 8;
        return render();
      }
      const bit = e.target.closest('.bit[data-who]');
      if (bit) {
        d[+bit.dataset.who] ^= +bit.dataset.w;
        return render();
      }
      const pr = e.target.closest('[data-perm]');
      if (pr) {
        d = pr.dataset.perm.split('').map(Number);
        render();
      }
    });
    render();
  }

  function mountColor(root) {
    let rgb = [0x2b, 0x4f, 0xc7];
    const col = $('#l2b-col', root);
    const hx = $('#l2b-hexcol', root);
    const sw = $('#l2b-sw', root);
    const hex = () => '#' + rgb.map((v) => v.toString(16).toUpperCase().padStart(2, '0')).join('');
    function render(skip) {
      const h = hex();
      sw.style.background = h;
      sw.textContent = h;
      sw.style.color = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 150 ? '#1b2033' : '#ffffff';
      if (skip !== 'col') col.value = h.toLowerCase();
      if (skip !== 'hex') hx.value = h;
      hx.removeAttribute('aria-invalid');
      ['R', 'G', 'B'].forEach((c, i) => {
        if (skip !== 'range') $(`#l2b-r${c}`, root).value = rgb[i];
        $(`#l2b-o${c}`, root).textContent = rgb[i];
        $(`#l2b-t${c}`, root).textContent = `0x${rgb[i].toString(16).toUpperCase().padStart(2, '0')} = ${rgb[i]} = ${rgb[i].toString(2).padStart(8, '0')}₂`;
      });
    }
    col.addEventListener('input', () => {
      const m = col.value.match(/^#([0-9a-f]{6})$/i);
      if (!m) return;
      rgb = [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16));
      render('col');
    });
    hx.addEventListener('input', () => {
      const m = hx.value.trim().match(/^#?([0-9a-f]{6})$/i);
      if (!m) {
        hx.setAttribute('aria-invalid', 'true');
        return;
      }
      rgb = [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16));
      render('hex');
    });
    $$('input[type=range][data-ch]', root).forEach((r) =>
      r.addEventListener('input', () => {
        rgb[+r.dataset.ch] = +r.value;
        render('range');
      })
    );
    $('#l2b-color', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-col]');
      if (!b) return;
      const m = b.dataset.col.slice(1);
      rgb = [0, 2, 4].map((k) => parseInt(m.slice(k, k + 2), 16));
      render();
    });
    render();
  }

  function mountQuiz(root) {
    const fb1 = $('#l2b-q1-fb', root);
    $('#l2b-q1', root).addEventListener('click', (e) => {
      const b = e.target.closest('.quiz-option');
      if (!b) return;
      $$('#l2b-q1 .quiz-option', root).forEach((o) => o.classList.remove('is-correct', 'is-wrong'));
      const ok = b.dataset.v === '47';
      b.classList.add(ok ? 'is-correct' : 'is-wrong');
      fb1.className = 'feedback ' + (ok ? 'is-ok' : 'is-err');
      fb1.innerHTML = ok
        ? '正確！<code>0x2F</code> = 2 × 16¹ + F × 16⁰ = 2 × 16 + 15 × 1 = 32 + 15 = <b>47</b>。'
        : '再想想：F 代表 15，十位（16¹）是 2。也可以先換成 2 進位：2 → 0010、F → 1111，0010 1111₂ = 32 + 8 + 4 + 2 + 1。';
    });

    const q = $('#l2b-q2-q', root);
    const inp = $('#l2b-q2-in', root);
    const fb = $('#l2b-q2-fb', root);
    const score = $('#l2b-q2-score', root);
    let cur = null;
    let right = 0;
    let total = 0;
    let answered = false;
    function explain(c) {
      const L = c.s.length;
      return (
        `${c.s}${sub(c.b)} = ` +
        Array.from(c.s)
          .map((ch, i) => `${DIG.indexOf(ch)} × ${c.b}${sup(L - 1 - i)}`)
          .join(' + ') +
        ` = <b>${c.v}</b>`
      );
    }
    function next() {
      const b = [2, 8, 16][Math.floor(Math.random() * 3)];
      const v = b === 2 ? 8 + Math.floor(Math.random() * 248) : b === 8 ? 8 + Math.floor(Math.random() * 500) : 16 + Math.floor(Math.random() * 240);
      cur = { b, v, s: toBase(v, b) };
      answered = false;
      q.innerHTML = `把${BASE_NAME[b]}的 <code>${b === 16 ? '0x' : ''}${cur.s}</code>${b === 16 ? '' : sub(b)} 換成 10 進位是多少？`;
      inp.value = '';
      fb.className = 'feedback';
      fb.textContent = '';
    }
    function check() {
      if (inp.value.trim() === '') {
        fb.className = 'feedback is-info';
        fb.textContent = '先輸入你的答案喔！';
        return;
      }
      const ok = +inp.value === cur.v;
      if (!answered) {
        total++;
        if (ok) right++;
        answered = true;
      }
      score.textContent = `答對 ${right} / ${total}`;
      fb.className = 'feedback ' + (ok ? 'is-ok' : 'is-err');
      fb.innerHTML = (ok ? '✓ 正確！' : `✗ 不對喔，你的答案是 ${C.esc(inp.value)}。`) + '<br>' + explain(cur);
    }
    $('#l2b-q2-check', root).addEventListener('click', check);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') check();
    });
    $('#l2b-q2-new', root).addEventListener('click', next);
    $('#l2b-q2-show', root).addEventListener('click', () => {
      answered = true;
      fb.className = 'feedback is-info';
      fb.innerHTML = '解答：' + explain(cur);
    });
    next();
  }

  C.register({
    id: 'l2b',
    order: 2.5,
    num: '02+',
    eyebrow: 'Lecture 02 補充',
    title: '進位系統',
    en: 'Number Systems: Binary, Octal, Decimal, Hex',
    lede: '為什麼人類習慣 10 進位，而電腦只懂 2 進位？8 進位與 16 進位又在程式設計中扮演什麼角色？用里程表、位元開關和色碼，把「滿幾進一」玩一遍。',
    desc: '基底、逢滿進位、位置權重；2、8、10、16 進位互換與實際應用。',
    tags: ['2 進位', '16 進位', '位置權重', '轉換'],
    objectives: [
      '為什麼人類習慣 10 進位，而電腦只懂 2 進位',
      '進位制的三個核心概念：基底、逢滿進位、位置權重',
      '2、8、10、16 進位之間如何互相轉換',
      '8 進位與 16 進位在程式設計中扮演的角色（權限、色碼、記憶體位址）',
    ],
    sections,
    recap: [
      '所有進位制都遵守同一套規則：基底決定可用符號數，逢「基底」進 1，每一位的權重是基底的次方',
      '10 進位對人類直觀；電腦用 2 進位，因為電晶體只有開（1）與關（0）兩種穩定狀態',
      '8 = 2³，一個 8 進位數字對應 3 個位元；16 = 2⁴，一個 16 進位字元對應 4 個位元（nibble）',
      '16 進位用 A–F 表示 10–15，常見於記憶體位址、色碼與除錯；C 語言用 0x 前綴寫 16 進位、0 前綴寫 8 進位',
    ],
    practice: '請嘗試將 16 進位的 <code>0x2F</code> 轉成 10 進位，再用 printf 的 <code>%d</code>、<code>%o</code>、<code>%X</code> 驗證你的答案。',
    css: `
.l2b-odo .cell{min-width:58px;min-height:72px}
.l2b-odo .cell-val{font-size:1.9rem}
.l2b-h5{margin:var(--s4) 0 var(--s2);font-size:.8rem;font-weight:500;color:var(--muted)}
.l2b-conv-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--s3)}
.l2b-conv-fields input{width:100%}
.l2b-groups{display:flex;gap:6px;width:max-content}
.l2b-group{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 8px;border:1.5px solid var(--series);border-radius:8px;background:color-mix(in srgb,var(--series) 12%,var(--surface));font-family:var(--font-mono)}
.l2b-gbits{font-size:.95rem;letter-spacing:.12em}
.l2b-gbits .l2b-pad{opacity:.35}
.l2b-gdig{font-size:1.15rem;font-weight:700;color:var(--series)}
.l2b-table tbody tr{cursor:pointer}
.l2b-table tbody tr:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.l2b-table tbody tr.is-hi > *{background:var(--hi)}
.l2b-chmod-digits{gap:var(--s5)}
.l2b-digit{display:flex;flex-direction:column;gap:4px;font-size:.8rem}
.l2b-digit .cell{min-width:52px}
.l2b-rwx{display:grid;gap:var(--s2);margin-top:var(--s4)}
.l2b-rwx-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s3)}
.l2b-rwx-row .bits{margin:0}
.l2b-rwx-who{display:flex;flex-direction:column;min-width:6.5em;font-size:.84rem;color:var(--muted)}
.l2b-rwx-who b{font-family:var(--font-mono);color:var(--ink)}
.l2b-swatch{display:grid;place-items:center;height:120px;border-radius:var(--r-lg);border:1px solid var(--line-strong);font-family:var(--font-mono);font-weight:700;font-size:1.3rem;letter-spacing:.06em;transition:background .2s}
input[type=color]{width:56px;height:40px;padding:2px;border:1px solid var(--line-strong);border-radius:var(--r-sm);background:var(--surface);cursor:pointer}
.l2b-ch{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--s3);margin-bottom:var(--s2)}
.l2b-ch code{font-size:.8rem}
.l2b-dotc{display:inline-block;width:12px;height:12px;border-radius:50%;border:1px solid var(--line-strong)}
.l2b-qtext{font-size:1.1rem}
`,
    mount,
  });
})();
