/* Chapter One: The Treatment. Story, missions, readable characters and combat tells. */
'use strict';
let floating=[];
const originalStartRun=startRun;
startRun=function(floor=0,clean=false){originalStartRun(floor,clean);if(floor===0&&!save.story.intro)dialogue('CHAPTER ONE / THE TREATMENT',[
 ['You','Cold concrete. A number stitched into your shirt: 017. Your name will not come.'],
 ['The loudspeaker','“Prisoner 017. Remain where you are.” The door opens. Boots scrape the floor.'],
 ['A scratch in the wall','CHECK THE MATTRESS. Cross the cell and investigate the bunk. Move with WASD / arrows or drag on the arena. E or the Investigate button examines nearby clues. Dodge marked strikes with Space or DODGE.']
],()=>{save.story.intro=true;persist();play();});};
function dialogue(title,pages,after){let i=0;state='story';function render(){const [speaker,line]=pages[i];panel(`<div class="story-layout"><div class="story-number">017<span>BLACKSTONE<br>PENITENTIARY</span></div><section><div class="eyebrow">${title} · ${i+1}/${pages.length}</div><h2>${speaker}</h2><p class="story-line">${line}</p><button class="primary" id="story-next">${i===pages.length-1?'Back to the cell →':'Continue →'}</button><p><small>The action is paused while you read.</small></p></section></div>`);action('story-next',()=>{i++;if(i<pages.length)render();else after();});}render();}
function lockedVault(){state='vault';panel(header('An empty hiding place')+'<p>You feel a seam behind the wall. Something belongs here, but you cannot remember what. Find the man behind the vent.</p>');action('back',cellMenu);}
let objectiveExpanded=false,objectiveKey='';
function updateObjective(){if(!run||state!=='playing')return;const box=$('missionHud');box.hidden=false;const m=run.floor===0?R.mission(save):{id:'block',title:'Escape the block',detail:'Defeat the guards and learn the boss’s openings.'},locked=m.minWave&&run.wave<m.minWave,key=m.id+':'+locked+':'+objectiveExpanded;if(key!==objectiveKey){objectiveKey=key;box.innerHTML=`<button id="objectiveToggle" aria-expanded="${objectiveExpanded}"><small>LEAD</small> ${m.title} <span>${objectiveExpanded?'▴':'▾'}</span></button>${objectiveExpanded?`<p>${locked?'The laundry is watched. Survive until wave '+m.minWave+'.':m.detail}</p>`:''}`;action('objectiveToggle',()=>{objectiveExpanded=!objectiveExpanded;objectiveKey='';updateObjective();});}const near=run.floor===0&&distance(run.p,m)<85,button=$('interactBtn');button.hidden=!near||locked||['door','escape','block'].includes(m.id);button.textContent=(m.label||'Investigate')+' · E';updateExtractionButton();}
function interact(){if(state!=='playing'||!run||run.floor!==0)return;const m=R.mission(save);if(distance(run.p,m)>85||(m.minWave&&run.wave<m.minWave))return;
 if(m.id==='mattress'){save.story.mattress=true;persist();dialogue('EVIDENCE FOUND / YOUR HANDWRITING',[
 ['Under the mattress','“If you’re reading this again, the treatment worked. Find the man behind the vent.”'],
 ['You','You recognize the slant of the letters before you recognize your own hands. A tapping sound comes from the northeast wall.']
 ],()=>{play();note('Journal unlocked · follow the tapping',3);});}
 else if(m.id==='vent'){save.story.vent=true;persist();dialogue('CONTACT / THE MAN BEHIND THE VENT',[
 ['A voice in the dark','“Seventeen? You found your note. Good. You told me not to give you your name. Not yet.”'],
 ['The voice','“You hid a package behind the laundry. Wait for the third lockdown rotation. They leave it unwatched.”'],
 ['The voice','“Before they took you last time, you kept studying the old masonry. You never told me why.”']
 ],()=>{play();note('Library unlocked · recover your hidden package',3);});}
 else if(m.id==='cache'){save.story.cache=true;run.loot+=15;if(!save.vault.includes('haste')&&save.vault.length<R.vaultCapacity(save))save.vault.push('haste');R.applyPerk(run.p,'haste',save);run.perks.push('haste');persist();dialogue('MISSION COMPLETE / A LITTLE INSURANCE',[
 ['Your hidden package','A folded exercise routine, fifteen pieces of Contraband, and a compartment built to survive a search. You prepared this before.'],
 ['The voice','“Hands remember what the mind forgets. Keep that routine in your hiding place. Next time they take you, you won’t lose it.”'],
 ['Perk Vault unlocked','Quick Hands is stored for future attempts and applied now. The voice adds: “Watch the guard when he gets angry. He’s careful until he isn’t.”']
 ],()=>{play();note('Perk Vault unlocked · Quick Hands stored',4);});}
}
$('interactBtn').addEventListener('click',interact);
function breachDoor(z){if(run.floor!==0||!run.boss||run.boss.hp/run.boss.maxHp>=.5||z.source!=='baton'||!save.story.cache||save.story.door||distance(z,{x:560,y:65})>z.r+35)return;save.story.door=true;persist();note('THE NORTH DOOR BREAKS · defeat the guard to escape',5);floatText(560,105,'SERVICE PASSAGE OPEN','#f3d593');burst(560,65,'#d3c5a2',24);}
function updateChapter(dt){updateObjective();updateExtraction(dt);if(state!=='playing')return;run.spotlight-=dt;if(run.floor===0&&run.spotlight<=0&&!run.boss){zone(run.p.x,run.p.y,82,1.35,24);run.zones[run.zones.length-1].source='spotlight';run.spotlight=7.5;note('WATCHLIGHT · leave the marked circle',1.5);}floating=floating.slice(-35);}
journal=function(){state='journal';const m=R.mission(save);panel(header('Evidence / Journal')+`<span class="eyebrow">Chapter One / The Treatment</span><h3>Who is Prisoner 017?</h3><p>${save.story.mattress?'Your own handwriting has survived a treatment your memory did not. Someone has been helping you. Someone else keeps taking you back.':'You woke up without a name. Someone scratched CHECK THE MATTRESS into the wall.'}</p><div class="journal-entry"><h3>${save.story.mattress?'✓ Your handwriting':'○ A message under the mattress'}</h3><p>${save.story.mattress?'“If you’re reading this again, the treatment worked. Find the man behind the vent.”':'Cross the cell and investigate the bunk.'}</p></div><div class="journal-entry"><h3>${save.story.vent?'✓ A voice behind the vent':'○ Someone is tapping'}</h3><p>${save.story.vent?'He knows you. He says you asked him to keep your name secret. The Library is unlocked.':'Follow the tapping to the northeast wall.'}</p></div><div class="journal-entry"><h3>${save.story.cache?'✓ A little insurance':'○ Your hidden package'}</h3><p>${save.story.cache?'You built a hiding place behind the laundry. The Perk Vault is unlocked.':'Find the voice, then reach the laundry during wave 3 or later.'}</p></div><div class="journal-entry"><h3>${save.story.door?'✓ The broken north door':save.story.legacyGate?'✓ A passage you already discovered':'○ Another way out'}</h3><p>${save.story.door?'The Baton Guard broke the door. Defeat him to use the passage.':save.story.legacyGate?'Your earlier gate discovery is preserved. You can still investigate the new clues.':'Old stone. A guard who loses his temper. Your earlier self noticed something here.'}</p></div><p><b>Current lead:</b> ${m.detail}</p><p>Twin throws: ${save.lessons.damage&&save.lessons.health?'unlocked':'find Sharpened Edge and Tough Skin'}. Stronger bandages: ${save.lessons.heal?'unlocked':'find Bandage Wrap'}.</p><div class="route">${R.floors.map((f,i)=>`<span class="${save.clears[i]?'done':''}">${i+1}. ${i<=save.bestFloor?f.name:'???'}${save.clears[i]?' ✓':''}</span>`).join('')}</div><p>Solitary clears: ${save.clears[0]} / 20 toward the Intake starting point.</p>`);action('back',menu);};
function updateGuard(e,dt){const p=run.p,a=Math.atan2(p.y-e.y,p.x-e.x),d=distance(p,e);e.flash=Math.max(0,(e.flash||0)-dt);e.cooldown-=dt;e.walk=(e.walk||0)+dt*8;
 if(e.type==='charger'){
  if(e.mode==='aim'){e.timer-=dt;if(e.timer<=0){e.mode='charge';e.timer=.55;e.vx=Math.cos(e.aim)*430;e.vy=Math.sin(e.aim)*430;}}
  else if(e.mode==='charge'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.timer-=dt;if(e.timer<=0){e.mode='recover';e.timer=1.1;e.cooldown=2.5;}}
  else if(e.mode==='recover'){e.timer-=dt;if(e.timer<=0)e.mode='chase';}
  else if(e.cooldown<=0&&d<420){e.mode='aim';e.timer=.85;e.aim=a;}
  else{e.x+=Math.cos(a)*108*dt;e.y+=Math.sin(a)*108*dt;}
 }else if(e.type==='ranged'){
  if(e.mode==='aim'){e.timer-=dt;if(e.timer<=0){fire(e.x,e.y,e.tx,e.ty,330,18,true);e.mode='chase';e.cooldown=2.5;}}
  else if(e.cooldown<=0&&d<650){e.mode='aim';e.timer=.9;e.tx=p.x;e.ty=p.y;}
  else if(d>300){e.x+=Math.cos(a)*82*dt;e.y+=Math.sin(a)*82*dt;}
  else if(d<170){e.x-=Math.cos(a)*65*dt;e.y-=Math.sin(a)*65*dt;}
 }else{
  // Flank rather than funnel every guard down the same firing line.
  const flank=e.type==='runner'?Math.sin(run.time*1.7+e.x*.01)*.5:0;
  e.x+=Math.cos(a+flank)*e.speed*dt;e.y+=Math.sin(a+flank)*e.speed*dt;
 }
 e.x=Math.max(28,Math.min(WORLD.w-28,e.x));e.y=Math.max(35,Math.min(WORLD.h-28,e.y));if(distance(p,e)<p.r+e.r)hurt(e.type==='charger'&&e.mode==='charge'?24:e.damage);
}
function drawGuardTell(e){if(e.mode!=='aim')return;ctx.save();ctx.strokeStyle=e.type==='ranged'?'#f0dca0':'#f0b19a';ctx.lineWidth=e.type==='ranged'?2:9;ctx.setLineDash(e.type==='ranged'?[10,7]:[16,9]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.type==='ranged'?e.tx:e.x+Math.cos(e.aim)*370,e.type==='ranged'?e.ty:e.y+Math.sin(e.aim)*370);ctx.stroke();ctx.setLineDash([]);circle(e.x,e.y-e.r-20,5,'#ffe0a6');ctx.restore();}
function floatText(x,y,text,color){floating.push({x,y,text,color,life:.85});}
function drawFloating(dt){for(const f of floating){if(state==='playing'){f.life-=dt;f.y-=25*dt;}ctx.globalAlpha=Math.min(1,Math.max(0,f.life*2));ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillStyle='#0a0e0b';ctx.fillText(f.text,f.x+1,f.y+2);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;floating=floating.filter(f=>f.life>0);}
function roundBox(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}}
function drawSupply(d){ctx.save();ctx.translate(d.x,d.y);const bob=Math.sin((run.time+d.x)*3)*1.5;ctx.translate(0,bob);circle(0,3,12,'#0b130f88');if(d.kind==='xp'){ctx.fillStyle='#7fcbd4';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(8,0);ctx.lineTo(0,10);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#d5f5e6';ctx.stroke();ctx.fillStyle='#e8fff5';ctx.fillRect(-1,-5,2,8);}else if(d.kind==='heal'){roundBox(-10,-8,20,16,3,'#e2e7d8','#f9fff0');ctx.fillStyle='#324d3f';ctx.fillRect(-2,-5,4,10);ctx.fillRect(-5,-2,10,4);}else{roundBox(-9,-6,18,12,2,'#c9b377','#f7e5b3');ctx.fillStyle='#4b4932';ctx.fillRect(-5,-3,10,1);ctx.fillRect(-5,1,7,1);}ctx.restore();}
function drawVectorPerson(e,isPlayer,boss=false){
 const unit=(e.r||16)/17,walk=isPlayer?(e.moving?Math.sin(e.walk)*5:0):e.mode==='aim'||e.mode==='recover'?0:Math.sin(e.walk||0)*4;
 ctx.save();ctx.translate(e.x,e.y);ctx.scale(unit,unit);ctx.globalAlpha=isPlayer&&e.invuln>0?.65:1;
 ctx.fillStyle='#080d0a80';ctx.beginPath();ctx.ellipse(1,16,23,10,0,0,Math.PI*2);ctx.fill();
 const orange='#ca7135',dark=isPlayer?'#98552e':'#273b39',uniform=e.flash>0?'#fff0c9':isPlayer?'#e39a50':boss?'#625f50':e.type==='heavy'?'#596977':e.type==='ranged'?'#436f73':'#49635b';
 // Boots and separate trouser legs: a readable walking silhouette.
 roundBox(-13,-1+walk,10,23,3,dark,'#18241e');roundBox(3,-1-walk,10,23,3,dark,'#18241e');roundBox(-14,16+walk,12,8,3,'#161d19');roundBox(2,16-walk,12,8,3,'#161d19');
 // Bent sleeves, fingers and shoulders.
 const arm=isPlayer&&e.throwAnim>0?-12:walk*.5;
 roundBox(-23,-18-arm,9,24,4,uniform,'#22352a');roundBox(14,-18+arm,9,24,4,uniform,'#22352a');circle(-18,5-arm,4.8,'#bd9169');circle(18,5+arm,4.8,'#d4ab80');
 roundBox(-16,-24,32,33,7,uniform,'#16271d');
 ctx.fillStyle=isPlayer?orange:'#263f3a';ctx.fillRect(-13,-10,26,13);ctx.fillStyle='#273629';ctx.fillRect(-15,5,30,4);ctx.fillStyle='#e7c27d';ctx.fillRect(-3,5,6,4);
 ctx.strokeStyle=isPlayer?'#eac28a':'#97aaa0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(0,4);ctx.stroke();
 if(isPlayer){roundBox(3,-17,10,7,1,'#f4d6a0');ctx.fillStyle='#452b1c';ctx.font='bold 5px monospace';ctx.textAlign='center';ctx.fillText('017',8,-12);ctx.fillStyle='#f3bf79';ctx.fillRect(-12,-18,6,2);}else{roundBox(-10,-17,20,17,3,'#30453f','#758a7c');ctx.fillStyle='#e5c47f';ctx.beginPath();ctx.moveTo(5,-15);ctx.lineTo(10,-12);ctx.lineTo(8,-6);ctx.lineTo(3,-7);ctx.closePath();ctx.fill();}
 // Neck, ears, face, brow, nose and stubble.
 roundBox(-5,-32,10,11,3,'#b78e66');circle(-10,-36,3.5,'#b78e66');circle(10,-36,3.5,'#c79e74');roundBox(-10,-46,20,24,8,'#d7b088','#714f37');
 ctx.fillStyle=isPlayer?'#3d3328':'#182f2b';ctx.beginPath();ctx.ellipse(0,-44,10,6,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-10,-43,3,7);ctx.fillRect(7,-43,3,7);
 ctx.fillStyle='#283027';ctx.fillRect(-6,-37,4,2);ctx.fillRect(3,-37,4,2);ctx.fillStyle='#bd8e62';ctx.fillRect(0,-36,2,6);ctx.strokeStyle='#7a553b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-4,-28);ctx.lineTo(4,-28);ctx.stroke();
 if(isPlayer){ctx.strokeStyle='#755137';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-30,7,0,Math.PI);ctx.stroke();}else{roundBox(-12,-48,24,7,3,'#213c35','#8a9e90');ctx.fillStyle='#c4b37b';ctx.fillRect(-3,-47,6,4);}
 // Weapon is part of the silhouette, not just a projectile dot.
 ctx.save();ctx.translate(20,4+arm);ctx.rotate(isPlayer?-.5:.25);if(isPlayer&&e.weapon==='shiv'){roundBox(-2,-15,4,12,1,'#dbe3d7');roundBox(-3,-3,6,9,2,'#4a3828');ctx.fillStyle='#f4f1d4';ctx.beginPath();ctx.moveTo(-2,-15);ctx.lineTo(0,-22);ctx.lineTo(2,-15);ctx.fill();}else if(e.type==='ranged'){roundBox(-3,-25,6,29,2,'#152622','#8aada0');roundBox(-6,-14,12,7,1,'#243e37');}else{roundBox(-3,-28,6,34,2,'#202b26','#728477');roundBox(-5,-4,10,4,1,'#857457');}ctx.restore();
 if(e.type==='charger'){ctx.strokeStyle='#f1c1a6';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-11,-10);ctx.lineTo(-7,-6);ctx.lineTo(-3,-10);ctx.stroke();}if(e.type==='heavy'||boss){ctx.strokeStyle='#aeb7ab';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,-18);ctx.lineTo(-21,-22);ctx.moveTo(15,-18);ctx.lineTo(21,-22);ctx.stroke();}
 ctx.restore();if(!isPlayer&&e.hp<e.maxHp){roundBox(e.x-e.r,e.y-e.r*3.2,e.r*2,4,1,'#151d18');ctx.fillStyle='#dec68e';ctx.fillRect(e.x-e.r,e.y-e.r*3.2,e.r*2*Math.max(0,e.hp/e.maxHp),4);}if(isPlayer){ctx.strokeStyle='#ecd59b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+18,24,10,0,0,Math.PI*2);ctx.stroke();}
}
function drawChapterRoom(){if(run.floor!==0)return;
 // Objects anchor missions to physical places in the prison.
 roundBox(80,535,145,125,8,'#293b34','#6e7e68');roundBox(94,550,115,91,7,'#758174','#a4ac94');roundBox(98,551,27,82,5,'#a7ad93');ctx.strokeStyle='#4c6152';ctx.lineWidth=4;for(let y=560;y<640;y+=14){ctx.beginPath();ctx.moveTo(130,y);ctx.lineTo(200,y);ctx.stroke();}ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillStyle='#e2d3aa';ctx.fillText('CHECK THE MATTRESS',157,520);
 roundBox(1001,116,76,90,4,'#101e19','#697e6c');ctx.strokeStyle='#8b9781';ctx.lineWidth=4;for(let y=130;y<195;y+=12){ctx.beginPath();ctx.moveTo(1008,y);ctx.lineTo(1070,y);ctx.stroke();}
 roundBox(887,619,104,87,5,'#3b4941','#72816d');roundBox(900,633,80,60,6,'#a39f88');ctx.strokeStyle='#c0b9a0';ctx.beginPath();ctx.moveTo(910,645);ctx.lineTo(963,674);ctx.moveTo(958,640);ctx.lineTo(918,682);ctx.stroke();
 roundBox(499,22,122,67,3,save.story.door?'#0a1511':'#3f4b40','#c2b184');ctx.strokeStyle=save.story.door?'#d9c897':'#a8a48b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(548,30);ctx.lineTo(561,45);ctx.lineTo(550,58);ctx.lineTo(569,78);ctx.stroke();if(save.story.door){ctx.fillStyle='#cbb87d';ctx.font='bold 13px monospace';ctx.fillText('PASSAGE',560,64);}
 const m=R.mission(save);if(m.id!=='door'){ctx.strokeStyle='#f4d694';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(m.x,m.y,48+Math.sin(run.time*3)*3,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#f0d8a6';ctx.font='bold 12px system-ui';ctx.fillText(m.id==='escape'?'WAY OUT':m.minWave&&run.wave<m.minWave?'WAVE 3':'INVESTIGATE',m.x,m.y+62);}for(const scar of run.scars){ctx.strokeStyle='#8f9277';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(scar.x-18,scar.y-8);ctx.lineTo(scar.x,scar.y+6);ctx.lineTo(scar.x+14,scar.y-15);ctx.moveTo(scar.x,scar.y+6);ctx.lineTo(scar.x+9,scar.y+22);ctx.stroke();}
 // The next lead remains visible even when the phone camera crops its location.
 if(camera.w<700&&m.id!=='door'){const p=run.p,a=Math.atan2(m.y-p.y,m.x-p.x);if(distance(p,m)>160){ctx.save();ctx.translate(p.x+Math.cos(a)*76,p.y+Math.sin(a)*76);ctx.rotate(a);ctx.fillStyle='#f6db9a';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-7,-6);ctx.lineTo(-7,6);ctx.closePath();ctx.fill();ctx.restore();}}
}
menu();
