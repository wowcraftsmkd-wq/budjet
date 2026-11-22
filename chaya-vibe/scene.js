// ചായ വൈബ് — props and figures, built from brush strokes (engine.js). Local coords, origin at the base.
const C = {
  tea: '#b8743a', tea2: '#9a5a2a', froth: '#e2c08e', glass: '#9fb4bf', glass2: '#6f8794',
  wood: '#7a5134', wood2: '#5e3c26', woodL: '#a5774f', thatch: '#a88b4e', thatch2: '#7d6436',
  oxide: '#9c4a33', leaf: '#6f8f4a', leaf2: '#3f5f34', leafL: '#9cb06a', rain: '#8fa3b0',
  night: '#2f3a5c', night2: '#1f2742', bulb: '#f2c66d', ink: '#3a2a1e', red: '#c8442a',
  skin: '#a86a42', skin2: '#86502f', hair: '#2b2420', white: '#cdc5b6', whiteE: '#8c8577',
  steel: '#a9b0b3', steel2: '#6f777b', banana: '#d9b847', banana2: '#a8a13e', gold: '#c9a347',
  wall: '#e6d9a8', wall2: '#cdbb84', sky: '#c9d3d6',
};

// cover a rectangle with overlapping wet strokes (offset, broken rows so it reads as a wash, not stripes)
function fillArea(S, x0, y0, x1, y1, col, o = {}) {
  const w = o.w || 60, dir = o.dir || 'h', step = w * (o.gap ?? .5), a = o.a ?? .6;
  const row = (p0, p1, q) => { let s0 = p0 - rnd(10, 60);
    while (s0 < p1) { const s1 = Math.min(p1 + 40, s0 + rnd(.45, .9) * (p1 - p0 + 80)), cc = Array.isArray(col) ? pick(col) : col, qq = q + rnd(-step * .25, step * .25);
      const pts = dir === 'h' ? qcurve(s0, qq + rnd(-5, 5), s1, qq + rnd(-5, 5), rnd(-8, 8), 14) : qcurve(qq + rnd(-5, 5), s0, qq + rnd(-5, 5), s1, rnd(-8, 8), 14);
      S.push(mk(pts, w * rnd(.85, 1.2), cc, { prof: o.prof || 'brush', nb: o.nb ?? 5, a: a * rnd(.75, 1.1), rough: .3 }));
      s0 = s1 - rnd(30, 90); } };
  if (dir === 'h') for (let y = y0 + w * .3; y <= y1 - w * .2 + 1; y += step) row(x0, x1, y);
  else for (let x = x0 + w * .3; x <= x1 - w * .2 + 1; x += step) row(y0, y1, x);
}
// soft background wash: big overlapping leaf-shaped strokes at slight angles
function wash(S, x0, y0, x1, y1, cols, o = {}) {
  const n = o.n || Math.round((x1 - x0) * (y1 - y0) / 26000);
  for (let i = 0; i < n; i++) { const x = rnd(x0 - 100, x1), y = rnd(y0, y1);
    S.push(mk(polar(x, y, rnd(-.25, .25), rnd(260, 520), rnd(-30, 30), 8), rnd(110, 190), pick(cols), { prof: 'leaf', nb: 4, a: rnd(o.a0 ?? .16, o.a1 ?? .3) })); }
}
// an ellipse outline as two strokes
function ring(S, cx, cy, rx, ry, w, col, o = {}) {
  const pts = (a0, a1) => { const r = []; for (let i = 0; i <= 16; i++) { const a = a0 + (a1 - a0) * i / 16; r.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return r; };
  S.push(mk(pts(Math.PI * 1.05, Math.PI * 2.02), w, col, { prof: 'even', nb: 0, a: o.a ?? .85, rough: .25 }));
  S.push(mk(pts(.05, Math.PI * 1.02), w, col, { prof: 'even', nb: 0, a: o.a ?? .85, rough: .25 }));
}
function disc(S, cx, cy, r, col, o = {}) { // filled round dab
  const n = o.n || 5;
  for (let i = 0; i < n; i++) { const y = cy - r + (i + .5) * 2 * r / n, hw = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2)) * (o.sx ?? 1);
    S.push(mk(qcurve(cx - hw, y, cx + hw, y, rnd(-2, 2), 6), 2 * r / n * 1.5, col, { prof: 'even', nb: 0, a: o.a ?? .8, rough: .25 })); }
}
const line = (S, x0, y0, x1, y1, w, col, o = {}) => S.push(mk(qcurve(x0, y0, x1, y1, o.bend ?? rnd(-4, 4), o.n || 10), w, col, { prof: o.prof || 'even', nb: o.nb ?? 0, a: o.a ?? .85, rough: o.rough ?? .25 }));

