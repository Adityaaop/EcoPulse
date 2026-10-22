import './style.css';
import { searchLocations, fetchAtmosphereData, getFallbackAtmosphereData } from './api/weatherApi.js';
import { getWaqiToken, isEnvTokenConfigured } from './api/waqiApi.js';
import { calculateFogMetrics, calculateSmogMetrics, detectCompoundSmogFog, calculateCommuteSafety } from './utils/atmosphereLogic.js';
import { PRECAUTIONS_DATA, HOTSPOT_PRESETS } from './utils/precautionsData.js';
import { AtmosphericCanvas } from './components/canvasAtmosphere.js';
import { TimelineChart } from './components/timelineChart.js';
import { RiskAssessmentWizard } from './components/riskAssessment.js';
import { CommuteSimulator } from './components/commuteSimulator.js';

class EcoPulseApp {
  constructor() {
    this.currentData = null;
    this.canvasAtmosphere = null;
    this.timelineChart = null;
    this.riskWizard = null;
    this.commuteSim = null;
    this.activePrecautionTab = 'respiratory';
    this.searchDebounceTimer = null;

    this.init();
  }

  async init() {
    this.canvasAtmosphere = new AtmosphericCanvas('atmosphere-canvas');
    this.timelineChart = new TimelineChart('timeline-chart', 'timeline-chart-container');
    this.riskWizard = new RiskAssessmentWizard('risk-assessment-mount', () => this.currentData);
    this.commuteSim = new CommuteSimulator('commute-simulator-mount', 800);

    this.renderHotspots();
    this.renderPrecautionsHub();
    this.bindEvents();

    await this.loadLocation(28.6139, 77.2090, 'New Delhi, India');
  }

  bindEvents() {
    const searchInput = document.getElementById('location-search-input');
    const dropdown = document.getElementById('search-dropdown');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchDebounceTimer);
        const query = e.target.value;
        if (!query || query.length < 2) {
          dropdown.classList.add('hidden');
          dropdown.innerHTML = '';
          return;
        }

