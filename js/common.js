/* Wishes — কমন কোড: টেমপ্লেট, এনকোডিং, সেভ/লোড, QR, ব্যাকগ্রাউন্ড অ্যানিমেশন */

const TEMPLATES = {
  rose: {
    name: "Rose Love", emoji: "🌹",
    bg: ["#3a0a1f", "#b0124f"], accent: "#ff8fb1",
    paper: "#fff5f7", ink: "#4a1230", particles: ["❤", "💖", "💗"]
  },
  galaxy: {
    name: "Galaxy Love", emoji: "🌌",
    bg: ["#0b0630", "#5b2a9e"], accent: "#c9a8ff",
    paper: "#f6f2ff", ink: "#24134f", particles: ["✦", "💜", "✧"]
  },
  gold: {
    name: "Golden Promise", emoji: "💍",
    bg: ["#1c1405", "#8a6417"], accent: "#ffd978",
    paper: "#fffaf0", ink: "#3b2a07", particles: ["✨", "✦", "💛"]
  },
  night: {
    name: "Starry Night", emoji: "🌙",
    bg: ["#050b24", "#1c2a6b"], accent: "#ffd98a",
    paper: "#f4f6ff", ink: "#1a2250", particles: ["✦", "✧", "⭐"]
  },
  sunset: {
    name: "Golden Sunset", emoji: "🌅",
    bg: ["#401a3a", "#f2784b"], accent: "#ffe0a3",
    paper: "#fff8ee", ink: "#4a2418", particles: ["✨", "✦", "•"]
  },
  blossom: {
    name: "Cherry Blossom", emoji: "🌸",
    bg: ["#2a1038", "#d96fa8"], accent: "#ffd1e6",
    paper: "#fff6fb", ink: "#44163f", particles: ["🌸", "🌺", "✿"]
  }
};

const CFG = window.WISHES_CONFIG || { supabase: {}, maxChars: 1200, maxPhotos: 6 };

/* ---------- base64url ---------- */
function toB64Url(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ---------- pack / unpack (লিংকে letter রাখার জন্য) ---------- */
async function pipeBytes(stream, bytes) {
  const w = stream.writable.getWriter();
  w.write(bytes);
  w.close();
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}
async function pack(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  if ("CompressionStream" in window) {
    try {
      const z = await pipeBytes(new CompressionStream("deflate-raw"), bytes);
      return "z" + toB64Url(z);
    } catch (e) { /* plain-এ ফিরে যাই */ }
  }
  return "p" + toB64Url(bytes);
}
async function unpack(s) {
  const kind = s[0];
  const bytes = fromB64Url(s.slice(1));
  if (kind === "z") {
    const raw = await pipeBytes(new DecompressionStream("deflate-raw"), bytes);
    return JSON.parse(new TextDecoder().decode(raw));
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

/* ---------- Supabase সেভ / লোড ---------- */
const SB = CFG.supabase || {};
function supabaseReady() { return !!(SB.url && SB.key); }
function sbHeaders(extra) { return Object.assign({ apikey: SB.key }, extra || {}); }

async function sbRpc(fn, args) {
  const res = await fetch(SB.url + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: sbHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(args)
  });
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch (e) { /* ignore */ }
    if (/rate limited/i.test(body)) throw new Error("অনেক বেশি অনুরোধ হয়ে গেছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।");
    throw new Error("সার্ভারে সমস্যা (" + res.status + ")");
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function viewBase() {
  return new URL("view.html", location.href).href.split("#")[0].split("?")[0];
}

const PHOTO_RE = /^[0-9a-f-]{36}\/[0-9]\.jpg$/;
// letter-এর ডাটা অবিশ্বস্ত, তাই শুধু নির্দিষ্ট ছাঁচের পাথ থেকে নিজের bucket-এর URL বানাই
function photoUrl(path) {
  if (!supabaseReady() || typeof path !== "string" || !PHOTO_RE.test(path)) return "";
  return SB.url + "/storage/v1/object/public/letter-photos/" + path;
}

// ছবি ব্রাউজারেই ছোট করে JPEG বানায় (স্টোরেজ ও ডেটা বাঁচাতে)
async function compressImage(file) {
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch (e) { bmp = await createImageBitmap(file); }
  const scale = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  if (bmp.close) bmp.close();
  const toBlob = (q) => new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("ছবি প্রক্রিয়া করা যায়নি"))), "image/jpeg", q));
  let blob = await toBlob(0.78);
  if (blob.size > 1000000) blob = await toBlob(0.55);
  if (blob.size > 1048576) throw new Error("ছবিটা অনেক বড়");
  return blob;
}

