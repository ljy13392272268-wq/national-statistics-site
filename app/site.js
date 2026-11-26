// Shared page chrome and number formatting for every page; tables, sorting
// and the CSV download live in tables.js, which only table pages load.

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
  return v === null || v === undefined ? "—" : fmtNum(v / 1e6, 1) + " million";
}
function fmtUsdBillion(v) {
  // State GDP is stored in million USD; show billions.
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

// Fill a stat card: <div class="stat" data-ind="population" data-fmt="millionPeople">
// The card's .stat-value and .stat-year come from the data; a sparkline of
// the whole series is added when charts.js is loaded.
function fillStatCards(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-ind]").forEach((card) => {
    const key = card.getAttribute("data-ind");
    const fmtName = card.getAttribute("data-fmt") || "auto";
    const ind = window.USA.INDICATORS[key];
    if (!ind) return;
    const latest = latestOf(key);
    const valueEl = card.querySelector(".stat-value");
    const yearEl = card.querySelector(".stat-year");
    if (!valueEl) return;
    valueEl.textContent = formatValue(key, latest.value, fmtName);
    if (yearEl) yearEl.textContent = latest.year === null ? "no data" : String(latest.year);
    if (window.CHARTS && window.CHARTS.sparkline) {
      let spark = card.querySelector(".stat-spark");
      if (!spark) {
        spark = document.createElement("span");
        spark.className = "stat-spark";
        spark.setAttribute("aria-hidden", "true");
        card.appendChild(spark);
      }
      spark.innerHTML = window.CHARTS.sparkline(ind.values, card.getAttribute("data-color") || "#b3402a");
    }
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

// --- navigation -------------------------------------------------------------
function markActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".topnav a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}

window.SITE = { fmtInt, fmtNum, fmtUsd, fmtUsdBillion, latestOf, changeSinceStart, fillStatCards, formatValue, markActiveNav };
