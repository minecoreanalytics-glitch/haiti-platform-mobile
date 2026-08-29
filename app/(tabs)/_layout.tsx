import { Tabs } from "expo-router"
import { useLang } from "@/lib/i18n"
import { FloatingTabBar } from "@/components/FloatingTabBar"

export default function TabLayout() {
  useLang()
  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar state={props.state} navigation={props.navigation} />
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="kat" />
      <Tabs.Screen name="poste" />
      <Tabs.Screen name="kandida" />
      <Tabs.Screen name="pwoje" />
    </Tabs>
  )
}
