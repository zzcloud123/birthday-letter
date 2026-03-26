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

// ============ 音频：进入页面自动播放，点击切换开关 ============
const bgm      = document.getElementById('bgm');
const musicBtn = document.getElementById('music-btn');
let musicPlaying = false;

bgm.volume = 0.45;

function startBGM() {
  bgm.play().then(() => {
    musicPlaying = true;
    musicBtn.classList.add('playing');
    musicBtn.title = '关闭音乐';
  }).catch(() => {
    // 自动播放被拒时静默等待用户点击
  });
}

// 尝试立即自动播放
startBGM();

// 若自动播放失败，用户第一次点击页面时再触发
document.addEventListener('click', function firstClick() {
  if (!musicPlaying) startBGM();
  document.removeEventListener('click', firstClick);
});

// 点击音乐按钮：切换播放/暂停
musicBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // 避免触发上面的 firstClick
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
