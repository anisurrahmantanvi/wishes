# 💌 Wishes

প্রিয় মানুষের জন্য animation-সহ wishes letter। HTML, CSS ও JavaScript দিয়ে তৈরি, GitHub Pages-এ হোস্ট করা যায়।

## ফ্লো
টেমপ্লেট বাছুন → customize → letter লিখুন → লিংক ও QR → QR কার্ড PNG ডাউনলোড।
QR স্ক্যান → **Welcome** (প্রথম ছবি ব্যাকগ্রাউন্ডে, "শুরু করুন" বাটন) → **ছবির স্লাইডশো** (ক্যাপশনসহ, ছবি থাকলে) → **envelope** (ট্যাপ করলে ফ্ল্যাপ উল্টে letter ওঠে) → **letter** (টাইটেল কার্ড, কোণায় ফিতা, লেখা একটা একটা শব্দ করে ফোটে)। ব্যাকগ্রাউন্ডে সবসময় galaxy-love animation চলে।
ঐচ্ছিক ঘর: Welcome টাইটেল, letter টাইটেল ও সাবটাইটেল, ফিতার লেখা, প্রতিটা ছবির ক্যাপশন। unlock তারিখ দিলে "শুরু করুন" বাটন সেই সময় পর্যন্ত বন্ধ থাকে।

## ফাইল
- `index.html` ল্যান্ডিং পেজ
- `create.html` + `js/create.js` letter তৈরি, লিংক, QR, PNG ডাউনলোড
- `view.html` + `js/view.js` Welcome, স্লাইডশো, envelope, letter, unlock countdown
- `js/common.js` টেমপ্লেট, লিংক encode/decode, QR, canvas ব্যাকগ্রাউন্ড
- `js/config.js` Supabase কনফিগ
- `css/style.css`

## Supabase (letter ও ছবি সেভ)
Project: `wishes` (Supabase)। `js/config.js`-এ project URL ও publishable key আছে, এগুলো পাবলিক হওয়ার জন্যই বানানো। `service_role` key কখনো কোডে বা রিপোতে রাখবে না।

- **টেবিল:** `letters` (letter-এর ডাটা), `letter_reports` (রিপোর্ট)। দুটোতেই RLS চালু এবং কোনো policy নেই, মানে সরাসরি পড়া/লেখা বন্ধ।
- **ফাংশন:** `create_letter` (ইনপুট যাচাই করে সেভ), `get_letter(id)` (আইডি জানলে একটা letter), `report_letter`। সাইট শুধু এগুলোই ডাকে।
- **ছবি:** `letter-photos` bucket। সর্বোচ্চ ১ MB, শুধু JPEG, ফাইলের নাম `<uuid>/<১-৯>.jpg` ছাঁচে হতে হবে। শুধু আপলোডের অনুমতি আছে, তালিকা/বদল/মোছা নেই। ব্রাউজারে ছবি ছোট (সর্বোচ্চ ১২৮০px) করে পাঠানো হয়।
- `supabase` কনফিগ খালি রাখলে letter লিংকের `#` অংশে সেভ হয় (ছবি ছাড়া)।

