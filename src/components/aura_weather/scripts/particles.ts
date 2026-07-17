import type { Particle, ParticleConfig, WeatherState } from './types';

const PARTICLE_CONFIGS: Record<string, ParticleConfig> = {
  rain: {
    count: 250,
    speed: 14,
    windInfluence: 0.8,
    gravity: 0.5,
    sizeRange: [2, 4],
    opacityRange: [0.5, 0.9],
  },
  snow: {
    count: 120,
    speed: 2.5,
    windInfluence: 1.2,
    gravity: 0.15,
    sizeRange: [3, 8],
    opacityRange: [0.7, 1],
  },
};

const COLLISION_ELEMENT_IDS = [
  'temperature',
  'city-name',
  'weather-description',
  'wind-speed',
  'humidity',
  'feels-like',
  'search-input',
];

interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private config: ParticleConfig | null = null;
  private windX = 0;
  private windY = 0;
  private isActive = false;
  private collisionBoxes: CollisionBox[] = [];
  private lastBoxUpdate = 0;
  private readonly BOX_UPDATE_INTERVAL = 100;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.updateCollisionBoxes();
  }

  private updateCollisionBoxes() {
    const now = performance.now();
    if (now - this.lastBoxUpdate < this.BOX_UPDATE_INTERVAL) return;
    this.lastBoxUpdate = now;

    const canvasRect = this.canvas.getBoundingClientRect();
    this.collisionBoxes = [];

    for (const id of COLLISION_ELEMENT_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const padding = 8;

      this.collisionBoxes.push({
        x: rect.left - canvasRect.left - padding,
        y: rect.top - canvasRect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }
  }

  private checkCollision(p: Particle): boolean {
    for (const box of this.collisionBoxes) {
      if (
        p.x >= box.x &&
        p.x <= box.x + box.width &&
        p.y >= box.y &&
        p.y <= box.y + box.height
      ) {
        return true;
      }
    }
    return false;
  }

  private bounceParticle(p: Particle) {
    const centerX = this.canvas.getBoundingClientRect().width / 2;
    const centerY = this.canvas.getBoundingClientRect().height / 2;

    const dx = p.x - centerX;
    const dy = p.y - centerY;

    p.vx = dx * 0.02 + (Math.random() - 0.5) * 2;
    p.vy = -Math.abs(p.vy) * 0.5 - Math.random() * 2;

    p.opacity *= 0.7;
  }

  setWeather(state: WeatherState) {
    const type = state === 'storm' || state === 'rain' ? 'rain' :
                 state === 'snow' ? 'snow' : null;

    if (!type) {
      this.stop();
      return;
    }

    this.config = PARTICLE_CONFIGS[type];
    this.particles = [];
    this.isActive = true;

    if (!this.animationId) {
      this.animate();
    }
  }

  setWind(vx: number, vy: number) {
    this.windX = vx * 0.1;
    this.windY = vy * 0.1;
  }

  addInertia(vx: number, vy: number) {
    this.windX += vx * 0.3;
    this.windY += vy * 0.3;

    this.windX = Math.max(-5, Math.min(5, this.windX));
    this.windY = Math.max(-5, Math.min(5, this.windY));
  }

  decayInertia() {
    this.windX *= 0.95;
    this.windY *= 0.95;
  }

  private createParticle(): Particle {
    if (!this.config) {
      return { x: 0, y: 0, vx: 0, vy: 0, size: 1, opacity: 0, life: 0, maxLife: 0 };
    }

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    const size = this.config.sizeRange[0] +
      Math.random() * (this.config.sizeRange[1] - this.config.sizeRange[0]);

    const opacity = this.config.opacityRange[0] +
      Math.random() * (this.config.opacityRange[1] - this.config.opacityRange[0]);

    const isRain = this.config === PARTICLE_CONFIGS.rain;

    return {
      x: Math.random() * (w + 200) - 100,
      y: isRain ? -20 : Math.random() * h,
      vx: this.windX * this.config.windInfluence + (isRain ? -1 : (Math.random() - 0.5) * 0.5),
      vy: isRain ? this.config.speed + Math.random() * 4 : this.config.speed + Math.random() * 2,
      size,
      opacity,
      life: 0,
      maxLife: isRain ? 60 + Math.random() * 40 : 200 + Math.random() * 100,
    };
  }

  private update() {
    if (!this.config || !this.isActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.updateCollisionBoxes();

    const targetCount = Math.floor(this.config.count * (0.7 + Math.abs(this.windX) * 0.08));

    while (this.particles.length < targetCount) {
      this.particles.push(this.createParticle());
      if (this.particles.length < targetCount) {
        this.particles.push(this.createParticle());
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.vx += this.windX * 0.01;
      p.vy += this.config.gravity;

      p.x += p.vx;
      p.y += p.vy;

      p.life++;

      if (this.checkCollision(p)) {
        this.bounceParticle(p);
      }

      if (p.y > h + 20 || p.x < -100 || p.x > w + 100 || p.life > p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private draw() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.ctx.clearRect(0, 0, w, h);

    if (!this.config) return;

    const isRain = this.config === PARTICLE_CONFIGS.rain;

    this.ctx.lineCap = 'round';

    for (const p of this.particles) {
      const fade = 1 - p.life / p.maxLife;
      this.ctx.globalAlpha = p.opacity * fade;

      if (isRain) {
        const gradient = this.ctx.createLinearGradient(
          p.x, p.y,
          p.x + p.vx * 3, p.y + p.vy * 3
        );
        gradient.addColorStop(0, 'rgba(120, 180, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(120, 180, 255, 0.1)');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = p.size * 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
        this.ctx.stroke();
      } else {
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = p.size * 2;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }

    this.ctx.globalAlpha = 1;
  }

  private animate = () => {
    this.update();
    this.draw();
    this.decayInertia();
    this.animationId = requestAnimationFrame(this.animate);
  };

  stop() {
    this.isActive = false;
    this.particles = [];
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    this.ctx.clearRect(0, 0, w, h);
  }

  destroy() {
    this.stop();
  }
}
