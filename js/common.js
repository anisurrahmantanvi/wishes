/* Wishes — কমন কোড: টেমপ্লেট, এনকোডিং, সেভ/লোড, QR, ব্যাকগ্রাউন্ড অ্যানিমেশন */

const TEMPLATES = {
  rose: {
    name: "Rose Love", emoji: "🌹",
    bg: ["#3a0a1f", "#b0124f"], accent: "#ff8fb1",
    paper: "#fff5f7", ink: "#4a1230", particles: ["❤", "💖", "💗"]
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

const CFG = window.WISHES_CONFIG || { firebase: {}, maxChars: 1200 };

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

/* ---------- সেভ / লোড ---------- */
function firebaseReady() {
  const f = CFG.firebase || {};
  return !!(f.projectId && f.apiKey);
}
function fsUrl(id) {
  const f = CFG.firebase;
  const base = `https://firestore.googleapis.com/v1/projects/${f.projectId}/databases/(default)/documents/letters`;
  return id ? `${base}/${id}?key=${f.apiKey}` : base;
}
function randomId(n = 8) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const a = new Uint32Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, (x) => chars[x % chars.length]).join("");
}
function viewBase() {
  return new URL("view.html", location.href).href.split("#")[0].split("?")[0];
}

// letter সেভ করে শেয়ার করার লিংক ফেরত দেয়
async function saveLetter(data) {
  if (firebaseReady()) {
    const id = randomId();
    const res = await fetch(fsUrl() + `?documentId=${id}&key=${CFG.firebase.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { data: { stringValue: JSON.stringify(data) } } })
    });
    if (!res.ok) throw new Error("Firestore সেভ ব্যর্থ (" + res.status + ")");
    return viewBase() + "#id=" + id;
  }
  return viewBase() + "#d=" + (await pack(data));
}

// view.html-এর hash থেকে letter লোড করে
async function loadLetter() {
  const h = location.hash.replace(/^#/, "");
  const params = new URLSearchParams(h);
  if (params.get("id")) {
    if (!firebaseReady()) throw new Error("Firebase কনফিগ করা নেই");
    const res = await fetch(fsUrl(params.get("id")));
    if (!res.ok) throw new Error("Letter পাওয়া যায়নি");
    const doc = await res.json();
    return JSON.parse(doc.fields.data.stringValue);
  }
  if (params.get("d")) return unpack(params.get("d"));
  throw new Error("লিংকে কোনো letter নেই");
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

/* ---------- ব্যাকগ্রাউন্ড অ্যানিমেশন (canvas) ---------- */
function startBackground(canvas, key) {
  const t = TEMPLATES[key] || TEMPLATES.rose;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd = (navigator.hardwareConcurrency || 4) <= 4;
  const COUNT = reduce ? 0 : lowEnd ? 18 : 34;
  let w = 0, h = 0, raf = 0, items = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 30,
      s: 12 + Math.random() * 22,
      v: 0.3 + Math.random() * 0.9,
      sway: Math.random() * Math.PI * 2,
      amp: 10 + Math.random() * 25,
      a: 0.25 + Math.random() * 0.55,
      ch: t.particles[Math.floor(Math.random() * t.particles.length)]
    };
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of items) {
      p.y -= p.v;
      p.sway += 0.012;
      const x = p.x + Math.sin(p.sway) * p.amp;
      ctx.globalAlpha = p.a;
      ctx.font = p.s + "px serif";
      ctx.fillText(p.ch, x, p.y);
      if (p.y < -40) Object.assign(p, spawn(false));
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  resize();
  items = Array.from({ length: COUNT }, () => spawn(true));
  window.addEventListener("resize", resize);
  if (COUNT) frame();
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
