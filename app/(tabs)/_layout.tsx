import { SymbolView } from "expo-symbols"
import { Tabs } from "expo-router"
import type { ColorValue } from "react-native"
import { t, useLang } from "@/lib/i18n"
import { INK, LINE, MUTED, PAPER } from "@/constants/theme"

function icon(name: string) {
  return ({ color }: { color: ColorValue }) => (
    <SymbolView name={name as never} tintColor={color as string} size={24} />
  )
}

export default function TabLayout() {
  useLang()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PAPER,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: "#060608",
          borderTopColor: "#1B1F26",
        },
        sceneStyle: { backgroundColor: "#060608" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabFil"), tabBarIcon: icon("house.fill") }}
      />
      <Tabs.Screen
        name="kat"
        options={{ title: t("tabKat"), tabBarIcon: icon("map.fill") }}
      />
      <Tabs.Screen
        name="poste"
        options={{ title: t("tabPoste"), tabBarIcon: icon("plus.circle.fill") }}
      />
      <Tabs.Screen
        name="kandida"
        options={{ title: t("tabKandida"), tabBarIcon: icon("person.2.fill") }}
      />
      <Tabs.Screen
        name="pwoje"
        options={{ title: t("tabPwoje"), tabBarIcon: icon("banknote.fill") }}
      />
    </Tabs>
  )
}
