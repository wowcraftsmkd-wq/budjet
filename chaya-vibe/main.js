// ചായ വൈബ് — timeline, scenes, text, render(t). Vertical 1080×1920.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const BPM = 72, B = 60 / BPM;            // beat 0.8333 s
const SC = { hook: [0, 10], rain: [10, 16.667], pour: [16.667, 21.667], cab: [21.667, 26.667], bench: [26.667, 32.5], night: [32.5, 42.5], end: [42.5, 56.667] };
window.DUR = 56.667;
let PAPER_IMG, O = {};

// ---------- on-screen lines (also the subtitles) ----------
// [id, start, end, text, y, size, weight, colour]
const TX = [
  ['l1', 0.3, 5.2, 'ഒരു ഗ്ലാസ് ചായക്ക് എത്ര രൂപയാ?', 340, 62, 700],
  ['l2', 2.091, 5.2, 'പത്തോ? പതിനഞ്ചോ?', 435, 54, 500],
  ['l3a', 5.3, 9.95, 'പക്ഷേ അതിന്റെ കൂടെ കിട്ടുന്നതിന്…', 330, 50, 500],
  ['l3b', 7.226, 9.95, 'വിലയിടാൻ പറ്റില്ല.', 420, 62, 700],
  ['l4a', 10.6, 16.6, 'മഴ കനക്കുമ്പോൾ,\nഓലപ്പുരയുടെ താഴെ നിന്ന്', 290, 56, 600],
  ['l4b', 13.197, 16.6, 'ഊതിയൂതി കുടിക്കുന്ന\nഒരു ചൂട് ചായ.', 470, 60, 700],
  ['l5', 17.1, 21.6, 'ചേട്ടൻ നീട്ടിയടിക്കുമ്പോൾ\nപൊങ്ങുന്ന ആ പത…', 255, 58, 700],
  ['l6a', 22.0, 26.6, 'ചില്ലലമാരയിലെ പഴംപൊരി.', 250, 60, 700],
  ['l6b', 23.635, 26.6, 'ആദ്യം കണ്ണുകൊണ്ടാ കഴിക്കുന്നത്.', 335, 48, 500],
  ['l7a', 27.0, 32.45, 'റേഡിയോയിൽ ഒരു പഴയ പാട്ട്,\nബെഞ്ചിൽ ഒരു പത്രം,', 260, 54, 600],
  ['l7b', 29.965, 32.45, 'ചുറ്റും കുറെ നാട്ടുവർത്തമാനം.', 405, 56, 700],
  ['l8a', 33.0, 37.95, 'ആദ്യ ശമ്പളം കിട്ടിയ ദിവസവും,', 300, 54, 600, 'night'],
  ['l8b', 34.955, 37.95, 'എല്ലാം കൈവിട്ടുപോയ രാത്രിയും…', 385, 54, 600, 'night'],
  ['l9', 38.0, 42.45, 'കൂട്ടുകാരുടെ കൂടെ\nഒരു ചായ മതിയായിരുന്നു.', 340, 62, 700, 'night'],
  ['l10a', 42.9, 48.2, 'അതുകൊണ്ടാ നമ്മൾ\nചായ കുടിക്കാൻ പോകുന്നത്.', 1380, 56, 600],
  ['l10b', 45.33, 48.2, 'ചായക്ക് വേണ്ടി മാത്രമല്ല…', 1530, 58, 700],
  ['l11', 48.333, 51.3, 'ആ വൈബിന് വേണ്ടി.', 1430, 96, 800, 'pay'],
  ['c1', 51.2, 57.5, 'നിന്റെ ചായ സ്പോട്ട് ഏതാ?', 320, 70, 800],
  ['c2', 52.968, 57.5, 'കമന്റ് ചെയ്യ്,\nകൂടെ വരുന്ന ആളെ ടാഗ് ചെയ്യ്.', 450, 50, 600],
];
const TMAXW = 960;
function fitFont(txt, size, weight) { let s = size; ctx.font = `${weight} ${s}px NSM`; while (ctx.measureText(txt).width > TMAXW && s > 20) { s -= 2; ctx.font = `${weight} ${s}px NSM`; } return s; }
function lineAlpha(t, r) { const [, a, b] = r; return ss(seg(t, a - .05, a + .2)) * (1 - ss(seg(t, b - .35, b))); }
function drawLine(t, r) {
  const [id, a, b, txt, y, size, wt, kind] = r; const f = lineAlpha(t, r); if (f <= 0) return;
  const L = txt.split('\n'), s = Math.min(...L.map(l => fitFont(l, size, wt))); ctx.font = `${wt} ${s}px NSM`;
  const w = Math.max(...L.map(l => ctx.measureText(l).width)), x0 = 540 - w / 2, lh = s * 1.42, yT = y - (L.length - 1) * lh / 2;
  const rev = kind === 'pay' ? eo(seg(t, a, a + .35)) : eo(seg(t, a, a + .7));
  const night = kind === 'night', col = night ? '#f6ecd8' : C.ink, halo = night ? 'rgba(20,24,42,.9)' : rgba(PAPER, .95);
  ctx.save(); ctx.globalAlpha = f; ctx.beginPath(); ctx.rect(x0 - 20, yT - s * 1.4, (w + 40) * rev, s * 2.4 + (L.length - 1) * lh); ctx.clip();
  ctx.font = `${wt} ${s}px NSM`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.shadowColor = halo; ctx.shadowBlur = night ? 22 : 18;
  if (kind === 'pay') { // "വൈബിന്" in the accent
    const parts = ['ആ ', 'വൈബിന്', ' വേണ്ടി.']; let x = x0;
    for (let k = 0; k < 2; k++) { x = x0; for (const p of parts) { ctx.fillStyle = p === 'വൈബിന്' ? C.red : col; ctx.fillText(p, x, y); x += ctx.measureText(p).width; } }
  } else { ctx.fillStyle = col; ctx.textAlign = 'center'; for (let k = 0; k < 2; k++) L.forEach((l, i) => ctx.fillText(l, 540, yT + i * lh)); }
  ctx.restore();
}
window.TEXTS = t => TX.filter(r => lineAlpha(t, r) > .9 && t > r[1] + (r[7] === 'pay' ? .35 : .7)).map(r => { const L = r[3].split('\n'), s = Math.min(...L.map(l => fitFont(l, r[5], r[6]))); ctx.font = `${r[6]} ${s}px NSM`; const w = Math.max(...L.map(l => ctx.measureText(l).width)), hh = s + (L.length - 1) * s * .71; return { id: r[0], text: r[3].replace('\n', ' '), x0: 540 - w / 2, y0: r[4] - hh, x1: 540 + w / 2, y1: r[4] + hh }; });

