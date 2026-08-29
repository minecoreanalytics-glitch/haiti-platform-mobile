import { Animated } from "react-native"

// 0 = barre déployée, 1 = barre réduite
export const barShrink = new Animated.Value(0)

let lastY = 0
let target = 0

function animateTo(v: number) {
  if (target === v) return
  target = v
  Animated.spring(barShrink, {
    toValue: v,
    useNativeDriver: true,
    friction: 9,
    tension: 60,
  }).start()
}

export function onFeedScroll(y: number) {
  const dy = y - lastY
  lastY = y
  if (y < 40) {
    animateTo(0)
    return
  }
  if (dy > 4) animateTo(1)
  else if (dy < -4) animateTo(0)
}
