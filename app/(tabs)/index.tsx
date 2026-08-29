import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { SymbolView } from "expo-symbols"
import { FeedList } from "@/components/FeedList"
import { INK, MUTED, PAPER } from "@/constants/theme"

export default function FilScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.topbar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 16 }}>🇭🇹</Text>
          <Text style={s.zone}>Tout Ayiti</Text>
          <SymbolView name="chevron.down" size={13} tintColor={MUTED} />
        </View>
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
