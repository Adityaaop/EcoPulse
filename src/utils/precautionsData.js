export const PRECAUTIONS_DATA = {
  respiratory: {
    title: 'Personal & Respiratory Protection',
    icon: 'shield',
    tagline: 'Defend your mucosal barriers, lungs, and bloodstream against fine particulates and acid mist.',
    items: [
      {
        id: 'mask_selection',
        title: 'Proper Mask Selection (N95 / FFP2 or N99)',
        severity: 'high',
        text: 'Standard surgical or cloth masks lack peripheral seals and cannot block PM2.5 particles (<2.5 µm). Wear certified NIOSH N95, FFP2, or KF94 respirators with an airtight nose-bridge wire and tight head or ear loops.',
        keyTips: [
          'Perform a seal check: Inhale sharply; the respirator should cup inward slightly without air leaking past edges.',
          'Replace disposable respirators after 8-12 cumulative hours of use, or sooner if breathing resistance rises.',
          'For hazardous smog (>300 AQI), consider N99 / FFP3 respirators or elastomeric half-face masks.'
        ]
      },
      {
        id: 'eye_care',
        title: 'Ocular Protection & Acid Mist Rinse',
        severity: 'moderate',
        text: 'Photochemical smog and sulfuric acid aerosols react with tear films, causing severe burning, conjunctival redness, and dry eye syndrome.',
        keyTips: [
          'Wear wraparound glasses or protective spectacles outdoors to deflect particulate wind.',
          'Rinse eyes twice daily with preservative-free artificial tears or sterile lubricating saline drops.',
          'Avoid rubbing irritated eyes, which drives microscopic soot particles into corneal tissue.'
        ]
      },
      {
        id: 'post_exposure',
        title: 'Decontamination & Post-Exposure Routine',
        severity: 'moderate',
        text: 'Smog and soot settle onto skin, hair, and nasal passages during outdoor transit.',
        keyTips: [
          'Wash face, hands, and exposed hair immediately upon arriving indoors.',
          'Use an isotonic saline nasal spray or neti pot to flush inhaled particulates from nasal cilia.',
          'Gargle with lukewarm lightly-salted water to soothe pharyngeal irritation.'
        ]
      },
      {
        id: 'hydration_antioxidants',
        title: 'Systemic Hydration & Dietary Defense',
        severity: 'low',
        text: 'Fine particulates induce cellular oxidative stress and systemic inflammatory cascades.',
        keyTips: [
          'Drink at least 2.5 to 3 liters of warm water daily to keep respiratory mucosal membranes moist.',
          'Consume foods rich in Vitamin C (citrus, amla), Vitamin E (nuts, seeds), and Omega-3 fatty acids to counteract free radical damage.',
          'Ginger, tulsi, and turmeric herbal infusions help relieve broncho-constriction.'
        ]
      }
    ]
  },

  driving: {
    title: 'Driving & Commuter Safety in Fog / Smog',
    icon: 'car',
    tagline: 'Critical protocols to prevent multi-vehicle pileups and zero-visibility collisions.',
    items: [
      {
        id: 'headlight_rules',
        title: 'Low Beams & Fog Lights (NEVER High Beams)',
        severity: 'extreme',
        text: 'High beams fire directly into suspended fog water droplets and aerosol smog, causing severe Rayleigh/Tyndall backscatter glare that forms an opaque white wall blinding you.',
        keyTips: [
          'Keep headlights strictly on LOW BEAM so light shoots downwards onto the tarmac.',
          'Switch on dedicated front fog lamps (wide beam pattern below fog boundary) and rear red fog lamps.',
          'Turn off rear fog lamps once visibility clears beyond 100 meters to avoid blinding vehicles behind.'
        ]
      },
      {
        id: 'hazard_light_mistake',
        title: 'The Hazard Lights Myth (Do Not Drive With Hazards On)',
        severity: 'high',
        text: 'Driving continuously with 4-way hazard flashers disables turn signals and tricks approaching drivers into believing your vehicle is disabled or stopped.',
        keyTips: [
          'Use hazard flashers ONLY if your car has broken down or you have stopped safely off the highway shoulder.',
          'If you must pull over due to zero visibility, pull entirely onto the grass verge or designated rest area, turn off headlights, and engage hazard lights.'
        ]
      },
      {
        id: 'speed_following_distance',
        title: 'Speed Adjustment & 6-Second Following Rule',
        severity: 'high',
        text: 'Human reaction time is 1.5 seconds. In dense fog or oily smog, wet roads double braking distances.',
        keyTips: [
          'Drop highway speeds to 30-40 km/h or less when visibility drops below 200 meters.',
          'Increase following distance from 2 seconds to at least 6 to 8 seconds.',
          'Never pass or overtake on two-lane undivided roads in fog.'
        ]
      },
      {
        id: 'cabin_air_windshield',
        title: 'Windshield Defogging & Cabin Air Filter',
        severity: 'moderate',
        text: 'Interior glass fogs up rapidly when warm humid breath condenses on cold windshield glass.',
        keyTips: [
          'Turn on AC compressor with warm heat on fresh-air mode for rapid defogging.',
          'In congested bumper-to-bumper smog, switch cabin ventilation to RECIRCULATION to block diesel exhaust from entering the passenger compartment.',
          'Ensure vehicle cabin pollen/HEPA filter is replaced before winter smog season.'
        ]
      }
    ]
  },

  indoor: {
    title: 'Indoor Air Defense & Home Sanctuary',
    icon: 'home',
    tagline: 'Transform your home into a safe haven with clean air delivery and barrier control.',
    items: [
      {
        id: 'hepa_purifiers',
        title: 'True HEPA Purifier + Activated Carbon Protocol',
        severity: 'high',
        text: 'A certified True HEPA filter (H13/H14) captures 99.97% of fine particulates down to 0.3 microns, while activated carbon adsorbs gaseous toxic smog (O3, NO2, VOCs, SO2).',
        keyTips: [
          'Run the air purifier continuously in the primary bedroom or living area with doors and windows closed.',
          'Ensure CADR (Clean Air Delivery Rate) matches room size for 4-5 air changes per hour (ACH).',
          'Position purifier away from walls and curtains for unrestricted 360-degree intake.'
        ]
      },
      {
        id: 'ventilation_timing',
        title: 'Smart Ventilation Timing (Thermal Inversion Windows)',
        severity: 'moderate',
        text: 'During winter smog episodes, nocturnal thermal inversions trap stagnant toxic smoke at ground level from 7 PM to 10 AM.',
        keyTips: [
          'Keep all external doors and windows strictly latched during early morning and late night.',
          'If airing out rooms is necessary, open windows only between 12:00 PM and 3:00 PM when solar heating breaks the inversion lid and winds disperse pollutants.',
          'Check the EcoPulse real-time forecast timeline before opening balcony doors.'
        ]
      },
      {
        id: 'indoor_cleaning',
        title: 'Wet Mopping vs. Dry Sweeping Moratorium',
        severity: 'moderate',
        text: 'Broom sweeping and traditional dusting aerosolize settled PM2.5 soot back into the air column where it stays suspended for hours.',
        keyTips: [
          'Clean floors and surfaces using a damp microfiber mop or cloth with mild detergent.',
          'Use vacuum cleaners equipped with sealed True HEPA exhaust filters only.',
          'Install draft-blockers or silicone weather stripping on gaps under external doors and windows.'
        ]
      },
      {
        id: 'emission_ban',
        title: 'Zero Indoor Combustion Rule',
        severity: 'high',
        text: 'Indoor combustion sources can push indoor AQI above 500 within minutes.',
        keyTips: [
          'Strictly avoid burning incense sticks (agarbatti), scented paraffin candles, or mosquito coils during smog episodes.',
          'Operate kitchen exhaust chimney or range hood on maximum speed while cooking.',
          'Avoid deep frying with low smoke-point oils when outdoor ventilation is restricted.'
        ]
      }
    ]
  },

  vulnerable: {
    title: 'Vulnerable Groups & Medical Protocols',
    icon: 'heart-pulse',
    tagline: 'Targeted medical safeguards for children, seniors, cardiac, and asthma patients.',
    items: [
      {
        id: 'asthma_copd',
        title: 'Asthma, Bronchitis & COPD Patients',
        severity: 'extreme',
        text: 'PM2.5 particles penetrate directly into bronchial alveoli, triggering acute bronchospasm, mucus hypersecretion, and asthma flare-ups.',
        keyTips: [
          'Keep prescribed rapid-relief bronchodilator inhalers (e.g. Salbutamol / Albuterol) within arm\'s reach at all times.',
          'Take prescribed anti-inflammatory corticosteroid maintainer inhalers regularly without skipping doses.',
          'Perform peak expiratory flow (PEFR) checks morning and night; seek medical assistance if reading drops below 80% of baseline.'
        ]
      },
      {
        id: 'cardio_hypertension',
        title: 'Cardiovascular & Hypertension Risk',
        severity: 'extreme',
        text: 'Ultrafine PM0.1 particles cross alveolar-capillary membranes directly into the bloodstream, triggering systemic arterial inflammation, platelet aggregation, and elevated heart attack/stroke risks.',
        keyTips: [
          'Cease all outdoor cardio, brisk jogging, or strenuous manual labor when AQI exceeds 150.',
          'Monitor blood pressure daily; pollution-induced vasoconstriction can spike systolic pressure.',
          'Report any sensation of chest tightness, palpitations, or lightheadedness immediately to emergency care.'
        ]
      },
      {
        id: 'children_infants',
        title: 'Infants, Toddlers & Schoolchildren',
        severity: 'high',
        text: 'Children inhale twice as much air per pound of body weight as adults. Their developing lungs and immune defenses are particularly vulnerable to permanent alveolar damage.',
        keyTips: [
          'Cancel or postpone outdoor sports, school morning assemblies, and recess activities during Unhealthy / Hazardous AQI.',
          'Ensure pediatric N95 / KF94 masks are properly sized for small faces without air leaks.',
          'Keep bedroom air purifiers running while infants sleep.'
        ]
      },
      {
        id: 'elderly_pregnant',
        title: 'Senior Citizens & Expectant Mothers',
        severity: 'high',
        text: 'Particulate exposure during pregnancy is linked to systemic oxidative stress, fetal growth restriction, and pre-eclampsia.',
        keyTips: [
          'Elderly individuals should take morning walks inside temperature-controlled, air-purified rooms.',
          'Expectant mothers must avoid outdoor exposure during peak commute and inversion hours.',
          'Maintain regular pulse oximeter monitoring to ensure SpO2 stays above 95%.'
        ]
      }
    ]
  },

  outdoor_athletes: {
    title: 'Outdoor Workers, Cyclists & Athletes',
    icon: 'activity',
    tagline: 'Science-backed strategies for unavoidable exposure and physical exertion.',
    items: [
      {
        id: 'exercise_modification',
        title: 'Workout Shifting & Aerobic Thresholds',
        severity: 'high',
        text: 'During intense running or cycling, deep mouth-breathing bypasses nasal turbinate filtration, delivering 10x-20x more particulate load directly to lung alveoli.',
        keyTips: [
          'Move all cardio and HIIT sessions indoors to an air-purified environment when AQI > 100.',
          'Substitute heavy running with yoga, Pilates, resistance bands, or low-intensity mobility work indoors.',
          'If outdoor training is essential, schedule it during mid-afternoon (1 PM - 3 PM) when ground smog is least concentrated.'
        ]
      },
      {
        id: 'cyclist_pedestrian_fog',
        title: 'Pedestrian & Cyclist Fog Visibility Gear',
        severity: 'extreme',
        text: 'Drivers in dense fog have less than 2 seconds to spot a pedestrian or bicycle in the roadway.',
        keyTips: [
          'Wear certified high-visibility fluorescent yellow or neon-orange jackets with 360-degree retroreflective Scotchlite stripes.',
          'Equip bicycles with high-lumen front strobe lamps (>400 lumens) and dual pulsing red rear lights.',
          'Cross roads strictly at illuminated, signalized pedestrian crossings; avoid jaywalking in fog.'
        ]
      }
    ]
  }
};

