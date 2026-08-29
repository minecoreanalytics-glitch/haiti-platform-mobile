import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BlurView } from "expo-blur"
import { SymbolView } from "expo-symbols"
import { barShrink } from "@/lib/navbar"
import { t, useLang, type StringKey } from "@/lib/i18n"

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any
}

const TABS: Record<string, { icon: string; label: StringKey }> = {
  index: { icon: "house.fill", label: "tabFil" },
  kat: { icon: "map.fill", label: "tabKat" },
  poste: { icon: "plus.circle.fill", label: "tabPoste" },
  kandida: { icon: "person.2.fill", label: "tabKandida" },
  pwoje: { icon: "banknote.fill", label: "tabPwoje" },
}

export function FloatingTabBar({ state, navigation }: TabBarProps) {
  useLang()
  const insets = useSafeAreaInsets()

  const scale = barShrink.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.88],
  })
  const translateY = barShrink.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
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
          const tab = TABS[route.name] ?? { icon: "circle", label: "tabFil" }
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
              hitSlop={4}
            >
              <SymbolView
                name={tab.icon as never}
                size={route.name === "poste" ? 25 : 22}
                tintColor={focused ? "#111418" : "#7C7C82"}
              />
              <Text style={[s.label, focused && s.labelActive]} numberOfLines={1}>
                {t(tab.label)}
              </Text>
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
    alignSelf: "stretch",
    marginHorizontal: 12,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
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
    flex: 1,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  itemActive: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  label: { fontSize: 10, fontWeight: "600", color: "#7C7C82" },
  labelActive: { color: "#111418", fontWeight: "800" },
})
