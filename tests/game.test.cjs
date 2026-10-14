const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function boot(initial={}){
 const nodes=new Map(),storage=new Map(Object.entries(initial)),context2d=new Proxy({},{get:(_,k)=>()=>{}});
 class Element{constructor(id){this.id=id;this.style={};this.handlers={};this.hidden=false;this.textContent='';}set innerHTML(v){this.html=v;for(const m of v.matchAll(/id="([^"]+)"/g))nodes.set(m[1],new Element(m[1]));}get innerHTML(){return this.html;}addEventListener(e,fn){this.handlers[e]=fn;}focus(){}querySelector(){return {focus(){}};}setAttribute(){}getContext(){return context2d;}setPointerCapture(){}}
 function $(id){if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);}
 const sandbox={console,Math,Set,Map,Object,Number,JSON,String,Array,Infinity,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{getElementById:$,addEventListener(){}},innerWidth:1440,innerHeight:900,devicePixelRatio:1,matchMedia:()=>({matches:false}),requestAnimationFrame(){},addEventListener(){},confirm:()=>true,prompt:()=>null,navigator:{}};
 let seed=173; sandbox.Math=Object.create(Math);sandbox.Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};sandbox.globalThis=sandbox;vm.createContext(sandbox);for(const f of ['core.js','game.js','chapter.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',f),'utf8'),sandbox);
 return {eval:code=>vm.runInContext(code,sandbox),click:id=>{assert.ok($(id).handlers.click,`missing action ${id}`);$(id).handlers.click();},storage};
}
function closeStory(g){let count=0;while(g.eval('state')==='story'&&count++<10)g.click('story-next');assert.ok(count<10);}
function start(g){g.click('start');closeStory(g);}
test('missions require travel, progress in order and unlock the Library and Vault',()=>{
 const g=boot();assert.equal(g.eval('R.vaultOpen(save)'),false);start(g);g.eval('interact()');assert.equal(g.eval('save.story.mattress'),false);
 g.eval('run.p.x=155;run.p.y=610;interact()');assert.equal(g.eval('state'),'story');assert.equal(g.eval('save.story.mattress'),true);closeStory(g);
 g.eval('run.p.x=1035;run.p.y=170;interact()');closeStory(g);assert.equal(g.eval('save.story.vent'),true);
 g.eval('run.p.x=940;run.p.y=655;interact()');assert.equal(g.eval('save.story.cache'),false);
 g.eval('run.wave=3;interact()');closeStory(g);assert.equal(g.eval('R.vaultOpen(save)'),true);assert.equal(g.eval('save.vault[0]'),'haste');assert.equal(g.eval('run.loot'),15);
 const again=boot(Object.fromEntries(g.storage));assert.equal(again.eval('save.story.cache'),true);start(again);assert.ok(again.eval('run.p.interval<R.stats(save).interval'));
});
test('uncollected drops persist across waves without free XP or upgrades',()=>{
 const g=boot();start(g);g.eval("run.drops=[{x:100,y:100,kind:'xp',value:8},{x:100,y:100,kind:'loot',value:3}];waveDone()");assert.equal(g.eval('run.wave'),2);assert.equal(g.eval('run.p.xp'),0);assert.equal(g.eval('run.perks.length'),0);assert.equal(g.eval('run.drops.length'),2);
 g.eval('run.p.x=100;run.p.y=100;update(.016)');assert.equal(g.eval('run.p.xp'),8);assert.equal(g.eval('run.loot'),3);
 g.eval("finish('capture')");assert.equal(g.eval('save.contraband'),3);g.eval("finish('duplicate')");assert.equal(g.eval('save.contraband'),3);
});
test('a fresh idle player is captured instead of clearing Solitary',()=>{
 const g=boot();start(g);let steps=0;while(steps++<60*180&&g.eval('state')!=='result'){
  if(g.eval('state')==='choice'){g.click(g.eval("(screen.innerHTML.match(/id=\"(pick-[^\"]+)\"/)||[])[1]"));}else g.eval('update(1/60)');
 }
 assert.equal(g.eval('state'),'result');assert.ok(g.eval('run.wave')<10);assert.ok(g.eval('run.time')<100);console.log('Idle capture:',g.eval('run.time.toFixed(1)'), 'seconds; wave',g.eval('run.wave'));
});
test('a moving player can avoid a marked strike that damages a stationary player',()=>{
 const stationary=boot();start(stationary);stationary.eval('zone(run.p.x,run.p.y,82,.8,24);for(let i=0;i<50;i++)update(1/60)');assert.equal(stationary.eval('run.p.hp'),76);
 const moving=boot();start(moving);moving.eval('zone(run.p.x,run.p.y,82,.8,24);keys.d=true;for(let i=0;i<50;i++)update(1/60)');assert.equal(moving.eval('run.p.hp'),100);
});
test('only the Baton Guard strike near the north door completes the escape mission',()=>{
 const g=boot();start(g);g.eval('save.story.cache=true;zone(300,500,100,.1,28);run.zones[0].source="baton";for(let i=0;i<10;i++)update(.016)');assert.equal(g.eval('save.story.door'),false);
 g.eval('zone(560,65,100,.1,28);run.zones[run.zones.length-1].source="spotlight";for(let i=0;i<10;i++)update(.016)');assert.equal(g.eval('save.story.door'),false);
 g.eval('zone(560,65,100,.1,28);run.zones[run.zones.length-1].source="baton";for(let i=0;i<10;i++)update(.016)');assert.equal(g.eval('save.story.door'),true);
 g.eval('spawnBoss();run.boss.hp=0;update(.016)');assert.equal(g.eval('state'),'transition');assert.equal(g.eval('R.gateOpen(save)'),true);
});
test('all ten bosses and floor transitions still reach New Game+',()=>{
 const g=boot();start(g);g.eval('save.story.door=true;save.story.cache=true');
 for(let f=0;f<10;f++){
  g.eval(`run.floor=${f};run.wave=10;run.p.hp=100000;run.p.maxHp=100000;run.pendingLevels=0;spawnBoss();for(let phase=0;phase<4;phase++){run.boss.hp=run.boss.maxHp*(1-phase*.26);for(let i=0;i<210;i++)updateBoss(1/60);}run.boss.hp=0;update(.016)`);
  if(f<9){assert.equal(g.eval('state'),'transition');g.click(f===4?'abandon':'keep');if(f===4)assert.equal(g.eval('run.perks.length'),0);}
 }
 assert.equal(g.eval('state'),'result');assert.equal(g.eval('save.prison'),1);assert.equal(g.eval('save.clears[9]'),1);
});
test('pause freezes the simulation and the character renderer runs',()=>{
 const g=boot();start(g);g.eval('keys.d=true;update(1/60);draw(.016)');assert.ok(g.eval('run.p.x>WORLD.w/2'));
 g.eval('dodge();update(.1);pause()');const time=g.eval('run.time');g.eval('update(1)');assert.equal(g.eval('run.time'),time);g.click('resume');assert.equal(g.eval('state'),'playing');
});
test('existing upgrades, stored perks and discovered gates survive the chapter migration',()=>{
 const old={contraband:75,bed:2,days:8,batonUnlocked:true,clears:[1],lessons:{damage:true,health:true,heal:true},vault:['damage'],library:2};const g=boot({wardenWavesSave3:JSON.stringify(old)});assert.equal(g.eval('save.contraband'),75);assert.equal(g.eval('save.bed'),2);assert.equal(g.eval('R.gateOpen(save)'),true);assert.equal(g.eval('R.vaultOpen(save)'),true);
});
test('a fresh moving player can survive the opening while idle play fails',()=>{
 const g=boot();start(g);for(let i=0;i<60*45&&g.eval('state')!=='result';i++){
  if(g.eval('state')==='choice'){const id=g.eval("(screen.innerHTML.match(/id=\"(pick-[^\"]+)\"/)||[])[1]");g.click(id);}
  else g.eval(`{const p=run.p,t=run.time*.7,tx=560+240*Math.cos(t),ty=390+190*Math.sin(t);let dx=tx-p.x,dy=ty-p.y;const len=Math.hypot(dx,dy);dx/=Math.max(1,len);dy/=Math.max(1,len);for(const e of run.enemies){const d=distance(e,p);if(d<150){dx+=(p.x-e.x)/Math.max(1,d)*(150-d)/40;dy+=(p.y-e.y)/Math.max(1,d)*(150-d)/40;}}for(const z of run.zones){const d=distance(z,p);if(d<z.r+40){dx+=(p.x-z.x+1)/Math.max(1,d)*3;dy+=(p.y-z.y+1)/Math.max(1,d)*3;if(p.dashCooldown<=0)dodge();}}joy={id:99,x:dx/Math.max(1,Math.hypot(dx,dy)),y:dy/Math.max(1,Math.hypot(dx,dy))};update(1/60);}`);
 }
 console.log('Moving opening:',g.eval('run.time.toFixed(1)'), 'seconds; HP',g.eval('Math.round(run.p.hp)'),'wave',g.eval('run.wave'));assert.notEqual(g.eval('state'),'result');
});