// ---------- the tea glass (origin: bottom centre; height 300) ----------
function glassObj(sc = 1, fill = .82) {
  const S = [], h = 300 * sc, bw = 64 * sc, tw = 84 * sc, side = y => bw + (tw - bw) * (y / h);
  const top = -h * fill;
  // tea body, bottom to top
  for (let y = -6 * sc; y > top + 14 * sc; y -= 11 * sc) { const hw = side(-y) - 6 * sc;
    S.push(mk(qcurve(-hw, y, hw, y, rnd(-2, 2), 8), 24 * sc, rnd() < .6 ? C.tea : C.tea2, { prof: 'brush', nb: 3, a: .42, rough: .3 })); }
  // froth band
  for (let k = 0; k < 3; k++) { const y = top + (4 + k * 9) * sc, hw = side(-y) - 6 * sc;
    S.push(mk(qcurve(-hw, y, hw, y, rnd(-2, 2), 8), 13 * sc, C.froth, { prof: 'even', nb: 3, a: .8, rough: .3 })); }
  // glass walls, base and rim
  line(S, -bw, 0, -tw, -h, 4.2 * sc, C.glass2, { a: .7, bend: 0 });
  line(S, bw, 0, tw, -h, 4.2 * sc, C.glass2, { a: .7, bend: 0 });
  S.push(mk(qcurve(-bw + 4, -10 * sc, bw - 4, -10 * sc, 3, 8), 16 * sc, C.glass, { prof: 'even', nb: 3, a: .55 }));
  ring(S, 0, -h, tw, 12 * sc, 3.2 * sc, C.glass2, { a: .75 });
  ring(S, 0, -2, bw, 9 * sc, 3.5 * sc, C.glass2, { a: .6 });
  // facets: faint vertical lines
  for (const f of [-.55, -.15, .3, .65]) line(S, bw * f, -14 * sc, tw * f, -h + 10 * sc, 2 * sc, C.glass2, { a: .25, bend: 0 });
  // highlight: paper colour back over the tea
  S.push(mk(qcurve(-tw * .62, -h * .78, -bw * .62, -h * .12, 0, 8), 9 * sc, PAPER, { prof: 'tip', nb: 2, a: .55 }));
  return { S, h };
}
function coinObj(sc = 1) {
  const S = []; disc(S, 0, 0, 22 * sc, '#b9a27a', { sx: 1, n: 4, a: .7 }); ring(S, 0, 0, 22 * sc, 21 * sc, 2.6 * sc, '#6e5a3a', { a: .8 });
  ring(S, 0, 0, 13 * sc, 12 * sc, 1.6 * sc, '#6e5a3a', { a: .5 }); return { S };
}

