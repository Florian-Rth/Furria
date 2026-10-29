import json, math, os
S1,S2,S3,V1,V2=(int(x) for x in os.environ.get('MEDIA_IDS','17,18,19,20,21').split(','))
B={S1:60/126,S2:60/140,S3:60/118}
cut={S1:(0.0,128*B[S1]),S2:(32*B[S2],192*B[S2]),S3:(0.0,96*B[S3])}
def at(src,beat): return round(cut[src][0]+beat*B[src],4)
steps=[(S1,0,"Einmarsch","Von links hinten im Marschschritt, Arme gestreckt, auf 8 stehen alle in der hinteren Linie.","line_back"),
 (S1,16,"Aufstellung","Zwei Reihen öffnen, vordere Reihe geht auf 1–4 vor, hintere bleibt. Gruß auf 7–8.","two_lines"),
 (S1,32,"Kicklinie","Alle in eine Linie vorne, Kicks ab Zählzeit 1 im Wechsel rechts/links, Schultern eingehakt.","front_line"),
 (S1,64,"Rad","Kreis bilden, gegen den Uhrzeigersinn drehen, auf 8 halbe Drehung geschafft.","wheel"),
 (S1,96,"Diagonale","Diagonale von hinten links nach vorne rechts, Welle von vorne nach hinten.","diagonal"),
 (S2,0,"Polka-Wechsel","Wechselschritt im Block, auf jede 1 ein Seitenwechsel der Reihen.","block"),
 (S2,32,"Paare","Paare bilden, Einhaken und drehen, Platz bleibt gleich.","pairs"),
 (S2,64,"Sprünge","Block springt auf 1–4 nach rechts, auf 5–8 zurück.","block_jump"),
 (S2,96,"Kreis","Großer Kreis, Hände gefasst, im Uhrzeigersinn laufen.","circle_big"),
 (S2,128,"Kreis auf","Kreis öffnet sich zum V, Spitze vorne Mitte.","v_shape"),
 (S3,0,"Pyramide","Drei Reihen 5–4–3, hinten stehen, Mitte kniet, vorne sitzt.","pyramid"),
 (S3,32,"Hebung","Platz 1 wird von 2 und 3 gehoben, alle anderen öffnen nach außen.","lift"),
 (S3,64,"Schlussbild","Bogen vorne, Arme hoch auf 8, Halten bis Musikende.","final_arc")]
W,D=10.0,7.0
def row(n,y,x0=-4.4,x1=4.4): return [(round(x0+(x1-x0)*i/(n-1),2),y) for i in range(n)]
def circle(r,cx=0,cy=3.5,rot=0): return [(round(cx+r*math.sin(2*math.pi*i/12+rot),2),round(cy+r*math.cos(2*math.pi*i/12+rot),2)) for i in range(12)]
F={}
F["line_back"]=row(12,6.0)
F["two_lines"]=row(6,2.0,-4,4)+row(6,4.2,-3.4,3.4)
F["front_line"]=row(12,1.2)
F["wheel"]=circle(2.4)
F["diagonal"]=[(round(-4.4+8.8*i/11,2),round(6.2-5.2*i/11,2)) for i in range(12)]
F["block"]=row(4,1.8,-2.4,2.4)+row(4,3.3,-2.4,2.4)+row(4,4.8,-2.4,2.4)
F["pairs"]=[p for i in range(6) for p in [(round(-4+1.6*i-0.3,2),2.6 if i%2 else 3.8),(round(-4+1.6*i+0.3,2),2.6 if i%2 else 3.8)]]
F["block_jump"]=F["block"]
F["circle_big"]=circle(3.0)
F["v_shape"]=[(round(-4.4+0.8*i,2),round(1.2+0.9*i,2)) for i in range(6)][::-1]+[(round(0.4+0.8*i,2),round(1.2+0.9*i,2)) for i in range(6)]
F["v_shape"]=[(0,1.0)]+[(round(-0.8*k,2),round(1.0+0.9*k,2)) for k in range(1,6)]+[(round(0.8*k,2),round(1.0+0.9*k,2)) for k in range(1,6)]+[(0,5.6)]
F["pyramid"]=row(3,1.6,-1.6,1.6)+row(4,3.2,-2.7,2.7)+row(5,4.8,-3.6,3.6)
F["lift"]=[(0,3.0),(-0.7,3.0),(0.7,3.0)]+row(4,2.0,-4.4,-2.0)[:2]+row(4,2.0,2.0,4.4)[2:]+row(5,4.8,-4.4,4.4)
F["lift"]=[(0,3.0),(-0.7,3.0),(0.7,3.0),(-4.2,1.6),(-3.0,2.4),(3.0,2.4),(4.2,1.6),(-4.0,5.0),(-2.0,5.4),(0.0,5.6),(2.0,5.4),(4.0,5.0)]
F["final_arc"]=[(round(4.2*math.sin(-1.2+2.4*i/11),2),round(1.0+1.6*(1-math.cos(-1.2+2.4*i/11)),2)) for i in range(12)]
for k,v in F.items(): assert len(v)==12,(k,len(v)); assert all(-5<=x<=5 and 0<=y<=7 for x,y in v),k
ends=[]
for i,s in enumerate(steps):
    nxt=steps[i+1] if i+1<len(steps) else None
    end_beat = nxt[1] if nxt and nxt[0]==s[0] else (cut[s[0]][1]-cut[s[0]][0])/B[s[0]]
    ends.append(end_beat)
