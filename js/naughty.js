/* Naughty Desire — প্রাপ্তবয়স্কদের (১৮+) জন্য গোপন, non-explicit রোমান্টিক টেমপ্লেট।
   সব চরিত্র নিজের আঁকা ভেক্টর, স্পষ্টত প্রাপ্তবয়স্ক, কোনো নগ্নতা নেই। */

const DESIRE = {
  pals: [
    { name: "Crimson", bg: ["#2b0614", "#a3123f"], accent: "#ff6b8f", paper: "#fff1f4", ink: "#4a0f24" },
    { name: "Violet", bg: ["#14062b", "#6a1fa3"], accent: "#d28bff", paper: "#f7f0ff", ink: "#2a1050" },
    { name: "Noir Gold", bg: ["#0d0a06", "#5c4210"], accent: "#ffcf6b", paper: "#fffaf0", ink: "#3b2a07" }
  ],
  // age শুধু দেখানোর জন্য: সবাই ২৫ বা তার বেশি
  chars: [
    { name: "Mira", age: 27, g: "f", skin: "#f3c4a2", hair: "#2a1620", hs: "long", eye: "#7a3b2e" },
    { name: "Sana", age: 25, g: "f", skin: "#d99a72", hair: "#5a2f8f", hs: "bob", eye: "#3b2a6a" },
    { name: "Zoya", age: 29, g: "f", skin: "#8a5a3c", hair: "#1a1014", hs: "bun", eye: "#2a1a10" },
    { name: "Arman", age: 28, g: "m", skin: "#e6b48f", hair: "#1c1c2c", hs: "short", eye: "#2a2a40" },
    { name: "Rayan", age: 30, g: "m", skin: "#b9805a", hair: "#3a2216", hs: "wavy", eye: "#3a2216" },
    { name: "Kabir", age: 26, g: "m", skin: "#f0c8a8", hair: "#7a2a2a", hs: "short", eye: "#2e5a4a" }
  ],
  outfits: {
    f: ["Silk Robe", "Evening Gown", "Beach Halter", "Leather Jacket", "Satin Camisole", "Red Cocktail", "Bikini", "Lace Set"],
    m: ["Open Shirt", "Tuxedo", "Beach Swim", "Leather Jacket", "Silk Robe", "Black Turtleneck", "Swim Trunks", "Boxer Briefs"]
  }
};