// ---------- coconut palm ----------
function palm(sc = 1, lean = .2, col = C.leaf2) {
  const S = [], hgt = 700 * sc, tx = lean * hgt, top = [tx, -hgt];
  const trunk = mk(qcurve(0, 0, tx, -hgt, -lean * 120 * sc, 18), 30 * sc, '#8a7356', { prof: 'trunk', nb: 5, a: .8 });
  S.push(trunk); S.push(edgeOf(trunk, 1, 3 * sc, '#5c4a36', .6));
  for (let i = 0; i < 9; i++) { const y = -hgt * (.1 + i * .09); line(S, tx * (-y / hgt) - 14 * sc, y, tx * (-y / hgt) + 14 * sc, y + 4 * sc, 2 * sc, '#5c4a36', { a: .35 }); }
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (i / 10 - .5) * Math.PI * 1.7 + rnd(-.1, .1), L = rnd(300, 420) * sc;
    const ex = top[0] + Math.cos(a) * L, ey = top[1] + Math.sin(a) * L * .55 + L * .35;
    const pts = qcurve(top[0], top[1], ex, ey, (a > -Math.PI / 2 ? 1 : -1) * 50 * sc, 14);
    S.push(mk(pts, 7 * sc, col, { prof: 'tip', nb: 0, a: .85 }));
    for (let k = 2; k < 14; k += 1) { const [px, py] = pts[k], dl = (1 - k / 14) * 70 * sc + 18 * sc;
      for (const sd of [-1, 1]) S.push(mk(polar(px, py, Math.PI / 2 + sd * .55 + (ex - top[0] > 0 ? -.2 : .2), dl, 4, 4), 6 * sc, col, { prof: 'leaf', nb: 0, a: .7, rough: .3 })); }
  }
  disc(S, top[0], top[1] + 14 * sc, 18 * sc, '#6d5a32', { a: .8 });
  return { S };
}

