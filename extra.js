// extra.js: lapisan interaksi tambahan, dimuat setelah script.js
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // ---------- Kanvas: kelopak jatuh + konfeti ----------
  const cv = document.createElement("canvas");
  cv.id = "fx";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W, H;
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  resize();
  addEventListener("resize", resize);

  const colors = ["#f4c6cc", "#e9a0b0", "#f7dcd6", "#f2d9b4", "#d98ea0"];
  const pick = () => colors[(Math.random() * colors.length) | 0];
  const petal = fromTop => ({
    x: Math.random() * W, y: fromTop ? -20 : Math.random() * H,
    r: 6 + Math.random() * 7, vy: 0.5 + Math.random() * 0.7,
    vx: 0, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.025,
    s: Math.random() * 6.28, f: Math.random() * 6.28, o: 0.5 + Math.random() * 0.35, c: pick()
  });
  const petals = Array.from({ length: 16 }, () => petal(false));
  let bits = [];

  window.burst = (x = W / 2, y = H / 2, n = 90) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, v = 3 + Math.random() * 7;
      bits.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, a: 0,
        va: Math.random() * 0.4, w: 5 + Math.random() * 5,
        h: 3 + Math.random() * 4, c: pick(), life: 110
      });
    }
  };

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.s += 0.015; p.f += 0.035; p.x += Math.sin(p.s) * 0.7 + 0.15; p.y += p.vy; p.a += p.va;
      if (p.y > H + 20 || p.x > W + 30) Object.assign(p, petal(true));
      const r = p.r;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.scale(Math.max(0.3, Math.abs(Math.cos(p.f))), 1);
      ctx.globalAlpha = p.o; ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.95, -r * 0.55, r * 0.8, r * 0.7, 0, r);
      ctx.bezierCurveTo(-r * 0.8, r * 0.7, -r * 0.95, -r * 0.55, 0, -r);
      ctx.fill();
      ctx.restore();
    }
    bits = bits.filter(b => b.life > 0);
    for (const b of bits) {
      b.vy += 0.18; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.a += b.va; b.life--;
      ctx.save();
      ctx.translate(b.x, b.y); ctx.rotate(b.a);
      ctx.globalAlpha = Math.min(1, b.life / 40); ctx.fillStyle = b.c;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }
  if (!reduce) loop();

  // ---------- Kode salah: titik bergetar ----------
  const dotsBox = $("#codeDots");
  new MutationObserver(() => {
    if ($("#codeError").textContent) {
      dotsBox.classList.remove("shake");
      void dotsBox.offsetWidth;
      dotsBox.classList.add("shake");
    }
  }).observe($("#codeError"), { childList: true, characterData: true, subtree: true });

  // ---------- Konfeti saat membuka hadiah dan lanjut ----------
  $("#openGift").addEventListener("click", () => setTimeout(() => burst(), 120));
  $("#continueButton").addEventListener("click", () => burst(W / 2, H * 0.7, 60));

  // ---------- Judul ulang tahun muncul huruf per huruf ----------
  const title = $(".birthday-title");
  const fixed = title.textContent.trim();
  title.setAttribute("aria-label", fixed);
  let n = 0;
  title.innerHTML = fixed.split(" ").map(word =>
    `<span class="w" aria-hidden="true">${[...word].map(c =>
      `<span class="l" style="animation-delay:${(n++) * 70}ms">${c}</span>`).join("")}</span>`
  ).join(" ");

  // ---------- Kue: semua lilin padam ----------
  const wish = document.createElement("p");
  wish.className = "wish-done";
  wish.setAttribute("aria-live", "polite");
  $(".tap-hint").after(wish);

  $$(".cdl").forEach(c => {
    const out = () => {
      if (c.classList.contains("off")) return;
      c.classList.add("off");
      const r = c.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.3, 14);
      if ($$(".cdl.off").length === $$(".cdl").length) {
        setTimeout(() => burst(W / 2, H * 0.4, 130), 600);
        wish.textContent = "Semoga permohonanmu terkabul ya sayangg";
        wish.classList.add("on");
      }
    };
    c.addEventListener("click", out);
    c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); out(); } });
  });

  // ---------- Reveal untuk elemen kunci ----------
  const targets = $$(".timeline-item, .memory, .music-card");
  targets.forEach((el, i) => {
    el.classList.add("rv");
    el.style.transitionDelay = (i % 3) * 120 + "ms";
  });
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
      setTimeout(() => { e.target.style.transitionDelay = ""; }, 1200);
    }
  }), { threshold: 0.15 });
  targets.forEach(el => io.observe(el));

  // ---------- Surat diketik pelan ----------
  const letter = $(".letter-paper");
  const paras = $$("p", letter).filter(p => !p.classList.contains("letter-sign") &&
                                            !p.classList.contains("letter-dear"));
  async function typeLetter() {
    for (const p of paras) {
      const text = p.textContent.replace(/\s+/g, " ").trim();
      p.innerHTML = '<span></span><span style="visibility:hidden"></span>';
      const [a, b] = p.children;
      for (let i = 0; i <= text.length; i++) {
        a.textContent = text.slice(0, i);
        b.textContent = text.slice(i);
        await wait(16);
      }
    }
  }
  if (!reduce) {
    const saved = paras.map(p => p.innerHTML);
    paras.forEach(p => { p.innerHTML = '<span style="visibility:hidden">' + p.textContent + "</span>"; });
    const lio = new IntersectionObserver(es => {
      if (es[0].isIntersecting) { lio.disconnect(); typeLetter(); }
    }, { threshold: 0.35 });
    lio.observe(letter);
    void saved;
  }

  // ---------- Foto: lightbox dan placeholder ----------
  const lb = document.createElement("div");
  lb.id = "lb";
  lb.innerHTML = "<img alt=''><p></p>";
  document.body.appendChild(lb);
  const close = () => lb.classList.remove("on");
  lb.addEventListener("click", close);
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  $$(".memory").forEach(fig => {
    const img = $("img", fig);
    img.addEventListener("error", () => fig.classList.add("ph"));
    fig.addEventListener("click", () => {
      if (fig.classList.contains("ph")) return;
      $("img", lb).src = img.src;
      $("p", lb).textContent = $("figcaption", fig).textContent;
      lb.classList.add("on");
    });
  });

  // ---------- Musik: animasi saat diputar ----------
  const au = $("#birthdayAudio");
  const setPlay = on => {
    $(".album-art").classList.toggle("playing", on);
    $(".music-card").classList.toggle("playing", on);
  };
  au.addEventListener("play", () => setPlay(true));
  ["pause", "ended"].forEach(ev => au.addEventListener(ev, () => setPlay(false)));

  // ---------- Progress scroll ----------
  const bar = document.createElement("div");
  bar.id = "bar";
  document.body.appendChild(bar);
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = max > 0 ? (scrollY / max) * 100 + "%" : "0";
  }, { passive: true });

  // ---------- Jejak kilau kursor (hanya mouse) ----------
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    let last = 0;
    addEventListener("pointermove", e => {
      const t = performance.now();
      if (t - last < 55) return;
      last = t;
      const s = document.createElement("span");
      s.className = "sp";
      s.textContent = "\u2726";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    });
  }

  // ---------- Botol: kertas fisik di dalam ----------
  const glass = $(".jar-glass");
  $$(".jar-paper", glass).forEach(p => p.remove());
  const pc = ["#f3e3d6", "#efc9cf", "#f1d9b4", "#e7b8c4", "#f8ece2"];
  const fill = () => {
    for (let i = 0; i < 7; i++) {
      const p = document.createElement("i");
      p.className = "jp";
      p.style.cssText = `left:${8 + Math.random() * 62}%;bottom:${2 + i * 7 + Math.random() * 6}%;` +
        `background:${pc[i % pc.length]};rotate:${Math.random() * 120 - 60}deg`;
      glass.appendChild(p);
    }
  };
  fill();
  const take = () => {
    const ps = $$(".jp", glass), p = ps[ps.length - 1];
    if (p) {
      p.classList.add("out");
      setTimeout(() => p.remove(), 1000);
      if (ps.length === 1) setTimeout(fill, 2200);
    }
    const c = $("#noteCard");
    c.style.rotate = (Math.random() * 4 - 2) + "deg";
    c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop");
  };
  $("#shakeJar").addEventListener("click", take);
  $("#jar").addEventListener("click", take);
  $("#jar").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") take(); });

  // ---------- Musik: progres lagu dan tombol melayang ----------
  const prog = document.createElement("div");
  prog.className = "prog";
  prog.innerHTML = '<span id="tCur">0:00</span><input id="seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Posisi lagu"><span id="tDur">0:00</span>';
  $(".audio-controls").after(prog);
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00";
  const seek = $("#seek");
  au.addEventListener("loadedmetadata", () => { $("#tDur").textContent = fmt(au.duration); });
  au.addEventListener("timeupdate", () => {
    seek.value = au.duration ? au.currentTime / au.duration * 100 : 0;
    $("#tCur").textContent = fmt(au.currentTime);
  });
  seek.addEventListener("input", () => { if (au.duration) au.currentTime = seek.value / 100 * au.duration; });
  const fm = document.createElement("button");
  fm.id = "fmusic";
  fm.setAttribute("aria-label", "Putar atau jeda musik");
  fm.textContent = "\u266B";
  document.body.appendChild(fm);
  fm.addEventListener("click", () => $("#playMusic").click());
  au.addEventListener("play", () => fm.classList.add("on"));
  ["pause", "ended"].forEach(ev => au.addEventListener(ev, () => fm.classList.remove("on")));
})();
