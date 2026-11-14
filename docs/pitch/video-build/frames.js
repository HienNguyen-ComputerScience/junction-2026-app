// Renders the 3 slides and the caption overlays as 1920x1080 PNGs.
const { chromium } = require('playwright');
const css = `*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;font-family:"Segoe UI",Arial,sans-serif;color:#111}
.slide{width:1920px;height:1080px;background:#fafaf9;display:flex;flex-direction:column;justify-content:center;padding:0 160px}
.brand{position:absolute;top:70px;left:160px;font-weight:700;font-size:34px;letter-spacing:.5px}
.chip{display:inline-block;margin-top:36px;font-size:28px;color:#444;border:2px solid #ccc;border-radius:999px;padding:8px 24px}
.big{font-size:180px;font-weight:800;line-height:1}.lbl{font-size:44px;color:#333;margin-top:12px}
.red{color:#dc2626}.amber{color:#b45309}
.row{display:flex;gap:160px}
.steps{display:flex;align-items:center;gap:28px;margin-top:70px}
.step{font-size:40px;font-weight:600;padding:28px 36px;border-radius:18px;border:3px solid #ccc;color:#888;background:#fff}
.step.on{border-color:#dc2626;color:#111;background:#fff1f1}
.arr{font-size:48px;color:#aaa}
h1{font-size:72px;line-height:1.15}.sub{font-size:40px;color:#444;margin-top:24px}
ul{margin-top:50px;font-size:48px;line-height:1.7;list-style:none}li:before{content:"✓  ";color:#16a34a}
.cap{position:absolute;left:0;right:0;bottom:60px;display:flex;justify-content:center;gap:24px}
.cap span{background:rgba(17,17,17,.82);color:#fff;font-size:34px;font-weight:600;padding:14px 28px;border-radius:12px}`;
const slides = {
  s1: `<div class="slide"><div class="brand">FirstLine</div>
    <div class="sub" style="margin:0 0 50px">Non-urgent GP visits that came more than 7 days after people asked</div>
    <div class="row"><div><div class="big red">85.4%</div><div class="lbl">Vantaa–Kerava</div></div>
    <div><div class="big amber">32.7%</div><div class="lbl">Päijät-Häme</div></div></div>
    <div class="lbl" style="color:#777;margin-top:40px">Finland 54.7%</div><div><span class="chip">THL Sotkanet 6411 · 2025</span></div></div>`,
  s2: `<div class="slide"><div class="brand">FirstLine</div>
    <h1>Lymphoma in Finland: median days from first symptom to treatment</h1>
    <div class="row" style="margin-top:50px"><div><div class="big red">127</div><div class="lbl">first stop: public health centre</div></div>
    <div><div class="big" style="color:#555">76</div><div class="lbl">first stop: private or work care</div></div></div>
    <div class="steps"><div class="step on">GP wait</div><div class="arr">→</div><div class="step on">Referral</div><div class="arr">→</div><div class="step">Treatment</div></div>
    <div><span class="chip">Kuitunen et al., Cancer Medicine 2026 · 160 patients, 7 Finnish hospitals</span></div></div>`,
  s9: `<div class="slide"><div class="brand">FirstLine</div><h1>Equal first steps across Finland</h1>
    <ul><li>Public 2025 data</li><li>Every number sourced</li><li>No patient data</li></ul>
    <div class="sub" style="margin-top:60px">firstline-finland.vercel.app</div>
    <div class="sub" style="font-size:30px;color:#777">Decision support, not medical advice.</div></div>`,
};
const caps = {
  c3: ['22 areas · source and year on every number'],
  c4: ['Red: worse than Finland (54.7%)', 'Grey: no public data'],
  c5: ['Owner · first step · source', 'Norway study: observational, not cancer-specific'],
  c6: ['Denmark: 17 days shorter · Jensen et al., BMC Cancer 2015'],
  c7: ['Decision support, not diagnosis'],
  c8: ['Found live with Exa', '2 Nov 2026 · laakarilehti.fi', 'Found live — unverified'],
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [k, h] of Object.entries(slides)) { await p.setContent(`<style>${css}</style>${h}`); await p.screenshot({ path: `${k}.png` }); }
  for (const [k, t] of Object.entries(caps)) {
    await p.setContent(`<style>${css}body{background:transparent}</style><div class="cap">${t.map((x) => `<span>${x}</span>`).join('')}</div>`);
    await p.screenshot({ path: `${k}.png`, omitBackground: true });
  }
  await b.close();
})();