## অপব্যবহার ঠেকানো ও ডাটা মোছা
- **Rate limit** (প্রতি ঘণ্টায়, হ্যাশ-করা IP অনুযায়ী): letter ১০, রিপোর্ট ২০, যোগাযোগ ৫, ছবি আপলোড ৮০। IP না পেলে সীমা প্রয়োগ হয় না (fail-open)।
- **মেয়াদ:** letter প্রথমবার আসল খোলার (unlock সময় পার হওয়ার পর) ১৫ দিন পর, না খুললে ১৮০ দিন পর (`letters.first_opened_at`, `get_letter` সেট করে); যোগাযোগ বার্তা ৯০ দিন পর মুছে যায়।
- **স্বয়ংক্রিয় মোছা:** `cleanup` Edge Function (সিক্রেট হেডার `x-cron-secret`, Vault-এ `cleanup_secret`) মেয়াদোত্তীর্ণ letter ও এতিম ছবি Storage API দিয়ে সরায়। pg_cron জব `wishes-daily-cleanup` প্রতিদিন ২০:৩০ UTC-তে চালায়।
- **রিপোর্ট:** ৫টা রিপোর্ট জমলে letter লুকিয়ে যায়।
- **অ্যাডমিন:** আপত্তিকর letter সরাতে Supabase ড্যাশবোর্ডে `letters.removed = true` করুন। `letter_reports` ও `contact_messages` টেবিল ড্যাশবোর্ড থেকে দেখুন।
- **খোলার সময় (unlock):** ডাটাবেসের letter-এ সময় আসার আগে `get_letter` শুধু নাম, টাইটেল ও সময় ফেরত দেয়, মেসেজ ও ছবির পাথ নয়। সময় পার হলে পাতা নিজে রিলোড হয়। (`#d=` লিংক মোডে এটা সম্পূর্ণ নিরাপদ নয়।)

## Desktop site মোড (ফোনে)
`js/fit.js` সব পাতার `<head>`-এ: ফোনে Chrome-এ "Desktop site" চালু থাকলে (screen ≤ ৬৪০px কিন্তু window ≥ ৭০০px) পুরো পাতাকে `zoom` দিয়ে ফোনের মাপে বড় করে, যাতে লেখা অতি ছোট না দেখায়। সাধারণ কম্পিউটারে কিছু বদলায় না। Playwright-এ screen মাপ নকল করে যাচাই হয়েছে, আসল ফোনে নয়।

## পাতা
`index.html`, `create.html`, `view.html`, `about.html`, `contact.html` (ফর্ম → `send_contact`), `privacy.html`, `terms.html`, `blog/` (৫টা লেখা), `sitemap.xml`, `robots.txt`। `view.html` সার্চ ইঞ্জিনে ইনডেক্স হয় না। Terms/Privacy সাধারণ টেমপ্লেট, আইনি পরামর্শ নয়।

## টেমপ্লেট ও দৃশ্য
টেমপ্লেট: rose, galaxy, night, sunset, blossom, gold, romantic, anniversary, newyear (আতশবাজি), summer (সমুদ্রের ঢেউ ও ছোট্ট আঁকা মূর্তি) (ডাটাবেস এগুলোই গ্রহণ করে)। দৃশ্যের ক্রম: Welcome → স্লাইডশো (ছবি থাকলে) → "I ❤ YOU" ও anime-style চুমুর দৃশ্য (দুটোই ঐচ্ছিক, create পাতায় টিক দিলে; I ❤ YOU, create পাতায় টিক দিলে; ৩ সেকেন্ড, ট্যাপে স্কিপ) → envelope → letter।