spot_ids=list(range(1,13))
def kf(src,beat,pos,ease="easeInOut",bend=None,facing=None):
    return {"at":{"sourceMediaItemId":src,"seconds":at(src,beat)},"position":{"rightMetres":pos[0],"backMetres":pos[1]},
            "bend":None if bend is None else {"rightMetres":bend[0],"backMetres":bend[1]},"easing":ease,"facingDegrees":facing}
tracks={i:[] for i in range(12)}
for si,(src,b0,name,desc,f) in enumerate(steps):
    b1=ends[si]; pts=F[f]
    for i in range(12):
        tracks[i].append(kf(src,b0,pts[i]))
        if f=="wheel":
            for q in (1,2,3):
                rot=-math.pi/2*q*0.5
                p=circle(2.4,rot=rot)[i]; mid=circle(2.4*1.08,rot=rot+math.pi/8)[i]
                tracks[i].append(kf(src,b0+8*q,p,"linear",bend=mid,facing=round((math.degrees(2*math.pi*i/12+rot)+90)%360)))
        elif f=="circle_big":
            for q in (1,2):
                rot=math.pi/2*q*0.5
                p=circle(3.0,rot=rot)[i]; mid=circle(3.0*1.08,rot=rot-math.pi/8)[i]
                tracks[i].append(kf(src,b0+10*q,p,"linear",bend=mid))
        elif f=="front_line":
            tracks[i].append(kf(src,b0+8,(pts[i][0],0.6),"easeOut"))
            tracks[i].append(kf(src,b0+16,(pts[i][0],0.6)))
            tracks[i].append(kf(src,b0+24,pts[i],"easeIn"))
        elif f=="block_jump":
            tracks[i].append(kf(src,b0+4,(round(pts[i][0]+1.2,2),pts[i][1]),"easeOut"))
            tracks[i].append(kf(src,b0+8,pts[i],"easeOut"))
            tracks[i].append(kf(src,b0+12,(round(pts[i][0]-1.2,2),pts[i][1]),"easeOut"))
            tracks[i].append(kf(src,b0+16,pts[i],"easeOut"))
        last=tracks[i][-1]
        hold=b1-4
        if steps[si][0]==src and hold>b0+0.01 and f not in("wheel",):
            lp=last["position"]; tracks[i].append(kf(src,hold,(lp["rightMetres"],lp["backMetres"])))
        elif f=="wheel":
            pass
doc={"tracks":[]}
sql=[]
sql.append("begin;")
sql.append("update club_record set stage_width_metres=10, stage_depth_metres=7, stage_artwork_svg=$svg$<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 700\"><rect x=\"0\" y=\"0\" width=\"1000\" height=\"700\" fill=\"#3a2b22\"/><g fill=\"#4a372b\">"+"".join(f"<rect x=\"0\" y=\"{y}\" width=\"1000\" height=\"2\"/>" for y in range(35,700,35))+"</g><rect x=\"0\" y=\"0\" width=\"1000\" height=\"28\" fill=\"#7a1020\"/><rect x=\"0\" y=\"0\" width=\"40\" height=\"700\" fill=\"#5c0c18\"/><rect x=\"960\" y=\"0\" width=\"40\" height=\"700\" fill=\"#5c0c18\"/></svg>$svg$;")
for pid in (12,13,1,4,7):
    sql.append(f"insert into group_membership(group_id,person_id,joined_on) values (1,{pid},'2025-09-01') on conflict do nothing;")
songs=[(S1,0,cut[S1],(0.0,126.0)),(S2,1,cut[S2],(0.0,140.0)),(S3,2,cut[S3],(0.0,118.0))]
for mid,pos,(s,e),(fb,t) in songs:
    sql.append(f"insert into act_song(act_id,media_item_id,position,start_seconds,end_seconds,first_beat_seconds,tempo_bpm) values (3,{mid},{pos},{s:.4f},{e:.4f},{fb},{t});")
for src,b0,name,desc,f in steps:
    sql.append(f"insert into act_step(act_id,start_source_media_item_id,start_seconds,name,description) values (3,{src},{at(src,b0)},'{name}','{desc}');")
sql.append(f"insert into act_video(act_id,media_item_id,name,start_source_media_item_id,start_seconds) values (3,{V1},'Marsch – Probe 14.10.',{S1},2.0),(3,{V2},'Polka – Probe 21.10.',{S2},{at(S2,0)});")
for name,first,vid in (("Marsch","Einmarsch",V1),("Polka","Polka-Wechsel",V2),("Finale","Pyramide",None)):
    v="null" if vid is None else f"(select id from act_video where act_id=3 and media_item_id={vid})"
    sql.append(f"insert into act_part(act_id,first_step_id,name,main_video_id) values (3,(select id from act_step where act_id=3 and name='{first}'),'{name}',{v});")
persons=[2,8,9,10,11,12,13,1,4,7,None,None]
for n,p in enumerate(persons,1):
    sql.append(f"insert into spot(act_id,number,person_id) values (3,{n},{'null' if p is None else p});")
doc_tracks=[]
docjson=json.dumps({"tracks":[{"spotId":"__SPOT%d__"%(i+1),"keyframes":tracks[i]} for i in range(12)]},ensure_ascii=False)
for i in range(12):
    docjson=docjson.replace('"__SPOT%d__"'%(i+1),"' || (select id from spot where act_id=3 and number=%d) || '"%(i+1))
sql.append("insert into choreography(act_id,document,version) values (3,('"+docjson+"')::jsonb,1);")
sql.append("commit;")
open("studio.sql","w").write("\n".join(sql))
print(sum(len(t) for t in tracks.values()), "keyframes")
