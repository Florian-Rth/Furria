#!/usr/bin/env bash
# Seeds a realistic dance studio onto act 3 of a branch database for the studio lab (RFC 0001 phase 6):
# 3 synthetic songs, 2 trainer videos, 13 steps in 3 parts, 12 spots, a choreography and our stage.
#
#   scripts/studio-seed/seed.sh <database> <media-root> <worker-image>
#
# The worker of that database must run, so the media items get their renditions and analysis.
set -euo pipefail
DB=$1 MEDIA=$2 IMAGE=$3
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK="$HOME/furria-studio-seed"
mkdir -p "$WORK" && cp "$HERE"/*.py "$WORK" && cd "$WORK"
psql_db() { docker exec -i furria-dev-postgres psql -q -U furria -d "$DB" "$@"; }
ffmpeg_run() { docker run --rm --user "$(id -u):$(id -g)" -v "$WORK:/w" -w /w --entrypoint ffmpeg "$IMAGE" -hide_banner -loglevel error -y "$@"; }

python3 gen.py
durations=(75 90 60)
i=0
for expr in *.expr; do
  ffmpeg_run -f lavfi -i "aevalsrc=exprs='$(cat "$expr")':s=44100:d=${durations[$i]}" -ac 2 -b:a 192k "song$((i + 1)).mp3"
  i=$((i + 1))
done
ffmpeg_run -f lavfi -i "color=c=0x23262e:s=1280x720:r=30:d=40" -ss 2 -t 40 -i song1.mp3 -f lavfi -i "anoisesrc=a=0.03:d=40" \
  -filter_complex "[0:v]drawbox=x='640+300*sin(t*1.3)-60':y=250:w=120:h=320:color=0xe8e2d0@1:t=fill,drawbox=x='640-300*sin(t*1.3)-60':y=250:w=120:h=320:color=0xc8102e@1:t=fill,drawtext=text='Training %{pts\:hms}':x=40:y=40:fontsize=36:fontcolor=white[v];[1:a][2:a]amix=inputs=2:duration=first[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest trainer1.mp4
ffmpeg_run -f lavfi -i "color=c=0x2a2420:s=1280x720:r=30:d=36" -ss 13.714 -t 36 -i song2.mp3 -f lavfi -i "anoisesrc=a=0.03:d=36" \
  -filter_complex "[0:v]drawbox=x='640+200*cos(t*2.1)-60':y='260+40*sin(t*4.2)':w=120:h=300:color=0xe8e2d0@1:t=fill,drawtext=text='Polka – Probe %{pts\:hms}':x=40:y=40:fontsize=36:fontcolor=white[v];[1:a][2:a]amix=inputs=2:duration=first[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest trainer2.mp4

MEDIA_ROOT="$MEDIA" python3 media.py
psql_db <media.sql
until [ "$(psql_db -tAc "select count(*) from media_item where owner_act_id=3 and state='Processing'")" = 0 ]; do sleep 3; done
ids() { psql_db -tAc "select id from media_item where owner_act_id=3 and original_file_name='$1' order by id desc limit 1"; }
MEDIA_IDS="$(ids '01 Marsch – Rohschnitt.mp3'),$(ids '02 Polka Medley v3.mp3'),$(ids '03 Finale (Tonstudio).mp3'),$(ids 'Marsch Probe 14.10.mp4'),$(ids 'Polka Probe 21.10.mp4')" \
  python3 studio.py
psql_db <studio.sql
