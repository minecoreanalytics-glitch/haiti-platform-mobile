import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { Card, type FeedPost } from "@/components/FeedList"
import { API_URL, CARD, FLAG_RED, INK, LINE, MUTED, PAPER } from "@/constants/theme"

type Detail = {
  id: string
  name: string
  party: string | null
  commune: string | null
  department: string | null
  office: string
  biography: string | null
  programSummary: string | null
  topPriorities: string[]
  posts: FeedPost[]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export default function KandidaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [d, setD] = useState<Detail | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/kandida/${id}`)
      .then((r) => r.json())
      .then(setD)
      .catch(() => null)
  }, [id])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <SymbolView name="chevron.left" size={17} tintColor={PAPER} />
        </Pressable>
        <Text style={s.navTitle}>Pwofil kandida</Text>
        <View style={{ width: 32 }} />
      </View>

      {!d ? (
        <ActivityIndicator color={PAPER} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={d.posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <Card post={item} />}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListHeaderComponent={
            <View style={s.header}>
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>{initials(d.name)}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={s.name}>{d.name}</Text>
                <SymbolView name="checkmark.seal.fill" size={18} tintColor="#4C9AFF" />
              </View>
              <Text style={s.meta}>
                {d.party ? `${d.party} · ` : ""}
                {d.office}
              </Text>
              <Text style={s.meta}>
                {d.commune}, {d.department}
              </Text>

              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statVal}>{d.posts.length}</Text>
                  <Text style={s.statLbl}>Pòs</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statVal}>
                    {d.posts.filter((p) => p.kind === "PWOJE").length}
                  </Text>
                  <Text style={s.statLbl}>Pwojè</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statVal, { color: "#4C9AFF" }]}>✓</Text>
                  <Text style={s.statLbl}>Verifye</Text>
                </View>
              </View>

              {d.programSummary && (
                <View style={s.bio}>
                  <Text style={s.bioTitle}>Pwogram</Text>
                  <Text style={s.bioTxt}>{d.programSummary}</Text>
                </View>
              )}
              {d.topPriorities.length > 0 && (
                <View style={s.bio}>
                  <Text style={s.bioTitle}>Priyorite</Text>
                  {d.topPriorities.map((p) => (
                    <Text key={p} style={s.bioTxt}>
                      · {p}
                    </Text>
                  ))}
                </View>
              )}
              <Pressable style={s.ask}>
                <SymbolView name="questionmark.bubble" size={17} tintColor={PAPER} />
                <Text style={s.askTxt}>Poze yon kesyon piblik</Text>
              </Pressable>
              <Text style={s.sectionTitle}>Aktivite</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[s.meta, { textAlign: "center", marginTop: 20 }]}>
              Poko gen pòs.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { color: MUTED, fontSize: 13, fontWeight: "600" },
  header: { alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#233457",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarTxt: { color: "#9DB4E8", fontWeight: "800", fontSize: 26 },
  name: { color: PAPER, fontWeight: "800", fontSize: 20 },
  meta: { color: MUTED, fontSize: 12, marginTop: 3, textAlign: "center" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    alignSelf: "stretch",
  },
  stat: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    alignItems: "center",
    paddingVertical: 10,
  },
  statVal: { color: PAPER, fontWeight: "800", fontSize: 17 },
  statLbl: { color: MUTED, fontSize: 10, marginTop: 2, letterSpacing: 1 },
  bio: {
    alignSelf: "stretch",
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    padding: 14,
    marginTop: 12,
  },
  bioTitle: {
    color: MUTED,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  bioTxt: { color: PAPER, fontSize: 13, lineHeight: 20 },
  ask: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: FLAG_RED,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  askTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },
  sectionTitle: {
    alignSelf: "flex-start",
    color: PAPER,
    fontWeight: "800",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 4,
  },
})
