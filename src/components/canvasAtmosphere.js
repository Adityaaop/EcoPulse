export class AtmosphericCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!canvasId || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mode = 'clear';
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createParticles(65);
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.createParticles(this.getParticleCount());
  }

  getParticleCount() {
    if (this.mode === 'compound' || this.mode === 'smog') return 85;
    if (this.mode === 'fog') return 70;
    return 35;
  }

  createParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.generateParticle(true));
    }
  }

  generateParticle(randomY = false) {
    const isSmog = this.mode === 'smog' || this.mode === 'compound';
    const isFog = this.mode === 'fog';

    const radius = isFog 
      ? Math.random() * 45 + 20 
      : (isSmog ? Math.random() * 6 + 1.5 : Math.random() * 2.5 + 1);

    const speedX = (Math.random() - 0.4) * (isFog ? 0.3 : 0.6);
    const speedY = (Math.random() - 0.5) * (isFog ? 0.15 : 0.4);

    let color = 'rgba(255, 255, 255, 0.05)';
    if (isFog) {
      color = `rgba(200, 220, 240, ${Math.random() * 0.06 + 0.02})`;
    } else if (this.mode === 'compound') {
      color = Math.random() > 0.5 
        ? `rgba(217, 119, 6, ${Math.random() * 0.15 + 0.05})` 
        : `rgba(180, 83, 9, ${Math.random() * 0.12 + 0.04})`;
    } else if (isSmog) {
      color = `rgba(234, 179, 8, ${Math.random() * 0.12 + 0.03})`;
    } else {
      color = `rgba(16, 185, 129, ${Math.random() * 0.12 + 0.03})`;
    }

    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : (speedY > 0 ? -radius : this.height + radius),
      radius,
      speedX,
      speedY,
      color,
      alpha: Math.random() * 0.5 + 0.3,
      alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += p.alphaSpeed;

      if (p.alpha <= 0.1 || p.alpha >= 0.8) {
        p.alphaSpeed *= -1;
      }

      if (p.x < -p.radius * 2) p.x = this.width + p.radius;
      if (p.x > this.width + p.radius * 2) p.x = -p.radius;
      if (p.y < -p.radius * 2) p.y = this.height + p.radius;
      if (p.y > this.height + p.radius * 2) p.y = -p.radius;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      this.ctx.beginPath();

      if (this.mode === 'fog') {
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, 'rgba(210, 230, 250, 0.09)');
        grad.addColorStop(0.6, 'rgba(180, 210, 240, 0.04)');
        grad.addColorStop(1, 'rgba(160, 190, 220, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
