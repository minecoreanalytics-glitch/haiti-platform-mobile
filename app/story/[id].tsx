import { useCallback, useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import type { FeedPost } from "@/components/FeedList"
import { t, useLang } from "@/lib/i18n"
import { API_URL, GREEN, VERIFIED } from "@/constants/theme"

const DURATION = 6000
const FRESH_MS = 24 * 3600_000

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600_000)
  if (h < 1) return t("now")
  return `${h}${t("hoursShort")}`
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

export default function StoryScreen() {
  useLang()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [items, setItems] = useState<FeedPost[] | null>(null)
  const [index, setIndex] = useState(0)
  const progress = useRef(new Animated.Value(0)).current
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    const url =
      id === "ayiti"
        ? `${API_URL}/api/feed`
        : `${API_URL}/api/kandida/${id}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        const posts: FeedPost[] = id === "ayiti" ? d : d.posts
        const fresh = posts.filter(
          (p) => Date.now() - new Date(p.createdAt).getTime() < FRESH_MS
        )
        setItems(fresh.length > 0 ? fresh.slice(0, 8) : posts.slice(0, 3))
      })
      .catch(() => setItems([]))
  }, [id])

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (items && i < items.length - 1) return i + 1
      router.back()
      return i
    })
  }, [items, router])

  const goPrev = () => setIndex((i) => Math.max(0, i - 1))

  useEffect(() => {
    if (!items || items.length === 0) return
    progress.setValue(0)
    animRef.current?.stop()
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      useNativeDriver: false,
    })
    animRef.current.start(({ finished }) => {
      if (finished) goNext()
    })
    return () => animRef.current?.stop()
  }, [index, items, progress, goNext])

  const post = items?.[index]
  const W = Dimensions.get("window").width

  return (
    <View style={s.root}>
      {items !== null && items.length === 0 ? (
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff" }}>{t("emptyFeed")}</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <SymbolView name="xmark.circle.fill" size={32} tintColor="#fff" />
          </Pressable>
        </SafeAreaView>
      ) : !post ? null : (
        <>
          {post.images[0] ? (
            <Image
              source={{ uri: post.images[0] }}
              style={StyleSheet.absoluteFill as object}
              resizeMode="cover"
              blurRadius={30}
            />
          ) : null}
          <View style={s.dim} />

          <View style={{ flex: 1, paddingTop: insets.top + 6 }}>
            <View style={s.bars}>
              {items!.map((_, i) => (
                <View key={i} style={s.barTrack}>
                  <Animated.View
                    style={[
                      s.barFill,
                      {
                        width:
                          i < index
                            ? "100%"
                            : i === index
                              ? progress.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ["0%", "100%"],
                                })
                              : "0%",
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            <View style={s.header}>
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>
                  {id === "ayiti" ? "🇭🇹" : initials(post.author)}
                </Text>
              </View>
              <Text style={s.author} numberOfLines={1}>
                {id === "ayiti" ? t("allHaiti") : post.author}
              </Text>
              {post.kind !== "SITWAYEN" && id !== "ayiti" && (
                <SymbolView name="checkmark.seal.fill" size={14} tintColor={VERIFIED} />
              )}
              <Text style={s.time}>{timeAgo(post.createdAt)}</Text>
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                style={{ marginLeft: "auto" }}
              >
                <SymbolView name="xmark" size={20} tintColor="#fff" />
              </Pressable>
            </View>

            <View style={s.content}>
              {post.images[0] ? (
                <Image
                  source={{ uri: post.images[0] }}
                  style={{ width: W, aspectRatio: 4 / 3 }}
                  resizeMode="cover"
                />
              ) : null}
              <Text style={[s.body, !post.images[0] && s.bodyBig]}>
                {post.body}
              </Text>
              {id === "ayiti" && (
                <Text style={s.byline}>
                  — {post.author}
                  {post.party ? ` · ${post.party}` : ""} · {post.commune}
                </Text>
              )}
            </View>

            {post.project && (
              <View style={s.projectWrap}>
                <View style={s.track}>
                  <View
                    style={[
                      s.fill,
                      {
                        width: `${Math.min(100, Math.round((post.project.raisedHTG / post.project.goalHTG) * 100))}%`,
                      },
                    ]}
                  />
                </View>
                <View style={s.projRow}>
                  <Text style={s.projTxt}>
                    {htg(post.project.raisedHTG)} /{" "}
                    {htg(post.project.goalHTG)} HTG
                  </Text>
                  <Pressable style={s.give}>
                    <Text style={s.giveTxt}>{t("give")}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <Pressable style={s.tapLeft} onPress={goPrev} />
          <Pressable style={s.tapRight} onPress={goNext} />
        </>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  dim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  bars: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  author: { color: "#fff", fontWeight: "700", fontSize: 14, flexShrink: 1 },
  time: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  content: { flex: 1, justifyContent: "center" },
  body: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    fontWeight: "600",
  },
  bodyBig: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  byline: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  projectWrap: { paddingHorizontal: 20, paddingBottom: 24 },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: GREEN },
  projRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  projTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  give: {
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  giveTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  tapLeft: {
    position: "absolute",
    left: 0,
    top: 100,
    bottom: 120,
    width: "30%",
  },
  tapRight: {
    position: "absolute",
    right: 0,
    top: 100,
    bottom: 120,
    width: "70%",
  },
})
