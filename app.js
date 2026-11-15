/* AstraVital - Crew Health Monitor (prototype). Non-clinical demo.
 * AI/SI acknowledgment: generated with AI assistance; human review pending before submission.
 * All data stays in the browser (localStorage) - no network calls. */
"use strict";

const LS_KEY = "astravital.v1";
const DAY = 86400000;

function blankState() {
  return { readings: [], env: "iss", created: Date.now(), seeded: false };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY));
    if (s && Array.isArray(s.readings)) return s;
  } catch (e) { /* fall through */ }
  return blankState();
}
function save() {
  // localStorage can be unavailable (private modes, some file:// origins):
  // keep the session in memory instead of breaking check-ins.
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* session-only */ }
}
function storageAvailable() {
  try {
    const k = LS_KEY + ".probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) { return false; }
}
const persists = storageAvailable();

let state = load();
let moodTouched = false; // set when the user actually moves the mood slider
if (!state.seeded) { state.readings = seedReadings(); state.seeded = true; save(); }

function seedReadings() {
  // Plausible demo history over the past 7 days (clearly labelled demo data).
  const out = [];
  const now = Date.now();
  for (let d = 6; d >= 0; d--) {
    for (const h of d === 0 ? [7] : [7, 19]) {
      const t = now - d * DAY - (19 - h) * 3600000;
      if (t > now) continue;
      const wob = (a, b) => a + Math.random() * (b - a);
      out.push({
        ts: t,
        heartRate: Math.round(wob(62, 78) + (d === 2 ? 18 : 0)),
        bpSys: Math.round(wob(112, 126) + (d === 2 ? 10 : 0)),
        bpDia: Math.round(wob(72, 80)),
        spo2: Math.round(wob(96, 99)),
        temp: Math.round(wob(36.2, 37.0) * 10) / 10,
        glucose: Math.round(wob(85, 99) + (d === 3 ? 22 : 0)),
        sleep: Math.round(wob(6.0, 8.5) * 2) / 2,
        mood: Math.round(wob(5, 9) - (d === 4 ? 2 : 0)),
        radiation: Math.round(wob(0.15, 0.45) * 100) / 100,
        demo: true
      });
    }
  }
  return out.sort((a, b) => a.ts - b.ts);
}

const VISIBLE = INDICATORS.filter(i => !i.hidden);
const byId = Object.fromEntries(INDICATORS.map(i => [i.id, i]));

function latest() { return state.readings[state.readings.length - 1] || null; }

function levels(r) {
  const out = {};
  for (const ind of VISIBLE) if (r && r[ind.id] != null) out[ind.id] = ind.assess(r[ind.id], r);
  return out;
}
function worstLevel(r) {
  const lv = Object.entries(levels(r))
    .filter(([id]) => !byId[id].nonClinicalScale)
    .map(([, v]) => v);
  return lv.length ? Math.max(...lv) : 0;
}
function hasDemo() { return state.readings.some(r => r.demo); }

/* ---------- streaks & badges ---------- */
function dayKey(ts) { const d = new Date(ts); return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(); }
function computeStreak() {
  const days = new Set(state.readings.map(r => dayKey(r.ts)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor.getTime()))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

/* ---------- rendering ---------- */
const $ = (sel) => document.querySelector(sel);
const LEVEL_TXT = ["Within reference band", "Outside reference - re-check & log", "Urgent band (per cited source)"];
const LEVEL_CLS = ["s0", "s1", "s2"];

function renderDisclaimer() {
  $("#disclaimer").textContent = NONCLINICAL_NOTE;
}

function renderEnv() {
  const sel = $("#env");
  sel.innerHTML = Object.entries(ENVIRONMENTS)
    .map(([k, e]) => `<option value="${k}" ${k === state.env ? "selected" : ""}>${e.name}</option>`).join("");
  const e = ENVIRONMENTS[state.env];
  $("#envInfo").textContent = e.comm + " " + e.autonomy;
  sel.onchange = () => { state.env = sel.value; save(); renderEnv(); renderAlerts(); };
}

function renderOverall() {
  const el = $("#overall");
  const r = latest();
  el.className = "overall g" + worstLevel(r);
  if (!r) { el.textContent = "Readings summary: no data"; return; }
  const lv = levels(r);
  const clinical = VISIBLE.filter(i => !i.nonClinicalScale);
  const logged = VISIBLE.filter(i => r[i.id] != null).length;
  const missing = VISIBLE.filter(i => r[i.id] == null).map(i => i.name.split(" (")[0]);
  const flagged = clinical.filter(i => lv[i.id] > 0).map(i => i.name.split(" (")[0]);
  const ageH = Math.round((Date.now() - r.ts) / 3600000);
  let txt = `Readings summary: ${logged}/${VISIBLE.length} logged`;
  if (flagged.length) txt += ` - re-check: ${flagged.join(", ")}`;
  else txt += " - all within illustrative bands";
  if (missing.length) txt += ` - missing: ${missing.join(", ")}`;
  if (ageH >= 24) txt += ` - stale (${ageH}h old)`;
  el.textContent = txt;
}

function renderAlerts() {
  const box = $("#alerts");
  const r = latest();
  // Clinical alerts (red first) come before info banners so a capped list
  // can never push an urgent band out of view.
  const clinical = [], infos = [];
  if (r) {
    const lv = levels(r);
    for (const ind of VISIBLE) {
      if (ind.nonClinicalScale) continue; // no safety assessment for illustrative/self-report scales
      if (lv[ind.id] === 2) clinical.push({ lvl: 2, text: `${ind.name}: ${ind.guidance[2]}` });
      else if (lv[ind.id] === 1) clinical.push({ lvl: 1, text: `${ind.name}: ${ind.guidance[1]}` });
    }
  }
  clinical.sort((a, b) => b.lvl - a.lvl);
  if (!persists)
    infos.push({ lvl: -1, text: "Browser storage is blocked - check-ins work, but they are NOT saved once this tab closes." });
  if (state.env === "mars")
    infos.push({ lvl: -1, text: "Mars profile: up to ~44 min round-trip comm delay - plan for full onboard medical autonomy." });
  const last = r ? r.ts : 0;
  if (Date.now() - last > 20 * 3600000)
    infos.push({ lvl: -1, text: "Check-in due - routine measurement keeps your trend charts meaningful." });
  if (hasDemo())
    infos.push({ lvl: -1, text: "SAMPLE DATA: seeded demo history for illustration only - not real crew measurements. It is replaced when the first real check-in is logged." });
  if (state.testMode)
    infos.push({ lvl: -1, text: "SYNTHETIC TEST DATA - edge-case rendering harness. Not real measurements, not a real panel state." });
  box.innerHTML = [...clinical, ...infos].slice(0, 6)
    .map(m => `<div class="alert ${m.lvl === 2 ? "a2" : m.lvl === 1 ? "a1" : "info"}">${m.text}</div>`).join("");
}

function buildForm() {
  const f = $("#checkinForm");
  let html = "";
  for (const ind of VISIBLE) {
    if (ind.id === "bpSys") {
      html += `<div class="bp-row">
        <div class="field"><label>Blood pressure - systolic (mmHg)</label>
        <input type="number" id="in_bpSys" min="${ind.min}" max="${ind.max}" placeholder="${ind.placeholder}"></div>
        <div class="field"><label>diastolic (mmHg)</label>
        <input type="number" id="in_bpDia" min="30" max="140" placeholder="76"></div></div>`;
    } else if (ind.type === "range") {
      html += `<div class="field"><label>${ind.name} (1-10) <span class="muted">- logged only if you set it</span></label>
        <div class="mood-row"><input type="range" id="in_mood" min="1" max="10" value="7" oninput="document.getElementById('moodOut').textContent=this.value">
        <output id="moodOut">7</output></div></div>`;
    } else {
      html += `<div class="field"><label>${ind.name} (${ind.unit})</label>
        <input type="number" id="in_${ind.id}" min="${ind.min}" max="${ind.max}" step="${ind.step || 1}" placeholder="${ind.placeholder}"></div>`;
    }
  }
  html += `<button type="submit">Log check-in</button><p id="formMsg" class="form-msg" aria-live="polite"></p>`;
  f.innerHTML = html;
  document.getElementById("in_mood").addEventListener("input", () => { moodTouched = true; });
  f.onsubmit = (ev) => {
    ev.preventDefault();
    const r = { ts: Date.now() };
    for (const ind of INDICATORS) {
      const el = document.getElementById("in_" + ind.id);
      if (el && el.value !== "") r[ind.id] = parseFloat(el.value);
    }
    // An untouched mood slider is not a measurement: the default 7 must not
    // silently become a logged mood. Mood only enters when deliberately set.
    if (!moodTouched) delete r.mood;
    // Partial check-ins are fine - missing readings are surfaced, not assumed.
    // But a bare submit (nothing measured, slider untouched) logs nothing.
    const hasMeasure = VISIBLE.some(i => i.type !== "range" && r[i.id] != null);
    if (!hasMeasure && !moodTouched) {
      $("#formMsg").textContent = "Nothing to log yet - enter at least one reading, or set your mood deliberately.";
      return;
    }
    $("#formMsg").textContent = "";
    // First real entry retires the seeded SAMPLE data so the two never mix.
    state.readings = state.readings.filter(x => !x.demo);
    state.readings.push(r);
    state.readings.sort((a, b) => a.ts - b.ts);
    moodTouched = false;
    save(); renderAll();
    f.reset();
    document.getElementById("moodOut").textContent = "7";
  };
  $("#checkinHint").textContent =
    "Log any or all indicators - whatever you skip is flagged as missing, never assumed. Placeholders are examples only; fields cite their reference source in Guidance below.";
  updateCheckinMeta();
}

function renderCards(focus) {
  const r = latest();
  const lv = levels(r);
  $("#cards").innerHTML = VISIBLE.map(ind => {
    const v = r && r[ind.id] != null ? r[ind.id] : null;
    let display, lvl;
    if (ind.pair) {
      const d = r && r[ind.pair] != null ? r[ind.pair] : null;
      display = v == null ? "-" : `${v}${d == null ? "" : "/" + d}`;
      lvl = v == null ? -1 : lv[ind.id];
    } else {
      display = v == null ? "-" : v;
      lvl = v == null ? -1 : lv[ind.id];
    }
    const neutral = ind.nonClinicalScale;
    const status = v == null ? "no data"
      : neutral ? (ind.id === "mood" ? "Self-report - no safety band" : "Illustrative scale - trend only")
      : LEVEL_TXT[lvl];
    const cardName = ind.pair ? ind.name.replace("(systolic)", "(sys/dia)") : ind.name;
    return `<div class="card ${neutral ? "neutral" : lvl >= 0 ? LEVEL_CLS[lvl] : ""}" data-ind="${ind.id}" tabindex="0" role="button" aria-label="${cardName}: ${display} ${ind.unit} - ${status}">
      <div class="name">${cardName}</div>
      <div class="value">${display}<span class="unit"> ${ind.unit}</span></div>
      <div class="status">${status}</div>
    </div>`;
  }).join("");
  document.querySelectorAll(".card").forEach(c => {
    c.onclick = () => {
      const id = c.dataset.ind;
      const target = document.getElementById("chart_" + id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      showRegion(byId[id].body);
    };
    c.onkeydown = (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); c.click(); }
    };
  });
}

function bands(ctx, ind, w, h, vmin, vmax) {
  if (ind.nonClinicalScale) return; // no reference-band shading on illustrative/self-report scales
  const steps = 120;
  for (let s = 0; s < steps; s++) {
    const v0 = vmin + (vmax - vmin) * s / steps;
    const v1 = vmin + (vmax - vmin) * (s + 1) / steps;
    const lvl = ind.assess((v0 + v1) / 2, { bpDia: 76 });
    ctx.fillStyle = lvl === 0 ? "rgba(47,191,113,0.10)" : lvl === 1 ? "rgba(242,177,52,0.13)" : "rgba(239,71,111,0.14)";
    const y0 = h - (v0 - vmin) / (vmax - vmin) * h;
    const y1 = h - (v1 - vmin) / (vmax - vmin) * h;
    ctx.fillRect(0, y1, w, y0 - y1);
  }
}

function drawChart(canvas, seriesList, ind) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.scale(1, 1);
  const all = seriesList.flatMap(s => s.values);
  if (all.length < 2) { ctx.fillStyle = "#9aa6c4"; ctx.font = `${12 * dpr}px sans-serif`; ctx.fillText("Not enough data yet", 10 * dpr, 20 * dpr); return; }
  let vmin = Math.min(...all), vmax = Math.max(...all);
  const pad = (vmax - vmin) * 0.25 || 1;
  vmin -= pad; vmax += pad;
  bands(ctx, ind, w, h, vmin, vmax);
  const colors = ["#5aa9ff", "#8ad0ff"];
  seriesList.forEach((s, si) => {
    ctx.strokeStyle = colors[si % colors.length];
    ctx.lineWidth = 1.8 * dpr;
    ctx.beginPath();
    s.values.forEach((v, i) => {
      const x = i / (s.values.length - 1) * (w - 16 * dpr) + 8 * dpr;
      const y = h - (v - vmin) / (vmax - vmin) * (h - 16 * dpr) - 8 * dpr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = colors[si % colors.length];
    s.values.forEach((v, i) => {
      const x = i / (s.values.length - 1) * (w - 16 * dpr) + 8 * dpr;
      const y = h - (v - vmin) / (vmax - vmin) * (h - 16 * dpr) - 8 * dpr;
      ctx.beginPath(); ctx.arc(x, y, 2.2 * dpr, 0, 7); ctx.fill();
    });
  });
  ctx.fillStyle = "#9aa6c4"; ctx.font = `${10 * dpr}px sans-serif`;
  ctx.fillText(`${vmax.toFixed(ind.step ? 1 : 0)}`, 4 * dpr, 11 * dpr);
  ctx.fillText(`${vmin.toFixed(ind.step ? 1 : 0)}`, 4 * dpr, h - 4 * dpr);
}

function renderCharts() {
  const box = $("#charts");
  // Blood pressure gets two charts so each line is shaded against its own scale.
  const defs = [byId.bpSys, byId.bpDia, ...VISIBLE.filter(i => i.id !== "bpSys" && i.id !== "bpDia")];
  box.innerHTML = defs.map(i =>
    `<div class="chart-box" id="chart_${i.id}"><h3>${i.name} <span class="muted">(${i.unit})</span></h3><canvas></canvas></div>`).join("");
  for (const ind of defs) {
    const canvas = document.querySelector(`#chart_${ind.id} canvas`);
    const series = [{ values: state.readings.map(r => r[ind.id]).filter(v => v != null) }];
    drawChart(canvas, series, ind);
  }
}

function renderGuidance() {
  const r = latest();
  const lv = levels(r);
  const box = $("#guidance");
  const items = VISIBLE.map(ind => {
    const hasVal = r && r[ind.id] != null;
    const lvl = hasVal ? lv[ind.id] : 0; // guidance text for no-data shows the in-band advice
    const dotColor = hasVal ? `var(--${["green", "yellow", "red"][lvl]})` : "var(--muted)";
    return `<div class="g-item">
      <b><span class="dot" style="background:${dotColor}"></span>${ind.name}</b>
      <div>${ind.guidance[lvl]}</div>
      <div class="muted" style="margin-top:.25rem"><em>How to measure:</em> ${ind.howTo}</div>
      <div class="muted"><em>Why it matters in space:</em> ${ind.why}</div>
      <span class="refs">Source: ${ind.refs.join("; ")}</span>
    </div>`;
  }).join("");
  box.innerHTML = items;
}

/* ---------- body map ---------- */
const REGION_SHAPES = {
  head:    `<circle cx="100" cy="48" r="30"/>`,
  lungs:   `<ellipse cx="76" cy="120" rx="12" ry="19"/><ellipse cx="124" cy="120" rx="12" ry="19"/>`,
  heart:   `<circle cx="100" cy="132" r="13"/>`,
  arm:     `<rect x="38" y="100" width="18" height="80" rx="9"/><rect x="144" y="100" width="18" height="80" rx="9"/>`,
  abdomen: `<rect x="72" y="150" width="56" height="55" rx="12"/>`,
  legs:    `<rect x="74" y="215" width="22" height="95" rx="10"/><rect x="104" y="215" width="22" height="95" rx="10"/>`
};
function renderBodyMap() {
  const svg = $("#bodymap");
  const r = latest();
  const lv = levels(r);
  const regionWorst = {};
  for (const [key, reg] of Object.entries(BODY_REGIONS)) {
    const vals = reg.indicators
      .filter(id => !byId[id].nonClinicalScale)
      .map(id => lv[id]).filter(v => v != null);
    regionWorst[key] = vals.length ? Math.max(...vals) : -1;
  }
  const col = { "-1": "#3a4670", 0: "var(--green)", 1: "var(--yellow)", 2: "var(--red)" };
  svg.innerHTML =
    `<rect x="60" y="85" width="80" height="130" rx="25" fill="#223" opacity="0.4"/>` +
    Object.entries(REGION_SHAPES).map(([key, shapes]) =>
      `<g class="region" data-region="${key}" fill="${col[regionWorst[key]]}" opacity="0.92" tabindex="0" role="button" aria-label="${BODY_REGIONS[key].label}">${shapes}</g>`).join("") +
    `<text x="100" y="345" text-anchor="middle" fill="#9aa6c4" font-size="11">tap a region</text>`;
  svg.querySelectorAll(".region").forEach(g => {
    g.onclick = () => showRegion(g.dataset.region);
    g.onkeydown = (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); showRegion(g.dataset.region); }
    };
  });
}

