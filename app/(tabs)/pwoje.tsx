import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, Text, View } from "react-native"
import { FeedList } from "@/components/FeedList"
import { INK, PAPER } from "@/constants/theme"

export default function PwojeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.head}>
        <Text style={s.title}>Pwojè</Text>
      </View>
      <FeedList fixedFilter="pwoje" />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingVertical: 10 },
  title: { color: PAPER, fontWeight: "800", fontSize: 20 },
})
