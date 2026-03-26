// ============ 页面管理 ============
const pages = document.querySelectorAll('.page');
let current = 0;
const total = pages.length;

function showPage(index) {
  pages.forEach((p, i) => {
    p.classList.remove('active', 'exit-left', 'enter-right');
    if (i === index) {
      p.classList.add('active');
    }
  });
}

function goNext() {
  if (current >= total - 1) return;
  playPageTurn();
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
  playPageTurn();
  const old = current;
  current--;
  pages[old].classList.remove('active');
  pages[old].classList.add('exit-left');
  setTimeout(() => {
    pages[old].classList.remove('exit-left');
    pages[current].classList.add('active');
  }, 300);
}

// 键盘左右键翻页
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goPrev();
});

// 触摸滑动翻页
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});
document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx < -50) goNext();
  if (dx >  50) goPrev();
});

// ============ 音频 ============
const bgm = document.getElementById('bgm');
const sfx = document.getElementById('page-turn-sfx');
const musicBtn = document.getElementById('music-btn');
let musicPlaying = false;

function tryPlayBGM() {
  if (!musicPlaying) {
    bgm.volume = 0.45;
    bgm.play().then(() => {
      musicPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.title = '暂停音乐';
    }).catch(() => {
      // 浏览器自动播放限制，等用户交互后再试
    });
  }
}

musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgm.pause();
    musicPlaying = false;
    musicBtn.classList.remove('playing');
    musicBtn.title = '播放音乐';
  } else {
    tryPlayBGM();
  }
});

// 页面首次点击时尝试自动播放
document.addEventListener('click', () => { tryPlayBGM(); }, { once: true });

function playPageTurn() {
  if (!sfx.src || sfx.src === window.location.href) return;
  sfx.currentTime = 0;
  sfx.volume = 0.7;
  sfx.play().catch(() => {});
}

// ============ 彩花动效 ============
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animId = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#ff6b9d','#ffc3d4','#ffb347','#ffe082','#a8edea','#c3b1e1','#f7b2bd','#ffd700'];

function createParticle(x, y) {
  return {
    x,
    y,
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
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  for (let i = 0; i < 160; i++) {
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
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.rotation += p.rotSpeed;
    p.alpha -= 0.008;

    ctx.save();
    ctx.globalAlpha = Math.max(p.alpha, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
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

// 初始化第一页
showPage(0);
