// America in Numbers — the data behind the site.
//
// Every national series below comes from the World Bank Open Data API
// (country USA), fetched 2026-11-26, years 2015-2024. Values are exactly as
// the API returned them; null means the API had no value for that year.
// Display code rounds for presentation only, never changes a value.
// State GDP is for 2024 (U.S. Bureau of Economic Analysis, current dollars)
// and population is the 2020 Decennial Census (U.S. Census Bureau), both
// as listed on Wikipedia's state GDP and state population lists. The World
// Bank holds no literacy series for the United States — both literacy
// indicators returned null for every year, so they are not on this site.
// Sources and years are named on every page that shows a figure.
// Note: for the United States the PPP GDP per capita series is identical
// to the market-rate series — the US dollar is the PPP reference currency.

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// Each indicator: label, unit, the World Bank series id, and values by year.
const INDICATORS = {
  population: { label: "Population, total", unit: "people", code: "SP.POP.TOTL",
    values: [321815121, 324353340, 326608609, 328529577, 330226227, 331578104, 332100166, 333996304, 336755052, 340003797] },
  popGrowth: { label: "Population growth", unit: "% per year", code: "SP.POP.GROW",
    values: [0.797904713382564, 0.785625485688815, 0.692906252591617, 0.586433075122573, 0.515108555014533, 0.408543376643957, 0.157323851413364, 0.569329881519084, 0.822589035790284, 0.960096778979565] },
  urbanPct: { label: "Urban population", unit: "% of total population", code: "SP.URB.TOTL.IN.ZS",
    values: [80.5707989535091, 80.4976645324131, 80.4018678392891, 80.2804567987377, 80.1304793353594, 79.997451762548, 80.0074765140272, 80.0324978239707, 80.071561119178, 80.1247798047184] },
  age65: { label: "Population ages 65 and above", unit: "% of total population", code: "SP.POP.65UP.TO.ZS",
    values: [14.3102247136795, 14.6147285118987, 14.9391233929999, 15.2914866245804, 15.6728852475003, 16.0719119439363, 16.4737700238047, 16.9196203896458, 17.4318194823539, 17.9287302134033] },
  age014: { label: "Population ages 0-14", unit: "% of total population", code: "SP.POP.0014.TO.ZS",
    values: [19.1916943798524, 19.0672311047361, 18.938947483366, 18.7864697356003, 18.6084404882877, 18.3928572241369, 18.1461171256033, 17.8818251956671, 17.5946376490897, 17.3245769214436] },
  age1564: { label: "Population ages 15-64", unit: "% of total population", code: "SP.POP.1564.TO.ZS",
    values: [66.4980809064681, 66.3180403833652, 66.1219291236341, 65.9220436398193, 65.718674264212, 65.5352308319268, 65.380112850592, 65.1985544146872, 64.9735428685564, 64.7466928651531] },
  fertility: { label: "Fertility rate", unit: "births per woman", code: "SP.DYN.TFRT.IN",
    values: [1.8435, 1.8205, 1.7655, 1.7295, 1.706, 1.6415, 1.664, 1.6565, 1.6165, 1.6265] },
  birthRate: { label: "Birth rate, crude", unit: "per 1,000 people", code: "SP.DYN.CBRT.IN",
    values: [12.4, 12.2, 11.8, 11.6, 11.4, 10.9, 11, 11, 10.7, 10.6] },
  deathRate: { label: "Death rate, crude", unit: "per 1,000 people", code: "SP.DYN.CDRT.IN",
    values: [8.44, 8.493, 8.638, 8.678, 8.697, 10.27, 10.4, 9.8, 9.2, 9] },
  density: { label: "Population density", unit: "people per sq. km of land area", code: "EN.POP.DNST",
    values: [35.1809713558577, 35.4584505795077, 35.7049975840182, 35.9149986553586, 36.1004771837305, 36.2482649752608, 36.3053370239915, 36.5126236687503, 36.8142112202129, 37.1693654604249] },
  gdp: { label: "GDP", unit: "current US$", code: "NY.GDP.MKTP.CD",
    values: [18295019000000, 18804913000000, 19612102000000, 20656516000000, 21539982000000, 21375281000000, 23725645000000, 26054614000000, 27811517000000, 29298013000000] },
  gdpGrowth: { label: "GDP growth", unit: "% per year", code: "NY.GDP.MKTP.KD.ZG",
    values: [2.94555045227337, 1.81945147909089, 2.45762230126449, 2.96650506701943, 2.58382533052225, -2.081375977796, 6.15202247867526, 2.52421385073222, 2.93436322440155, 2.79318715363841] },
  gdpPc: { label: "GDP per capita", unit: "current US$", code: "NY.GDP.PCAP.CD",
    values: [56849.4697923159, 57976.628204291, 60047.7190728307, 62875.6661382728, 65227.9565911038, 64465.2971415748, 71441.2319805947, 78008.6895811877, 82586.7847707894, 86169.6641581917] },
  gdpPcPpp: { label: "GDP per capita, PPP", unit: "current international $", code: "NY.GDP.PCAP.PP.CD",
    values: [56849.4697923159, 57976.628204291, 60047.7190728307, 62875.6661382728, 65227.9565911038, 64465.2971415748, 71441.231980595, 78008.6895811877, 82586.7847707891, 86169.6641581914] },
  cpi: { label: "Inflation, consumer prices", unit: "% per year", code: "FP.CPI.TOTL.ZG",
    values: [0.11862713555245, 1.26158320570535, 2.13011000365961, 2.44258329692816, 1.8122100752602, 1.23358439630629, 4.69785886363742, 8.00279982052121, 4.11633838374487, 2.94952520485207] },
  tradePct: { label: "Trade", unit: "% of GDP", code: "NE.TRD.GNFS.ZS",
    values: [27.6882139340768, 26.4525977865465, 27.1253382222874, 27.4453591302618, 26.2584806245428, 23.1399437509149, 25.2327260228331, 26.9078981557739, 24.9292981752847, 25.0160172978284] },
  exportsPct: { label: "Exports of goods and services", unit: "% of GDP", code: "NE.EXP.GNFS.ZS",
    values: [12.4111486301271, 11.8881592273253, 12.177481026766, 12.2871107596266, 11.7891974097286, 10.1230809550527, 10.8266687797107, 11.6540970440015, 11.0506737190927, 10.97469647515] },
  importsPct: { label: "Imports of goods and services", unit: "% of GDP", code: "NE.IMP.GNFS.ZS",
    values: [15.2770653039497, 14.5644385592212, 14.9478571955214, 15.1582483706352, 14.4692832148142, 13.0168627958622, 14.4060572431224, 15.2538011117724, 13.878624456192, 14.0413208226783] },
  savingsPct: { label: "Gross savings", unit: "% of GDP", code: "NY.GNS.ICTR.ZS",
    values: [19.6937975303551, 18.5552041639331, 18.9773232874273, 19.2273760008706, 19.4937117403348, 18.3602077558653, 17.6907350674766, 18.2793304863392, 17.1045901595371, 16.5919955049511] },
  unemployment: { label: "Unemployment, total", unit: "% of total labor force (modeled ILO estimate)", code: "SL.UEM.TOTL.ZS",
    values: [5.28, 4.869, 4.355, 3.896, 3.669, 8.055, 5.349, 3.65, 3.638, 4.022] },
  gniPc: { label: "GNI per capita, Atlas method", unit: "current US$", code: "NY.GNP.PCAP.CD",
    values: [56320, 56830, 58860, 63040, 65840, 64630, 71510, 77230, 79950, 82910] },
  lifeExp: { label: "Life expectancy at birth, total", unit: "years", code: "SP.DYN.LE00.IN",
    values: [78.690243902439, 78.5390243902439, 78.5390243902439, 78.6390243902439, 78.7878048780488, 76.9804878048781, 76.3292682926829, 77.4341463414634, 78.3853658536585, 78.890243902439] },
  lifeExpF: { label: "Life expectancy at birth, female", unit: "years", code: "SP.DYN.LE00.FE.IN",
    values: [81.2, 81.1, 81.1, 81.2, 81.4, 79.9, 79.3, 80.2, 81.1, 81.4] },
  lifeExpM: { label: "Life expectancy at birth, male", unit: "years", code: "SP.DYN.LE00.MA.IN",
    values: [76.3, 76.1, 76.1, 76.2, 76.3, 74.2, 73.5, 74.8, 75.8, 76.5] },
  infantMort: { label: "Mortality rate, infant", unit: "per 1,000 live births", code: "SP.DYN.IMRT.IN",
    values: [5.8, 5.7, 5.6, 5.6, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5] },
  under5Mort: { label: "Mortality rate, under-5", unit: "per 1,000 live births", code: "SH.DYN.MORT",
    values: [6.8, 6.7, 6.6, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5] },
  healthExpPct: { label: "Current health expenditure", unit: "% of GDP", code: "SH.XPD.CHEX.GD.ZS",
    values: [16.40155411, 16.69203949, 16.63827515, 16.51312637, 16.54486084, 18.51597404, 17.35207748, 16.52875137, 16.69414902, null] },
  skilledBirth: { label: "Births attended by skilled health staff", unit: "% of total", code: "SH.STA.BRTC.ZS",
    values: [99.1, 99.1, 99.1, 99.1, 99, 99.1, null, null, null, null] },
  tertiaryEnroll: { label: "School enrollment, tertiary", unit: "% gross", code: "SE.TER.ENRR",
    values: [88.8894119262695, 88.8350524902344, 88.1673889160156, 88.2991790771484, 87.8887100219727, 87.5676574707031, 84.8550872802734, 79.361930847168, null, null] },
  secondaryEnroll: { label: "School enrollment, secondary", unit: "% gross", code: "SE.SEC.ENRR",
    values: [97.6525497436523, 98.7699279785156, 98.9523391723633, 99.2755813598633, 100.063430786133, 100.509819030762, 101.192489624023, 97.4734878540039, null, null] },
  primaryEnroll: { label: "School enrollment, primary", unit: "% gross", code: "SE.PRM.ENRR",
    values: [100.299911499023, 101.362861633301, 101.821441650391, 101.256561279297, 100.981300354004, 100.305793762207, 98.3054885864258, 96.9717330932617, null, null] },
  eduExpPct: { label: "Government expenditure on education, total", unit: "% of GDP", code: "SE.XPD.TOTL.GD.ZS",
    values: [4.93064022064209, 4.78327989578247, 5.09296989440918, 4.89502000808716, 4.95746994018555, 5.39530992507935, 5.42038011550903, null, null, null] },
  pupilTeacherPrimary: { label: "Pupil-teacher ratio, primary", unit: "pupils per teacher", code: "SE.PRM.ENRL.TC.ZS",
    values: [14.45723, null, 14.19857, null, null, null, null, null, null, null] },
  pupilTeacherSecondary: { label: "Pupil-teacher ratio, secondary", unit: "pupils per teacher", code: "SE.SEC.ENRL.TC.ZS",
    values: [14.69697, null, 14.62452, null, null, null, null, null, null, null] },
  co2Pc: { label: "CO2 emissions per capita", unit: "t CO2e per capita (excluding LULUCF)", code: "EN.GHG.CO2.PC.CE.AR5",
    values: [15.9501022949136, 15.5045482189269, 15.1847127213968, 15.5796456645972, 15.0439662080505, 13.4715665664099, 14.3160979329351, 14.4186221294233, 13.7140258849034, 13.6238622652793] },
  renewablePct: { label: "Renewable energy consumption", unit: "% of total final energy consumption", code: "EG.FEC.RNEW.ZS",
    values: [8.9, 9.3, 9.7, 9.9, 10.2, 11, 10.9, null, null, null] },
  forestPct: { label: "Forest area", unit: "% of land area", code: "AG.LND.FRST.ZS",
    values: [33.8997225447175, 33.8813567104167, 33.8629908761159, 33.8446250418151, 33.8262592075142, 33.8078933732134, 33.8000223013702, 33.792151229527, 33.7842801576838, 33.7764090858406] },
  pm25: { label: "PM2.5 air pollution, mean annual exposure", unit: "micrograms per cubic meter", code: "EN.ATM.PM25.MC.M3",
    values: [8.05235034259419, 7.38419160282327, 7.69344314182502, 7.75750644568182, 7.26916299261301, 7.73512626395484, 8.231389869812, 7.4282378905124, 6.96804491055748, null] },
  agriLandPct: { label: "Agricultural land", unit: "% of land area", code: "AG.LND.AGRI.ZS",
    values: [46.5197082893319, 46.6130537353702, 46.7063980882041, 46.5817148441856, 46.4570305069626, 46.3323472629441, 46.2076629257211, 46.0829796817026, 46.0829796817026, 46.0829796817026] },
  internetPct: { label: "Individuals using the Internet", unit: "% of population", code: "IT.NET.USER.ZS",
    values: [74.5542024462761, 85.5444212887222, 87.2748891687657, 88.498903165152, 89.4302848575712, 90.34470367, 91.2684021, 92.72850037, 93.52559662, 94.69380188] },
};

