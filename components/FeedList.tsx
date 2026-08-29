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
import { onFeedScroll } from "@/lib/navbar"
import { t, useLang } from "@/lib/i18n"
import { StoriesRow } from "@/components/StoriesRow"
import {
  API_URL,
  GREEN,
  L_BG,
  L_LINE,
  L_SUB,
  L_TXT,
  VERIFIED,
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
    <View style={s.cell}>
      <Pressable style={s.header} onPress={openProfile} disabled={!post.candidateId}>
        <View
          style={[s.avatar, { backgroundColor: isCandidate ? "#E8EDF6" : "#F0F0F0" }]}
        >
          <Text style={[s.avatarTxt, !isCandidate && { color: "#8E8E8E" }]}>
            {initials(post.author)}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={s.author} numberOfLines={1}>
              {post.author}
            </Text>
            {isCandidate && (
              <SymbolView name="checkmark.seal.fill" size={13} tintColor={VERIFIED} />
            )}
          </View>
          <Text style={s.sub} numberOfLines={1}>
            {post.party ? `${post.party} · ` : ""}
            {post.commune}
          </Text>
        </View>
        <SymbolView name="ellipsis" size={17} tintColor={L_TXT} />
      </Pressable>

      {post.images.length > 0 ? (
        post.images.map((uri) => (
          <Image key={uri} source={{ uri }} style={s.photo} />
        ))
      ) : (
        <View style={s.textCanvas}>
          <Text style={s.textCanvasTxt}>{post.body}</Text>
        </View>
      )}

      <View style={s.actions}>
        <SymbolView name="heart" size={24} tintColor={L_TXT} />
        <SymbolView name="bubble.right" size={22} tintColor={L_TXT} />
        <SymbolView name="paperplane" size={22} tintColor={L_TXT} />
        <View style={{ marginLeft: "auto" }}>
          <SymbolView name="bookmark" size={22} tintColor={L_TXT} />
        </View>
      </View>

      <Text style={s.likes}>
        {post.likeCount.toLocaleString("fr-FR")} J&apos;aime
      </Text>

      {post.images.length > 0 && (
        <Text style={s.caption}>
          <Text style={s.captionAuthor}>{post.author.toLowerCase().replace(/\s+/g, "_")} </Text>
          {post.body}
        </Text>
      )}

      {post.project && (
        <View style={s.project}>
          <View style={s.track}>
            <View style={[s.fill, { width: `${pct}%` }]} />
          </View>
          <View style={s.projRow}>
            <Text style={s.projNums} numberOfLines={1}>
              <Text style={{ color: L_TXT, fontWeight: "700" }}>
                {htg(post.project.raisedHTG)}
              </Text>
              <Text style={{ color: L_SUB }}> / {htg(post.project.goalHTG)} HTG</Text>
              <Text style={{ color: "#0B8A5C", fontWeight: "700" }}> · {pct}%</Text>
            </Text>
            <Pressable style={s.givePill}>
              <Text style={s.givePillTxt}>{t("give")}</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={s.comments}>
        {post.commentCount > 0
          ? `Voir les ${post.commentCount} commentaires`
          : ""}
        {"  "}
        <Text style={{ color: "#A8A8A8" }}>{timeAgo(post.createdAt)}</Text>
      </Text>
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
    <View style={{ flex: 1, backgroundColor: L_BG }}>
      {posts === null ? (
        <ActivityIndicator color={L_SUB} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <Card post={item} />}
          ListHeaderComponent={
            !fixedFilter ? (
              <>
                <StoriesRow />
                <View style={s.chips}>
                  {FILTERS.map((f) => (
                    <Pressable
                      key={f.key}
                      onPress={() => setFilter(f.key)}
                      style={[s.chip, filter === f.key && s.chipActive]}
                    >
                      <Text
                        style={[s.chipTxt, filter === f.key && s.chipTxtActive]}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null
          }
          onScroll={(e) => onFeedScroll(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={L_SUB} />
          }
          ListEmptyComponent={
            <Text style={[s.sub, { textAlign: "center", marginTop: 60 }]}>
              {error ?? t("emptyFeed")}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 110 }}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  chips: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EFEFEF",
  },
  chipActive: { backgroundColor: L_TXT },
  chipTxt: { color: L_TXT, fontSize: 13, fontWeight: "600" },
  chipTxtActive: { color: "#fff" },
  cell: { paddingBottom: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#41537B", fontWeight: "800", fontSize: 12 },
  author: { color: L_TXT, fontWeight: "700", fontSize: 14, flexShrink: 1 },
  sub: { color: L_SUB, fontSize: 12 },
  photo: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#F0F0F0" },
  textCanvas: {
    backgroundColor: "#10151D",
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  textCanvasTxt: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 14,
    paddingTop: 11,
  },
  likes: {
    color: L_TXT,
    fontWeight: "700",
    fontSize: 13,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  caption: {
    color: L_TXT,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  captionAuthor: { fontWeight: "700" },
  project: { paddingHorizontal: 14, marginTop: 8 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EFEFEF",
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: GREEN, borderRadius: 2 },
  projRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
    gap: 10,
  },
  projNums: { fontSize: 13, flexShrink: 1 },
  givePill: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  givePillTxt: { color: "#fff", fontWeight: "700", fontSize: 12 },
  comments: {
    color: L_SUB,
    fontSize: 13,
    paddingHorizontal: 14,
    marginTop: 4,
  },
})
