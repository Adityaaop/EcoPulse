export class CommuteSimulator {
  constructor(containerId, initialVisibility = 1000) {
    this.container = document.getElementById(containerId);
    this.visibility = initialVisibility;
    this.roadCondition = 'wet';
    this.vehicleType = 'car';

    this.init();
  }

  init() {
    this.render();
  }

  setVisibility(vis) {
    this.visibility = vis;
    const slider = document.getElementById('sim-vis-slider');
    if (slider) slider.value = vis;
    this.recalculate();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="commute-simulator-card">
        <div class="sim-header">
          <div class="sim-title-group">
            <span class="sim-badge">Physics Engine</span>
            <h3>Fog & Smog Commute Safety Simulator</h3>
          </div>
          <p class="sim-sub">Model stopping distance physics, reaction margins, and headlight protocols under reduced optical visibility.</p>
        </div>

        <div class="sim-controls-grid">
          <div class="sim-control-col full-width">
            <div class="control-header-row">
              <label for="sim-vis-slider" class="control-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Current Sight Visibility
              </label>
              <span id="sim-vis-val" class="control-val-badge">${this.visibility} meters</span>
            </div>
            <input type="range" id="sim-vis-slider" min="40" max="3000" step="20" value="${this.visibility}" class="sim-range-slider" />
            <div class="slider-ticks">
              <span>50m (Blinding Fog)</span>
              <span>200m (Dense)</span>
              <span>1000m (Mist)</span>
              <span>3000m+ (Moderate)</span>
            </div>
          </div>

          <div class="sim-control-col">
            <label class="control-label">Road Surface Condition</label>
            <div class="segmented-control" id="sim-road-segmented">
              <button class="seg-btn ${this.roadCondition === 'dry' ? 'active' : ''}" data-road="dry">Dry Tarmac</button>
              <button class="seg-btn ${this.roadCondition === 'wet' ? 'active' : ''}" data-road="wet">Wet Mist / Dew</button>
              <button class="seg-btn ${this.roadCondition === 'ice' ? 'active' : ''}" data-road="ice">Black Ice / Rime</button>
            </div>
          </div>

          <div class="sim-control-col">
            <label class="control-label">Vehicle Category</label>
            <div class="segmented-control" id="sim-vehicle-segmented">
              <button class="seg-btn ${this.vehicleType === 'car' ? 'active' : ''}" data-veh="car">Passenger Car</button>
              <button class="seg-btn ${this.vehicleType === 'truck' ? 'active' : ''}" data-veh="truck">Commercial Truck</button>
              <button class="seg-btn ${this.vehicleType === 'bike' ? 'active' : ''}" data-veh="bike">Motorcycle</button>
            </div>
          </div>
        </div>

        <div id="sim-results-output" class="sim-results-output"></div>
      </div>
    `;

    this.attachEvents();
    this.recalculate();
  }

  attachEvents() {
    const slider = document.getElementById('sim-vis-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.visibility = parseInt(e.target.value, 10);
        document.getElementById('sim-vis-val').textContent = `${this.visibility} meters`;
        this.recalculate();
      });
    }

    const roadButtons = this.container.querySelectorAll('#sim-road-segmented .seg-btn');
    roadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roadButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.roadCondition = btn.dataset.road;
        this.recalculate();
      });
    });

    const vehButtons = this.container.querySelectorAll('#sim-vehicle-segmented .seg-btn');
    vehButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        vehButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.vehicleType = btn.dataset.veh;
        this.recalculate();
      });
    });
  }

  recalculate() {
    let mu = 0.7;
    if (this.roadCondition === 'wet') mu = 0.45;
    if (this.roadCondition === 'ice') mu = 0.15;

    let massFactor = 1.0;
    if (this.vehicleType === 'truck') massFactor = 1.35;
    if (this.vehicleType === 'bike') massFactor = 1.15;

    const tReact = 1.5;
    const g = 9.81;

    const A = 1 / (2 * (mu / massFactor) * g);
    const B = tReact;
    const C = this.visibility * 0.75;

    const disc = B * B + 4 * A * C;
    let safeSpeedMs = (-B + Math.sqrt(disc)) / (2 * A);
    let safeSpeedKmh = Math.round(safeSpeedMs * 3.6);

    safeSpeedKmh = Math.min(110, Math.max(15, safeSpeedKmh));
    const practicalSpeedMs = safeSpeedKmh / 3.6;

    const reactionDist = Math.round(practicalSpeedMs * tReact);
    const brakingDist = Math.round((practicalSpeedMs * practicalSpeedMs) / (2 * (mu / massFactor) * g));
    const totalStoppingDist = reactionDist + brakingDist;

    const safetyMargin = this.visibility - totalStoppingDist;
    const isDangerZone = safetyMargin < 15;

    let lightsRecommendation = 'Low Beams';
    if (this.visibility < 150) {
      lightsRecommendation = 'Low Beams + Front Fog Lamps + Rear Fog Lamps';
    } else if (this.visibility < 600) {
      lightsRecommendation = 'Low Beams + Front Fog Lamps';
    }

    const outputEl = document.getElementById('sim-results-output');
    if (!outputEl) return;

    outputEl.innerHTML = `
      <div class="metrics-comparison-row">
        <div class="sim-metric-card highlight">
          <span class="metric-top-label">Recommended Max Speed</span>
          <div class="metric-big-num">${safeSpeedKmh} <span class="unit">km/h</span></div>
          <span class="metric-sub-note">${Math.round(safeSpeedKmh * 0.621)} mph limit</span>
        </div>

        <div class="sim-metric-card">
          <span class="metric-top-label">Total Stopping Distance</span>
          <div class="metric-big-num">${totalStoppingDist} <span class="unit">meters</span></div>
          <span class="metric-sub-note">React: ${reactionDist}m + Brake: ${brakingDist}m</span>
        </div>

        <div class="sim-metric-card ${isDangerZone ? 'danger' : 'safe'}">
          <span class="metric-top-label">Safety Buffer Remaining</span>
          <div class="metric-big-num">${Math.max(0, safetyMargin)} <span class="unit">meters</span></div>
          <span class="metric-sub-note">${isDangerZone ? 'CRITICAL: Almost zero margin' : 'Adequate stopping zone'}</span>
        </div>

        <div class="sim-metric-card">
          <span class="metric-top-label">Optimal Lighting Config</span>
          <div class="metric-text-val">${lightsRecommendation}</div>
          <span class="metric-sub-note">NEVER use High Beams in fog</span>
        </div>
      </div>

      <!-- Distance visualization bar -->
      <div class="distance-bar-wrapper">
        <div class="distance-labels">
          <span>0m (Braking Start)</span>
          <span>Stopping Point: ${totalStoppingDist}m</span>
          <span>Optical Horizon: ${this.visibility}m</span>
        </div>
        <div class="distance-track">
          <div class="bar-reaction" style="width: ${(reactionDist / this.visibility) * 100}%;" title="Reaction distance"></div>
          <div class="bar-braking" style="width: ${(brakingDist / this.visibility) * 100}%;" title="Braking distance"></div>
          <div class="bar-buffer" style="width: ${(Math.max(0, safetyMargin) / this.visibility) * 100}%;" title="Safety buffer"></div>
        </div>
        <div class="bar-legend">
          <span class="leg-item"><span class="leg-dot reaction"></span> Human Reaction (${reactionDist}m)</span>
          <span class="leg-item"><span class="leg-dot braking"></span> Physical Braking (${brakingDist}m)</span>
          <span class="leg-item"><span class="leg-dot buffer"></span> Clear Safety Margin (${Math.max(0, safetyMargin)}m)</span>
        </div>
      </div>
    `;
  }
}
