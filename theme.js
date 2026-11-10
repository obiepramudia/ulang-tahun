// theme.js: musik otomatis dan bunga jatuh. Dimuat setelah extra.js.
(() => {
  const $ = s => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Musik langsung bunyi ----------
  const au = $("#birthdayAudio");
  const btn = $("#playMusic");
  const status = $("#audioStatus");
  const events = ["pointerdown", "keydown", "touchstart"];
  au.loop = true;
  au.volume = 0.85;

  const stopWaiting = () => events.forEach(e => removeEventListener(e, onFirstTouch, true));

  function onFirstTouch(ev) {
    // Biarkan tombol musik mengatur dirinya sendiri
    if (ev.target.closest && ev.target.closest("#fmusic, #playMusic, .prog")) return;
    au.play().catch(() => {});
  }

  au.addEventListener("play", () => {
    btn.textContent = "\u2161";
    status.textContent = "Now playing";
    stopWaiting();
  });
  au.addEventListener("pause", () => {
    btn.textContent = "\u25B6";
    status.textContent = "Paused";
  });
  au.addEventListener("error", stopWaiting);

  // Coba putar saat halaman dibuka. Jika browser menolak,
  // lagu mulai pada sentuhan atau tombol pertama.
  au.play().catch(() => {});
  events.forEach(e => addEventListener(e, onFirstTouch, true));

  // ---------- Bunga jatuh di halaman scroll ----------
  if (reduce) return;
  const story = $("#story");
  const cv = document.createElement("canvas");
  cv.id = "petals";
  cv.style.display = "none";
  document.body.appendChild(cv);
  const g = cv.getContext("2d");
  let W, H;
  const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  size();
  addEventListener("resize", size);

  const sprite = draw => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    x.translate(64, 64);
    draw(x);
    return c;
  };
  const petals = (x, n, len, wid, c0, c1, off = 0) => {
    for (let i = 0; i < n; i++) {
      x.save();
      x.rotate(off + i * 6.283 / n);
      const gr = x.createLinearGradient(0, 0, 0, -len);
      gr.addColorStop(0, c0); gr.addColorStop(1, c1);
      x.fillStyle = gr;
      x.beginPath();
      x.moveTo(0, 0);
      x.bezierCurveTo(wid, -len * .3, wid, -len * .95, 0, -len);
      x.bezierCurveTo(-wid, -len * .95, -wid, -len * .3, 0, 0);
      x.fill();
      x.restore();
    }
  };
  const disc = (x, r, c0, c1) => {
    const gr = x.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    x.fillStyle = gr; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.fill();
  };

  const kinds = [
    // mawar merah muda
    sprite(x => {
      disc(x, 58, "#ff9fb8", "#c8365d");
      for (let k = 0; k < 6; k++) {
        x.strokeStyle = k % 2 ? "#ffc6d4" : "#a82447";
        x.lineWidth = 5;
        x.beginPath(); x.arc(0, 0, 50 - k * 8, k, k + 4); x.stroke();
      }
    }),
    // bunga matahari
    sprite(x => {
      petals(x, 18, 60, 9, "#f09a00", "#ffd426");
      disc(x, 24, "#5a2d0c", "#1f0e04");
    }),
    // bunga biru
    sprite(x => {
      petals(x, 5, 58, 30, "#6aa8ff", "#2548c9");
      petals(x, 5, 36, 20, "#ffffff", "#7fb0ff", .6);
      disc(x, 7, "#fff", "#cfe4ff");
    })
  ];

  const make = top => ({
    x: Math.random() * W,
    y: top ? -50 : Math.random() * H,
    s: 14 + Math.random() * 20,
    vy: .45 + Math.random() * .7,
    t: Math.random() * 6.28,
    a: Math.random() * 6.28,
    va: (Math.random() - .5) * .02,
    k: kinds[(Math.random() * kinds.length) | 0],
    o: .6 + Math.random() * .35
  });
  const flowers = Array.from({ length: 16 }, () => make(false));

  function frame() {
    const on = !story.classList.contains("hidden");
    cv.style.display = on ? "block" : "none";
    if (on) {
      g.clearRect(0, 0, W, H);
      for (const f of flowers) {
        f.t += .012; f.a += f.va;
        f.x += Math.sin(f.t) * .6; f.y += f.vy;
        if (f.y > H + 50) Object.assign(f, make(true));
        g.save();
        g.translate(f.x, f.y);
        g.rotate(f.a);
        g.globalAlpha = f.o;
        g.drawImage(f.k, -f.s, -f.s, f.s * 2, f.s * 2);
        g.restore();
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// ---------- Hamparan bunga baru di halaman reveal ----------
(() => {
  const rev = document.getElementById("flowerReveal");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.createElement("canvas");
  cv.className = "bloom";
  rev.prepend(cv);
  const g = cv.getContext("2d");
  const S = 256, R = 120;

  const mk = draw => {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const x = c.getContext("2d");
    x.translate(S / 2, S / 2);
    draw(x);
    return c;
  };
  const petal = (x, len, wid, rot, c0, c1, edge) => {
    x.save(); x.rotate(rot);
    const gr = x.createLinearGradient(0, 0, 0, -len);
    gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    x.fillStyle = gr; x.beginPath(); x.moveTo(0, 0);
    x.bezierCurveTo(wid, -len * .2, wid * 1.05, -len * .92, 0, -len);
    x.bezierCurveTo(-wid * 1.05, -len * .92, -wid, -len * .2, 0, 0);
    x.fill();
    if (edge) { x.strokeStyle = edge; x.lineWidth = 1.4; x.stroke(); }
    x.restore();
  };
  const ring = (x, n, len, wid, off, c0, c1, edge) => {
    for (let i = 0; i < n; i++) petal(x, len, wid, off + i * 6.2832 / n, c0, c1, edge);
  };
  const disc = (x, r, c0, c1) => {
    const gr = x.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    x.fillStyle = gr; x.beginPath(); x.arc(0, 0, r, 0, 6.2832); x.fill();
  };

  const rose = mk(x => {
    const e = "rgba(70,0,25,.35)";
    ring(x, 5, R * .98, R * .5, 0, "#7d0f31", "#e0456f", e);
    ring(x, 5, R * .8, R * .42, .63, "#8e1236", "#f06a8d", e);
    ring(x, 4, R * .6, R * .36, .3, "#a3173f", "#ff94ae", e);
    ring(x, 3, R * .4, R * .28, .9, "#b01c47", "#ffb3c4", e);
    disc(x, R * .1, "#7d0f31", "#c42a55");
  });
  const sunflower = mk(x => {
    ring(x, 16, R, R * .17, 0, "#e08a00", "#ffd23a", "rgba(120,60,0,.25)");
    ring(x, 16, R * .88, R * .16, .2, "#f0a000", "#ffe066");
    disc(x, R * .42, "#6b3a12", "#2a1206");
    x.fillStyle = "rgba(255,190,80,.55)";
    for (let i = 0; i < 70; i++) {
      const a = i * 2.39996, r = R * .38 * Math.sqrt(i / 70);
      x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, 2.2, 0, 6.2832); x.fill();
    }
  });
  const blossom = mk(x => {
    ring(x, 5, R * .96, R * .52, 0, "#f7a9c1", "#ffffff", "rgba(200,90,130,.3)");
    disc(x, R * .15, "#ffd75a", "#e8a021");
    x.fillStyle = "#c4663a";
    for (let i = 0; i < 9; i++) {
      const a = i * 6.2832 / 9;
      x.beginPath(); x.arc(Math.cos(a) * R * .22, Math.sin(a) * R * .22, 3, 0, 6.2832); x.fill();
    }
  });
  const blue = mk(x => {
    ring(x, 5, R * .92, R * .46, 0, "#2a4fd6", "#8fb4ff", "rgba(10,20,90,.3)");
    ring(x, 5, R * .55, R * .3, .6, "#cfe0ff", "#ffffff");
    disc(x, R * .09, "#ffffff", "#bcd4ff");
  });
  const leaf = mk(x => {
    const gr = x.createLinearGradient(0, 0, 0, -R);
    gr.addColorStop(0, "#1b3d2c"); gr.addColorStop(1, "#3f8a5c");
    x.fillStyle = gr; x.beginPath(); x.moveTo(0, 0);
    x.bezierCurveTo(R * .5, -R * .3, R * .4, -R * .8, 0, -R);
    x.bezierCurveTo(-R * .4, -R * .8, -R * .5, -R * .3, 0, 0);
    x.fill();
    x.strokeStyle = "rgba(190,240,200,.35)"; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, -6); x.lineTo(0, -R * .85); x.stroke();
  });
  const kinds = [rose, rose, sunflower, blossom, blossom, blue];
  window.__sprites = { rose, sunflower, blossom, blue, leaf };

  let items = [], raf = 0, t0 = 0, W = 0, H = 0;

  const plant = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = rev.clientWidth; H = rev.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sc = Math.max(.6, Math.min(1.15, W / 1500));
    const n = Math.round(W * H / 15000);
    // Tengah dikosongkan agar tulisan terbaca; bunga menumpuk di tepi
    const spot = () => {
      for (;;) {
        const x = Math.random() * (W + 80) - 40, y = Math.random() * (H + 80) - 40;
        const d = Math.hypot((x / W - .5) / .34, (y / H - .5) / .28);
        if (d > 1 || Math.random() < d * d * d * .2) return [x, y];
      }
    };
    items = [];
    for (let i = 0; i < n; i++) {
      const [x, y] = spot();
      const r = (26 + Math.random() * 42) * sc;
      const d = Math.random() * 1700;
      items.push({ x, y, r, k: kinds[(Math.random() * kinds.length) | 0], a: Math.random() * 6.28,
        d, w: Math.random() * 6.28, z: r, dir: Math.random() < .5 ? 1 : -1 });
      if (Math.random() < .7) {
        for (let j = 0; j < 2; j++) {
          const ang = Math.random() * 6.28;
          items.push({ x: x + Math.cos(ang) * r * .8, y: y + Math.sin(ang) * r * .8,
            r: r * (.7 + Math.random() * .4), k: leaf, a: ang + Math.PI / 2,
            d: d - 150, w: Math.random() * 6.28, z: -1, dir: 1 });
        }
      }
    }
    items.sort((a, b) => a.z - b.z);
  };

  const frame = ts => {
    t0 = t0 || ts;
    const e = reduce ? 1e5 : ts - t0;
    g.clearRect(0, 0, W, H);
    for (const f of items) {
      const k = Math.min(1, Math.max(0, (e - f.d) / 900));
      if (!k) continue;
      const sz = f.r * (1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2));
      g.save();
      g.translate(f.x, f.y);
      g.rotate(f.a + f.dir * e * .00005 + Math.sin(e * .0007 + f.w) * .08);
      g.drawImage(f.k, -sz, -sz, sz * 2, sz * 2);
      g.restore();
    }
    if (!reduce) raf = requestAnimationFrame(frame);
  };

  document.getElementById("openGift").addEventListener("click", () => {
    cancelAnimationFrame(raf); plant(); t0 = 0;
    raf = requestAnimationFrame(frame);
  });
  document.getElementById("continueButton").addEventListener("click", () => cancelAnimationFrame(raf));
})();

