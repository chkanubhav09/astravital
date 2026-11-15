# DRAFT - Project Submission page text (for user review before anything is entered)

Nothing below has been entered on the NASA Space Apps site. Every field waits
for Anubhav's approval. Field names match the official Project Submission
Guide (https://www.spaceappschallenge.org/resources/project-submission-guide/).

---

## Project Name
**AstraVital - Crew Health Monitor**
(placeholder codename; Anubhav can change it)

## High-Level Project Summary

AstraVital is a privacy-first web app that runs offline from a local copy,
helping astronauts on long missions track their own health. Crew log the indicators the challenge brief
names - blood pressure, heart rate, blood sugar, body temperature, sleep, and
mood - plus blood oxygen and daily radiation dose. The app turns readings
into color-coded status (green/yellow/red), trend charts, a clickable
body-systems map, and plain-language guidance: how to measure each indicator,
why it matters in space, what to re-check, and when to notify a flight
surgeon. It is grounded in NASA Human Research Program's five hazards of
human spaceflight, so the guidance connects each indicator to the hazard that
threatens it. Mission-environment profiles (space station, transit, lunar,
Mars) adapt the guidance to the comm delay and autonomy the crew actually has.

## Link to Project Demo
(to be filled after demo choice - 7-slide deck recommended, hosted with a
public link once Anubhav approves)

## Link to Final Project
(to be filled after Anubhav approves public hosting - public repo with OSI
licence and/or a static hosted page)

## Detailed Project Description

**What it does.** AstraVital gives a crew member one daily check-in: enter
eight health indicators, see each one's status at a glance, and read
actionable guidance. A body map shows which body system each indicator
belongs to; trend charts show how values move across the mission; a routine
system prompts the next check-in and rewards consistency.

**How it works.** The app is a single-page web application in plain
HTML/CSS/JavaScript with no dependencies, no accounts, and no network calls -
important on a bandwidth-limited, delay-tolerant mission. Data lives in the
browser. Each indicator is compared against reference bands; the worst
indicator sets the overall crew status, and the guidance panel explains the
next step in plain language, including how to take each measurement
correctly.

**Clinical honesty.** The prototype is explicitly non-clinical: every band is
labelled illustrative and cites its terrestrial source (MedlinePlus, AHA/ACC
2017, American Diabetes Association, CDC). It makes no diagnosis and no
fitness-for-duty call - it shows crew what to re-check and when to escalate
to a flight surgeon, mirroring real mission medical operations. Gamification
rewards showing up and logging honestly, never the readings themselves, so it
can never discourage reporting a symptom.

**Benefits.** Long missions - especially Mars transits with up to ~44 minutes
of round-trip comm delay - put health assessment in the crew's hands.
AstraVital supports that autonomy: structured self-checks, early trend
detection, and clear escalation guidance, all running offline from a local copy.

**Tools.** Vanilla HTML/CSS/JavaScript, SVG, Canvas. No frameworks, no
application backend, no transmission of readings, no cost. Verified: the code
makes zero network calls, so a saved local copy runs fully offline; the public
demo is a static hosted page (first load needs the network, like any website).

## Use of Super Intelligence (SI)

Yes. AI (SI) tools generated the application code and text and assisted in
checking reference ranges against primary sources. No AI-generated images or
video are used in the demo. The team reviewed all content before submission.

## NASA Data

NASA Human Research Program resources shaped the indicator set, the
hazard-mapping, and the guidance text:
- 5 Hazards of Human Spaceflight - https://www.nasa.gov/hrp/hazards/
- Risks of Human Spaceflight - https://www.nasa.gov/hrp/risks/
- Ongoing HRP Research in Space - https://www.nasa.gov/hrp/ongoing-hrp-research/

These were used for spaceflight context (which hazards affect which
indicators, and how). Clinical reference bands come from the cited
terrestrial sources below, not from NASA resources.

## Space Agency Partner Data and Other References

- CSA (Canadian Space Agency): "Monitoring Radiation for Astronaut Health" -
  https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- CSA: "Why Do We Conduct Science Experiments in Space?" -
  https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp
- MedlinePlus (pulse, pulse oximetry, fever articles)
- American Heart Association / ACC 2017 blood-pressure categories
- American Diabetes Association fasting-glucose criteria
- CDC sleep recommendations

---

## Demo plan (if Anubhav approves the 7-slide deck)

1. Title: AstraVital - Crew Health Monitor (team: Archjerry labs, member: Anubhav Chakraborty; challenge: Create Health Monitoring Software for Astronauts on Space Missions)
2. The problem: long missions, 5 hazards, comm delay - crew must self-assess
3. The app: daily check-in and color-coded status (screenshot)
4. Body map + guidance: measure right, know why, know when to escalate (screenshot)
5. Trends + mission routine: consistency without punishing honest logs (screenshot)
6. Built for space: offline, no accounts; NASA HRP grounding; non-clinical by design
7. What's next: wearable ingestion, telemedicine link, validated bands with flight surgeons
