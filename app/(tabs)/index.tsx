import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { FeedList } from "@/components/FeedList"
import { getZone, subscribeZone } from "@/lib/zone"
import { INK, MUTED, PAPER } from "@/constants/theme"

export default function FilScreen() {
  const router = useRouter()
  const [zoneName, setZoneName] = useState(getZone()?.name ?? "Tout Ayiti")

  useEffect(
    () => subscribeZone(() => setZoneName(getZone()?.name ?? "Tout Ayiti")),
    []
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.topbar}>
        <Pressable
          onPress={() => router.push("/kat")}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <Text style={{ fontSize: 16 }}>🇭🇹</Text>
          <Text style={s.zone}>{zoneName}</Text>
          <SymbolView name="chevron.down" size={13} tintColor={MUTED} />
        </Pressable>
        <SymbolView name="person.circle" size={27} tintColor={MUTED} />
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
})
