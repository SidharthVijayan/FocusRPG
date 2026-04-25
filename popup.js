let time = 1500;
let interval;
let music;

const STREAMS = [
  "https://ice1.somafm.com/groovesalad-128-mp3",
  "https://ice2.somafm.com/dronezone-128-mp3"
];

function update() {
  let m = Math.floor(time/60);
  let s = time%60;
  timer.innerText = `${m}:${s}`;
}

start.onclick = () => {
  if (interval) return;

  interval = setInterval(async () => {
    time--;
    update();

    if (time<=0) {
      clearInterval(interval);

      let d = await chrome.storage.local.get(["xp","pomodoro"]);
      let xp=(d.xp||0)+50;
      let pomodoro=(d.pomodoro||0)+1;

      chrome.storage.local.set({xp,pomodoro});

      status.innerText="🔥 +50 XP";
    }
  },1000);
};

reset.onclick = () => {
  clearInterval(interval);
  time=1500;
  update();
};

music.onclick = async () => {
  let d = await chrome.storage.local.get(["isPro"]);
  if (!d.isPro) return alert("🔒 Pro");

  music = new Audio(STREAMS[0]);
  music.play();
};

update();
