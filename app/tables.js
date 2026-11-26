// America in Numbers — the tables: the years-across series table, click-to-
// sort headers, live search filtering, and the CSV download that is built in
// the browser from the site's own data. Loaded only by pages with a table.

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
    const rank = r.querySelector(".rank");
    if (rank) rank.textContent = String(i + 1);
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

Object.assign(window.SITE, { seriesTable, enableSorting, enableFilter, downloadCsv });
