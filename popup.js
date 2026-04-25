// ⏱️ STATE
let time = 1500;
let interval = null;
let music = null;

// 🎧 STREAMS
const STREAMS = [
  "https://ice1.somafm.com/groovesalad-128-mp3",
  "https://ice2.somafm.com/dronezone-128-mp3",
  "https://ice4.somafm.com/u80s-128-mp3"
];

// 🎯 ELEMENTS
const timer = document.getElementById("timer");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const musicBtn = document.getElementById("music");
const status = document.getElementById("status");
const toggle = document.getElementById("autoToggle");
const channelSelect = document.getElementById("channelSelect");

// ⏱️ UPDATE TIMER UI
function update() {
  let m = Math.floor(time / 60);
  let s = time % 60;
  timer.innerText = `${m}:${s.toString().padStart(2, "0")}`;
}

// ▶️ START TIMER
async function startTimer() {
  if (interval) return;

  interval = setInterval(async () => {
    time--;
    update();

    if (time <= 0) {
      clearInterval(interval);
      interval = null;

      let data = await chrome.storage.local.get(["xp", "pomodoro"]);

      let xp = (data.xp || 0) + 50;
      let pomodoro = (data.pomodoro || 0) + 1;

      await chrome.storage.local.set({ xp, pomodoro });

      status.innerText = "🔥 +50 XP";
    }
  }, 1000);
}

// ⏹️ RESET TIMER
resetBtn.onclick = () => {
  clearInterval(interval);
  interval = null;
  time = 1500;
  update();
};

// ▶️ START BUTTON
startBtn.onclick = () => {
  startTimer();
};

// ⚡ AUTO MODE TOGGLE
toggle.onclick = async () => {
  toggle.classList.toggle("active");

  let isActive = toggle.classList.contains("active");

  await chrome.storage.local.set({ autoMode: isActive });

  if (isActive) {
    startTimer();
  }
};

// 🎧 MUSIC SYSTEM
musicBtn.onclick = async () => {
  let data = await chrome.storage.local.get(["isPro"]);

  if (!data.isPro) {
    alert("🔒 Pro Feature");
    return;
  }

  let idx = channelSelect.value;

  if (!music || music.paused) {
    music = new Audio(STREAMS[idx]);
    music.crossOrigin = "anonymous";
    music.play();
    musicBtn.innerText = "⏸ Pause";
  } else {
    music.pause();
    musicBtn.innerText = "▶ Play";
  }
};

// 🚀 INIT
async function init() {
  let data = await chrome.storage.local.get(["autoMode"]);

  if (data.autoMode) {
    toggle.classList.add("active");
    startTimer();
  }

  update();
}

init();
