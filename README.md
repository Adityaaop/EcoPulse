# EcoPulse - Atmospheric and Air Quality Intelligence System

<div align="center">

![License](https://img.shields.io/badge/License-MIT-emerald.svg)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg)
![Node](https://img.shields.io/badge/Node-v20+-339933.svg)
![Telemetry](https://img.shields.io/badge/Telemetry-Open--Meteo%20%7C%20WAQI-0284c7.svg)

**A real-time atmospheric diagnostics platform engineered to differentiate meteorological fog from chemical smog, compute optical highway stopping distances, and deliver personalized respiratory defense protocols.**

[Live Demo](http://localhost:5173/) • [Features](#key-features) • [Architecture](#system-architecture) • [Setup & Run](#quickstart--local-setup) • [Author](#author)

</div>

---

## Overview

**EcoPulse** was built to solve a dangerous meteorological ambiguity: the difference between pure water-vapor **fog** and toxic chemical/particulate **smog**. 

While both impair optical visibility, their health hazards and physical properties diverge completely. Furthermore, when high moisture condenses alongside elevated fine particulates ($PM_{2.5}, SO_2, NO_2$), they trigger **Compound Smog-Fog Synergy**—forming respirable acidic mist that penetrates deeply into lung alveoli.

EcoPulse bridges atmospheric physics with real-time public health protection by fusing two live telemetry sources:
1. **Open-Meteo API**: High-resolution atmospheric physics (Dew Point, Relative Humidity, Optical Visibility in meters, Barometric Pressure, Wind Vectors, and 24-hr continuous forecast timelines).
2. **WAQI / AQICN API**: Verified physical ground monitoring stations (EPA, CPCB, US Embassy monitors) with station-level calibration and dominant pollutant tracking.

---

## Key Features

- **Dual-Stream Atmospheric Ingestion**: Runs Open-Meteo and WAQI concurrently via parallel asynchronous streams (`Promise.allSettled`).
- **Ground Station Verification**: Automatically displays the nearest verified physical EPA/monitoring station name, real-time sensor AQI, and dominant pollutant.
- **Scientific Fog vs. Smog Classifier**:
  - **Fog Module**: Computes Dew Point Depression ($\Delta T_d = T - T_{\text{dew}}$) and classifies *Radiation Fog*, *Advection Fog*, and *Freezing Fog* (Black ice warning).
  - **Smog Module**: Classifies *Photochemical (Ozone) Smog*, *Industrial (Sulfurous) Smog*, and *Thermal Inversion Soot Smog* with WHO threshold comparisons ($15\,\mu\text{g/m}^3$ daily limit).
  - **Synergy Detector**: Raises alerts when liquid water droplets act as aerosol carriers for acid gases.
- **Commute & Stopping Distance Physics Engine**:
  - Dynamically solves the vehicle kinematic stopping distance equation across variable road frictions (dry, wet mist, black ice):
    $$d_{\text{total}} = v \cdot t_{\text{reaction}} + \frac{v^2}{2 \cdot \mu \cdot g}$$
  - Recommends safe maximum velocities ($km/h$) and low-beam/fog-lamp lighting configurations based on optical sight limits.
- **Dynamic Exposure Diagnostic & Defense Checklist**:
  - Personalized vulnerability assessment for asthma/COPD, cardiac patients, children, pregnant women, and outdoor commuters.
  - Interactive, actionable PPE checklist (N95/FFP2 seal check, saline ocular/nasal flush, HEPA room air purifier ACH rates).
- **24-Hour Forecast Timeline Chart**:
  - Interactive retina Canvas chart with quadratic Bézier curves plotting diurnal shifts in AQI, Fog Probability %, and Optical Visibility.
- **Extreme Scenario Simulator Lab**:
  - Instant one-click simulation of extreme real-world events (*Severe Winter Inversion Smog 385 AQI*, *Blinding Tule Radiation Fog 60m*, *Summer Ozone Smog*, *Sub-Zero Freezing Fog*).
- **Responsive Obsidian Glassmorphism UI**:
  - Built with Vanilla CSS, dynamic ambient canvas particles, and theme shifts that adapt visually to clear, foggy, smoggy, or hazardous conditions.

---

## System Architecture

```
EcoPulse/
├── .env                         # Local environment configuration
├── .gitignore                   # Ignores .env and build artifacts
├── index.html                   # Semantic markup, SVG dial, bento grid
├── package.json                 # Project configuration and metadata
├── public/
│   └── favicon.svg              # Vector brand icon
└── src/
    ├── api/
    │   ├── weatherApi.js        # Open-Meteo client & parallel stream orchestrator
    │   └── waqiApi.js           # WAQI ground-station client (.env token integration)
    ├── components/
    │   ├── canvasAtmosphere.js  # 60fps GPU-efficient ambient canvas particle system
    │   ├── commuteSimulator.js  # Vehicle stopping physics & reaction margin calculator
    │   ├── riskAssessment.js    # Interactive personal vulnerability wizard & checklist
    │   └── timelineChart.js     # Retina canvas 24-hr interactive timeline chart
    ├── utils/
    │   ├── atmosphereLogic.js   # Fog heuristics, EPA AQI interpolation, WHO ratios
    │   └── precautionsData.js   # Evidence-based medical, road, and indoor protocols
    ├── main.js                  # Central state controller & event coordinator
    └── style.css                # Obsidian glassmorphic design system
```

---

## Quickstart & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Adityaaop/EcoPulse.git
cd EcoPulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` in the root folder and add your WAQI API key:
```env
VITE_WAQI_API_KEY=your_waqi_api_key_here
```
*(Get a free token instantly at [aqicn.org/data-platform/token/](https://aqicn.org/data-platform/token/))*

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

### 5. Build for Production
```bash
npm run build
```

---

## Mathematical & Physical Formulations

### 1. Dew Point Depression ($\Delta T_d$)
Condensation occurs when ambient temperature cools down to the dew point temperature:
$$\Delta T_d = T - T_{\text{dew}}$$
- $\Delta T_d \le 1.0^\circ\text{C}$ + Relative Humidity $\ge 90\% \implies$ **Active Fog Condensation**
- $\Delta T_d > 4.0^\circ\text{C} \implies$ **Dry Particulate Dispersion**

### 2. US EPA Air Quality Index Linear Interpolation
$$I = \frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}} \cdot (C - C_{\text{low}}) + I_{\text{low}}$$
Where $C$ is the measured $PM_{2.5}$ concentration and $[C_{\text{low}}, C_{\text{high}}]$ is the concentration breakpoint bracket.

### 3. Highway Optical Stopping Distance
$$d_{\text{total}} = v \cdot t_{\text{reaction}} + \frac{v^2}{2 \cdot \mu \cdot g}$$
The simulation sets maximum velocity $v$ such that $d_{\text{total}} \le \text{Visibility} \times 0.75$, maintaining a 25% clear buffer.

---

## Author

**Aditya**
- GitHub: [@Adityaaop](https://github.com/Adityaaop)
- Email: adityamishra0578@gmail.com

---

## License

This project is licensed under the [MIT License](LICENSE) - free to use, modify, and distribute.