function showRegion(key) {
  const reg = BODY_REGIONS[key];
  const det = $("#regionDetail");
  if (!reg) return;
  const r = latest();
  const lv = levels(r);
  let html = `<h3>${reg.label}</h3>`;
  if (!reg.indicators.length) {
    html += `<p class="muted">Bone density and muscle mass are tracked here on long missions (altered-gravity countermeasure: resistance exercise). No direct sensor in this prototype - log exercise in your mission routine.</p>`;
  } else {
    html += reg.indicators.map(id => {
      const ind = byId[id];
      const v = r && r[id] != null ? r[id] : null;
      const lvl = v == null || ind.nonClinicalScale ? -1 : lv[id];
      return `<div class="ind"><b>${ind.name}: ${v == null ? "-" : v + " " + ind.unit}
        ${lvl >= 0 ? `<span class="dot" style="background:var(--${["green", "yellow", "red"][lvl]})"></span>` : ""}
        ${ind.nonClinicalScale ? `<span class="muted">(no safety band)</span>` : ""}</b>
        <span class="muted">${ind.why}</span></div>`;
    }).join("");
  }
  det.innerHTML = html;
}

function renderGamification() {
  const streak = computeStreak();
  state.streak = streak;
  $("#streak").innerHTML = `Check-in streak: <b>${streak}</b> day${streak === 1 ? "" : "s"} - consistency keeps your trends trustworthy.`;
  $("#badges").innerHTML = BADGES.map(b => {
    const earned = b.test(state);
    return `<span class="badge ${earned ? "earned" : ""}">${earned ? "&#11088; " : ""}${b.name}</span>`;
  }).join("");
}

