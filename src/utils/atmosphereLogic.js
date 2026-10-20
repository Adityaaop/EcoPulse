export function calculateFogMetrics(temp, dewPoint, humidity, windSpeed, visibility, weatherCode) {
  const dewPointDepression = Math.max(0, temp - dewPoint);

  let fogScore = 0;

  if (humidity >= 95) fogScore += 50;
  else if (humidity >= 90) fogScore += 40;
  else if (humidity >= 80) fogScore += 25;
  else if (humidity >= 70) fogScore += 10;

  if (dewPointDepression <= 0.5) fogScore += 30;
  else if (dewPointDepression <= 1.5) fogScore += 25;
  else if (dewPointDepression <= 2.5) fogScore += 18;
  else if (dewPointDepression <= 4.0) fogScore += 8;

  if (windSpeed < 5) fogScore += 20;
  else if (windSpeed < 12) fogScore += 15;
  else if (windSpeed < 20) fogScore += 5;

  if (weatherCode === 45 || weatherCode === 48) {
    fogScore = Math.max(fogScore, 88);
  }

  fogScore = Math.min(100, Math.round(fogScore));

  let category = 'None';
  let severity = 'low';
  let description = 'Visibility is clear with minimal moisture condensation.';

  if (visibility < 200 || (fogScore > 80 && visibility < 500)) {
    category = 'Dense Fog';
    severity = 'extreme';
    description = 'Severe visibility hazard. Atmospheric water droplets heavily saturate ground-level air. High risk for navigation & driving.';
  } else if (visibility < 1000 || (fogScore > 65 && visibility < 1500)) {
    category = 'Moderate Fog';
    severity = 'high';
    description = 'Pronounced fog layer. Landmarks and road ahead obscured beyond 500-800 meters.';
  } else if (visibility < 4000 || (fogScore > 50 && visibility < 5000)) {
    category = 'Mist / Light Haze';
    severity = 'moderate';
    description = 'Fine micro-droplets suspend in air, softening horizon and reducing distance clarity.';
  } else {
    category = 'Clear Atmosphere';
    severity = 'low';
    description = 'Clear visibility. Moisture and aerosols are well dispersed.';
  }

  let fogType = 'None';
  let fogMechanism = 'Normal dispersion';

  if (fogScore > 45 || visibility < 3000) {
    if (temp <= 0) {
      fogType = 'Freezing Fog (Rime)';
      fogMechanism = 'Supercooled liquid droplets freeze instantaneously upon contact with cold road surfaces, forming hazardous black ice.';
    } else if (windSpeed < 6 && humidity > 88) {
      fogType = 'Radiation (Ground) Fog';
      fogMechanism = 'Rapid nocturnal radiational cooling of the ground cools adjacent moist air down to its dew point under calm winds.';
    } else if (windSpeed >= 8 && windSpeed <= 25 && humidity > 85) {
      fogType = 'Advection Fog';
      fogMechanism = 'Warm, moist air mass drifts laterally over a colder land or water surface, triggering condensation.';
    } else {
      fogType = 'Shallow Boundary Fog';
      fogMechanism = 'Local microclimate evaporation and ground moisture convergence under high relative humidity.';
    }
  }

  return {
    fogScore,
    category,
    severity,
    description,
    dewPointDepression: dewPointDepression.toFixed(1),
    fogType,
    fogMechanism
  };
}

