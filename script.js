// ============ 页面管理 ============
const pages = document.querySelectorAll('.page');
let current = 0;
const total = pages.length;

function showPage(index) {
  pages.forEach((p, i) => {
    p.classList.remove('active', 'exit-left');
    if (i === index) p.classList.add('active');
  });
}

function goNext() {
  if (current >= total - 1) return;
  const old = current;
  current++;
  pages[old].classList.remove('active');
  pages[old].classList.add('exit-left');
  setTimeout(() => {
    pages[old].classList.remove('exit-left');
    pages[current].classList.add('active');
  }, 300);
}

function goPrev() {
  if (current <= 0) return;
  const old = current;
  current--;
  pages[old].classList.remove('active');
  pages[old].classList.add('exit-left');
  setTimeout(() => {
    pages[old].classList.remove('exit-left');
    pages[current].classList.add('active');
  }, 300);
}

// 键盘翻页
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goPrev();
  if (e.key === 'Escape') closeZoom();
});

// 触摸滑动翻页
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx < -50) goNext();
  if (dx >  50) goPrev();
});

// ============ 音频：点击桃心后播放，点击按钮切换开关 ============
const bgm      = document.getElementById('bgm');
const musicBtn = document.getElementById('music-btn');
let musicPlaying = false;

bgm.volume = 0.45;

function startBGM() {
  bgm.play().then(() => {
    musicPlaying = true;
    musicBtn.classList.add('playing');
    musicBtn.title = '关闭音乐';
  }).catch(() => {});
}

// 点击音乐按钮：切换播放/暂停
musicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (musicPlaying) {
    bgm.pause();
    musicPlaying = false;
    musicBtn.classList.remove('playing');
    musicBtn.title = '播放音乐';
  } else {
    startBGM();
  }
});

// ============ 图片放大功能 ============
const overlay  = document.getElementById('photo-overlay');
const zoomImg  = document.getElementById('zoom-img');

function zoomPhoto(img) {
  zoomImg.src = img.src;
  overlay.classList.add('active');
}

function closeZoom() {
  overlay.classList.remove('active');
  // 等动画结束再清空 src，避免闪烁
  setTimeout(() => { zoomImg.src = ''; }, 300);
}

// ============ 彩花动效 ============
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animId    = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#ff6b9d','#ffc3d4','#ffb347','#ffe082','#a8edea','#c3b1e1','#f7b2bd','#ffd700'];

function createParticle(x, y) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() * -10) - 4,
    size: Math.random() * 10 + 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.2,
    alpha: 1,
    gravity: 0.3,
    drag: 0.98,
  };
}

function launchConfetti() {
  if (animId) { cancelAnimationFrame(animId); particles = []; }
  const cx = canvas.width / 2, cy = canvas.height / 2;
  for (let i = 0; i < 180; i++) {
    particles.push(createParticle(
      cx + (Math.random() - 0.5) * 200,
      cy + (Math.random() - 0.5) * 100
    ));
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= p.drag; p.vy *= p.drag;
    p.rotation += p.rotSpeed;
    p.alpha -= 0.008;

    ctx.save();
    ctx.globalAlpha = Math.max(p.alpha, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    if (p.shape === 'heart') {
      drawHeart(ctx, p.size);
    } else if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
  particles = particles.filter(p => p.alpha > 0 && p.y < canvas.height + 20);
  if (particles.length > 0) {
    animId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animId = null;
  }
}

// ============ 桃心爆炸动效 ============
function launchHearts(el) {
  // 点击桃心时同步播放音乐 + 触发星空
  if (!musicPlaying) startBGM();
  launchStarfield();
  // 获取桃心元素中心坐标
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;

  if (animId) { cancelAnimationFrame(animId); particles = []; }

  const HEART_COLORS = ['#ff4d6d','#ff85a1','#ffb3c6','#ff0a54','#c9184a','#ff6b6b','#ffd6e0','#ff8fa3'];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7 + 2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: Math.random() * 14 + 8,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      shape: 'heart',
      alpha: 1,
      gravity: 0.25,
      drag: 0.97,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
    });
  }
  animateConfetti();
}

