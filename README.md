# 💌 Wishes

প্রিয় মানুষের জন্য animation-সহ wishes letter। HTML, CSS ও JavaScript দিয়ে তৈরি, GitHub Pages-এ হোস্ট করা যায়।

## ফ্লো
টেমপ্লেট বাছুন → customize → letter লিখুন → লিংক ও QR → QR কার্ড PNG ডাউনলোড।
QR স্ক্যান → envelope → ট্যাপ করলে খোলে → ব্যাকগ্রাউন্ড animation-এর উপর letter প্রথম শব্দ থেকে শেষ শব্দ পর্যন্ত ফুটে ওঠে।

## ফাইল
- `index.html` ল্যান্ডিং পেজ
- `create.html` + `js/create.js` letter তৈরি, লিংক, QR, PNG ডাউনলোড
- `view.html` + `js/view.js` envelope, unlock countdown, word-by-word reveal
- `js/common.js` টেমপ্লেট, লিংক encode/decode, QR, canvas ব্যাকগ্রাউন্ড
- `js/config.js` ঐচ্ছিক Firebase কনফিগ
- `css/style.css`

## দুই ধরনের সেভ
1. **ডিফল্ট (কিছু সেটআপ লাগে না):** letter সংকুচিত হয়ে লিংকের `#` অংশে থাকে। ছোট letter-এর জন্য ভালো। সীমাবদ্ধতা: এডিট/ডিলিট করা যায় না, লম্বা letter-এ QR ঘন হয়, আর unlock তারিখ আসল lock নয়।
2. **Firebase Firestore:** `js/config.js`-এ `projectId` ও `apiKey` দিলে letter ডাটাবেসে সেভ হয়, লিংক ছোট থাকে (`view.html#id=xxxx`)। Firestore rules-এ `letters` collection-এ create ও get অনুমতি দিতে হবে (list নয়)।

## GitHub Pages ও ডোমেইন
Settings → Pages → Branch `main` / root। কাস্টম ডোমেইন কিনলে রিপোর রুটে `CNAME` ফাইল দিন আর ডোমেইনের DNS-এ GitHub Pages-এর রেকর্ড বসান।

## অবস্থা
- JS ফাইলের সিনট্যাক্স ও encode/decode Node-এ যাচাই করা হয়েছে।
- ব্রাউজারে UI, animation, QR স্ক্যান ও Firestore মোড এখনো টেস্ট করা হয়নি।
- QR লাইব্রেরি (`qrcode-generator`) cdnjs থেকে লোড হয়।
- AdSense, ব্লগ, Privacy Policy ও Report বাটন এখনো যোগ করা হয়নি।