## Naughty Desire (১৮+, গোপন)
- ঢোকার পথ: create পাতার টেমপ্লেট গ্রিডের শেষ কার্ড "🔞 ১৮+ টেমপ্লেট", landing পেজের footer-এ `©` বছরের লেখায় ৫ বার ট্যাপ, বা সরাসরি `naughty.html`। কোনো মেনু/সাইটম্যাপে নেই, `noindex`।
- `js/naughty.js`: ৬ প্রাপ্তবয়স্ক চরিত্র (নিজের আঁকা SVG, ২৫+ বয়স), ৬টা পোশাক (ছেলে/মেয়ে আলাদা), ৩ romantic palette (Romantic Red, Rose Blush, Sweet Peach), `adultGate()` (বয়স ও সম্মতি, দুই টিক), Web Audio সাউন্ড (chime, tick, heartbeat; কোনো ফাইল নেই, 🔊 বাটনে বন্ধ করা যায়)।
- চরিত্রের নাম ব্যবহারকারী নিজে বসায় (`cn`, সর্বোচ্চ ৩০ অক্ষর, ঐচ্ছিক)। চরিত্র আঁকায় চকচকে চোখ, চুলের ঝিলিক, অলংকার ও ছায়া আছে।
- `js/naughty-create.js`: চরিত্র/পোশাক/রঙ বাছা, letter, ছবি (সর্বোচ্চ ৬, ক্যাপশনসহ, নিশ্চিতকরণ টিক বাধ্যতামূলক; প্রাইভেট bucket `letter-photos-private`, Edge Function `photo-urls` প্রথম দেখা থেকে ১৫ মিনিটের signed URL দেয়, `cleanup` প্রতি ৩০ মিনিটে (cron `wishes-daily-cleanup`, নামটা পুরনো) সময়-শেষ ছবি মোছে; `letters.first_photos_at`, `photos_purged`, `data.pp`), preview, লিংক+QR। ছবিতে নগ্নতা আটকানোর স্বয়ংক্রিয় ব্যবস্থা নেই, শুধু নিয়ম, টিক ও রিপোর্ট।
- লিংকে `&x=1` থাকলে letter আনার আগেই গেট আসে। `t=desire` হলে `x=1` না থাকলেও গেট আসে। `get_letter`/`create_letter`-এ `ch` (c 0-5, o 0-7, p 0-2) যাচাই করে সংরক্ষিত হয়।
- প্রাপক "নিজের letter বানান" চাপলে `naughty.html`-এ যায়।
- সীমাবদ্ধতা: বয়সের নিশ্চিতকরণ শুধু নিজের ঘোষণা, আসল যাচাই নয়। AdSense-এর জন্য এটা ঝুঁকিপূর্ণ হতে পারে।

## এখনো বাকি / সীমাবদ্ধতা
- `get_letter` যেকোনো খোলাকেই "প্রথম খোলা" ধরে, তাই নির্মাতা নিজে "খুলে দেখুন" চাপলেও ১৫ দিনের ঘড়ি শুরু হয়। লিংক-প্রিভিউ বটও খুলতে পারে।
- AdSense এখনো যোগ করা হয়নি। github.io বা ফ্রি সাবডোমেইনে অনুমোদন কঠিন, নিজের ডোমেইন লাগতে পারে।
- `surprisewish.de5.net` এখনো GitHub Pages-এর সঙ্গে যুক্ত হয়নি (`CNAME` ফাইল ও DNS বাকি)।
- সাইটম্যাপে এখনো github.io ঠিকানা আছে, ডোমেইন বদলালে আপডেট করতে হবে।

## GitHub Pages ও ডোমেইন
Settings → Pages → Branch `main` / root। কাস্টম ডোমেইন কিনলে রিপোর রুটে `CNAME` ফাইল দিন আর ডোমেইনের DNS-এ GitHub Pages-এর রেকর্ড বসান।

## অবস্থা
- JS ফাইলের সিনট্যাক্স যাচাই করা হয়েছে। `view.js` নকল DOM-এ চালানো হয়েছে (আসল ব্রাউজার নয়)। সব HTML-এর ভেতরের লিংক ফাইলের সঙ্গে মিলিয়ে দেখা হয়েছে।
- ডাটাবেসের ফাংশন, rate limit, মেয়াদ ও unlock লুকানো SQL-এ যাচাই হয়েছে। cleanup Edge Function pg_net দিয়ে শুরু থেকে শেষ পর্যন্ত চালানো হয়েছে।
- **টেস্ট হয়নি:** আসল ব্রাউজারে UI ও animation (নতুন landing, "I ❤ YOU" দৃশ্য সহ), ছবি আপলোডে IP-হেডার, cron-এর প্রথম নির্ধারিত রান, যোগাযোগ ফর্ম ব্রাউজার থেকে পাঠানো।
- QR লাইব্রেরি (`qrcode-generator`) cdnjs থেকে লোড হয়।