// Land area of the United States, sq. km (World Bank, AG.SRF.TOTL.K2, 2024).
const SURFACE_AREA_KM2 = 9831510;

// States: the 50 states, ordered by 2024 GDP.
// gdp2024 is in million USD (2024, U.S. Bureau of Economic Analysis, as
// listed on Wikipedia's state GDP list); pop2020 is the 2020 Decennial
// Census (U.S. Census Bureau). The District of Columbia is not a state
// and is not in this table.
const STATES = [
  { name: "California", gdp2024: 4048108, pop2020: 39538223 },
  { name: "Texas", gdp2024: 2769766, pop2020: 29145505 },
  { name: "New York", gdp2024: 2322139, pop2020: 20201249 },
  { name: "Florida", gdp2024: 1726710, pop2020: 21538187 },
  { name: "Illinois", gdp2024: 1148106, pop2020: 12812508 },
  { name: "Pennsylvania", gdp2024: 1007874, pop2020: 13002700 },
  { name: "Ohio", gdp2024: 923141, pop2020: 11799448 },
  { name: "Georgia", gdp2024: 881508, pop2020: 10711908 },
  { name: "Washington", gdp2024: 856014, pop2020: 7705281 },
  { name: "New Jersey", gdp2024: 846000, pop2020: 9288994 },
  { name: "North Carolina", gdp2024: 844209, pop2020: 10439388 },
  { name: "Massachusetts", gdp2024: 778523, pop2020: 7029917 },
  { name: "Virginia", gdp2024: 761734, pop2020: 8631393 },
  { name: "Michigan", gdp2024: 702467, pop2020: 10077331 },
  { name: "Arizona", gdp2024: 570089, pop2020: 7151502 },
  { name: "Tennessee", gdp2024: 561201, pop2020: 6910840 },
  { name: "Colorado", gdp2024: 557633, pop2020: 5773714 },
  { name: "Maryland", gdp2024: 546028, pop2020: 6177224 },
  { name: "Indiana", gdp2024: 519517, pop2020: 6785528 },
  { name: "Minnesota", gdp2024: 507688, pop2020: 5706494 },
  { name: "Wisconsin", gdp2024: 453299, pop2020: 5893718 },
  { name: "Missouri", gdp2024: 448714, pop2020: 6154913 },
  { name: "South Carolina", gdp2024: 357074, pop2020: 5118425 },
  { name: "Connecticut", gdp2024: 356835, pop2020: 3605944 },
  { name: "Oregon", gdp2024: 330250, pop2020: 4237256 },
  { name: "Louisiana", gdp2024: 329173, pop2020: 4657757 },
  { name: "Alabama", gdp2024: 325345, pop2020: 5024279 },
  { name: "Utah", gdp2024: 299471, pop2020: 3271616 },
  { name: "Kentucky", gdp2024: 295375, pop2020: 4505836 },
  { name: "Nevada", gdp2024: 269011, pop2020: 3104614 },
  { name: "Iowa", gdp2024: 265795, pop2020: 3190369 },
  { name: "Oklahoma", gdp2024: 263695, pop2020: 3959353 },
  { name: "Kansas", gdp2024: 230522, pop2020: 2937880 },
  { name: "Nebraska", gdp2024: 189243, pop2020: 1961504 },
  { name: "Arkansas", gdp2024: 188340, pop2020: 3011524 },
  { name: "Mississippi", gdp2024: 158192, pop2020: 2961279 },
  { name: "New Mexico", gdp2024: 147085, pop2020: 2117522 },
  { name: "Idaho", gdp2024: 129018, pop2020: 1839106 },
  { name: "New Hampshire", gdp2024: 119337, pop2020: 1377529 },
  { name: "Hawaii", gdp2024: 117627, pop2020: 1455271 },
  { name: "Delaware", gdp2024: 110972, pop2020: 989948 },
  { name: "West Virginia", gdp2024: 106475, pop2020: 1793716 },
  { name: "Maine", gdp2024: 99174, pop2020: 1362359 },
  { name: "Rhode Island", gdp2024: 80381, pop2020: 1097379 },
  { name: "North Dakota", gdp2024: 80058, pop2020: 779094 },
  { name: "Montana", gdp2024: 78441, pop2020: 1084225 },
  { name: "South Dakota", gdp2024: 76796, pop2020: 886667 },
  { name: "Alaska", gdp2024: 71567, pop2020: 733391 },
  { name: "Wyoming", gdp2024: 51498, pop2020: 576851 },
  { name: "Vermont", gdp2024: 46276, pop2020: 643077 },
];

