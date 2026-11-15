/*
 * AstraVital - Crew Health Monitor (prototype, NON-CLINICAL)
 * Indicator definitions, assessment bands, guidance and hazard mapping.
 *
 * IMPORTANT: This is a hackathon prototype for demonstration. It is NOT a
 * medical device and does NOT diagnose, treat, or clear anyone for duty.
 * All green/yellow/red bands are ILLUSTRATIVE, adapted from standard
 * TERRESTRIAL references (cited per indicator below); they are NOT validated
 * for spaceflight. In a real mission, crew follow flight-surgeon direction
 * and mission medical protocols, which supersede anything shown here.
 *
 * Spaceflight context (why these indicators matter on missions) comes from
 * NASA Human Research Program: https://www.nasa.gov/hrp/hazards/ and
 * https://www.nasa.gov/hrp/risks/ - context only, NOT a source of thresholds.
 *
 * AI/SI acknowledgment: generated with AI assistance for the 2026 NASA Space
 * Apps Challenge; the team reviews all content before submission.
 */

const NONCLINICAL_NOTE =
  "Non-clinical demo: bands are illustrative, from standard terrestrial " +
  "references; not validated for spaceflight; not a diagnosis. Real crews " +
  "follow flight-surgeon direction.";

const HAZARDS = {
  radiation:   "Space radiation",
  isolation:   "Isolation & confinement",
  distance:    "Distance from Earth",
  gravity:     "Altered gravity fields",
  environment: "Hostile closed environment"
};

