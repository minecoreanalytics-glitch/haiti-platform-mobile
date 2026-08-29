import { useCallback, useEffect, useState } from "react"
import { useFocusEffect, useRouter } from "expo-router"
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SymbolView } from "expo-symbols"
import { getZone, subscribeZone } from "@/lib/zone"
import { t, useLang } from "@/lib/i18n"
import {
  API_URL,
  CARD,
  GREEN,
  INK,
  LINE,
  MUTED,
  PAPER,
} from "@/constants/theme"

export type FeedPost = {
  id: string
  kind: "PWOJE" | "KANDIDA" | "SITWAYEN"
  body: string
  likeCount: number
  commentCount: number
  createdAt: string
  author: string
  party: string | null
  candidateId?: string | null
  commune: string
  department: string
  images: string[]
  project: {
    title: string
    goalHTG: number
    raisedHTG: number
    contributions: number
  } | null
}

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600_000)
  if (h < 1) return t("now")
  if (h < 24) return `${h}${t("hoursShort")}`
  return `${Math.floor(h / 24)}${t("daysShort")}`
}

const htg = (n: number) => n.toLocaleString("fr-FR")

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export function Card({ post }: { post: FeedPost }) {
  const router = useRouter()
  const isCandidate = post.kind !== "SITWAYEN"
  const pct = post.project
    ? Math.min(100, Math.round((post.project.raisedHTG / post.project.goalHTG) * 100))
    : 0
  const openProfile = () => {
    if (post.candidateId) router.push(`/kandidat/${post.candidateId}`)
  }
  return (
    <View style={s.card}>
      <Pressable
        style={s.row}
        onPress={openProfile}
        disabled={!post.candidateId}
      >
        <View style={[s.avatar, { backgroundColor: isCandidate ? "#233457" : "#1B2438" }]}>
          <Text style={s.avatarTxt}>{initials(post.author)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={s.author} numberOfLines={1}>
              {post.author}
            </Text>
            {isCandidate && (
              <SymbolView name="checkmark.seal.fill" size={15} tintColor="#4C9AFF" />
            )}
          </View>
          <Text style={s.meta} numberOfLines={1}>
            {post.party ? `${post.party} · ` : ""}
            {post.commune} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        {post.kind === "PWOJE" && (
          <View style={s.badgeGreen}>
            <Text style={s.badgeGreenTxt}>{t("badgeProject")}</Text>
          </View>
        )}
      </Pressable>

      <Text style={s.body}>{post.body}</Text>

      {post.images.map((uri) => (
        <Image key={uri} source={{ uri }} style={s.photo} />
      ))}

      {post.project && (
        <View style={s.project}>
          <Text style={s.projectTitle}>{post.project.title}</Text>
          <View style={s.track}>
            <View style={[s.fill, { width: `${pct}%` }]} />
          </View>
          <View style={s.rowBetween}>
            <Text style={s.meta}>
              <Text style={{ color: PAPER, fontWeight: "700" }}>
                {htg(post.project.raisedHTG)} HTG
              </Text>{" "}
              / {htg(post.project.goalHTG)} · {pct}%
            </Text>
            <Text style={s.meta}>
              {post.project.contributions} {t("contributions")}
            </Text>
          </View>
          <Pressable style={s.moncash}>
            <Text style={s.moncashTxt}>{t("give")}</Text>
          </Pressable>
        </View>
      )}

      <View style={s.actions}>
        <View style={s.action}>
          <SymbolView name="heart" size={20} tintColor={MUTED} />
          <Text style={s.actionTxt}>{post.likeCount}</Text>
        </View>
        <View style={s.action}>
          <SymbolView name="bubble.right" size={19} tintColor={MUTED} />
          <Text style={s.actionTxt}>{post.commentCount}</Text>
        </View>
        <View style={[s.action, { marginLeft: "auto" }]}>
          <SymbolView name="square.and.arrow.up" size={19} tintColor={MUTED} />
          <Text style={s.actionTxt}>WhatsApp</Text>
        </View>
      </View>
    </View>
  )
}

export function FeedList({ fixedFilter }: { fixedFilter?: string }) {
  useLang()
  const [filter, setFilter] = useState(fixedFilter ?? "tout")
  const [posts, setPosts] = useState<FeedPost[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const FILTERS = [
    { key: "tout", label: t("chipAll") },
    { key: "pwoje", label: t("chipProjects") },
    { key: "kandida", label: t("chipCandidates") },
    { key: "sitwayen", label: t("chipCitizens") },
  ]

  const load = useCallback(async (f: string) => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (f !== "tout") params.set("f", f)
      const zone = getZone()
      if (zone) params.set("zone", zone.id)
      const qs = params.toString()
      const res = await fetch(`${API_URL}/api/feed${qs ? `?${qs}` : ""}`)
      setPosts(await res.json())
    } catch {
      setError(t("serverError"))
      setPosts([])
    }
  }, [])

  useEffect(() => {
    load(filter)
    return subscribeZone(() => load(filter))
  }, [filter, load])

  useFocusEffect(
    useCallback(() => {
      load(filter)
    }, [filter, load])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load(filter)
    setRefreshing(false)
  }, [filter, load])

  return (
    <View style={{ flex: 1, backgroundColor: INK }}>
      {!fixedFilter && (
        <View style={s.chips}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[s.chip, filter === f.key && s.chipActive]}
            >
              <Text style={[s.chipTxt, filter === f.key && s.chipTxtActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {posts === null ? (
        <ActivityIndicator color={PAPER} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <Card post={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PAPER} />
          }
          ListEmptyComponent={
            <Text style={[s.meta, { textAlign: "center", marginTop: 60 }]}>
              {error ?? t("emptyFeed")}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  chips: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#16213A",
  },
  chipActive: { backgroundColor: PAPER },
  chipTxt: { color: MUTED, fontSize: 13, fontWeight: "600" },
  chipTxtActive: { color: INK },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: LINE,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#9DB4E8", fontWeight: "700", fontSize: 13 },
  author: { color: PAPER, fontWeight: "700", fontSize: 14, flexShrink: 1 },
  meta: { color: MUTED, fontSize: 12 },
  badgeGreen: {
    backgroundColor: "#0D2B22",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeGreenTxt: { color: "#34D399", fontSize: 11, fontWeight: "700" },
  body: { color: PAPER, fontSize: 15, lineHeight: 22, marginTop: 10 },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginTop: 10,
    backgroundColor: CARD,
  },
  project: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
  },
  projectTitle: { color: PAPER, fontWeight: "700", fontSize: 14 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1B2740",
    marginTop: 10,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: GREEN, borderRadius: 3 },
  moncash: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 12,
  },
  moncashTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    marginTop: 12,
  },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionTxt: { color: MUTED, fontSize: 13 },
})
