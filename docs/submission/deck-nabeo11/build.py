import json,html,os
HERE=os.path.dirname(os.path.abspath(__file__))
D=os.path.join(HERE,'..','..','..','data')+'/'  # repo-root data/
v=json.load(open(D+'values.json'));cn={x['id']:x['name'] for x in json.load(open(D+'counties.json'))}
def val(c,i,y=2025): return [x['value'] for x in v if x['county_id']==c and x['indicator_id']==i and x['year']==y][0]
rows=sorted([(x['value'],cn[x['county_id']],x['county_id']) for x in v if x['indicator_id']=='6411' and x['year']==2025 and x['county_id']!='finland'],reverse=True)
assert len(rows)==22
fin=val('finland','6411')
# chart
W=720;lab=170;bh=15;gap=3.5;top=22;maxv=100
H=top+len(rows)*(bh+gap)+24
sx=lambda x:lab+x/maxv*(W-lab-50)
svg=[f'<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Helvetica,Arial,sans-serif">']
for i,(x,n,c) in enumerate(rows):
    y=top+i*(bh+gap)
    col={'vantaa-kerava':'#c62828','paijat-hame':'#1d4ed8'}.get(c,'#c9ced6')
    hl=c in('vantaa-kerava','paijat-hame','kainuu','helsinki')
    bold=' font-weight="700" fill="#111"' if hl else ' fill="#6b7280"'
    svg.append(f'<text x="{lab-8}" y="{y+bh-3}" text-anchor="end" font-size="13"{bold}>{html.escape(n)}</text>')
    svg.append(f'<rect x="{lab}" y="{y}" width="{sx(x)-lab:.1f}" height="{bh}" fill="{col}" rx="2"/>')
    if hl: svg.append(f'<text x="{sx(x)+5:.1f}" y="{y+bh-3}" font-size="13" font-weight="700" fill="#111">{x}%</text>')
fx=sx(fin)
svg.append(f'<line x1="{fx:.1f}" x2="{fx:.1f}" y1="{top-6}" y2="{H-22}" stroke="#111" stroke-width="1.5" stroke-dasharray="4 3"/>')
svg.append(f'<text x="{fx:.1f}" y="{H-8}" text-anchor="middle" font-size="13" font-weight="700" fill="#111">Finland {fin}%</text>')
svg.append('</svg>')
chart=''.join(svg)
VK=val('vantaa-kerava','6411');PH=val('paijat-hame','6411')
K6=val('kainuu','6411');K13=val('kainuu','13');F13=val('finland','13')
r13=sorted([(x['value'],cn[x['county_id']]) for x in v if x['indicator_id']=='13' and x['year']==2025 and x['county_id'] not in('finland',)])
lo13,hi13=r13[0],r13[-1]
print(VK,PH,fin,K6,K13,F13,lo13,hi13)
# Hand-typed text below must still match the data; stop the build if the snapshot moved.
assert 30<=PH<=36, f'slide 1 says "a third" for Päijät-Häme but data says {PH}%'
ev=json.load(open(D+'evidence.json'))
evn=[sum(1 for e in ev if e['verified'] and e['stage']==s) for s in ('gp_access','gp_recognition','referral')]
assert evn==[4,3,7], f'B4 tables and "14 checked actions" are typed by hand for 4/3/7 verified rows; data/evidence.json now has {evn}'
S='screenshots/'
def slide(n,body,foot=True,cls=''):
    return f'<section class="slide {cls}">{body}<div class="foot"><span>FirstLine</span><span>{n}</span></div></section>'
