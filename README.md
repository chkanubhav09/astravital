# AstraVital - Crew Health Monitor (prototype)

A self-contained, offline web app that helps an astronaut log health
indicators, see their status at a glance, spot trends, and get plain-language
guidance on what to re-check and when to notify a flight surgeon.

Built for the 2026 NASA Space Apps Challenge (Mumbai Local Event), challenge:
**"Create Health Monitoring Software for Astronauts on Space Missions."**

> **Non-clinical demonstration software.** Not a medical device. It does not
> diagnose, treat, or clear anyone for duty. All status bands are
> *illustrative*, adapted from standard terrestrial references (each
> indicator cites its source in the Guidance panel); they are not validated
> for spaceflight. In a real mission, crew follow flight-surgeon direction
> and mission medical protocols.

## Run it

No build step, no dependencies, no network:

```
open index.html          # any modern browser, works from file://
```

All data stays in the browser (localStorage). "Reset demo data" restores the
seeded 7-day demo history.

## Features

- Daily check-in: blood pressure, resting heart rate, SpO2, body temperature,
  fasting blood sugar, sleep hours, mood (the indicators named in the
  challenge brief) plus 24h radiation dose.
- Color-coded status cards and an overall crew-status pill
  (green / yellow / red bands, per the brief's color-coding suggestion).
- Clickable body map: each body region shows its indicators and why they
  matter in space (the brief's suggested interface example).
- Trend charts with shaded reference bands.
- Guidance & countermeasures panel with how-to-measure instructions and
  cited reference sources for every indicator.
- Mission-routine gamification that rewards showing up and logging honestly -
  never health values (badges: First Check-in, streaks, Full Panel, Honest Log).
- Mission-environment profiles (LEO station, transit, Gateway, lunar base,
  Mars) with comm-delay/autonomy context.
- Offline-capable, privacy-first: no accounts, no backend, no tracking; runs from a local copy with no network (verified). The public demo is a static hosted page.

## Reference sources for illustrative bands

- Resting heart rate: MedlinePlus, "Pulse" - https://medlineplus.gov/ency/article/003399.htm
- Blood pressure categories: AHA/ACC 2017 - https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings
- SpO2: MedlinePlus, "Pulse oximetry" - https://medlineplus.gov/lab-tests/pulse-oximetry/
- Fever: MedlinePlus, "Fever" - https://medlineplus.gov/ency/article/003090.htm
- Fasting glucose: American Diabetes Association, "Diagnosis" - https://diabetes.org/about-diabetes/diagnosis
- Sleep: CDC, "About Sleep" - https://www.cdc.gov/sleep/about/index.html
- Radiation-dose bands and the mood scale are illustrative/self-report only.

## Spaceflight context (NASA resources)

NASA Human Research Program - used for hazard/risk context only, never as a
source of clinical thresholds:

- 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- Ongoing HRP Research: https://www.nasa.gov/hrp/ongoing-hrp-research/
- CSA: Monitoring Radiation for Astronaut Health - https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- CSA: Why Do We Conduct Science Experiments in Space? - https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp

## AI / Super-Intelligence disclosure

This project's code and text were generated with AI (SI) assistance for the
2026 NASA Space Apps Challenge and the team reviews all content before submission, per
the challenge's SI usage requirements. No NASA branding or design elements
are used.

## License

To be applied on publication (Apache License 2.0 planned, per NASA Space Apps
project defaults). Private until the team authorizes publication.
