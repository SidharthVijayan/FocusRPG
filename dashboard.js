function msToMin(ms){return Math.round(ms/60000);}

function getLevel(xp){return Math.floor(Math.sqrt(xp/50));}

function getPersonality(stats){
 let work=stats.tech+stats.learning;
 let social=stats.social;

 if(social>work*2)return {title:"🎬 Reel Khan",desc:"Scrolling is your cardio"};
 if(work>120)return {title:"🧠 Deep Work Beast",desc:"Elite focus"};
 if(work>social)return {title:"⚔️ Focus Warrior",desc:"Momentum building"};
 return {title:"🙂 Wanderer",desc:"Finding rhythm"};
}

async function load(){

 let d=await chrome.storage.local.get(["stats","xp","streak","pomodoro"]);
 let stats=d.stats||{};
 let xp=d.xp||0;
 let streak=d.streak||1;
 let pomodoro=d.pomodoro||0;

 let totals={tech:0,learning:0,social:0};
 let table=document.getElementById("table");
 table.innerHTML="";

 let total=0;

 for(let s in stats){
  let t=msToMin(stats[s].time);
  total+=t;

  if(totals[stats[s].category]!=undefined)
    totals[stats[s].category]+=t;

  let row=document.createElement("tr");
  row.innerHTML=`<td>${s}</td><td>${t}m</td><td>${getCategoryLabel(stats[s].category)}</td>`;
  table.appendChild(row);
 }

 let work=totals.tech+totals.learning;
 let score= total?Math.round(work/total*100):0;

 let level=getLevel(xp);
 let personality=getPersonality(totals);

 // TOP BAR
 document.getElementById("levelBox").innerText=`Level ${level}`;
 document.getElementById("xpBox").innerText=`XP ${xp}`;
 document.getElementById("streakMini").innerText=`🔥 ${streak}`;

 // HERO
 document.getElementById("avatar").innerHTML=`${personality.title}<br><span style="color:#aaa">${personality.desc}</span>`;
 document.getElementById("motivation").innerText= score>70?"🔥 Beast Mode":"⚔️ Keep Going";

 // XP BAR
 let xpProgress=(xp%500)/500*100;
 document.getElementById("xpFill").style.width=xpProgress+"%";

 // STATS
 document.getElementById("stats").innerText=`Score ${score}\nWork ${work}m`;

 // BADGES
 document.getElementById("badges").innerHTML=
  score>70?"🔥 Focus Beast":"🙂 Try harder";

 // QUESTS
 document.getElementById("quests").innerHTML=
  pomodoro>=2?"✅ 2 Pomodoros":"⬜ Do 2 Pomodoros";

 // STREAK
 document.getElementById("streakBox").innerHTML=`
  🔥<div class="streak-number">${streak}</div>DAYS
 `;
}

load();
