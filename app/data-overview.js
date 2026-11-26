// The overview page's data: the ten indicators index.html shows, copied
// verbatim from data.js (World Bank, country USA, 2015-2024).

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// Each indicator: label, unit, the World Bank series id, and values by year.
const INDICATORS = {
  population: { label: "Population, total", unit: "people", code: "SP.POP.TOTL",
    values: [321815121, 324353340, 326608609, 328529577, 330226227, 331578104, 332100166, 333996304, 336755052, 340003797] },
  urbanPct: { label: "Urban population", unit: "% of total population", code: "SP.URB.TOTL.IN.ZS",
    values: [80.5707989535091, 80.4976645324131, 80.4018678392891, 80.2804567987377, 80.1304793353594, 79.997451762548, 80.0074765140272, 80.0324978239707, 80.071561119178, 80.1247798047184] },
  fertility: { label: "Fertility rate", unit: "births per woman", code: "SP.DYN.TFRT.IN",
    values: [1.8435, 1.8205, 1.7655, 1.7295, 1.706, 1.6415, 1.664, 1.6565, 1.6165, 1.6265] },
  gdp: { label: "GDP", unit: "current US$", code: "NY.GDP.MKTP.CD",
    values: [18295019000000, 18804913000000, 19612102000000, 20656516000000, 21539982000000, 21375281000000, 23725645000000, 26054614000000, 27811517000000, 29298013000000] },
  gdpGrowth: { label: "GDP growth", unit: "% per year", code: "NY.GDP.MKTP.KD.ZG",
    values: [2.94555045227337, 1.81945147909089, 2.45762230126449, 2.96650506701943, 2.58382533052225, -2.081375977796, 6.15202247867526, 2.52421385073222, 2.93436322440155, 2.79318715363841] },
  gdpPc: { label: "GDP per capita", unit: "current US$", code: "NY.GDP.PCAP.CD",
    values: [56849.4697923159, 57976.628204291, 60047.7190728307, 62875.6661382728, 65227.9565911038, 64465.2971415748, 71441.2319805947, 78008.6895811877, 82586.7847707894, 86169.6641581917] },
  unemployment: { label: "Unemployment, total", unit: "% of total labor force (modeled ILO estimate)", code: "SL.UEM.TOTL.ZS",
    values: [5.28, 4.869, 4.355, 3.896, 3.669, 8.055, 5.349, 3.65, 3.638, 4.022] },
  lifeExp: { label: "Life expectancy at birth, total", unit: "years", code: "SP.DYN.LE00.IN",
    values: [78.690243902439, 78.5390243902439, 78.5390243902439, 78.6390243902439, 78.7878048780488, 76.9804878048781, 76.3292682926829, 77.4341463414634, 78.3853658536585, 78.890243902439] },
  co2Pc: { label: "CO2 emissions per capita", unit: "t CO2e per capita (excluding LULUCF)", code: "EN.GHG.CO2.PC.CE.AR5",
    values: [15.9501022949136, 15.5045482189269, 15.1847127213968, 15.5796456645972, 15.0439662080505, 13.4715665664099, 14.3160979329351, 14.4186221294233, 13.7140258849034, 13.6238622652793] },
  internetPct: { label: "Individuals using the Internet", unit: "% of population", code: "IT.NET.USER.ZS",
    values: [74.5542024462761, 85.5444212887222, 87.2748891687657, 88.498903165152, 89.4302848575712, 90.34470367, 91.2684021, 92.72850037, 93.52559662, 94.69380188] },
};

window.USA = { YEARS, INDICATORS };
