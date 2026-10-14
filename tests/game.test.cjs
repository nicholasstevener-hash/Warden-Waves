const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function boot(initial={}){
 const nodes=new Map(),storage=new Map(Object.entries(initial)),context2d=new Proxy({},{get:(_,k)=>()=>{}});
 class Element{constructor(id){this.id=id;this.style={};this.handlers={};this.hidden=false;this.textContent='';}set innerHTML(v){this.html=v;for(const m of v.matchAll(/id="([^"]+)"/g))nodes.set(m[1],new Element(m[1]));}get innerHTML(){return this.html;}addEventListener(e,fn){this.handlers[e]=fn;}focus(){}querySelector(){return {focus(){}};}setAttribute(){}getContext(){return context2d;}setPointerCapture(){}}
 function $(id){if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);}
 const sandbox={console,Math,Set,Map,Object,Number,JSON,String,Array,Infinity,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{getElementById:$,addEventListener(){}},innerWidth:1440,innerHeight:900,devicePixelRatio:1,matchMedia:()=>({matches:false}),requestAnimationFrame(){},addEventListener(){},confirm:()=>true,prompt:()=>null,navigator:{}};
 sandbox.globalThis=sandbox;vm.createContext(sandbox);for(const f of ['core.js','game.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',f),'utf8'),sandbox);
 return {eval:code=>vm.runInContext(code,sandbox),click:id=>{assert.ok($(id).handlers.click,`missing action ${id}`);$(id).handlers.click();},storage};
}
test('full campaign: first capture, learned gate, vault, ten bosses, reset build, escape and settlement',()=>{
 const g=boot();g.click('start');g.eval('run.p.hp=100000;run.p.maxHp=100000');
 for(let w=1;w<=9;w++){
  g.eval('run.spawned=run.target;run.enemies=[];run.pendingLevels=0;update(.016)');
  const id=w===6?'damage':w===7?'health':w===8?'heal':g.eval('R.choices(save,0)[0].id');
  // Random choices need not match a second roll; take an actually rendered choice.
  const actual=w>=6&&w<=8&&g.eval(`screen.innerHTML.includes('id="pick-${id}"')`)?id:g.eval("(screen.innerHTML.match(/id=\"pick-([^\"]+)\"/)||[])[1]");g.click('pick-'+actual);
 }
 assert.equal(g.eval('Object.values(save.lessons).every(Boolean)'),true);
 g.eval('run.spawned=run.target;run.enemies=[];run.pendingLevels=0;update(.016)');assert.equal(g.eval('run.boss.pattern'),'spin');
 g.eval('run.boss.hp=0;update(.016)');assert.equal(g.eval('state'),'result');assert.equal(g.eval('R.gateOpen(save)'),true);assert.equal(g.eval('save.clears[0]'),1);
 const bank=g.eval('save.contraband');g.eval("finish('duplicate')");assert.equal(g.eval('save.contraband'),bank);
 g.click('store-damage');g.click('continue');g.click('start');assert.ok(g.eval('run.p.damage>R.stats(save).damage'));
 for(let f=0;f<10;f++){
  g.eval(`run.floor=${f};run.wave=10;run.p.hp=100000;run.p.maxHp=100000;run.pendingLevels=0;spawnBoss();for(let phase=0;phase<4;phase++){run.boss.hp=run.boss.maxHp*(1-phase*.26);for(let i=0;i<210;i++)updateBoss(1/60);}run.boss.hp=0;update(.016)`);
  if(f<9){assert.equal(g.eval('state'),'transition');g.click(f===4?'abandon':'keep');if(f===4)assert.equal(g.eval('run.perks.length'),0);}
 }
 assert.equal(g.eval('state'),'result');assert.equal(g.eval('save.prison'),1);assert.equal(g.eval('save.clears[9]'),1);
 const reload=boot(Object.fromEntries(g.storage));assert.equal(reload.eval('save.prison'),1);
});
test('frame-independent movement, dash, pause, pickups, attacks, and fatal capture',()=>{
 const g=boot();g.click('start');g.eval('keys.d=true;update(1/60)');assert.ok(g.eval('run.p.x>WORLD.w/2'));
 g.eval('keys={};dodge();update(.1)');assert.ok(g.eval('run.p.dashCooldown>0'));g.eval('pause()');const time=g.eval('run.time');g.eval('update(1)');assert.equal(g.eval('run.time'),time);g.click('resume');
 g.eval("run.enemies=[{x:run.p.x+40,y:run.p.y,r:14,hp:1,maxHp:1,type:'guard',speed:0,damage:1,cooldown:2,flash:0}];run.p.attack=0;for(let i=0;i<40;i++)update(1/60)");assert.ok(g.eval('run.earnedKills>0'));
 g.eval('run.p.hp=0;update(.016)');assert.equal(g.eval('state'),'result');assert.equal(g.eval('save.days'),2);
});
test('old save migrates and locked baton stays locked',()=>{
 const g=boot({wardenSolitarySave:JSON.stringify({contraband:75,bed:2,days:8,batonUnlocked:true,clearedSolitary:true})});assert.equal(g.eval('save.contraband'),75);assert.equal(g.eval('save.bed'),2);assert.equal(g.eval('save.clears[0]'),1);assert.equal(g.eval('save.chosenWeapon'),'shiv');
});
