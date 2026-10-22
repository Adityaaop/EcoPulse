export class RiskAssessmentWizard {
  constructor(containerId, getCurrentAtmosphere) {
    this.container = document.getElementById(containerId);
    this.getCurrentAtmosphere = getCurrentAtmosphere;

    this.profile = {
      health: 'healthy',
      commute: 'twowheeler',
      duration: 'moderate'
    };

    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="risk-wizard-card">
        <div class="wizard-header">
          <div class="wizard-title-group">
            <span class="wizard-badge">Exposure Diagnostic</span>
            <h3>Personalized Exposure & Protection Generator</h3>
          </div>
          <p class="wizard-sub">Input your personal profile to calculate dynamic vulnerability and generate an actionable defense checklist based on current local fog and smog levels.</p>
        </div>

        <div class="wizard-form-grid">
          <div class="form-group">
            <label class="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Health Status / Vulnerability
            </label>
            <select id="risk-health-select" class="form-select">
              <option value="healthy" ${this.profile.health === 'healthy' ? 'selected' : ''}>Healthy Adult (No underlying conditions)</option>
              <option value="asthma" ${this.profile.health === 'asthma' ? 'selected' : ''}>Asthma, COPD, or Respiratory Allergy</option>
              <option value="cardiac" ${this.profile.health === 'cardiac' ? 'selected' : ''}>Cardiovascular / Hypertension</option>
              <option value="elderly" ${this.profile.health === 'elderly' ? 'selected' : ''}>Senior Citizen (Age 65+)</option>
              <option value="child" ${this.profile.health === 'child' ? 'selected' : ''}>Child / School Student (&lt; 14 yrs)</option>
              <option value="pregnant" ${this.profile.health === 'pregnant' ? 'selected' : ''}>Pregnant Expectant Mother</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
              Commute / Transit Mode
            </label>
            <select id="risk-commute-select" class="form-select">
              <option value="twowheeler" ${this.profile.commute === 'twowheeler' ? 'selected' : ''}>Motorcycle / Scooter / Bicycle (Direct Inhalation)</option>
              <option value="walking" ${this.profile.commute === 'walking' ? 'selected' : ''}>Walking / Running / Outdoor Transit</option>
              <option value="car" ${this.profile.commute === 'car' ? 'selected' : ''}>Car / Cab (AC on Recirculation)</option>
              <option value="metro" ${this.profile.commute === 'metro' ? 'selected' : ''}>Subway / Metro / AC Bus</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Outdoor Exposure Duration
            </label>
            <select id="risk-duration-select" class="form-select">
              <option value="quick" ${this.profile.duration === 'quick' ? 'selected' : ''}>Brief Excursion (&lt; 30 minutes)</option>
              <option value="moderate" ${this.profile.duration === 'moderate' ? 'selected' : ''}>Moderate (1 to 2 hours)</option>
              <option value="prolonged" ${this.profile.duration === 'prolonged' ? 'selected' : ''}>Extended Exposure (3 to 5 hours)</option>
              <option value="fullDay" ${this.profile.duration === 'fullDay' ? 'selected' : ''}>Full Day / Outdoor Field Worker (6+ hours)</option>
            </select>
          </div>
        </div>

        <div id="risk-results-panel" class="risk-results-panel"></div>
      </div>
    `;

    this.attachEvents();
    this.evaluate();
  }

  attachEvents() {
    const healthSelect = document.getElementById('risk-health-select');
    const commuteSelect = document.getElementById('risk-commute-select');
    const durationSelect = document.getElementById('risk-duration-select');

    if (healthSelect) {
      healthSelect.addEventListener('change', (e) => {
        this.profile.health = e.target.value;
        this.evaluate();
      });
    }

    if (commuteSelect) {
      commuteSelect.addEventListener('change', (e) => {
        this.profile.commute = e.target.value;
        this.evaluate();
      });
    }

    if (durationSelect) {
      durationSelect.addEventListener('change', (e) => {
        this.profile.duration = e.target.value;
        this.evaluate();
      });
    }
  }

  evaluate() {
    const atmo = this.getCurrentAtmosphere();
    if (!atmo) return;

    const aqi = atmo.airQuality.usAqi || 50;
    const visibility = atmo.weather.visibility || 10000;
    const isFoggy = visibility < 1000;

    let healthFactor = 1.0;
    if (this.profile.health === 'asthma') healthFactor = 2.4;
    else if (this.profile.health === 'cardiac') healthFactor = 2.2;
    else if (this.profile.health === 'pregnant') healthFactor = 1.9;
    else if (this.profile.health === 'child') healthFactor = 1.8;
    else if (this.profile.health === 'elderly') healthFactor = 1.7;

    let commuteFactor = 1.0;
    if (this.profile.commute === 'twowheeler') commuteFactor = 1.6;
    else if (this.profile.commute === 'walking') commuteFactor = 1.4;
    else if (this.profile.commute === 'car') commuteFactor = 0.8;
    else if (this.profile.commute === 'metro') commuteFactor = 0.6;

    let durationFactor = 1.0;
    if (this.profile.duration === 'quick') durationFactor = 0.7;
    else if (this.profile.duration === 'moderate') durationFactor = 1.1;
    else if (this.profile.duration === 'prolonged') durationFactor = 1.6;
    else if (this.profile.duration === 'fullDay') durationFactor = 2.2;

    const rawRisk = ((aqi / 350) * 60 + (isFoggy ? 25 : 0)) * (healthFactor * 0.4 + commuteFactor * 0.3 + durationFactor * 0.3);
    const riskScore = Math.min(100, Math.round(rawRisk));

    let riskTier = 'Low Risk';
    let riskColor = '#10b981';
    let verdict = 'Safe for standard activities with minimal precautions.';

    if (riskScore > 75) {
      riskTier = 'Extreme Health Hazard';
      riskColor = '#ef4444';
      verdict = 'AVOID OUTDOOR TRANSIT. Severe acute exposure threat to lungs and cardiovascular system.';
    } else if (riskScore > 50) {
      riskTier = 'High Personal Vulnerability';
      riskColor = '#f97316';
      verdict = 'Mandatory respiratory defense (N95+), eye protection, and minimal outdoor duration.';
    } else if (riskScore > 25) {
      riskTier = 'Moderate Exposure Risk';
      riskColor = '#eab308';
      verdict = 'Sensitive individuals should limit exertion; wear a mask during peak traffic hours.';
    }

    const checklist = [];

    if (aqi > 100 || isFoggy) {
      checklist.push({
        title: 'Wear NIOSH N95 / FFP2 Respirator',
        desc: 'Ensure tight nasal clip fit with no gap around the jawline. Surgical masks are ineffective.',
        badge: 'Critical PPE'
      });
    }

    if (this.profile.health === 'asthma') {
      checklist.push({
        title: 'Carry Rescue Bronchodilator (Inhaler)',
        desc: 'Keep rapid-acting albuterol/salbutamol inhaler in pocket. Pre-dose if advised by your physician.',
        badge: 'Medical Lifeline'
      });
    }

    if (this.profile.health === 'cardiac') {
      checklist.push({
        title: 'Eliminate Strenuous Cardiac Exertion',
        desc: 'Avoid hurried walking, climbing stairs, or carrying heavy bags in contaminated air.',
        badge: 'Heart Safety'
      });
    }

    if (this.profile.commute === 'twowheeler' || this.profile.commute === 'walking') {
      checklist.push({
        title: 'High-Visibility Neon Jacket + Wraparound Eye Protection',
        desc: 'Protect conjunctival eye membranes from sulfur/nitric acid mist, and ensure drivers spot you in fog.',
        badge: 'Transit Gear'
      });
    }

    if (this.profile.commute === 'car') {
      checklist.push({
        title: 'Cabin Ventilation on Air Recirculation Mode',
        desc: 'Prevent highway particulate exhaust from entering the vehicle cabin. Run AC defogger on low heat.',
        badge: 'Vehicle Setting'
      });
    }

    checklist.push({
      title: 'Post-Exposure Saline Nasal & Ocular Flush',
      desc: 'Rinse nasal passages with sterile saline spray and use lubricating eye drops upon returning indoors.',
      badge: 'Detox Protocol'
    });

    checklist.push({
      title: 'Seal Bedroom & Run HEPA Purifier (H13)',
      desc: 'Create an indoor clean air sanctuary with at least 4 air changes per hour (ACH).',
      badge: 'Home Sanctuary'
    });

    const resultsEl = document.getElementById('risk-results-panel');
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="risk-verdict-box" style="border-left: 5px solid ${riskColor};">
          <div class="verdict-score-col">
            <span class="score-number" style="color: ${riskColor};">${riskScore}</span>
            <span class="score-label">Risk Index / 100</span>
          </div>
          <div class="verdict-info-col">
            <div class="verdict-tier" style="color: ${riskColor};">${riskTier}</div>
            <p class="verdict-desc">${verdict}</p>
          </div>
        </div>

        <div class="checklist-container">
          <h4 class="checklist-heading">Your Actionable Defense Checklist:</h4>
          <div class="checklist-items">
            ${checklist.map((item, idx) => `
              <label class="checklist-item" id="check-item-${idx}">
                <input type="checkbox" class="check-box" />
                <div class="check-content">
                  <div class="check-title-row">
                    <span class="check-title">${item.title}</span>
                    <span class="check-badge">${item.badge}</span>
                  </div>
                  <span class="check-desc">${item.desc}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
      `;

      resultsEl.querySelectorAll('.check-box').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const itemEl = e.target.closest('.checklist-item');
          if (e.target.checked) {
            itemEl.classList.add('checked');
          } else {
            itemEl.classList.remove('checked');
          }
        });
      });
    }
  }
}
