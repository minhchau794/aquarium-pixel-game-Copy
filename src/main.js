const canvas = document.querySelector('#aquarium');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = 480, H = 240;
const species = [
  { name: 'Cá hề nắng mai', note: 'Nhỏ nhắn · Năng động', price: 40, color: '#ffac59', fin: '#db654b', stripe: '#fff1ca' },
  { name: 'Cá lam đại dương', note: 'Thanh lịch · Hiền hòa', price: 65, color: '#65bded', fin: '#3971b4', stripe: '#e0f6e7' },
  { name: 'Cá hồng mộng mơ', note: 'Rực rỡ · Tò mò', price: 90, color: '#ed8ea8', fin: '#b2598b', stripe: '#ffdbac' }
];
let coins = 100, fish = [], food = [], paused = false, clock = 0, lastFeed = -10, storageOK = true;
const random = (a, b) => a + Math.random() * (b - a);
function newFish(type) { return { type, x: random(45, 435), y: random(45, 175), dir: Math.random() < .5 ? -1 : 1, speed: random(13, 23), phase: random(0, 7), fedAt: -10 }; }
try {
  const saved = JSON.parse(localStorage.getItem('tiny-aquarium-v1'));
  if (saved && Number.isSafeInteger(saved.coins) && saved.coins >= 0 && saved.coins <= 1e9 && Array.isArray(saved.fish) && saved.fish.length > 0 && saved.fish.length <= 20 && saved.fish.every(t => Number.isInteger(t) && species[t])) {
    coins = saved.coins; fish = saved.fish.map(newFish);
  }
} catch { storageOK = false; }
if (!fish.length) fish = [0, 1, 0].map(newFish);
function message(text) { document.querySelector('#status').textContent = text; }
function save() {
  try { localStorage.setItem('tiny-aquarium-v1', JSON.stringify({ coins, fish: fish.map(f => f.type) })); }
  catch { storageOK = false; message('Không thể lưu trên trình duyệt này. Bạn vẫn có thể chơi trong phiên hiện tại.'); }
}
function updateUI() {
  document.querySelector('#coins').textContent = coins;
  document.querySelector('#fish-count').textContent = `${fish.length} / 20 NGƯỜI BẠN`;
  document.querySelectorAll('[data-buy]').forEach(b => { b.disabled = coins < species[Number(b.dataset.buy)].price || fish.length >= 20; });
}
function drawFish(c, f, time, x = f.x, y = f.y, scale = 1) {
  const s = species[f.type], wag = Math.sin(time * 9 + f.phase) > 0 ? 1 : -1;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(f.dir * scale, scale);
  c.fillStyle = s.fin;
  c.fillRect(-19, -6 + wag, 4, 12); c.fillRect(-15, -4, 4, 8);
  c.fillRect(-5, -10, 11, 4); c.fillRect(-3, 6, 8, 4);
  c.fillStyle = s.color; c.fillRect(-10, -6, 22, 12); c.fillRect(-6, -8, 14, 16); c.fillRect(12, -3, 3, 6);
  c.fillStyle = s.stripe; c.fillRect(-5, -7, 3, 14); c.fillRect(4, -6, 2, 12);
  c.fillStyle = '#132f47'; c.fillRect(9, -3, 3, 3); c.fillStyle = '#fff6dc'; c.fillRect(10, -3, 1, 1);
  c.fillStyle = s.fin; c.fillRect(-1, wag, 5, 3); c.restore();
}
species.forEach((s, i) => {
  const card = document.createElement('article'); card.className = 'fish-card';
  card.innerHTML = `<canvas width="70" height="52" aria-label="${s.name}"></canvas><div><h3>${s.name}</h3><p>${s.note}</p></div><button data-buy="${i}" aria-label="Mua ${s.name}, ${s.price} đồng">Mua · ◈ ${s.price}</button>`;
  document.querySelector('#shop-items').append(card);
  drawFish(card.querySelector('canvas').getContext('2d'), { type: i, dir: 1, phase: 0 }, 0, 35, 26, 1.25);
  card.querySelector('button').addEventListener('click', () => {
    if (coins < s.price || fish.length >= 20) return;
    coins -= s.price; fish.push(newFish(i)); updateUI(); save(); message(`Chào mừng ${s.name} đến với thủy cung!`);
  });
});
function feed(x = random(80, 400), y = 16) {
  if (paused) { message('Tiếp tục bể cá trước khi cho ăn nhé.'); return; }
  if (clock - lastFeed < 2) { message('Đợi một chút để cá ăn hết nhé!'); return; }
  lastFeed = clock;
  for (let i = 0; i < 6; i++) food.push({ x: Math.max(15, Math.min(465, x + random(-28, 28))), y: Math.max(10, Math.min(190, y + random(-5, 5))), age: 0 });
  message('Bữa ăn đến rồi! Cá ăn sẽ tặng bạn đồng vỏ sò.');
}
document.querySelector('#feed').addEventListener('click', () => feed());
canvas.addEventListener('pointerdown', e => { const r = canvas.getBoundingClientRect(); feed((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H); });
document.querySelector('#pause').addEventListener('click', e => {
  paused = !paused; e.currentTarget.setAttribute('aria-pressed', String(paused)); e.currentTarget.textContent = paused ? '▶ Tiếp tục' : 'Ⅱ Tạm dừng';
});
function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
function plant(x, height, color, time) {
  for (let j = 0; j < height; j += 4) {
    const sway = Math.sin(time * 1.5 + j * .08 + x) * j * .07;
    rect(x + sway, 217 - j, 3, 5, color);
    if (j % 12 === 0) rect(x + sway + (j % 24 === 0 ? -6 : 3), 215 - j, 7, 3, color);
  }
}
function render() {
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  const gradient = ctx.createLinearGradient(0, 0, 0, H); gradient.addColorStop(0, '#247b91'); gradient.addColorStop(.6, '#12546e'); gradient.addColorStop(1, '#113d55');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#9fe4cf0b';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(55 + i * 120, 0); ctx.lineTo(100 + i * 120, 0); ctx.lineTo(30 + i * 120, 220); ctx.lineTo(-40 + i * 120, 220); ctx.fill(); }
  for (let i = 0; i < 17; i++) {
    const x = (i * 67 + Math.sin(clock + i) * 4) % W, y = 215 - ((clock * (7 + i % 4) + i * 29) % 215);
    ctx.strokeStyle = '#91d9d655'; ctx.strokeRect(Math.round(x), Math.round(y), 2 + i % 3, 2 + i % 3);
  }
  rect(0, 215, W, 25, '#c4b88a'); rect(0, 215, W, 3, '#e0d4a1');
  for (let i = 0; i < 80; i++) rect((i * 73) % W, 221 + i % 17, 2 + i % 3, 1, i % 2 ? '#a19a77' : '#e7d9ab');
  [22, 39, 58, 405, 427, 447, 462].forEach((x, i) => plant(x, 35 + i % 3 * 19, i % 2 ? '#429d87' : '#2d806f', clock));
  [[85, 21], [366, 28], [395, 14]].forEach(([x, h], i) => {
    const col = ['#db8e99', '#d49979', '#b98bae'][i];
    rect(x, 215 - h, 5, h, col); rect(x - 10, 210 - h, 4, 14, col); rect(x - 9, 220 - h, 13, 4, col); rect(x + 4, 204 - h, 10, 4, col); rect(x + 11, 196 - h, 4, 12, col);
  });
  [[130, 12, 24], [320, 10, 31], [333, 16, 19]].forEach(([x, h, w]) => { rect(x, 216 - h, w, h, '#577a7e'); rect(x + 3, 213 - h, w - 7, 4, '#7a9996'); });
  food.forEach(p => rect(p.x, p.y, 2, 2, '#ffdb84'));
  fish.forEach(f => drawFish(ctx, f, clock, f.x, f.y + Math.sin(clock * 2 + f.phase) * 1.5));
  for (let i = 0; i < 12; i++) rect(i * 44 + Math.sin(clock + i) * 5, 3 + i % 3 * 3, 21, 1, '#81d8cc55');
  if (paused) { rect(0, 0, W, H, '#051b3255'); ctx.fillStyle = '#e1f2e7'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BỂ CÁ ĐANG TẠM DỪNG', W / 2, H / 2); }
}
function update(dt) {
  clock += dt;
  food.forEach(p => { p.y += dt * 5; p.age += dt; });
  for (const f of fish) {
    let target = null, distance = Infinity;
    if (clock - f.fedAt > 3) for (const p of food) { const d = Math.hypot(p.x - f.x, p.y - f.y); if (d < distance) { distance = d; target = p; } }
    if (target) {
      f.dir = target.x >= f.x ? 1 : -1;
      if (distance < 9) { food.splice(food.indexOf(target), 1); f.fedAt = clock; coins = Math.min(1e9, coins + 5); updateUI(); save(); }
      else { const step = Math.min(distance, f.speed * 2.2 * dt); f.x += (target.x - f.x) / distance * step; f.y += (target.y - f.y) / distance * step; }
    } else {
      f.x += f.dir * f.speed * dt; f.y += Math.sin(clock + f.phase) * dt * 3;
      if (f.x > 455) { f.dir = -1; f.x = 455; } if (f.x < 25) { f.dir = 1; f.x = 25; }
    }
    f.y = Math.max(18, Math.min(198, f.y));
  }
  food = food.filter(p => p.age < 24 && p.y < 212);
}
let previous;
function frame(now) {
  const dt = previous === undefined ? 0 : Math.min((now - previous) / 1000, .05); previous = now;
  if (!paused && !document.hidden) update(dt);
  render(); requestAnimationFrame(frame);
}
updateUI(); if (!storageOK) message('Trình duyệt không cho phép lưu; tiến trình chỉ giữ trong phiên chơi này.');
requestAnimationFrame(frame);
