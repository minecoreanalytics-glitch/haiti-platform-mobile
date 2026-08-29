import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, Text, View } from "react-native"
import { INK, MUTED, PAPER } from "@/constants/theme"

export default function Screen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.head}>
        <Text style={s.title}>Kat</Text>
      </View>
      <View style={s.center}>
        <Text style={s.msg}>Kat entèaktif la ap vini nan pwochen vèsyon an.</Text>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingVertical: 10 },
  title: { color: PAPER, fontWeight: "800", fontSize: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  msg: { color: MUTED, fontSize: 14, textAlign: "center" },
})
