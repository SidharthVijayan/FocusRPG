function msToMin(ms){return Math.round(ms/60000);}
function getLevel(xp){return Math.floor(Math.sqrt(xp/50));}

async function load(){

 let d=await chrome.storage.local.get(["stats","xp","streak"]);
 let stats=d.stats||{};
 let xp=d.xp||0;
 let streak=d.streak||1;

 let table=document.getElementById("table");
 table.innerHTML="";

 let total=0;

 for(let s in stats){
  let t=msToMin(stats[s].time);
  total+=t;

  let row=document.createElement("tr");
  row.innerHTML=`<td>${s}</td><td>${t}m</td><td>${getCategoryLabel(stats[s].category)}</td>`;
  table.appendChild(row);
 }

 let level=getLevel(xp);

 document.getElementById("levelBox").innerText=`Level ${level}`;
 document.getElementById("xpBox").innerText=`XP ${xp}`;
 document.getElementById("streakMini").innerText=`🔥 ${streak}`;

 document.getElementById("avatar").innerText="⚔️ Focus Warrior";
 document.getElementById("motivation").innerText="🔥 Stay sharp";

 let xpProgress=(xp%500)/500*100;
 document.getElementById("xpFill").style.width=xpProgress+"%";

 document.getElementById("stats").innerText=`Total ${total}m`;

 document.getElementById("badges").innerHTML="🔥 Focus Beast";
 document.getElementById("quests").innerHTML="⬜ Do 2 Pomodoros";

 document.getElementById("streakBox").innerHTML=`
  🔥<div class="streak-number">${streak}</div>DAYS
 `;

 let prevLevel=localStorage.getItem("prevLevel");

 if(prevLevel && level>prevLevel){
   triggerLevelUp(level);
 }

 localStorage.setItem("prevLevel",level);
}

function triggerLevelUp(level){
 let popup=document.getElementById("levelUpPopup");
 document.getElementById("levelText").innerText=`Level ${level}`;

 popup.classList.remove("hidden");

 setTimeout(()=>popup.classList.add("hidden"),2000);

 playBeep();
 startConfetti();
}

function playBeep(){
 let ctx=new AudioContext();
 let osc=ctx.createOscillator();
 osc.frequency.value=600;
 osc.connect(ctx.destination);
 osc.start();
 setTimeout(()=>osc.stop(),200);
}

function startConfetti(){
 let canvas=document.getElementById("confettiCanvas");
 let ctx=canvas.getContext("2d");

 canvas.width=window.innerWidth;
 canvas.height=window.innerHeight;

 let pieces=Array.from({length:80},()=>({
  x:Math.random()*canvas.width,
  y:Math.random()*canvas.height
 }));

 let interval=setInterval(()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);

  pieces.forEach(p=>{
   ctx.fillRect(p.x,p.y,5,5);
   p.y+=3;
  });

 },20);

 setTimeout(()=>clearInterval(interval),2000);
}

load();