// ---------- helpers ----------
function put(o, p, x, y, s = 1, a = 1) { // draw a built object: stroke by stroke while painting, sprite after
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  if (p < 1) drawList(ctx, o.S, p); else ctx.drawImage(o.spr.cv, o.spr.x0, o.spr.y0);
  ctx.restore();
}
function mist(c, seedX = 0) { // paper-coloured steam rising from the bottom, erasing the picture
  if (c <= 0) return;
  for (const [lift, a] of [[160, .5], [0, 1]]) {
    const top = H + 120 - c * (H + 520) - lift;
    ctx.save(); ctx.beginPath(); ctx.moveTo(-10, H + 10);
    for (let x = -10; x <= W + 40; x += 30) ctx.lineTo(x, top + (vnoise(x * .007 + lift + seedX) - .5) * 220 + Math.sin(x * .012 + c * 6) * 18);
    ctx.lineTo(W + 10, H + 10); ctx.closePath(); ctx.clip(); ctx.globalAlpha = a; ctx.drawImage(PAPER_IMG, 0, 0); ctx.restore();
  }
}
function steam(x, y, t, s = 1, a = .5, n = 4, len = 16) { // rising wisps, pure function of t
  for (let k = 0; k < n; k++) withSeed(300 + k, () => {
    const pts = [], ph = t * 1.5 + k * 2.1, off = (k - (n - 1) / 2) * 16 * s;
    for (let j = 0; j <= len; j++) { const u = j / len, amp = (8 + u * 46) * s; pts.push([x + off * (1 - u * .4) + Math.sin(j * .55 - ph) * amp + Math.sin(j * .21 + k) * 10 * s, y - j * 26 * s - ((t * 30 + k * 13) % 26) * s]); }
    const st = mk(pts, 15 * s, '#b9ab9a', { prof: 'leaf', nb: 3, a: a * .6, rough: .35 });
    ctx.save(); ctx.globalAlpha = .55 + .45 * Math.sin(t * 1.3 + k); drawS(ctx, st, 1); ctx.restore();
  });
}
function cam(s, fx, fy, tx = 0, ty = 0) { ctx.setTransform(s, 0, 0, s, 540 - fx * s + tx, 960 - fy * s + ty); }
const reset = () => ctx.setTransform(1, 0, 0, 1, 0, 0);

// ---------- scene: hook + steam title (0–10) ----------
function drawHook(t) {
  const push = 1 + .1 * eio(seg(t, 0, 5)), tilt = -470 * eio(seg(t, 4.6, 8.8));
  cam(push, 540, 1000, 0, -tilt);
  put(O.bgWarm, seg(t, 0, 1.2), 0, 0);
  put(O.counter, seg(t, 0, .9), 0, 0);
  // coins drop and settle
  for (const [k, t0, x] of [[0, .15, 330], [1, .45, 410]]) { const u = seg(t, t0 - .25, t0), b = t > t0 ? Math.abs(Math.sin((t - t0) * 18)) * Math.exp(-(t - t0) * 9) * 18 : 0;
    put(O.coin, 1, x, 1228 + k * 22 - (1 - u) * 260 - b, 1, ss(u * 3)); }
  put(O.glass, seg(t, .55, 2.4), 540, 1210, 1.5);
  if (t > 2.2) steam(540, 1210 - 450 * .8, t, 1.3, ss(seg(t, 2.2, 3.4)) * .8, 4, 22 + Math.floor(12 * seg(t, 4.5, 7)));
  // "ചായ" written in steam, high above the glass
  const wf = ss(seg(t, 6.0, 7.2)) * (1 - ss(seg(t, 9.0, 9.6)));
  if (wf > 0) { ctx.save(); ctx.font = '230px Chilanka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const yy = 300 - 20 * seg(t, 6, 9.6), rv = eo(seg(t, 6.0, 7.4));
    ctx.beginPath(); ctx.rect(0, yy + 160 - 360 * rv, W, 400); ctx.clip();
    ctx.shadowColor = 'rgba(160,145,128,.6)'; ctx.shadowBlur = 26; ctx.fillStyle = rgba('#a89a88', .55 * wf);
    ctx.translate(540 + Math.sin(t * 1.4) * 6, yy); ctx.transform(1, 0, Math.sin(t * .9) * .04, 1, 0, 0); ctx.fillText('ചായ', 0, 0); ctx.fillText('ചായ', 0, 0); ctx.restore(); }
  reset();
}