def tag(t='screenshot: main 84d76f2, local build; retake from live URL'): return f'<span class="stag">{t}</span>'
TODO=lambda t:f'<span class="todo">TODO</span> <span class="todotxt">{t}</span>'
def src(t): return f'<div class="src">{t}</div>'
sl=[]
sl.append(slide('1',f'''<div class="brand">FirstLine</div>
<h1>In Vantaa-Kerava, {round(VK)}% of non-urgent GP visits come more than a week after people ask. In Päijät-Häme it's a third.</h1>
<div class="two"><div class="big"><b class="red">{VK}%</b><span>Vantaa-Kerava</span></div><div class="big"><b class="acc">{PH}%</b><span>Päijät-Häme</span></div></div>
<div class="grey">Finland {fin}%</div>
{src('THL Sotkanet 6411, 2025 (share of non-urgent GP visits kept more than 7 days after the need was assessed)')}'''))
sl.append(slide('2','''<h1>Where the GP is the first stop, 75 to 85 percent of cancer patients start there. Yet no one shows a county where its own first step breaks</h1>
<div class="flow"><div class="node">Patient</div><div class="arr hl">→<small>1 · getting in to a GP</small></div><div class="node">GP</div><div class="arr hl">→<small>2 · GP to specialist</small></div><div class="node">Specialist</div></div>
<p class="note">Context: National cancer strategy 2026-2035, equal care everywhere.</p>
<div class="src">Steps 1 and 2 are the two steps FirstLine measures. GP as first stop: Vedsted &amp; Olesen, Br J Cancer 2015 (PMC4385978); Danish and UK data, not Finnish. Strategy: Finnish national cancer strategy 2026-2035, implementation roadmap 2026-2031 (STM)</div>'''))
sl.append(slide('3',f'''<h1>Counties break at different steps, so one national fix won't work</h1>
<div class="row"><div class="chart"><div class="cap">Non-urgent GP visits kept more than 7 days after the need was assessed, % of visits, 2025</div>{chart}</div>
<div class="side"><div class="box"><b>Kainuu</b><p>Quick to see a GP ({K6}%, Finland {fin}%), slower from GP to specialist: {K13}% of referrals processed within 3 days (Finland {F13}%).</p></div>
<div class="box"><b>Vantaa-Kerava</b><p>Slow to see a GP ({VK}%). No public referral data.</p></div></div></div>
{src(f'THL Sotkanet 6411, 2025 (bars). Sotkanet 13, 2025 (referrals processed within 3 days): lowest {lo13[1]} {lo13[0]}%, highest {hi13[1]} {hi13[0]}% among areas with data.')}'''))
sl.append(slide('4',f'''<h1>For each county, FirstLine shows where the delay is, and says openly where public data is missing</h1>
<div class="row"><div class="wrap"><div class="crop" style="width:800px;height:370px"><img src="{S}county-vantaa-kerava.png" style="width:1152px;margin-left:-179px;margin-top:-318px"></div>{tag()}</div>
<div class="legend"><div><i style="background:#c62828"></i>Worse than Finland</div><div><i style="background:#f2a900"></i>Finland's level or better, still a wait</div><div><i style="background:#c9ced6"></i>No public data</div></div></div>
{src('Vantaa and Kerava county page. THL Sotkanet 6411, 2025; Sotkanet 13, 2025 (no value published for this county)')}'''))
sl.append(slide('5',f'''<h1>Every county gets 2-3 fixes that already worked elsewhere, each with an owner and a first step for Monday</h1>
<div class="row" style="gap:40px"><div class="col"><div class="cap2">Vantaa-Kerava: the delay is getting in to a GP</div><div class="wrap"><div class="crop" style="width:520px;height:262px"><img src="{S}act-vantaa-kerava.png" style="width:1040px;margin-left:-260px;margin-top:-336px"></div>{tag()}</div>
<div class="proof"><b>25%</b><span>lower odds of dying in the year studied for patients who kept the same GP for 15+ years (Norway), and fewer hospital admissions.</span><small>Sandvik et al., Br J Gen Pract 2022 · ev-gp-continuity</small></div></div>
<div class="col"><div class="cap2">South Ostrobothnia: the delay is after the GP</div><div class="wrap"><div class="crop" style="width:520px;height:262px"><img src="{S}act-south-ostrobothnia.png" style="width:1040px;margin-left:-260px;margin-top:-4px"></div>{tag()}</div>
<div class="proof"><b>17 days</b><span>shorter median diagnostic interval (adjusted) after Denmark's fast-track cancer pathways.</span><small>Jensen et al., BMC Cancer 2015 · ev-ref-denmark-cpp</small></div></div></div>
{src("Each card shows owner, first step, precedent and a source. 2 of these fixes are already in Finland's 2026-2031 cancer roadmap (measures 2.5.1, 2.5.2).")}'''))
sl.append(slide('6',f'''<h1>For the GP: symptoms in, guideline warning signs and the fastest referral route out</h1>
<div class="row"><div class="wrap"><div class="crop" style="width:470px;height:380px"><img src="{S}red-flag-helper.png" style="width:860px;margin-left:-205px;margin-top:-78px"></div>{tag()}</div>
<div class="side" style="gap:22px"><div><span class="pill">Decision support, not diagnosis</span></div>
<div class="box">Type "weight loss, tiredness" (or pick a category). The helper shows the vague-symptoms route and links the guidelines. It does not copy their text.</div>
<div class="box">Matching runs in the browser. No patient data is stored or sent.</div></div></div>
<div class="src">Links to the guidelines (NICE NG12, UK; Käypä hoito); Finnish national criteria pending (roadmap 2.5.2)</div>'''))
sl.append(slide('7','''<h1>Checked data shows where care breaks; Exa shows what's happening about it this week, with a link for every claim</h1>
<div class="ph"><div>County news strip screenshot<br><small>newest card with date and site; never edit a date</small></div></div>
<div class="row2"><span class="chip live">found live - unverified</span><span class="chip ok">checked evidence</span><span class="todo">TODO</span><span class="todotxt">dated screenshot (owner: Phương, N4; redo Sun 07:00)</span></div>
<div class="src">Judges can ask their own question; answers come only from linked results, or "nothing found".</div>'''))
sl.append(slide('8','''<h1>A county director can see their bottleneck and start the first step in two minutes, using public data only</h1>
<ul class="bul"><li>Every number is sourced. No patient data.</li><li>22 areas, one bottleneck view each, 2-3 fixes each.</li><li>Next step: a pilot with one wellbeing services county.</li></ul>
<div class="urls"><span class="todo">TODO</span> <span class="todotxt">live URL (owner: Phương, N5) and repo URL</span></div>
<div class="tagline">FirstLine: equal first steps, across Finland.</div>'''))
sl.append(f'<section class="slide divider"><div><h1>Backup</h1><p>B1 to B6</p></div><div class="foot"><span>FirstLine</span><span>9</span></div></section>')
n=10
sl.append(slide(n,'''<div class="kick">B1</div><h1>What our main number does and doesn't measure</h1>
<ul class="bul sm"><li>6411: share of non-urgent GP visits kept more than 7 days after the need was assessed.</li><li>All non-urgent visits, not only cancer. It counts visits, not people.</li><li>Why still use it: early cancer symptoms are vague, so these patients land in the normal queue. <span class="todo">TODO</span> <span class="todotxt">mentor answer to P1, only with recorded consent (Luan, N6)</span></li><li>Indicator 13 shows when the hospital starts assessing a referral, not when the patient sees a specialist.</li><li>5033 is 0-3% everywhere, whole numbers: context only, not used for ranking.</li></ul>
<div class="src">THL Sotkanet 6411, 13, 5033; data/indicators.json limitations</div>'''));n+=1
sl.append(slide(n,'''<div class="kick">B2</div><h1>Grey means no public data, and we don't guess</h1>
<ul class="bul sm"><li>No public indicator for "GP recognises the symptoms": grey for every county.</li><li>No referral data for Vantaa-Kerava or East, Central and West Uusimaa. Sotkanet region 599 is unnamed, so it is left out.</li><li>Helsinki has referral data for 2025 only.</li><li>Åland is excluded.</li><li>Treatment access is out of scope. <span class="todo">TODO</span> <span class="todotxt">figure for "data is flat" (indicator 5093) is not in data; Phương to confirm (N1)</span></li></ul>
<div class="src">Source: data/README.md</div>'''));n+=1
sl.append(slide(n,f'''<div class="kick">B3</div><h1>Method and sources</h1>
<div class="row"><ul class="bul sm" style="width:560px"><li>Sotkanet API to a static JSON snapshot; every row has a source_id.</li><li>Status: each county's 2025 value vs Finland's 2025 value.</li><li>The AI only writes text around fixed numbers; a validator drops any claim whose number or source is not in the data.</li><li>Sotkanet 6411, 13, 5033 retrieved 13 Nov 2026.</li></ul>
<div class="ph" style="width:460px;height:300px;font-size:24px"><div>/sources page screenshot<br><small>page is on main now; screenshot still to add</small></div></div></div>
<div class="src">data/sources.json. <span class="todo">TODO</span> <span class="todotxt">/sources screenshot (page merged in PR #10; see ../screenshots/09-sources.png) (Tuan, N3)</span></div>'''));n+=1
EV1=[('Getting to a GP','Named GP (omalääkäri) they keep over time','Norway: 25% lower odds of dying in the year studied (observational)'),
('Getting to a GP','Add GP capacity, named-GP model county-wide','Finland roadmap 2.5.1; effect not quantified'),
('Getting to a GP','Nurses handle suitable first-contact visits','Cochrane, 18 trials: equal or better outcomes'),
('Getting to a GP','Omaolo digital triage','Finland: 97.6% judged safe, 877 patients'),
('GP recognition','Low referral threshold (about 3% cancer risk)','NICE NG12; effect not quantified'),
('GP recognition','Safety-netting as standard','NICE NG12; effect not quantified'),
('GP recognition','Direct CT access plus training','Denmark: no significant overall effect (36 vs 44 days)')]
EV2=[('GP to specialist','National referral criteria','Finland roadmap 2.5.2; effect not quantified'),
('GP to specialist','Fast-track pathways with time limits','Denmark: median diagnostic interval 17 days shorter (adjusted)'),
('GP to specialist','Funded pathways, regions report waits','Sweden: waits cut, regional gaps stayed'),
('GP to specialist','Fast diagnostic route for vague symptoms','Denmark: 15-20% referred have cancer'),
('GP to specialist','Rapid diagnostic centre pilot','England: 241 cancers in 2,961 referred (8%)'),
('GP to specialist','Structured e-referral templates','Norway: referral quality score 18% higher'),
('GP to specialist','E-consultation with a specialist','Ontario: answer in median 0.9 days')]
def tbl(R): return '<table><tr><th>Bottleneck</th><th>Action</th><th>Result</th></tr>'+''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a,b,c in R)+'</table>'
sl.append(slide(n,f'<div class="kick">B4 · 1 of 2</div><h1>14 checked actions, matched to 3 bottlenecks</h1>{tbl(EV1)}'+src('data/evidence.json and docs/evidence/evidence.json (14 verified rows: 4 / 3 / 7); results shown honestly, including where waits did not fall. Owner and full source for each row are in the evidence table.')));n+=1
sl.append(slide(n,f'<div class="kick">B4 · 2 of 2</div><h1>14 checked actions, matched to 3 bottlenecks</h1>{tbl(EV2)}'+src('Sweden: ev-ref-sweden-svf. Denmark CT: ev-rec-direct-ct-training (previous page). Rows from docs/evidence/evidence.json.')));n+=1
sl.append(slide(n,'''<div class="kick">B5</div><h1>Exa layer: what is live, what is checked</h1>
<ul class="bul sm"><li>County news, the evidence finder under each action, and the judge question box.</li><li>The Exa key stays on the server. Results are cached.</li><li>If Exa is down: "Live search unavailable", and the checked table stays visible.</li><li><span class="todo">TODO</span> <span class="todotxt">judge-box tests X/15 pass, median latency (Tuan, N10)</span></li></ul>
<div class="src">Live finds are labelled "found live - unverified" and kept apart from checked evidence.</div>'''));n+=1
sl.append(slide(n,'''<div class="kick">B6</div><h1>Likely questions</h1>
<ul class="bul sm"><li><b>Is 6411 about cancer?</b> No, it is all non-urgent GP visits. It is the best public measure of the first step, and the app says so on every county page.</li><li><b>Did these actions really work?</b> We show the honest result: Sweden's pathways cut waits but regional gaps stayed; Denmark's direct CT access alone did not help significantly.</li><li><b>Who would pay or act?</b> The wellbeing services county. Every action names the owner, and two are already in the 2026-2031 cancer roadmap.</li></ul>
<div class="src">NICE and Käypä hoito are linked only, never copied. Source: docs/pitch/demo-script.md, docs/evidence/red-flags.md</div>'''));n+=1
css='''@page{size:1280px 720px;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:-apple-system,"Helvetica Neue",Helvetica,Arial,sans-serif;color:#111;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--acc:#1d4ed8;--red:#c62828}
.slide{width:1280px;height:720px;position:relative;overflow:hidden;page-break-after:always;break-after:page;padding:56px 80px 70px;background:#fff}
h1{font-size:36px;line-height:1.2;margin:0 0 22px;font-weight:700;max-width:1100px;letter-spacing:-.01em}
.brand{font-size:18px;font-weight:700;color:var(--acc);margin-bottom:18px}.kick{font-size:20px;font-weight:700;color:var(--acc);margin-bottom:8px}
.foot{position:absolute;left:80px;right:80px;bottom:22px;display:flex;justify-content:space-between;font-size:14px;color:#6b7280}
.src{position:absolute;left:80px;right:80px;bottom:52px;font-size:14px;color:#6b7280;line-height:1.35}
.two{display:flex;gap:80px;margin-top:30px}.big{display:flex;flex-direction:column}.big b{font-size:150px;line-height:1;letter-spacing:-.03em}.big span{font-size:26px;margin-top:8px}.red{color:var(--red)}.acc{color:var(--acc)}.grey{font-size:24px;color:#6b7280;margin-top:22px}
.flow{display:flex;align-items:center;margin-top:50px;gap:0}.node{border:2px solid #cfd4dc;border-radius:12px;padding:26px 36px;font-size:30px;font-weight:600}.arr{font-size:60px;color:#9aa1ad;padding:0 24px;text-align:center;line-height:1;position:relative}.arr small{display:block;font-size:20px;color:var(--acc);font-weight:700;margin-top:6px}.arr.hl{color:var(--acc)}
.note{font-size:22px;color:#444;margin-top:44px}
.row{display:flex;gap:40px;align-items:flex-start}.chart{flex:0 0 720px}.cap{font-size:14px;color:#6b7280;margin-bottom:2px}.side{flex:1;display:flex;flex-direction:column;gap:18px;padding-top:14px}
.box{border-left:5px solid var(--acc);background:#f4f6fb;padding:14px 18px;font-size:20px;line-height:1.35}.box p{margin:6px 0 0}
.crop{position:relative;overflow:hidden;border:1px solid #d5d9e0;border-radius:8px;flex:none}.crop img{display:block;max-width:none}
.wrap{position:relative;flex:none}.stag{position:absolute;right:0;top:100%;margin-top:6px;font-size:14px;background:#fff;border:1px solid #d5d9e0;border-radius:10px;padding:2px 10px;color:#6b7280}
.legend{display:flex;flex-direction:column;gap:22px;font-size:22px;padding-top:10px}.legend i{display:inline-block;width:18px;height:18px;border-radius:4px;margin-right:12px;vertical-align:-2px}
.col{flex:none;width:520px}.cap2{font-size:18px;font-weight:700;margin-bottom:8px}.col .proof{margin-top:24px}.col .proof b{font-size:48px}.col .proof span{font-size:17px}.proofs{gap:26px}.proof b{font-size:64px;line-height:1;color:var(--acc);display:block}.proof span{font-size:20px;line-height:1.3;display:block;margin-top:4px}.proof small{font-size:14px;color:#6b7280;display:block;margin-top:4px}
.ph{height:330px;border:2px dashed #cfd4dc;border-radius:10px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:28px;color:#6b7280;background:#f8f9fb}.ph small{font-size:20px}
.row2{display:flex;gap:16px;align-items:center;margin-top:20px;font-size:20px}
.pill{background:var(--acc);color:#fff;border-radius:20px;padding:6px 18px;font-size:22px;font-weight:700}
.chip{border-radius:16px;padding:4px 14px;font-weight:700}.live{background:#fff3cd;color:#7a5b00}.ok{background:#e3f1e6;color:#1e6b34}
.todo{background:#ffe600;color:#111;font-weight:800;font-size:16px;padding:2px 8px;border-radius:4px;border:1px solid #c9b400}.todotxt{background:#fff9b0;padding:1px 6px;font-size:20px}
.bul{font-size:28px;line-height:1.4;padding-left:28px;margin:10px 0}.bul li{margin-bottom:14px}.bul.sm{font-size:22px;line-height:1.35}.bul.sm li{margin-bottom:12px}
.urls{font-size:26px;margin-top:20px}.tagline{position:absolute;left:80px;bottom:90px;font-size:34px;font-weight:700;color:var(--acc)}
.divider{display:flex;align-items:center;justify-content:center;background:#f4f6fb;text-align:center}.divider h1{font-size:64px;margin:0;color:var(--acc)}.divider p{font-size:24px;color:#6b7280}
table{border-collapse:collapse;width:100%;font-size:20px}th{text-align:left;color:#6b7280;font-size:18px;border-bottom:2px solid #cfd4dc;padding:4px 8px}td{padding:7px 8px;border-bottom:1px solid #e5e8ee;vertical-align:top;line-height:1.25}td:first-child{white-space:nowrap;font-weight:600;color:var(--acc)}'''
open(os.path.join(HERE,'deck.html'),'w').write(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FirstLine pitch deck, draft 2</title><style>{css}</style></head><body>'+'\n'.join(sl)+'</body></html>')
print(len(sl))
