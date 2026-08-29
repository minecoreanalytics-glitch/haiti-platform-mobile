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
import { API_URL, FLAG_RED, GREEN, MUTED, PAPER } from "@/constants/theme"

export const FEED_BG = "#060608"
const HAIR = "#1B1F26"
const SUBTLE = "#71767B"

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

function Action({
  icon,
  value,
  tint,
}: {
  icon: string
  value?: number | string
  tint?: string
}) {
  return (
    <View style={s.action}>
      <SymbolView name={icon as never} size={17} tintColor={tint ?? SUBTLE} />
      {value !== undefined && (
        <Text style={[s.actionTxt, tint ? { color: tint } : null]}>{value}</Text>
      )}
    </View>
  )
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
      <Pressable onPress={openProfile} disabled={!post.candidateId}>
        <View
          style={[s.avatar, { backgroundColor: isCandidate ? "#1E2A44" : "#181C24" }]}
        >
          <Text style={s.avatarTxt}>{initials(post.author)}</Text>
        </View>
      </Pressable>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Pressable
          onPress={openProfile}
          disabled={!post.candidateId}
          style={s.headline}
        >
          <Text style={s.author} numberOfLines={1}>
            {post.author}
          </Text>
          {isCandidate && (
            <SymbolView name="checkmark.seal.fill" size={14} tintColor="#1D9BF0" />
          )}
          <Text style={s.meta} numberOfLines={1}>
            {post.party ? ` ${post.party}` : ` ${post.commune}`} ·{" "}
            {timeAgo(post.createdAt)}
          </Text>
        </Pressable>

        <Text style={s.body}>{post.body}</Text>

        {post.images.map((uri) => (
          <Image key={uri} source={{ uri }} style={s.photo} />
        ))}

        {post.project && (
          <View style={s.project}>
            <View style={s.track}>
              <View style={[s.fill, { width: `${pct}%` }]} />
            </View>
            <View style={s.projRow}>
              <Text style={s.projNums} numberOfLines={1}>
                <Text style={{ color: PAPER, fontWeight: "700" }}>
                  {htg(post.project.raisedHTG)}
                </Text>
                <Text style={s.meta}> / {htg(post.project.goalHTG)} HTG</Text>
                <Text style={{ color: GREEN, fontWeight: "700" }}> · {pct}%</Text>
              </Text>
              <Pressable style={s.givePill}>
                <Text style={s.givePillTxt}>{t("give")}</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={s.actions}>
          <Action icon="bubble.left" value={post.commentCount} />
          <Action icon="arrow.2.squarepath" value={12} />
          <Action icon="heart" value={post.likeCount} />
          <Action icon="square.and.arrow.up" />
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
    <View style={{ flex: 1, backgroundColor: FEED_BG }}>
      {!fixedFilter && (
        <View style={s.tabs}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={s.tab}
            >
              <Text style={[s.tabTxt, filter === f.key && s.tabTxtActive]}>
                {f.label}
              </Text>
              <View style={[s.tabBar, filter === f.key && s.tabBarActive]} />
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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIR,
  },
  tab: { flex: 1, alignItems: "center" },
  tabTxt: {
    color: SUBTLE,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 12,
  },
  tabTxtActive: { color: PAPER, fontWeight: "800" },
  tabBar: { height: 3, width: 44, borderRadius: 2, backgroundColor: "transparent" },
  tabBarActive: { backgroundColor: FLAG_RED },
  cell: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIR,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#8FA6D8", fontWeight: "700", fontSize: 13 },
  headline: { flexDirection: "row", alignItems: "center", gap: 4 },
  author: { color: PAPER, fontWeight: "700", fontSize: 15, flexShrink: 1 },
  meta: { color: SUBTLE, fontSize: 13, flexShrink: 1 },
  body: { color: "#E7E9EA", fontSize: 15, lineHeight: 21, marginTop: 2 },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 14,
    marginTop: 10,
    backgroundColor: "#101318",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIR,
  },
  project: { marginTop: 10 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1C2733",
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: GREEN, borderRadius: 2 },
  projRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 10,
  },
  projNums: { fontSize: 13, flexShrink: 1 },
  givePill: {
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  givePillTxt: { color: "#04140D", fontWeight: "800", fontSize: 12 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 4,
    paddingRight: 32,
  },
  action: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionTxt: { color: SUBTLE, fontSize: 12 },
})
