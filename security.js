/* Security, extraction, phased combat and illustrated actors. */
'use strict';
const ACTOR_RECTS=[[[121, 20, 119, 212], [299, 20, 115, 212], [473, 20, 118, 212], [650, 20, 115, 212]], [[122, 235, 117, 218], [300, 235, 114, 218], [475, 235, 115, 218], [651, 235, 114, 218]], [[117, 451, 129, 202], [301, 451, 127, 202], [468, 451, 130, 202], [653, 451, 127, 202]], [[108, 658, 140, 203], [288, 658, 128, 203], [464, 658, 137, 203], [639, 658, 130, 203]], [[103, 864, 151, 226], [285, 864, 144, 226], [458, 864, 149, 226], [638, 864, 145, 226]], [[105, 1088, 150, 233], [285, 1088, 140, 233], [459, 1088, 149, 233], [638, 1088, 140, 233]], [[115, 1313, 140, 217], [295, 1313, 145, 217], [470, 1313, 141, 217], [652, 1313, 145, 217]], [[95, 1527, 158, 218], [282, 1527, 147, 218], [449, 1527, 159, 218], [635, 1527, 150, 218]]];
const EXTRACTION={x:55,y:380};
let retreatHeld=false;
const basicResetInput=resetInput;resetInput=function(){basicResetInput();retreatHeld=false;};
const actorSheet=typeof Image==='undefined'?null:new Image();
if(actorSheet)actorSheet.src='actors.png?v=security2';
function updateExtractionButton(){const button=$('retreatBtn');button.hidden=state!=='playing'||!run||distance(run.p,EXTRACTION)>80;if(!button.hidden)button.textContent=run.recentHit>0?'INTERRUPTED · STAY CLEAR':run.extractProgress>0?`RETURNING ${run.extractProgress.toFixed(1)} / 3s`:`HOLD TO RETURN · BANK ${run.loot}`;}
function updateExtraction(dt){if(distance(run.p,EXTRACTION)<=80&&(retreatHeld||keys.e)&&run.recentHit<=0){run.extractProgress+=dt;if(run.extractProgress>=3){retreatHeld=false;finish('You slip into your cell before the patrol closes in.',false,'retreat');return;}}else run.extractProgress=0;updateExtractionButton();}
const returnButton=$('retreatBtn');
returnButton.addEventListener('pointerdown',e=>{e.preventDefault();retreatHeld=true;});
for(const event of ['pointerup','pointercancel','lostpointercapture'])returnButton.addEventListener(event,()=>retreatHeld=false);
returnButton.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();retreatHeld=true;}});
returnButton.addEventListener('keyup',()=>retreatHeld=false);
addEventListener('pointerup',()=>retreatHeld=false);addEventListener('blur',()=>retreatHeld=false);
function drawExtractionDoor(){roundBox(20,320,65,120,4,'#1b2e25','#7e8e78');ctx.strokeStyle='#8b9a7f';ctx.lineWidth=3;for(let x=28;x<=75;x+=12){ctx.beginPath();ctx.moveTo(x,328);ctx.lineTo(x,420);ctx.stroke();}ctx.fillStyle='#d8d2ad';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('CELL 017',53,309);ctx.fillText('RETURN',55,458);if(run.extractProgress>0){ctx.strokeStyle='#eed097';ctx.lineWidth=5;ctx.beginPath();ctx.arc(55,380,54,-Math.PI/2,-Math.PI/2+Math.PI*2*run.extractProgress/3);ctx.stroke();}}
const mobileGuardUpdate=updateGuard;
updateGuard=function(e,dt){
 if(e.bowling&&e.bowling.time>0){const hit=e.bowling;e.x+=hit.vx*dt;e.y+=hit.vy*dt;hit.time-=dt;for(const other of run.enemies){if(other===e||other.dead||hit.hits.has(other)||distance(e,other)>e.r+other.r+8)continue;hit.hits.add(other);damageTarget(other,run.p.damage*.4);other.stun=Math.max(other.stun||0,.25);burst(other.x,other.y,'#c9cead',5);}}
 if(e.stun>0){e.stun-=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.x=Math.max(28,Math.min(WORLD.w-28,e.x));e.y=Math.max(35,Math.min(WORLD.h-28,e.y));return;}
 const ox=e.x,oy=e.y;mobileGuardUpdate(e,dt);e.look=Math.atan2(run.p.y-e.y,run.p.x-e.x);e.moving=Math.hypot(e.x-ox,e.y-oy)>.1;
};
const campaignBossUpdate=updateBoss;
updateBoss=function(dt){if(run.floor!==0||run.boss.pattern!=='spin'){campaignBossUpdate(dt);return;}updateBatonGuard(dt);};
function updateBatonGuard(dt){const b=run.boss,p=run.p,ratio=b.hp/b.maxHp;b.angle+=dt;b.flash=Math.max(0,b.flash-dt);b.open=Math.max(0,b.open-dt);b.timer-=dt;b.walk=(b.walk||0)+dt*7;b.look=Math.atan2(p.y-b.y,p.x-b.x);
 if(ratio>=.5){b.mode='controlled';const dx=WORLD.w/2-b.x,dy=240-b.y,d=Math.hypot(dx,dy);if(d>5){b.x+=dx/d*75*dt;b.y+=dy/d*75*dt;}if(b.timer<=0){volley(b,3);zone(b.x,b.y,108,1,22);b.timer=2.8;}return;}
 if(!b.enraged){b.enraged=true;b.mode='chase';b.timer=1;note('His grip changes. He stops holding back.',3);}
 if(b.mode==='windup'){if(b.timer<=0){b.mode='lunge';b.timer=.55;}}
 else if(b.mode==='lunge'){const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy),step=Math.min(d,380*dt);if(d>0){b.x+=dx/d*step;b.y+=dy/d*step;}if(d<12||b.timer<=0){zone(b.tx,b.ty,100,.12,32);run.zones[run.zones.length-1].source='baton';b.mode='recover';b.timer=ratio<.25?1.25:1.7;b.open=b.timer;}}
 else if(b.mode==='recover'){if(b.timer<=0){b.mode='chase';b.timer=.4;}}
 else{const a=Math.atan2(p.y-b.y,p.x-b.x),d=distance(p,b);if(d>65){b.x+=Math.cos(a)*(ratio<.25?165:145)*dt;b.y+=Math.sin(a)*(ratio<.25?165:145)*dt;}if(b.timer<=0&&d<160){b.mode='windup';b.timer=.95;b.tx=p.x;b.ty=p.y;b.vx=Math.cos(a)*350;b.vy=Math.sin(a)*350;}}
 b.x=Math.max(35,Math.min(WORLD.w-35,b.x));b.y=Math.max(50,Math.min(WORLD.h-35,b.y));if(distance(p,b)<p.r+b.r)hurt(b.mode==='lunge'?26:16);
}
function facingRow(e,isPlayer){const a=isPlayer?(e.throwAnim>0?(e.look||0):e.moving?Math.atan2(e.dy,e.dx):(e.look??Math.PI/2)):(e.look??Math.PI/2);const x=Math.cos(a),y=Math.sin(a);return Math.abs(x)>Math.abs(y)?x>0?2:3:y>0?0:1;}
function drawPerson(e,isPlayer,boss=false){
 if(!actorSheet||!actorSheet.complete||!actorSheet.naturalWidth){drawVectorPerson(e,isPlayer,boss);return;}
 const row=facingRow(e,isPlayer)+(isPlayer?0:4),moving=isPlayer?e.moving:e.moving!==false&&!['aim','recover','windup','controlled'].includes(e.mode),frame=moving?Math.floor((e.walk||run.time*8)*.9)%4:0,[sx,sy,sw,sh]=ACTOR_RECTS[row][frame];
 const height=boss?126:(isPlayer?83:92)*(e.r||17)/17,width=height*sw/sh,hit=e.flash>0,attack=isPlayer?Math.max(0,e.throwAnim||0):e.mode==='windup'?.15:0;
 ctx.save();ctx.translate(e.x,e.y+18);ctx.globalAlpha=e.corpse?Math.max(0,e.life/.6):isPlayer&&e.invuln>0?.65:1;
 if(isPlayer&&run.settled&&run.outcome==='capture'){ctx.rotate(Math.min(1.4,(run.fallTime||0)*3));ctx.scale(1,.8);}if(e.corpse){ctx.rotate((1-e.life/.6)*1.5);ctx.scale(1,.8);}else if(e.stun>0)ctx.rotate(-.12);else if(isPlayer&&e.dash>0)ctx.rotate(e.dx>=0?.15:-.15);else if(attack>0)ctx.rotate((row%4===3?-.12:.12)*Math.sin(attack*20));
 if(hit)ctx.filter='brightness(1.75)';ctx.drawImage(actorSheet,sx,sy,sw,sh,-width/2,-height,width,height);ctx.filter='none';
 if(!e.corpse){const left=row%4===3,side=left?-1:1;ctx.save();ctx.translate(side*width*.32,-height*.37);ctx.rotate((e.weapon==='baton'?Math.sin((run.swing||0)*20)*1.4:attack*4)*side);ctx.strokeStyle='#c0c6b2';ctx.lineWidth=3;ctx.beginPath();if(isPlayer&&e.weapon==='shiv'){ctx.moveTo(0,0);ctx.lineTo(side*7,-14);ctx.stroke();ctx.fillStyle='#f4e7b9';ctx.beginPath();ctx.moveTo(side*5,-12);ctx.lineTo(side*10,-23);ctx.lineTo(side*9,-10);ctx.fill();}else if(e.type==='ranged'){roundBox(-3,-24,6,28,2,'#16241f','#9da99a');roundBox(-5,-14,10,6,1,'#334238');}else{ctx.lineWidth=boss?7:5;ctx.strokeStyle='#c2bd9b';ctx.moveTo(0,2);ctx.lineTo(side*7,-34);ctx.stroke();ctx.strokeStyle='#26382e';ctx.lineWidth=boss?5:3;ctx.stroke();}ctx.restore();
 if(e.type==='charger'){ctx.strokeStyle='#edc6a1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,-height*.65);ctx.lineTo(-4,-height*.59);ctx.lineTo(1,-height*.65);ctx.stroke();}if(e.type==='heavy'||boss){roundBox(-width*.27,-height*.63,width*.54,14,3,'#293a34aa','#a4ab95');}
 }
 ctx.restore();
 if(!e.corpse&&!isPlayer&&e.hp<e.maxHp){roundBox(e.x-e.r,e.y-height-2,e.r*2,4,1,'#151d18');ctx.fillStyle='#dec68e';ctx.fillRect(e.x-e.r,e.y-height-2,e.r*2*Math.max(0,e.hp/e.maxHp),4);}if(isPlayer&&!e.corpse){ctx.strokeStyle='#ecd59b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+18,24,10,0,0,Math.PI*2);ctx.stroke();}
}
function drawCorpses(dt){if(run.settled&&run.outcome==='capture')run.fallTime=Math.min(.6,(run.fallTime||0)+dt);for(const c of run.corpses){if(state==='playing')c.life-=dt;drawPerson({...c,corpse:true},false);}run.corpses=run.corpses.filter(c=>c.life>0);}
menu();