// Which section each indicator belongs to, for the data table filters.
const SECTIONS = {
  population: ["population", "popGrowth", "urbanPct", "age65", "age014", "age1564", "fertility", "birthRate", "deathRate", "density"],
  economy: ["gdp", "gdpGrowth", "gdpPc", "gdpPcPpp", "cpi", "tradePct", "exportsPct", "importsPct", "savingsPct", "unemployment", "gniPc"],
  health: ["lifeExp", "lifeExpF", "lifeExpM", "infantMort", "under5Mort", "healthExpPct", "skilledBirth"],
  education: ["tertiaryEnroll", "secondaryEnroll", "primaryEnroll", "eduExpPct", "pupilTeacherPrimary", "pupilTeacherSecondary"],
  environment: ["co2Pc", "renewablePct", "forestPct", "pm25", "agriLandPct", "internetPct"],
};

// Totals of the 50 states, for the notes on the states page: GDP 2024 sums
// to 28,953,494 million USD ($28.95 trillion), the 2020 census population
// sums to 330,759,736. The national GDP for 2024 is $29.30 trillion and
// the 2020 census counted 331,449,281 people — the 689,545-person gap is
// the District of Columbia, which is not a state and not in this table,
// plus the usual difference between state and national accounts.
const STATE_TOTALS = { gdp2024MillionUsd: 28953494, pop2020: 330759736 };

window.USA = { YEARS, INDICATORS, STATES, SECTIONS, SURFACE_AREA_KM2, STATE_TOTALS };