// ---------- a person (origin: feet centre; ~600 tall at sc 1) ----------
function person(sc = 1, o = {}) {
  const S = [], shirt = o.shirt || '#7f9bb0', seated = o.seated, hipY = (seated ? -250 : -330) * sc, shY = hipY - 230 * sc;
  const hx = o.dx || 0, headY = shY - 62 * sc;
  // mundu (white = paper, shaded) with a kasavu border; a paper-coloured underlayer keeps it opaque
  for (let x = -60; x <= 60; x += 20) S.push(mk(qcurve(hx + x * .9 * sc, hipY, (x * 1.1 + (seated ? x * .5 : 0)) * sc, -8 * sc, 0, 8), 30 * sc, o.base || PAPER, { prof: 'even', nb: 0, a: 1, rib: 1, rough: .1 }));
  for (let x = -58; x <= 58; x += 23) S.push(mk(qcurve(hx + x * .9 * sc, hipY, (x * 1.1 + (seated ? x * .5 : 0)) * sc, -8 * sc, 0, 8), 28 * sc, C.white, { prof: 'even', nb: 3, a: .38, rough: .2 }));
  line(S, hx - 54 * sc, hipY + 6, -66 * sc * (seated ? 1.4 : 1), -6 * sc, 3 * sc, C.whiteE, { a: .7 });
  line(S, hx + 54 * sc, hipY + 6, 66 * sc * (seated ? 1.4 : 1), -6 * sc, 3 * sc, C.whiteE, { a: .7 });
  if (o.kasavu !== false) line(S, -66 * sc * (seated ? 1.4 : 1), -26 * sc, 66 * sc * (seated ? 1.4 : 1), -26 * sc, 5 * sc, C.gold, { a: .85, bend: 2 });
  // feet
  for (const sd of [-1, 1]) line(S, sd * 30 * sc, -6 * sc, sd * 52 * sc, -2 * sc, 11 * sc, C.skin2, { a: .85 });
  // torso (opaque underlayer, then the shirt)
  for (let x = -56; x <= 56; x += 16) S.push(mk(qcurve(hx + x * .95 * sc, shY + 8 * sc, hx + x * .85 * sc, hipY + 10 * sc, 0, 8), 24 * sc, o.base || PAPER, { prof: 'even', nb: 0, a: 1, rib: 1, rough: .1 }));
  for (let x = -54; x <= 54; x += 18) S.push(mk(qcurve(hx + x * .95 * sc, shY + 8 * sc, hx + x * .85 * sc, hipY + 10 * sc, 0, 8), 24 * sc, shirt, { prof: 'even', nb: 3, a: .62, rough: .2 }));
  if (o.towel) S.push(mk(qcurve(hx - 52 * sc, shY + 6 * sc, hx - 20 * sc, hipY - 40 * sc, 8, 8), 22 * sc, o.towel, { prof: 'even', nb: 4, a: .75 }));
  // neck + head
  line(S, hx, shY + 4, hx, shY - 26 * sc, 20 * sc, C.skin2, { a: .85, bend: 0 });
  disc(S, hx, headY, 40 * sc, C.skin, { n: 5, sx: .88, a: .85 });
  if (o.bald) disc(S, hx, headY - 34 * sc, 14 * sc, o.hair || C.white, { n: 2, sx: 2.2, a: .5 });
  else { S.push(mk(qcurve(hx - 36 * sc, headY - 4 * sc, hx + 36 * sc, headY - 4 * sc, -34 * sc, 12), 14 * sc, o.hair || C.hair, { prof: 'even', nb: 3, a: .9 })); disc(S, hx, headY - 26 * sc, 18 * sc, o.hair || C.hair, { n: 2, sx: 1.7, a: .85 }); }
  if (o.moustache !== false) S.push(mk(qcurve(hx - 15 * sc, headY + 14 * sc, hx + 15 * sc, headY + 14 * sc, -4 * sc, 6), 6 * sc, o.hair === C.white ? '#9a9286' : C.hair, { prof: 'leaf', nb: 0, a: .9 }));
  if (o.specs) { ring(S, hx - 14 * sc, headY - 2 * sc, 10 * sc, 8 * sc, 2 * sc, C.ink, { a: .8 }); ring(S, hx + 14 * sc, headY - 2 * sc, 10 * sc, 8 * sc, 2 * sc, C.ink, { a: .8 }); }
  // arms
  const arm = (sd, pose) => {
    const sx = hx + sd * 60 * sc, sy = shY + 18 * sc; let el, hd;
    if (pose === 'drink') { el = [sx + sd * 26 * sc, sy + 120 * sc]; hd = [hx + sd * 22 * sc, headY + 40 * sc]; }
    else if (pose === 'lap') { el = [sx + sd * 12 * sc, sy + 150 * sc]; hd = [hx + sd * 28 * sc, hipY + 30 * sc]; }
    else if (pose === 'paper') { el = [sx + sd * 20 * sc, sy + 120 * sc]; hd = [hx + sd * 55 * sc, sy + 110 * sc]; }
    else if (pose === 'raiseOut') { el = [sx + sd * 90 * sc, sy - 40 * sc]; hd = [sx + sd * 150 * sc, sy - 190 * sc]; }
    else if (pose === 'raise') { el = [sx + sd * 46 * sc, sy - 50 * sc]; hd = [sx + sd * 40 * sc, sy - 170 * sc]; }
    else if (pose === 'umb') { el = [sx + sd * 18 * sc, sy + 110 * sc]; hd = [hx + sd * 10 * sc, sy + 40 * sc]; }
    else { el = [sx + sd * 14 * sc, sy + 120 * sc]; hd = [sx + sd * 10 * sc, sy + 230 * sc]; }
    S.push(mk(qcurve(sx, sy, el[0], el[1], 0, 6), 22 * sc, shirt, { prof: 'even', nb: 3, a: .8 }));
    S.push(mk(qcurve(el[0], el[1], hd[0], hd[1], 0, 6), 15 * sc, C.skin, { prof: 'even', nb: 0, a: .9 }));
    disc(S, hd[0], hd[1], 9 * sc, C.skin2, { n: 2, a: .9 });
    return hd;
  };
  const hl = arm(-1, o.left || 'down'), hr = arm(1, o.right || 'down');
  return { S, hl, hr, headY, hipY, shY };
}

