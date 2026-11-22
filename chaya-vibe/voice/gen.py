"""Malayalam voice-over with edge-tts (Microsoft neural voice, needs network) → voice/vNN.wav + voice/dur.json"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); VOICE = os.environ.get('VOICE', 'ml-IN-SobhanaNeural')
L = json.load(open(os.path.join(HERE, 'lines.json'))); dur = {}
for ln in L:
    mp3 = os.path.join(HERE, ln['id'] + '.mp3'); wav = os.path.join(HERE, ln['id'] + '.wav')
    cmd = ['edge-tts', '--voice', VOICE, f"--rate={ln.get('rate', '-6%')}", '--text', ln['text'], '--write-media', mp3]
    if os.environ.get('HTTPS_PROXY'): cmd[1:1] = ['--proxy', os.environ['HTTPS_PROXY']]
    subprocess.run(cmd, check=True, capture_output=True)
    # trim silence at both ends, 48 kHz mono
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '48000', '-ac', '1', wav], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout)
    dur[ln['id']] = round(d, 3); os.remove(mp3); print(ln['id'], dur[ln['id']], ln['text'])
json.dump(dur, open(os.path.join(HERE, 'dur.json'), 'w'), indent=1)
