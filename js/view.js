(async function () {
  const $ = (id) => document.getElementById(id);
  const letterId = new URLSearchParams(location.hash.replace(/^#/, "")).get("id");
  const str = (v, d) => (typeof v === "string" && v.trim() ? v.trim() : d);
  let data;

  try {
    data = await loadLetter();
  } catch (e) {
    $("wTitle").textContent = "এই letter খোলা যাচ্ছে না";
    $("wSub").textContent = e.message;
    $("beginBtn").style.display = "none";
    return;
  }

  const key = TEMPLATES[data.t] ? data.t : "rose";
  applyTheme(key);
  startBackground($("bg"), key);

  // ছবি: শুধু নিজের bucket-এর যাচাই-করা URL, ক্যাপশন আলাদা করে মিলিয়ে নিই
  const caps = Array.isArray(data.caps) ? data.caps : [];
  const photos = (Array.isArray(data.photos) ? data.photos : []).slice(0, 6)
    .map((p, i) => ({ url: photoUrl(p), cap: typeof caps[i] === "string" ? caps[i].trim() : "" }))
    .filter((p) => p.url);
  photos.forEach((p) => { const im = new Image(); im.src = p.url; }); // আগে থেকে লোড

  // Welcome
  $("wTitle").textContent = str(data.wt, "Welcome to Our Journey of Love");
  $("wSub").textContent = "To: " + data.to + "  ·  From: " + data.from;
  if (photos.length) $("wbg").style.backgroundImage = 'url("' + photos[0].url + '")';
  else $("wbg").classList.add("nophoto");

  // envelope-এর গায়ের লেখা
  $("lblTo").textContent = "To: " + data.to;
  $("lblFrom").textContent = "From: " + data.from;

  // letter-এর টাইটেল কার্ড ও ফিতা
  const lt = str(data.lt, ""), ls = str(data.ls, ""), rb = str(data.rb, "");
  if (lt || ls) {
    $("lTitle").textContent = lt; $("lTitle").hidden = !lt;
    $("lSub").textContent = ls; $("lSub").hidden = !ls;
    $("lhead").hidden = false;
  }
  if (rb) { $("ribbon").textContent = rb; $("ribbon").hidden = false; }

  if (letterId && supabaseReady()) {
    $("reportBtn").style.display = "inline";
    $("reportBtn").onclick = async () => {
      if (!confirm("এই letter আপত্তিকর মনে হলে রিপোর্ট করুন। চালিয়ে যাবেন?")) return;
      try { await reportLetter(letterId, "reported from view page"); alert("ধন্যবাদ, রিপোর্ট জমা হয়েছে।"); }
      catch (e) { alert("রিপোর্ট পাঠানো যায়নি, একটু পরে আবার চেষ্টা করুন।"); }
    };
  }

  const isPreview = /(^|&)preview=1/.test(location.hash.replace(/^#/, ""));
  let opened = false;
  let timer = null;

  // তারিখ অনুযায়ী lock (শুরুর বাটনে)
  function checkLock() {
    if (!data.unlock || isPreview) return false;
    const left = data.unlock - Date.now();
    if (left <= 0) {
      // ডাটাবেসের letter-এ লুকানো অংশ সার্ভার থেকে আবার আনতে হবে
      if (data.locked) { location.reload(); return true; }
      $("locked").textContent = ""; $("beginBtn").disabled = false; return false;
    }
    const s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
          m = Math.floor((s % 3600) / 60), sec = s % 60;
    $("beginBtn").disabled = true;
    $("locked").textContent = `এই letter এখনো বন্ধ 🔒 খুলতে বাকি: ${d} দিন ${h} ঘণ্টা ${m} মিনিট ${sec} সেকেন্ড`;
    return true;
  }
  if (checkLock()) {
    const iv = setInterval(() => { if (!checkLock()) clearInterval(iv); }, 1000);
  }

  /* ---------- দৃশ্য বদল ---------- */
  function go(id) {
    document.querySelectorAll(".scene").forEach((s) => s.classList.remove("show"));
    $(id).classList.add("show");
  }

  /* ---------- স্লাইডশো ---------- */
  const track = $("track"), dots = $("dots");
  let cur = 0, autoTimer = null, scrollT = null;
  photos.forEach((p, i) => {
    const c = document.createElement("figure");
    c.className = "slide";
    c.style.setProperty("--r", (i % 2 ? 1.5 : -1.5) + "deg");
    const im = document.createElement("img");
    im.src = p.url; im.alt = "ছবি " + (i + 1);
    c.appendChild(im);
    if (p.cap) {
      const cp = document.createElement("figcaption");
      cp.className = "cap"; cp.textContent = p.cap;
      c.appendChild(cp);
    }
    c.onclick = () => { $("lb").querySelector("img").src = p.url; $("lb").classList.add("show"); };
    track.appendChild(c);
    dots.appendChild(document.createElement("i"));
  });
  $("lb").onclick = () => $("lb").classList.remove("show");
  if (photos.length < 2) $("playBtn").style.display = "none";

  function setDot(i) {
    cur = i;
    Array.from(dots.children).forEach((d, k) => d.classList.toggle("on", k === i));
  }
  function slideTo(i) {
    const c = track.children[i];
    if (!c) return;
    track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: "smooth" });
    setDot(i);
  }
  track.addEventListener("scroll", () => {
    clearTimeout(scrollT);
    scrollT = setTimeout(() => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bd = Infinity;
      Array.from(track.children).forEach((c, k) => {
        const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (dist < bd) { bd = dist; best = k; }
      });
      setDot(best);
    }, 80);
  });
  function stopPlay() {
    clearInterval(autoTimer); autoTimer = null;
    $("playBtn").textContent = "▶ Slideshow";
  }
  $("playBtn").onclick = () => {
    if (autoTimer) return stopPlay();
    $("playBtn").textContent = "⏸ Pause";
    autoTimer = setInterval(() => slideTo((cur + 1) % photos.length), 3000);
  };
  if (photos.length) setDot(0);

  $("beginBtn").onclick = () => {
    if (checkLock()) return;
    if (photos.length) { go("sSlides"); setTimeout(() => slideTo(0), 60); }
    else toEnvelope();
  };
  $("backBtn").onclick = () => { stopPlay(); go("sWelcome"); };
  $("nextBtn").onclick = () => { stopPlay(); toEnvelope(); };

  // "I ❤ YOU" মুহূর্ত: ৩ সেকেন্ডে নিজে এগোয়, ট্যাপ করলে সঙ্গে সঙ্গে
  let loveTimer = null;
  function toEnvelope() {
    if (data.love !== true) return go("sEnvelope");
    go("sLove");
    clearTimeout(loveTimer);
    loveTimer = setTimeout(skipLove, 3200);
  }
  function skipLove() {
    clearTimeout(loveTimer);
    if ($("sLove").classList.contains("show")) go("sEnvelope");
  }
  $("sLove").addEventListener("click", skipLove);

  /* ---------- envelope ও letter ---------- */
  // পাপড়ি ও হার্ট ছড়িয়ে পড়ে
  function burst() {
    const r = $("env").getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const chars = ["🌸", "❤", "💗", "✿", "🌺"];
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("span");
      const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 140;
      p.className = "petal";
      p.textContent = chars[i % chars.length];
      p.style.left = cx + "px"; p.style.top = cy + "px";
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist - 40 + "px");
      p.style.setProperty("--rot", (Math.random() * 360 - 180) + "deg");
      p.style.fontSize = 12 + Math.random() * 14 + "px";
      document.querySelector(".stage").appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  }

  function openLetter() {
    if (opened) return;
    opened = true;
    $("env").classList.add("open");
    $("hint").style.display = "none";
    burst();
    // flap উল্টায় -> letter উঠে আসে -> envelope মিলিয়ে যায় -> পুরো letter ফোটে
    setTimeout(() => $("intro").classList.add("fade"), 1900);
    setTimeout(() => {
      $("sEnvelope").classList.remove("show");
      $("letter").classList.add("show");
      $("to").textContent = data.to + ",";
      typeWords();
    }, 2300);
  }

  // শুরুর শব্দ থেকে শেষ পর্যন্ত একটা একটা করে শব্দ ফুটে ওঠে
  function typeWords() {
    const words = data.msg.split(/(\s+)/); // স্পেস/নতুন লাইন ধরে রাখি
    const body = $("body");
    const per = Math.max(60, Math.min(220, 9000 / Math.max(words.length, 1)));
    let i = 0;
    function step() {
      if (i >= words.length) return finish();
      body.textContent += words[i++];
      const letter = $("letter");
      letter.scrollTop = letter.scrollHeight;
      timer = setTimeout(step, /\s+/.test(words[i - 1]) ? 0 : per);
    }
    step();
    $("skip").onclick = () => { clearTimeout(timer); body.textContent = data.msg; finish(); };
  }
  function finish() {
    $("body").classList.remove("cursor");
    $("skip").style.display = "none";
    $("from").textContent = "— " + data.from;
    $("from").classList.add("show");
    setTimeout(() => $("cta").classList.add("show"), 800);
  }

  $("env").addEventListener("click", openLetter);
  $("env").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openLetter(); });
})();
