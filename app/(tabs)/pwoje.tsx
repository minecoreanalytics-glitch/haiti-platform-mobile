import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect, useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import type { FeedPost } from "@/components/FeedList"
import { t, useLang } from "@/lib/i18n"
import { API_URL, CARD, GREEN, INK, LINE, MUTED, PAPER } from "@/constants/theme"

const htg = (n: number) => n.toLocaleString("fr-FR")

function ProjectCard({ post }: { post: FeedPost }) {
  const router = useRouter()
  const p = post.project!
  const pct = Math.min(100, Math.round((p.raisedHTG / p.goalHTG) * 100))
  return (
    <View style={s.card}>
      {post.images[0] && (
        <Image source={{ uri: post.images[0] }} style={s.photo} />
      )}
      <View style={{ padding: 16 }}>
        <Text style={s.title}>{p.title}</Text>
        <Pressable
          style={s.byline}
          onPress={() =>
            post.candidateId && router.push(`/kandidat/${post.candidateId}`)
          }
        >
          <Text style={s.meta}>
            {t("by")} <Text style={{ color: PAPER }}>{post.author}</Text>
          </Text>
          <SymbolView name="checkmark.seal.fill" size={13} tintColor="#4C9AFF" />
          <Text style={s.meta}>· {post.commune}</Text>
        </Pressable>

        <View style={s.track}>
          <View style={[s.fill, { width: `${pct}%` }]} />
        </View>
        <View style={s.numbers}>
          <Text style={s.raised}>
            {htg(p.raisedHTG)} <Text style={s.htg}>HTG {t("collected")}</Text>
          </Text>
          <Text style={s.pct}>{pct}%</Text>
        </View>
        <Text style={s.goal}>
          {t("goal")}: {htg(p.goalHTG)} HTG · {p.contributions}{" "}
          {t("contributions")}
        </Text>
        <Pressable style={s.cta}>
          <Text style={s.ctaTxt}>{t("give")}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function PwojeScreen() {
  useLang()
  const [posts, setPosts] = useState<FeedPost[] | null>(null)

  const load = useCallback(() => {
    fetch(`${API_URL}/api/feed?f=pwoje`)
      .then((r) => r.json())
      .then((list: FeedPost[]) =>
        setPosts(
          [...list.filter((p) => p.project)].sort(
            (a, b) =>
              b.project!.raisedHTG / b.project!.goalHTG -
              a.project!.raisedHTG / a.project!.goalHTG
          )
        )
      )
      .catch(() => setPosts([]))
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const total = (posts ?? []).reduce((s, p) => s + (p.project?.raisedHTG ?? 0), 0)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.head}>
        <Text style={s.headTitle}>{t("projectsTitle")}</Text>
        <Text style={s.sub}>{t("projectsSub")}</Text>
        {posts !== null && posts.length > 0 && (
          <View style={s.totalRow}>
            <SymbolView name="banknote.fill" size={17} tintColor={GREEN} />
            <Text style={s.total}>
              {htg(total)} HTG {t("collected")}
            </Text>
          </View>
        )}
      </View>
      {posts === null ? (
        <ActivityIndicator color={PAPER} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ProjectCard post={item} />}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <Text style={[s.meta, { textAlign: "center", marginTop: 40 }]}>
              {t("noProjects")}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  headTitle: { color: PAPER, fontWeight: "800", fontSize: 20 },
  sub: { color: MUTED, fontSize: 12, marginTop: 2 },
  totalRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 10 },
  total: { color: GREEN, fontWeight: "800", fontSize: 15 },
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    overflow: "hidden",
  },
  photo: { width: "100%", aspectRatio: 16 / 9 },
  title: { color: PAPER, fontWeight: "800", fontSize: 16, lineHeight: 22 },
  byline: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  meta: { color: MUTED, fontSize: 12 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1B2740",
    marginTop: 14,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: GREEN, borderRadius: 4 },
  numbers: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 10,
  },
  raised: { color: PAPER, fontWeight: "800", fontSize: 18 },
  htg: { color: MUTED, fontWeight: "400", fontSize: 12 },
  pct: { color: GREEN, fontWeight: "800", fontSize: 16 },
  goal: { color: MUTED, fontSize: 12, marginTop: 3 },
  cta: {
    backgroundColor: GREEN,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },
})
