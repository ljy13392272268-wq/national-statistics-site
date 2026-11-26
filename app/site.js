// America in Numbers — shared page helpers: number formatting, stat cards,
// data tables, sorting and filtering. Every figure on the site is rendered
// from data.js, so the page and the charts can never disagree.

// --- formatting -------------------------------------------------------------
function fmtInt(v) {
  return v === null || v === undefined ? "—" : Math.round(v).toLocaleString("en-US");
}
function fmtNum(v, digits) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function fmtPct(v, digits) {
  return v === null || v === undefined ? "—" : fmtNum(v, digits === undefined ? 1 : digits) + "%";
}
function fmtUsdTrillion(v) {
  return v === null || v === undefined ? "—" : "$" + fmtNum(v / 1e12, 2) + " trillion";
}
function fmtUsd(v) {
  return v === null || v === undefined ? "—" : "$" + fmtInt(v);
}
function fmtBillionPeople(v) {
  return v === null || v === undefined ? "—" : fmtNum(v / 1e9, 2) + " billion";
}
function fmtMillionPeople(v) {
  // The US population is 340 million: "0.34 billion" would read oddly,
  // so people are shown in millions throughout this site.
  return v === null || v === undefined ? "—" : fmtNum(v / 1e6, 1) + " million";
}
function fmtUsdBillion(v) {
  // state GDP is stored in million USD; show billions.
  return v === null || v === undefined ? "—" : "$" + fmtNum(v / 1000, 2) + " billion";
}

// Latest non-null value of an indicator, with its year.
function latestOf(key) {
  const ind = window.USA.INDICATORS[key];
  for (let i = ind.values.length - 1; i >= 0; i--) {
    if (ind.values[i] !== null && ind.values[i] !== undefined) {
      return { year: window.USA.YEARS[i], value: ind.values[i], index: i };
    }
  }
  return { year: null, value: null, index: -1 };
}

// Change between the first and the latest non-null value, in percentage points
// for percent series, otherwise as a percent change.
function changeSinceStart(key) {
  const ind = window.USA.INDICATORS[key];
  const first = ind.values.find((v) => v !== null && v !== undefined);
  const last = latestOf(key);
  if (first === undefined || last.value === null) return null;
  return { from: first, to: last.value, pct: ((last.value - first) / Math.abs(first)) * 100 };
}

// --- stat cards -------------------------------------------------------------
// Fill a stat card: <div class="stat" data-ind="population" data-fmt="billionPeople">
// The card's .stat-value and .stat-year are filled from data.js.
function fillStatCards(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-ind]").forEach((card) => {
    const key = card.getAttribute("data-ind");
    const fmtName = card.getAttribute("data-fmt") || "auto";
    const latest = latestOf(key);
    const valueEl = card.querySelector(".stat-value");
    const yearEl = card.querySelector(".stat-year");
    if (!valueEl) return;
    valueEl.textContent = formatValue(key, latest.value, fmtName);
    if (yearEl) yearEl.textContent = latest.year === null ? "no data" : String(latest.year);
  });
}

function formatValue(key, value, fmtName) {
  if (value === null || value === undefined) return "—";
  switch (fmtName) {
    case "billionPeople": return fmtBillionPeople(value);
    case "millionPeople": return fmtMillionPeople(value);
    case "usdTrillion": return fmtUsdTrillion(value);
    case "usd": return fmtUsd(value);
    case "pct1": return fmtPct(value, 1);
    case "pct2": return fmtPct(value, 2);
    case "num1": return fmtNum(value, 1);
    case "num2": return fmtNum(value, 2);
    case "int": return fmtInt(value);
    default: {
      const ind = window.USA.INDICATORS[key];
      if (!ind) return fmtNum(value, 2);
      if (ind.unit.indexOf("%") !== -1) return fmtPct(value, 1);
      if (ind.unit === "people") return fmtMillionPeople(value);
      if (ind.unit === "current US$" && value >= 1e12) return fmtUsdTrillion(value);
      if (ind.unit === "current US$" || ind.unit === "current international $") return fmtUsd(value);
      return fmtNum(value, 1);
    }
  }
}

