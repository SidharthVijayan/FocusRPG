let time = 1500;
let interval;

let sound = new Audio("assets/levelup.mp3");

// Hybrid music: fallback + radio
let localMusic = new Audio("assets/focus.mp3");
localMusic.loop = true;

let radioStream = "https://ice1.somafm.com/groovesalad-128-mp3";
let streamMusic = new Audio(radioStream);

let usingStream = false;

function update() {
  let m = Math.floor(time / 60);
  let s = time % 60;
  timer.innerText = `${m}:${s.toString().padStart(2,"0")}`;
}

start.onclick = () => {
  if (interval) return;

  interval = setInterval(async () => {
    time--;
    update();

    if (time <= 0) {
      clearInterval(interval);

      let data = await chrome.storage.local.get(["xp","pomodoro"]);
      let xp = (data.xp||0)+50;
      let pomodoro = (data.pomodoro||0)+1;

      await chrome.storage.local.set({ xp, pomodoro });

      let s = await chrome.storage.local.get(["sound"]);
      if (s.sound) sound.play();

      status.innerText = "🔥 +50 XP";
    }
  },1000);
};

reset.onclick = () => {
  clearInterval(interval);
  time=1500;
  update();
};

music.onclick = async () => {
  let data = await chrome.storage.local.get(["isPro"]);
  if (!data.isPro) return alert("🔒 Pro Feature");

  let current = usingStream ? streamMusic : localMusic;

  if (current.paused) {
    try {
      await current.play();
    } catch {
      // fallback if stream fails
      usingStream = false;
      localMusic.play();
    }
  } else {
    current.pause();
  }
};

update();