export const HOTSPOT_PRESETS = [
  {
    name: 'New Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
    type: 'Winter Inversion & Severe Smog Hotspot',
    description: 'Frequent extreme winter smog caused by agricultural residue burning, traffic emissions, and cold atmospheric inversions trapping PM2.5.'
  },
  {
    name: 'Lahore',
    country: 'Pakistan',
    lat: 31.5497,
    lon: 74.3436,
    type: 'High Particulate Smog Basin',
    description: 'Intense seasonal post-monsoon smog basin with hazardous AQI levels exceeding 400 regularly during late autumn.'
  },
  {
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    type: 'Classic Advection & River Thames Fog',
    description: 'Maritime climate prone to moist advection fog rolling from the English Channel and North Sea, historically famous for dense pea-soup fogs.'
  },
  {
    name: 'Salt Lake City',
    country: 'United States',
    lat: 40.7608,
    lon: -111.8910,
    type: 'Mountain Basin Winter Inversion',
    description: 'Topographic valley surrounded by Wasatch mountains that traps cold air and fine vehicle emissions under high-pressure ridges.'
  },
  {
    name: 'Bakersfield (San Joaquin Valley)',
    country: 'United States',
    lat: 35.3733,
    lon: -119.0187,
    type: 'Tule Dense Radiation Fog & Agricultural Dust',
    description: 'Renowned for dangerous "Tule Fog"—dense, blinding radiation ground fog that forms after rain, causing major highway pileups.'
  },
  {
    name: 'Beijing',
    country: 'China',
    lat: 39.9042,
    lon: 116.4074,
    type: 'Industrial & Seasonal Aerosol Smog',
    description: 'Northern China plain subject to high industrial particulates combined with winter coal heating and occasional Gobi dust storms.'
  },
  {
    name: 'Los Angeles',
    country: 'United States',
    lat: 34.0522,
    lon: -118.2437,
    type: 'Photochemical Ozone Smog Capital',
    description: 'Warm sunny basin trapped between Pacific ocean and mountains; solar UV drives secondary ozone smog formation from heavy vehicle traffic.'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    type: 'Maritime Megacity & Spring Yellow Dust',
    description: 'Modern high-regulation air management, occasional sea fog, and transboundary seasonal particulate haze.'
  }
];
