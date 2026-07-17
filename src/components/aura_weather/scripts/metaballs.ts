export interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  fromColors: [string, string, string, string];
  toColors: [string, string, string, string];
  startTime: number;
  duration: number;
}

const TRANSITION_DURATION = 1800;

export class MetaballTransition {
  private svg: SVGElement;
  private filter: SVGFilterElement;
  private blur: SVGFEGaussianBlurElement;
  private threshold: SVGFEColorMatrixElement;
  private overlay: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private state: TransitionState;
  private blobs: Array<{
    x: number;
    y: number;
    radius: number;
    color: string;
    targetX: number;
    targetY: number;
  }> = [];

  constructor(overlay: HTMLDivElement, canvas: HTMLCanvasElement) {
    this.overlay = overlay;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '0');
    this.svg.setAttribute('height', '0');
    this.svg.style.position = 'absolute';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '40';

    this.filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    this.filter.setAttribute('id', 'metaball-filter');
    this.filter.setAttribute('filterUnits', 'objectBoundingBox');
    this.filter.setAttribute('x', '-50%');
    this.filter.setAttribute('y', '-50%');
    this.filter.setAttribute('width', '200%');
    this.filter.setAttribute('height', '200%');

    const blurFilter = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blurFilter.setAttribute('in', 'SourceGraphic');
    blurFilter.setAttribute('stdDeviation', '12');
    blurFilter.setAttribute('result', 'blur');
    this.blur = blurFilter;

    const thresholdMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    thresholdMatrix.setAttribute('in', 'blur');
    thresholdMatrix.setAttribute('type', 'matrix');
    thresholdMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8');
    thresholdMatrix.setAttribute('result', 'threshold');
    this.threshold = thresholdMatrix;

    const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    composite.setAttribute('in', 'SourceGraphic');
    composite.setAttribute('in2', 'threshold');
    composite.setAttribute('operator', 'atop');

    this.filter.appendChild(blurFilter);
    this.filter.appendChild(thresholdMatrix);
    this.filter.appendChild(composite);
    this.svg.appendChild(this.filter);
    document.body.appendChild(this.svg);

    this.state = {
      isTransitioning: false,
      progress: 0,
      fromColors: ['#0c4a6e', '#075985', '#0369a1', '#0284c7'],
      toColors: ['#0c4a6e', '#075985', '#0369a1', '#0284c7'],
      startTime: 0,
      duration: TRANSITION_DURATION,
    };

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
  }

  startTransition(
    fromColors: [string, string, string, string],
    toColors: [string, string, string, string]
  ) {
    if (this.state.isTransitioning) return;

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.blobs = [
      {
        x: w * 0.2,
        y: h * 0.3,
        radius: Math.min(w, h) * 0.4,
        color: fromColors[0],
        targetX: w * 0.8,
        targetY: h * 0.7,
      },
      {
        x: w * 0.8,
        y: h * 0.7,
        radius: Math.min(w, h) * 0.35,
        color: toColors[2],
        targetX: w * 0.2,
        targetY: h * 0.3,
      },
      {
        x: w * 0.5,
        y: h * 0.1,
        radius: Math.min(w, h) * 0.3,
        color: fromColors[1],
        targetX: w * 0.5,
        targetY: h * 0.9,
      },
      {
        x: w * 0.5,
        y: h * 0.9,
        radius: Math.min(w, h) * 0.3,
        color: toColors[3],
        targetX: w * 0.5,
        targetY: h * 0.1,
      },
    ];

    this.state = {
      isTransitioning: true,
      progress: 0,
      fromColors,
      toColors,
      startTime: performance.now(),
      duration: TRANSITION_DURATION,
    };

    this.canvas.style.filter = 'url(#metaball-filter)';
    this.canvas.classList.remove('hidden');

    if (!this.animationId) {
      this.animate();
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private animate = () => {
    if (!this.state.isTransitioning) {
      this.animationId = null;
      return;
    }

    const now = performance.now();
    const elapsed = now - this.state.startTime;
    const rawProgress = Math.min(elapsed / this.state.duration, 1);
    this.state.progress = this.easeInOutCubic(rawProgress);

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    this.ctx.clearRect(0, 0, w, h);

    for (const blob of this.blobs) {
      const currentX = blob.x + (blob.targetX - blob.x) * this.state.progress;
      const currentY = blob.y + (blob.targetY - blob.y) * this.state.progress;
      const pulse = 1 + Math.sin(this.state.progress * Math.PI) * 0.15;

      const gradient = this.ctx.createRadialGradient(
        currentX, currentY, 0,
        currentX, currentY, blob.radius * pulse
      );

      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(0.6, blob.color + 'cc');
      gradient.addColorStop(1, blob.color + '00');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(currentX, currentY, blob.radius * pulse, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.canvas.style.opacity = (0.7 + Math.sin(this.state.progress * Math.PI) * 0.3).toString();

    if (rawProgress >= 1) {
      this.finishTransition();
    } else {
      this.animationId = requestAnimationFrame(this.animate);
    }
  };

  private finishTransition() {
    this.state.isTransitioning = false;
    this.canvas.classList.add('hidden');
    this.canvas.style.filter = '';
    this.canvas.style.opacity = '0';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  isActive(): boolean {
    return this.state.isTransitioning;
  }

  destroy() {
    this.finishTransition();
    this.svg.remove();
  }
}
