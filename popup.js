let time = 1500;
let interval;
let music = null;

const STREAMS = [
  "https://ice1.somafm.com/groovesalad-128-mp3",
  "https://ice2.somafm.com/dronezone-128-mp3"
];

function update(){
  let m=Math.floor(time/60);
  let s=time%60;
  timer.innerText=`${m}:${s.toString().padStart(2,"0")}`;
}

start.onclick=()=>{
 if(interval)return;
 interval=setInterval(async()=>{
  time--;
  update();

  if(time<=0){
    clearInterval(interval);
    interval=null;

    let d=await chrome.storage.local.get(["xp","pomodoro"]);
    chrome.storage.local.set({
      xp:(d.xp||0)+50,
      pomodoro:(d.pomodoro||0)+1
    });

    status.innerText="🔥 +50 XP";
  }
 },1000);
};

reset.onclick=()=>{
 clearInterval(interval);
 interval=null;
 time=1500;
 update();
};

music.onclick=async()=>{
 let d=await chrome.storage.local.get(["isPro"]);
 if(!d.isPro)return alert("🔒 Pro");

 let idx=document.getElementById("channelSelect").value;

 if(!music){
   music=new Audio(STREAMS[idx]);
   music.play();
 }else{
   music.paused?music.play():music.pause();
 }
};

update();
