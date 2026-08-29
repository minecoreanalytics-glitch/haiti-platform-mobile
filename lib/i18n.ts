export type Lang = "fr" | "ht"

let lang: Lang = "fr"
const listeners = new Set<() => void>()

export function getLang(): Lang {
  return lang
}

export function setLang(l: Lang) {
  lang = l
  listeners.forEach((fn) => fn())
}

export function subscribeLang(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

const STRINGS = {
  // Onglets
  tabFil: { fr: "Fil", ht: "Fil" },
  tabKat: { fr: "Carte", ht: "Kat" },
  tabPoste: { fr: "Publier", ht: "Poste" },
  tabKandida: { fr: "Candidats", ht: "Kandida" },
  tabPwoje: { fr: "Projets", ht: "Pwojè" },

  // Fil
  allHaiti: { fr: "Tout Haïti", ht: "Tout Ayiti" },
  chipAll: { fr: "Tout", ht: "Tout" },
  chipProjects: { fr: "Projets", ht: "Pwojè" },
  chipCandidates: { fr: "Candidats", ht: "Kandida" },
  chipCitizens: { fr: "Citoyens", ht: "Sitwayen" },
  emptyFeed: { fr: "Rien à afficher pour le moment.", ht: "Poko gen anyen la a." },
  serverError: {
    fr: "Le serveur ne répond pas. Vérifiez la connexion.",
    ht: "Sèvè a pa reponn. Tcheke koneksyon an.",
  },
  give: { fr: "Donner via MonCash", ht: "Bay ak MonCash" },
  contributions: { fr: "contributions", ht: "kontribisyon" },
  now: { fr: "à l'instant", ht: "kounye a" },
  hoursShort: { fr: "h", ht: " èdtan" },
  daysShort: { fr: "j", ht: " jou" },
  badgeProject: { fr: "Projet", ht: "Pwojè" },
  badgeCitizen: { fr: "Citoyen", ht: "Sitwayen" },

  // Carte
  whereAreYou: { fr: "Où êtes-vous ?", ht: "Ki kote w ye?" },
  seeFeedOf: { fr: "Voir le fil de", ht: "Wè fil" },
  noPosts: { fr: "aucune publication", ht: "poko gen pòs" },
  posts: { fr: "publications", ht: "pòs" },
  post1: { fr: "publication", ht: "pòs" },
  people: { fr: "habitants", ht: "moun" },
  voters: { fr: "électeurs", ht: "votan" },
  more: { fr: "plus", ht: "plis" },
  close: { fr: "fermer", ht: "fèmen" },
  women: { fr: "FEMMES", ht: "FANM" },
  men: { fr: "HOMMES", ht: "GASON" },
  children: { fr: "ENFANTS -18", ht: "TIMOUN -18" },
  candidates: { fr: "CANDIDATS", ht: "KANDIDA" },
  projects: { fr: "PROJETS", ht: "PWOJÈ" },
  communes: { fr: "COMMUNES", ht: "KOMIN" },
  communesLc: { fr: "communes", ht: "komin" },
  mostActive: { fr: "Commune la plus active", ht: "Komin ki pi aktif" },
  demoSource: {
    fr: "Estimations IHSI 2015 · ratios nationaux appliqués par département",
    ht: "Estimasyon IHSI 2015 · rapò nasyonal aplike pa depatman",
  },

  // Candidats
  candidatesTitle: { fr: "Candidats", ht: "Kandida" },
  candidatesSub: {
    fr: "Candidats vérifiés pour les élections 2026",
    ht: "Kandida verifye pou eleksyon 2026 yo",
  },
  noCandidates: { fr: "Aucun candidat vérifié.", ht: "Poko gen kandida verifye." },
  candidateProfile: { fr: "Profil du candidat", ht: "Pwofil kandida" },
  verified: { fr: "Vérifié", ht: "Verifye" },
  program: { fr: "Programme", ht: "Pwogram" },
  priorities: { fr: "Priorités", ht: "Priyorite" },
  askPublicQuestion: { fr: "Poser une question publique", ht: "Poze yon kesyon piblik" },
  activity: { fr: "Activité", ht: "Aktivite" },

  // Publier
  postTitle: { fr: "Publier", ht: "Poste" },
  yourZone: { fr: "Votre zone", ht: "Zòn ou" },
  zoneDefault: {
    fr: "Zone : Port-au-Prince (choisissez la vôtre dans Carte)",
    ht: "Zòn: Pòtoprens (chwazi zòn ou nan Kat)",
  },
  question: { fr: "Question", ht: "Kesyon" },
  problem: { fr: "Problème", ht: "Pwoblèm" },
  questionHint: {
    fr: "Posez une question publique aux candidats",
    ht: "Poze kandida yo yon kesyon piblik",
  },
  problemHint: {
    fr: "Signalez un problème dans votre zone (route, eau, déchets…)",
    ht: "Siyale yon pwoblèm nan zòn ou (wout, dlo, fatra…)",
  },
  yourNameOptional: { fr: "Votre nom (optionnel)", ht: "Non ou (opsyonèl)" },
  questionPlaceholder: {
    fr: "Quelle question voulez-vous poser aux candidats ?",
    ht: "Ki kesyon w vle poze kandida yo?",
  },
  problemPlaceholder: { fr: "Décrivez le problème…", ht: "Dekri pwoblèm nan…" },
  publish: { fr: "Publier", ht: "Pibliye" },
  minChars: { fr: "Écrivez au moins 10 caractères.", ht: "Ekri omwen 10 karaktè." },
  connError: { fr: "Erreur de connexion", ht: "Erè koneksyon" },
  onlyCandidatesNote: {
    fr: "Seuls les candidats vérifiés peuvent créer des projets, via la plateforme web.",
    ht: "Sèl kandida verifye ka kreye pwojè, sou platfòm wèb la.",
  },

  // Projets
  projectsTitle: { fr: "Projets", ht: "Pwojè" },
  projectsSub: {
    fr: "Projets citoyens financés en toute transparence",
    ht: "Pwojè sitwayen finanse ak transparans",
  },
  collected: { fr: "collectés", ht: "kolekte" },
  goal: { fr: "objectif", ht: "objektif" },
  by: { fr: "par", ht: "pa" },
  noProjects: { fr: "Aucun projet pour le moment.", ht: "Poko gen pwojè." },

  // Signalement / catégories
  confirm: { fr: "Je confirme", ht: "Mwen konfime" },
  confirmed: { fr: "Confirmé", ht: "Konfime" },
  witnesses: { fr: "témoins", ht: "temwen" },
  witness1: { fr: "témoin", ht: "temwen" },
  catDLO: { fr: "Eau", ht: "Dlo" },
  catWOUT: { fr: "Route", ht: "Wout" },
  catKOURAN: { fr: "Électricité", ht: "Kouran" },
  catLEKOL: { fr: "École", ht: "Lekòl" },
  catSANTE: { fr: "Santé", ht: "Sante" },
  catFATRA: { fr: "Déchets", ht: "Fatra" },
  catSEKIRITE: { fr: "Sécurité", ht: "Sekirite" },
  catLOT: { fr: "Autre", ht: "Lòt" },
  pickCategory: { fr: "Choisir une catégorie", ht: "Chwazi yon kategori" },
  categoryRequired: {
    fr: "Choisissez une catégorie pour le signalement.",
    ht: "Chwazi yon kategori pou siyalman an.",
  },
  statusSIYALE: { fr: "Signalé", ht: "Siyale" },
  statusPRIS_AN_CHAJ: { fr: "Pris en charge", ht: "Pris an chaj" },
  statusREZOLI: { fr: "Résolu", ht: "Rezoli" },

  // Modération
  report: { fr: "Signaler ce contenu", ht: "Siyale kontni sa a" },
  reportSent: { fr: "Signalement envoyé", ht: "Siyalman voye" },
  reasonSPAM: { fr: "Spam", ht: "Spam" },
  reasonFO_ENFO: { fr: "Fausse information", ht: "Fo enfòmasyon" },
  reasonAGRESYON: { fr: "Agression ou harcèlement", ht: "Agresyon oswa asèlman" },
  reasonIDANTITE: { fr: "Usurpation d'identité", ht: "Fo idantite" },
  reasonLOT: { fr: "Autre", ht: "Lòt" },
  cancel: { fr: "Annuler", ht: "Anile" },

  // Collecte pas ouverte
  fundingClosed: {
    fr: "Collecte pas encore ouverte",
    ht: "Kolèkt la poko louvri",
  },
  declaredGoal: { fr: "objectif annoncé", ht: "objektif anonse" },

  // Couverture des données
  coverage: { fr: "contributeurs", ht: "kontribitè" },
  lowCoverage: {
    fr: "Peu de témoins ici — pas forcément peu de problèmes.",
    ht: "Tikras temwen isit — sa pa vle di tikras pwoblèm.",
  },

  // Illustration
  aiImage: { fr: "Image d'illustration", ht: "Imaj ilistrasyon" },

  // Choix de langue au lancement
  chooseLanguage: { fr: "Chwazi lang ou · Choisissez votre langue", ht: "Chwazi lang ou · Choisissez votre langue" },
  continueBtn: { fr: "Continuer", ht: "Kontinye" },

  // Profil
  me: { fr: "Moi", ht: "Mwen" },
  visitor: { fr: "Visiteur", ht: "Vizitè" },
  visitorNote: {
    fr: "Vous pouvez tout consulter sans compte. Un compte ne sera nécessaire que pour donner ou poser une question en votre nom.",
    ht: "Ou ka gade tout bagay san kont. Kont lan ap vin nesesè sèlman lè w ap bay lajan oswa poze kesyon ak non w.",
  },
  myZone: { fr: "Ma zone", ht: "Zòn mwen" },
  backToAllHaiti: { fr: "Revenir à Tout Haïti", ht: "Retounen sou Tout Ayiti" },
  changeZoneOnMap: { fr: "Changer de zone sur la carte", ht: "Chanje zòn sou kat la" },
  language: { fr: "Langue", ht: "Lang" },
  demoVersion: {
    fr: "Plateforme Civique Haïti · version démo",
    ht: "Platfòm Sivik Ayiti · vèsyon demo",
  },
} as const

export type StringKey = keyof typeof STRINGS

export function t(key: StringKey): string {
  return STRINGS[key][lang]
}

import { useEffect, useReducer } from "react"

export function useLang(): Lang {
  const [, force] = useReducer((x: number) => x + 1, 0)
  useEffect(() => subscribeLang(force), [])
  return lang
}
