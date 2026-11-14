# Assembles the draft video: TTS per shot (Windows SAPI), slides + screen take segments, captions, concat.
import subprocess, json, glob, os
take = glob.glob('take1/*.webm')[0]
# (id, source, take start s, caption png or None, voice-over) - lines from docs/pitch/video-shot-script.md
shots = [
 ('1', 's1.png', None, None, "In Vantaa and Kerava, 85 percent of non-urgent GP visits happen more than a week after people ask. In Päijät-Häme, it is 33 percent."),
 ('2', 's2.png', None, None, "In Finland, lymphoma patients who started at a public health centre waited a median 127 days to treatment. Through private or work care: 76. Equal care runs from GP wait, to referral, to treatment. No county sees where it breaks."),
 ('3', take, 1.5, 'c3.png', "This is FirstLine. Every wellbeing county, ranked by GP wait and referral speed. Public THL data, with source and year on every number."),
 ('4', take, 13.1, 'c4.png', "Open Vantaa and Kerava. The delay is getting in to a GP. The referral step is grey: no public data, and we say so."),
 ('5', take, 23.6, 'c5.png', "What to do on Monday? Each action has an owner and a first step. In Norway, patients with one GP for over 15 years had 25 percent lower odds of dying in the study year."),
 ('6', take, 36.7, 'c6.png', "In South Ostrobothnia, the weak step is referral. Denmark's fast-track pathways made the median time to diagnosis 17 days shorter."),
 ('7', take, 45.4, 'c7.png', "For the GP: type the symptoms, see guideline warning signs and the fastest referral route."),
 ('8', take, 56.2, 'c8.png', "The numbers are from THL. This month's news is in no dataset. Exa finds it: Vantaa and Kerava is hiring 26 doctors. Every item links its source, labelled found live, unverified."),
 ('9', 's9.png', None, None, "Decision support, not medical advice. Public 2025 data, every number sourced, no patient data. FirstLine: equal first steps across Finland."),
]
TAKE_END = 65.5
def dur(f): return float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',f]))['format']['duration'])
parts = []
for i, (sid, src, start, cap, text) in enumerate(shots):
    wav = f'vo{sid}.wav'
    open('t.txt', 'w', encoding='utf-8-sig').write(text)
    ps = ("Add-Type -AssemblyName System.Speech; $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Rate=1; "
          f"$s.SetOutputToWaveFile('{os.path.abspath(wav)}'); $s.Speak([IO.File]::ReadAllText('{os.path.abspath('t.txt')}')); $s.Dispose()")
    subprocess.run(['powershell', '-NoProfile', '-c', ps], check=True)
    D = round(dur(wav) + 0.7, 2)
    out = f'seg{sid}.mp4'
    if start is None:
        cmd = ['ffmpeg','-y','-loglevel','error','-loop','1','-t',str(D),'-i',src,'-i',wav,
               '-filter_complex','[0]format=yuv420p,fps=30[v];[1]apad[a]','-map','[v]','-map','[a]']
    else:
        nxt = shots[i+1][2] if i+1 < len(shots) and shots[i+1][2] else TAKE_END
        avail = nxt - start
        pad = max(0, D - avail)
        cmd = ['ffmpeg','-y','-loglevel','error','-ss',str(start),'-t',str(min(D, avail)),'-i',src,'-i',cap,'-i',wav,
               '-filter_complex',f'[0]fps=30,tpad=stop_mode=clone:stop_duration={pad}[b];[b][1]overlay,format=yuv420p[v];[2]apad[a]','-map','[v]','-map','[a]']
    subprocess.run(cmd + ['-t',str(D),'-c:v','libx264','-crf','20','-c:a','aac','-ar','48000','-ac','2',out], check=True)
    parts.append(out); print(sid, D)
open('list.txt','w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','list.txt','-c','copy','-movflags','+faststart','firstline-video-draft.mp4'], check=True)
print('total', dur('firstline-video-draft.mp4'))