async function uploadPhoto(blob, path) {
  const res = await fetch(SB.url + "/storage/v1/object/letter-photos/" + path, {
    method: "POST",
    headers: sbHeaders({ "Content-Type": "image/jpeg", "x-upsert": "false" }),
    body: blob
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("অনেক বেশি ছবি আপলোড হয়ে গেছে, এক ঘণ্টা পরে আবার চেষ্টা করুন।");
    throw new Error("ছবি আপলোড ব্যর্থ (" + res.status + ")");
  }
}

// letter সেভ করে শেয়ার করার লিংক ফেরত দেয়
async function saveLetter(data, blobs, onProgress) {
  blobs = blobs || [];
  if (supabaseReady()) {
    const photos = [];
    if (blobs.length) {
      const folder = crypto.randomUUID();
      for (let i = 0; i < blobs.length; i++) {
        const path = folder + "/" + (i + 1) + ".jpg";
        if (onProgress) onProgress(i + 1, blobs.length);
        await uploadPhoto(blobs[i], path);
        photos.push(path);
      }
    }
    const payload = Object.assign({}, data);
    if (photos.length) payload.photos = photos;
    const id = await sbRpc("create_letter", { p_data: payload });
    return viewBase() + "#id=" + id;
  }
  if (blobs.length) throw new Error("ছবি যোগ করতে ডাটাবেস চালু থাকতে হবে");
  return viewBase() + "#d=" + (await pack(data));
}

// view.html-এর hash থেকে letter লোড করে
async function loadLetter() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const id = params.get("id");
  if (id) {
    if (!supabaseReady()) throw new Error("ডাটাবেস কনফিগ করা নেই");
    if (!/^[0-9a-f]{10}$/.test(id)) throw new Error("লিংকটা সঠিক নয়");
    const d = await sbRpc("get_letter", { p_id: id });
    if (!d) throw new Error("Letter পাওয়া যায়নি");
    return d;
  }
  if (params.get("d")) return unpack(params.get("d"));
  throw new Error("লিংকে কোনো letter নেই");
}

function reportLetter(id, reason) {
  return sbRpc("report_letter", { p_id: id, p_reason: reason || null });
}

function sendContact(name, message, contact) {
  return sbRpc("send_contact", { p_name: name || null, p_email: contact || null, p_message: message });
}

/* ---------- QR (qrcode-generator লাইব্রেরি CDN থেকে লোড হয়) ---------- */
function qrDataUrl(text, cell = 6, margin = 2) {
  if (typeof qrcode !== "function") throw new Error("QR লাইব্রেরি লোড হয়নি");
  const q = qrcode(0, "M");
  q.addData(text);
  q.make();
  return q.createDataURL(cell, margin);
}

/* ---------- থিম প্রয়োগ ---------- */
function applyTheme(key) {
  const t = TEMPLATES[key] || TEMPLATES.rose;
  const r = document.documentElement.style;
  r.setProperty("--bg1", t.bg[0]);
  r.setProperty("--bg2", t.bg[1]);
  r.setProperty("--accent", t.accent);
  r.setProperty("--paper", t.paper);
  r.setProperty("--ink", t.ink);
  return t;
}

