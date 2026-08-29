import { Animated, Pressable, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BlurView } from "expo-blur"
import { SymbolView } from "expo-symbols"
import { barShrink } from "@/lib/navbar"

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any
}

const ICONS: Record<string, string> = {
  index: "house.fill",
  kat: "map.fill",
  poste: "plus.circle.fill",
  kandida: "person.2.fill",
  pwoje: "banknote.fill",
}

export function FloatingTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets()

  const scale = barShrink.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.86],
  })
  const translateY = barShrink.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  })
  const opacity = barShrink.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  })

  return (
    <Animated.View
      style={[
        s.wrap,
        {
          bottom: Math.max(insets.bottom, 12),
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView intensity={70} tint="light" style={s.pill}>
        <View style={s.overlay} />
        {state.routes.map((route, i) => {
          const focused = state.index === i
          const icon = ICONS[route.name] ?? "circle"
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                })
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name)
                }
              }}
              style={[s.item, focused && s.itemActive]}
              hitSlop={6}
            >
              <SymbolView
                name={icon as never}
                size={route.name === "poste" ? 27 : 23}
                tintColor={focused ? "#111418" : "#7C7C82"}
              />
            </Pressable>
          )
        })}
      </BlurView>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.62)",
  },
  item: {
    width: 52,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
})
