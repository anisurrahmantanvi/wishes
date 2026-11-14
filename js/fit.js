/* ফোনে পাতার মাপ:
   - সাধারণ পাতা (হোম, letter লেখা, ব্লগ ইত্যাদি): ফোনেও সবসময় কম্পিউটারের (desktop) চওড়া লেআউটে দেখায়।
   - view.html (প্রাপকের letter খোলার অভিজ্ঞতা): ফোনের মাপেই থাকে, শুধু Chrome-এ "Desktop site" চালু থাকলে পাতাকে বড় (zoom) করে ঠিক করে। */
(function () {
  try {
    var sw = Math.min(screen.width, screen.height);
    var iw = window.innerWidth;
    var phone = sw > 0 && sw <= 640;
    var isView = /(^|\/)view\.html$/.test(location.pathname);
    if (!phone) return;
    if (isView) {
      if (iw >= 700) {
        document.documentElement.style.zoom = String(iw / sw);
        document.documentElement.classList.add("fitted");
      }
    } else if (iw < 900) {
      var m = document.querySelector('meta[name="viewport"]');
      if (m) m.setAttribute("content", "width=1100");
      document.documentElement.classList.add("force-desktop");
    }
  } catch (e) { /* ignore */ }
})();
