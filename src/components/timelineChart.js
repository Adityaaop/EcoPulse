export class TimelineChart {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext('2d');
    this.data = [];
    this.activeMetric = 'aqi';
    this.hoverIndex = -1;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      this.draw();
    });
  }

  resize() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.width = rect.width || 600;
    this.height = 220;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);
    this.draw();
  }

  setData(timelineData) {
    this.data = timelineData || [];
    this.draw();
    this.updateWindowInsight();
  }

  setMetric(metric) {
    this.activeMetric = metric;
    this.draw();
  }

  handleMouseMove(e) {
    if (!this.data || this.data.length === 0) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const padLeft = 45;
    const padRight = 20;
    const chartW = this.width - padLeft - padRight;
    const step = chartW / (this.data.length - 1);

    const index = Math.round((mouseX - padLeft) / step);
    if (index >= 0 && index < this.data.length) {
      if (this.hoverIndex !== index) {
        this.hoverIndex = index;
        this.draw();
      }
    }
  }

  draw() {
    if (!this.data || this.data.length === 0) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 35;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    let values = [];
    let unit = '';
    let maxVal = 100;
    let minVal = 0;
    let colorPrimary = '#10b981';
    let gradientStart = 'rgba(16, 185, 129, 0.35)';
    let gradientEnd = 'rgba(16, 185, 129, 0.0)';

    if (this.activeMetric === 'aqi') {
      values = this.data.map(d => d.aqi);
      unit = ' AQI';
      maxVal = Math.max(250, ...values) + 30;
      colorPrimary = '#f59e0b';
      gradientStart = 'rgba(245, 158, 11, 0.35)';
      gradientEnd = 'rgba(245, 158, 11, 0.0)';
    } else if (this.activeMetric === 'fogProb') {
      values = this.data.map(d => d.fogProb);
      unit = '%';
      maxVal = 100;
      colorPrimary = '#38bdf8';
      gradientStart = 'rgba(56, 189, 248, 0.35)';
      gradientEnd = 'rgba(56, 189, 248, 0.0)';
    } else {
      values = this.data.map(d => (d.visibility / 1000));
      unit = ' km';
      maxVal = Math.max(12, ...values) + 2;
      colorPrimary = '#a855f7';
      gradientStart = 'rgba(168, 85, 247, 0.35)';
      gradientEnd = 'rgba(168, 85, 247, 0.0)';
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padTop + (chartH / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const val = Math.round(maxVal - (maxVal - minVal) * (i / gridSteps));
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}`, padLeft - 8, y + 3);
    }

    const stepX = chartW / (this.data.length - 1);
    const points = values.map((val, idx) => {
      const normY = (val - minVal) / (maxVal - minVal);
      const x = padLeft + idx * stepX;
      const y = padTop + chartH - (normY * chartH);
      return { x, y, val };
    });

    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, gradientEnd);

    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + chartH);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
    }
    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
    }
    ctx.strokeStyle = colorPrimary;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
    ctx.textAlign = 'center';
    ctx.font = '11px Inter, sans-serif';

    for (let i = 0; i < this.data.length; i += 4) {
      const d = this.data[i];
      const timeObj = new Date(d.time);
      const timeLabel = isNaN(timeObj.getTime()) 
        ? `+${i}h` 
        : timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      const x = padLeft + i * stepX;
      ctx.fillText(timeLabel, x, h - 10);
    }

    if (this.hoverIndex >= 0 && this.hoverIndex < points.length) {
      const pt = points[this.hoverIndex];
      const item = this.data[this.hoverIndex];

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pt.x, padTop);
      ctx.lineTo(pt.x, padTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = colorPrimary;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const timeObj = new Date(item.time);
      const timeText = isNaN(timeObj.getTime()) ? `Hour ${this.hoverIndex}` : timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tipText = `${timeText}: ${pt.val}${unit}`;

      ctx.font = '12px Inter, sans-serif';
      const textWidth = ctx.measureText(tipText).width;
      const boxW = textWidth + 18;
      const boxH = 26;

      let boxX = pt.x - boxW / 2;
      if (boxX < 10) boxX = 10;
      if (boxX + boxW > w - 10) boxX = w - boxW - 10;

      let boxY = pt.y - 36;
      if (boxY < 10) boxY = pt.y + 14;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = colorPrimary;
      ctx.lineWidth = 1;
      this.roundRect(ctx, boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(tipText, boxX + boxW / 2, boxY + 17);
    }
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  updateWindowInsight() {
    const insightEl = document.getElementById('chart-window-insight');
    if (!insightEl || !this.data || this.data.length === 0) return;

    let bestHour = 0;
    let worstHour = 0;
    let minDanger = 9999;
    let maxDanger = -1;

    this.data.forEach((d, idx) => {
      const dangerScore = (d.aqi || 50) + (d.fogProb || 0);
      if (dangerScore < minDanger) {
        minDanger = dangerScore;
        bestHour = idx;
      }
      if (dangerScore > maxDanger) {
        maxDanger = dangerScore;
        worstHour = idx;
      }
    });

    const bestTime = new Date(this.data[bestHour].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const worstTime = new Date(this.data[worstHour].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    insightEl.innerHTML = `
      <div class="insight-badge safe">
        <span class="dot"></span>
        <span><strong>Safest Outdoor Window:</strong> Around ${bestTime} (AQI: ${this.data[bestHour].aqi}, Fog: ${this.data[bestHour].fogProb}%)</span>
      </div>
      <div class="insight-badge danger">
        <span class="dot"></span>
        <span><strong>Peak Danger Inversion:</strong> Around ${worstTime} (AQI: ${this.data[worstHour].aqi}, Fog: ${this.data[worstHour].fogProb}%)</span>
      </div>
    `;
  }
}
