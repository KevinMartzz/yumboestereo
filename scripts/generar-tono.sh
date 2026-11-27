#!/usr/bin/env bash
# Genera el audio de prueba que suena mientras no tengamos la URL real del streaming.
set -euo pipefail
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='0.18*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*0.25*t))+0.12*sin(2*PI*277.18*t)*(0.6+0.4*sin(2*PI*0.2*t+1))+0.10*sin(2*PI*329.63*t)*(0.6+0.4*sin(2*PI*0.15*t+2))':s=22050:d=24" \
  -af "afade=t=in:d=1.5,afade=t=out:st=22.5:d=1.5" -ac 1 -b:a 48k public/audio/tono-prueba.mp3
