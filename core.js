/* Shared rules: browser globals and Node tests use the same implementation. */
(function(root){
'use strict';
const SAVE_KEY='wardenWavesSave3';
const floors=[
 ['Solitary','Baton Guard','spin','#dbad68','A locked door is not the same as a dead end.'],
 ['Intake','The Registrar','rush','#82c6b4','His charge follows the last place he saw you.'],
 ['General Population','Block Captain','summon','#cfa36b','The captain hides behind his recruits.'],
 ['The Yard','Watchtower Chief','volley','#8fb77d','Keep moving across the firing line.'],
 ['Workshops','The Foreman','slam','#e39d6c','His shield breaks when he commits to a strike.'],
 ['Medical Wing','The Orderly','hazard','#9dcac2','Watch the floor, not just the guards.'],
 ['Maximum Security','Riot Commander','shield','#a6b5d2','His guard drops when he commits to a strike.'],
 ['Death Row','The Executioner','rush','#c17d83','A second charge follows the first.'],
 ['Administration','The Overseer','volley','#c8b6db','Find the gaps between the paper trail.'],
 ["Warden’s Tower",'The Warden','warden','#e3bd67','He changes the rules. Learn each opening.']
].map((a,i)=>({id:i,name:a[0],boss:a[1],pattern:a[2],color:a[3],clue:a[4],waves:10}));
const perks=[
 {id:'damage',name:'Sharpened Edge',text:'+25% damage. Learn the lesson of strength.'},
 {id:'health',name:'Tough Skin',text:'+25 maximum HP and 25 healing. Learn resilience.'},
 {id:'heal',name:'Bandage Wrap',text:'Recover 35 HP (50 after learning recovery). Learn how to recover.'},
 {id:'speed',name:'Prison Legs',text:'+12% movement speed.'},
 {id:'haste',name:'Quick Hands',text:'Attack 15% faster.'},
 {id:'range',name:'Long Reach',text:'+20% weapon range and projectile life.'},
 {id:'pierce',name:'Hard Point',text:'Shivs pierce one more guard; baton hits 15% harder.'},
 {id:'magnet',name:'Hidden Pockets',text:'+45 pickup radius. Gather XP and Contraband from farther away.'}
];
function blank(){return {version:3,contraband:0,days:1,bed:0,workout:0,shivLevel:0,batonLevel:0,library:0,vaultLevel:0,batonUnlocked:false,batonPurchased:false,chosenWeapon:'shiv',lessons:{damage:false,health:false,heal:false},clears:Array(10).fill(0),bestFloor:0,prison:0,vault:[],vaultEnabled:true,totalKills:0};}
function normalize(raw){
 const s=blank();if(!raw||typeof raw!=='object')return s;
 for(const k of ['contraband','days','bed','workout','shivLevel','batonLevel','library','vaultLevel','bestFloor','prison','totalKills'])s[k]=Number.isFinite(raw[k])?Math.max(0,Math.floor(raw[k])):s[k];
 s.days=Math.max(1,s.days);s.bestFloor=Math.min(9,s.bestFloor);s.prison=Math.min(20,s.prison);
 for(const k of ['bed','workout','shivLevel','batonLevel','library','vaultLevel'])s[k]=Math.min(20,s[k]);
 for(const k of ['batonUnlocked','batonPurchased'])s[k]=raw[k]===true;
 s.chosenWeapon=raw.chosenWeapon==='baton'&&s.batonPurchased?'baton':'shiv';
 s.lessons={damage:raw.lessons?.damage===true,health:raw.lessons?.health===true,heal:raw.lessons?.heal===true};
 s.clears=s.clears.map((_,i)=>Number.isFinite(raw.clears?.[i])?Math.max(0,Math.floor(raw.clears[i])):0);
 if(raw.clearedSolitary&&!s.clears[0])s.clears[0]=1;
 s.vault=Array.isArray(raw.vault)?[...new Set(raw.vault.filter(p=>perks.some(x=>x.id===p)))].slice(0,vaultCapacity(s)):[];
 s.vaultEnabled=raw.vaultEnabled!==false;return s;
}
function load(storage){
 try{const current=storage.getItem(SAVE_KEY);if(current)return normalize(JSON.parse(current));
 for(const key of ['wardenSolitarySave','wardenSave2']){const old=storage.getItem(key);if(old)return normalize(JSON.parse(old));}
 }catch(_){}return blank();
}
function gateOpen(s){return s.clears[0]>0&&Object.values(s.lessons).every(Boolean);}
function vaultCapacity(s){return s.vaultLevel>=8?3:s.vaultLevel>=4?2:1;}
function cost(s,id){const bases={bed:20,workout:25,shivLevel:30,batonLevel:40,library:35,vaultLevel:50};return (bases[id]||Infinity)*(s[id]+1);}
function buy(s,id){const c=cost(s,id);if(s[id]>=20||s.contraband<c||(id==='batonLevel'&&!s.batonPurchased))return false;s.contraband-=c;s[id]++;return true;}
function stats(s,weapon=s.chosenWeapon){return {maxHp:100+s.bed*15,speed:205+Math.min(s.workout,15)*9,damage:weapon==='baton'?20+s.batonLevel*5:15+s.shivLevel*5,interval:weapon==='baton'?Math.max(.25,.65-s.batonLevel*.015):Math.max(.16,.45-s.shivLevel*.012),range:weapon==='baton'?96+s.batonLevel*5:470,magnet:60+s.library*6,pierce:0,weapon};}
function applyPerk(p,id,s){switch(id){case'damage':p.damage*=1.25;break;case'health':p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+25);break;case'heal':p.hp=Math.min(p.maxHp,p.hp+(s.lessons.heal?50:35));break;case'speed':p.speed*=1.12;break;case'haste':p.interval=Math.max(.09,p.interval*.85);break;case'range':p.range*=1.2;break;case'pierce':p.pierce++;if(p.weapon==='baton')p.damage*=1.15;break;case'magnet':p.magnet+=45;break;}}
function learn(s,id){if(Object.hasOwn(s.lessons,id))s.lessons[id]=true;}
function choices(s,wave,rng=Math.random){const pool=[...perks];for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}const forced={7:'damage',8:'health',9:'heal'}[wave];if(forced&&!s.lessons[forced]){return [perks.find(p=>p.id===forced),...pool.filter(p=>p.id!==forced).slice(0,2)];}return pool.slice(0,3);}
function quota(wave,floor){return 10+wave*3+floor*2;}
function bossHealth(floor,prison){return (850+floor*320)*(1+prison*.35);}
const api={SAVE_KEY,floors,perks,blank,normalize,load,gateOpen,vaultCapacity,cost,buy,stats,applyPerk,learn,choices,quota,bossHealth};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.WardenRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