// status levels: 0 = green (within illustrative reference range),
//                1 = yellow (worth re-checking / logging),
//                2 = red (prototype "notify medical" state)
const INDICATORS = [
  {
    id: "heartRate", name: "Heart Rate (resting)", unit: "bpm", type: "number",
    min: 30, max: 200, placeholder: "72",
    howTo: "Rest seated for at least 10 minutes. Count your pulse at the wrist for 60 seconds, or read it from your wearable.",
    why: "Cardiovascular deconditioning is a documented risk of altered gravity (NASA HRP). Resting heart-rate trends show how the heart is coping.",
    hazards: ["gravity", "radiation"],
    body: "heart",
    // MedlinePlus (medlineplus.gov/ency/article/003399.htm): adults 60-100 bpm;
    // well-trained athletes 40-60 bpm. MedlinePlus gives no acute pulse
    // emergency number, so this indicator has NO red band: out-of-range means
    // re-measure with its method and log the trend.
    refs: ["MedlinePlus: Pulse - https://medlineplus.gov/ency/article/003399.htm"],
    assess(v) {
      if (v < 50 || v > 100) return 1;
      return 0;
    },
    guidance: [
      "Logged within the typical adult resting band (60-100 bpm; well-trained athletes 40-60 per MedlinePlus). Trends matter more than any single reading.",
      "Outside the typical band. MedlinePlus method: rest at least 10 minutes, then re-measure. It notes continually high or below-normal resting rates are worth discussing with a clinician - crew log the trend for the flight surgeon.",
      ""
    ]
  },
  {
    id: "bpSys", name: "Blood Pressure (systolic)", unit: "mmHg", type: "number",
    min: 60, max: 220, placeholder: "118", pair: "bpDia",
    howTo: "Sit with back supported, feet flat, arm at heart level. Average two cuff readings one minute apart (per AHA technique guidance).",
    why: "Fluid shifts in microgravity move blood toward the head; pressure regulation changes across a mission (NASA HRP context).",
    hazards: ["gravity", "environment"],
    body: "arm",
    // AHA/ACC 2017 (heart.org): normal <120/<80; elevated 120-129/<80;
    // stage 1: 130-139 or 80-89; stage 2: >=140 or >=90; severe: >180 and/or
    // >120 (call a healthcare professional; with symptoms, emergency).
    // MedlinePlus 007278: normal adult range starts at 90/60, so below that is
    // 'lower than normal' (yellow here, no acute number given).
    refs: ["AHA/ACC 2017 BP categories - https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
           "MedlinePlus: Low blood pressure - https://medlineplus.gov/ency/article/007278.htm"],
    assess(v, r) {
      const d = r && r.bpDia;
      if (v > 180 || (d != null && d > 120)) return 2;
      if (v >= 120 || v < 90 || (d != null && (d >= 80 || d < 60))) return 1;
      return 0;
    },
    guidance: [
      "Within the AHA 'normal' category: below 120 systolic AND below 80 diastolic.",
      "Outside AHA 'normal' - elevated (120-129/<80), stage 1 (130-139 or 80-89), stage 2 (>=140 or >=90), or below MedlinePlus' 90/60 lower bound. AHA guidance: base decisions on an average of 2-3 readings on at least 2 occasions - re-measure with proper cuff technique and log the trend for the flight surgeon.",
      "In the AHA 'severe' band (higher than 180 and/or 120): AHA says call a healthcare professional, or emergency services if symptoms are present. On a mission, that is the flight surgeon on priority comms."
    ]
  },
  {
    id: "bpDia", name: "Blood Pressure (diastolic)", unit: "mmHg", type: "number",
    min: 30, max: 140, placeholder: "76", hidden: true,
    howTo: "", why: "", hazards: [], body: "arm",
    // AHA/ACC 2017 categories applied to the diastolic number alone (charting).
    assess(v) {
      if (v > 120) return 2;
      if (v >= 80 || v < 60) return 1;
      return 0;
    },
    guidance: ["", "", ""],
    refs: []
  },
  {
    id: "spo2", name: "Blood Oxygen (SpO2)", unit: "%", type: "number",
    min: 70, max: 100, placeholder: "98",
    howTo: "Use the pulse oximeter on a warm, still fingertip. Wait about 10 seconds for a stable reading.",
    why: "A closed spacecraft environment changes the air crew breathe (NASA HRP 'hostile closed environment').",
    hazards: ["environment"],
    body: "lungs",
    // MedlinePlus pulse oximetry: normal 95-100%; contact provider if <=92%;
    // seek immediate medical attention if <=88%.
    refs: ["MedlinePlus: Pulse oximetry - https://medlineplus.gov/lab-tests/pulse-oximetry/"],
    assess(v) {
      if (v <= 88) return 2;
      if (v < 95) return 1;
      return 0;
    },
    guidance: [
      "Within the normal 95-100% band (MedlinePlus).",
      "Below the normal 95-100% band. MedlinePlus says contact a provider at 92% or lower: re-measure on a warm, still finger and log the repeat reading.",
      "At or below 88% - MedlinePlus flags this for immediate medical attention. Alert the crew medical officer now."
    ]
  },
  {
    id: "temp", name: "Body Temperature", unit: "\u00B0C", type: "number",
    min: 33, max: 42, step: 0.1, placeholder: "36.6",
    howTo: "Use the medical-kit thermometer (oral or temporal) as directed. Rest 15 minutes after exercise or hot drinks first.",
    why: "Spaceflight can alter immune responses (NASA HRP); a fever can be an early sign of infection, which matters far from care.",
    hazards: ["environment", "distance"],
    body: "head",
    // MedlinePlus fever article: adult oral >~37.2-37.5 C is probably a fever;
    // call a provider if it stays at/above 103 F (39.4 C) or lasts >48-72 h.
    // MedlinePlus 000038: hypothermia is below 95 F (35 C).
    refs: ["MedlinePlus: Fever - https://medlineplus.gov/ency/article/003090.htm",
           "MedlinePlus: Hypothermia - https://medlineplus.gov/ency/article/000038.htm"],
    assess(v) {
      if (v < 35.0 || v >= 39.4) return 2;
      if (v < 36.0 || v >= 37.3) return 1;
      return 0;
    },
    guidance: [
      "Within the usual band.",
      "Slightly raised - MedlinePlus notes oral ~37.2-37.5\u00B0C can already mark a fever in adults. Re-measure later and log any symptoms alongside; a fever lasting >48-72 h is a call-the-provider trigger terrestrially.",
      "MedlinePlus urgent bands: fever staying at/above 39.4\u00B0C (103\u00B0F) is a call-the-provider trigger, and below 35\u00B0C is hypothermia by definition. On a mission, the flight surgeon gets this reading immediately."
    ]
  },
  {
    id: "glucose", name: "Blood Sugar (fasting)", unit: "mg/dL", type: "number",
    min: 40, max: 400, placeholder: "92",
    howTo: "Measure before breakfast (8+ hours fasting) with the glucometer: clean fingertip, lancet, test strip.",
    why: "Nutrition and metabolism change on long missions; stable glucose supports concentration, mood and immune function.",
    hazards: ["environment", "isolation"],
    body: "abdomen",
    // ADA: fasting plasma glucose normal <100, prediabetes 100-125,
    // diabetes-range >=126 (diagnosis happens in a healthcare setting).
    // ADA Standards of Care: hypoglycemia level 1 = <70 mg/dL, level 2 = <54.
    refs: ["American Diabetes Association: Diagnosis - https://diabetes.org/about-diabetes/diagnosis",
           "ADA Standards of Care: Glycemic Goals and Hypoglycemia - https://diabetesjournals.org/clinical/article/43/2/198/158045/Section-6-Glycemic-Goals-and-Hypoglycemia"],
    assess(v) {
      if (v < 70) return 2;
      if (v >= 100) return 1;
      return 0;
    },
    guidance: [
      "Within the ADA normal fasting band (<100 mg/dL).",
      "Above the ADA normal fasting band (100-125 prediabetes-range; >=126 is the ADA's diabetes-range value, which only clinicians diagnose). The ADA is explicit that one reading decides nothing - log the morning trend for the flight surgeon.",
      "Below 70 mg/dL is the ADA's level 1 hypoglycemia alert (level 2 below 54). Follow the mission medical kit's own hypoglycemia procedure and notify the flight surgeon."
    ]
  },
  {
    id: "sleep", name: "Sleep (last 24h)", unit: "hours", type: "number",
    min: 0, max: 16, step: 0.5, placeholder: "7.5",
    howTo: "Log total sleep from your tracker, or estimate time asleep between light-out and wake.",
    why: "Circadian disruption and workload erode sleep on missions (NASA HRP), degrading reaction time, mood and immune defense.",
    hazards: ["isolation", "environment"],
    body: "head",
    // CDC (citing AASM/Sleep Research Society consensus): adults 18-60 need
    // 7 or more hours per night. CDC gives no acute escalation number, so
    // this indicator has NO red band: outside the recommendation = log + note.
    refs: ["CDC: About Sleep - https://www.cdc.gov/sleep/about/index.html"],
    assess(v) {
      if (v < 7 || v > 9.5) return 1;
      return 0;
    },
    guidance: [
      "Meets the CDC 7+ hour adult recommendation.",
      "Outside the CDC 7+ hour adult recommendation. Log it, note fatigue as a factor for safety-critical tasks, and track the trend - persistent short sleep is something crew raise with the flight surgeon.",
      ""
    ]
  },
  {
    id: "mood", name: "Mood & Morale", unit: "/ 10", type: "range",
    min: 1, max: 10, placeholder: "7",
    howTo: "Rate your overall mood right now from 1 (very low) to 10 (excellent). Honest logging helps you and your crew.",
    why: "Isolation and confinement are mission-critical psychological hazards (NASA HRP). Trend tracking catches changes early.",
    hazards: ["isolation", "distance"],
    body: "head",
    // Subjective self-report; NO health-safety band is shown for mood.
    // Levels only drive supportive text, never a status colour.
    nonClinicalScale: true,
    refs: ["Subjective self-report (no clinical scale)"],
    assess(v) {
      if (v <= 3) return 2;
      if (v <= 5) return 1;
      return 0;
    },
    guidance: [
      "Logged. Mood trends matter more than single days.",
      "A lower day. Crew support resources, social time and family contact at comm windows are standard mission support - the mission behavioral-health module has options.",
      "A very low self-rating. Reaching out is standard crew care: talk to a crewmate, use the behavioral-health resources, and contact ground psychological support at the next window."
    ]
  },
  {
    id: "radiation", name: "Radiation Dose (24h)", unit: "mSv", type: "number",
    min: 0, max: 10, step: 0.01, placeholder: "0.30",
    howTo: "Read the 24-hour dose from your personal dosimeter badge at the same time each day.",
    why: "Space radiation is the hardest hazard to shield (NASA HRP). Daily dose trends inform shelter time during solar particle events.",
    hazards: ["radiation"],
    body: "abdomen",
    // ILLUSTRATIVE operational bands only - real limits are set by agency
    // radiation-protection policies, not by this prototype. No health-safety
    // band is shown; the trend chart is informational.
    nonClinicalScale: true,
    refs: ["Illustrative bands (prototype-only; no clinical source)"],
    assess(v) {
      if (v > 1.0) return 2;
      if (v > 0.5) return 1;
      return 0;
    },
    guidance: [
      "Logged against the prototype's illustrative watch level.",
      "Above the illustrative watch level. In a real mission, dose readings and solar-activity alerts drive shelter decisions per mission radiation protocols.",
      "Above the illustrative high band. In a real mission, the flight surgeon and mission radiation protocols own the response; this prototype only tracks the trend."
    ]
  }
];

