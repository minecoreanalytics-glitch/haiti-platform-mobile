import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { FeedList } from "@/components/FeedList"
import { getZone, setZone, subscribeZone } from "@/lib/zone"
import { t, useLang } from "@/lib/i18n"
import { INK, MUTED, PAPER } from "@/constants/theme"

export default function FilScreen() {
  useLang()
  const router = useRouter()
  const [zone, setZoneState] = useState(getZone())

  useEffect(() => subscribeZone(() => setZoneState(getZone())), [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.topbar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => router.push("/kat")}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Text style={{ fontSize: 16 }}>🇭🇹</Text>
            <Text style={s.zone}>{zone?.name ?? t("allHaiti")}</Text>
            <SymbolView name="chevron.down" size={13} tintColor={MUTED} />
          </Pressable>
          {zone && (
            <Pressable style={s.reset} onPress={() => setZone(null)}>
              <SymbolView name="xmark" size={11} tintColor={MUTED} />
              <Text style={s.resetTxt}>{t("allHaiti")}</Text>
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => router.push("/modal")}>
          <SymbolView name="person.circle" size={27} tintColor={MUTED} />
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  zone: { color: PAPER, fontWeight: "800", fontSize: 16 },
  reset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#16213A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resetTxt: { color: MUTED, fontSize: 11, fontWeight: "600" },
})
