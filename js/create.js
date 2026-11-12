(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  let selected = TEMPLATES[params.get("t")] ? params.get("t") : "rose";
  let lastLink = "";

  $("max").textContent = CFG.maxChars;
  $("msg").maxLength = CFG.maxChars;

  // ছবি বাছা
  let photoFiles = [];
  const MAXP = CFG.maxPhotos || 6;
  if (!supabaseReady()) $("photoField").style.display = "none";
  function renderThumbs() {
    const box = $("thumbs");
    box.innerHTML = "";
    photoFiles.forEach((f, i) => {
      const d = document.createElement("div");
      d.className = "thumb";
      const img = document.createElement("img");
      const url = URL.createObjectURL(f);
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      const x = document.createElement("button");
      x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", "ছবি সরান");
      x.onclick = () => { photoFiles.splice(i, 1); renderThumbs(); };
      d.append(img, x);
      box.appendChild(d);
    });
  }
  $("photos").addEventListener("change", (ev) => {
    const picked = Array.from(ev.target.files).filter((f) => f.type.startsWith("image/"));
    photoFiles = photoFiles.concat(picked).slice(0, MAXP);
    ev.target.value = "";
    renderThumbs();
  });

  // টেমপ্লেট গ্রিড
  const grid = $("tplGrid");
  function renderGrid() {
    grid.innerHTML = "";
    Object.entries(TEMPLATES).forEach(([key, t]) => {
      const d = document.createElement("div");
      d.className = "card tpl" + (key === selected ? " sel" : "");
      d.innerHTML = `<div class="sw" style="background:linear-gradient(160deg,${t.bg[0]},${t.bg[1]})">${t.emoji}</div><b>${t.name}</b>`;
      d.onclick = () => { selected = key; applyTheme(key); renderGrid(); };
      grid.appendChild(d);
    });
  }
  applyTheme(selected);
  renderGrid();

  $("msg").addEventListener("input", () => { $("count").textContent = $("msg").value.length; });

  function collect() {
    const data = {
      t: selected,
      to: $("to").value.trim(),
      from: $("from").value.trim(),
      msg: $("msg").value.trim()
    };
    const u = $("unlock").value;
    if (u) data.unlock = new Date(u).getTime();
    return data;
  }
  function valid(d) {
    if (!d.to || !d.from || !d.msg) return "নাম, আপনার নাম আর মেসেজ তিনটাই দিন।";
    return "";
  }

  $("previewBtn").onclick = async () => {
    const d = collect();
    const e = valid(d);
    $("err").textContent = e;
    if (e) return;
    if (photoFiles.length) $("err").textContent = "Preview-এ ছবি দেখানো হয় না। লিংক বানালে ছবিসহ দেখাবে।";
    // preview-এর জন্য সাময়িক লিংক (সেভ ছাড়াই)
    const url = viewBase() + "#d=" + (await pack(d)) + "&preview=1";
    window.open(url, "_blank");
  };

  $("form").onsubmit = async (ev) => {
    ev.preventDefault();
    const d = collect();
    const e = valid(d);
    $("err").textContent = e;
    if (e) return;
    $("genBtn").disabled = true;
    $("genBtn").textContent = "তৈরি হচ্ছে...";
    try {
      const blobs = [];
      for (const f of photoFiles) {
        try { blobs.push(await compressImage(f)); }
        catch (err) { throw new Error("\"" + f.name + "\" ছবিটা প্রক্রিয়া করা যায়নি (" + err.message + ")"); }
      }
      lastLink = await saveLetter(d, blobs, (i, n) => { $("genBtn").textContent = "ছবি আপলোড হচ্ছে " + i + "/" + n + "..."; });
      $("link").value = lastLink;
      $("openBtn").href = lastLink;
      $("qr").src = qrDataUrl(lastLink, 6, 2);
      $("result").classList.add("show");
      $("result").scrollIntoView({ behavior: "smooth" });
      if (lastLink.length > 1800) {
        $("err").textContent = "লিংক বেশ লম্বা, QR ঘন হবে এবং স্ক্যান কঠিন হতে পারে। মেসেজ ছোট করলে ভালো।";
      }
    } catch (err) {
      $("err").textContent = "সমস্যা হয়েছে: " + err.message;
    } finally {
      $("genBtn").disabled = false;
      $("genBtn").textContent = "লিংক ও QR বানান";
    }
  };

  $("copyBtn").onclick = async () => {
    try { await navigator.clipboard.writeText(lastLink); $("copyBtn").textContent = "কপি হয়েছে ✓"; }
    catch (e) { $("link").select(); document.execCommand("copy"); }
    setTimeout(() => ($("copyBtn").textContent = "কপি"), 1800);
  };

  // QR কার্ড PNG
  $("dlBtn").onclick = () => {
    const t = TEMPLATES[selected];
    const W = 720, H = 1000;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, t.bg[0]); grad.addColorStop(1, t.bg[1]);
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.textAlign = "center"; g.fillStyle = "#fff";
    g.font = "90px serif"; g.fillText("💌", W / 2, 170);
    g.font = "bold 44px 'Hind Siliguri', sans-serif";
    g.fillText("আপনার জন্য একটা সারপ্রাইজ", W / 2, 260);
    g.font = "30px 'Hind Siliguri', sans-serif";
    g.fillStyle = t.accent;
    g.fillText("To: " + $("to").value.trim(), W / 2, 315);
    const img = new Image();
    img.onload = () => {
      g.fillStyle = "#fff";
      g.fillRect(160, 360, 400, 400);
      g.drawImage(img, 170, 370, 380, 380);
      g.fillStyle = "#fff";
      g.font = "28px 'Hind Siliguri', sans-serif";
      g.fillText("স্ক্যান করে letter খুলুন", W / 2, 830);
      const a = document.createElement("a");
      a.download = "wishes-qr-card.png";
      a.href = c.toDataURL("image/png");
      a.click();
    };
    img.src = qrDataUrl(lastLink, 8, 0);
  };
})();
