const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('../core.js');
test('malformed and old saves are repaired without discarding earned upgrades',()=>{
 assert.deepEqual(R.load({getItem:()=>'{broken'}),R.blank());
 const s=R.load({getItem:k=>k==='wardenSolitarySave'?JSON.stringify({contraband:82,days:9,bed:2,clearedSolitary:true,batonUnlocked:true}):null});
 assert.equal(s.contraband,82);assert.equal(s.bed,2);assert.equal(s.clears[0],1);assert.equal(s.batonUnlocked,true);assert.equal(R.gateOpen(s),false);
 assert.equal(R.normalize({chosenWeapon:'baton',batonPurchased:false}).chosenWeapon,'shiv');
});
test('three permanent lessons AND a first-floor clear are required for the gate',()=>{
 const s=R.blank();for(const id of ['damage','health','heal'])R.learn(s,id);assert.equal(R.gateOpen(s),false);s.clears[0]=1;assert.equal(R.gateOpen(s),true);s.lessons.heal=false;assert.equal(R.gateOpen(s),false);
});
test('late-wave lesson choices are guaranteed until learned',()=>{
 const s=R.blank();for(const [w,id] of [[7,'damage'],[8,'health'],[9,'heal']]){const choices=R.choices(s,w,()=>.5);assert.equal(choices[0].id,id);assert.equal(new Set(choices.map(x=>x.id)).size,3);}
});
test('purchases are atomic, capped and cannot spend unavailable money',()=>{
 const s=R.blank();s.contraband=19;assert.equal(R.buy(s,'bed'),false);assert.equal(s.contraband,19);s.contraband=20;assert.equal(R.buy(s,'bed'),true);assert.equal(s.bed,1);assert.equal(s.contraband,0);s.contraband=10000;assert.equal(R.buy(s,'batonLevel'),false);s.bed=20;assert.equal(R.buy(s,'bed'),false);
});
test('every perk changes the promised stat and healing stays within bounds',()=>{
 const s=R.blank();for(const perk of R.perks){const p={...R.stats(s),hp:60};const before=JSON.stringify(p);R.applyPerk(p,perk.id,s);assert.notEqual(JSON.stringify(p),before,perk.id);assert.ok(p.hp<=p.maxHp);}
 const p={...R.stats(s),hp:99};R.applyPerk(p,'heal',s);assert.equal(p.hp,100);
});
test('vault capacity and invalid perk IDs are sanitized',()=>{
 const s=R.normalize({vault:['damage','health','evil'],vaultLevel:0});assert.deepEqual(s.vault,['damage']);s.vaultLevel=4;assert.equal(R.vaultCapacity(s),2);s.vaultLevel=8;assert.equal(R.vaultCapacity(s),3);
});
test('ten blocks have ten waves and New Game+ strengthens bosses',()=>{
 assert.equal(R.floors.length,10);assert.ok(R.floors.every(f=>f.waves===10));assert.ok(R.bossHealth(9,1)>R.bossHealth(9,0));assert.ok(R.quota(10,9)>R.quota(1,0));
});
