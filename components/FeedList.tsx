import { useCallback, useEffect, useState } from "react"
import { useFocusEffect, useRouter } from "expo-router"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SymbolView } from "expo-symbols"
import { getZone, subscribeZone } from "@/lib/zone"
import { onFeedScroll } from "@/lib/navbar"
import { getPseudonym } from "@/lib/identity"
import { t, useLang, type StringKey } from "@/lib/i18n"
import { StoriesRow } from "@/components/StoriesRow"
import {
  API_URL,
  GREEN,
  L_BG,
  L_LINE,
  L_SUB,
  L_TXT,
  PUBLIC_URL,
  VERIFIED,
} from "@/constants/theme"

export type IssueCategory =
  | "DLO"
  | "WOUT"
  | "KOURAN"
  | "LEKOL"
  | "SANTE"
  | "FATRA"
  | "SEKIRITE"
  | "LOT"

export const CATEGORIES: { key: IssueCategory; icon: string }[] = [
  { key: "DLO", icon: "drop.fill" },
  { key: "WOUT", icon: "road.lanes" },
  { key: "KOURAN", icon: "bolt.fill" },
  { key: "LEKOL", icon: "book.fill" },
  { key: "SANTE", icon: "cross.case.fill" },
  { key: "FATRA", icon: "trash.fill" },
  { key: "SEKIRITE", icon: "shield.fill" },
  { key: "LOT", icon: "ellipsis.circle.fill" },
]

export const catIcon = (c: IssueCategory) =>
  CATEGORIES.find((x) => x.key === c)?.icon ?? "ellipsis.circle.fill"
export const catLabel = (c: IssueCategory) => t(`cat${c}` as StringKey)

