// Idantite lokal — pwovizwa.
// PRD 6.1 : dwe ranplase pa yon verifikasyon OTP telefòn.
// Non piblik la se toujou pseudonim nan (DOCTRINE §3).

let pseudonym = "sitwayen"
const listeners = new Set<() => void>()

export function getPseudonym() {
  return pseudonym
}

export function setPseudonym(p: string) {
  pseudonym = p.trim().slice(0, 30).replace(/\s+/g, "_") || "sitwayen"
  listeners.forEach((l) => l())
}

export function subscribeIdentity(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