/* ---------- ব্যাকগ্রাউন্ড অ্যানিমেশন: Galaxy + Love (canvas) ---------- */
function hexA(hex, a) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function startBackground(canvas, key) {
  const t = TEMPLATES[key] || TEMPLATES.rose;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd = (navigator.hardwareConcurrency || 4) <= 4;
  let w = 0, h = 0, raf = 0, stars = [], hearts = [], shoot = null, nebula = null;
  let nextShoot = 2500;

  // glow-সহ হার্টের sprite একবারই আঁকা হয়, তাই ফ্রেমে খরচ কম
  function makeHeart(color) {
    const s = 64, c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d");
    const glow = g.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
    glow.addColorStop(0, hexA(color, 0.55));
    glow.addColorStop(1, hexA(color, 0));
    g.fillStyle = glow; g.fillRect(0, 0, s, s);
    const x = s / 2, y = s / 2 + 4, r = 11;
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(x, y + r * 1.1);
    g.bezierCurveTo(x - r * 2, y - r * 0.2, x - r * 1.2, y - r * 1.6, x, y - r * 0.6);
    g.bezierCurveTo(x + r * 1.2, y - r * 1.6, x + r * 2, y - r * 0.2, x, y + r * 1.1);
    g.fill();
    return c;
  }
  const heartSprite = makeHeart(t.accent);

  // nebula (মহাকাশের রঙিন মেঘ) একবার আঁকা হয়
  function buildNebula() {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const base = g.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#02030c");
    base.addColorStop(1, hexA(t.bg[0], 1));
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const m = Math.max(w, h);
    [[0.2, 0.25, 0.7, t.bg[1], 0.55], [0.85, 0.7, 0.6, t.accent, 0.22], [0.5, 0.95, 0.55, t.bg[1], 0.35]]
      .forEach(([cx, cy, rr, col, al]) => {
        const rg = g.createRadialGradient(cx * w, cy * h, 0, cx * w, cy * h, rr * m);
        rg.addColorStop(0, hexA(col, al));
        rg.addColorStop(1, hexA(col, 0));
        g.fillStyle = rg; g.fillRect(0, 0, w, h);
      });
    return c;
  }

  function initScene() {
    const sc = lowEnd ? 70 : 140, hc = lowEnd ? 8 : 14;
    stars = Array.from({ length: sc }, () => {
      const r = 0.4 + Math.random() * 1.3;
      return {
        x: Math.random() * w, y: Math.random() * h, r,
        tw: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.8,
        v: 0.01 + r * 0.025, warm: Math.random() < 0.15
      };
    });
    hearts = Array.from({ length: hc }, () => newHeart(true));
  }
  function newHeart(initial) {
    return {
      x: Math.random() * w, y: initial ? Math.random() * h : h + 40,
      s: 14 + Math.random() * 20, v: 0.15 + Math.random() * 0.4,
      sw: Math.random() * 6.28, amp: 8 + Math.random() * 18,
      a: 0.35 + Math.random() * 0.5
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nebula = buildNebula();
    initScene();
    if (reduce) draw(0);
  }

  function draw(ts) {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(nebula, 0, 0, w, h);
    const time = ts / 1000;

    for (const s of stars) {
      s.y += s.v; s.x -= s.v * 0.4;
      if (s.y > h) { s.y = -2; s.x = Math.random() * w; }
      if (s.x < 0) s.x = w;
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.sp + s.tw));
      ctx.globalAlpha = a;
      ctx.fillStyle = s.warm ? t.accent : "#ffffff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
    }

    for (const p of hearts) {
      p.y -= p.v; p.sw += 0.01;
      const x = p.x + Math.sin(p.sw) * p.amp;
      ctx.globalAlpha = p.a;
      ctx.drawImage(heartSprite, x - p.s, p.y - p.s, p.s * 2, p.s * 2);
      if (p.y < -50) Object.assign(p, newHeart(false));
    }

    // মাঝেমধ্যে shooting star
    if (!reduce) {
      if (!shoot && ts > nextShoot) {
        shoot = { x: w * (0.4 + Math.random() * 0.6), y: Math.random() * h * 0.35, vx: -(7 + Math.random() * 4), vy: 3 + Math.random() * 2, life: 1 };
      }
      if (shoot) {
        const x2 = shoot.x - shoot.vx * 7, y2 = shoot.y - shoot.vy * 7;
        const g = ctx.createLinearGradient(shoot.x, shoot.y, x2, y2);
        g.addColorStop(0, "rgba(255,255,255," + shoot.life + ")");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(x2, y2); ctx.stroke();
        shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= 0.012;
        if (shoot.life <= 0) { shoot = null; nextShoot = ts + 3000 + Math.random() * 4000; }
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(ts) { draw(ts); raf = requestAnimationFrame(loop); }

  resize();
  window.addEventListener("resize", resize);
  if (!reduce) raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