export type FeedPost = {
  id: string
  kind: "PWOJE" | "KANDIDA" | "SITWAYEN"
  action: "SIYALMAN" | "KESYON" | null
  category: IssueCategory | null
  issueStatus: "SIYALE" | "PRIS_AN_CHAJ" | "REZOLI" | null
  body: string
  confirmCount: number
  commentCount: number
  createdAt: string
  author: string
  party: string | null
  candidateId?: string | null
  commune: string
  department: string
  images: string[]
  project?: null
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
    .replace(/_/g, " ")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

const REPORT_REASONS = [
  "SPAM",
  "FO_ENFO",
  "AGRESYON",
  "IDANTITE",
  "LOT",
] as const

export function Card({ post }: { post: FeedPost }) {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const [count, setCount] = useState(post.confirmCount)
  const isCandidate = post.kind !== "SITWAYEN"
  const isIssue = post.action === "SIYALMAN"

  const openProfile = () => {
    if (post.candidateId) router.push(`/kandidat/${post.candidateId}`)
  }

  const toggleConfirm = async () => {
    const next = !confirmed
    setConfirmed(next)
    setCount((c) => c + (next ? 1 : -1))
    try {
      const res = await fetch(`${API_URL}/api/posts/${post.id}/confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pseudonym: getPseudonym() }),
      })
      const j = await res.json()
      setConfirmed(j.confirmed)
      setCount(j.confirmCount)
    } catch {
      setConfirmed(!next)
      setCount((c) => c + (next ? -1 : 1))
    }
  }

  // WhatsApp est le vrai réseau en Haïti : un signalement qui ne circule pas
  // ne met aucune pression. Le partage n'est pas décoratif, c'est la diffusion.
  const share = async () => {
    const head = `${t("shareIssueIntro")} · ${post.commune}`
    const witnesses =
      count > 0 ? `\n${count} ${t("shareWitnesses")}.` : ""
    try {
      await Share.share({
        message: `${head}\n\n"${post.body}"${witnesses}\n${t("shareAsk")} :\n${PUBLIC_URL}/p/${post.id}`,
      })
    } catch {
      // partage annulé
    }
  }

  const report = () => {
    Alert.alert(t("report"), undefined, [
      ...REPORT_REASONS.map((r) => ({
        text: t(`reason${r}` as StringKey),
        onPress: async () => {
          await fetch(`${API_URL}/api/reports`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ postId: post.id, reason: r }),
          }).catch(() => null)
          Alert.alert(t("reportSent"))
        },
      })),
      { text: t("cancel"), style: "cancel" as const },
    ])
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
            {post.commune} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        <Pressable onPress={report} hitSlop={10}>
          <SymbolView name="ellipsis" size={17} tintColor={L_TXT} />
        </Pressable>
      </Pressable>

      {post.category && (
        <View style={s.catRow}>
          <View style={s.catChip}>
            <SymbolView name={catIcon(post.category) as never} size={12} tintColor="#374151" />
            <Text style={s.catTxt}>{catLabel(post.category)}</Text>
          </View>
          {isIssue && post.issueStatus && (
            <View
              style={[
                s.statusChip,
                post.issueStatus === "REZOLI" && { backgroundColor: "#DCFCE7" },
              ]}
            >
              <Text
                style={[
                  s.statusTxt,
                  post.issueStatus === "REZOLI" && { color: "#166534" },
                ]}
              >
                {t(`status${post.issueStatus}` as StringKey)}
              </Text>
            </View>
          )}
        </View>
      )}

      <Text style={s.body}>{post.body}</Text>

      {post.images.map((uri) => (
        <View key={uri}>
          <Image source={{ uri }} style={s.photo} />
          <View style={s.aiTag}>
            <Text style={s.aiTagTxt}>{t("aiImage")}</Text>
          </View>
        </View>
      ))}

      <View style={s.actions}>
        <Pressable style={s.confirmBtn} onPress={toggleConfirm}>
          <SymbolView
            name={confirmed ? "checkmark.seal.fill" : "checkmark.seal"}
            size={19}
            tintColor={confirmed ? "#0B8A5C" : L_TXT}
          />
          <Text style={[s.confirmTxt, confirmed && { color: "#0B8A5C" }]}>
            {confirmed ? t("confirmed") : t("confirm")}
          </Text>
        </Pressable>
        <Text style={s.witnesses}>
          {count.toLocaleString("fr-FR")}{" "}
          {count > 1 ? t("witnesses") : t("witness1")}
        </Text>
        <Pressable style={s.iconBtn}>
          <SymbolView name="bubble.right" size={18} tintColor={L_SUB} />
          <Text style={s.sub}>{post.commentCount}</Text>
        </Pressable>
        <Pressable style={[s.shareBtn, { marginLeft: "auto" }]} onPress={share}>
          <SymbolView name="square.and.arrow.up" size={17} tintColor="#0B8A5C" />
          <Text style={s.shareTxt}>{t("share")}</Text>
        </Pressable>
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
                      <Text style={[s.chipTxt, filter === f.key && s.chipTxtActive]}>
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
  chips: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EFEFEF",
  },
  chipActive: { backgroundColor: L_TXT },
  chipTxt: { color: L_TXT, fontSize: 13, fontWeight: "600" },
  chipTxtActive: { color: "#fff" },
  cell: {
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: L_LINE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  catRow: { flexDirection: "row", gap: 6, paddingHorizontal: 14, marginBottom: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F1F3F5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  catTxt: { color: "#374151", fontSize: 11, fontWeight: "700" },
  statusChip: {
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  statusTxt: { color: "#92400E", fontSize: 11, fontWeight: "700" },
  body: {
    color: L_TXT,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  photo: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#F0F0F0" },
  aiTag: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  aiTagTxt: { color: "#fff", fontSize: 9, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 11,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: L_LINE,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  confirmTxt: { color: L_TXT, fontWeight: "700", fontSize: 13 },
  witnesses: { color: L_SUB, fontSize: 12 },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E7F6EF",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  shareTxt: { color: "#0B8A5C", fontWeight: "700", fontSize: 12 },
  project: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: L_LINE,
    backgroundColor: "#FAFAFA",
  },
  projectTitle: { color: L_TXT, fontWeight: "700", fontSize: 13 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EFEFEF",
    overflow: "hidden",
    marginTop: 9,
  },
  fill: { height: "100%", backgroundColor: GREEN, borderRadius: 2 },
  projMeta: { color: L_SUB, fontSize: 12, marginTop: 7 },
  closedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#EFEFEF",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },
  closedTxt: { color: "#6B7280", fontSize: 11, fontWeight: "600" },
})
