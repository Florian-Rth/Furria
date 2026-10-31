import uuid, os, shutil, subprocess
items=[("song1.mp3","01 Marsch – Rohschnitt.mp3","Audio","audio/mpeg"),
       ("song2.mp3","02 Polka Medley v3.mp3","Audio","audio/mpeg"),
       ("song3.mp3","03 Finale (Tonstudio).mp3","Audio","audio/mpeg"),
       ("trainer1.mp4","Marsch Probe 14.10.mp4","Video","video/mp4"),
       ("trainer2.mp4","Polka Probe 21.10.mp4","Video","video/mp4")]
root=os.environ.get("MEDIA_ROOT", os.path.expanduser("~/furria-rfc52-media"))
sql=[]
for src,name,kind,ct in items:
    k=uuid.uuid4(); h=k.hex
    d=f"{root}/originals/{h[:2]}"; os.makedirs(d,exist_ok=True); shutil.copy(src,f"{d}/{h}")
    size=os.path.getsize(src)
    sql.append(f"with m as (insert into media_item(storage_key,owner_kind,owner_act_id,kind,state,original_file_name,content_type,byte_size,uploaded_by_person_id,uploaded_at) values ('{k}','Act',3,'{kind}','Processing','{name}','{ct}',{size},2,now()) returning id) insert into media_job(media_item_id,enqueued_at,available_at,attempts) select id,now(),now(),0 from m;")
open("media.sql","w").write("\n".join(sql))