export function calculateSmogMetrics(pm25, pm10, no2, o3, so2, usAqi) {
  let aqi = usAqi;
  if (!aqi || aqi <= 0) {
    if (pm25 <= 12) aqi = Math.round((50 / 12) * pm25);
    else if (pm25 <= 35.4) aqi = Math.round(50 + ((100 - 50) / (35.4 - 12)) * (pm25 - 12));
    else if (pm25 <= 55.4) aqi = Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
    else if (pm25 <= 150.4) aqi = Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5));
    else if (pm25 <= 250.4) aqi = Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5));
    else aqi = Math.round(301 + ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5));
  }

  let aqiCategory = 'Good';
  let aqiColor = '#10b981';
  let aqiDescription = 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
  let healthImpact = 'Ideal for outdoor recreation and natural ventilation.';
  let severity = 'low';

  if (aqi > 300) {
    aqiCategory = 'Hazardous';
    aqiColor = '#7f1d1d';
    aqiDescription = 'Emergency conditions. The entire population is more likely to be affected with severe respiratory strain.';
    healthImpact = 'Everyone should avoid all outdoor physical activity. Keep indoor spaces sealed.';
    severity = 'extreme';
  } else if (aqi > 200) {
    aqiCategory = 'Very Unhealthy';
    aqiColor = '#8b5cf6';
    aqiDescription = 'Health alert: The risk of health effects is increased for everyone.';
    healthImpact = 'Active children, elderly, and people with respiratory diseases must avoid prolonged outdoor exertion.';
    severity = 'severe';
  } else if (aqi > 150) {
    aqiCategory = 'Unhealthy';
    aqiColor = '#ef4444';
    aqiDescription = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.';
    healthImpact = 'Wear high-filtration respirator (N95/FFP2) outdoors. Restrict outdoor exercise.';
    severity = 'high';
  } else if (aqi > 100) {
    aqiCategory = 'Unhealthy for Sensitive Groups';
    aqiColor = '#f97316';
    aqiDescription = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
    healthImpact = 'Asthma sufferers and elderly should limit heavy outdoor exertion.';
    severity = 'moderate';
  } else if (aqi > 50) {
    aqiCategory = 'Moderate';
    aqiColor = '#eab308';
    aqiDescription = 'Air quality is acceptable; however, some pollutants may cause moderate health concern for a very small number of sensitive individuals.';
    healthImpact = 'Unusually sensitive individuals should consider limiting prolonged outdoor exertion.';
    severity = 'mild';
  }

  let smogType = 'Minimal / Nil';
  let smogMechanism = 'Aerosols and particulates are within safe baseline ranges.';

  if (aqi >= 100 || pm25 > 35 || o3 > 100) {
    if (o3 > 110 && no2 > 40) {
      smogType = 'Photochemical (Ozone) Smog';
      smogMechanism = 'Solar UV rays react with vehicle nitrogen oxides (NOx) and volatile organic compounds (VOCs) to generate ground-level Ozone and peroxyacetyl nitrate (PAN). High eye stinging and throat irritation.';
    } else if (so2 > 40 || (pm25 > 90 && pm10 > 150)) {
      smogType = 'Industrial / Classical Smog';
      smogMechanism = 'Combustion of high-sulfur fossil fuels, industrial emissions, and coal burning generate sulfur dioxide and heavy particulate soot trapped near the surface.';
    } else if (pm25 > 60) {
      smogType = 'Fine Particulate Inversion Smog';
      smogMechanism = 'A warm air layer aloft acts as a thermal lid, trapping vehicular exhaust, biomass burning smoke, and dust particles within the ground breathing zone.';
    } else {
      smogType = 'Urban Aerosol Haze';
      smogMechanism = 'Mixed urban combustion particulates and road dust scattering ambient sunlight.';
    }
  }

  const whoPm25Multiplier = (pm25 / 15).toFixed(1);

  return {
    aqi,
    aqiCategory,
    aqiColor,
    aqiDescription,
    healthImpact,
    severity,
    smogType,
    smogMechanism,
    whoPm25Multiplier
  };
}

