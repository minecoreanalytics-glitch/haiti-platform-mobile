import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { FeedList } from "@/components/FeedList"
import { getZone, setZone, subscribeZone } from "@/lib/zone"
import { t, useLang } from "@/lib/i18n"
import { L_BG, L_SUB, L_TXT } from "@/constants/theme"

export default function FilScreen() {
  useLang()
  const router = useRouter()
  const [zone, setZoneState] = useState(getZone())

  useEffect(() => subscribeZone(() => setZoneState(getZone())), [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: L_BG }} edges={["top"]}>
      <View style={s.topbar}>
        <Pressable onPress={() => router.push("/poste")} hitSlop={8}>
          <SymbolView name="plus.square" size={25} tintColor={L_TXT} />
        </Pressable>
        <View style={s.center}>
          <Text style={{ fontSize: 15 }}>🇭🇹</Text>
          <Text style={s.zone}>{zone?.name ?? t("allHaiti")}</Text>
          {zone && (
            <Pressable onPress={() => setZone(null)} hitSlop={8} style={s.reset}>
              <SymbolView name="xmark" size={10} tintColor={L_SUB} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => router.push("/modal")} hitSlop={8}>
          <SymbolView name="person.circle" size={26} tintColor={L_TXT} />
        </Pressable>
      </View>
      <FeedList />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  center: { flexDirection: "row", alignItems: "center", gap: 6 },
  zone: { color: L_TXT, fontWeight: "800", fontSize: 17 },
  reset: {
    backgroundColor: "#EFEFEF",
    borderRadius: 999,
    padding: 5,
    marginLeft: 2,
  },
})