function dFemaleOutfit(o, skin, ac) {
  const torso = `<path d="M40 262c2-72 20-112 60-122 40 10 58 50 60 122z" fill="${skin}"/>`;
  switch (o) {
    case 0: return torso + `<path d="M36 262c0-60 16-104 52-122l12 40 12-40c36 18 52 62 52 122z" fill="#7a1230"/><path d="M88 140l12 40 12-40" fill="none" stroke="#ffb3c7" stroke-width="2"/><path d="M60 214c26 8 54 8 80 0" stroke="#4a0a1c" stroke-width="7" fill="none"/>`;
    case 1: return torso + `<path d="M34 262c0-50 12-84 32-98 12 8 22 12 34 12s22-4 34-12c20 14 32 48 32 98z" fill="#15131c"/><path d="M62 160c10 12 26 18 38 18s28-6 38-18" fill="none" stroke="${ac}" stroke-width="2.5"/>`;
    case 2: return torso + `<path d="M84 146l16 38 16-38c-8 22-24 22-32 0z" fill="${ac}"/><path d="M84 146c-6-10-12-12-16-10M116 146c6-10 12-12 16-10" stroke="${ac}" stroke-width="2" fill="none"/><circle cx="100" cy="212" r="4" fill="${ac}"/>`;
    case 3: return torso + `<path d="M36 262c-2-60 12-100 44-118l6 28-14 90zM164 262c2-60-12-100-44-118l-6 28 14 90z" fill="#241b20"/><path d="M80 144c10 10 30 10 40 0l-4 40h-32z" fill="#f4f0f2"/>`;
    case 4: return torso + `<path d="M62 150c14 14 62 14 76 0l10 112H52z" fill="#b01c4e"/><path d="M70 152c10-6 50-6 60 0" fill="none" stroke="#ffd0de" stroke-width="3"/><path d="M72 150l-4-14M128 150l4-14" stroke="#b01c4e" stroke-width="3"/>`;
    default: return torso + `<path d="M48 262c0-60 12-100 40-118 8 12 20 20 12 20s4-8 12-20c28 18 40 58 40 118z" fill="#c1121f"/><path d="M80 148c8 14 32 14 40 0" fill="none" stroke="#7a0a14" stroke-width="2"/>`;
  }
}
function dMaleOutfit(o, skin, ac) {
  const torso = `<path d="M28 262c2-70 22-108 72-116 50 8 70 46 72 116z" fill="${skin}"/>`;
  switch (o) {
    case 0: return torso + `<path d="M26 262c2-66 16-100 50-114l16 50 8-8 8 8 16-50c34 14 48 48 50 114z" fill="#f3f0f2"/><path d="M92 198l8-8 8 8-8 64z" fill="${skin}"/>`;
    case 1: return torso + `<path d="M26 262c2-66 20-102 60-114l14 44 14-44c40 12 58 48 60 114z" fill="#14121a"/><path d="M86 148l14 44 14-44-14 8z" fill="#f3f0f2"/><path d="M92 160l8 6 8-6-4 10h-8z" fill="${ac}"/>`;
    case 2: return torso + `<path d="M70 150c10 8 50 8 60 0" fill="none" stroke="#00000033" stroke-width="3"/><path d="M100 170v50" stroke="#00000022" stroke-width="2"/>`;
    case 3: return torso + `<path d="M26 262c-2-66 14-104 48-118l8 30-16 88zM174 262c2-66-14-104-48-118l-8 30 16 88z" fill="#241b20"/><path d="M82 150c10 8 26 8 36 0l-2 40h-32z" fill="#e8e2e6"/>`;
    case 4: return torso + `<path d="M24 262c2-62 16-100 52-114l24 70 24-70c36 14 50 52 52 114z" fill="#3b1d6a"/><path d="M76 148l24 70 24-70" fill="none" stroke="#d8b8ff" stroke-width="2"/><path d="M56 236c28 8 60 8 88 0" stroke="#24104a" stroke-width="7" fill="none"/>`;
    default: return torso + `<path d="M26 262c2-66 18-104 56-116 8 8 36 8 36 0 38 12 54 50 56 116z" fill="#17151d"/><path d="M82 146c6 14 30 14 36 0" fill="none" stroke="#2a2733" stroke-width="10"/>`;
  }
}

/* লম্বা (কোমর থেকে উরু পর্যন্ত) সরল ভেক্টর, নগ্নতা বা অঙ্গের বিস্তারিত নেই */
function dFullBody(g, o, skin, ac) {
  if (g === "f") {
    const body = `<path d="M48 150C40 200 56 230 58 262 46 290 42 318 46 340H154C158 318 154 290 142 262 144 230 160 200 152 150 140 138 120 134 100 134 80 134 60 138 48 150Z" fill="${skin}"/>`;
    const lace = o === 7;
    const c1 = lace ? "#3a0a22" : ac, trim = lace ? `stroke="${ac}" stroke-width="2"` : "";
    const top = `<path d="M70 170q14-10 30 2 16-12 30-2l-4 26q-12 8-26 2-14 6-26-2z" fill="${c1}" ${trim}/><path d="M78 168l-8-20M122 168l8-20" stroke="${c1}" stroke-width="3"/>`;
    const bottom = `<path d="M58 280h84l-34 40h-16z" fill="${c1}" ${trim}/><path d="M58 280l-10-6M142 280l10-6" stroke="${c1}" stroke-width="3"/>`;
    const scallop = lace ? `<path d="M72 196q4 5 8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0" fill="none" stroke="${ac}" stroke-width="1.6"/><path d="M62 280q4 5 8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0" fill="none" stroke="${ac}" stroke-width="1.6"/>` : "";
    return body + top + bottom + scallop;
  }
  const body = `<path d="M30 150C22 220 44 250 56 262 50 290 50 318 52 340H148C150 318 150 290 144 262 156 250 178 220 170 150 150 134 126 130 100 130 74 130 50 134 30 150Z" fill="${skin}"/><path d="M100 160v100M72 186q28 10 56 0" stroke="#00000018" stroke-width="2" fill="none"/>`;
  if (o === 6) return body + `<path d="M54 266h92l8 74H46z" fill="${ac}"/><path d="M54 266h92" stroke="#ffffff66" stroke-width="5"/><path d="M60 300h80" stroke="#ffffff44" stroke-width="3"/>`;
  return body + `<path d="M54 266h92l4 74H50z" fill="#1b1624"/><rect x="54" y="264" width="92" height="9" fill="${ac}"/>`;
}

