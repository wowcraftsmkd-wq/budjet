"""Speech check: transcribe every voice line with Whisper (Malayalam) and compare with the script."""
import json, os, difflib, unicodedata, re, sys
import whisper
HERE = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(HERE, 'lines.json'))); m = whisper.load_model(os.environ.get('WHISPER', 'small'))
def deva2ml(s): return ''.join(chr(ord(c) + 0x400) if 0x900 <= ord(c) <= 0x97F else c for c in s)  # Devanagari → Malayalam (parallel Unicode blocks)
norm = lambda s: re.sub(r'[\s\.,…?!]', '', unicodedata.normalize('NFC', s))
bad = 0
for ln in L:
    r = deva2ml(m.transcribe(os.path.join(HERE, ln['id'] + '.wav'), language='ml', fp16=False)['text'])
    sim = difflib.SequenceMatcher(None, norm(ln['text']), norm(r)).ratio(); ok = sim >= float(os.environ.get('MIN', .45)); bad += not ok
    print(f"{'OK ' if ok else 'LOW'} {sim:.2f} {ln['id']:5s} {ln['text']}  →  {r.strip()}")
print('lines below threshold:', bad); sys.exit(1 if bad else 0)