function drawHeart(ctx, size) {
  const s = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.5, -s * 0.1, -s, -s * 0.6, 0, -s * 0.9);
  ctx.bezierCurveTo(s, -s * 0.6, s * 0.5, -s * 0.1, 0, s * 0.3);
  ctx.fill();
}

// 初始化
showPage(0);

// ============ 星空 + 流星动画 ============
(function () {
  const sc   = document.getElementById('starfield-canvas');
  const sctx = sc.getContext('2d');
  let sfAnimId = null;
  let sfRunning = false;

  function resizeSC() {
    sc.width  = window.innerWidth;
    sc.height = window.innerHeight;
  }
  resizeSC();
  window.addEventListener('resize', resizeSC);

  // 背景星星
  function makeStars() {
    const stars = [];
    const layers = [
      { n: 280, rMin: 0.2, rMax: 0.7,  aMin: 0.15, aMax: 0.5, sp: 0.007 },
      { n: 150, rMin: 0.6, rMax: 1.3,  aMin: 0.4,  aMax: 0.8, sp: 0.02  },
      { n:  50, rMin: 1.2, rMax: 2.0,  aMin: 0.6,  aMax: 1.0, sp: 0.045 },
    ];
    layers.forEach(l => {
      for (let i = 0; i < l.n; i++) {
        const tint = Math.random();
        const color = tint < 0.15 ? '180,210,255' : tint < 0.28 ? '255,245,180' : '255,255,255';
        stars.push({
          x: Math.random() * sc.width,
          y: Math.random() * sc.height,
          r: l.rMin + Math.random() * (l.rMax - l.rMin),
          baseA: l.aMin + Math.random() * (l.aMax - l.aMin),
          twinkle: Math.random() * Math.PI * 2,
          speed: l.sp + Math.random() * l.sp,
          color,
        });
      }
    });
    return stars;
  }

  // 瀑布流星：统一方向左上→右下（约45°），起点沿左边缘和上边缘均匀分布
  const ANGLE = Math.PI / 4; // 45°
  const COS_A = Math.cos(ANGLE);
  const SIN_A = Math.sin(ANGLE);

  const PALETTES = [
    { head: '255,255,255', tail: '255,255,255' },
  ];

  function makeMeteor(w, h, forceX, forceY) {
    // 起点：沿左边缘或上边缘，覆盖整个对角线
    let x, y;
    if (forceX !== undefined) {
      x = forceX; y = forceY;
    } else {
      // 上边缘+左边缘各占一半，x均匀铺满整个宽度+高度的对角线范围
      const t = Math.random();
      const diag = w + h;
      const pos  = t * diag;
      if (pos < w) {
        x = pos - h * 0.3; // 稍微偏左，让流星能覆盖左侧角落
        y = -20;
      } else {
        x = -20;
        y = pos - w;
      }
    }
    const pal   = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const speed = Math.random() * 14 + 8;   // 8~22，速度差异大
    const len   = Math.random() * 300 + 80; // 拖尾长80~380
    const thick = Math.random() * 0.6 + 0.2;
    return {
      x, y,
      vx: COS_A * speed,
      vy: SIN_A * speed,
      len, thick, pal,
      life: 0,
      maxLife: Math.round((len + Math.hypot(w, h)) / speed) + 10,
      alpha: 0, // 渐入
    };
  }

  function drawMeteor(m, w, h) {
    // 渐入渐出
    if (m.alpha < 1) m.alpha = Math.min(1, m.alpha + 0.08);
    const prog = m.life / m.maxLife;
    const fade = prog > 0.85 ? (1 - prog) / 0.15 : 1;
    const a    = m.alpha * fade;
    if (a <= 0) return;

    const tailX = m.x - COS_A * m.len;
    const tailY = m.y - SIN_A * m.len;

    // 外柔光层（宽）
    const mg1 = sctx.createLinearGradient(tailX, tailY, m.x, m.y);
    mg1.addColorStop(0,   `rgba(${m.pal.tail},0)`);
    mg1.addColorStop(0.5, `rgba(${m.pal.tail},${(a * 0.08).toFixed(3)})`);
    mg1.addColorStop(1,   `rgba(${m.pal.head},${(a * 0.18).toFixed(3)})`);
    sctx.beginPath(); sctx.moveTo(tailX, tailY); sctx.lineTo(m.x, m.y);
    sctx.strokeStyle = mg1; sctx.lineWidth = m.thick * 6; sctx.lineCap = 'round'; sctx.stroke();

    // 中光晕层
    const mg2 = sctx.createLinearGradient(tailX, tailY, m.x, m.y);
    mg2.addColorStop(0,   `rgba(${m.pal.tail},0)`);
    mg2.addColorStop(0.4, `rgba(${m.pal.tail},${(a * 0.25).toFixed(3)})`);
    mg2.addColorStop(1,   `rgba(${m.pal.head},${(a * 0.7).toFixed(3)})`);
    sctx.beginPath(); sctx.moveTo(tailX, tailY); sctx.lineTo(m.x, m.y);
    sctx.strokeStyle = mg2; sctx.lineWidth = m.thick * 2.5; sctx.stroke();

    // 核心亮线
    const mg3 = sctx.createLinearGradient(tailX, tailY, m.x, m.y);
    mg3.addColorStop(0, `rgba(${m.pal.tail},0)`);
    mg3.addColorStop(1, `rgba(255,255,255,${a.toFixed(3)})`);
    sctx.beginPath(); sctx.moveTo(tailX, tailY); sctx.lineTo(m.x, m.y);
    sctx.strokeStyle = mg3; sctx.lineWidth = m.thick * 0.8; sctx.stroke();

    // 头部光晕
    const gr = sctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.thick * 8);
    gr.addColorStop(0,   `rgba(255,255,255,${a.toFixed(3)})`);
    gr.addColorStop(0.4, `rgba(${m.pal.head},${(a * 0.6).toFixed(3)})`);
    gr.addColorStop(1,   'rgba(0,0,0,0)');
    sctx.beginPath(); sctx.arc(m.x, m.y, m.thick * 8, 0, Math.PI * 2);
    sctx.fillStyle = gr; sctx.fill();
  }

  window.launchStarfield = function () {
    if (sfRunning) return;
    sfRunning = true;

    resizeSC();
    const w = sc.width, h = sc.height;
    const stars   = makeStars();
    const meteors = [];
    let   frame   = 0;

    // 预填充流星
    for (let i = 0; i < 150; i++) {
      const m = makeMeteor(w, h);
      const pre = Math.floor(Math.random() * m.maxLife * 0.8);
      m.x += m.vx * pre; m.y += m.vy * pre;
      m.life = pre; m.alpha = 1;
      meteors.push(m);
    }

    // 书本保持可见，不主动隐藏——靠canvas深色背景前90帧渐入自然盖过去
    const bookWrapper = document.querySelector('.book-wrapper');

    // 先设好初始状态，下一帧再加 visible（让 transition 生效）
    sc.classList.remove('fadeout', 'visible');
    sc.style.opacity = '';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sc.classList.add('visible');
      });
    });

    // ---- 采样"生日快乐"笔画坐标 ----
    function sampleTextPoints() {
      const oc = document.createElement('canvas');
      oc.width = w; oc.height = h;
      const ox = oc.getContext('2d');
      const fs = Math.round(Math.min(w / 5.5, h / 3.2));
      ox.font = `bold ${fs}px SimSun, 'Microsoft YaHei', serif`;
      ox.textBaseline = 'middle';
      ox.fillStyle = '#fff';
      const cw  = fs * 1.15;
      const tx0 = w / 2 - cw * 2.0;
      const ty  = h * 0.5;
      '生日快乐'.split('').forEach((ch, i) => {
        ox.textAlign = 'left';
        ox.fillText(ch, tx0 + i * cw, ty);
      });
      const px  = ox.getImageData(0, 0, w, h).data;
      const pts = [];
      for (let y = 0; y < h; y += 2)
        for (let x = 0; x < w; x += 2)
          if (px[(y * w + x) * 4 + 3] > 100) pts.push({ x, y });
      // 均匀间隔采样，保证每个笔画都有覆盖
      const target = 600;
      if (pts.length <= target) return pts;
      const step = pts.length / target;
      const sampled = [];
      for (let i = 0; i < target; i++) sampled.push(pts[Math.floor(i * step)]);
      return sampled;
    }

    // 采样小猪轮廓坐标
    function samplePigPoints() {
      const oc = document.createElement('canvas');
      oc.width = w; oc.height = h;
      const ox = oc.getContext('2d');
      ox.strokeStyle = '#fff';
      ox.fillStyle = 'rgba(0,0,0,0)';

      const cx = w / 2, cy = h / 2;
      const R  = Math.min(w, h) * 0.18; // 脸的半径

      ox.lineWidth = 3;

      // 脸（大圆）
      ox.beginPath();
      ox.arc(cx, cy, R, 0, Math.PI * 2);
      ox.stroke();

      // 左耳
      ox.beginPath();
      ox.ellipse(cx - R * 0.72, cy - R * 0.82, R * 0.22, R * 0.28, -Math.PI / 5, 0, Math.PI * 2);
      ox.stroke();

      // 右耳
      ox.beginPath();
      ox.ellipse(cx + R * 0.72, cy - R * 0.82, R * 0.22, R * 0.28, Math.PI / 5, 0, Math.PI * 2);
      ox.stroke();

      // 鼻子（椭圆）
      ox.beginPath();
      ox.ellipse(cx, cy + R * 0.22, R * 0.32, R * 0.22, 0, 0, Math.PI * 2);
      ox.stroke();

      // 鼻孔左
      ox.beginPath();
      ox.arc(cx - R * 0.13, cy + R * 0.22, R * 0.06, 0, Math.PI * 2);
      ox.stroke();

      // 鼻孔右
      ox.beginPath();
      ox.arc(cx + R * 0.13, cy + R * 0.22, R * 0.06, 0, Math.PI * 2);
      ox.stroke();

      // 左眼
      ox.beginPath();
      ox.arc(cx - R * 0.35, cy - R * 0.18, R * 0.09, 0, Math.PI * 2);
      ox.stroke();

      // 右眼
      ox.beginPath();
      ox.arc(cx + R * 0.35, cy - R * 0.18, R * 0.09, 0, Math.PI * 2);
      ox.stroke();

      // 微笑嘴巴
      ox.beginPath();
      ox.arc(cx, cy + R * 0.55, R * 0.28, 0.1, Math.PI - 0.1);
      ox.stroke();

      const px  = ox.getImageData(0, 0, w, h).data;
      const pts = [];
      for (let y = 0; y < h; y += 2)
        for (let x = 0; x < w; x += 2)
          if (px[(y * w + x) * 4 + 3] > 30) pts.push({ x, y });
      // 均匀采样约300点，跟文字密度接近
      const target = 300;
      if (pts.length <= target) return pts;
      const step = pts.length / target;
      const sampled = [];
      for (let i = 0; i < target; i++) sampled.push(pts[Math.floor(i * step)]);
      return sampled;
    }

    // ---- 文字流星 ----
    const textMeteors = [];
    const settled     = [];
    let targets = null;
    const WEAVE_START = 80; // 第80帧开始编织

    // 散开粒子列表
    const dispersing = [];
    let disperseTriggered = false;

    // 小猪汇聚
    const pigMeteors  = [];
    const pigSettled  = [];
    let pigTriggered  = false;
    let pigTargets    = null;
    let pigWeaveFrame = 0;
    let pigAllSettled = false;
    let pigHoldCount  = 0;
    let sfFading      = false;
    let fadeOutFrame  = 0;
    const FADE_OUT_FRAMES = 90; // 1.5秒淡出

    function spawnTextMeteors(pts) {
      pts.forEach((t, i) => {
        // 起点沿上/左边缘
        const diag = w + h;
        const pos  = Math.random() * diag;
        let sx, sy;
        if (pos < w) { sx = pos - h * 0.2; sy = -20; }
        else          { sx = -20; sy = pos - w; }

        const flyFrames = Math.floor(Math.random() * 35 + 15);
        const delay     = Math.floor(i / pts.length * 100);
        textMeteors.push({
          x: sx, y: sy,
          tx: t.x, ty: t.y,
          vx: COS_A * (Math.random() * 8 + 6),
          vy: SIN_A * (Math.random() * 8 + 6),
          phase: 'fly',
          delay, flyFrames, flown: 0,
          alpha: 0,
          r: Math.random() * 0.8 + 0.8,
          trail: [],
          thick: 0.3,
        });
      });
    }

    function tickTextMeteor(p, wf) {
      if (wf < p.delay) return false;

      if (p.phase === 'fly') {
        p.x += p.vx; p.y += p.vy;
        p.flown++;
        p.alpha = Math.min(1, p.alpha + 0.1);
        drawTMTrail(p);
        if (p.flown >= p.flyFrames) {
          // 转向目标
          const dx = p.tx - p.x, dy = p.ty - p.y;
          const dist = Math.hypot(dx, dy);
          const spd  = Math.min(dist / 18, 16);
          p.vx = (dx / dist) * spd;
          p.vy = (dy / dist) * spd;
          p.phase = 'seek';
        }
        return false;
      }

      if (p.phase === 'seek') {
        const dx = p.tx - p.x, dy = p.ty - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 2) {
          p.x = p.tx; p.y = p.ty;
          p.phase = 'done';
          settled.push({ x: p.tx, y: p.ty, r: p.r });
          return true; // 可以从 textMeteors 移除
        }
        const spd = Math.min(dist * 0.18, 16);
        p.vx = (dx / dist) * spd;
        p.vy = (dy / dist) * spd;
        p.x += p.vx; p.y += p.vy;
        drawTMTrail(p);
        return false;
      }
      return false;
    }

    function drawTMTrail(p) {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 10) p.trail.shift();
      if (p.trail.length >= 2) {
        const t0 = p.trail[0];
        const mg = sctx.createLinearGradient(t0.x, t0.y, p.x, p.y);
        mg.addColorStop(0, 'rgba(255,255,255,0)');
        mg.addColorStop(1, `rgba(255,255,255,${p.alpha.toFixed(2)})`);
        sctx.beginPath();
        sctx.moveTo(t0.x, t0.y); sctx.lineTo(p.x, p.y);
        sctx.strokeStyle = mg;
        sctx.lineWidth = p.thick;
        sctx.lineCap = 'round';
        sctx.stroke();
      }
      sctx.beginPath();
      sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      sctx.fillStyle = `rgba(255,255,255,${p.alpha.toFixed(2)})`;
      sctx.fill();
    }

    function drawSettled() {
      settled.forEach(p => {
        const tw = 0.6 + 0.4 * Math.sin(frame * 0.07 + p.x * 0.02);
        sctx.beginPath();
        sctx.arc(p.x, p.y, p.r * 1.3, 0, Math.PI * 2);
        sctx.fillStyle = `rgba(255,255,255,${tw.toFixed(2)})`;
        sctx.fill();
        // 光晕
        const gl = sctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        gl.addColorStop(0, `rgba(255,255,255,${(tw*0.3).toFixed(2)})`);
        gl.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.beginPath(); sctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        sctx.fillStyle = gl; sctx.fill();
      });
    }

    // 触发散开后漩涡汇聚成小猪
    function triggerDispersal() {
      disperseTriggered = true;
      const rawPig = samplePigPoints();

      // 小猪中心
      const pigCx = rawPig.reduce((s, p) => s + p.x, 0) / rawPig.length;
      const pigCy = rawPig.reduce((s, p) => s + p.y, 0) / rawPig.length;

      // 按极角排序，产生顺序感
      pigTargets = rawPig.slice().sort((a, b) => {
        const angA = Math.atan2(a.y - pigCy, a.x - pigCx);
        const angB = Math.atan2(b.y - pigCy, b.x - pigCx);
        return angA - angB;
      });

      // settled 粒子取约70%
      const pool = settled.filter(() => Math.random() < 0.70);
      settled.length = 0;

      pool.forEach((p, i) => {
        const t = pigTargets[i % pigTargets.length];

        // 散开方向：沿流星河45°加抖动
        const speed = Math.random() * 5 + 3;
        const jitter = (Math.random() - 0.5) * (Math.PI / 5);
        const a = ANGLE + jitter;
        const scatterFrames = Math.floor(Math.random() * 25 + 15);

        // 漩涡参数：粒子以目标点为圆心，初始半径较大，边旋转边缩小
        // 起始角 = 当前位置相对目标的角度 + 额外旋转圈数
        const initAngle = Math.atan2(p.y - t.y, p.x - t.x);
        const initRadius = Math.hypot(p.x - t.x, p.y - t.y);
        // 延迟：按轮廓顺序错开，让小猪逐步"画"出来
        const spiralDelay = Math.floor((i % pigTargets.length) / pigTargets.length * 90);
        // 旋转圈数（0.5~1.5圈），产生漩涡感
        const totalRotation = (Math.random() * 1.0 + 0.5) * Math.PI * 2;

        dispersing.push({
          x: p.x, y: p.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          tx: t.x, ty: t.y,
          r: p.r,
          alpha: 1,
          trail: [],
          phase: 'scatter',
          scatterFrames,
          scattered: 0,
          spiralDelay,
          seekFrame: 0,
          // 漩涡属性
          swirlAngle: initAngle,
          swirlRadius: initRadius,
          totalRotation,
          swirlDone: false,
        });
      });

      pigTriggered = true;
    }

    function tickPigMeteor(p, wf) { return false; } // 不再使用，保留避免报错

    function drawPigSettled() {
      pigSettled.forEach(p => {
        const tw = 0.6 + 0.4 * Math.sin(frame * 0.07 + p.x * 0.02);
        sctx.beginPath();
        sctx.arc(p.x, p.y, p.r * 1.3, 0, Math.PI * 2);
        sctx.fillStyle = `rgba(255,182,193,${tw.toFixed(2)})`;
        sctx.fill();
        const gl = sctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        gl.addColorStop(0, `rgba(255,182,193,${(tw*0.3).toFixed(2)})`);
        gl.addColorStop(1, 'rgba(255,182,193,0)');
        sctx.beginPath(); sctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        sctx.fillStyle = gl; sctx.fill();
      });
    }

    function tickDispersing() {
      for (let i = dispersing.length - 1; i >= 0; i--) {
        const p = dispersing[i];

        if (p.phase === 'scatter') {
          // 顺流星河方向散开
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.97; p.vy *= 0.97;
          p.scattered++;
          if (p.scattered >= p.scatterFrames) {
            // 散开结束，切换到漩涡聚拢阶段
            // 重新计算当前位置相对目标的角度和半径
            p.swirlAngle  = Math.atan2(p.y - p.ty, p.x - p.tx);
            p.swirlRadius = Math.hypot(p.x - p.tx, p.y - p.ty);
            p.phase = 'seek';
            p.seekFrame = 0;
          }
        } else if (p.phase === 'seek') {
          p.seekFrame++;
          // 等待延迟（让小猪按顺序出现）
          if (p.seekFrame <= p.spiralDelay) {
            // 原地微微漂浮
          } else {
            const t = p.seekFrame - p.spiralDelay; // 实际运动帧
            // 总共约60帧内完成漩涡汇聚
            const totalFrames = 60;
            const progress = Math.min(t / totalFrames, 1);

            if (progress >= 1 || p.swirlRadius < 2) {
              // 到位
              p.x = p.tx; p.y = p.ty;
              p.phase = 'done';
              pigSettled.push({ x: p.tx, y: p.ty, r: p.r });
              dispersing.splice(i, 1);
              continue;
            }

            // 漩涡：角度按totalRotation旋转，半径线性收缩
            const eased = 1 - (1 - progress) * (1 - progress); // ease-in
            p.swirlAngle  -= p.totalRotation / totalFrames; // 每帧旋转固定角
            p.swirlRadius  = Math.hypot(p.x - p.tx, p.y - p.ty) * 0.92; // 每帧缩小8%
            if (p.swirlRadius < 2) p.swirlRadius = 2;

            p.x = p.tx + Math.cos(p.swirlAngle) * p.swirlRadius;
            p.y = p.ty + Math.sin(p.swirlAngle) * p.swirlRadius;
          }
        }

        // 绘制拖尾
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 10) p.trail.shift();
        if (p.trail.length >= 2) {
          const t0 = p.trail[0];
          const mg = sctx.createLinearGradient(t0.x, t0.y, p.x, p.y);
          mg.addColorStop(0, 'rgba(255,255,255,0)');
          mg.addColorStop(1, `rgba(255,255,255,${p.alpha.toFixed(2)})`);
          sctx.beginPath(); sctx.moveTo(t0.x, t0.y); sctx.lineTo(p.x, p.y);
          sctx.strokeStyle = mg; sctx.lineWidth = 0.8; sctx.lineCap = 'round'; sctx.stroke();
        }
        sctx.beginPath(); sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        sctx.fillStyle = `rgba(255,255,255,${p.alpha.toFixed(2)})`; sctx.fill();
      }
    }

    let weaveFrame = 0;
    // 文字全部形成后等待的帧数（约2秒）
    const SETTLE_HOLD = 90;
    let settleHoldCount = 0;
    let allSettled = false;

    function tick() {
      frame++;

      // 每帧先清空 canvas，保证背景透明（书本在下方可见）
      sctx.clearRect(0, 0, w, h);

      // 淡出进度：sfFading时每帧递增，让整体透明度从1渐减到0
      if (sfFading) fadeOutFrame++;
      const fadeOutAlpha = sfFading ? Math.max(1 - fadeOutFrame / FADE_OUT_FRAMES, 0) : 1;

      // 如果已完全透明，结束动画
      if (sfFading && fadeOutAlpha <= 0) {
        cancelAnimationFrame(sfAnimId);
        sctx.clearRect(0, 0, w, h);
        sfRunning = false;
        return;
      }

      // 所有绘制都套在 save/restore 内
      sctx.save();

      // 深色星空背景：前90帧从透明渐入到完全覆盖
      const bgCover = Math.min(frame / 90, 1);
      const grad = sctx.createLinearGradient(0, 0, w * 0.7, h);
      grad.addColorStop(0,    '#020610');
      grad.addColorStop(0.4,  '#060f28');
      grad.addColorStop(0.75, '#0b0720');
      grad.addColorStop(1,    '#12042a');
      sctx.globalAlpha = bgCover;
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, w, h);
      sctx.globalAlpha = 1;

      // 拖尾残影叠加（bgCover完全覆盖后才有拖尾效果，否则叠加会产生残留）
      if (bgCover >= 1) {
        sctx.globalAlpha = 0.18;
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, w, h);
        sctx.globalAlpha = 1;
      }

      // 星云光斑（bgCover完全覆盖后才画，否则会在透明背景上留色块）
      if (bgCover > 0.9 && !sfFading && (frame % 8 === 0)) {
        [[0.1,0.1,'50,70,160',0.05],[0.8,0.2,'70,30,150',0.04],
         [0.45,0.55,'20,50,130',0.035],[0.2,0.8,'90,20,110',0.035]
        ].forEach(([rx,ry,col,a]) => {
          const ng = sctx.createRadialGradient(rx*w,ry*h,0,rx*w,ry*h,Math.min(w,h)*0.38);
          ng.addColorStop(0,`rgba(${col},${a})`);
          ng.addColorStop(1,'rgba(0,0,0,0)');
          sctx.fillStyle = ng;
          sctx.fillRect(0,0,w,h);
        });
      }

      // 星星
      stars.forEach(s => {
        s.twinkle += s.speed;
        const a = s.baseA * (0.5 + 0.5 * Math.sin(s.twinkle));
        if (s.r > 1.4) {
          const ray = s.r * 3.5;
          sctx.strokeStyle = `rgba(${s.color},${(a*0.4).toFixed(2)})`;
          sctx.lineWidth = 0.5;
          sctx.beginPath();
          sctx.moveTo(s.x-ray,s.y); sctx.lineTo(s.x+ray,s.y);
          sctx.moveTo(s.x,s.y-ray); sctx.lineTo(s.x,s.y+ray);
          sctx.stroke();
        }
        sctx.beginPath();
        sctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        sctx.fillStyle = `rgba(${s.color},${a.toFixed(2)})`;
        sctx.fill();
      });

      // 背景流星瀑布（淡出时不再补充新流星）
      if (!sfFading) {
        const toAdd = 130 - meteors.length;
        for (let i = 0; i < Math.min(toAdd, 6); i++) meteors.push(makeMeteor(w, h));
      }
      for (let i = meteors.length-1; i >= 0; i--) {
        const m = meteors[i];
        drawMeteor(m, w, h);
        m.x += m.vx; m.y += m.vy; m.life++;
        if (m.life >= m.maxLife || (m.x > w+400 && m.y > h+400)) meteors.splice(i,1);
      }

      // 第80帧采样文字点，派发文字流星
      if (frame === WEAVE_START) {
        targets = sampleTextPoints();
        spawnTextMeteors(targets);
      }

      // 驱动文字流星
      if (targets) {
        weaveFrame++;
        for (let i = textMeteors.length-1; i >= 0; i--) {
          const done = tickTextMeteor(textMeteors[i], weaveFrame);
          if (done) textMeteors.splice(i, 1);
        }

        // 所有文字流星都落定后，等待一段时间再触发散开
        if (!allSettled && textMeteors.length === 0 && settled.length > 0) {
          allSettled = true;
        }
        if (allSettled && !disperseTriggered) {
          settleHoldCount++;
          if (settleHoldCount >= SETTLE_HOLD) {
            triggerDispersal();
          }
        }

        if (!disperseTriggered) drawSettled();
        if (disperseTriggered) {
          tickDispersing();
          drawPigSettled();

          // 小猪全部落定后等120帧（2秒）再淡出
          if (!pigAllSettled && dispersing.length === 0 && pigSettled.length > 0) {
            pigAllSettled = true;
          }
          if (pigAllSettled) {
            pigHoldCount++;
            if (pigHoldCount >= 120 && !sfFading) {
              sfFading = true;
            }
          }
        }
      }

      sctx.restore();

      // 淡出时直接操控 canvas CSS opacity，和出现时效果对称
      if (sfFading) {
        const op = Math.max(1 - fadeOutFrame / FADE_OUT_FRAMES, 0);
        sc.style.opacity = op;
      }

      sfAnimId = requestAnimationFrame(tick);
    }

    tick();
  };
})();