function dHair(c, back) {
  const h = c.hair, f = c.g === "f";
  if (back) {
    if (!f) return c.hs === "wavy" ? `<path d="M66 70c-6 30 0 44 8 52h52c8-8 14-22 8-52-6-26-66-26-68 0z" fill="${h}"/>` : "";
    if (c.hs === "long") return `<path d="M60 74c-14 50-6 100 10 128 30 10 30 10 60 0 16-28 24-78 10-128-8-34-72-34-80 0z" fill="${h}"/>`;
    if (c.hs === "bob") return `<path d="M62 72c-8 30-6 56 6 70h64c12-14 14-40 6-70-8-30-68-30-76 0z" fill="${h}"/>`;
    return `<circle cx="100" cy="30" r="17" fill="${h}"/>`;
  }
  if (f) return `<path d="M68 82c-4-40 14-54 34-54s40 12 32 54c-4-18-12-30-28-34-6 14-18 22-38 34z" fill="${h}"/><path d="M68 82c-2 8-2 16 2 24-8-10-6-20-2-24z" fill="${h}"/>`;
  return `<path d="M66 78c-6-44 18-56 38-54 22 0 40 14 32 54-4-14-10-22-22-26-14 8-30 10-48 26z" fill="${h}"/>`;
}

// c: চরিত্রের index (০-৫), o: পোশাকের index (০-৫), p: palette index
function charSVG(ci, oi, pi) {
  const c = DESIRE.chars[ci] || DESIRE.chars[0];
  const pal = DESIRE.pals[pi] || DESIRE.pals[0];
  const f = c.g === "f";
  const full = oi >= 6;
  const out = full ? dFullBody(c.g, oi, c.skin, pal.accent) : (f ? dFemaleOutfit(oi, c.skin, pal.accent) : dMaleOutfit(oi, c.skin, pal.accent));
  const face = f
    ? `<path d="M70 80c0-34 14-48 30-48s30 14 30 48c0 24-10 42-30 46-20-4-30-22-30-46z" fill="${c.skin}"/>`
    : `<path d="M68 74c0-30 14-42 32-42s32 12 32 42l-2 22c-8 20-18 30-30 30s-22-10-30-30z" fill="${c.skin}"/>`;
  const eyes = f
    ? `<path d="M78 86q8-8 17 0q-8 6-17 0z M105 86q8-8 17 0q-8 6-17 0z" fill="#fff"/><circle cx="87" cy="85" r="3.6" fill="${c.eye}"/><circle cx="113" cy="85" r="3.6" fill="${c.eye}"/><path d="M77 85q9-10 19 0M104 85q9-10 19 0" stroke="#1a0e14" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M78 76q9-6 17-2M105 74q8-4 17 2" stroke="${c.hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : `<path d="M78 88q8-6 16 0q-8 4-16 0z M106 88q8-6 16 0q-8 4-16 0z" fill="#fff"/><circle cx="86" cy="87" r="3" fill="${c.eye}"/><circle cx="114" cy="87" r="3" fill="${c.eye}"/><path d="M76 78q10-6 20 0M104 78q10-6 20 0" stroke="${c.hair}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const mouth = f
    ? `<path d="M90 107q10 6 20 0q-10-3-20 0z" fill="#c2304f"/><path d="M92 107q8 8 16 0" fill="#e24a6b"/><path d="M98 96q2 3 4 0" stroke="#00000022" stroke-width="1.6" fill="none"/><ellipse cx="80" cy="100" rx="7" ry="4" fill="#ff7b9c" opacity=".35"/><ellipse cx="120" cy="100" rx="7" ry="4" fill="#ff7b9c" opacity=".35"/>`
    : `<path d="M91 108q9 5 18 0" stroke="#8a3a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M98 96q2 3 4 0" stroke="#00000022" stroke-width="1.6" fill="none"/>`;
  const neck = `<rect x="88" y="118" width="24" height="30" rx="8" fill="${c.skin}"/>`;
  return `<svg viewBox="0 0 200 ${full ? 340 : 262}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.name}, ${c.age}">` +
    `${dHair(c, true)}${neck}${out}${face}${eyes}${mouth}${dHair(c, false)}</svg>`;
}

