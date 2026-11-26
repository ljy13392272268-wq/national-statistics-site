// America in Numbers — the charts used across the site's pages. No chart
// library: every chart is plain SVG built from the data, drawn at the width
// its container actually has, so labels stay legible on a phone.

const CHART_COLORS = ["#b3402a", "#1f6f6b", "#c98a1b", "#4a6fa5", "#7a5a8c"];

// The width a chart draws at: the container's own width, uncapped, so the
// SVG's units are CSS pixels and its text keeps its size at any viewport.
function chartWidth(el) {
  const w = el && el.clientWidth ? Math.round(el.clientWidth) : 0;
  return Math.max(300, w || 720);
}

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
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">`;
}

// A line chart. series: [{name, values (aligned to YEARS), color}].
// Null values break the line, so gaps in the source stay visible as gaps.
function lineChart(el, opts) {
  const years = window.USA.YEARS;
  const W = chartWidth(el);
  const H = W < 560 ? 230 : 268;
  const L = W < 560 ? 52 : 64, R = 14, T = 16, B = 32;
  const fs = W < 560 ? 11 : 12;
  const all = opts.series.flatMap((s) => s.values.filter((v) => v !== null));
  let min = Math.min.apply(null, all), max = Math.max.apply(null, all);
  const pad = (max - min) * 0.12 || 1;
  min -= pad; max += pad;
  const x = (i) => L + (i * (W - L - R)) / (years.length - 1);
  const y = (v) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const ticks = chartTicks(min, max, 4);
  let s = chartSvgOpen(W, H, opts.label || "Line chart");
  s += `<g font-family="inherit" font-size="${fs}" fill="#5a6b70">`;
  for (const t of ticks) {
    s += `<line x1="${L}" y1="${y(t)}" x2="${W - R}" y2="${y(t)}" stroke="#e3ddd2" stroke-width="1"/>`;
    s += `<text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${opts.tickFormat(t)}</text>`;
  }
  s += `</g>`;
  // Ten year labels fit at desktop width; below 560px, drop every other one.
  const every = W < 560 ? 2 : 1;
  for (let i = 0; i < years.length; i++) {
    if (i % every !== 0 && i !== years.length - 1) continue;
    s += `<text x="${x(i)}" y="${H - 9}" text-anchor="middle" font-family="inherit" font-size="${fs}" fill="#5a6b70">${years[i]}</text>`;
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
  const W = chartWidth(el);
  const H = W < 560 ? 230 : 268;
  const L = W < 560 ? 52 : 64, R = 14, T = 16, B = 32;
  const fs = W < 560 ? 11 : 12;
  const vals = opts.values.filter((v) => v !== null);
  let min = 0, max = Math.max.apply(null, vals);
  const ticks = chartTicks(min, max, 4);
  const every = W < 560 ? 2 : 1;
  const slot = (W - L - R) / years.length;
  const bw = Math.min(44, slot * 0.62);
  const x = (i) => L + i * slot + (slot - bw) / 2;
  const y = (v) => T + (1 - v / max) * (H - T - B);
  let s = chartSvgOpen(W, H, opts.label || "Bar chart");
  s += `<g font-family="inherit" font-size="${fs}" fill="#5a6b70">`;
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
    if (i % every === 0 || i === years.length - 1) {
      s += `<text x="${(x(i) + bw / 2).toFixed(1)}" y="${H - 9}" text-anchor="middle" font-family="inherit" font-size="${fs}" fill="#5a6b70">${years[i]}</text>`;
    }
  });
  s += `</svg>`;
  el.innerHTML = s;
}

// A tiny trend line for a stat card. values: the indicator's ten yearly values.
function sparkline(values, color) {
  const W = 84, H = 28, P = 3;
  const nums = values.filter((v) => v !== null && v !== undefined);
  if (nums.length < 2) return "";
  let min = Math.min.apply(null, nums), max = Math.max.apply(null, nums);
  if (min === max) { min -= 1; max += 1; }
  const x = (i) => P + (i * (W - 2 * P)) / (values.length - 1);
  const y = (v) => P + (1 - (v - min) / (max - min)) * (H - 2 * P);
  let d = "", last = null;
  values.forEach((v, i) => {
    if (v === null || v === undefined) { last = null; return; }
    d += (last === null ? "M" : "L") + x(i).toFixed(1) + "," + y(v).toFixed(1) + " ";
    last = v;
  });
  const lastI = values.map((v, i) => (v === null || v === undefined ? -1 : i)).filter((i) => i >= 0).pop();
  let dot = "";
  if (lastI !== undefined && lastI >= 0) {
    dot = `<circle cx="${x(lastI).toFixed(1)}" cy="${y(values[lastI]).toFixed(1)}" r="2.2" fill="${color}"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/></svg>`.replace("</svg>", dot + "</svg>");
}

window.CHARTS = { lineChart, barChart, sparkline };
