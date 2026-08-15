/* ==========================================================================
   PULSE AUDIO VISUALIZER
   Dynamic Canvas Visualizer & Equalizer animations.
   By Pushkar Hiremath
   ========================================================================== */

export class PulseVisualizer {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.isPlaying = false;
    this.animFrameId = null;
    this.mode = 'radial'; // 'radial' | 'bars' | 'wave'
    this.particles = [];
    this.initParticles();

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  initParticles() {
    this.particles = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        hue: Math.floor(Math.random() * 60) + 260 // Purple to Pink hues
      });
    }
  }

  resizeCanvas() {
    if (!this.canvas) {
      this.canvas = document.getElementById(this.canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
    }
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 440) * dpr;
    this.canvas.height = (rect.height || 440) * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.animate();
  }

  stop() {
    this.isPlaying = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.clear();
  }

  clear() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    if (this.ctx) {
      this.ctx.clearRect(0, 0, rect.width || 600, rect.height || 600);
    }
  }

  animate() {
    if (!this.isPlaying) return;
    if (!this.canvas) {
      this.canvas = document.getElementById(this.canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
    }

    // Only render frames if the fullscreen player or canvas is actually visible to conserve 100% CPU/GPU
    const fsPlayer = document.getElementById('fullscreen-player');
    const isVisible = fsPlayer && fsPlayer.classList.contains('active');
    if (!isVisible) {
      this.animFrameId = requestAnimationFrame(() => this.animate());
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 440;
    const height = rect.height || 440;
    this.ctx.clearRect(0, 0, width, height);

    const time = Date.now() * 0.0025;

    if (this.mode === 'radial') {
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.65;

      // Draw floating music particles
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${p.alpha * 0.6})`;
        this.ctx.fill();
      });

      // Draw pulsating frequency bars around the disc
      const count = 44;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (time * 0.2);
        const wave1 = Math.sin(time * 2.5 + i * 0.25);
        const wave2 = Math.cos(time * 1.8 + i * 0.15);
        const amp = (Math.abs(wave1 * wave2) * 32) + 5;

        const x1 = centerX + Math.cos(angle) * (baseRadius + 4);
        const y1 = centerY + Math.sin(angle) * (baseRadius + 4);
        const x2 = centerX + Math.cos(angle) * (baseRadius + amp + 4);
        const y2 = centerY + Math.sin(angle) * (baseRadius + amp + 4);

        const hue = 265 + (i / count) * 60;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.85)`;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
      }

      // Outer glowing ring
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, baseRadius + 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

    } else if (this.mode === 'bars') {
      const barCount = 48;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const value = Math.abs(Math.sin(time + i * 0.15) * Math.cos(time * 0.5 + i * 0.08)) * 0.85 + 0.15;
        const barHeight = value * (height * 0.7);

        const x = i * barWidth;
        const y = height - barHeight;

        const gradient = this.ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, '#e879f9');
        gradient.addColorStop(0.5, '#c084fc');
        gradient.addColorStop(1, '#6b21a8');

        this.ctx.fillStyle = gradient;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        this.ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      }
    }

    this.animFrameId = requestAnimationFrame(() => this.animate());
  }
}

if (typeof window !== 'undefined') {
  window.PulseVisualizer = PulseVisualizer;
}

export default PulseVisualizer;