/* ---------- ১৮+ নিশ্চিতকরণ ও সম্মতি ---------- */
function adultGate() {
  return new Promise((resolve) => {
    const g = document.createElement("div");
    g.className = "nd-gate";
    g.innerHTML = '<div class="nd-box"><div class="nd-lock">🔞</div><h2>১৮+ কনটেন্ট</h2>' +
      '<p>এই পাতায় প্রাপ্তবয়স্কদের জন্য রোমান্টিক ও ইঙ্গিতবহ (তবে সরাসরি অশ্লীল নয়) চিত্র আছে। সব চরিত্র প্রাপ্তবয়স্ক।</p>' +
      '<label class="check"><input type="checkbox" id="ndAge"> <span>আমি নিশ্চিত করছি যে আমার বয়স ১৮ বছর বা তার বেশি।</span></label>' +
      '<label class="check"><input type="checkbox" id="ndConsent"> <span>আমি স্বেচ্ছায় এই কনটেন্ট দেখতে সম্মত, এবং এটি শুধু প্রাপ্তবয়স্ক ও সম্মতিদাতা কাউকেই পাঠাব।</span></label>' +
      '<div class="actions"><a class="btn ghost" href="index.html">না, ফিরে যাই</a><button class="btn" id="ndGo" type="button" disabled>প্রবেশ করুন</button></div></div>';
    document.body.appendChild(g);
    const a = g.querySelector("#ndAge"), b = g.querySelector("#ndConsent"), go = g.querySelector("#ndGo");
    const upd = () => { go.disabled = !(a.checked && b.checked); };
    a.onchange = b.onchange = upd;
    go.onclick = () => { g.remove(); resolve(true); };
  });
}

/* ---------- সাউন্ড (Web Audio, কোনো ফাইল লাগে না) ---------- */
const Sfx = {
  ctx: null, on: true, beatTimer: null,
  init() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) this.ctx = new AC();
  },
  tone(freq, dur, type, vol, delay, slideTo) {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  },
  chime() { [660, 880, 1320].forEach((f, i) => this.tone(f, 1.2, "sine", 0.07, i * 0.12)); },
  whoosh() { this.tone(300, 0.7, "triangle", 0.05, 0, 900); },
  tick() { this.tone(1400 + Math.random() * 300, 0.06, "sine", 0.025); },
  beat() { this.tone(70, 0.18, "sine", 0.22); this.tone(60, 0.2, "sine", 0.16, 0.22); },
  startBeat() {
    this.stopBeat();
    this.beat();
    this.beatTimer = setInterval(() => this.beat(), 1100);
  },
  stopBeat() { clearInterval(this.beatTimer); this.beatTimer = null; },
  toggle() {
    this.on = !this.on;
    if (!this.on) this.stopBeat();
    return this.on;
  }
};