// ---------- the tea stall front, for the rain scene (origin: ground at x 0) ----------
function shopObj() {
  const S = [], L = 0, R = 1240, eave = -700, ridge = -980;
  // dark interior back wall
  fillArea(S, L + 30, eave + 10, R - 30, -330, ['#5b4632', '#6b5139', '#4d3b2a'], { w: 90, a: .55, nb: 5 });
  // warm glow inside
  fillArea(S, L + 300, eave + 60, L + 900, -400, ['#b88a4e', '#a67a42'], { w: 70, a: .3, nb: 3 });
  // shelf with jars inside
  line(S, L + 80, -560, R - 80, -560, 12, C.wood2, { a: .8 });
  for (let i = 0; i < 9; i++) { const x = L + 140 + i * 115; disc(S, x, -600, 30, pick(['#c9a347', '#b8743a', '#d9b847', '#9a5a2a']), { n: 3, sx: .8, a: .55 }); ring(S, x, -600, 26, 34, 2.4, C.glass, { a: .7 }); }
  // counter box
  fillArea(S, L + 20, -330, R - 20, -20, [C.wood, C.woodL, C.wood2], { w: 70, a: .7, dir: 'v', nb: 6 });
  line(S, L, -332, R, -332, 22, C.wood2, { a: .9 });
  // posts
  for (const x of [L + 10, L + 600, R - 10]) { const p = mk(qcurve(x, 0, x + rnd(-6, 6), eave + 20, 3, 10), 30, C.wood, { prof: 'even', nb: 5, a: .85 }); S.push(p); S.push(edgeOf(p, 1, 3, C.wood2, .7)); }
  // jars on the counter + tea boiler
  for (let i = 0; i < 3; i++) { const x = L + 760 + i * 120; disc(S, x, -390, 42, pick(['#c9a347', '#d9a46a', '#b8743a']), { n: 4, sx: .8, a: .6 }); ring(S, x, -390, 38, 52, 3, C.glass2, { a: .7 }); disc(S, x, -448, 16, '#c8442a', { n: 2, sx: 2.6, a: .8 }); }
  const bx = L + 300; disc(S, bx, -430, 80, C.steel, { n: 6, sx: .75, a: .75 });
  ring(S, bx, -430, 62, 82, 3, C.steel2, { a: .7 }); line(S, bx, -512, bx, -600, 22, C.steel2, { a: .8, bend: 0 });
  line(S, bx + 50, -400, bx + 96, -380, 8, C.steel2, { a: .8 });
  // thatched roof
  for (let i = 0; i < 260; i++) { const u = rnd(), v = rnd(), y = ridge + (eave - ridge) * v, half = 380 + (R / 2 + 80 - 380) * v, x = R / 2 + (u * 2 - 1) * half;
    S.push(mk(polar(x, y, Math.PI / 2 + (x - R / 2) / 1400, rnd(50, 110), rnd(-4, 4), 5), rnd(7, 13), pick([C.thatch, C.thatch2, '#b89a5a', '#8f7444']), { prof: 'tip', nb: 0, a: rnd(.55, .85), rough: .3 })); }
  for (let x = -80; x <= R + 80; x += 14) S.push(mk(polar(x, eave - 10, Math.PI / 2 + rnd(-.1, .1), rnd(26, 50), 2, 4), 8, pick([C.thatch2, '#6f5830']), { prof: 'tip', nb: 0, a: .8, rough: .3 }));
  // sign board
  fillArea(S, R / 2 - 230, eave - 150, R / 2 + 230, eave - 40, ['#e8d49a', '#e2c98a'], { w: 46, a: .85, nb: 3 });
  line(S, R / 2 - 236, eave - 150, R / 2 + 236, eave - 150, 5, C.wood2, { a: .8 }); line(S, R / 2 - 236, eave - 40, R / 2 + 236, eave - 40, 5, C.wood2, { a: .8 });
  // banana bunches hanging from the eave
  for (const bxp of [L + 150, R - 170]) {
    line(S, bxp, eave + 5, bxp, eave + 90, 6, '#6f5830', { a: .9, bend: 0 });
    for (let k = 0; k < 7; k++) { const y = eave + 100 + k * 26; for (let j = 0; j < 7; j++) { const a = Math.PI * (.15 + j / 6 * .7); const x0 = bxp + Math.cos(a) * 28 * (1 - k * .05) * (j < 3.5 ? -1 : 1) * .2;
      S.push(mk(qcurve(x0, y, x0 + Math.cos(a) * 52 * (1 - k * .06), y + 10 + Math.sin(a) * 24, -10, 6), 14 - k * .6, pick([C.banana, C.banana2, '#c4b24a']), { prof: 'leaf', nb: 0, a: .82 })); } }
  }
  return { S, eave, R };
}