const SHORT_LABELS = { heartRate: "HR", bpSys: "BP", spo2: "SpO2", temp: "Temp", glucose: "Glucose", sleep: "Sleep", mood: "Mood", radiation: "Dose" };
function renderLog() {
  const rows = state.readings.slice(-10).reverse().map(r => {
    const w = worstLevel(r);
    return `<tr><td>${new Date(r.ts).toLocaleString()}${r.demo ? ' <span class="muted">[SAMPLE]</span>' : ""}</td>` +
      VISIBLE.map(i => {
        if (i.pair) {
          const d = r[i.pair];
          return `<td>${r[i.id] != null ? r[i.id] + (d != null ? "/" + d : "") : "-"}</td>`;
        }
        return `<td>${r[i.id] != null ? r[i.id] : "-"}</td>`;
      }).join("") +
      `<td class="${LEVEL_CLS[w]}">${LEVEL_TXT[w]}</td></tr>`;
  }).join("");
  $("#log").innerHTML = `<table><thead><tr><th>Time</th>` +
    VISIBLE.map(i => `<th>${SHORT_LABELS[i.id] || i.name.split(" ")[0]}</th>`).join("") +
    `<th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="muted">Demo data is seeded locally for illustration; "Reset demo data" restores it. Nothing leaves this browser.</p>`;
  $("#resetDemo").onclick = () => {
    if (!confirm("Reset to demo state? This erases ALL saved check-ins - including any real ones - and restores the sample history.")) return;
    state = blankState(); state.readings = seedReadings(); state.seeded = true; save(); renderAll();
  };
}

function updateCheckinMeta() {
  const r = latest();
  $("#lastSaved").textContent = r
    ? `Last saved check-in: ${new Date(r.ts).toLocaleString()}${r.demo ? " (SAMPLE DATA)" : ""}`
    : "No check-ins saved yet.";
  for (const id of ["#tagCards", "#tagCharts", "#tagLog"]) {
    const el = document.querySelector(id);
    if (el) el.style.display = hasDemo() ? "inline" : "none";
  }
}

function renderAll() {
  renderDisclaimer(); renderEnv(); renderOverall(); renderAlerts();
  renderCards(); renderCharts(); renderGuidance(); renderBodyMap();
  renderGamification(); renderLog(); updateCheckinMeta();
}
buildForm();
renderAll();
window.addEventListener("resize", renderCharts);
