const CATEGORY_RULES = [
  { match: ["mail.google.com"], type: "email" },
  { match: ["docs.google.com"], type: "docs" },
  { match: ["github.com"], type: "tech" },
  { match: ["chat.openai.com"], type: "learning" },
  { match: ["youtube.com", "instagram.com"], type: "social" }
];

const CATEGORY_LABELS = {
  email: "📬 Inbox Warrior",
  docs: "📊 Spreadsheet Samurai",
  tech: "🧠 Tech Bro",
  learning: "📚 Knowledge Monk",
  social: "🎬 Reel Khan",
  idle: "💤 Standby NPC",
  mystery: "🌀 Mystery Mode"
};

function getCategory(domain, isIdle = false) {
  if (isIdle) return "idle";
  for (let r of CATEGORY_RULES) {
    if (r.match.some(m => domain.includes(m))) return r.type;
  }
  return "mystery";
}

function getCategoryLabel(type) {
  return CATEGORY_LABELS[type] || "🌀 Mystery Mode";
}