export function detectCompoundSmogFog(fogMetrics, smogMetrics) {
  const isSmoggy = smogMetrics.aqi >= 120 || smogMetrics.severity === 'high' || smogMetrics.severity === 'extreme';
  const isFoggy = fogMetrics.fogScore >= 55 || fogMetrics.severity === 'high' || fogMetrics.severity === 'extreme';

  if (isSmoggy && isFoggy) {
    return {
      isCompound: true,
      title: 'Toxic Acidic Smog-Fog Synergy Active',
      level: 'CRITICAL HAZARD',
      badgeClass: 'badge-critical',
      summary: 'Water droplets are acting as liquid aerosol carriers for PM2.5, sulfur dioxide, and nitrogen compounds, forming highly respirable acidic aerosol mist.',
      warning: 'Deep pulmonary penetration risk is at its maximum. Water vapor stabilizes particulates in the alveoli. Immediate respiratory protection is imperative.'
    };
  } else if (isSmoggy) {
    return {
      isCompound: false,
      title: 'Dry Particulate / Chemical Smog Active',
      level: smogMetrics.aqiCategory.toUpperCase(),
      badgeClass: 'badge-smog',
      summary: smogMetrics.smogType + ' dominating local atmospheric conditions.',
      warning: smogMetrics.healthImpact
    };
  } else if (isFoggy) {
    return {
      isCompound: false,
      title: 'Dense Moisture Fog Active',
      level: fogMetrics.category.toUpperCase(),
      badgeClass: 'badge-fog',
      summary: fogMetrics.fogType + ' limiting ground visibility to ' + (fogMetrics.severity === 'extreme' ? '< 200m' : '< 1000m') + '.',
      warning: 'Navigation, aviation, and vehicular travel hazards present. Fog light protocols required.'
    };
  }

  return {
    isCompound: false,
    title: 'Atmospheric Stability Normal',
    level: 'BENIGN / CLEAR',
    badgeClass: 'badge-clear',
    summary: 'Clean ambient conditions with acceptable particulate dispersal.',
    warning: 'No immediate atmospheric advisories for healthy adults.'
  };
}

export function calculateCommuteSafety(visibilityMeters, isFog, isSmog) {
  let safeSpeedKmH = 90;
  let followingDistanceSec = 2;
  let headlightSetting = 'Normal Low Beams';
  let hazardAdvice = 'Standard driving conditions.';
  let riskLevel = 'Low';
  let stoppingDistanceMeters = 40;

  if (visibilityMeters < 100) {
    safeSpeedKmH = 25;
    followingDistanceSec = 8;
    headlightSetting = 'Low Beams + Dedicated Fog Lamps (NO High Beams)';
    hazardAdvice = 'DO NOT use high beams (causes white-wall light scatter). Drive on edge markings. Delay journey if possible.';
    riskLevel = 'Extreme Hazard';
    stoppingDistanceMeters = 18;
  } else if (visibilityMeters < 300) {
    safeSpeedKmH = 40;
    followingDistanceSec = 6;
    headlightSetting = 'Low Beams + Fog Lamps';
    hazardAdvice = 'Heavy fog/smog curtain. Double following distance, deactivate cruise control, listen for traffic at intersections.';
    riskLevel = 'Severe Danger';
    stoppingDistanceMeters = 30;
  } else if (visibilityMeters < 800) {
    safeSpeedKmH = 60;
    followingDistanceSec = 5;
    headlightSetting = 'Low Beams Only';
    hazardAdvice = 'Moderate visual impairment. Avoid overtaking on single-lane roads. Maintain defrosters on warm setting.';
    riskLevel = 'Elevated Caution';
    stoppingDistanceMeters = 48;
  } else if (visibilityMeters < 2000) {
    safeSpeedKmH = 75;
    followingDistanceSec = 3.5;
    headlightSetting = 'Low Beams';
    hazardAdvice = 'Hazy conditions. Watch for sudden braking queues and slow-moving agricultural/freight vehicles.';
    riskLevel = 'Moderate Caution';
    stoppingDistanceMeters = 65;
  }

  return {
    visibilityMeters,
    visibilityKm: (visibilityMeters / 1000).toFixed(2),
    safeSpeedKmH,
    followingDistanceSec,
    headlightSetting,
    hazardAdvice,
    riskLevel,
    stoppingDistanceMeters
  };
}
