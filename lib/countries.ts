export type Country = { name: string; iso2: string; flag: string };

function flag(iso2: string): string {
  return String.fromCodePoint(
    ...Array.from(iso2.toUpperCase()).map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
  );
}

const RAW: [string, string][] = [
  ["Afghanistan","AF"],["Albania","AL"],["Algeria","DZ"],["Andorra","AD"],["Angola","AO"],
  ["Argentina","AR"],["Armenia","AM"],["Australia","AU"],["Austria","AT"],["Azerbaijan","AZ"],
  ["Bahamas","BS"],["Bahrain","BH"],["Bangladesh","BD"],["Belarus","BY"],["Belgium","BE"],
  ["Belize","BZ"],["Benin","BJ"],["Bolivia","BO"],["Bosnia and Herzegovina","BA"],["Botswana","BW"],
  ["Brazil","BR"],["Brunei","BN"],["Bulgaria","BG"],["Burkina Faso","BF"],["Cambodia","KH"],
  ["Cameroon","CM"],["Canada","CA"],["Chile","CL"],["China","CN"],["Colombia","CO"],
  ["Congo","CG"],["Costa Rica","CR"],["Croatia","HR"],["Cuba","CU"],["Cyprus","CY"],
  ["Czech Republic","CZ"],["Denmark","DK"],["Dominican Republic","DO"],["Ecuador","EC"],
  ["Egypt","EG"],["El Salvador","SV"],["Estonia","EE"],["Ethiopia","ET"],["Finland","FI"],
  ["France","FR"],["Gabon","GA"],["Georgia","GE"],["Germany","DE"],["Ghana","GH"],
  ["Greece","GR"],["Guatemala","GT"],["Haiti","HT"],["Honduras","HN"],["Hungary","HU"],
  ["Iceland","IS"],["India","IN"],["Indonesia","ID"],["Iran","IR"],["Iraq","IQ"],
  ["Ireland","IE"],["Israel","IL"],["Italy","IT"],["Jamaica","JM"],["Japan","JP"],
  ["Jordan","JO"],["Kazakhstan","KZ"],["Kenya","KE"],["Kuwait","KW"],["Kyrgyzstan","KG"],
  ["Latvia","LV"],["Lebanon","LB"],["Libya","LY"],["Lithuania","LT"],["Luxembourg","LU"],
  ["Malaysia","MY"],["Maldives","MV"],["Malta","MT"],["Mexico","MX"],["Moldova","MD"],
  ["Mongolia","MN"],["Montenegro","ME"],["Morocco","MA"],["Mozambique","MZ"],["Myanmar","MM"],
  ["Nepal","NP"],["Netherlands","NL"],["New Zealand","NZ"],["Nicaragua","NI"],["Nigeria","NG"],
  ["North Korea","KP"],["North Macedonia","MK"],["Norway","NO"],["Oman","OM"],["Pakistan","PK"],
  ["Palestine","PS"],["Panama","PA"],["Paraguay","PY"],["Peru","PE"],["Philippines","PH"],
  ["Poland","PL"],["Portugal","PT"],["Qatar","QA"],["Romania","RO"],["Russia","RU"],
  ["Rwanda","RW"],["Saudi Arabia","SA"],["Senegal","SN"],["Serbia","RS"],["Singapore","SG"],
  ["Slovakia","SK"],["Slovenia","SI"],["Somalia","SO"],["South Africa","ZA"],["South Korea","KR"],
  ["South Sudan","SS"],["Spain","ES"],["Sri Lanka","LK"],["Sudan","SD"],["Sweden","SE"],
  ["Switzerland","CH"],["Syria","SY"],["Taiwan","TW"],["Tajikistan","TJ"],["Tanzania","TZ"],
  ["Thailand","TH"],["Tunisia","TN"],["Turkey","TR"],["Turkmenistan","TM"],["Uganda","UG"],
  ["Ukraine","UA"],["United Arab Emirates","AE"],["United Kingdom","GB"],["United States","US"],
  ["Uruguay","UY"],["Uzbekistan","UZ"],["Venezuela","VE"],["Vietnam","VN"],["Yemen","YE"],
  ["Zambia","ZM"],["Zimbabwe","ZW"],
];

export const COUNTRIES: Country[] = RAW.map(([name, iso2]) => ({ name, iso2, flag: flag(iso2) }));
