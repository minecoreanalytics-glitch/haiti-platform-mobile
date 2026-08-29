export type Zone = { id: string; name: string } | null

let zone: Zone = null
const listeners = new Set<() => void>()

export function getZone(): Zone {
  return zone
}

export function setZone(z: Zone) {
  zone = z
  listeners.forEach((l) => l())
}

export function subscribeZone(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
