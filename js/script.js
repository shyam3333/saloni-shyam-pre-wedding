/* =========================================================================
   15 NOVEMBER INVITATION - BEHAVIOUR
   Envelope opening, decorative art, countdown, petals, music.
   Animations are driven from JavaScript (canvas / requestAnimationFrame)
   where it matters, so they still run with reduced motion / battery saver.
   ========================================================================= */
(function () {
  "use strict";

  const CONFIG = window.CARD_CONFIG || {};
  const SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */
  function get(path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), CONFIG);
  }

  // Small seeded random so the hand-placed art looks the same on every load.
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function use(id, x, y, size, rotate, extra) {
    const half = size / 2;
    return `<use href="#${id}" x="${(x - half).toFixed(1)}" y="${(y - half).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}"` +
      (rotate ? ` transform="rotate(${rotate.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"` : "") +
      (extra || "") + "/>";
  }

  function leaf(x, y, len, angle) {
    // the leaf symbol starts at its left-middle, so anchor it there
    return `<use href="#leaf" x="${x.toFixed(1)}" y="${(y - len * 0.31).toFixed(1)}" width="${len.toFixed(1)}" height="${(len * 0.62).toFixed(1)}" transform="rotate(${angle.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }

  /* ---------------------------------------------------------------------
     Bind text from config
     --------------------------------------------------------------------- */
  function bindText() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const v = get(el.getAttribute("data-bind"));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-bind-lines]").forEach((el) => {
      const v = get(el.getAttribute("data-bind-lines")) || [];
      el.innerHTML = "";
      v.forEach((line) => {
        const s = document.createElement("span");
        s.textContent = line;
        el.appendChild(s);
      });
    });
    const btn = document.getElementById("directionsBtn");
    if (btn && CONFIG.venue) {
      btn.href = CONFIG.venue.directionsUrl ||
        "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.venue.address || "");
    }
  }

  /* ---------------------------------------------------------------------
     Embossed rose on the envelope: cupped petals in rings + two leaves
     --------------------------------------------------------------------- */
  function buildEmbossRose() {
    const g = document.getElementById("embossRoseArt");
    if (!g) return;
    const r = rng(4242);
    const P = (rad, ang) => `${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`;
    let o = "";

    // tight spiral bud in the middle
    let d = "";
    for (let t = 0; t <= Math.PI * 3.2; t += 0.25) {
      d += (d ? "L" : "M") + P(1.5 + t * 1.25, t + 0.4);
    }
    o += `<path d="${d}"/>`;

    // rings of cupped petals, each a curve bulging outward
    const rings = [[11, 3, 1.5], [19, 4, 1.35], [28, 5, 1.3], [38, 5, 1.25], [47, 6, 1.2]];
    rings.forEach(([R, n, span]) => {
      const rot = r() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const a0 = rot + (i / n) * Math.PI * 2;
        const a1 = a0 + (Math.PI * 2 / n) * span;
        const am = (a0 + a1) / 2;
        const rr = R * (0.94 + r() * 0.12);
        o += `<path d="M${P(rr * 0.72, a0)}Q${P(rr * 1.28, am)} ${P(rr * 0.72, a1)}"/>`;
        // a small curl at the petal tip on the outer rings
        if (R > 25) o += `<path d="M${P(rr * 0.98, am - 0.18)}q${(Math.cos(am) * 3).toFixed(1)} ${(Math.sin(am) * 3).toFixed(1)} ${(Math.cos(am + 1.2) * 4).toFixed(1)} ${(Math.sin(am + 1.2) * 4).toFixed(1)}"/>`;
      }
    });

    // two leaves with a centre vein and side veins
    [[-2.4, 1], [0.5, 0.9]].forEach(([ang, s]) => {
      const base = 42;
      const tip = 42 + 32 * s;
      const w = 0.32;
      const lx = (rad, a) => P(rad, a);
      o += `<path d="M${lx(base, ang)}Q${lx(base + 16 * s, ang - w)} ${lx(tip, ang)}Q${lx(base + 16 * s, ang + w)} ${lx(base, ang)}Z"/>`;
      o += `<path d="M${lx(base + 2, ang)}L${lx(tip - 3, ang)}"/>`;
      for (let k = 1; k <= 3; k++) {
        const rad = base + k * 7 * s;
        o += `<path d="M${lx(rad, ang)}L${lx(rad + 5, ang - 0.12)}M${lx(rad, ang)}L${lx(rad + 5, ang + 0.12)}"/>`;
      }
    });
    g.innerHTML = o;
  }

  /* ---------------------------------------------------------------------
     Wax seal outline: a wobbly blob
     --------------------------------------------------------------------- */
  function buildWaxSeal() {
    const path = document.getElementById("waxBlob");
    if (!path) return;
    const r = rng(15);
    const pts = [];
    const n = 72;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rad = 92 + 5 * Math.sin(a * 9 + 0.6) + 2.5 * Math.sin(a * 4) + (r() - 0.5) * 3;
      pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    let d = "";
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % n];
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2;
      d += (i === 0 ? `M${mx.toFixed(2)} ${my.toFixed(2)}` : "") + `Q${q[0].toFixed(2)} ${q[1].toFixed(2)} `;
      const nn = pts[(i + 2) % n];
      d += `${((q[0] + nn[0]) / 2).toFixed(2)} ${((q[1] + nn[1]) / 2).toFixed(2)} `;
    }
    path.setAttribute("d", d + "Z");
  }

  /* ---------------------------------------------------------------------
     Invitation art: hanging rose garland + potted plants
     --------------------------------------------------------------------- */
  function buildGarland() {
    const g = document.getElementById("garland");
    if (!g) return;
    const r = rng(2611);
    let out = "";

    // hanging strands: [x, length]
    const strands = [
      [22, 430], [50, 340], [80, 230], [108, 170], [138, 120], [176, 80],
      [222, 60], [262, 46], [338, 50], [380, 64],
      [424, 92], [460, 120], [492, 160], [522, 220], [552, 360], [580, 450]
    ];
    strands.forEach(([x, len], si) => {
      const sway = (r() - 0.5) * 10;
      out += `<path d="M${x} 20 Q${x + sway} ${20 + len / 2} ${x + sway * 0.4} ${20 + len}" fill="none" stroke="#4f7d3f" stroke-width="1.3" opacity=".85"/>`;
      for (let y = 34; y < 20 + len; y += 15) {
        const t = (y - 20) / len;
        const cx = x + sway * Math.sin(t * Math.PI) * 0.8;
        const side = (Math.floor(y / 15) % 2) ? 1 : -1;
        out += leaf(cx, y, 13 + r() * 6, side > 0 ? -20 - r() * 35 : 200 + r() * 35);
      }
      // roses along the strand
      for (let y = 60 + r() * 30; y < 20 + len - 10; y += 62 + r() * 30) {
        const t = (y - 20) / len;
        out += use("rose", x + sway * Math.sin(t * Math.PI) * 0.8, y, 18 + r() * 8, r() * 360);
      }
      // end with a rose or a bud
      const ex = x + sway * 0.4;
      const ey = 20 + len;
      out += si % 3 === 1 ? use("bud", ex, ey + 4, 14, (r() - 0.5) * 30) : use("rose", ex, ey, 20 + r() * 6, r() * 360);
    });

    // dense band of leaves and roses along the top
    for (let x = -10; x < 620; x += 9) {
      out += leaf(x, 4 + r() * 34, 18 + r() * 10, r() * 360);
    }
    for (let x = 6; x < 600; x += 30 + r() * 16) {
      out += use(r() > 0.25 ? "rose" : "rosePink", x, 14 + r() * 26, 26 + r() * 12, r() * 360);
    }
    for (let i = 0; i < 18; i++) {
      out += use("bud", r() * 600, 38 + r() * 16, 10 + r() * 4, (r() - 0.5) * 50);
    }
    g.innerHTML = out;
  }

  function potPlant(cx, base, s, seed) {
    const r = rng(seed);
    let out = "";
    // long leaves fanning up
    for (let i = 0; i < 15; i++) {
      const ang = -90 + (i / 14 - 0.5) * 95 + (r() - 0.5) * 10;
      const len = (72 + r() * 52) * s;
      const rad = (ang * Math.PI) / 180;
      const x1 = cx + Math.cos(rad) * len;
      const y1 = base - 58 * s + Math.sin(rad) * len;
      const bend = (r() - 0.5) * 30 * s;
      out += `<path d="M${cx} ${base - 56 * s} Q${(cx + x1) / 2 + bend} ${(base - 56 * s + y1) / 2} ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${i % 2 ? "#3d7a3c" : "#5f9a4c"}" stroke-width="${(4.5 * s).toFixed(1)}" stroke-linecap="round"/>`;
      if (i % 2 === 0) {
        for (let k = 0; k < 3; k++) {
          out += use("whiteFlower", x1 + (r() - 0.5) * 16 * s, y1 + (r() - 0.5) * 16 * s, (10 + r() * 5) * s, r() * 90);
        }
      }
    }
    // brass pot
    const w = 38 * s;
    const top = base - 60 * s;
    out += `<path d="M${cx - w} ${top} H${cx + w} C${cx + w} ${top + 9 * s} ${cx + w - 6 * s} ${top + 11 * s} ${cx + w - 10 * s} ${top + 13 * s} C${cx + w + 2 * s} ${top + 30 * s} ${cx + w - 4 * s} ${top + 50 * s} ${cx + 16 * s} ${base} H${cx - 16 * s} C${cx - w + 4 * s} ${top + 50 * s} ${cx - w - 2 * s} ${top + 30 * s} ${cx - w + 10 * s} ${top + 13 * s} C${cx - w + 6 * s} ${top + 11 * s} ${cx - w} ${top + 9 * s} ${cx - w} ${top}Z" fill="url(#brassGrad)" stroke="#7d4b18" stroke-width=".8"/>`;
    out += `<ellipse cx="${cx}" cy="${top}" rx="${w}" ry="${5 * s}" fill="#e7bd6b" stroke="#8a5a20" stroke-width=".8"/>`;
    out += `<path d="M${cx - w + 8 * s} ${top + 28 * s} H${cx + w - 8 * s}" stroke="#f3d48e" stroke-width="${2 * s}" opacity=".7"/>`;
    return out;
  }

  function buildPots() {
    const left = document.getElementById("potLeft");
    const right = document.getElementById("potRight");
    if (left) left.innerHTML = potPlant(54, 888, 1, 11) + potPlant(124, 896, 0.7, 12);
    if (right) right.innerHTML = potPlant(546, 888, 1, 21) + potPlant(476, 896, 0.7, 22);
  }

  /* ---------------------------------------------------------------------
     Venue art: a Rajasthani fort-palace
     --------------------------------------------------------------------- */
  function archWindows(x0, x1, y, h, step, fill) {
    let out = "";
    for (let x = x0; x <= x1; x += step) {
      const w = step * 0.42;
      out += `<path d="M${x - w / 2} ${y + h} V${y + h * 0.4} Q${x - w / 2} ${y} ${x} ${y} Q${x + w / 2} ${y} ${x + w / 2} ${y + h * 0.4} V${y + h}Z" fill="${fill}"/>`;
    }
    return out;
  }

  function dome(cx, baseY, w, h, color) {
    return `<path d="M${cx - w / 2} ${baseY} C${cx - w / 2} ${baseY - h * 0.55} ${cx - w * 0.15} ${baseY - h * 0.75} ${cx} ${baseY - h} C${cx + w * 0.15} ${baseY - h * 0.75} ${cx + w / 2} ${baseY - h * 0.55} ${cx + w / 2} ${baseY}Z" fill="${color}" stroke="#b37a35" stroke-width="1"/>` +
      `<path d="M${cx} ${baseY - h} v-8" stroke="#a87a2c" stroke-width="2"/><circle cx="${cx}" cy="${baseY - h - 9}" r="2.6" fill="#d4a845"/>`;
  }

  function chhatri(cx, baseY, w) {
    const h = w * 0.9;
    let out = `<rect x="${cx - w / 2 - 3}" y="${baseY - 4}" width="${w + 6}" height="5" fill="#e9b96f" stroke="#b37a35" stroke-width=".8"/>`;
    out += `<rect x="${cx - w / 2}" y="${baseY - h * 0.55}" width="${w}" height="${h * 0.55 - 4}" fill="#f3c987"/>`;
    out += archWindows(cx - w / 4, cx + w / 4, baseY - h * 0.5, h * 0.42, w / 2, "#7a4a22");
    out += `<rect x="${cx - w / 2 - 4}" y="${baseY - h * 0.6}" width="${w + 8}" height="5" fill="#e9b96f" stroke="#b37a35" stroke-width=".8"/>`;
    out += dome(cx, baseY - h * 0.6, w * 0.92, h * 0.55, "#f6d39a");
    return out;
  }

  function crenels(x0, x1, y, fill) {
    let out = "";
    for (let x = x0; x < x1; x += 10) out += `<rect x="${x}" y="${y - 6}" width="6" height="6" fill="${fill}"/>`;
    return out;
  }

  function buildFort() {
    const g = document.getElementById("fort");
    if (!g) return;
    const r = rng(77);
    let o = "";

    // ground
    o += `<ellipse cx="300" cy="352" rx="330" ry="40" fill="#8db86a"/>`;
    o += `<ellipse cx="300" cy="346" rx="260" ry="20" fill="#a5c97e"/>`;

    // side wings
    o += `<rect x="70" y="200" width="100" height="130" fill="url(#wallShade)"/>`;
    o += `<rect x="430" y="200" width="100" height="130" fill="url(#wallShade)"/>`;
    o += crenels(70, 170, 200, "#d9a35b") + crenels(430, 530, 200, "#d9a35b");
    [215, 258, 296].forEach((y) => {
      o += archWindows(84, 160, y, 24, 19, "#7a4a22");
      o += archWindows(444, 520, y, 24, 19, "#7a4a22");
    });

    // main block
    o += `<rect x="150" y="150" width="300" height="180" fill="url(#wallGrad)"/>`;
    o += crenels(150, 450, 150, "#e6b16a");
    o += `<rect x="146" y="148" width="308" height="5" fill="#e9b96f"/>`;
    [166, 214, 262].forEach((y, row) => {
      o += archWindows(166, 434, y, 30, 22, "#7a4a22");
      o += `<rect x="150" y="${y + 34}" width="300" height="3" fill="#c98d45" opacity=".6"/>`;
      if (row === 1) {
        // jharokha balconies
        [196, 300, 404].forEach((x) => {
          o += `<rect x="${x - 18}" y="${y - 4}" width="36" height="34" fill="#f4cd8e" stroke="#b37a35" stroke-width=".8"/>`;
          o += archWindows(x - 9, x + 9, y + 2, 24, 9, "#6e3f1c");
          o += `<path d="M${x - 22} ${y - 4} Q${x} ${y - 22} ${x + 22} ${y - 4}Z" fill="#f6d39a" stroke="#b37a35" stroke-width=".8"/>`;
        });
      }
    });

    // central tower + gate
    o += `<rect x="250" y="96" width="100" height="56" fill="url(#wallGrad)"/>`;
    o += archWindows(262, 338, 108, 30, 19, "#7a4a22");
    o += crenels(250, 350, 96, "#e6b16a");
    o += dome(300, 92, 64, 48, "#f6d39a");
    o += `<path d="M276 330 V296 Q276 270 300 266 Q324 270 324 296 V330Z" fill="#5c3418"/>`;
    o += `<path d="M268 330 V294 Q268 260 300 255 Q332 260 332 294 V330" fill="none" stroke="#f3d08f" stroke-width="3"/>`;

    // corner chhatris
    o += chhatri(150, 150, 34) + chhatri(450, 150, 34) + chhatri(250, 96, 22) + chhatri(350, 96, 22);
    o += chhatri(70, 200, 26) + chhatri(530, 200, 26);

    // plinth
    o += `<rect x="60" y="328" width="480" height="8" fill="#f0d6a8" stroke="#c89a58" stroke-width=".8"/>`;

    // trees and shrubs in front
    function tree(x, y, s) {
      let t = `<rect x="${x - 2 * s}" y="${y - 10 * s}" width="${4 * s}" height="${14 * s}" fill="#6b4a2b"/>`;
      for (let i = 0; i < 7; i++) {
        t += `<circle cx="${x + (r() - 0.5) * 26 * s}" cy="${y - 18 * s - r() * 22 * s}" r="${(9 + r() * 7) * s}" fill="${i % 2 ? "#3f7a3c" : "#55924a"}"/>`;
      }
      return t;
    }
    o += tree(40, 340, 1.4) + tree(92, 344, 1.1) + tree(560, 340, 1.4) + tree(508, 344, 1.1);
    for (let x = 120; x < 490; x += 16) {
      o += `<circle cx="${x + (r() - 0.5) * 6}" cy="${342 + r() * 4}" r="${7 + r() * 4}" fill="${r() > 0.5 ? "#4d8a45" : "#64a053"}"/>`;
    }
    for (let i = 0; i < 26; i++) {
      o += `<circle cx="${120 + r() * 360}" cy="${338 + r() * 8}" r="1.8" fill="${r() > 0.5 ? "#e25579" : "#fff3d6"}"/>`;
    }
    g.innerHTML = o;
  }

  /* ---------------------------------------------------------------------
     Footer rose border
     --------------------------------------------------------------------- */
  function buildRoseBorder() {
    const g = document.getElementById("roseBorder");
    if (!g) return;
    const r = rng(1511);
    let o = "";
    for (let i = 0; i < 150; i++) o += leaf(-20 + r() * 640, 40 + r() * 130, 20 + r() * 14, r() * 360);
    for (let row = 0; row < 3; row++) {
      for (let x = -10 + row * 14; x < 620; x += 36 + r() * 18) {
        const y = 80 + row * 34 + (r() - 0.5) * 18;
        o += use(r() > 0.3 ? "rose" : "rosePink", x, y, 30 + r() * 18, r() * 360);
      }
    }
    for (let i = 0; i < 30; i++) o += use("whiteFlower", r() * 600, 70 + r() * 100, 9 + r() * 5, r() * 90);
    for (let i = 0; i < 16; i++) o += use("bud", r() * 600, 52 + r() * 30, 12 + r() * 4, (r() - 0.5) * 60);
    g.innerHTML = o;
  }

  /* ---------------------------------------------------------------------
     Torn parchment edges
     --------------------------------------------------------------------- */
  function tearEdges() {
    document.querySelectorAll(".torn").forEach((el, idx) => {
      const r = rng(900 + idx);
      const top = [];
      const bottom = [];
      for (let x = 0; x <= 100; x += 1.6 + r() * 1.6) {
        top.push(`${x.toFixed(2)}% ${(r() * 11).toFixed(1)}px`);
      }
      top.push(`100% ${(r() * 8).toFixed(1)}px`);
      for (let x = 100; x >= 0; x -= 1.6 + r() * 1.6) {
        bottom.push(`${x.toFixed(2)}% calc(100% - ${(r() * 12).toFixed(1)}px)`);
      }
      bottom.push(`0% calc(100% - ${(r() * 8).toFixed(1)}px)`);
      el.style.clipPath = `polygon(${top.concat(bottom).join(",")})`;
    });
  }

  /* ---------------------------------------------------------------------
     Our Beautiful Moments: photos change by themselves
     --------------------------------------------------------------------- */
  function initGallery() {
    const items = CONFIG.gallery || [];
    const track = document.getElementById("galleryTrack");
    const dotsEl = document.getElementById("galleryDots");
    if (!track || !items.length) return;

    track.innerHTML = items.map(() => `<div class="gallery-slide"><img alt=""></div>`).join("");
    track.querySelectorAll("img").forEach((img, i) => {
      img.src = items[i].img;
      img.alt = "Photo " + (i + 1) + " of Shyam & Saloni";
    });
    dotsEl.innerHTML = items.map((_, i) => `<button type="button" class="gallery-dot" aria-label="Show photo ${i + 1}"></button>`).join("");
    const dots = [...dotsEl.querySelectorAll(".gallery-dot")];

    let index = 0;
    let timer = null;
    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => {
        index = (index + 1) % items.length;
        render();
      }, CONFIG.galleryInterval || 1500);
    }
    dots.forEach((d, i) => d.addEventListener("click", () => {
      index = i;
      render();
      restart();
    }));
    render();
    restart();
  }

  /* ---------------------------------------------------------------------
     R.S.V.P. names and tap-to-call numbers
     --------------------------------------------------------------------- */
  function renderRsvp() {
    const rsvp = CONFIG.rsvp || {};
    const list = document.getElementById("rsvpNames");
    const mobiles = document.getElementById("rsvpMobiles"); // optional
    if (list) {
      (rsvp.names || []).forEach((n) => {
        const li = document.createElement("li");
        li.textContent = n;
        list.appendChild(li);
      });
    }
    if (mobiles && rsvp.mobiles && rsvp.mobiles.length) {
      mobiles.append("Mob : ");
      rsvp.mobiles.forEach((m, i) => {
        if (i) mobiles.append(", ");
        const a = document.createElement("a");
        a.href = "tel:+91" + m;
        a.textContent = m;
        mobiles.appendChild(a);
      });
    }
  }

  /* ---------------------------------------------------------------------
     Blink the "Click on seal" hint until the envelope is opened
     --------------------------------------------------------------------- */
  function blinkHint() {
    const hint = document.getElementById("coverHint");
    if (!hint) return;
    const start = performance.now();
    function frame(now) {
      if (!hint.isConnected || hint.dataset.stop) return;
      const wave = 0.5 + 0.5 * Math.cos(((now - start) / 1100) * Math.PI * 2);
      hint.style.opacity = (0.35 + 0.65 * wave).toFixed(3);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------------
     Countdown
     --------------------------------------------------------------------- */
  function initCountdown() {
    const target = Date.parse(CONFIG.eventDate);
    const els = ["cdDays", "cdHours", "cdMins", "cdSecs"].map((id) => document.getElementById(id));
    if (isNaN(target) || els.some((e) => !e)) return;
    const pad = (n) => String(n).padStart(2, "0");
    function tick() {
      let diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const d = Math.floor(diff / 86400); diff -= d * 86400;
      const h = Math.floor(diff / 3600); diff -= h * 3600;
      const m = Math.floor(diff / 60);
      const s = diff - m * 60;
      els[0].textContent = pad(d);
      els[1].textContent = pad(h);
      els[2].textContent = pad(m);
      els[3].textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------------
     Canvas helpers
     --------------------------------------------------------------------- */
  function fitCanvas(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function glowSprite(inner, mid) {
    const s = document.createElement("canvas");
    s.width = s.height = 64;
    const x = s.getContext("2d");
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.18, inner);
    gr.addColorStop(0.45, mid);
    gr.addColorStop(1, "rgba(255,140,40,0)");
    x.fillStyle = gr;
    x.fillRect(0, 0, 64, 64);
    return s;
  }

  /* ---------------------------------------------------------------------
     Golden sparkle ring when the seal is tapped
     --------------------------------------------------------------------- */
  function playSparkles(canvas, cx, cy, duration) {
    const { ctx, w, h } = fitCanvas(canvas);
    const sprites = [
      glowSprite("rgba(255,236,170,1)", "rgba(255,190,80,.45)"),
      glowSprite("rgba(255,214,120,1)", "rgba(255,150,50,.4)"),
      glowSprite("rgba(255,250,225,1)", "rgba(255,220,150,.35)")
    ];
    const maxR = Math.min(w, h) * 0.42 + 40;
    const parts = [];
    for (let i = 0; i < 560; i++) {
      const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; // ~gaussian
      parts.push({
        a: Math.random() * Math.PI * 2,
        off: g * 26,
        size: 0.6 + Math.random() * Math.random() * 3.2,
        tw: Math.random() * Math.PI * 2,
        tws: 4 + Math.random() * 8,
        drift: Math.random() * 30,
        spr: sprites[i % 3]
      });
    }
    const start = performance.now();
    function frame(now) {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      if (t > duration) return;
      const p = Math.min(1, t / (duration * 0.55));
      const ease = 1 - Math.pow(1 - p, 3);
      const R = 60 + (maxR - 60) * ease;
      const alpha = Math.min(1, t / 0.25) * (t > duration * 0.6 ? Math.max(0, 1 - (t - duration * 0.6) / (duration * 0.4)) : 1);

      // warm haze along the ring
      ctx.globalCompositeOperation = "lighter";
      const haze = ctx.createRadialGradient(cx, cy, Math.max(0, R - 50), cx, cy, R + 50);
      haze.addColorStop(0, "rgba(255,150,60,0)");
      haze.addColorStop(0.5, `rgba(255,170,80,${0.22 * alpha})`);
      haze.addColorStop(1, "rgba(255,150,60,0)");
      ctx.fillStyle = haze;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 50, 0, Math.PI * 2);
      ctx.fill();

      for (const q of parts) {
        const rad = R + q.off + q.drift * ease;
        const x = cx + Math.cos(q.a) * rad;
        const y = cy + Math.sin(q.a) * rad;
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(q.tw + t * q.tws));
        const s = q.size * 6 * tw;
        ctx.globalAlpha = alpha * tw;
        ctx.drawImage(q.spr, x - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------------
     Falling petals
     --------------------------------------------------------------------- */
  function startPetals() {
    const canvas = document.getElementById("petalCanvas");
    if (!canvas) return;
    let { ctx, w, h } = fitCanvas(canvas);
    window.addEventListener("resize", () => ({ ctx, w, h } = fitCanvas(canvas)));
    const colors = ["#e8879c", "#d9536f", "#f2b3c1", "#c9334f", "#eea0b2"];
    const petals = [];
    const count = w < 600 ? 14 : 20;
    function spawn(p, initial) {
      p.x = Math.random() * w;
      p.y = initial ? Math.random() * h : -20;
      p.size = 4 + Math.random() * 6;
      p.vy = 18 + Math.random() * 26;
      p.amp = 10 + Math.random() * 24;
      p.freq = 0.4 + Math.random() * 0.8;
      p.phase = Math.random() * Math.PI * 2;
      p.rot = Math.random() * Math.PI * 2;
      p.vr = (Math.random() - 0.5) * 1.6;
      p.color = colors[(Math.random() * colors.length) | 0];
      p.alpha = 0.45 + Math.random() * 0.4;
      return p;
    }
    for (let i = 0; i < count; i++) petals.push(spawn({}, true));
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.y += p.vy * dt;
        p.phase += p.freq * dt;
        p.rot += p.vr * dt;
        const x = p.x + Math.sin(p.phase) * p.amp;
        if (p.y > h + 20) spawn(p, false);
        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.phase * 1.7)));
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------------
     Music
     --------------------------------------------------------------------- */
  const audio = document.getElementById("bgAudio");
  const audioBtn = document.getElementById("audioToggle");

  function setMuted(muted) {
    audioBtn.classList.toggle("is-muted", muted);
    audioBtn.setAttribute("aria-label", muted ? "Play music" : "Mute music");
  }

  function playMusic() {
    if (!audio || !audio.src) return;
    audio.play().then(() => setMuted(false)).catch(() => setMuted(true));
  }

  function initAudio() {
    if (!audio || !audioBtn) return;
    if (CONFIG.audio && CONFIG.audio.src) audio.src = CONFIG.audio.src;
    setMuted(true);
    audioBtn.addEventListener("click", () => {
      if (audio.paused) playMusic();
      else { audio.pause(); setMuted(true); }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */
  let revealObserver = null;
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
  }
  function startReveal() {
    const vh = window.innerHeight;
    document.querySelectorAll(".reveal").forEach((e) => {
      // whatever is already on screen shows right away, the rest on scroll
      if (!revealObserver || e.getBoundingClientRect().top < vh) e.classList.add("in");
      else revealObserver.observe(e);
    });
  }

  /* ---------------------------------------------------------------------
     Envelope opening
     --------------------------------------------------------------------- */
  function initCover() {
    const cover = document.getElementById("cover");
    const seal = document.getElementById("sealBtn");
    const main = document.getElementById("main");
    const canvas = document.getElementById("sparkleCanvas");
    if (!cover || !seal) return;
    let opened = false;

    function open() {
      if (opened) return;
      opened = true;
      playMusic(); // this tap is a real user gesture, so the browser allows audio

      seal.classList.add("is-pressed");
      setTimeout(() => seal.classList.remove("is-pressed"), 180);

      const rect = seal.getBoundingClientRect();
      playSparkles(canvas, rect.left + rect.width / 2, rect.top + rect.height / 2, 2.6);

      const hint = document.getElementById("coverHint");
      if (hint) {
        hint.dataset.stop = "1";
        hint.style.opacity = "0";
      }

      setTimeout(() => cover.classList.add("is-opening"), 1200);
      setTimeout(() => {
        document.body.classList.remove("is-locked");
        main.removeAttribute("aria-hidden");
        window.scrollTo(0, 0);
        startReveal();
      }, 1500);
      setTimeout(() => {
        cover.remove();
        audioBtn.hidden = false;
        startPetals();
      }, 2800);
    }

    cover.addEventListener("click", open);
  }

  /* ---------------------------------------------------------------------
     Go
     --------------------------------------------------------------------- */
  bindText();
  buildEmbossRose();
  buildWaxSeal();
  buildGarland();
  buildPots();
  buildFort();
  buildRoseBorder();
  tearEdges();
  initGallery();
  renderRsvp();
  initCountdown();
  initAudio();
  initReveal();
  initCover();
  blinkHint();
})();
