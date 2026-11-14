/* ফোনে Chrome-এর "Desktop site" চালু থাকলে ব্রাউজার ৯৮০px চওড়া পাতা বানিয়ে ছোট করে দেখায়, লেখা অতি ছোট হয়ে যায়।
   এখানে সেটা ধরে পাতাকে ফোনের মাপে বড় (zoom) করা হয়। সাধারণ কম্পিউটারে কিছুই বদলায় না। */
(function () {
  try {
    var sw = Math.min(screen.width, screen.height);
    var iw = window.innerWidth;
    if (sw > 0 && sw <= 640 && iw >= 700) {
      var z = iw / sw;
      document.documentElement.style.zoom = String(z);
      document.documentElement.classList.add("fitted");
    }
  } catch (e) { /* ignore */ }
})();
