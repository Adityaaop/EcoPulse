export function getWaqiToken() {
  const envToken = import.meta.env.VITE_WAQI_API_KEY || import.meta.env.VITE_WAQI_TOKEN;
  if (envToken && typeof envToken === 'string' && envToken.trim() !== '' && !envToken.includes('your_waqi_api_key_here')) {
    return envToken.trim();
  }

  const localToken = localStorage.getItem('ecopulse_waqi_token');
  if (localToken && localToken.trim() !== '' && localToken !== 'demo') {
    return localToken.trim();
  }

  return 'demo';
}

export function isEnvTokenConfigured() {
  const envToken = import.meta.env.VITE_WAQI_API_KEY || import.meta.env.VITE_WAQI_TOKEN;
  return !!(envToken && typeof envToken === 'string' && envToken.trim() !== '' && !envToken.includes('your_waqi_api_key_here'));
}

export async function fetchWaqiStation(lat, lon, customToken = null) {
  const token = customToken || getWaqiToken();
  const url = `https://api.waqi.info/feed/geo:${lat.toFixed(4)};${lon.toFixed(4)}/?token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WAQI HTTP ${res.status}`);
    const json = await res.json();

    if (json.status !== 'ok' || !json.data) {
      console.warn('WAQI response status not ok:', json.data);
      return null;
    }

    const d = json.data;
    const iaqi = d.iaqi || {};

    return {
      isAvailable: true,
      stationName: d.city?.name || 'Nearest Ground Sensor',
      stationUrl: d.city?.url || 'https://aqicn.org/',
      groundAqi: typeof d.aqi === 'number' ? d.aqi : null,
      dominantPollutant: (d.dominentpol || 'pm25').toUpperCase(),
      timeRecorded: d.time?.s || 'Real-time',
      iaqi: {
        pm25: iaqi.pm25?.v ?? null,
        pm10: iaqi.pm10?.v ?? null,
        o3: iaqi.o3?.v ?? null,
        no2: iaqi.no2?.v ?? null,
        so2: iaqi.so2?.v ?? null,
        co: iaqi.co?.v ?? null,
        temp: iaqi.t?.v ?? null,
        humidity: iaqi.h?.v ?? null,
        pressure: iaqi.p?.v ?? null,
        wind: iaqi.w?.v ?? null
      },
      attributions: d.attributions || [],
      tokenSource: isEnvTokenConfigured() ? '.env key' : (token === 'demo' ? 'demo' : 'custom')
    };
  } catch (err) {
    console.warn('WAQI ground station fetch failed:', err.message);
    return null;
  }
}