// ---------- Cover: bunga di sudut halaman kode ----------
(() => {
  const intro = document.getElementById("intro");
  const S = window.__sprites;
  if (!S) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.createElement("canvas");
  cv.className = "cover-fx";
  intro.prepend(cv);
  const g = cv.getContext("2d");
  const kinds = [S.rose, S.rose, S.sunflower, S.blossom, S.blossom, S.blue];
  let W = 0, H = 0, items = [], raf = 0, t0 = 0;

  const plant = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = intro.clientWidth; H = intro.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = Math.min(W, H);
    const sc = Math.max(.55, Math.min(1.1, m / 800));
    const spread = m * .36;
    items = [];
    [[0, 0], [W, 0], [0, H], [W, H]].forEach(([cx, cy], ci) => {
      const sx = cx ? -1 : 1, sy = cy ? -1 : 1;
      for (let i = 0; i < 9; i++) {
        const fx = Math.pow(Math.random(), 1.4), fy = Math.pow(Math.random(), 1.4);
        const x = cx + sx * fx * spread - sx * 14, y = cy + sy * fy * spread - sy * 14;
        const r = (30 + Math.random() * 32) * sc * (1 - Math.hypot(fx, fy) * .3);
        const d = ci * 220 + Math.random() * 900;
        items.push({ x, y, r, k: kinds[(Math.random() * kinds.length) | 0], a: Math.random() * 6.28,
          d, w: Math.random() * 6.28, z: r, dir: Math.random() < .5 ? 1 : -1 });
        if (Math.random() < .75) {
          const ang = Math.random() * 6.28;
          items.push({ x: x + Math.cos(ang) * r * .8, y: y + Math.sin(ang) * r * .8,
            r: r * (.7 + Math.random() * .4), k: S.leaf, a: ang + Math.PI / 2,
            d: d - 150, w: Math.random() * 6.28, z: -1, dir: 1 });
        }
      }
    });
    items.sort((a, b) => a.z - b.z);
  };

  const frame = ts => {
    if (intro.classList.contains("hidden")) return;
    t0 = t0 || ts;
    const e = reduce ? 1e5 : ts - t0;
    g.clearRect(0, 0, W, H);
    for (const f of items) {
      const k = Math.min(1, Math.max(0, (e - f.d) / 1000));
      if (!k) continue;
      const sz = f.r * (1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2));
      g.save();
      g.translate(f.x, f.y);
      g.rotate(f.a + f.dir * e * .00004 + Math.sin(e * .0008 + f.w) * .09);
      g.drawImage(f.k, -sz, -sz, sz * 2, sz * 2);
      g.restore();
    }
    if (!reduce) raf = requestAnimationFrame(frame);
  };

  const start = () => { cancelAnimationFrame(raf); plant(); t0 = 0; raf = requestAnimationFrame(frame); };
  start();
  addEventListener("resize", () => { if (!intro.classList.contains("hidden")) start(); });
})();
