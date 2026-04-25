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

function getMotivation(score, streak) {
  if (score > 80) return "🔥 You’re in beast mode.";
  if (score > 60) return "⚔️ Solid work. Push more.";
  if (score > 40) return "🙂 Not bad… improve.";
  return "🤡 Chaos detected.";
}

function getBadges(stats, streak, pomodoro) {
  let badges = [];

  if (streak >= 3) badges.push("🔥 Streak Starter");
  if (streak >= 7) badges.push("⚡ Consistency Beast");

  if (pomodoro >= 5) badges.push("🍅 Focus Soldier");

  if ((stats.tech + stats.learning) > 120)
    badges.push("🧠 Deep Worker");

  return badges;
}

function getDailyQuests(stats, pomodoro) {
  return [
    {
      text: "Complete 2 Pomodoros",
      done: pomodoro >= 2
    },
    {
      text: "60+ min Deep Work",
      done: (stats.tech + stats.learning) >= 60
    },
    {
      text: "Reel Khan < 90 min",
      done: (stats.social || 0) < 90
    }
  ];
}

function isSameDay(d1, d2) {
  return new Date(d1).toDateString() === new Date(d2).toDateString();
}

async function updateStreak(score) {
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
      streak += 1;
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

// MAIN LOAD
async function load() {
  let data = await chrome.storage.local.get([
    "stats",
    "xp",
    "pomodoro"
  ]);

  let stats = data.stats || {};
  let xp = data.xp || 0;
  let pomodoro = data.pomodoro || 0;

  let categoryTotals = {
    tech: 0,
    learning: 0,
    social: 0,
    docs: 0,
    email: 0
  };

  let table = document.getElementById("table");

  let total = 0;

  for (let site in stats) {
    let t = msToMin(stats[site].time);
    let cat = stats[site].category;

    total += t;

    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += t;
    }

    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${site}</td>
      <td>${t} min</td>
      <td>${getCategoryLabel(cat)}</td>
    `;
    table.appendChild(row);
  }

  let work = categoryTotals.tech + categoryTotals.learning;
  let waste = categoryTotals.social;

  let score = total ? Math.round((work / total) * 100) : 0;

  let level = getLevel(xp);
  let title = getLevelTitle(level);

  let streak = await updateStreak(score);

  let badges = getBadges(categoryTotals, streak, pomodoro);
  let quests = getDailyQuests(categoryTotals, pomodoro);

  // PROFILE
  document.getElementById("profile").innerText = `
Level ${level} — ${title}
🔥 Streak: ${streak} days
XP: ${xp}
`;

  // STATS
  document.getElementById("stats").innerText = `
Score: ${score}
Deep Work: ${work} min
Reel Khan: ${waste} min
`;

  // BADGES
  document.getElementById("badges").innerHTML =
    badges.length ? badges.join("<br>") : "No badges yet";

  // QUESTS
  document.getElementById("quests").innerHTML =
    quests.map(q =>
      `${q.done ? "✅" : "⬜"} ${q.text}`
    ).join("<br>");

  // MOTIVATION
  document.getElementById("motivation").innerText =
    getMotivation(score, streak);

  // STORE FOR SHARE
  window.currentScore = score;
  window.currentBadges = badges;
  window.currentLevel = level;
  window.currentTitle = title;
  window.currentStreak = streak;
}

// SHARE SYSTEM
document.getElementById("shareBtn").onclick = () => {
  drawShareCard({
    level: window.currentLevel,
    title: window.currentTitle,
    score: window.currentScore,
    streak: window.currentStreak,
    badges: window.currentBadges
  });
};

function drawShareCard({ level, title, score, streak, badges }) {
  const canvas = document.getElementById("shareCanvas");
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, 600, 800);

  ctx.fillStyle = "#9b5cff";
  ctx.fillRect(0, 0, 600, 10);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px Arial";
  ctx.fillText("🎮 FocusRPG", 180, 80);

  ctx.font = "22px Arial";
  ctx.fillText(`Level ${level}`, 50, 180);
  ctx.fillText(title, 50, 220);

  ctx.fillText(`Score: ${score}`, 50, 300);
  ctx.fillText(`🔥 ${streak} day streak`, 50, 340);

  ctx.font = "18px Arial";
  ctx.fillText("Badges:", 50, 420);

  badges.slice(0, 3).forEach((b, i) => {
    ctx.fillText(b, 50, 460 + i * 30);
  });

  ctx.font = "italic 20px Arial";
  ctx.fillText("“I showed up today.”", 50, 650);

  downloadImage(canvas);
}

function downloadImage(canvas) {
  const link = document.createElement("a");
  link.download = "focusrpg-report.png";
  link.href = canvas.toDataURL();
  link.click();
}

// PRO BUTTON
document.getElementById("proBtn").onclick = () => {
  window.open("https://yourdomain.com/focusrpg-pro");
};

// ACTIVATE CODE
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
