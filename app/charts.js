// America in Numbers — hand-drawn SVG charts. No chart library: every chart
// below is built from the data with plain SVG so the first load stays small.

const CHART_COLORS = ["#b3402a", "#1f6f6b", "#c98a1b", "#4a6fa5", "#7a5a8c"];

// Nice axis ticks for a numeric range.
function chartTicks(min, max, count) {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const stepRaw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(stepRaw)));
  const norm = stepRaw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(v);
  if (ticks.length === 0) ticks.push(start);
  return ticks;
}

function chartSvgOpen(width, height, label) {
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">`;
}

// A line chart. series: [{name, values (aligned to YEARS), color}].
// Null values break the line, so gaps in the source stay visible as gaps.
function lineChart(el, opts) {
  const years = window.USA.YEARS;
  const W = 720, H = 300, L = 64, R = 14, T = 16, B = 34;
  const all = opts.series.flatMap((s) => s.values.filter((v) => v !== null));
  let min = Math.min.apply(null, all), max = Math.max.apply(null, all);
  const pad = (max - min) * 0.12 || 1;
  min -= pad; max += pad;
  const x = (i) => L + (i * (W - L - R)) / (years.length - 1);
  const y = (v) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const ticks = chartTicks(min, max, 4);
  let s = chartSvgOpen(W, H, opts.label || "Line chart");
  s += `<g font-family="inherit" font-size="12" fill="#5a6b70">`;
  for (const t of ticks) {
    s += `<line x1="${L}" y1="${y(t)}" x2="${W - R}" y2="${y(t)}" stroke="#e3ddd2" stroke-width="1"/>`;
    s += `<text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${opts.tickFormat(t)}</text>`;
  }
  s += `</g>`;
  for (let i = 0; i < years.length; i++) {
    s += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="12" fill="#5a6b70">${years[i]}</text>`;
  }
  opts.series.forEach((series, si) => {
    const color = series.color || CHART_COLORS[si % CHART_COLORS.length];
    let d = "", last = null;
    series.values.forEach((v, i) => {
      if (v === null) { last = null; return; }
      d += (last === null ? "M" : "L") + x(i).toFixed(1) + "," + y(v).toFixed(1) + " ";
      last = v;
    });
    s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    series.values.forEach((v, i) => {
      if (v === null) return;
      s += `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#faf7f1" stroke="${color}" stroke-width="2"/>`;
    });
    const lastI = series.values.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0).pop();
    if (lastI !== undefined && lastI >= 0) {
      // The label sits right of the last point, unless the point is too
      // close to the right edge — then it sits left of it instead.
      const label = opts.tickFormat(series.values[lastI]);
      const lx = x(lastI);
      if (lx > W - R - 64) {
        s += `<text x="${lx - 8}" y="${y(series.values[lastI]) + 4}" text-anchor="end" font-size="13" font-weight="700" fill="${color}">${label}</text>`;
      } else {
        s += `<text x="${lx + 8}" y="${y(series.values[lastI]) + 4}" font-size="13" font-weight="700" fill="${color}">${label}</text>`;
      }
    }
  });
  s += `</svg>`;
  if (opts.series.length > 1) {
    s += `<div class="chart-legend">` + opts.series.map((series, si) =>
      `<span><i style="background:${series.color || CHART_COLORS[si % CHART_COLORS.length]}"></i>${series.name}</span>`).join("") + `</div>`;
  }
  el.innerHTML = s;
}

// A vertical bar chart for one series.
function barChart(el, opts) {
  const years = window.USA.YEARS;
  const W = 720, H = 300, L = 64, R = 14, T = 16, B = 34;
  const vals = opts.values.filter((v) => v !== null);
  let min = 0, max = Math.max.apply(null, vals);
  const ticks = chartTicks(min, max, 4);
  const slot = (W - L - R) / years.length;
  const bw = Math.min(44, slot * 0.62);
  const x = (i) => L + i * slot + (slot - bw) / 2;
  const y = (v) => T + (1 - v / max) * (H - T - B);
  let s = chartSvgOpen(W, H, opts.label || "Bar chart");
  s += `<g font-family="inherit" font-size="12" fill="#5a6b70">`;
  for (const t of ticks) {
    s += `<line x1="${L}" y1="${y(t)}" x2="${W - R}" y2="${y(t)}" stroke="#e3ddd2" stroke-width="1"/>`;
    s += `<text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${opts.tickFormat(t)}</text>`;
  }
  s += `</g>`;
  opts.values.forEach((v, i) => {
    if (v === null) return;
    const color = opts.color || CHART_COLORS[0];
    s += `<rect x="${x(i).toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H - B - y(v)).toFixed(1)}" rx="3" fill="${color}"/>`;
    if (opts.showValues) {
      s += `<text x="${(x(i) + bw / 2).toFixed(1)}" y="${(y(v) - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#33424a">${opts.tickFormat(v)}</text>`;
    }
    s += `<text x="${(x(i) + bw / 2).toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="12" fill="#5a6b70">${years[i]}</text>`;
  });
  s += `</svg>`;
  el.innerHTML = s;
}

// Horizontal bars, for ranked lists such as states. rows: [{label, value}].
function hBarChart(el, opts) {
  const rows = opts.rows.slice(0, opts.limit || 10);
  const W = 720, rowH = 34, L = 150, R = 90, T = 8, B = 8;
  const H = T + rows.length * rowH + B;
  const max = Math.max.apply(null, rows.map((r) => r.value));
  let s = chartSvgOpen(W, H, opts.label || "Ranked bars");
  rows.forEach((row, i) => {
    const cy = T + i * rowH + rowH / 2;
    const w = Math.max(2, ((W - L - R) * row.value) / max);
    s += `<text x="${L - 10}" y="${cy + 4}" text-anchor="end" font-size="13" fill="#22303a">${row.label}</text>`;
    s += `<rect x="${L}" y="${cy - 9}" width="${w.toFixed(1)}" height="18" rx="4" fill="${opts.color || CHART_COLORS[0]}"/>`;
    s += `<text x="${L + w + 8}" y="${cy + 4}" font-size="13" font-weight="700" fill="#33424a">${opts.tickFormat(row.value)}</text>`;
  });
  s += `</svg>`;
  el.innerHTML = s;
}

// A stacked horizontal bar: parts [{label, value, color}] summing to a whole.
function stackedBar(el, opts) {
  const W = 720, H = 64, L = 0, R = 0;
  const total = opts.parts.reduce((a, p) => a + p.value, 0);
  let x = L, s = chartSvgOpen(W, H, opts.label || "Stacked bar");
  s += `<text x="0" y="14" font-size="13" font-weight="700" fill="#22303a">${opts.title} (${opts.year})</text>`;
  opts.parts.forEach((p) => {
    const w = ((W - L - R) * p.value) / total;
    s += `<rect x="${x.toFixed(1)}" y="22" width="${w.toFixed(1)}" height="22" fill="${p.color}"/>`;
    x += w;
  });
  s += `<g font-size="12" fill="#5a6b70">`;
  let lx = 0;
  opts.parts.forEach((p) => {
    s += `<text x="${lx}" y="60">${p.label} ${p.value.toFixed(1)}%</text>`;
    lx += 190;
  });
  s += `</g></svg>`;
  el.innerHTML = s;
}

window.CHARTS = { lineChart, barChart, hBarChart, stackedBar };
