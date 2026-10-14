// Optional real-browser smoke check. Run with Playwright + Chromium installed.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.WARDEN_BASE_URL||'http://127.0.0.1:8765');
 await page.getByRole('button',{name:'Attempt Escape →',exact:true}).click();
 for(let i=0;i<3;i++)await page.locator('#story-next').click();
 await page.keyboard.down('d');await page.waitForTimeout(500);await page.keyboard.up('d');
 await page.keyboard.press('Escape');await page.getByRole('heading',{name:'Take a breath.',exact:true}).waitFor();
 await page.getByRole('button',{name:'Resume attempt',exact:true}).click();
 await page.locator('#missionHud').waitFor({state:'visible'});
 await page.screenshot({path:'chapter-desktop.png'});
 const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});phone.on('pageerror',e=>errors.push(e.message));
 await phone.goto(process.env.WARDEN_BASE_URL||'http://127.0.0.1:8765');
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth),390);
 await phone.getByRole('button',{name:'Attempt Escape →',exact:true}).click();
 for(let i=0;i<3;i++)await phone.locator('#story-next').click();
 await phone.locator('#dashBtn').waitFor({state:'visible'});
 const cdp=await phone.context().newCDPSession(phone);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:600}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:150,y:600}]});
 await phone.waitForTimeout(300);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await phone.locator('#stick').waitFor({state:'hidden'});
 await phone.screenshot({path:'chapter-mobile.png'});
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS desktop and mobile chapter smoke checks');
})().catch(e=>{console.error(e);process.exit(1);});
