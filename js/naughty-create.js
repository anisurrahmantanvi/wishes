(async function () {
  const $ = (id) => document.getElementById(id);
  await adultGate(); // নিশ্চিত না করলে এগোনো যায় না
  $("app").hidden = false;

  let ci = 0, oi = 0, pi = 0, lastLink = "";
  $("max").textContent = CFG.maxChars;
  $("msg").maxLength = CFG.maxChars;
  $("msg").addEventListener("input", () => { $("count").textContent = $("msg").value.length; });

  // স্মৃতির ছবি (ক্যাপশনসহ)
  let photos = [];
  const MAXP = CFG.maxPhotos || 6;
  if (!supabaseReady()) $("photoField").style.display = "none";
  function renderThumbs() {
    const box = $("thumbs");
    box.innerHTML = "";
    photos.forEach((p, i) => {
      const d = document.createElement("div");
      d.className = "thumb";
      const img = document.createElement("img");
      const url = URL.createObjectURL(p.file);
      img.src = url; img.onload = () => URL.revokeObjectURL(url);
      const x = document.createElement("button");
      x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", "ছবি সরান");
      x.onclick = () => { photos.splice(i, 1); renderThumbs(); };
      const cap = document.createElement("input");
      cap.className = "cap"; cap.maxLength = 60; cap.placeholder = "ক্যাপশন"; cap.value = p.cap;
      cap.oninput = () => { p.cap = cap.value; };
      d.append(img, x, cap);
      box.appendChild(d);
    });
    $("photoConsent").hidden = photos.length === 0;
    if (!photos.length) $("pc").checked = false;
  }
  $("photos").addEventListener("change", (ev) => {
    const picked = Array.from(ev.target.files).filter((f) => f.type.startsWith("image/")).map((file) => ({ file, cap: "" }));
    photos = photos.concat(picked).slice(0, MAXP);
    ev.target.value = "";
    renderThumbs();
  });

  function theme() {
    const p = DESIRE.pals[pi];
    Object.assign(TEMPLATES.desire, { bg: p.bg, accent: p.accent, paper: p.paper, ink: p.ink });
    applyTheme("desire");
  }
  function render() {
    theme();
    const g = DESIRE.chars[ci].g;
    if (oi > 7) oi = 0;
    $("chars").innerHTML = "";
    DESIRE.chars.forEach((c, i) => {
      const d = document.createElement("button");
      d.type = "button"; d.className = "nd-card" + (i === ci ? " sel" : "");
      d.innerHTML = charSVG(i, oi, pi) + "<b>চরিত্র " + (i + 1) + "</b><small>প্রাপ্তবয়স্ক</small>";
      d.onclick = () => { ci = i; render(); };
      $("chars").appendChild(d);
    });
    $("outfits").innerHTML = "";
    DESIRE.outfits[g].forEach((name, i) => {
      const d = document.createElement("button");
      d.type = "button"; d.className = "nd-card nd-sm" + (i === oi ? " sel" : "");
      d.innerHTML = charSVG(ci, i, pi) + "<b>" + name + "</b>";
      d.onclick = () => { oi = i; render(); };
      $("outfits").appendChild(d);
    });
    $("pals").innerHTML = "";
    DESIRE.pals.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "nd-pal" + (i === pi ? " sel" : "");
      b.style.background = "linear-gradient(135deg," + p.bg[0] + "," + p.bg[1] + ")";
      b.textContent = p.name;
      b.onclick = () => { pi = i; render(); };
      $("pals").appendChild(b);
    });
  }
  render();

  function collect() {
    const d = { t: "desire", ch: { c: ci, o: oi, p: pi }, to: $("to").value.trim(), from: $("from").value.trim(), msg: $("msg").value.trim() };
    if ($("cn").value.trim()) d.cn = $("cn").value.trim().slice(0, 30);
    if ($("wt").value.trim()) d.wt = $("wt").value.trim();
    if ($("rb").value.trim()) d.rb = $("rb").value.trim();
    if ($("unlock").value) d.unlock = new Date($("unlock").value).getTime();
    return d;
  }
  const valid = (d) => (!d.to || !d.from || !d.msg ? "নাম, আপনার নাম আর মেসেজ তিনটাই দিন।" : "");

  $("previewBtn").onclick = async () => {
    const d = collect(), e = valid(d);
    $("err").textContent = e;
    if (e) return;
    if (photos.length) $("err").textContent = "Preview-এ ছবি দেখানো হয় না। লিংক বানালে ছবিসহ দেখাবে।";
    window.open(viewBase() + "#d=" + (await pack(d)) + "&preview=1&x=1", "_blank");
  };
  $("form").onsubmit = async (ev) => {
    ev.preventDefault();
    const d = collect(), e = valid(d);
    $("err").textContent = e;
    if (e) return;
    if (photos.length && !$("pc").checked) { $("err").textContent = "ছবি দিলে নিচের নিশ্চিতকরণ টিক দিতে হবে।"; return; }
    if (photos.some((p) => p.cap.trim())) d.caps = photos.map((p) => p.cap.trim().slice(0, 60));
    $("genBtn").disabled = true; $("genBtn").textContent = "তৈরি হচ্ছে...";
    try {
      const blobs = [];
      for (const p of photos) {
        try { blobs.push(await compressImage(p.file)); }
        catch (err) { throw new Error("\"" + p.file.name + "\" ছবিটা প্রক্রিয়া করা যায়নি (" + err.message + ")"); }
      }
      lastLink = await saveLetter(d, blobs, (i, n) => { $("genBtn").textContent = "ছবি আপলোড হচ্ছে " + i + "/" + n + "..."; });
      $("link").value = lastLink; $("openBtn").href = lastLink;
      $("qr").src = qrDataUrl(lastLink, 6, 2);
      $("result").classList.add("show");
      $("result").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      $("err").textContent = "সমস্যা হয়েছে: " + err.message;
    } finally {
      $("genBtn").disabled = false; $("genBtn").textContent = "লিংক ও QR বানান";
    }
  };
  $("copyBtn").onclick = async () => {
    try { await navigator.clipboard.writeText(lastLink); $("copyBtn").textContent = "কপি হয়েছে ✓"; }
    catch (e) { $("link").select(); document.execCommand("copy"); }
    setTimeout(() => ($("copyBtn").textContent = "কপি"), 1800);
  };
})();
