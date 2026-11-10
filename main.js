(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const INK = "#141414", PAPER = "#f2efe6";
  const S = window.SITE;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  const sizeCanvas = (cv, w, h) => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + "px"; cv.style.height = h + "px";
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return ctx;
  };

  /* Checker pattern used wherever a "grey" is needed. sparse = 25% instead of 50%. */
  const ditherPattern = (ctx, cell = 2, sparse = false) => {
    const c = document.createElement("canvas"); c.width = c.height = cell * 2;
    const g = c.getContext("2d"); g.fillStyle = INK;
    g.fillRect(0, 0, cell, cell);
    if (!sparse) g.fillRect(cell, cell, cell, cell);
    return ctx.createPattern(c, "repeat");
  };

  /* ═════════════ Pixel cursor ═════════════ */
  if (fine) {
    const CURSOR = ["#...........", "##..........", "#o#.........", "#oo#........", "#ooo#.......", "#oooo#......", "#ooooo#.....", "#oooooo#....", "#ooooooo#...", "#oooooooo#..", "#ooooo#####.", "#oo#oo#.....", "#o#.#oo#....", "##..#oo#....", "#....#oo#...", ".....#oo#...", "......##...."];
    const svg = (fill) => {
      const s = 2; let r = "";
      CURSOR.forEach((row, j) => [...row].forEach((c, i) => {
        if (c !== ".") r += `<rect x='${i * s}' y='${j * s}' width='${s}' height='${s}' fill='${c === "#" ? INK : fill}'/>`;
      }));
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${CURSOR[0].length * s}' height='${CURSOR.length * s}' shape-rendering='crispEdges'>${r}</svg>`)}") 0 0`;
    };
    const st = document.createElement("style");
    st.textContent = `html{cursor:${svg(PAPER)},auto}a,button,.cart,#snake{cursor:${svg(INK)},pointer}`;
    document.head.appendChild(st);
  }

  /* ═════════════ SFX (off by default) ═════════════ */
  let audio = null, sfxOn = store.get("sfx") === "1";
  const sfxBtn = $("#sfx");
  const setSfx = (on) => {
    sfxOn = on; sfxBtn.setAttribute("aria-pressed", on); sfxBtn.textContent = on ? "SFX ON" : "SFX OFF";
    store.set("sfx", on ? "1" : "0");
  };
  const blip = (freqs, dur = 0.05, vol = 0.04) => {
    if (!sfxOn) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      let t = audio.currentTime;
      for (const f of [].concat(freqs)) {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = "square"; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(audio.destination); o.start(t); o.stop(t + dur);
        t += dur;
      }
    } catch {}
  };
  setSfx(sfxOn);
  sfxBtn.addEventListener("click", () => { setSfx(!sfxOn); blip([523, 784], 0.07); });
  let lastHover = null;
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest("[data-sfx], .cart, .hud-nav a");
    if (t && t !== lastHover) blip(1320, 0.025, 0.02);
    lastHover = t;
  });

  /* ═════════════ Toast + copy email ═════════════ */
  const toast = $("#toast"); let toastT;
  const say = (msg) => { toast.textContent = msg; toast.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("show"), 1800); };
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    blip([660, 990], 0.05);
    try { await navigator.clipboard.writeText(b.dataset.copy); say("Email copied ✓"); }
    catch { location.href = "mailto:" + b.dataset.copy; }
  });

  /* ═════════════ Header: clock, progress, active section ═════════════ */
  $$(".year").forEach((y) => (y.textContent = new Date().getFullYear()));
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
  const tick = () => ($("#clock").textContent = "Memphis " + fmt.format(new Date()));
  tick(); setInterval(tick, 15000);

  const prog = $("#progress"), SEG = 10;
  prog.innerHTML = "<i></i>".repeat(SEG);
  const segs = $$("i", prog);
  const navLinks = $$(".hud-nav a");
  const targets = navLinks.map((a) => $(a.getAttribute("href")));
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const h = document.documentElement.scrollHeight - innerHeight;
    const n = Math.round((h > 0 ? scrollY / h : 0) * SEG);
    segs.forEach((s, i) => s.classList.toggle("on", i < n));
    let cur = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    navLinks.forEach((a, i) => a.classList.toggle("active", i === cur));
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ═════════════ Name: bitmap font ═════════════ */
  const FONT = {
    A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
    E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    J: ["..###", "....#", "....#", "....#", "....#", "#...#", ".###."],
    K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
    N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  };
  const logo = $("#logo");
  let logoPix = [], logoS = 8, logoCtx, logoPat, logoShadow, logoShown = 0, mxL = -99, myL = -99;
  const lineCols = (w) => [...w].reduce((n, ch) => n + (ch === " " ? 3 : 6), -1);

  const layoutLogo = () => {
    const avail = logo.parentElement.clientWidth;
    let lines = ["JACKSON BAKER"];
    let cols = lineCols(lines[0]) + 1;
    if (avail / cols < 6) { lines = ["JACKSON", "BAKER"]; cols = lineCols("JACKSON") + 1; }
    logoS = Math.max(4, Math.min(9, Math.floor(avail / cols)));
    const rowsN = lines.length * 7 + (lines.length - 1) * 2 + 1;
    logoCtx = sizeCanvas(logo, cols * logoS, rowsN * logoS);
    logoPat = ditherPattern(logoCtx, Math.max(1, Math.round(logoS / 4)));
    logoShadow = ditherPattern(logoCtx, Math.max(1, Math.round(logoS / 6)), true);
    logoPix = [];
    lines.forEach((line, li) => {
      let cx = 0;
      for (const ch of line) {
        if (ch === " ") { cx += 3; continue; }
        FONT[ch].forEach((row, j) => [...row].forEach((c, i) => { if (c === "#") logoPix.push([cx + i, li * 9 + j]); }));
        cx += 6;
      }
    });
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    logoPix.forEach((_, i) => { const k = Math.floor(rnd() * (i + 1)); [logoPix[i], logoPix[k]] = [logoPix[k], logoPix[i]]; });
    paintLogo();
  };

  const paintLogo = () => {
    const ctx = logoCtx, s = logoS;
    ctx.clearRect(0, 0, logo.width, logo.height);
    const n = Math.min(logoShown, logoPix.length);
    if (n === logoPix.length) {
      ctx.fillStyle = logoShadow;
      for (const [x, y] of logoPix) ctx.fillRect((x + 1) * s, (y + 1) * s, s, s);
    }
    for (let k = 0; k < n; k++) {
      const [x, y] = logoPix[k];
      const near = Math.hypot(x + 0.5 - mxL, y + 0.5 - myL) < 3.2;
      ctx.fillStyle = near ? PAPER : INK;
      ctx.fillRect(x * s, y * s, s, s);
      if (near) { ctx.fillStyle = logoPat; ctx.fillRect(x * s, y * s, s, s); }
    }
  };

  const revealLogo = () => {
    if (reduced) { logoShown = 1e9; return paintLogo(); }
    const t0 = performance.now(), dur = 800;
    const step = (t) => {
      logoShown = Math.ceil(logoPix.length * Math.min(1, (t - t0) / dur));
      paintLogo();
      if (logoShown < logoPix.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (fine) {
    logo.addEventListener("pointermove", (e) => {
      const r = logo.getBoundingClientRect();
      mxL = (e.clientX - r.left) / logoS; myL = (e.clientY - r.top) / logoS;
      if (logoShown >= logoPix.length) paintLogo();
    });
    logo.addEventListener("pointerleave", () => { mxL = myL = -99; paintLogo(); });
  }
  layoutLogo();
  revealLogo();

  /* ═════════════ Snake ═════════════ */
  const snakeCv = $("#snake"), msg = $("#snake-msg"), msgTitle = $("#snake-title"), msgSub = $("#snake-sub");
  const scoreEl = $("#score"), hiEl = $("#hi");
  const GRID = 15;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
  const pad = (n) => String(n).padStart(3, "0");

  let sctx, cell = 12, mode = "demo", snake, dir, queue, food, score, hi = +(store.get("snake-hi") || 0);
  let last = 0, running = false, visible = true, overT;
  hiEl.textContent = pad(hi);

  const layoutSnake = () => {
    const w = snakeCv.parentElement.clientWidth - 24 - 4;   // padding + canvas border
    cell = Math.max(8, Math.floor(w / GRID));
    sctx = sizeCanvas(snakeCv, cell * GRID, cell * GRID);
    paintSnake();
  };

  const reset = () => {
    const m = Math.floor(GRID / 2);
    snake = [[m - 2, m], [m - 3, m], [m - 4, m]];
    dir = "right"; queue = []; score = 0;
    placeFood();
    scoreEl.textContent = mode === "demo" ? "---" : pad(0);
  };
  const occupied = (x, y) => snake.some(([a, b]) => a === x && b === y);
  const placeFood = () => {
    const free = [];
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (!occupied(x, y)) free.push([x, y]);
    food = free[Math.floor(Math.random() * free.length)];
  };
  const opposite = { up: "down", down: "up", left: "right", right: "left" };
  const safe = (d) => {
    const [hx, hy] = snake[0], [dx, dy] = DIRS[d];
    const nx = hx + dx, ny = hy + dy;
    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) return false;
    return !snake.slice(0, -1).some(([a, b]) => a === nx && b === ny);
  };

  // Demo mode: greedy toward food, avoiding walls and itself
  const autopilot = () => {
    const [hx, hy] = snake[0];
    const opts = Object.keys(DIRS).filter((d) => d !== opposite[dir] && safe(d));
    if (!opts.length) return;
    opts.sort((a, b) => {
      const da = Math.abs(hx + DIRS[a][0] - food[0]) + Math.abs(hy + DIRS[a][1] - food[1]);
      const db = Math.abs(hx + DIRS[b][0] - food[0]) + Math.abs(hy + DIRS[b][1] - food[1]);
      return da - db || (a === dir ? -1 : b === dir ? 1 : 0);
    });
    dir = opts[0];
  };

  const step = () => {
    if (mode === "demo") autopilot();
    else if (queue.length) dir = queue.shift();
    const [dx, dy] = DIRS[dir];
    const head = [snake[0][0] + dx, snake[0][1] + dy];
    const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= GRID || head[1] >= GRID;
    const ate = !hitWall && head[0] === food[0] && head[1] === food[1];
    const body = ate ? snake : snake.slice(0, -1);
    if (hitWall || body.some(([a, b]) => a === head[0] && b === head[1])) return die();
    snake.unshift(head);
    if (ate) {
      if (mode === "play") { score++; scoreEl.textContent = pad(score); blip([880, 1320], 0.04, 0.03); }
      if (snake.length >= GRID * GRID - 1) return die();
      placeFood();
    } else snake.pop();
  };

  const die = () => {
    if (mode === "demo") { reset(); return; }
    blip([440, 330, 220, 110], 0.08, 0.035);
    mode = "over";
    if (score > hi) { hi = score; store.set("snake-hi", hi); hiEl.textContent = pad(hi); }
    showMsg(score >= hi && score > 0 ? "New high!" : "Game over", (fine ? "Click" : "Tap") + " to retry");
    clearTimeout(overT);
    overT = setTimeout(() => { if (mode === "over") toDemo(); }, 8000);
  };

  const showMsg = (title, sub) => { msgTitle.textContent = title; msgSub.textContent = sub; msg.hidden = false; };
  const toDemo = () => { mode = "demo"; reset(); showMsg("Snake", (fine ? "Click" : "Tap") + " to play"); kick(); };
  const start = () => {
    clearTimeout(overT);
    mode = "play"; reset(); msg.hidden = true;
    blip([523, 659, 784], 0.05, 0.03);
    snakeCv.focus({ preventScroll: true });
    kick();
  };
  const pause = () => { if (mode !== "play") return; mode = "pause"; showMsg("Paused", "Esc to resume"); };
  const resume = () => { if (mode !== "pause") return; mode = "play"; msg.hidden = true; kick(); };

  const paintSnake = () => {
    if (!sctx || !snake) return;
    const ctx = sctx, c = cell, W = c * GRID;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, W);
    // faint dot grid
    ctx.fillStyle = INK;
    for (let y = 1; y < GRID; y += 2) for (let x = 1; x < GRID; x += 2) ctx.fillRect(x * c + c / 2 - 0.5, y * c + c / 2 - 0.5, 1, 1);
    // food: hollow square with a centre dot, blinks
    if (Math.floor(performance.now() / 260) % 4 !== 0 || mode !== "play") {
      const [fx, fy] = food, p = Math.max(1, Math.round(c / 6));
      ctx.fillRect(fx * c + p, fy * c + p, c - 2 * p, c - 2 * p);
      ctx.fillStyle = PAPER; ctx.fillRect(fx * c + 2 * p, fy * c + 2 * p, c - 4 * p, c - 4 * p);
      ctx.fillStyle = INK; ctx.fillRect(fx * c + c / 2 - p / 2, fy * c + c / 2 - p / 2, p, p);
    }
    // body: cells joined toward the previous segment so it reads as one line
    const g = 1;
    snake.forEach(([x, y], i) => {
      ctx.fillStyle = INK;
      ctx.fillRect(x * c + g, y * c + g, c - 2 * g, c - 2 * g);
      const prev = snake[i - 1];
      if (prev) {
        const [px, py] = prev;
        ctx.fillRect(Math.min(x, px) * c + g + (px !== x ? c / 2 : 0), Math.min(y, py) * c + g + (py !== y ? c / 2 : 0), px !== x ? c : c - 2 * g, py !== y ? c : c - 2 * g);
      }
    });
    // eyes
    const [hx, hy] = snake[0], [dx, dy] = DIRS[dir], e = Math.max(1, Math.round(c / 6));
    ctx.fillStyle = PAPER;
    const cx = hx * c + c / 2, cy = hy * c + c / 2;
    const ox = dy !== 0 ? c / 4 : 0, oy = dx !== 0 ? c / 4 : 0;
    ctx.fillRect(cx + dx * c / 6 - ox - e / 2, cy + dy * c / 6 - oy - e / 2, e, e);
    ctx.fillRect(cx + dx * c / 6 + ox - e / 2, cy + dy * c / 6 + oy - e / 2, e, e);
  };

  const interval = () => mode === "demo" ? 120 : Math.max(65, 135 - score * 3);
  const loop = (t) => {
    if (!visible || (mode !== "play" && mode !== "demo")) { running = false; paintSnake(); return; }
    if (mode === "demo" && reduced) { running = false; paintSnake(); return; }
    if (t - last >= interval()) { last = t; step(); }
    paintSnake();
    requestAnimationFrame(loop);
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

  // Input
  snakeCv.addEventListener("click", () => { if (mode === "pause") resume(); else if (mode !== "play") start(); });
  snakeCv.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && mode !== "play") { e.preventDefault(); mode === "pause" ? resume() : start(); }
  });
  addEventListener("keydown", (e) => {
    if (mode === "play" || mode === "pause") {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") { e.preventDefault(); return mode === "play" ? pause() : resume(); }
    }
    if (mode !== "play") return;
    const d = KEYS[e.key];
    if (!d) { if (e.key === " ") e.preventDefault(); return; }
    e.preventDefault();
    const lastDir = queue.length ? queue[queue.length - 1] : dir;
    if (d !== lastDir && d !== opposite[lastDir] && queue.length < 3) queue.push(d);
  });
  let touch0 = null;
  snakeCv.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") touch0 = [e.clientX, e.clientY]; });
  snakeCv.addEventListener("pointerup", (e) => {
    if (!touch0) return;
    const dx = e.clientX - touch0[0], dy = e.clientY - touch0[1]; touch0 = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18 || mode !== "play") return;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    const lastDir = queue.length ? queue[queue.length - 1] : dir;
    if (d !== lastDir && d !== opposite[lastDir] && queue.length < 3) queue.push(d);
  });
  addEventListener("blur", pause);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); else pause(); }).observe(snakeCv);
  }

  if (!fine) msgSub.textContent = "Tap to play";
  reset();
  layoutSnake();
  kick();

  /* ═════════════ Projects (live from GitHub) ═════════════ */
  const featuredEl = $("#featured"), moreEl = $("#more"), moreWrap = $("#more-wrap");
  featuredEl.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ago = (iso) => {
    const s = (new Date(iso) - Date.now()) / 1000;
    for (const [u, n] of [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600]])
      if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
    return "just now";
  };

  const CACHE_KEY = "gh-repos-v1", TTL = 60 * 60 * 1000;
  const load = async () => {
    try {
      const c = JSON.parse(store.get(CACHE_KEY) || "null");
      if (c && Date.now() - c.t < TTL) return c.repos;
    } catch {}
    const res = await fetch(`https://api.github.com/users/${S.user}/repos?per_page=100&type=owner&sort=pushed`, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(res.status);
    const repos = (await res.json()).map(({ name, description, stargazers_count, pushed_at, language, fork, archived, html_url, homepage }) =>
      ({ name, description, stargazers_count, pushed_at, language, fork, archived, html_url, homepage }));
    store.set(CACHE_KEY, JSON.stringify({ t: Date.now(), repos }));
    return repos;
  };

  const render = (repos) => {
    const hidden = new Set(S.HIDDEN);
    const list = repos
      .filter((r) => !r.fork && !r.archived && !hidden.has(r.name))
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at));
    const featured = list.filter((r) => S.CURATED[r.name] || r.stargazers_count > 0);
    const rest = list.filter((r) => !featured.includes(r));
    const url = (r) => r.html_url || `https://github.com/${S.user}/${r.name}`;

    featuredEl.innerHTML = featured.map((r, i) => {
      const c = S.CURATED[r.name] || {};
      const lang = c.lang || r.language || "";
      const stars = r.stargazers_count > 0 ? `★ ${r.stargazers_count}` : "";
      const chips = [
        ...(c.stats || []).map((s) => `<span class="chip solid">${esc(s)}</span>`),
        ...(c.stack ? c.stack.split(" · ") : []).map((s) => `<span class="chip">${esc(s)}</span>`),
      ].join("");
      const ext = c.link || (r.homepage ? { href: r.homepage, label: "Site" } : null);
      return `
        <article class="cart box">
          <header class="panel-head px"><span>${String(i + 1).padStart(2, "0")}</span><span>${[stars, esc(lang)].filter(Boolean).join(" · ")}</span></header>
          <h3 class="px"><a href="${esc(url(r))}" target="_blank" rel="noopener">${esc(c.title || r.name)}</a></h3>
          ${c.tag ? `<p class="tag px">${esc(c.tag)}</p>` : ""}
          <p class="body">${esc(c.body || r.description || "")}</p>
          ${chips ? `<div class="chips px">${chips}</div>` : ""}
          <div class="cart-foot px"><span>Updated ${esc(ago(r.pushed_at))}</span>${ext ? `<a href="${esc(ext.href)}" target="_blank" rel="noopener">${esc(ext.label)} ↗</a>` : "<span>Repo ↗</span>"}</div>
        </article>`;
    }).join("");

    moreWrap.hidden = rest.length === 0;
    moreEl.innerHTML = rest.map((r) => `
      <li><a href="${esc(url(r))}" target="_blank" rel="noopener" data-sfx>
        <span>▸</span><span class="px">${esc(r.name)}</span><span class="r-desc">${esc(r.description || "")}</span><span class="px">${esc(r.language || "")}</span>
      </a></li>`).join("");
  };
  load().then(render).catch(() => render(S.FALLBACK));

  /* ═════════════ Resize ═════════════ */
  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { layoutLogo(); layoutSnake(); }, 120);
  });
})();
