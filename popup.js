// 🎧 MULTI-STREAM RADIO SYSTEM (NO LOCAL FILES)

let music = null;
let currentStreamIndex = 0;

// Multiple fallback streams
const STREAMS = [
  "https://ice1.somafm.com/groovesalad-128-mp3",   // ambient
  "https://ice2.somafm.com/dronezone-128-mp3",     // deep focus
  "https://ice4.somafm.com/u80s-128-mp3"           // chill alt
];

async function playStream(index = 0) {
  if (index >= STREAMS.length) {
    alert("⚠️ All streams failed. Check connection.");
    return;
  }

  console.log("Trying stream:", STREAMS[index]);

  music = new Audio(STREAMS[index]);
  music.crossOrigin = "anonymous";

  music.onerror = () => {
    console.log("Stream failed → trying next");
    playStream(index + 1);
  };

  try {
    await music.play();
    currentStreamIndex = index;
  } catch (e) {
    console.log("Playback error → trying next");
    playStream(index + 1);
  }
}

// 🎮 Button logic
document.getElementById("music").onclick = async () => {
  let data = await chrome.storage.local.get(["isPro"]);

  if (!data.isPro) {
    alert("🔒 Pro Feature");
    return;
  }

  if (!music || music.paused) {
    playStream(0);
  } else {
    music.pause();
  }
};
