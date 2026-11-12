// Supabase কনফিগ। এই url ও publishable key ইচ্ছা করেই পাবলিক, ব্রাউজারে থাকার জন্যই বানানো।
// নিরাপত্তা আসে ডাটাবেসের নিয়ম (RLS ও ফাংশন) থেকে। কখনো service_role key এখানে বসাবে না।
// supabase খালি রাখলে letter লিংকের (#) ভেতরে সেভ হবে (ছবি ছাড়া)।
window.WISHES_CONFIG = {
  supabase: {
    url: "https://exkrjtnkpyizitbdlbms.supabase.co",
    key: "sb_publishable_FkKpdjccuj6rrEeZAyYhhA_W1z5fr5n"
  },
  maxChars: 1200,
  maxPhotos: 6
};
