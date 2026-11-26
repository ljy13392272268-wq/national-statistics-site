// America in Numbers — ranked horizontal bars (top-ten lists) and the stacked
// age-structure bar. Split from charts.js so pages that only draw a line or
// bar chart do not carry them.

// Horizontal bars, for ranked lists such as states. rows: [{label, value}].
function hBarChart(el, opts) {
  const rows = opts.rows.slice(0, opts.limit || 10);
  const W = chartWidth(el);
  const rowH = W < 560 ? 30 : 34;
  const L = W < 560 ? 104 : 150, R = W < 560 ? 64 : 90, T = 6, B = 6;
  const H = T + rows.length * rowH + B;
  const max = Math.max.apply(null, rows.map((r) => r.value));
  const fs = W < 560 ? 12 : 13;
  let s = chartSvgOpen(W, H, opts.label || "Ranked bars");
  rows.forEach((row, i) => {
    const cy = T + i * rowH + rowH / 2;
    const w = Math.max(2, ((W - L - R) * row.value) / max);
    s += `<text x="${L - 10}" y="${cy + 4}" text-anchor="end" font-family="inherit" font-size="${fs}" fill="#22303a">${row.label}</text>`;
    s += `<rect x="${L}" y="${cy - 9}" width="${w.toFixed(1)}" height="18" rx="4" fill="${opts.color || CHART_COLORS[0]}"/>`;
    s += `<text x="${L + w + 8}" y="${cy + 4}" font-family="inherit" font-size="${fs}" font-weight="700" fill="#33424a">${opts.tickFormat(row.value)}</text>`;
  });
  s += `</svg>`;
  el.innerHTML = s;
}

// A stacked horizontal bar: parts [{label, value, color}] summing to a whole.
function stackedBar(el, opts) {
  const W = chartWidth(el), H = 64;
  const total = opts.parts.reduce((a, p) => a + p.value, 0);
  const fs = W < 560 ? 11.5 : 13;
  let x = 0, s = chartSvgOpen(W, H, opts.label || "Stacked bar");
  s += `<text x="0" y="14" font-family="inherit" font-size="${fs}" font-weight="700" fill="#22303a">${opts.title} (${opts.year})</text>`;
  opts.parts.forEach((p) => {
    const w = (W * p.value) / total;
    s += `<rect x="${x.toFixed(1)}" y="22" width="${w.toFixed(1)}" height="22" fill="${p.color}"/>`;
    x += w;
  });
  s += `<g font-family="inherit" font-size="${fs}" fill="#5a6b70">`;
  let lx = 0;
  opts.parts.forEach((p) => {
    s += `<text x="${lx}" y="60">${p.label} ${p.value.toFixed(1)}%</text>`;
    lx += W / opts.parts.length;
  });
  s += `</g></svg>`;
  el.innerHTML = s;
}

Object.assign(window.CHARTS, { hBarChart, stackedBar });
