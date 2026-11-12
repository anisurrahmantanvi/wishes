(async function () {
  const $ = (id) => document.getElementById(id);
  let data;

  try {
    data = await loadLetter();
  } catch (e) {
    $("hint").textContent = "এই letter খোলা যাচ্ছে না: " + e.message;
    $("env").style.display = "none";
    return;
  }

  const key = TEMPLATES[data.t] ? data.t : "rose";
  applyTheme(key);
  startBackground($("bg"), key);

  const isPreview = /(^|&)preview=1/.test(location.hash.replace(/^#/, ""));
  let opened = false;
  let timer = null;

  // তারিখ অনুযায়ী lock
  function checkLock() {
    if (!data.unlock || isPreview) return false;
    const left = data.unlock - Date.now();
    if (left <= 0) { $("locked").textContent = ""; $("hint").textContent = "ট্যাপ করে খুলুন"; return false; }
    const s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
          m = Math.floor((s % 3600) / 60), sec = s % 60;
    $("hint").textContent = "এই letter এখনো বন্ধ 🔒";
    $("locked").textContent = `খুলতে বাকি: ${d} দিন ${h} ঘণ্টা ${m} মিনিট ${sec} সেকেন্ড`;
    return true;
  }
  if (checkLock()) {
    const iv = setInterval(() => { if (!checkLock()) clearInterval(iv); }, 1000);
  }

  function openLetter() {
    if (opened || checkLock()) return;
    opened = true;
    $("env").classList.add("open");
    $("hint").style.display = "none";
    setTimeout(() => {
      $("intro").style.display = "none";
      $("letter").classList.add("show");
      $("to").textContent = data.to + ",";
      typeWords();
    }, 900);
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
      body.scrollTop = body.scrollHeight;
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
