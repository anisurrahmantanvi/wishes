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
- `js/config.js` Supabase কনফিগ
- `css/style.css`

## Supabase (letter ও ছবি সেভ)
Project: `wishes` (Supabase)। `js/config.js`-এ project URL ও publishable key আছে, এগুলো পাবলিক হওয়ার জন্যই বানানো। `service_role` key কখনো কোডে বা রিপোতে রাখবে না।

- **টেবিল:** `letters` (letter-এর ডাটা), `letter_reports` (রিপোর্ট)। দুটোতেই RLS চালু এবং কোনো policy নেই, মানে সরাসরি পড়া/লেখা বন্ধ।
- **ফাংশন:** `create_letter` (ইনপুট যাচাই করে সেভ), `get_letter(id)` (আইডি জানলে একটা letter), `report_letter`। সাইট শুধু এগুলোই ডাকে।
- **ছবি:** `letter-photos` bucket। সর্বোচ্চ ১ MB, শুধু JPEG, ফাইলের নাম `<uuid>/<১-৯>.jpg` ছাঁচে হতে হবে। শুধু আপলোডের অনুমতি আছে, তালিকা/বদল/মোছা নেই। ব্রাউজারে ছবি ছোট (সর্বোচ্চ ১২৮০px) করে পাঠানো হয়।
- `supabase` কনফিগ খালি রাখলে letter লিংকের `#` অংশে সেভ হয় (ছবি ছাড়া)।

## এখনো বাকি / সীমাবদ্ধতা
- পুরনো letter বা ছবি স্বয়ংক্রিয়ভাবে মোছার ব্যবস্থা নেই (স্টোরেজ ভরার ঝুঁকি)।
- আপলোডে rate limit নেই, অপব্যবহার ঠেকাতে পরে Edge Function বা Turnstile লাগতে পারে।
- রিপোর্ট শুধু `letter_reports` টেবিলে জমা হয়, দেখার বা ছবি সরানোর প্যানেল নেই।
- Terms, Privacy Policy, AdSense এখনো নেই।

## GitHub Pages ও ডোমেইন
Settings → Pages → Branch `main` / root। কাস্টম ডোমেইন কিনলে রিপোর রুটে `CNAME` ফাইল দিন আর ডোমেইনের DNS-এ GitHub Pages-এর রেকর্ড বসান।

## অবস্থা
- JS ফাইলের সিনট্যাক্স যাচাই করা হয়েছে। ডাটাবেসের ফাংশন ও bucket-এর নিয়ম `anon` role দিয়ে SQL-এ যাচাই করা হয়েছে।
- ব্রাউজারে UI, animation, ছবি আপলোড (ওয়েব API দিয়ে) ও QR স্ক্যান এখনো টেস্ট করা হয়নি।
- QR লাইব্রেরি (`qrcode-generator`) cdnjs থেকে লোড হয়।
