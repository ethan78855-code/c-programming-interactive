/* =========================================================
   core.js — shared helpers, C syntax highlighter, printf
   emulator, stepper, router, theme, progress.
   Every lecture file calls C.register({...}).
   ========================================================= */
(function () {
  'use strict';
  const C = (window.C = {});
  C.lectures = [];
  C.register = (lec) => C.lectures.push(lec);

  /* ---------- DOM helpers ---------- */
  C.$ = (sel, root = document) => root.querySelector(sel);
  C.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  C.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  C.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  C.reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- page-bound timers (cleared on route change) ---------- */
  let intervals = new Set();
  let timeouts = new Set();
  C.every = (fn, ms) => {
    const id = setInterval(fn, ms);
    intervals.add(id);
    return id;
  };
  C.after = (fn, ms) => {
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
    return id;
  };
  C.stop = (id) => {
    clearInterval(id);
    clearTimeout(id);
    intervals.delete(id);
    timeouts.delete(id);
  };
  C.clearTimers = () => {
    intervals.forEach(clearInterval);
    timeouts.forEach(clearTimeout);
    intervals = new Set();
    timeouts = new Set();
  };

  /* ---------- storage (never required) ---------- */
  C.store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('ccourse:' + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('ccourse:' + k, JSON.stringify(v));
      } catch (e) {}
    },
  };

  /* ---------- C syntax highlighter ---------- */
  const KW = new Set(
    'if else for while do switch case default break continue return sizeof static extern register auto const struct typedef goto enum union volatile'.split(' ')
  );
  const TY = new Set('int char float double void long short unsigned signed bool FILE size_t'.split(' '));
  const ESC_RE = /(\\(?:x[0-9a-fA-F]+|[\s\S])|%%|%[-+ #0]*(?:\d+|\*)?(?:\.(?:\d+|\*))?(?:hh|h|ll|l|L|z)?[diouxXfFeEgGcspn])/;

  C.hl = function (src) {
    const lines = String(src).replace(/\t/g, '    ').split('\n');
    let inBlock = false;
    return lines.map((line) => {
      let out = '';
      const push = (cls, s) => {
        out += cls ? `<span class="${cls}">${C.esc(s)}</span>` : C.esc(s);
      };
      if (!inBlock && /^\s*#/.test(line)) {
        const m = line.match(/^(\s*#\s*\w+)(.*)$/) || [line, line, ''];
        push('tk-pre', m[1]);
        let rest = m[2];
        let com = '';
        const ci = rest.indexOf('//');
        if (ci >= 0) {
          com = rest.slice(ci);
          rest = rest.slice(0, ci);
        }
        out += rest.replace(/(<[^>]*>|"[^"]*")|([^<"]+)/g, (mm, s, o) =>
          s ? `<span class="tk-str">${C.esc(s)}</span>` : C.esc(o)
        );
        if (com) push('tk-com', com);
        return out;
      }
      let i = 0;
      const n = line.length;
      while (i < n) {
        if (inBlock) {
          const e = line.indexOf('*/', i);
          if (e < 0) {
            push('tk-com', line.slice(i));
            i = n;
          } else {
            push('tk-com', line.slice(i, e + 2));
            i = e + 2;
            inBlock = false;
          }
          continue;
        }
        const ch = line[i];
        const rest = line.slice(i);
        if (rest.startsWith('//')) {
          push('tk-com', rest);
          break;
        }
        if (rest.startsWith('/*')) {
          inBlock = true;
          push('tk-com', '/*');
          i += 2;
          continue;
        }
        if (ch === '"' || ch === "'") {
          let j = i + 1;
          while (j < n && line[j] !== ch) {
            if (line[j] === '\\') j++;
            j++;
          }
          const s = line.slice(i, Math.min(j + 1, n));
          out +=
            '<span class="tk-str">' +
            s
              .split(ESC_RE)
              .map((p, k) => (k % 2 ? `<span class="tk-esc">${C.esc(p)}</span>` : C.esc(p)))
              .join('') +
            '</span>';
          i = j + 1;
          continue;
        }
        const id = rest.match(/^[A-Za-z_]\w*/);
        if (id) {
          const w = id[0];
          const after = line.slice(i + w.length);
          const cls = KW.has(w) ? 'tk-kw' : TY.has(w) ? 'tk-type' : /^\s*\(/.test(after) ? 'tk-fn' : '';
          push(cls, w);
          i += w.length;
          continue;
        }
        if (/[0-9]/.test(ch)) {
          const m = rest.match(/^(0[xX][0-9a-fA-F]+|\d*\.?\d+(?:[eE][-+]?\d+)?[fFlLuU]*)/);
          push('tk-num', m[0]);
          i += m[0].length;
          continue;
        }
        push('', ch);
        i++;
      }
      return out;
    });
  };

  /** Code block. opts: {id, cls, title} */
  C.code = (src, opts = {}) =>
    `<pre class="code${opts.cls ? ' ' + opts.cls : ''}"${opts.id ? ` id="${opts.id}"` : ''}${
      opts.title ? ` data-title="${C.esc(opts.title)}"` : ''
    }>${C.hl(src)
      .map((l, k) => `<span class="line" data-ln="${k + 1}">${l || ' '}</span>`)
      .join('')}</pre>`;

  /** Highlight 1-based line numbers in a .code block (number or array). */
  C.setLines = (pre, lines, cls = 'is-active') => {
    if (!pre) return;
    const set = new Set([].concat(lines || []));
    C.$$('.line', pre).forEach((el, k) => el.classList.toggle(cls, set.has(k + 1)));
    const first = C.$('.line.' + cls, pre);
    if (first && pre.scrollHeight > pre.clientHeight + 4) {
      const top = first.offsetTop - pre.clientHeight / 2;
      pre.scrollTop = Math.max(0, top);
    }
  };

  /* ---------- markup builders ---------- */
  C.widget = ({ id, title, tag = '互動', hint = '', body = '', controls = '', cls = '' }) => `
<div class="widget${cls ? ' ' + cls : ''}"${id ? ` id="${id}"` : ''}>
  <div class="widget-head">
    <h4 class="widget-title">${title}</h4>
    <span class="widget-tag">${tag}</span>
    ${hint ? `<p class="widget-hint">${hint}</p>` : ''}
  </div>
  <div class="widget-body">${body}</div>
  ${controls ? `<div class="widget-controls">${controls}</div>` : ''}
</div>`;

  C.section = (id, num, title, inner) =>
    `<section class="section" id="${id}" data-title="${C.esc(title)}"><h2><span class="section-num">${num}</span>${title}</h2>${inner}</section>`;

  C.prose = (html) => `<div class="prose">${html}</div>`;

  C.callout = (kind, title, html) =>
    `<div class="callout callout--${kind}">${title ? `<strong class="callout-title">${title}</strong>` : ''}${html}</div>`;

  C.cards = (items) =>
    `<div class="card-grid">${items
      .map((c, k) => `<div class="card"><span class="card-num">${c.num || k + 1}</span><h4>${c.title}</h4>${c.body}</div>`)
      .join('')}</div>`;

  C.table = (head, rows, cls = '') =>
    `<div class="table-wrap"><table class="table${cls ? ' ' + cls : ''}"><thead><tr>${head
      .map((h) => `<th>${h}</th>`)
      .join('')}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></div>`;

  /** Segmented control: options = [[value,label],...] */
  C.seg = (name, options, selected, label) =>
    `<div class="seg" role="group"${label ? ` aria-label="${C.esc(label)}"` : ''} data-seg="${name}">${options
      .map(
        ([v, l]) =>
          `<button type="button" data-v="${C.esc(v)}" aria-pressed="${String(v) === String(selected)}">${l}</button>`
      )
      .join('')}</div>`;

  C.onSeg = (root, name, fn) => {
    const el = root.querySelector(`[data-seg="${name}"]`);
    if (!el) return;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]');
      if (!b || b.disabled) return;
      C.$$('button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      fn(b.dataset.v, b);
    });
  };
  C.setSeg = (root, name, v) => {
    const el = root.querySelector(`[data-seg="${name}"]`);
    if (el) C.$$('button', el).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === String(v))));
  };

  C.field = (label, inputHtml) => `<label class="field"><span>${label}</span>${inputHtml}</label>`;

  /* ---------- Stepper (reset / prev / next / play) ---------- */
  C.stepper = function (host, opts) {
    host.classList.add('stepper');
    host.innerHTML = `
      <div class="btn-group">
        <button type="button" class="btn btn--sm btn--ghost" data-act="reset">⟲ 重設</button>
        <button type="button" class="btn btn--sm" data-act="prev">◀ 上一步</button>
        <button type="button" class="btn btn--sm btn--primary" data-act="next">下一步 ▶</button>
        <button type="button" class="btn btn--sm" data-act="play" aria-pressed="false">▶ 自動播放</button>
      </div>
      <span class="badge stepper-count" aria-live="polite"></span>`;
    let i = 0;
    let timer = null;
    const count = () => (typeof opts.count === 'function' ? opts.count() : opts.count);
    const btn = (a) => host.querySelector(`[data-act="${a}"]`);
    const label = host.querySelector('.stepper-count');
    function update() {
      const n = count();
      label.textContent = `步驟 ${i + 1} / ${n}`;
      btn('prev').disabled = i <= 0;
      btn('next').disabled = i >= n - 1;
    }
    function go(k) {
      i = C.clamp(k, 0, Math.max(0, count() - 1));
      opts.render(i);
      update();
    }
    function stop() {
      if (timer) C.stop(timer);
      timer = null;
      btn('play').textContent = '▶ 自動播放';
      btn('play').setAttribute('aria-pressed', 'false');
    }
    function play() {
      if (i >= count() - 1) go(0);
      timer = C.every(() => {
        if (!document.body.contains(host)) return stop();
        if (i >= count() - 1) stop();
        else go(i + 1);
      }, opts.interval || 1000);
      btn('play').textContent = '⏸ 暫停';
      btn('play').setAttribute('aria-pressed', 'true');
    }
    host.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'play') return timer ? stop() : play();
      stop();
      if (a === 'reset') go(0);
      else if (a === 'prev') go(i - 1);
      else if (a === 'next') go(i + 1);
    });
    go(0);
    return {
      go,
      stop,
      reset() {
        stop();
        go(0);
      },
      refresh() {
        go(Math.min(i, count() - 1));
      },
      get index() {
        return i;
      },
    };
  };

  /* ---------- printf emulator (subset of C99) ---------- */
  const toInt = (v) => {
    if (typeof v === 'string') return v.length ? v.charCodeAt(0) : 0;
    if (typeof v === 'boolean') return +v;
    return Math.trunc(Number(v)) || 0;
  };
  const expo = (x, p, alt) => {
    let [m, e] = x.toExponential(p).split('e');
    if (alt && p === 0) m += '.';
    const sg = e[0] === '-' ? '-' : '+';
    e = e.replace(/^[-+]/, '');
    return m + 'e' + sg + e.padStart(2, '0');
  };
  C.printf = function (fmt, ...args) {
    let ai = 0;
    return String(fmt).replace(
      /%([-+ #0]*)(\*|\d+)?(?:\.(\*|\d*))?(hh|h|ll|l|L|z)?([diouxXfFeEgGcsp%])/g,
      (m, flags, width, prec, len, conv) => {
        if (conv === '%') return '%';
        if (width === '*') width = args[ai++];
        width = width === undefined ? 0 : +width;
        let p = prec === undefined ? undefined : prec === '*' ? +args[ai++] : prec === '' ? 0 : +prec;
        let left = flags.includes('-');
        if (width < 0) {
          left = true;
          width = -width;
        }
        const plus = flags.includes('+');
        const space = flags.includes(' ');
        const alt = flags.includes('#');
        let zero = flags.includes('0') && !left;
        const v = args[ai++];
        let sign = '';
        let prefix = '';
        let body = '';
        switch (conv) {
          case 'd':
          case 'i': {
            let n = toInt(v);
            if (n < 0) {
              sign = '-';
              n = -n;
            } else if (plus) sign = '+';
            else if (space) sign = ' ';
            body = String(n);
            if (p !== undefined) {
              zero = false;
              if (p === 0 && n === 0) body = '';
              body = body.padStart(p, '0');
            }
            break;
          }
          case 'u':
          case 'o':
          case 'x':
          case 'X': {
            let n = toInt(v);
            if (n < 0) n = n >>> 0;
            body = conv === 'u' ? String(n) : conv === 'o' ? n.toString(8) : n.toString(16);
            if (conv === 'X') body = body.toUpperCase();
            if (p !== undefined) {
              zero = false;
              if (p === 0 && n === 0) body = '';
              body = body.padStart(p, '0');
            }
            if (alt && n !== 0 && conv === 'x') prefix = '0x';
            if (alt && n !== 0 && conv === 'X') prefix = '0X';
            if (alt && conv === 'o' && body[0] !== '0') body = '0' + body;
            break;
          }
          case 'f':
          case 'F':
          case 'e':
          case 'E':
          case 'g':
          case 'G': {
            let x = typeof v === 'string' && isNaN(Number(v)) ? toInt(v) : Number(v);
            if (p === undefined) p = 6;
            if (x < 0 || Object.is(x, -0)) {
              sign = '-';
              x = -x;
            } else if (plus) sign = '+';
            else if (space) sign = ' ';
            if (!isFinite(x)) {
              body = isNaN(x) ? 'nan' : 'inf';
              zero = false;
            } else if (conv === 'f' || conv === 'F') {
              body = x.toFixed(Math.min(p, 100));
              if (alt && p === 0) body += '.';
            } else if (conv === 'e' || conv === 'E') {
              body = expo(x, Math.min(p, 100), alt);
            } else {
              const P = p === 0 ? 1 : p;
              const ex = +x.toExponential(P - 1).split('e')[1];
              body = P > ex && ex >= -4 ? x.toFixed(P - 1 - ex) : expo(x, P - 1, alt);
              if (!alt) body = body.replace(/(\.\d*?)0+(e|$)/, '$1$2').replace(/\.(e|$)/, '$1');
            }
            if (conv === 'E' || conv === 'G' || conv === 'F') body = body.toUpperCase();
            break;
          }
          case 'c':
            body = typeof v === 'string' ? v.charAt(0) : String.fromCharCode(toInt(v) & 255);
            zero = false;
            break;
          case 's':
            body = String(v == null ? '(null)' : v);
            if (p !== undefined) body = body.slice(0, p);
            zero = false;
            break;
          case 'p':
            body = '0x' + (toInt(v) >>> 0).toString(16).padStart(8, '0');
            zero = false;
            break;
        }
        let s = sign + prefix + body;
        if (s.length < width) {
          if (left) s = s.padEnd(width, ' ');
          else if (zero) s = sign + prefix + body.padStart(width - sign.length - prefix.length, '0');
          else s = s.padStart(width, ' ');
        }
        return s;
      }
    );
  };

  /** Interpret a C string literal body (between quotes) into real characters. */
  C.unescape = (s) =>
    String(s).replace(/\\(x[0-9a-fA-F]{1,2}|[0-7]{1,3}|.)/g, (m, e) => {
      const map = { n: '\n', t: '\t', r: '\r', b: '\b', a: '\x07', f: '\f', v: '\v', '\\': '\\', "'": "'", '"': '"', '?': '?' };
      if (e in map) return map[e];
      if (e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16));
      if (/^[0-7]+$/.test(e)) return String.fromCharCode(parseInt(e, 8));
      return e;
    });

  /** Render text the way a terminal would (handles \r, \b, \t, \0). */
  C.terminal = (text) => {
    const lines = [[]];
    let row = 0;
    let col = 0;
    for (const ch of text) {
      if (ch === '\0') break;
      if (ch === '\n') {
        row++;
        col = 0;
        lines[row] = lines[row] || [];
        continue;
      }
      if (ch === '\r') {
        col = 0;
        continue;
      }
      if (ch === '\b') {
        col = Math.max(0, col - 1);
        continue;
      }
      if (ch === '\t') {
        const next = (Math.floor(col / 8) + 1) * 8;
        while (col < next) {
          if (lines[row][col] === undefined) lines[row][col] = ' ';
          col++;
        }
        continue;
      }
      for (let k = lines[row].length; k < col; k++) lines[row][k] = ' ';
      lines[row][col] = ch;
      col++;
    }
    return lines.map((l) => Array.from(l, (c) => (c === undefined ? ' ' : c)).join('')).join('\n');
  };

  /* ---------- small SVG helper ---------- */
  C.svgEl = (tag, attrs = {}, text) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (text != null) el.textContent = text;
    return el;
  };

  /* =========================================================
     App shell: nav, router, theme, progress, drawer
     ========================================================= */
  const ordered = () => C.lectures.slice().sort((a, b) => a.order - b.order);
  const done = () => new Set(C.store.get('done', []));
  const setDone = (id, on) => {
    const s = done();
    on ? s.add(id) : s.delete(id);
    C.store.set('done', Array.from(s));
    renderNav(current.lec ? current.lec.id : null);
    updateProgress();
  };
  C.isDone = (id) => done().has(id);

  let current = { lec: null };

  function renderNav(activeId) {
    const nav = C.$('#nav');
    const d = done();
    nav.innerHTML =
      `<a class="nav-item nav-home${activeId ? '' : ' is-active'}" href="#/"><span class="nav-num">⌂</span><span class="nav-label">課程首頁</span></a>` +
      ordered()
        .map(
          (l) =>
            `<a class="nav-item${l.id === activeId ? ' is-active' : ''}${d.has(l.id) ? ' is-done' : ''}" href="#/${l.id}"${
              l.id === activeId ? ' aria-current="page"' : ''
            }><span class="nav-num">${l.num}</span><span class="nav-label">${l.title}</span></a>` +
            (l.id === activeId ? '<div class="nav-sub" id="nav-sub"></div>' : '')
        )
        .join('');
    if (activeId) buildSubNav();
  }

  function buildSubNav() {
    const sub = C.$('#nav-sub');
    if (!sub || !current.lec) return;
    sub.innerHTML = C.$$('.lecture .section')
      .map((s) => `<a href="#/${current.lec.id}/${s.id}" data-sec="${s.id}">${s.dataset.title}</a>`)
      .join('');
  }

  function updateProgress() {
    const total = C.lectures.length;
    const n = ordered().filter((l) => done().has(l.id)).length;
    const pct = (total ? Math.round((n / total) * 100) : 0) + '%';
    C.$$('[data-progress-text]').forEach((el) => (el.textContent = `${n} / ${total} 講完成`));
    C.$$('[data-progress], [data-progress-ring]').forEach((el) => el.style.setProperty('--p', pct));
    C.$$('[data-progress-ring]').forEach((el) => (el.textContent = `${n}/${total}`));
  }

  let spy = null;
  function setupSpy() {
    if (spy) spy.disconnect();
    if (!('IntersectionObserver' in window)) return;
    const links = () => C.$$('#nav-sub a');
    spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            links().forEach((a) => a.classList.toggle('is-active', a.dataset.sec === en.target.id));
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    C.$$('.lecture .section').forEach((s) => spy.observe(s));
  }

  function countWidgets(l) {
    return (l.sections().match(/class="widget[\s"]/g) || []).length;
  }

  function renderHome() {
    const main = C.$('#main');
    const lecs = ordered();
    const d = done();
    const widgets = lecs.reduce((s, l) => s + countWidgets(l), 0);
    main.innerHTML = `
<div class="home">
  <header class="home-hero">
    <div class="eyebrow">Programming Languages (C) · 互動講義</div>
    <h1>把每一行 C，<em>動手玩一遍</em></h1>
    <p class="lede">這個網站把「程式設計（C 語言）」的 8 份講義，整理成可以動手玩的互動圖解：點擊、拖拉、逐步執行，親眼看到編譯器、記憶體、迴圈與遞迴到底在做什麼。</p>
    <div class="btn-group">
      <a class="btn btn--primary" href="#/${lecs[0] ? lecs[0].id : ''}">從第一講開始 →</a>
      <a class="btn btn--ghost" href="#/${(lecs.find((l) => !d.has(l.id)) || lecs[0] || {}).id || ''}">繼續下一個未完成的講次</a>
    </div>
  </header>
  <ul class="stats">
    <li><strong>${lecs.length}</strong>份講義</li>
    <li><strong>${widgets}</strong>個互動圖解</li>
    <li><strong>${lecs.filter((l) => d.has(l.id)).length}/${lecs.length}</strong>已完成</li>
  </ul>
  <div class="course-map">
    ${lecs
      .map(
        (l) => `
    <a class="lec-card${d.has(l.id) ? ' is-done' : ''}" href="#/${l.id}">
      <span class="lec-num">${l.num}</span>
      <h3>${l.title}</h3>
      <p>${l.desc}</p>
      <div class="lec-tags">${l.tags.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
      <div class="lec-progress" style="--p:${d.has(l.id) ? 100 : 0}%">${countWidgets(l)} 個互動圖解</div>
    </a>`
      )
      .join('')}
  </div>
  <p class="home-foot">內容整理自 王志航 老師「程式設計（C 語言）」課程講義，範例程式碼來自課程提供的 GitHub Gist。</p>
</div>`;
    updateProgress();
  }

  function renderLecture(l) {
    const main = C.$('#main');
    const lecs = ordered();
    const idx = lecs.indexOf(l);
    const next = lecs[idx + 1];
    const prev = lecs[idx - 1];
    main.innerHTML = `
<article class="lecture" data-lec="${l.id}">
  <header class="lecture-hero">
    <div class="eyebrow">${l.eyebrow || 'Lecture ' + l.num} · ${l.en}</div>
    <h1>${l.title}</h1>
    <p class="lede">${l.lede}</p>
    <ul class="objectives">${l.objectives.map((o) => `<li>${o}</li>`).join('')}</ul>
  </header>
  ${l.sections()}
  <footer class="lecture-foot">
    <h2>本講重點回顧</h2>
    <ul>${l.recap.map((r) => `<li>${r}</li>`).join('')}</ul>
    ${l.practice ? C.callout('tip', '課後練習', `<p>${l.practice}</p>`) : ''}
    <div class="lecture-foot-actions">
      <button type="button" class="btn" data-act="toggle-done" aria-pressed="${C.isDone(l.id)}">${
      C.isDone(l.id) ? '✓ 已完成（點擊取消）' : '標記本講為已完成'
    }</button>
      <div class="btn-group">
        ${prev ? `<a class="btn btn--ghost" href="#/${prev.id}">← ${prev.title}</a>` : ''}
        ${next ? `<a class="next-link btn btn--primary" href="#/${next.id}">下一講：${next.title} →</a>` : `<a class="next-link btn btn--primary" href="#/">回到課程首頁 →</a>`}
      </div>
    </div>
  </footer>
</article>`;
    let style = C.$('#lec-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'lec-style';
      document.head.appendChild(style);
    }
    style.textContent = l.css || '';
    const root = C.$('.lecture', main);
    const doneBtn = C.$('[data-act="toggle-done"]', root);
    doneBtn.addEventListener('click', () => {
      const on = !C.isDone(l.id);
      setDone(l.id, on);
      doneBtn.setAttribute('aria-pressed', String(on));
      doneBtn.textContent = on ? '✓ 已完成（點擊取消）' : '標記本講為已完成';
    });
    try {
      l.mount(root);
    } catch (err) {
      console.error('mount failed for', l.id, err);
    }
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [lid, sec] = h.split('/');
    const l = C.lectures.find((x) => x.id === lid);
    const changed = (l || null) !== current.lec || !C.$('#main').firstElementChild;
    if (changed) {
      C.clearTimers();
      current.lec = l || null;
      if (l) {
        renderLecture(l);
        document.title = `${l.num}｜${l.title} — C 語言互動講義`;
      } else {
        renderHome();
        document.title = 'C 語言互動講義｜程式設計（C 語言）';
      }
      renderNav(l ? l.id : null);
      setupSpy();
    }
    document.body.classList.remove('nav-open');
    C.$$('.menu-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    const target = sec && document.getElementById(sec);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ behavior: changed || C.reduced() ? 'auto' : 'smooth', block: 'start' }));
    } else if (changed) {
      window.scrollTo(0, 0);
    }
  }

  /* ---------- theme ---------- */
  function applyThemeLabel() {
    const t = document.documentElement.getAttribute('data-theme');
    const dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    C.$$('.theme-toggle').forEach((b) => {
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('aria-label', dark ? '切換為淺色主題' : '切換為深色主題');
      b.title = dark ? '切換為淺色主題' : '切換為深色主題';
      const lbl = b.querySelector('.theme-label');
      if (lbl) lbl.textContent = dark ? '深色' : '淺色';
      const ic = b.querySelector('.theme-icon');
      if (ic) ic.textContent = dark ? '☾' : '☀';
    });
  }
  function toggleTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    const dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextT = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextT);
    C.store.set('theme', nextT);
    applyThemeLabel();
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  function init() {
    const saved = C.store.get('theme', null);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    applyThemeLabel();
    C.$$('.theme-toggle').forEach((b) => b.addEventListener('click', toggleTheme));
    const closeNav = () => {
      document.body.classList.remove('nav-open');
      C.$$('.menu-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    };
    C.$$('.menu-btn').forEach((b) =>
      b.addEventListener('click', () => {
        const open = !document.body.classList.contains('nav-open');
        document.body.classList.toggle('nav-open', open);
        b.setAttribute('aria-expanded', String(open));
      })
    );
    C.$$('.scrim').forEach((s) => s.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
    C.$('#nav').addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      if (a.getAttribute('href') === location.hash) {
        e.preventDefault();
        route();
      }
      closeNav();
    });
    window.addEventListener('hashchange', route);
    route();
    updateProgress();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