// ---------- the tea maker pulling tea (origin: feet centre; big) ----------
function makerObj() {
  const sc = 2.25, P = person(sc, { shirt: C.white, towel: '#c8442a', left: 'down', right: 'raiseOut', kasavu: true });
  // paint the banian a little darker than mundu so it reads, plus his shirt shadow
  return P;
}
function jugObj(sc = 1) { // steel jug: origin at spout
  const S = []; fillArea(S, -10 * sc, -20 * sc, 90 * sc, 120 * sc, [C.steel, '#bcc2c4'], { w: 30 * sc, a: .75, dir: 'v', nb: 3 });
  ring(S, 40 * sc, -20 * sc, 52 * sc, 12 * sc, 3 * sc, C.steel2, { a: .8 }); line(S, -12 * sc, -20 * sc, -12 * sc, 120 * sc, 3 * sc, C.steel2, { a: .6, bend: 0 });
  line(S, 92 * sc, -20 * sc, 92 * sc, 120 * sc, 3 * sc, C.steel2, { a: .6, bend: 0 }); line(S, -12 * sc, -18 * sc, -30 * sc, -30 * sc, 8 * sc, C.steel2, { a: .8 });
  return { S };
}
function tumblerObj(sc = 1) { // steel tumbler: origin bottom centre
  const S = []; fillArea(S, -50 * sc, -150 * sc, 50 * sc, -4 * sc, [C.steel, '#bcc2c4', '#959ca0'], { w: 26 * sc, a: .75, dir: 'v', nb: 3 });
  ring(S, 0, -150 * sc, 56 * sc, 12 * sc, 3 * sc, C.steel2, { a: .8 }); line(S, -54 * sc, -150 * sc, -48 * sc, 0, 3 * sc, C.steel2, { a: .7, bend: 0 }); line(S, 54 * sc, -150 * sc, 48 * sc, 0, 3 * sc, C.steel2, { a: .7, bend: 0 });
  return { S };
}

// ---------- snacks ----------
function pazhampori(sc = 1) { const S = []; S.push(mk(qcurve(-70 * sc, 0, 70 * sc, -6 * sc, -14 * sc, 12), 46 * sc, '#d9a040', { prof: 'leaf', nb: 6, a: .82 }));
  S.push(mk(qcurve(-62 * sc, 8 * sc, 62 * sc, 4 * sc, -10 * sc, 12), 14 * sc, '#a8602a', { prof: 'leaf', nb: 3, a: .6 }));
  for (let i = 0; i < 6; i++) disc(S, rnd(-45, 45) * sc, rnd(-14, 4) * sc, rnd(3, 6) * sc, '#b8743a', { n: 1, a: .7 }); return { S }; }
function uzhunnuVada(sc = 1) { const S = []; for (let k = 0; k < 2; k++) ring(S, 0, 0, 50 * sc, 30 * sc, 24 * sc, k ? '#b8743a' : '#9a5a2a', { a: .8 });
  disc(S, 0, 0, 12 * sc, PAPER, { n: 2, sx: 1.5, a: .9 }); for (let i = 0; i < 5; i++) disc(S, rnd(-40, 40) * sc, rnd(-22, 22) * sc, 3 * sc, '#5e3c26', { n: 1, a: .7 }); return { S }; }
function parippuVada(sc = 1) { const S = []; disc(S, 0, 0, 50 * sc, '#b07a3c', { n: 6, sx: 1.25, a: .78 });
  for (let i = 0; i < 18; i++) { const a = rnd(0, 6.28), r = rnd(0, 46) * sc; disc(S, Math.cos(a) * r * 1.2, Math.sin(a) * r * .9, rnd(3, 6) * sc, pick(['#d9a040', '#7a4520', '#6f8f4a']), { n: 1, a: .8 }); }
  ring(S, 0, 0, 62 * sc, 50 * sc, 4 * sc, '#7a4520', { a: .5 }); return { S }; }

