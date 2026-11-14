const { chromium } = require('playwright');
const B = 'https://firstline-finland.vercel.app';
const cursor = `(()=>{if(document.getElementById('__c'))return;const c=document.createElement('div');c.id='__c';
c.style.cssText='position:fixed;z-index:2147483647;width:22px;height:22px;border-radius:50%;background:rgba(220,38,38,.35);border:2px solid #dc2626;pointer-events:none;transform:translate(-50%,-50%);left:-50px;top:-50px';
document.addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'});document.body.appendChild(c)})()`;
const w = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: 'take1', size: { width: 1920, height: 1080 } } });
  await ctx.addInitScript(`addEventListener('DOMContentLoaded',()=>{${cursor}})`);
  const p = await ctx.newPage();
  const move = async (loc) => { await loc.scrollIntoViewIfNeeded(); const bb = await loc.boundingBox(); if (bb) await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 25 }); };
  const scroll = async (px, ms) => { const n = Math.ceil(ms / 40); for (let i = 0; i < n; i++) { await p.mouse.wheel(0, px / n); await w(40); } };
  const t0 = Date.now(), mark = (s) => console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', s);

  await p.goto(B + '/', { waitUntil: 'networkidle' }); mark('ranking'); await w(2000);
  await scroll(900, 6000); await w(1000);
  const link = p.locator('a[href="/county/vantaa-kerava"]').first(); await move(link); await w(600);
  await link.click(); await p.waitForLoadState('networkidle'); mark('county'); await w(1500);
  for (const h of ['Getting to a GP', 'GP → specialist referral', 'Limitations: read before acting on these numbers']) { await move(p.getByRole('heading', { name: h }).first()); await w(2200); }

  await p.goto(B + '/county/vantaa-kerava/act', { waitUntil: 'networkidle' }); mark('act vantaa'); await w(1500);
  const s1 = p.locator('summary', { hasText: 'Quote and page in the source' }).first(); await move(s1); await w(500); await s1.click(); await w(1500);
  await scroll(300, 2500); await w(5000);

  await p.goto(B + '/county/south-ostrobothnia/act', { waitUntil: 'networkidle' }); mark('act south-ostro'); await w(1200);
  const dk = p.getByText(/fast-track/i).first(); await move(dk); await w(2500);
  const s2 = dk.locator('xpath=ancestor::*[.//summary][1]').locator('summary').first();
  if (await s2.count()) { await move(s2); await s2.click(); } await w(3500);

  const rf = p.getByPlaceholder('e.g. weight loss, tiredness'); await move(rf); await rf.click(); mark('red-flag');
  await rf.pressSequentially('weight loss, tiredness', { delay: 90 }); await rf.press('Enter'); await w(1500); await scroll(400, 2000); await w(3500);

  await p.goto(B + '/county/vantaa-kerava', { waitUntil: 'networkidle' }); mark('news');
  await move(p.getByRole('heading', { name: 'Local news' })); await scroll(250, 1500); await w(7000);
  mark('end'); await ctx.close(); await b.close();
})();
