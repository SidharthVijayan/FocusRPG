
// 🎯 CATEGORY RULE ENGINE
const CATEGORY_RULES = [
  { match: ["mail.google.com"], type: "email" },
  { match: ["docs.google.com", "sheets.google.com"], type: "docs" },
  { match: ["github.com", "stackoverflow.com"], type: "tech" },
  { match: ["chat.openai.com", "coursera.org", "udemy.com"], type: "learning" },
  { match: ["youtube.com", "instagram.com", "facebook.com", "twitter.com", "reddit.com"], type: "social" }
];

// 🎭 CATEGORY PERSONALITY LABELS
const CATEGORY_LABELS = {
  email: "📬 Inbox Warrior",
  docs: "📊 Spreadsheet Samurai",
  tech: "🧠 Tech Bro",
  learning: "📚 Knowledge Monk",
  social: "🎬 Reel Khan",
  idle: "💤 Standby NPC",
  mystery: "🌀 Mystery Mode"
};

// 🧠 CATEGORY DETECTION
function getCategory(domain, isIdle = false) {
  if (isIdle) return "idle";

  for (let rule of CATEGORY_RULES) {
    if (rule.match.some(m => domain.includes(m))) {
      return rule.type;
    }
  }

  return "mystery";
}

// 🏷️ LABEL HELPER
function getCategoryLabel(type) {
  return CATEGORY_LABELS[type] || "🌀 Mystery Mode";
}
