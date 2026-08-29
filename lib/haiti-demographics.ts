// Pwojeksyon popilasyon IHSI 2015 pa depatman (estimasyon).
// Rapò nasyonal yo aplike sou chak depatman: fanm ~50.5%,
// timoun (-18 an) ~39%, granmoun ki ka vote (18+) ~61%.

export const FEMALE_RATIO = 0.505
export const CHILD_RATIO = 0.39
export const VOTER_RATIO = 0.61

export const DEPT_POPULATION: Record<string, number> = {
  Ouest: 4_029_705,
  Artibonite: 1_727_524,
  Nord: 1_067_177,
  Sud: 774_976,
  Centre: 746_236,
  "Nord-Ouest": 728_807,
  "Sud-Est": 632_601,
  "Grand'Anse": 468_301,
  "Nord-Est": 393_967,
  Nippes: 342_525,
}

export const DEMOGRAPHICS_SOURCE = "Estimasyon IHSI 2015"
