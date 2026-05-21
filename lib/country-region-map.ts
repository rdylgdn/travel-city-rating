import { Region } from "./types";

export const COUNTRY_TO_REGION: Record<string, Region> = {
  // Southeast Asia
  TH:"Southeast Asia", VN:"Southeast Asia", ID:"Southeast Asia", MY:"Southeast Asia",
  SG:"Southeast Asia", PH:"Southeast Asia", KH:"Southeast Asia", MM:"Southeast Asia",
  LA:"Southeast Asia", BN:"Southeast Asia",
  // East Asia
  JP:"East Asia", CN:"East Asia", KR:"East Asia", TW:"East Asia", MN:"East Asia",
  // South Asia
  IN:"South Asia", PK:"South Asia", BD:"South Asia", LK:"South Asia", NP:"South Asia",
  // Middle East
  TR:"Middle East", SA:"Middle East", AE:"Middle East", QA:"Middle East", IL:"Middle East",
  JO:"Middle East", LB:"Middle East", IQ:"Middle East", IR:"Middle East", KW:"Middle East",
  BH:"Middle East", OM:"Middle East", YE:"Middle East", SY:"Middle East",
  GE:"Middle East", KZ:"Middle East", UZ:"Middle East", TM:"Middle East", KG:"Middle East", TJ:"Middle East",
  // Africa
  EG:"Africa", MA:"Africa", TN:"Africa", NG:"Africa", KE:"Africa", ZA:"Africa",
  ET:"Africa", GH:"Africa", TZ:"Africa", UG:"Africa", SN:"Africa", CM:"Africa",
  CI:"Africa", MZ:"Africa", ZM:"Africa", ZW:"Africa", RW:"Africa", SD:"Africa",
  SS:"Africa", SO:"Africa", DZ:"Africa", LY:"Africa", GA:"Africa", AO:"Africa",
  BJ:"Africa", BF:"Africa", CG:"Africa",
  // North America
  US:"North America", CA:"North America", MX:"North America", GT:"North America",
  BZ:"North America", HN:"North America", NI:"North America", CR:"North America",
  PA:"North America", CU:"North America", JM:"North America", DO:"North America",
  HT:"North America", BS:"North America",
  // South America
  BR:"South America", AR:"South America", CO:"South America", PE:"South America",
  VE:"South America", CL:"South America", EC:"South America", BO:"South America",
  PY:"South America", UY:"South America",
  // Oceania
  AU:"Oceania", NZ:"Oceania", FJ:"Oceania",
  // Europe
  GB:"Europe", FR:"Europe", DE:"Europe", IT:"Europe", ES:"Europe", PT:"Europe",
  NL:"Europe", BE:"Europe", CH:"Europe", AT:"Europe", SE:"Europe", NO:"Europe",
  DK:"Europe", FI:"Europe", PL:"Europe", CZ:"Europe", SK:"Europe", HU:"Europe",
  RO:"Europe", BG:"Europe", GR:"Europe", HR:"Europe", RS:"Europe", SI:"Europe",
  BA:"Europe", ME:"Europe", MK:"Europe", AL:"Europe", UA:"Europe", BY:"Europe",
  RU:"Europe", EE:"Europe", LV:"Europe", LT:"Europe", IS:"Europe", IE:"Europe",
  LU:"Europe", MT:"Europe", CY:"Europe", MD:"Europe",
};

// Country ISO2 → numeric ISO (for world map matching)
export const COUNTRY_ISO_NUMERIC: Record<string, string> = {
  AF:"004",AL:"008",DZ:"012",AD:"020",AO:"024",AR:"032",AM:"051",AU:"036",AT:"040",AZ:"031",
  BS:"044",BH:"048",BD:"050",BY:"112",BE:"056",BZ:"084",BJ:"204",BT:"064",BO:"068",BA:"070",
  BW:"072",BR:"076",BN:"096",BG:"100",BF:"854",KH:"116",CM:"120",CA:"124",CL:"152",CN:"156",
  CO:"170",CG:"178",CR:"188",HR:"191",CU:"192",CY:"196",CZ:"203",DK:"208",DO:"214",EC:"218",
  EG:"818",SV:"222",EE:"233",ET:"231",FJ:"242",FI:"246",FR:"250",GA:"266",GE:"268",DE:"276",
  GH:"288",GR:"300",GT:"320",HT:"332",HN:"340",HU:"348",IS:"352",IN:"356",ID:"360",IR:"364",
  IQ:"368",IE:"372",IL:"376",IT:"380",JM:"388",JP:"392",JO:"400",KZ:"398",KE:"404",KW:"414",
  KG:"417",LA:"418",LV:"428",LB:"422",LT:"440",LU:"442",MK:"807",MY:"458",MV:"462",MT:"470",
  MX:"484",MD:"498",MC:"492",MN:"496",ME:"499",MA:"504",MZ:"508",MM:"104",NP:"524",NL:"528",
  NZ:"554",NI:"558",NG:"566",NO:"578",OM:"512",PK:"586",PA:"591",PY:"600",PE:"604",PH:"608",
  PL:"616",PT:"620",QA:"634",RO:"642",RU:"643",RW:"646",SA:"682",SN:"686",RS:"688",SG:"702",
  SK:"703",SI:"705",SO:"706",ZA:"710",KR:"410",SS:"728",ES:"724",LK:"144",SD:"729",SE:"752",
  CH:"756",SY:"760",TW:"158",TJ:"762",TZ:"834",TH:"764",TL:"626",TN:"788",TR:"792",TM:"795",
  UG:"800",UA:"804",AE:"784",GB:"826",US:"840",UY:"858",UZ:"860",VE:"862",VN:"704",YE:"887",
  ZM:"894",ZW:"716",
};
