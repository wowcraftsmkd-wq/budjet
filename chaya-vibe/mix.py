"""ചായ വൈബ് — original score (guitar, kalimba, flute, pad, bass: all synthesised) + foley from events.json → out/mix.wav"""
import json, os, sys
import numpy as np
from scipy.signal import lfilter, fftconvolve
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sfx
from sfx import SR, t_, bp, lp, hp, noise, norm, add, thump, rumble, whoosh

rng = np.random.default_rng(7)
EVS = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EVS['dur']; EV = EVS['ev']
N = int((DUR + 1.5) * SR)
music = np.zeros((N, 2)); fx = np.zeros((N, 2)); amb = np.zeros((N, 2))
B = 60 / 72
def bt(b): return b * B
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------- instruments ----------
def guitar(m, d=2.6, v=.6, bright=.5):
    f = mtof(m); n = int(round(SR / f)); L = int(d * SR)
    burst = np.zeros(L); exc = lp(rng.standard_normal(n), 1500 + 4000 * bright); burst[:n] = exc
    dec = .996 if m < 60 else .993
    a = np.zeros(n + 2); a[0] = 1; a[n] = -dec * .5; a[n + 1] = -dec * .5
    y = lfilter([1], a, burst); y = y * np.minimum(1, (L - np.arange(L)) / (.08 * SR))
    body = lp(y, 2600) * .7 + bp(y, 180, 420, 1) * .5
    return norm(body) * v
def kalimba(m, v=.5, d=1.8):
    f = mtof(m); tt = t_(d)
    y = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .7) + .25 * np.sin(2 * np.pi * f * 5.9 * tt) * np.exp(-tt / .06) + .12 * np.sin(2 * np.pi * f * 2.01 * tt) * np.exp(-tt / .3)
    y[:int(.002 * SR)] *= np.linspace(0, 1, int(.002 * SR))
    return y * v
def flute(m, d, v=.35):
    f = mtof(m); tt = t_(d); vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / .5)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    y = np.sin(ph) + .28 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
    y += bp(noise(d), f * .9, min(f * 3, 9000), 1) * .12
    e = np.minimum(1, tt / .14) * np.minimum(1, (d - tt) / .25)
    return y * e * v
def pad(ms, d, v=.12):
    tt = t_(d); y = np.zeros(len(tt))
    for m in ms:
        for det in (-.07, 0, .07):
            f = mtof(m + det); y += sum(np.sin(2 * np.pi * f * h * tt) / h ** 1.6 for h in (1, 2, 3, 4))
    e = np.minimum(1, tt / 1.2) * np.minimum(1, (d - tt) / 1.0)
    return lp(y, 1400) * e * v / len(ms)
def bass(m, d, v=.35):
    f = mtof(m); tt = t_(d)
    y = np.sin(2 * np.pi * f * tt) + .45 * np.sin(4 * np.pi * f * tt) + .2 * np.sin(6 * np.pi * f * tt)
    return y * np.exp(-tt / 1.4) * np.minimum(1, tt / .01) * v

# ---------- harmony: D – Bm – G – A, one chord per bar ----------
CH = [('D', [50, 57, 62, 66, 69], [62, 66, 69]), ('Bm', [47, 54, 59, 62, 66], [59, 62, 66]),
      ('G', [43, 50, 55, 59, 62], [55, 59, 62]), ('A', [45, 52, 57, 61, 64], [57, 61, 64])]
