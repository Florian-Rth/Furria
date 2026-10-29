import subprocess, os
def expr(bpm, f0, dur, roots):
    B = 60/bpm
    i = f"mod(floor(t/{4*B}),4)"
    r = "+".join(f"({v})*eq({i},{k})" for k,v in enumerate(roots))
    kick = f"0.7*sin(2*PI*(45+90*exp(-mod(t,{B})*28))*mod(t,{B}))*exp(-mod(t,{B})*9)"
    clap = f"0.22*(random(0)*2-1)*exp(-mod(t+{B},{2*B})*22)"
    hat = f"0.08*(random(1)*2-1)*exp(-mod(t+{B/2},{B})*70)"
    bass = f"0.22*sin(2*PI*{f0}*pow(2,({r})/12)*t)*(0.55+0.45*exp(-mod(t,{B/2})*7))"
    n = f"mod(floor(t*2/{B}),4)"
    iv = f"(4*eq({n},1)+7*eq({n},2)+12*eq({n},3))"
    lead = f"0.11*sin(2*PI*{f0*4}*pow(2,(({r})+{iv})/12)*t)*exp(-mod(t,{B/2})*6)"
    fade = f"min(1,t/1.5)*min(1,({dur}-t)/2)"
    return f"({kick}+{clap}+{hat}+{bass}+{lead})*{fade}*0.8"
songs = [("01 Marsch – Rohschnitt.mp3",126,73.42,75,[0,-4,-2,-5]),
         ("02 Polka Medley v3.mp3",140,82.41,90,[0,5,7,0]),
         ("03 Finale (Tonstudio).mp3",118,65.41,60,[0,-3,-5,-7])]
for name,bpm,f0,dur,roots in songs:
    open(name+".expr","w").write(expr(bpm,f0,dur,roots))
