import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { API_URL, CARD, INK, LINE, MUTED, PAPER } from "@/constants/theme"

type Kandida = {
  id: string
  name: string
  party: string | null
  commune: string | null
  department: string | null
  office: string
  posts: number
  projects: number
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export default function KandidaScreen() {
  const router = useRouter()
  const [list, setList] = useState<Kandida[] | null>(null)

  const load = useCallback(() => {
    fetch(`${API_URL}/api/kandida`)
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
  }, [])

  useEffect(load, [load])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.head}>
        <Text style={s.title}>Kandida</Text>
        <Text style={s.sub}>Kandida verifye pou eleksyon 2026 yo</Text>
      </View>
      {list === null ? (
        <ActivityIndicator color={PAPER} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(k) => k.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <Text style={[s.sub, { textAlign: "center", marginTop: 40 }]}>
              Poko gen kandida verifye.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={s.card}
              onPress={() => router.push(`/kandida/${item.id}`)}
            >
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>{initials(item.name)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={s.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <SymbolView
                    name="checkmark.seal.fill"
                    size={15}
                    tintColor="#4C9AFF"
                  />
                </View>
                <Text style={s.meta} numberOfLines={1}>
                  {item.party ? `${item.party} · ` : ""}
                  {item.office}
                </Text>
                <Text style={s.meta2} numberOfLines={1}>
                  {item.commune}, {item.department} · {item.posts} pòs ·{" "}
                  {item.projects} pwojè
                </Text>
              </View>
              <SymbolView name="chevron.right" size={14} tintColor={MUTED} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { color: PAPER, fontWeight: "800", fontSize: 20 },
  sub: { color: MUTED, fontSize: 12, marginTop: 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    padding: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#233457",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#9DB4E8", fontWeight: "800", fontSize: 15 },
  name: { color: PAPER, fontWeight: "700", fontSize: 15, flexShrink: 1 },
  meta: { color: MUTED, fontSize: 12, marginTop: 2 },
  meta2: { color: "#5E6C86", fontSize: 11, marginTop: 2 },
})