def chord_at(beat): return CH[int(beat // 4) % 4]
ARP = [0, 2, 3, 1, 4, 3, 2, 3]   # fingerpicking order over eighths
MOTIF = [74, 78, 81, 78]          # kalimba: D5 F#5 A5 F#5

def arpeggio(b0, b1, v=.42, sparse=False):
    for e in range(int(b0 * 2), int(b1 * 2)):
        b = e / 2; _, tones, _ = chord_at(b); i = ARP[e % 8]
        if sparse and e % 2: continue
        vv = v * (1.1 if e % 8 == 0 else .85) * rng.uniform(.9, 1.05)
        add(music, guitar(tones[i] + (12 if i >= 3 else 0) * 0, 2.4, vv, .45), bt(b) + rng.uniform(-.006, .006), 1, pan=-.25 + i * .12)
def pads(b0, b1, v=.12):
    b = b0
    while b < b1:
        nb = min(b1, (b // 4 + 1) * 4); _, _, top = chord_at(b)
        add(music, pad(top, bt(nb - b) + 1.0, v), bt(b), 1, 0); b = nb
def basses(b0, b1, v=.32):
    for b in range(int(np.ceil(b0)), int(b1)):
        if b % 4 == 0: add(music, bass(chord_at(b)[1][0] - 12 + 12, bt(4), v), bt(b), 1, 0)
        elif b % 4 == 2: add(music, bass(chord_at(b)[1][0] - 12 + 19, bt(2), v * .6), bt(b), 1, 0)

# hook: one kalimba note on beat 3, then the motif under the steam title (beats 6–11)
add(music, kalimba(74, .5), bt(3), 1, .1)
pads(6, 12, .09)
for k, b in enumerate(range(6, 12)): add(music, kalimba(MOTIF[k % 4], .38), bt(b), 1, .2 * (k % 2 * 2 - 1))
# rain: the guitar enters (beat 12 = 10.0 s)
arpeggio(12, 20, .4); pads(12, 20, .07)
# pour: the drop — single notes, one long flute note while the stream falls
for b in (20, 22, 24): add(music, guitar(chord_at(b)[1][2], 3, .32, .3), bt(b), 1, -.1)
add(music, flute(81, 2.6, .22), 17.0, 1, .15); add(music, flute(78, 1.6, .18), 19.7, 1, .15)
# cabinet: guitar + kalimba on each snack landing (beats 27, 28, 29)
arpeggio(26, 32, .36); pads(26, 32, .06)
for k, b in enumerate((27, 28, 29)): add(music, kalimba([81, 83, 86][k], .42), bt(b), 1, .3)
# bench: guitar + bass; the radio plays a muffled tune (added in the foley section)
arpeggio(32, 39, .36); basses(32, 39, .28); pads(32, 39, .05)
# night: fullest — guitar, flute melody, pad, bass; swell into 42.5
arpeggio(39, 51, .42); basses(39, 51, .34); pads(39, 51, .11)
MEL = [(39, 78, 2), (41, 76, 1), (42, 74, 1), (43, 71, 3), (46, 74, 1), (47, 76, 2), (49, 78, 1), (50, 81, 1.4)]
for b, m, d in MEL: add(music, flute(m, bt(d) + .15, .24), bt(b), 1, .15)
# 42.5–48.33: silence (only room and steam). Payoff on beat 58: motif returns, guitar chord rings out
for k, b in enumerate(range(58, 66)): add(music, kalimba(MOTIF[k % 4], .36), bt(b), 1, .2 * (k % 2 * 2 - 1))
arpeggio(60, 66, .3, sparse=True); pads(58, 68, .08)
for i, m in enumerate([50, 57, 62, 66, 69]): add(music, guitar(m, 4.5, .3, .35), bt(66) + i * .05, 1, -.2 + i * .1)
# swell before the silence: slow crescendo envelope over the night section
g = np.ones(N); s0, s1 = int(bt(39) * SR), int(42.5 * SR); g[s0:s1] = np.linspace(.85, 1.2, s1 - s0)
g[s1:s1 + int(.25 * SR)] = np.linspace(1.2, 0, int(.25 * SR)); g[s1 + int(.25 * SR):int(bt(58) * SR) - 400] = 0
music *= g[:, None]

# ---------- reverb for the music ----------
def reverb(x, sec=1.8, wet=.28):
    ir_t = t_(sec); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / (sec / 5)); ir = lp(ir, 5000); ir /= np.abs(ir).sum() ** .5 * 6
    return x * (1 - wet) + np.stack([fftconvolve(x[:, c], ir)[:len(x)] for c in (0, 1)], 1) * wet * 3
music = reverb(music)
music = np.stack([hp(music[:, c], 110, 2) for c in (0, 1)], 1)  # keep the low end light

# ---------- foley ----------
def coin(v=1):
    tt = t_(.45); y = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in ((2210, 1, .18), (3680, .7, .1), (5140, .5, .07), (6900, .3, .05)))
    return (y + hp(noise(.45), 3000) * np.exp(-tt / .004) * 2) * v * .25
def tok(v=1):
    tt = t_(.3); return (thump(v, 160)[:len(tt)] * .8 + np.sin(2 * np.pi * 1850 * tt) * np.exp(-tt / .03) * .35 + bp(noise(.3), 800, 3000) * np.exp(-tt / .01)) * v * .7
def brush(d=1.2, v=1):
    tt = t_(d); y = bp(noise(d), 1800, 6500); trem = .6 + .4 * np.sin(2 * np.pi * 9 * tt + rng.uniform(0, 6))
    return y * trem * np.sin(np.pi * np.minimum(1, tt / d)) ** .8 * v * .06
def hiss(d, v=1):
    tt = t_(d); return hp(noise(d), 3500) * np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 1.0) * v * .025
def rain_bed(d, v=1):
    tt = t_(d); y = lp(bp(noise(d), 500, 7000), 9000) * .05
    drops = np.zeros(len(tt)); idx = rng.integers(0, len(tt), int(d * 40)); drops[idx] = rng.uniform(.2, 1, len(idx))
    y += bp(lfilter([1], [1, -.97], drops), 1500, 6000) * .05
    return y * v
def pour(d, v=1):
    tt = t_(d); mod = lp(rng.standard_normal(len(tt)), 18); mod = .6 + .5 * mod / np.abs(mod).max()
    y = bp(noise(d), 350, 2400) * mod + lp(noise(d), 250) * .4
    return y * np.minimum(1, tt / .15) * np.minimum(1, (d - tt) / .3) * v * .22
def froth(d=1.4, v=1):
    tt = t_(d); pops = np.zeros(len(tt)); idx = rng.integers(0, len(tt), 140); pops[idx] = rng.uniform(.3, 1, 140)
    return (bp(pops, 2500, 9000) * .6 + hp(noise(d), 5000) * .03) * np.exp(-tt / (d * .6)) * v * .5
def slide(v=1):
    d = .5; tt = t_(d); return bp(noise(d), 900, 3200) * np.sin(np.pi * tt / d) * v * .12
def pencil(d=.6, v=1):
    tt = t_(d); y = hp(noise(d), 2500) * (lp(np.abs(rng.standard_normal(len(tt))), 30) * 3)
    return y * np.sin(np.pi * tt / d) * v * .05
def rustle(v=1):
    d = .8; tt = t_(d); env = lp(np.abs(rng.standard_normal(len(tt))), 12); return bp(noise(d), 1500, 7000) * env * 6 * np.sin(np.pi * tt / d) * v * .1
def radio_crackle(d, v=1):
    tt = t_(d); cr = np.zeros(len(tt)); idx = rng.integers(0, len(tt), int(d * 30)); cr[idx] = rng.uniform(-1, 1, len(idx))
    y = bp(cr, 1000, 5000) * .5 + bp(noise(d), 1200, 4000) * .02
    return y * np.minimum(1, tt / .3) * np.minimum(1, (d - tt) / .5) * v
def radio_tune(t0, d):  # an old-sounding melody squeezed through a small speaker
    buf = np.zeros(int((d + 2) * SR)); notes = [69, 71, 73, 74, 73, 71, 69, 66, 64, 66, 69]
    for i, m in enumerate(notes):
        tt = t_(.5); y = (np.sin(2 * np.pi * mtof(m) * tt) + .5 * np.sign(np.sin(2 * np.pi * mtof(m) * tt)) * .3) * np.exp(-tt / .35)
        s = int(i * .48 * SR); buf[s:s + len(y)] += y
    y = sfx.radio(buf)[:int(d * SR)]; tt = t_(d)
    return y * np.minimum(1, tt / .4) * np.minimum(1, (d - tt) / .6) * .05
def horn(v=1):
    d = 1.1; tt = t_(d); y = np.zeros(len(tt))
    for f in (330, 415): y += np.tanh(3 * np.sin(2 * np.pi * f * tt))
    y = lp(y, 1600) * np.minimum(1, tt / .05) * np.minimum(1, (d - tt) / .2)
    y[int(.45 * SR):int(.6 * SR)] *= .15
    return y * v * .05
def crickets(d, v=1):
    tt = t_(d); y = np.zeros(len(tt))
    for k in range(3):
        f = 4300 + k * 350; rate = 2.6 + k * .5; gate = (np.sin(2 * np.pi * rate * tt + k) > .55) * (np.sin(2 * np.pi * 38 * tt) > 0)
        y += np.sin(2 * np.pi * f * tt) * lp(gate.astype(float), 400) * .5
    return y * np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 1.0) * v * .02
