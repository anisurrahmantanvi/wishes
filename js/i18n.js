/* Wishes — ভাষা বদল (বাংলা / English).
   বাংলা মূল ভাষা। English বেছে নিলে পাতার বাংলা লেখাগুলো ডিকশনারি (i18n-en.js) থেকে বদলে যায়।
   data-notr: ব্যবহারকারীর নিজের লেখা (letter-এর অংশ) কখনো অনুবাদ/বদল হয় না। */
(function () {
  var KEY = "wl", lang = "bn", q = null;
  try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
  try {
    if (q === "en" || q === "bn") localStorage.setItem(KEY, q);
    lang = localStorage.getItem(KEY) || "bn";
  } catch (e) { if (q === "en" || q === "bn") lang = q; }
  if (lang !== "en") lang = "bn";

  var D = window.WISH_EN || {};
  var SUBS = (window.WISH_SUB || []).filter(function (k) { return k.length >= 4; }).sort(function (a, b) { return b.length - a.length; });
  var RULES = [
    [/এই letter এখনো বন্ধ 🔒 খুলতে বাকি: (\S+) দিন (\S+) ঘণ্টা (\S+) মিনিট (\S+) সেকেন্ড/, "This letter is still closed 🔒 Time left: $1 days $2 hours $3 minutes $4 seconds"],
    [/🔒 এই ছবিগুলো আর প্রায় (\S+) মিনিট দেখা যাবে।/, "🔒 These photos can be seen for about $1 more minutes."]
  ];
  var DIG = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
  var BN = /[ঀ-৿।]/;
  var saved = [];      // {n, o, t}: text node, মূল বাংলা, অনুবাদিত
  var savedAttr = [];  // {el, a, o, t}
  var busy = false;

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }
  function translate(core, exactOnly) {
    if (Object.prototype.hasOwnProperty.call(D, core)) return D[core];
    if (exactOnly) return null;
    var i, r = core, hit = false;
    for (i = 0; i < RULES.length; i++) if (RULES[i][0].test(r)) { r = r.replace(RULES[i][0], RULES[i][1]); hit = true; }
    for (i = 0; i < SUBS.length; i++) if (r.indexOf(SUBS[i]) > -1) { r = r.split(SUBS[i]).join(D[SUBS[i]]); hit = true; }
    r = r.replace(/।/g, ".").replace(/[০-৯]/g, function (c) { return DIG[c]; });
    return hit || r !== core ? r : null;
  }
  function inNotr(el) { return !!(el && el.closest && el.closest("[data-notr]")); }

  function doText(n) {
    var v = n.nodeValue;
    if (!v || !BN.test(v)) return;
    var p = n.parentNode;
    if (p && /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.nodeName)) return;
    var core = norm(v), t = translate(core, inNotr(p));
    if (t == null || t === core) return;
    var lead = /^\s/.test(v) && !/^[.,;:!?]/.test(t) ? " " : "";
    var trail = /\s$/.test(v) ? " " : "";
    var out = lead + t + trail;
    busy = true; n.nodeValue = out; busy = false;
    saved.push({ n: n, o: v, t: out });
  }
  var ATTRS = ["placeholder", "title", "alt", "aria-label"];
  function doAttrs(el) {
    if (el.nodeType !== 1) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (!v || !BN.test(v) || inNotr(el)) continue;
      var t = translate(norm(v));
      if (t == null || t === v) continue;
      busy = true; el.setAttribute(a, t); busy = false;
      savedAttr.push({ el: el, a: a, o: v, t: t });
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    var tw = document.createTreeWalker(root, 5, null), n;
    if (root.nodeType === 1) doAttrs(root);
    while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  function meta() {
    var m = document.querySelector('meta[name="description"]');
    if (m) {
      var v = m.getAttribute("content");
      if (!m._bn) m._bn = v;
      var t = lang === "en" ? translate(norm(m._bn)) : null;
      m.setAttribute("content", t || m._bn);
    }
    document.documentElement.setAttribute("lang", lang);
  }

  var mo = null;
  function start() {
    meta(); walk(document);
    if (!mo) {
      mo = new MutationObserver(function (recs) {
        if (busy) return;
        recs.forEach(function (r) {
          if (r.type === "characterData") doText(r.target);
          else if (r.type === "attributes") doAttrs(r.target);
          else r.addedNodes.forEach(walk);
        });
      });
    }
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function stop() {
    if (mo) mo.disconnect();
    busy = true;
    saved.forEach(function (s) { if (s.n.nodeValue === s.t) s.n.nodeValue = s.o; });
    savedAttr.forEach(function (s) { if (s.el.getAttribute(s.a) === s.t) s.el.setAttribute(s.a, s.o); });
    busy = false; saved = []; savedAttr = [];
    meta();
  }

  /* অন্য স্ক্রিপ্টের জন্য: confirm/alert/canvas লেখায় ব্যবহার */
  window.T = function (bn) { if (lang !== "en") return bn; var t = translate(norm(bn)); return t == null ? bn : t; };
  window.wishLang = function () { return lang; };

  function label() { return lang === "en" ? "বাংলা" : "English"; }
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    if (l === "en") start(); else stop();
    var b = document.getElementById("langBtn");
    if (b) { b.textContent = label(); b.title = l === "en" ? "বাংলায় দেখুন" : "View in English"; }
    window.dispatchEvent(new CustomEvent("wishlangchange", { detail: l }));
  }
  function addButton() {
    if (document.getElementById("langBtn")) return;
    var b = document.createElement("button");
    b.id = "langBtn"; b.type = "button"; b.className = "langbtn";
    b.textContent = label(); b.title = lang === "en" ? "বাংলায় দেখুন" : "View in English";
    b.setAttribute("data-notr", "");
    b.onclick = function () { setLang(lang === "en" ? "bn" : "en"); };
    var nav = document.querySelector(".top .nav") || document.querySelector("header.top");
    if (nav) nav.appendChild(b); else document.body.appendChild(b);
  }
  function init() {
    addButton();
    if (lang === "en") start(); else meta();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
