// ঐচ্ছিক: Firebase Firestore চালু করতে নিচের মান বসাও।
// খালি রাখলে letter লিংকের (#) ভেতরেই সেভ হবে, কোনো ডাটাবেস লাগবে না।
window.WISHES_CONFIG = {
  firebase: {
    projectId: "",
    apiKey: ""
  },
  // ছোট letter-এর জন্য লিংক ছোট রাখতে সর্বোচ্চ অক্ষর
  maxChars: 1200
};