// ---------- glass cabinet (origin: centre) ----------
function cabinetObj() {
  const S = [], w = 400, h = 470;
  fillArea(S, -w, -h, w, h, ['#cfdde0', '#bccfd4'], { w: 110, a: .28, nb: 4 });
  for (const y of [-h, -h / 3, h / 3, h]) line(S, -w - 20, y, w + 20, y, 22, C.wood, { a: .9, bend: 1 });
  for (const x of [-w, w]) { const p = mk(qcurve(x, -h - 20, x, h + 20, 0, 10), 26, C.wood, { prof: 'even', nb: 5, a: .9 }); S.push(p); S.push(edgeOf(p, 1, 3, C.wood2, .7)); }
  line(S, -w, h + 40, w, h + 40, 34, C.wood2, { a: .85 });
  for (let i = 0; i < 4; i++) { const x = -w + 80 + i * 210; S.push(mk(qcurve(x, -h + 20, x - 140, h - 20, 0, 10), 18, PAPER, { prof: 'tip', nb: 2, a: .35 })); }
  return { S, w, h };
}

// ---------- old radio (origin: bottom centre) ----------
function radioObj(sc = 1) {
  const S = []; fillArea(S, -110 * sc, -170 * sc, 110 * sc, 0, ['#8a5a34', '#7a4f2c'], { w: 40 * sc, a: .82, nb: 4 });
  ring(S, -45 * sc, -85 * sc, 50 * sc, 50 * sc, 4 * sc, '#3a2a1e', { a: .8 });
  for (let i = 0; i < 4; i++) line(S, -88 * sc, (-115 + i * 20) * sc, -2 * sc, (-115 + i * 20) * sc, 3 * sc, '#3a2a1e', { a: .5 });
  fillArea(S, 20 * sc, -140 * sc, 92 * sc, -100 * sc, ['#e8d49a'], { w: 20 * sc, a: .9, nb: 2 });
  disc(S, 40 * sc, -50 * sc, 14 * sc, '#3a2a1e', { n: 2, a: .8 }); disc(S, 78 * sc, -50 * sc, 14 * sc, '#3a2a1e', { n: 2, a: .8 });
  line(S, 70 * sc, -170 * sc, 140 * sc, -300 * sc, 3 * sc, C.steel2, { a: .8, bend: 0 });
  return { S };
}
function benchObj() {
  const S = []; line(S, -520, -200, 520, -200, 38, C.wood, { a: .9, bend: 2, nb: 6 }); line(S, -520, -182, 520, -182, 8, C.wood2, { a: .6 });
  for (const x of [-470, -150, 150, 470]) line(S, x, -190, x + (x > 0 ? 10 : -10), 0, 22, C.wood2, { a: .85, bend: 0 });
  return { S };
}
function bikeObj(sc = 1, col = C.night2) {
  const S = []; for (const x of [-120, 120]) { ring(S, x * sc, -60 * sc, 60 * sc, 60 * sc, 11 * sc, col, { a: .9 }); disc(S, x * sc, -60 * sc, 9 * sc, col, { n: 1, a: .9 }); }
  S.push(mk(qcurve(-120 * sc, -60 * sc, 30 * sc, -150 * sc, -10 * sc, 8), 40 * sc, col, { prof: 'even', nb: 3, a: .92 }));
  S.push(mk(qcurve(-60 * sc, -150 * sc, 60 * sc, -158 * sc, -6 * sc, 8), 30 * sc, col, { prof: 'even', nb: 3, a: .92 }));
  line(S, 60 * sc, -150 * sc, 120 * sc, -60 * sc, 10 * sc, col, { a: .9, bend: 0 }); line(S, 70 * sc, -200 * sc, 110 * sc, -170 * sc, 8 * sc, col, { a: .9 });
  return { S };
}