        this.searchDebounceTimer = setTimeout(async () => {
          const results = await searchLocations(query);
          this.renderSearchResults(results);
        }, 300);
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-engine-wrap')) {
          dropdown.classList.add('hidden');
        }
      });
    }

    const btnLocate = document.getElementById('btn-locate-me');
    if (btnLocate) {
      btnLocate.addEventListener('click', () => this.handleGeolocation());
    }

    document.querySelectorAll('.chart-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const metric = btn.dataset.metric;
        if (this.timelineChart) {
          this.timelineChart.setMetric(metric);
        }
      });
    });

    document.querySelectorAll('.tool-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tool = btn.dataset.tool;

        document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
        const activePanel = document.getElementById(`tool-${tool}-container`);
        if (activePanel) activePanel.classList.add('active');
      });
    });

    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scenario = btn.dataset.scenario;
        this.applyScenario(scenario);
      });
    });

    this.updateWaqiBadge();
  }

  updateWaqiBadge() {
    const dot = document.getElementById('waqi-status-dot');
    const label = document.getElementById('waqi-key-label');
    const badge = document.getElementById('waqi-header-badge');
    const isEnvSet = isEnvTokenConfigured();

    if (dot) {
      dot.className = isEnvSet ? 'status-indicator custom-active' : 'status-indicator';
    }

    if (label) {
      label.textContent = isEnvSet ? 'Ground Stream (.env: Active)' : 'Ground Stream (Public Feed)';
    }

    if (badge) {
      badge.title = isEnvSet
        ? 'Physical Ground Station stream authenticated via .env (VITE_WAQI_API_KEY)'
        : 'Running on public demonstration feed. Set VITE_WAQI_API_KEY in .env to use custom key.';
    }
  }

  renderHotspots() {
    const container = document.getElementById('hotspots-container');
    if (!container) return;

    container.innerHTML = HOTSPOT_PRESETS.map((spot, idx) => `
      <button class="hotspot-pill ${idx === 0 ? 'active' : ''}" data-lat="${spot.lat}" data-lon="${spot.lon}" data-name="${spot.name}, ${spot.country}">
        ${spot.name}
      </button>
    `).join('');

    container.querySelectorAll('.hotspot-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.hotspot-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const lat = parseFloat(pill.dataset.lat);
        const lon = parseFloat(pill.dataset.lon);
        const name = pill.dataset.name;
        this.loadLocation(lat, lon, name);
      });
    });
  }

  renderSearchResults(results) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    if (!results || results.length === 0) {
      dropdown.innerHTML = `<div style="padding: 0.6rem; color: #94a3b8; font-size: 0.82rem;">No matching locations found.</div>`;
      dropdown.classList.remove('hidden');
      return;
    }

    dropdown.innerHTML = results.map(r => `
      <div class="search-item" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.name}${r.country ? ', ' + r.country : ''}">
        <div>
          <div class="search-item-name">${r.name}</div>
          <div class="search-item-region">${[r.admin1, r.country].filter(Boolean).join(', ')}</div>
        </div>
        <span style="font-size: 0.72rem; color: #38bdf8; font-family: monospace;">${r.lat.toFixed(2)}°, ${r.lon.toFixed(2)}°</span>
      </div>
    `).join('');

    dropdown.classList.remove('hidden');

    dropdown.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lon = parseFloat(item.dataset.lon);
        const name = item.dataset.name;
        dropdown.classList.add('hidden');
        document.getElementById('location-search-input').value = name;
        this.loadLocation(lat, lon, name);
      });
    });
  }

  async handleGeolocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    const btn = document.getElementById('btn-locate-me');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span>Locating...</span>`;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        btn.innerHTML = originalText;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        await this.loadLocation(lat, lon, 'My Current Location');
      },
      (err) => {
        btn.innerHTML = originalText;
        console.warn('Geolocation failed:', err.message);
        this.loadLocation(28.6139, 77.2090, 'New Delhi, India');
      },
      { timeout: 8000 }
    );
  }

  async loadLocation(lat, lon, placeName) {
    const heroName = document.getElementById('hero-location-name');
    if (heroName) heroName.textContent = `Syncing ${placeName}...`;
    const gsName = document.getElementById('ground-station-name');
    if (gsName) gsName.textContent = 'Syncing physical ground station...';

    try {
      const waqiToken = getWaqiToken();
      const atmoData = await fetchAtmosphereData(lat, lon, placeName, waqiToken);
      this.currentData = atmoData;
      this.updateDashboard(atmoData);
    } catch (err) {
      console.warn('Network issue, using regional baseline fallback:', err);
      const fallback = getFallbackAtmosphereData(lat, lon, placeName);
      this.currentData = fallback;
      this.updateDashboard(fallback);
    }
  }

  updateDashboard(data) {
    const { location, weather, airQuality, timeline, groundStation } = data;

    const fog = calculateFogMetrics(
      weather.temp,
      weather.dewPoint,
      weather.humidity,
      weather.windSpeed,
      weather.visibility,
      weather.weatherCode
    );

    const smog = calculateSmogMetrics(
      airQuality.pm25,
      airQuality.pm10,
      airQuality.no2,
      airQuality.o3,
      airQuality.so2,
      airQuality.usAqi
    );

    const compound = detectCompoundSmogFog(fog, smog);
    const commute = calculateCommuteSafety(
      weather.visibility,
      fog.severity !== 'low',
      smog.severity !== 'low'
    );

    document.body.className = '';
    let canvasMode = 'clear';

    if (compound.isCompound) {
      document.body.classList.add('theme-compound');
      canvasMode = 'compound';
    } else if (smog.aqi > 200) {
      document.body.classList.add('theme-hazardous');
      canvasMode = 'smog';
    } else if (smog.aqi > 100) {
      document.body.classList.add('theme-smog');
      canvasMode = 'smog';
    } else if (fog.fogScore > 50 || weather.visibility < 1500) {
      document.body.classList.add('theme-fog');
      canvasMode = 'fog';
    } else {
      canvasMode = 'clear';
    }

    if (this.canvasAtmosphere) {
      this.canvasAtmosphere.setMode(canvasMode);
    }

    const timeEl = document.getElementById('telemetry-timestamp');
    if (timeEl) timeEl.textContent = `Updated ${location.updatedAt || 'Just now'}`;

    this.updateCompoundBanner(compound);

    document.getElementById('hero-location-name').textContent = location.name;

    const gsName = document.getElementById('ground-station-name');
    const gsAqi = document.getElementById('ground-station-aqi');
    const gsPol = document.getElementById('ground-station-pollutant');
    const gsAttrib = document.getElementById('ground-station-attrib');

    if (groundStation && groundStation.isAvailable) {
      if (gsName) gsName.textContent = groundStation.stationName;
      if (gsAqi) {
        gsAqi.textContent = groundStation.groundAqi !== null ? `${groundStation.groundAqi} AQI` : `${smog.aqi} AQI`;
        const activeAqi = groundStation.groundAqi || smog.aqi;
        gsAqi.style.color = activeAqi > 200 ? '#ef4444' : (activeAqi > 100 ? '#f59e0b' : '#10b981');
      }
      if (gsPol) gsPol.textContent = groundStation.dominantPollutant || 'PM2.5';
      if (gsAttrib) {
        const sourceLabel = isEnvTokenConfigured() ? '.env Key Active' : 'Public Feed';
        gsAttrib.innerHTML = `Live sensor verified &bull; <a href="${groundStation.stationUrl}" target="_blank" rel="noopener" style="color: #38bdf8; text-decoration: underline;">Station Telemetry</a> (${sourceLabel})`;
      }
    } else {
      if (gsName) gsName.textContent = `${location.name} Regional EPA Grid`;
      if (gsAqi) gsAqi.textContent = `${smog.aqi} AQI`;
      if (gsPol) gsPol.textContent = 'PM2.5';
    }

    document.getElementById('hero-temp-val').textContent = weather.temp;
    document.getElementById('hero-feels-like').textContent = `${weather.feelsLike}°C`;
    document.getElementById('hero-dew-point').textContent = `${weather.dewPoint}°C`;
    document.getElementById('hero-dew-depression').textContent = `${fog.dewPointDepression}°C`;
    document.getElementById('hero-humidity').textContent = `${weather.humidity}%`;
    document.getElementById('hero-wind').textContent = `${weather.windSpeed} km/h`;
    document.getElementById('hero-pressure').textContent = `${weather.pressure} hPa`;
    document.getElementById('hero-who-multiplier').textContent = `${smog.whoPm25Multiplier}x Limit`;

    const weatherChip = document.getElementById('hero-weather-condition');
    if (weatherChip) {
      weatherChip.textContent = fog.category !== 'None' && fog.category !== 'Clear Atmosphere' ? fog.category : (smog.aqiCategory);
    }

    document.getElementById('hero-fog-score').textContent = `${fog.fogScore}%`;
    document.getElementById('hero-fog-bar').style.width = `${fog.fogScore}%`;
    document.getElementById('hero-fog-type-desc').textContent = `${fog.fogType}: ${fog.fogMechanism}`;

    document.getElementById('hero-smog-aqi').textContent = `${smog.aqi} AQI`;
    const smogBarPct = Math.min(100, Math.round((smog.aqi / 350) * 100));
    document.getElementById('hero-smog-bar').style.width = `${smogBarPct}%`;
    document.getElementById('hero-smog-type-desc').textContent = `${smog.smogType}: ${smog.smogMechanism}`;

    const aqiNumEl = document.getElementById('aqi-dial-number');
    const aqiBadge = document.getElementById('aqi-tier-badge');
    const aqiPath = document.getElementById('aqi-gauge-path');
    const aqiImpact = document.getElementById('aqi-dial-impact');

    if (aqiNumEl) {
      aqiNumEl.textContent = smog.aqi;
      aqiNumEl.style.color = smog.aqiColor;
    }

    if (aqiBadge) {
      aqiBadge.textContent = smog.aqiCategory;
      aqiBadge.style.color = smog.aqiColor;
      aqiBadge.style.border = `1px solid ${smog.aqiColor}`;
      aqiBadge.style.background = `${smog.aqiColor}22`;
    }

    if (aqiPath) {
      const maxAqi = 500;
      const progress = Math.min(1, Math.max(0, smog.aqi / maxAqi));
      const offset = 251.2 - (progress * 251.2);
      aqiPath.style.strokeDashoffset = offset;
      aqiPath.style.stroke = smog.aqiColor;
    }

    if (aqiImpact) {
      aqiImpact.textContent = smog.healthImpact;
    }

    const visNum = document.getElementById('vis-distance-num');
    const visUnit = document.getElementById('vis-distance-unit');
    const visMeters = document.getElementById('vis-meters-equivalent');
    const visBadge = document.getElementById('vis-hazard-badge');
    const visFill = document.getElementById('vis-indicator-fill');
    const visAdvice = document.getElementById('vis-advice-text');

    if (visNum && visUnit) {
      if (weather.visibility >= 1000) {
        visNum.textContent = (weather.visibility / 1000).toFixed(1);
        visUnit.textContent = 'km';
      } else {
        visNum.textContent = weather.visibility;
        visUnit.textContent = 'm';
      }
    }

    if (visMeters) visMeters.textContent = `Actual Sight: ${weather.visibility} meters`;
    if (visBadge) {
      visBadge.textContent = commute.riskLevel;
      visBadge.style.color = commute.riskLevel.includes('Hazard') || commute.riskLevel.includes('Danger') ? '#ef4444' : '#10b981';
    }

    if (visFill) {
      const visPct = Math.min(100, Math.max(5, (weather.visibility / 10000) * 100));
      visFill.style.width = `${visPct}%`;
    }

    if (visAdvice) {
      visAdvice.textContent = commute.hazardAdvice;
    }

    document.getElementById('pol-pm25').textContent = `${airQuality.pm25} µg/m³`;
    document.getElementById('pol-pm10').textContent = `${airQuality.pm10} µg/m³`;
    document.getElementById('pol-o3').textContent = `${airQuality.o3} µg/m³`;
    document.getElementById('pol-no2').textContent = `${airQuality.no2} µg/m³`;
    document.getElementById('pol-so2').textContent = `${airQuality.so2} µg/m³`;
    document.getElementById('pol-co').textContent = `${airQuality.co} µg/m³`;

    document.getElementById('who-pm25').textContent = `${smog.whoPm25Multiplier}x WHO Max (15 µg)`;

    if (this.timelineChart) {
      this.timelineChart.setData(timeline);
    }

    if (this.riskWizard) {
      this.riskWizard.evaluate();
    }

    if (this.commuteSim) {
      this.commuteSim.setVisibility(Math.min(3000, weather.visibility));
    }
  }

  updateCompoundBanner(compound) {
    const banner = document.getElementById('compound-alert-banner');
    if (!banner) return;

    banner.className = `compound-alert-banner ${compound.badgeClass}`;
    banner.innerHTML = `
      <div class="alert-icon-shield">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M12 8v4"/><path d="M12 16h.01"/>
        </svg>
      </div>
      <div class="alert-text-body">
        <div class="alert-top-row">
          <span class="alert-severity-tag">${compound.level}</span>
          <h2 class="alert-headline">${compound.title}</h2>
        </div>
        <div class="alert-summary">${compound.summary}</div>
        <div class="alert-warning">${compound.warning}</div>
      </div>
    `;
  }

  renderPrecautionsHub() {
    const tabsContainer = document.getElementById('precaution-category-tabs');
    const articlesContainer = document.getElementById('precaution-articles-container');
    if (!tabsContainer || !articlesContainer) return;

    const categories = Object.keys(PRECAUTIONS_DATA);

    tabsContainer.innerHTML = categories.map((catKey, idx) => {
      const cat = PRECAUTIONS_DATA[catKey];
      return `
        <button class="prec-tab-btn ${idx === 0 ? 'active' : ''}" data-cat="${catKey}">
          ${cat.title}
        </button>
      `;
    }).join('');

    tabsContainer.querySelectorAll('.prec-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.prec-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activePrecautionTab = btn.dataset.cat;
        this.renderPrecautionArticles();
      });
    });

    this.renderPrecautionArticles();
  }

  renderPrecautionArticles() {
    const articlesContainer = document.getElementById('precaution-articles-container');
    if (!articlesContainer) return;

    const cat = PRECAUTIONS_DATA[this.activePrecautionTab];
    if (!cat) return;

    articlesContainer.innerHTML = `
      <div class="prec-section-header">
        <h3 class="prec-section-title">${cat.title}</h3>
        <p class="prec-section-tagline">${cat.tagline}</p>
      </div>

      <div class="prec-articles-grid">
        ${cat.items.map(item => `
          <article class="prec-article-card">
            <div class="article-top">
              <h4 class="article-title">${item.title}</h4>
              <span class="article-severity-pill ${item.severity}">${item.severity}</span>
            </div>
            <p class="article-text">${item.text}</p>
            <ul class="article-tips-list">
              ${item.keyTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </article>
        `).join('')}
      </div>
    `;
  }

  applyScenario(scenarioKey) {
    let mock = null;

    if (scenarioKey === 'delhi_smog') {
      mock = {
        location: { name: 'Simulated: Severe Winter Smog (Delhi Basin)', lat: 28.6, lon: 77.2, updatedAt: 'Simulation Active' },
        weather: { temp: 14, feelsLike: 13, humidity: 89, dewPoint: 12.3, windSpeed: 3.2, windDir: 110, pressure: 1018, weatherCode: 45, visibility: 250 },
        airQuality: { pm25: 290, pm10: 420, no2: 85, o3: 35, so2: 45, co: 1200, usAqi: 385 },
        timeline: this.generateMockTimeline(14, 89, 250, 290, 385)
      };
    } else if (scenarioKey === 'tule_fog') {
      mock = {
        location: { name: 'Simulated: Blinding Tule Radiation Fog (San Joaquin)', lat: 35.3, lon: -119.0, updatedAt: 'Simulation Active' },
        weather: { temp: 8, feelsLike: 7, humidity: 99, dewPoint: 7.9, windSpeed: 2.0, windDir: 45, pressure: 1022, weatherCode: 45, visibility: 60 },
        airQuality: { pm25: 18, pm10: 32, no2: 15, o3: 20, so2: 4, co: 320, usAqi: 45 },
        timeline: this.generateMockTimeline(8, 99, 60, 18, 45)
      };
    } else if (scenarioKey === 'la_ozone') {
      mock = {
        location: { name: 'Simulated: Summer Photochemical Smog (LA Basin)', lat: 34.0, lon: -118.2, updatedAt: 'Simulation Active' },
        weather: { temp: 32, feelsLike: 34, humidity: 45, dewPoint: 18.0, windSpeed: 6.5, windDir: 220, pressure: 1011, weatherCode: 1, visibility: 4500 },
        airQuality: { pm25: 58, pm10: 92, no2: 65, o3: 165, so2: 8, co: 680, usAqi: 185 },
        timeline: this.generateMockTimeline(32, 45, 4500, 58, 185)
      };
    } else if (scenarioKey === 'freezing_fog') {
      mock = {
        location: { name: 'Simulated: Sub-Zero Freezing Fog & Black Ice', lat: 45.5, lon: -73.5, updatedAt: 'Simulation Active' },
        weather: { temp: -3, feelsLike: -7, humidity: 98, dewPoint: -3.3, windSpeed: 5.5, windDir: 340, pressure: 1024, weatherCode: 48, visibility: 180 },
        airQuality: { pm25: 22, pm10: 35, no2: 18, o3: 22, so2: 6, co: 410, usAqi: 68 },
        timeline: this.generateMockTimeline(-3, 98, 180, 22, 68)
      };
    } else if (scenarioKey === 'alpine_clean') {
      mock = {
        location: { name: 'Simulated: Pristine Alpine Atmosphere (Zermatt)', lat: 45.9, lon: 7.7, updatedAt: 'Simulation Active' },
        weather: { temp: 12, feelsLike: 12, humidity: 42, dewPoint: 0.5, windSpeed: 8.0, windDir: 180, pressure: 1015, weatherCode: 0, visibility: 35000 },
        airQuality: { pm25: 3, pm10: 6, no2: 4, o3: 42, so2: 1, co: 120, usAqi: 14 },
        timeline: this.generateMockTimeline(12, 42, 35000, 3, 14)
      };
    }

    if (mock) {
      this.currentData = mock;
      this.updateDashboard(mock);
    }
  }

  generateMockTimeline(baseTemp, baseHum, baseVis, basePm, baseAqi) {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const cycle = Math.sin((i / 24) * Math.PI * 2);
      list.push({
        time: new Date(now.getTime() + i * 3600000).toISOString(),
        temp: Math.round(baseTemp + cycle * 3),
        humidity: Math.round(Math.min(99, Math.max(30, baseHum - cycle * 12))),
        visibility: Math.round(Math.max(40, baseVis + cycle * 1200)),
        pm25: Math.round(Math.max(5, basePm - cycle * 30)),
        aqi: Math.round(Math.max(10, baseAqi - cycle * 40)),
        fogProb: Math.round(Math.min(100, Math.max(5, (baseHum - cycle * 12) * 0.95)))
      });
    }
    return list;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new EcoPulseApp();
});
