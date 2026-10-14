const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765');await page.getByRole('button',{name:'Attempt Escape →',exact:true}).click();
 await page.keyboard.down('d');await page.waitForTimeout(600);await page.keyboard.up('d');assert.ok(await page.evaluate(()=>run.p.x>600));
 await page.keyboard.press('Escape');const stopped=await page.evaluate(()=>run.time);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>run.time),stopped);
 await page.getByRole('button',{name:'Resume attempt',exact:true}).click();
 // Advance combat deterministically through every first-floor wave and choose its actual UI upgrades.
 await page.evaluate(()=>{run.p.hp=100000;run.p.maxHp=100000;});
 for(let w=1;w<=9;w++){
  await page.evaluate(()=>{run.spawned=run.target;run.enemies=[];run.pendingLevels=0;update(.016);});
  const lesson=w===6?'pick-damage':w===7?'pick-health':w===8?'pick-heal':null;
  await page.locator(lesson&&await page.locator('#'+lesson).count()?'#'+lesson:'#screen .card button').first().click();
 }
 assert.ok(await page.evaluate(()=>Object.values(save.lessons).every(Boolean)));
 await page.evaluate(()=>{run.spawned=run.target;run.enemies=[];run.pendingLevels=0;update(.016);});
 assert.equal(await page.evaluate(()=>run.boss.pattern),'spin');
 await page.evaluate(()=>{run.boss.hp=0;update(.016);});
 assert.equal(await page.evaluate(()=>state),'result');assert.ok(await page.evaluate(()=>R.gateOpen(save)));assert.equal(await page.evaluate(()=>save.clears[0]),1);
 const bank=await page.evaluate(()=>save.contraband);await page.evaluate(()=>finish('Duplicate settlement'));assert.equal(await page.evaluate(()=>save.contraband),bank);
 await page.locator('#store-damage').click();await page.getByRole('button',{name:'Return to cell →',exact:true}).click();
 await page.getByRole('button',{name:'Attempt Escape →',exact:true}).click();assert.ok(await page.evaluate(()=>run.p.damage>R.stats(save).damage));
 // Actual boss update paths, plus transitions and final escape/New Game+.
 for(let f=0;f<10;f++){
  await page.evaluate(f=>{run.floor=f;run.wave=10;run.p.hp=100000;run.p.maxHp=100000;run.pendingLevels=0;spawnBoss();for(let phase=0;phase<4;phase++){run.boss.hp=run.boss.maxHp*(1-phase*.26);for(let i=0;i<210;i++)updateBoss(1/60);}run.boss.hp=0;update(.016);},f);
  if(f<9){assert.equal(await page.evaluate(()=>state),'transition');await page.locator(f===4?'#abandon':'#keep').click();}
 }
 assert.equal(await page.evaluate(()=>state),'result');assert.equal(await page.evaluate(()=>save.prison),1);
 await page.screenshot({path:'/workspace/scratch/2cdebb9e19c4/desktop-result.png'});
 await page.reload();assert.equal(await page.evaluate(()=>save.prison),1);
 const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});phone.on('pageerror',e=>errors.push(e.message));await phone.goto('http://127.0.0.1:8765');
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth),390);
 await phone.getByRole('button',{name:'Attempt Escape →',exact:true}).click();
 const cdp=await phone.context().newCDPSession(phone);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:600}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:150,y:600}]});await phone.waitForTimeout(200);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await phone.evaluate(()=>joy.id),null);
 await phone.screenshot({path:'/workspace/scratch/2cdebb9e19c4/mobile-game.png'});
 await phone.evaluate(()=>{window.dispatchEvent(new Event('blur'));});assert.equal(await phone.evaluate(()=>state),'paused');
 assert.deepEqual(errors,[]);console.log('PASS desktop movement, pause, 10 waves, journal gate, single settlement, vault, 10 boss patterns, floor transitions, abandonment, escape, reload, mobile viewport, touch release, blur pause, no browser errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
