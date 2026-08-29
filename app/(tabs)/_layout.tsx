import { SymbolView } from "expo-symbols"
import { Tabs } from "expo-router"
import type { ColorValue } from "react-native"
import { INK, LINE, MUTED, PAPER } from "@/constants/theme"

function icon(name: string) {
  return ({ color }: { color: ColorValue }) => (
    <SymbolView name={name as never} tintColor={color as string} size={24} />
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PAPER,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: INK,
          borderTopColor: LINE,
        },
        sceneStyle: { backgroundColor: INK },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Fil", tabBarIcon: icon("house.fill") }}
      />
      <Tabs.Screen
        name="kat"
        options={{ title: "Kat", tabBarIcon: icon("map.fill") }}
      />
      <Tabs.Screen
        name="poste"
        options={{ title: "Poste", tabBarIcon: icon("plus.circle.fill") }}
      />
      <Tabs.Screen
        name="kandida"
        options={{ title: "Kandida", tabBarIcon: icon("person.2.fill") }}
      />
      <Tabs.Screen
        name="pwoje"
        options={{ title: "Pwojè", tabBarIcon: icon("banknote.fill") }}
      />
    </Tabs>
  )
}