const ENVIRONMENTS = {
  iss:      { name: "Space Station (LEO)",  comm: "Near-real-time comm with ground (seconds of delay).", autonomy: "Ground support available on demand." },
  orion:    { name: "Spacecraft (transit)", comm: "Comm delay grows with distance - seconds to minutes.", autonomy: "Crew handles most issues onboard." },
  gateway:  { name: "Lunar Gateway",        comm: "About 2.6 s round-trip comm delay.",                   autonomy: "Ground guidance nearly live." },
  lunar:    { name: "Lunar surface base",   comm: "About 2.6 s round-trip comm delay.",                   autonomy: "Evacuation takes days - prevention matters." },
  mars:     { name: "Mars transit / base",  comm: "Up to ~44 min round-trip comm delay.",                 autonomy: "Full medical autonomy required - no live ground help." }
};

const BODY_REGIONS = {
  head:    { label: "Head & Mind",          indicators: ["temp", "sleep", "mood"] },
  heart:   { label: "Heart",                indicators: ["heartRate", "bpSys"] },
  lungs:   { label: "Lungs & Air",          indicators: ["spo2"] },
  arm:     { label: "Circulation",          indicators: ["bpSys", "heartRate"] },
  abdomen: { label: "Metabolic & Exposure", indicators: ["glucose", "radiation"] },
  legs:    { label: "Musculoskeletal",      indicators: [] }
};

// Gamification design rule (from review): reward SHOWING UP, never readings.
// No badge may depend on a health value, and nothing may discourage
// reporting a symptom. Text in the UI says this explicitly.
const BADGES = [
  { id: "first",   name: "First Check-in",   test: (s) => s.readings.length >= 1 },
  { id: "streak3", name: "3-Day Streak",     test: (s) => s.streak >= 3 },
  { id: "streak7", name: "7-Day Streak",     test: (s) => s.streak >= 7 },
  { id: "full",    name: "Full Panel",       test: (s) => s.readings.some(r => INDICATORS.every(i => i.hidden || r[i.id] != null)) },
  { id: "honest",  name: "Honest Log",       test: (s) => s.readings.some(r => INDICATORS.some(i => !i.hidden && r[i.id] != null && i.assess(r[i.id], r) > 0)) }
];