def bike(v=1):
    d = 3.0; tt = t_(d); pulse = (np.sin(2 * np.pi * 14 * tt) > .7).astype(float)
    y = lp(pulse, 120) + lp(noise(d), 200) * .2
    return y * np.minimum(1, tt / .3) * np.exp(-tt / 1.6) * v * .2
def clink(v=1):
    tt = t_(.9); y = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in ((2630, 1, .35), (4120, .6, .22), (6310, .4, .12), (3370, .5, .28)))
    return y * v * .18
def bird(v=1):
    d = .35; tt = t_(d); f = 3200 + 1600 * np.sin(np.pi * tt / d) ** 2; ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.sin(np.pi * tt / d) * (np.sin(2 * np.pi * 22 * tt) > -.3) * v * .04
def mist(v=1): return whoosh(.9, v)[:int(.9 * SR)] * .25

for e in EV:
    t, ty, d = e['t'], e['type'], e.get('d', 1.0)
    if ty == 'coin': add(fx, coin(), t, 1, -.35)
    elif ty == 'tok': add(fx, tok(1.2 if t > 40 else 1), t, 1, 0)
    elif ty == 'brush': add(fx, brush(d), t, 1, rng.uniform(-.4, .4))
    elif ty == 'hiss': add(fx, hiss(d), t, 1, 0)
    elif ty == 'kalimba': pass  # scored above
    elif ty == 'mist': add(fx, mist(), t - .45, 1, 0)
    elif ty == 'rainIn':
        r = rain_bed(26.67 - t + .5); env = np.ones(len(r)); tt = t_(len(r) / SR) + t
        env *= np.clip((tt - t) / 1.2, 0, 1)                       # fade in (J-cut under the steam)
        env *= np.where(tt < 16.67, 1, np.where(tt < 21.67, .35, np.clip(.35 * (26.67 - tt) / 5, 0, .35)))  # ducked in pour, fading in cabinet
        add(amb, r * env, t, 1, 0)
    elif ty == 'thunder': add(amb, bp(rumble(3.0, .5), 60, 300) * .35, t, 1, .3)
    elif ty == 'pour': add(fx, pour(d), t, 1, -.1)
    elif ty == 'froth': add(fx, froth(), t, 1, -.2)
    elif ty == 'slide': add(fx, slide(), t, 1, .2)
    elif ty == 'thump': add(fx, thump(.8, 110) * .5, t, 1, rng.uniform(-.3, .3))
    elif ty == 'pencil': add(fx, pencil(d if d > .6 else .6), t, 1, .25)
    elif ty == 'radio': add(fx, radio_crackle(d) * .35 + radio_tune(t, d), t, 1, .55)
    elif ty == 'rustle': add(fx, rustle(), t, 1, -.3)
    elif ty == 'horn': add(amb, horn(), t, 1, .5)
    elif ty == 'crickets': add(amb, crickets(d), t, 1, 0)
    elif ty == 'bike': add(amb, bike(), t, 1, .4)
    elif ty == 'clink': add(fx, clink(), t, 1, -.2)
# evening birds over the bench; steam hiss and room in the silence; room tone throughout
for k in range(5): add(amb, bird(rng.uniform(.6, 1)), 27.2 + k * 1.05 + rng.uniform(0, .3), 1, rng.uniform(-.6, .6))
add(amb, hiss(6.2, 1.2), 42.4, 1, 0); add(amb, hiss(8.0, .8), 48.3, 1, 0)
room = bp(sfx.brown(DUR + 1.5), 120, 500); room = room / np.abs(room).max() * .012; amb[:len(room)] += room[:N, None]

# ---------- mix ----------
fx = np.stack([hp(fx[:, c], 90, 2) for c in (0, 1)], 1); amb = np.stack([hp(amb[:, c], 70, 2) for c in (0, 1)], 1)
mix = music * .85 + fx * 1.0 + amb * 1.0
# music ducks a little under the pour and the clink
mix = mix / np.abs(mix).max() * .89
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'mix.wav')
sf.write(out, mix[:int(DUR * SR)].astype(np.float32), SR)
print('mix →', out, f'{DUR:.2f}s')
