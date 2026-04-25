
// ⏱️ TIMER
let time = 1500;
let interval = null;

const timer = document.getElementById("timer");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const status = document.getElementById("status");
const soundToggle = document.getElementById("soundToggle");

// 🔊 SOUND (optional)
let levelSound = new Audio("assets/levelup.mp3");

// 🎧 MUSIC SYSTEM
let music = null;
let currentStreamIndex = 0;

const STREAMS = [
  {
    name: "🌿 Ambient",
    url: "https://ice1.somafm.com/groovesalad-128-mp3"
  },
  {
    name: "🧘 Deep Focus",
    url: "https://ice2.somafm.com/dronezone-128-mp3"
  },
  {
    name: "🎶 Chill",
    url: "https://ice4.somafm.com/u80s-128-mp3"
  }
];

// ⏱️ TIMER DISPLAY
function updateDisplay() {
  let m = Math.floor(time / 60);
  let s = time % 60;
  timer.innerText = `${m}:${s.toString().padStart(2, "0")}`;
}

// ▶️ START TIMER
startBtn.onclick = () => {
  if (interval) return;

  interval = setInterval(async () => {
    time--;
    updateDisplay();

    if (time <= 0) {
      clearInterval(interval);
      interval = null;

      let data = await chrome.storage.local.get(["xp", "pomodoro"]);
      let xp = (data.xp || 0) + 50;
      let pomodoro = (data.pomodoro || 0) + 1;

      await chrome.storage.local.set({ xp, pomodoro });

      let settings = await chrome.storage.local.get(["sound"]);
      if (settings.sound) levelSound.play();

      status.innerText = "🔥 Session Complete! +50 XP";
    }
  }, 1000);
};

// 🔁 RESET TIMER
resetBtn.onclick = () => {
  clearInterval(interval);
  interval = null;
  time = 1500;
  updateDisplay();
};

// 🔊 SOUND TOGGLE
soundToggle.onchange = async (e) => {
  await chrome.storage.local.set({ sound: e.target.checked });
};

// 🔊 LOAD SETTINGS
async function loadSettings() {
  let data = await chrome.storage.local.get(["sound"]);
  soundToggle.checked = data.sound || false;
}

// 🎧 PLAY STREAM
async function playStream(index = 0) {
  if (index >= STREAMS.length) {
    alert("⚠️ All streams failed.");
    return;
  }

  // stop previous
  if (music) {
    music.pause();
    music.src = "";
    music = null;
  }

  const stream = STREAMS[index];

  const audio = new Audio(stream.url);
  audio.crossOrigin = "anonymous";

  audio.onerror = () => {
    playStream(index + 1);
  };

  try {
    await audio.play();
    music = audio;
    currentStreamIndex = index;

    // update button label
    document.getElementById("music").innerText = `⏸ ${stream.name}`;
  } catch {
    playStream(index + 1);
  }
}

// 🎮 MUSIC BUTTON
document.getElementById("music").onclick = async () => {
  let data = await chrome.storage.local.get(["isPro"]);

  if (!data.isPro) {
    alert("🔒 Pro Feature");
    return;
  }

  let selectedIndex = parseInt(
    document.getElementById("channelSelect").value
  );

  // first play
  if (!music) {
    playStream(selectedIndex);
    return;
  }

  // if switching channel
  if (selectedIndex !== currentStreamIndex) {
    playStream(selectedIndex);
    return;
  }

  // pause/resume
  if (music.paused) {
    try {
      await music.play();
      document.getElementById("music").innerText =
        `⏸ ${STREAMS[currentStreamIndex].name}`;
    } catch {
      playStream(currentStreamIndex);
    }
  } else {
    music.pause();
    document.getElementById("music").innerText = "▶ Play";
  }
};

// INIT
updateDisplay();
loadSettings();