// ---------- scene: rain at the stall (10–16.7) ----------
function drawRain(t) {
  const u = t - SC.rain[0], camX = lerp(60, 980, eio(seg(u, 0, 6.67)));
  // sky + far greens (screen-fixed washes with slow parallax)
  put(O.sky, seg(u, 0, .7), -camX * .1, 0);
  for (const [px, x] of O.palms) { const sx = x - camX * .45; if (sx > -500 && sx < 1500) put(px, clamp((1250 - sx) / 500) * seg(u, 0, 1.2), sx, 1520, 1, .55); }
  put(O.ground, seg(u, .1, .9), -camX * .9, 0);
  const shopX = 260 - camX; put(O.shop, clamp((Math.min(lerp(-200, 1700, seg(u, 0, 1.6)), 1250) - shopX) / 900), shopX, 1500);
  // sign text
  const sp = seg(u, .9, 1.8); if (sp > 0) { ctx.save(); ctx.globalAlpha = sp; ctx.font = '700 70px NSM'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8a2f1e'; ctx.fillText('ചായക്കട', shopX + 620, 1500 - 700 - 92); ctx.restore(); }
  for (const [pp, wx, y] of O.rainPeople) { const sx = wx - camX; if (sx > -200 && sx < 1300) put(pp, clamp((1250 - sx) / 400) * seg(u, .4, 1.6), sx, y, 1); }
  // glass at the drinker's lips + steam
  const gx = 260 + 470 - camX; steam(gx + 22, 1500 - 600 * .95 - 40, t, .5, .5, 3, 10);
  // umbrella walker crossing right → left
  const wx = lerp(1500, 1050, u / 6.67) - camX * .2, bob = Math.abs(Math.sin(u * 4.2)) * 8;
  put(O.walker, seg(u, 1, 2), wx, 1700 - bob, 1);
  // foreground plantain leaves
  put(O.fg, seg(u, .3, 1.3), -60 - camX * .25, 1920);
  // rain
  ctx.save(); ctx.strokeStyle = rgba('#6f8698', .6 * seg(u, -0.6, .4)); ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 340; i++) { const x0 = hash(i) * 1300 - 100, sp2 = 900 + hash(i + 7) * 500, y = ((hash(i + 3) * 2100 + t * sp2) % 2100) - 150, l = 30 + hash(i + 9) * 34;
    ctx.moveTo(x0 - y * .12, y); ctx.lineTo(x0 - (y + l) * .12, y + l); }
  ctx.stroke();
  // eave drips
  ctx.fillStyle = rgba('#6f8794', .7); for (let i = 0; i < 24; i++) { const x = shopX - 60 + i * 58, y = 1500 - 700 + 40 + ((t * 700 + hash(i) * 600) % 700); ctx.beginPath(); ctx.ellipse(x, y, 3, 7, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- scene: pulling the tea (16.7–21.7) ----------
const POUR = [17.8, 19.4];
function drawPour(t) {
  const u = t - SC.pour[0], sw = 1 + .025 * Math.sin(u * .8);
  cam(1.0 + .04 * eio(seg(u, 0, 5)), 540, 1100);
  put(O.pourBg, seg(u, 0, .8), 0, 0);
  put(O.maker, seg(u, .05, 1.2), 470, 2050);
  put(O.jug, seg(u, .3, 1.0), 905, 400 + Math.sin(u * 1.1) * 4, 1.3);
  put(O.tumbler, seg(u, .3, 1.0), 335, 1430, 1.4);
  // the stream: one brush stroke painted from the spout down, then flowing
  const p = eio(seg(t, POUR[0], POUR[1]));
  if (p > 0) withSeed(900 + Math.floor(t * 12), () => { const pts = qctrl(888, 392, 560, 700 + 30 * Math.sin(u), 338, 1225, 26);
    drawS(ctx, mk(pts, 15, C.tea, { prof: 'even', nb: 5, a: .85, rough: .3 }), p);
    if (p > .3) for (let i = 0; i < 8; i++) { const k = 6 + Math.floor(hash(i + Math.floor(t * 12)) * 18), [px, py] = pts[Math.min(k, Math.floor(p * 26))]; ctx.fillStyle = rgba(C.tea, .6); ctx.beginPath(); ctx.ellipse(px + (hash(i * 3 + t) - .5) * 50, py + (hash(i * 5) - .5) * 30, 4, 6, 0, 0, 7); ctx.fill(); } });
  // froth rising in the tumbler
  const fr = seg(t, POUR[1] - .4, POUR[1] + 1.2); if (fr > 0) withSeed(950 + Math.floor(t * 12), () => { for (let i = 0; i < 14; i++) { const x = 335 + (hash(i) - .5) * 130, y = 1222 - fr * 26 - hash(i + 2) * 22 + Math.sin(t * 6 + i) * 3; drawS(ctx, mk(qcurve(x - 10, y, x + 10, y, -4, 4), 12, C.froth, { prof: 'leaf', nb: 0, a: .85 }), 1); } });
  reset();
}

// ---------- scene: the glass cabinet (21.7–26.7) ----------
function drawCab(t) {
  const u = t - SC.cab[0];
  cam(1 + .03 * eio(seg(u, 0, 5)), 540, 960);
  put(O.cabBg, seg(u, 0, .6), 0, 0);
  put(O.cab, seg(u, .05, 1.0), 540, 960);
  const rows = [[O.pori, 647, 'പഴംപൊരി'], [O.uvada, 960, 'ഉഴുന്നുവട'], [O.pvada, 1273, 'പരിപ്പുവട']];
  rows.forEach(([o, y, name], r) => { const tl = SC.cab[0] + 1.633 + r * B; // lands on a beat
    for (let i = 0; i < 3; i++) { const v = seg(t, tl - .18 + i * .05, tl + i * .05), sc = .6 + .4 * eo(v), drop = (1 - eo(v)) * 60; if (v > 0) put(o, 1, 330 + i * 210, y + 70 - drop, sc, ss(v * 2)); }
    const nt = tl + .3; if (t > nt) { ctx.globalAlpha = 1; const lp = seg(t, nt, nt + .5), hp = seg(t, nt + .2, nt + .9);
      ctx.save(); ctx.font = '44px Chilanka'; ctx.textBaseline = 'middle'; ctx.textAlign = r === 1 ? 'right' : 'left';
      const lx = r === 1 ? 900 : 180, ly = y - 95; const w = ctx.measureText(name).width, x0 = r === 1 ? lx - w : lx;
      ctx.beginPath(); ctx.rect(x0 - 8, ly - 40, (w + 16) * eo(hp), 80); ctx.clip(); ctx.shadowColor = rgba(PAPER, .95); ctx.shadowBlur = 12; ctx.fillStyle = C.red; ctx.fillText(name, lx, ly); ctx.fillText(name, lx, ly); ctx.restore();
      const ax = r === 1 ? 760 : 330, ay = y + 30; const pts = qcurve(r === 1 ? lx - w / 2 : lx + w / 2, ly + 24, ax, ay - 20, 22, 14), m = Math.max(1, Math.round(14 * lp));
      ctx.beginPath(); for (let i = 0; i <= m; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); ctx.strokeStyle = rgba(C.ink, .7); ctx.lineWidth = 2; ctx.stroke(); }
  });
  reset();
}

// ---------- scene: the bench, radio and newspaper (26.7–32.5) ----------
function drawBench(t) {
  const u = t - SC.bench[0], camX = lerp(0, 380, eio(seg(u, 0, 5.83)));
  ctx.setTransform(1, 0, 0, 1, -camX, 0);
  put(O.wall, seg(u, 0, .7), 0, 0);
  put(O.window, seg(u, .2, 1.0), 0, 0);
  put(O.bench, seg(u, .2, .9), 720, 1480);
  put(O.manA, seg(u, .3, 1.3), 520, 1480, 1.15);
  put(O.paper, seg(u, .9, 1.4), 520, 1480 - 1.15 * 470, 1.15);
  { const a = ss(seg(u, 1.3, 1.7)); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.font = '700 34px NSM'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink; ctx.fillText('പത്രം', 520, 1480 - 1.15 * 470 + 1.15 * 22); ctx.restore(); } }
  put(O.manB, seg(u, .45, 1.45), 930, 1480, 1.15);
  put(O.glassS, seg(u, 1.0, 1.4), 930 + 1.15 * 22, 1480 + 1.15 * (-580 + 70), .33);
  put(O.shelf, seg(u, .3, .8), 0, 0);
  put(O.radio, seg(u, .4, 1.1), 1260, 900, 1.2);
  // music notes floating out of the radio
  for (let i = 0; i < 6; i++) { const ph = ((u - .9) * .45 + i / 6) % 1; if (u < .9 + i * .3) continue;
    const x = 1210 - ph * 260 + Math.sin(ph * 9 + i) * 26, y = 720 - ph * 360, a = Math.sin(Math.PI * ph) * .8;
    withSeed(500 + i, () => { const s = mk(qcurve(x, y, x, y - 46, 0, 5), 4, C.ink, { prof: 'even', nb: 0, a }); drawS(ctx, s);
      ctx.fillStyle = rgba(C.ink, a); ctx.beginPath(); ctx.ellipse(x - 9, y + 2, 11, 8, -.4, 0, 7); ctx.fill();
      if (i % 2) { ctx.strokeStyle = rgba(C.ink, a); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 46); ctx.quadraticCurveTo(x + 20, y - 36, x + 18, y - 18); ctx.stroke(); } }); }
  // evening light
  reset(); const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(242,190,110,.16)'); g.addColorStop(1, 'rgba(242,190,110,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------- scene: the night stall (32.5–42.5) ----------
const BULB = [540, 760];
function drawNight(t) {
  const u = t - SC.night[0], s = lerp(2.4, 1, eio(seg(u, 0, 4.2)));
  cam(s, BULB[0], BULB[1], 0, (BULB[1] - 960) * (s - 1) / s * 0);
  ctx.fillStyle = rgba('#262f4f', ss(seg(u, -.2, .3))); ctx.fillRect(-500, -500, 2100, 2900);
  put(O.nightSky, seg(u, -.2, .4), 0, 0);
  put(O.nightStall, seg(u, 0, .6), 0, 0);
  put(O.friends, seg(u, .1, .9), 0, 0);
  // glasses clink at the toast
  const ck = SC.night[0] + 6.633, mv = Math.sin(Math.PI * seg(t, ck - .4, ck + .3)) * 14;
  put(O.glassN, 1, 318 + mv, 925, .3); put(O.glassN, 1, 414 - mv, 942, .3);
  if (t > ck && t < ck + .5) { const a = 1 - seg(t, ck, ck + .5); ctx.strokeStyle = rgba(C.bulb, a); ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const an = i / 6 * 6.28; ctx.beginPath(); ctx.moveTo(366 + Math.cos(an) * 18, 860 + Math.sin(an) * 18); ctx.lineTo(366 + Math.cos(an) * 40, 860 + Math.sin(an) * 40); ctx.stroke(); } }
  // bulb glow
  const fl = 1 + .04 * Math.sin(t * 23) * Math.sin(t * 7.1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(BULB[0], BULB[1], 10, BULB[0], BULB[1], 620 * fl);
  g.addColorStop(0, 'rgba(242,198,109,.75)'); g.addColorStop(.25, 'rgba(242,170,80,.28)'); g.addColorStop(1, 'rgba(242,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(-600, -400, 2300, 2700); ctx.restore();
  ctx.fillStyle = '#fff3cf'; ctx.beginPath(); ctx.ellipse(BULB[0], BULB[1], 20, 26, 0, 0, 7); ctx.fill();
  steam(540, 1080, t, .55, .45, 3, 12);
  reset();
}

// ---------- scene: one glass, the payoff and the ask (42.5–56.7) ----------
function drawEnd(t) {
  const u = t - SC.end[0];
  cam(1 + .06 * eio(seg(u, 0, 6)), 540, 1000);
  put(O.mistBg, seg(u, 0, 1.2), 0, 0, 1, .7);
  put(O.counter, seg(t, 52.2, 53.2), 0, 0);
  put(O.coin, seg(t, 52.8, 53.1), 330, 1228); put(O.coin, seg(t, 52.9, 53.2), 410, 1250);
  put(O.glass, seg(u, .1, 1.6), 540, 1210, 1.5);
  steam(540, 1210 - 450 * .8, t, 1.3, .75, 4, 22);
  reset();
  // the arrow down to the comments
  const ap = eio(seg(t, 54.1, 54.9)); if (ap > 0) withSeed(77, () => {
    drawS(ctx, mk(qcurve(800, 1180, 640, 1560, 90, 18), 16, C.red, { prof: 'even', nb: 4, a: .9 }), ap);
    const hp = seg(t, 54.8, 55.1); drawS(ctx, mk(qcurve(640, 1560, 590, 1490, 0, 6), 13, C.red, { prof: 'tip', nb: 3, a: .9 }), hp);
    drawS(ctx, mk(qcurve(640, 1560, 712, 1515, 0, 6), 13, C.red, { prof: 'tip', nb: 3, a: .9 }), hp); });
}

// ---------- events for the mixer ----------
const EV0 = [
  { t: .15, type: 'coin' }, { t: .45, type: 'coin' }, { t: .55, type: 'tok' }, { t: .6, type: 'brush', d: 1.8 },
  { t: 2.5, type: 'kalimba' }, { t: 2.3, type: 'hiss', d: 7 }, { t: 6.0, type: 'brush', d: 1.2 },
  { t: 9.6, type: 'mist' }, { t: 9.3, type: 'rainIn' }, { t: 10.0, type: 'brush', d: 1.6 }, { t: 12.2, type: 'thunder' },
  { t: 16.2, type: 'mist' }, { t: 16.7, type: 'brush', d: 1.2 }, { t: POUR[0], type: 'pour', d: POUR[1] - POUR[0] + .5 }, { t: POUR[1] - .2, type: 'froth' },
  { t: 21.2, type: 'mist' }, { t: 21.7, type: 'slide' }, { t: 21.7, type: 'brush', d: 1.0 },
  ...[0, 1, 2].map(r => ({ t: SC.cab[0] + 1.633 + r * B, type: 'thump' })), ...[0, 1, 2].map(r => ({ t: SC.cab[0] + 1.933 + r * B, type: 'pencil' })),
  { t: 26.2, type: 'mist' }, { t: 26.7, type: 'brush', d: 1.2 }, { t: 27.0, type: 'radio', d: 5.3 }, { t: 27.6, type: 'rustle' },
  { t: 31.6, type: 'horn' }, { t: 32.0, type: 'mist' }, { t: 32.5, type: 'crickets', d: 10 }, { t: 33.4, type: 'bike' }, { t: SC.night[0] + 6.633, type: 'clink' },
  { t: 42.0, type: 'mist' }, { t: 42.6, type: 'brush', d: 1.4 }, { t: 48.333, type: 'tok' }, { t: 52.2, type: 'brush', d: 1.0 }, { t: 52.8, type: 'coin' }, { t: 54.1, type: 'pencil', d: 1.0 },
];
window.EV = EV0.map(e => e.t > 9.9 && !['mist', 'rainIn', 'horn', 'crickets', 'tok'].includes(e.type) ? { ...e, t: +(e.t - .8).toFixed(3) } : e).sort((a, b) => a.t - b.t);

// ---------- render ----------
const SCN = [['hook', drawHook], ['rain', drawRain], ['pour', drawPour], ['cab', drawCab], ['bench', drawBench], ['night', drawNight], ['end', drawEnd]];
function edgePath(c, seedX) { // the wavy rising edge of the steam wipe
  const top = H + 120 - c * (H + 360); ctx.beginPath(); ctx.moveTo(-10, H + 10);
  for (let x = -10; x <= W + 40; x += 30) ctx.lineTo(x, top + (vnoise(x * .007 + seedX) - .5) * 220 + Math.sin(x * .012 + c * 6) * 18);
  ctx.lineTo(W + 10, H + 10); ctx.closePath(); return top;
}
const LEAD = .8; // every scene after the first runs 0.8 s ahead, so it is already painting when the wipe reveals it
function scene(i, t) { reset(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; SCN[i][1](i ? t + LEAD : t); reset(); ctx.globalAlpha = 1; }
const HALF = .5;
function render(t) {
  reset(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(PAPER_IMG, 0, 0);
  let i = SCN.findIndex(([k]) => t < SC[k][1]); if (i < 0) i = SCN.length - 1;
  const e = SC[SCN[i][0]][1], s0 = SC[SCN[i][0]][0];
  if (i < SCN.length - 1 && t > e - HALF) { // wipe into the next scene
    const c = eio(seg(t, e - HALF, e + HALF)); scene(i, t);
    ctx.save(); edgePath(c, e); ctx.clip(); ctx.drawImage(PAPER_IMG, 0, 0); scene(i + 1, t); ctx.restore();
    ctx.save(); ctx.globalAlpha = .55; edgePath(Math.min(1, c + .06), e + 3); ctx.clip(); ctx.restore();
  } else if (i > 0 && t < s0 + HALF) { // finishing the wipe from the previous scene
    const c = eio(seg(t, s0 - HALF, s0 + HALF)); scene(i - 1, t);
    ctx.save(); edgePath(c, s0); ctx.clip(); ctx.drawImage(PAPER_IMG, 0, 0); scene(i, t); ctx.restore();
  } else scene(i, t);
  // a soft paper band along the wipe edge reads as steam
  for (const [k] of SCN.slice(0, -1)) { const ee = SC[k][1]; if (Math.abs(t - ee) < HALF) { const c = eio(seg(t, ee - HALF, ee + HALF)), top = H + 120 - c * (H + 360);
    const g = ctx.createLinearGradient(0, top - 160, 0, top + 120); g.addColorStop(0, rgba(PAPER, 0)); g.addColorStop(.6, rgba(PAPER, .85 * Math.sin(Math.PI * c))); g.addColorStop(1, rgba(PAPER, 0));
    ctx.fillStyle = g; ctx.fillRect(0, top - 160, W, 280); } }
  for (const r of TX) drawLine(t, r);
}
window.render = render;

// ---------- build ----------
function obj(S) { const o = { S }; o.spr = sprite(S); return o; }
function build() {
  O.glass = withSeed(1, () => obj(glassObj(1).S));
  O.glassS = O.glass; O.glassN = O.glass;
  O.coin = withSeed(2, () => obj(coinObj(1).S));
  O.counter = withSeed(3, () => { const S = []; fillArea(S, -40, 1190, 1120, 1960, [C.wood, C.woodL, C.wood2, '#8a5d3a'], { w: 70, a: .62, nb: 6 });
    for (let i = 0; i < 14; i++) { const y = rnd(1250, 1900); line(S, rnd(-40, 300), y, rnd(700, 1120), y + rnd(-10, 10), 3, C.wood2, { a: .45 }); }
    line(S, -40, 1196, 1120, 1192, 16, C.wood2, { a: .9 }); return obj(S); });
  O.bgWarm = withSeed(4, () => { const S = []; for (let i = 0; i < 40; i++) { const x = rnd(-100, 1180), y = rnd(-100, 1150);
      S.push(mk(polar(x, y, rnd(-.3, .3), rnd(180, 420), rnd(-30, 30), 8), rnd(70, 150), pick(['#d9b98a', '#c9a06a', '#b8874f', '#e3caa0', '#a6c08a']), { prof: 'leaf', nb: 4, a: rnd(.18, .32) })); }
    return obj(S); });
  // rain scene
  O.sky = withSeed(10, () => { const S = []; wash(S, -100, -60, 1400, 1100, [C.sky, '#b7c4c9', '#d3dbdb', '#aebcc2'], { a0: .3, a1: .45 }); fillArea(S, -100, 1050, 1400, 1530, ['#8fa38a', '#7f9a6c', '#9aaa8a'], { w: 110, a: .5, nb: 5 }); return obj(S); });
  O.palms = withSeed(11, () => [[obj(palm(1.15, .12, '#4d6b42').S), -120], [obj(palm(1.3, -.18, '#45603c').S), 420], [obj(palm(1.05, .2, '#516e45').S), 900], [obj(palm(1.25, -.1, '#4d6b42').S), 1300]]);
  O.ground = withSeed(12, () => { const S = []; fillArea(S, -100, 1480, 2600, 1960, [C.oxide, '#a85a3e', '#8c4430'], { w: 90, a: .6, nb: 6 });
    for (let i = 0; i < 40; i++) { const x = rnd(0, 2500), y = rnd(1540, 1900); line(S, x, y, x + rnd(-6, 6), y + rnd(40, 120), rnd(5, 12), pick(['#6b3324', '#c48a62', '#8fa3b0']), { a: .35, bend: 0 }); } return obj(S); });
  O.shop = withSeed(13, () => obj(shopObj().S));
  O.rainPeople = withSeed(14, () => [[obj(person(.95, { shirt: '#7f9bb0', right: 'drink' }).S), 730, 1500], [obj(person(.9, { shirt: '#c9a77a', right: 'drink', left: 'down', hair: C.white, specs: true }).S), 1190, 1500], [obj(person(.85, { shirt: '#7f9a6c', bald: true }).S), 1460, 1500]]);
  O.walker = withSeed(15, () => { const P = person(.8, { shirt: '#9a4a3a', right: 'umb' }), S = P.S;
    line(S, P.hr[0], P.hr[1], P.hr[0], P.hr[1] - 330 * .8, 4, C.ink, { a: .9, bend: 0 });
    const cx = P.hr[0], cy = P.hr[1] - 330 * .8; for (let i = 0; i < 8; i++) { const a0 = Math.PI * (1 + i / 8), a1 = Math.PI * (1 + (i + 1) / 8);
      S.push(mk(qcurve(cx + Math.cos(a0) * 170, cy + Math.sin(a0) * 90 + 30, cx + Math.cos(a1) * 170, cy + Math.sin(a1) * 90 + 30, -8, 6), 70, '#2b2a33', { prof: 'even', nb: 4, a: .85 })); }
    return obj(S); });
  O.fg = withSeed(16, () => { const S = []; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .32, L = rnd(380, 560); const pts = qcurve(0, 0, Math.cos(a) * L, Math.sin(a) * L, rnd(-60, 60), 14);
      S.push(mk(pts, rnd(90, 130), pick([C.leaf, C.leaf2, '#587a3e']), { prof: 'leaf', nb: 7, a: .78 })); S.push(mk(pts, 5, C.leaf2, { prof: 'tip', nb: 0, a: .7 })); } return obj(S); });
  // pour scene
  O.pourBg = withSeed(20, () => { const S = []; wash(S, -60, -60, 1140, 1990, ['#c8a274', '#b88f60', '#d4b184', '#a87f52'], { a0: .2, a1: .34 });
    line(S, -40, 900, 1120, 900, 18, C.wood2, { a: .55 }); for (let i = 0; i < 8; i++) { const x = 60 + i * 140; disc(S, x, 840, 34, pick(['#c9a347', '#b8743a', '#d9b847', '#9a5a2a']), { n: 3, sx: .8, a: .35 }); }
    return obj(S); });
  O.maker = withSeed(21, () => obj(makerObj().S));
  O.jug = withSeed(22, () => obj(jugObj(1).S)); O.tumbler = withSeed(23, () => obj(tumblerObj(1).S));
  // cabinet
  O.cabBg = withSeed(30, () => { const S = []; wash(S, -60, -60, 1140, 1990, ['#e2cfa8', '#d8c095', '#e9dab8', '#cfdde0'], { a0: .18, a1: .3 }); return obj(S); });
  O.cab = withSeed(31, () => obj(cabinetObj().S));
  O.pori = withSeed(32, () => obj(pazhampori(1).S)); O.uvada = withSeed(33, () => obj(uzhunnuVada(1).S)); O.pvada = withSeed(34, () => obj(parippuVada(1).S));
  // bench
  O.wall = withSeed(40, () => { const S = []; wash(S, -60, -60, 1560, 1180, [C.wall, '#e9dfb4', C.wall2], { a0: .3, a1: .45 }); fillArea(S, -60, 1150, 1560, 1330, [C.oxide, '#a85a3e'], { w: 60, a: .6, nb: 5 });
    wash(S, -60, 1320, 1560, 1990, ['#9c8a6e', '#8a7a60', '#a8977a'], { a0: .3, a1: .45 }); return obj(S); });
  O.window = withSeed(41, () => { const S = []; fillArea(S, 80, 470, 420, 900, ['#9cb06a', '#7f9a6c', '#b9c98a'], { w: 70, a: .5, nb: 4 });
    for (const x of [80, 420]) line(S, x, 460, x, 910, 22, C.wood, { a: .9, bend: 0 }); for (const y of [460, 910]) line(S, 70, y, 430, y, 22, C.wood, { a: .9, bend: 0 });
    for (let i = 1; i < 5; i++) line(S, 80 + i * 68, 470, 80 + i * 68, 900, 9, C.wood2, { a: .85, bend: 0 }); return obj(S); });
  O.bench = withSeed(42, () => obj(benchObj().S));
  O.manA = withSeed(43, () => obj(person(1, { seated: true, shirt: '#c9a77a', left: 'paper', right: 'paper', hair: C.white, specs: true }).S));
  O.manB = withSeed(44, () => obj(person(1, { seated: true, shirt: '#7f9bb0', right: 'drink', left: 'lap', bald: true, hair: C.white }).S));
  O.paper = withSeed(45, () => { const S = []; fillArea(S, -120, -10, 120, 170, ['#ece4d2', '#e3dac4'], { w: 40, a: .85, nb: 2 }); line(S, 0, -10, 0, 170, 2, C.whiteE, { a: .6, bend: 0 });
    for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) line(S, sd * 15, 50 + i * 16, sd * 105, 50 + i * 16, 3, '#8a8478', { a: .55 });
    return obj(S); });
  O.shelf = withSeed(46, () => { const S = []; line(S, 1120, 905, 1420, 905, 18, C.wood2, { a: .85 }); return obj(S); });
  O.radio = withSeed(47, () => obj(radioObj(1).S));
  // night
  O.nightSky = withSeed(50, () => { const S = []; wash(S, -400, -400, 1500, 1500, [C.night, '#36416a', '#283255', '#3d4a73'], { a0: .3, a1: .5 }); fillArea(S, -400, 1450, 1500, 2350, [C.night2, '#2a2f45'], { w: 140, a: .85, nb: 5 });
    for (const [x, sc, l] of [[60, 1.1, .1], [980, 1.25, -.15], [300, .8, .2]]) { const p = palm(sc, l, '#1a2036'); for (const s of p.S) { s.pts = s.pts.map(([a, b]) => [a + x, b + 1460]); S.push(s); } } return obj(S); });
  O.nightStall = withSeed(51, () => { const S = []; for (let i = 0; i < 9; i++) line(S, 140 + i * 6, 660 + i * 10, 940, 640 + i * 10, 22, pick(['#4a4f66', '#5b5f75', '#3c4157']), { a: .85, bend: 4 });
    for (const x of [180, 900]) line(S, x, 700, x, 1460, 18, '#1e2335', { a: .9, bend: 0 });
    line(S, BULB[0], 690, BULB[0], 730, 3, '#111', { a: .9, bend: 0 });
    fillArea(S, 160, 1060, 920, 1460, ['#4e3a30', '#5e4636', '#3e2e26'], { w: 70, a: .85, nb: 5, dir: 'v' }); line(S, 140, 1062, 940, 1058, 20, '#2e221c', { a: .9 });
    const k = 700; disc(S, k, 990, 62, C.steel2, { n: 5, sx: .8, a: .75 }); line(S, k + 50, 980, k + 98, 960, 9, C.steel2, { a: .8 });
    for (const x of [560, 610]) { const g = glassObj(.3).S; for (const s of g) { s.pts = s.pts.map(([a, b]) => [a + x, b + 1058]); S.push(s); } }
    return obj(S); });
  O.friends = withSeed(52, () => { const S = [];
    const add = (P, x, y) => { for (const s of P.S) { s.pts = s.pts.map(([a, b]) => [a + x, b + y]); S.push(s); } };
    add(person(1.05, { shirt: '#3f4a6e', right: 'raise', base: '#7a7f96' }), 230, 1640);
    add(person(1.0, { shirt: '#5a3e4e', left: 'raise', base: '#7a7f96' }), 500, 1660);
    const bk = bikeObj(1.1, '#151a2b'); add(bk, 820, 1700);
    add(person(.95, { shirt: '#2e4a46', seated: true, left: 'drink', base: '#7a7f96' }), 840, 1560);
    return obj(S); });
  O.mistBg = withSeed(60, () => { const S = []; for (let i = 0; i < 26; i++) { const x = rnd(-100, 1180), y = rnd(100, 1500);
      S.push(mk(polar(x, y, rnd(-.3, .3), rnd(200, 420), rnd(-30, 30), 8), rnd(90, 160), pick(['#e3caa0', '#d9b98a', '#cfd8d6']), { prof: 'leaf', nb: 3, a: rnd(.12, .22) })); } return obj(S); });
}

(async () => {
  PAPER_IMG = new Image(); PAPER_IMG.src = 'paper.jpg'; await PAPER_IMG.decode();
  await Promise.all(['400 60px NSM', '500 60px NSM', '600 60px NSM', '700 60px NSM', '800 60px NSM', '40px Chilanka'].map(f => document.fonts.load(f, 'ചായ')));
  build();
  window.READY = true;
})();