// --- series tables ----------------------------------------------------------
// Render a table of one indicator per row, years as columns, into el.
function seriesTable(el, keys) {
  const years = window.USA.YEARS;
  let html = `<table class="data-table"><thead><tr><th>Indicator</th><th>Unit</th>`;
  years.forEach((y) => { html += `<th class="num">${y}</th>`; });
  html += `</tr></thead><tbody>`;
  keys.forEach((key) => {
    const ind = window.USA.INDICATORS[key];
    // Show scaled units where the raw unit would mislead: population is
    // shown in millions, GDP in US$ trillions.
    let unitLabel = ind.unit;
    if (key === "population") unitLabel = "million people";
    if (key === "gdp") unitLabel = "US$ trillion";
    html += `<tr><td>${ind.label}</td><td>${unitLabel}</td>`;
    ind.values.forEach((v) => {
      html += `<td class="num">${v === null ? "—" : fmtCell(ind, v)}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table>`;
  el.innerHTML = html;
}

function fmtCell(ind, v) {
  if (ind.unit.indexOf("%") !== -1) return fmtNum(v, 2);
  if (ind.unit === "people") return fmtNum(v / 1e6, 0);
  if (ind.code === "NY.GDP.MKTP.CD") return fmtNum(v / 1e12, 2);
  if (ind.unit === "current US$" || ind.unit === "current international $") return fmtNum(v, 0);
  if (ind.unit === "years" || ind.unit === "births per woman") return fmtNum(v, 2);
  return fmtNum(v, 2);
}

// --- table sorting and filtering -------------------------------------------
// Make every th[data-sort] in a table clickable to sort that column.
function enableSorting(table) {
  const ths = table.querySelectorAll("th[data-sort]");
  ths.forEach((th) => {
    th.classList.add("sortable");
    th.addEventListener("click", () => {
      const key = th.getAttribute("data-sort");
      const firstRow = table.querySelector("tbody tr");
      const firstVal = firstRow ? firstRow.getAttribute("data-" + key) : null;
      const numeric = firstVal !== null && firstVal !== "" && !isNaN(parseFloat(firstVal));
      const current = th.getAttribute("data-dir");
      // First click: numbers sort largest-first, text sorts A-first.
      // Later clicks just flip the direction.
      const asc = current === "asc" ? false : current === "desc" ? true : !numeric;
      table.querySelectorAll("th[data-sort]").forEach((o) => o.removeAttribute("data-dir"));
      th.setAttribute("data-dir", asc ? "asc" : "desc");
      sortTableBody(table, key, asc);
    });
  });
}

function sortTableBody(table, key, asc) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  rows.sort((a, b) => {
    const av = parseFloat(a.getAttribute("data-" + key) || "0");
    const bv = parseFloat(b.getAttribute("data-" + key) || "0");
    if (!isNaN(av) && !isNaN(bv)) return asc ? av - bv : bv - av;
    const as = (a.getAttribute("data-" + key) || "").toLowerCase();
    const bs = (b.getAttribute("data-" + key) || "").toLowerCase();
    return asc ? as.localeCompare(bs) : bs.localeCompare(as);
  });
  rows.forEach((r, i) => {
    r.querySelector(".rank").textContent = String(i + 1);
    tbody.appendChild(r);
  });
}

// Live-filter rows of a table by a text input: rows whose text (or their
// data-keywords) lacks the query are hidden.
function enableFilter(input, table) {
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    table.querySelectorAll("tbody tr").forEach((row) => {
      const haystack = (row.textContent + " " + (row.getAttribute("data-keywords") || "")).toLowerCase();
      row.style.display = haystack.includes(q) ? "" : "none";
    });
  });
}

// --- CSV download -----------------------------------------------------------
// Build a CSV of every national indicator from data.js and download it.
// The file is generated in the browser from the site's own data; no request.
function downloadCsv() {
  const years = window.USA.YEARS;
  const lines = ["indicator,unit," + years.join(",")];
  Object.keys(window.USA.INDICATORS).forEach((key) => {
    const ind = window.USA.INDICATORS[key];
    const cells = ind.values.map((v) => (v === null ? "" : String(v)));
    lines.push(`"${ind.label}","${ind.unit}",${cells.join(",")}`);
  });
  lines.push("");
  lines.push("States: name,GDP 2024 (million USD),population 2020 (census)");
  window.USA.STATES.forEach((s) => {
    lines.push(`"${s.name}",${s.gdp2024},${s.pop2020}`);
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "america-statistics.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// --- navigation -------------------------------------------------------------
// Mark the current page's nav link as active.
function markActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".topnav a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}

window.SITE = { fmtInt, fmtNum, fmtPct, fmtUsdTrillion, fmtUsd, fmtBillionPeople, fmtMillionPeople, fmtUsdBillion, latestOf, changeSinceStart, fillStatCards, formatValue, seriesTable, enableSorting, enableFilter, downloadCsv, markActiveNav };
