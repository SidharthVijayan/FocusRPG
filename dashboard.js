// 🔢 HELPERS
function msToMin(ms) {
  return Math.round(ms / 60000);
}

function getLevel(xp) {
  return Math.floor(Math.sqrt(xp / 50));
}

function getLevelTitle(level) {
  if (level >= 20) return "👑 Focus Legend";
  if (level >= 15) return "🔥 Deep Work Beast";
  if (level >= 10) return "⚔️ Discipline Warrior";
  if (level >= 5) return "🧠 Rising Player";
  return "🙂 Beginner Human";
}

// 🎭 PERSONALITY ENGINE
function getPersonality(stats, streak, pomodoro) {
  let work = stats.tech + stats.learning;
  let social = stats.social;

  if (social > work * 2) {
    return { title: "🎬 Reel Khan", desc: "Scrolling is your cardio." };
  }

  if (work > 120) {
    return { title: "🧠 Deep Work Beast", desc: "Elite focus unlocked." };
  }

  if (work > social && pomodoro >= 3) {
    return { title: "⚔️ Focus Warrior", desc: "You are building momentum." };
  }

  if (streak >= 5) {
    return { title: "🧘 Zen Monk", desc: "Consistency is your power." };
  }

  return { title: "🙂 Wanderer", desc: "Still figuring things out." };
}

// 🏅 BADGES
function getBadges(stats, streak, pomodoro) {
  let badges = [];

  if (streak >= 3) badges.push("🔥 Streak Starter");
  if (streak >= 7) badges.push("⚡ Consistency Beast");
  if (pomodoro >= 5) badges.push("🍅 Focus Soldier");
  if ((stats.tech + stats.learning) > 120) badges.push("🧠 Deep Worker");

  return badges;
}

// 🎯 QUESTS
function getQuests(stats, pomodoro) {
  return [
    { text: "Complete 2 Pomodoros", done: pomodoro >= 2 },
    { text: "60+ min Deep Work", done: (stats.tech + stats.learning) >= 60 },
    { text: "Reel Khan < 90 min", done: (stats.social || 0) < 90 }
  ];
}

// 💬 MOTIVATION
function getMotivation(score) {
  if (score > 80) return "🔥 You’re in beast mode.";
  if (score > 60) return "⚔️ Solid work. Push further.";
  if (score > 40) return "🙂 Not bad. Improve.";
  return "🤡 Chaos detected.";
}

// 🔥 STREAK SYSTEM
function isSameDay(d1, d2) {
  return new Date(d1).toDateString() === new Date(d2).toDateString();
}

async function updateStreak() {
  let data = await chrome.storage.local.get(["streak", "lastActive"]);
  let streak = data.streak || 0;
  let last = data.lastActive;

  let today = new Date();

  if (!last) {
    streak = 1;
  } else {
    let lastDate = new Date(last);
    let diff = (today - lastDate) / (1000 * 60 * 60 * 24);

    if (diff < 2 && !isSameDay(today, lastDate)) {
      streak++;
    } else if (diff >= 2) {
      streak = 1;
    }
  }

  await chrome.storage.local.set({
    streak,
    lastActive: today.toISOString()
  });

  return streak;
}

// 🚀 MAIN LOAD
async function load() {

  let data = await chrome.storage.local.get(["stats", "xp", "pomodoro"]);

  let stats = data.stats || {};
  let xp = data.xp || 0;
  let pomodoro = data.pomodoro || 0;

  let totals = { tech: 0, learning: 0, social: 0 };

  let table = document.getElementById("table");
  table.innerHTML = "";

  let totalTime = 0;

  for (let site in stats) {
    let t = msToMin(stats[site].time);
    let cat = stats[site].category;

    totalTime += t;

    if (totals[cat] !== undefined) {
      totals[cat] += t;
    }

    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${site}</td>
      <td>${t} min</td>
      <td>${getCategoryLabel(cat)}</td>
    `;
    table.appendChild(row);
  }

  let work = totals.tech + totals.learning;
  let social = totals.social;

  let score = totalTime ? Math.round((work / totalTime) * 100) : 0;

  let level = getLevel(xp);
  let title = getLevelTitle(level);

  let streak = await updateStreak();
  let personality = getPersonality(totals, streak, pomodoro);

  let badges = getBadges(totals, streak, pomodoro);
  let quests = getQuests(totals, pomodoro);

  // 🔥 STREAK HERO
  document.getElementById("streakBox").innerHTML = `
    🔥 STREAK
    <div class="streak-number">${streak}</div>
    DAYS
  `;

  // 🎭 PROFILE (CLEAN UI FIX APPLIED)
  let xpProgress = (xp % 500) / 500 * 100;

  document.getElementById("profile").innerHTML = `
    <div class="profile-title">${personality.title}</div>
    <div class="profile-sub">${personality.desc}</div>

    <div style="margin-top:10px">
      Level ${level} — ${title}
    </div>

    <div>XP: ${xp}</div>

    <div class="xp-bar">
      <div class="xp-fill" style="width:${xpProgress}%"></div>
    </div>
  `;

  // 📊 STATS
  document.getElementById("stats").innerText = `
Score: ${score}
Deep Work: ${work} min
Reel Khan: ${social} min
`;

  // 🏅 BADGES
  document.getElementById("badges").innerHTML =
    badges.length ? badges.map(b => `<span>${b}</span>`).join("") : "No badges yet";

  // 🎯 QUESTS
  document.getElementById("quests").innerHTML =
    quests.map(q => `<div>${q.done ? "✅" : "⬜"} ${q.text}</div>`).join("");

  // 💬 MOTIVATION
  document.getElementById("motivation").innerText = getMotivation(score);

  // 📤 STORE FOR SHARE
  window.currentData = { level, title, score, streak, badges };
}

// 📤 SHARE SYSTEM
document.getElementById("shareBtn").onclick = () => {
  const canvas = document.getElementById("shareCanvas");
  const ctx = canvas.getContext("2d");

  let data = window.currentData;

  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, 600, 800);

  ctx.fillStyle = "#9b5cff";
  ctx.fillRect(0, 0, 600, 10);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px Arial";
  ctx.fillText("🎮 FocusRPG", 180, 80);

  ctx.font = "22px Arial";
  ctx.fillText(`Level ${data.level}`, 50, 180);
  ctx.fillText(data.title, 50, 220);

  ctx.fillText(`Score: ${data.score}`, 50, 300);
  ctx.fillText(`🔥 ${data.streak} day streak`, 50, 340);

  ctx.font = "18px Arial";
  ctx.fillText("Badges:", 50, 420);

  data.badges.slice(0, 3).forEach((b, i) => {
    ctx.fillText(b, 50, 460 + i * 30);
  });

  const link = document.createElement("a");
  link.download = "focusrpg-report.png";
  link.href = canvas.toDataURL();
  link.click();
};

// 🔒 PRO SYSTEM
document.getElementById("proBtn").onclick = () => {
  window.open("https://yourdomain.com");
};

document.getElementById("activatePro").onclick = async () => {
  let code = document.getElementById("proCode").value;

  if (code.startsWith("FOCUSRPG-")) {
    await chrome.storage.local.set({ isPro: true });
    alert("🎉 Pro Activated!");
    location.reload();
  } else {
    alert("Invalid code");
  }
};

// INIT
load();
