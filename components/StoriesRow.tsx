import { useEffect, useState } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { SymbolView } from "expo-symbols"
import { t, useLang } from "@/lib/i18n"
import { API_URL, L_LINE, L_TXT } from "@/constants/theme"

const FRESH_MS = 24 * 3600_000

type Kandida = { id: string; name: string }
type FeedLite = { candidateId?: string | null; createdAt: string }

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function Ring({
  fresh,
  children,
}: {
  fresh: boolean
  children: React.ReactNode
}) {
  if (fresh) {
    return (
      <LinearGradient
        colors={["#E8283F", "#F77737", "#FCAF45"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={s.ring}
      >
        <View style={s.inner}>{children}</View>
      </LinearGradient>
    )
  }
  return (
    <View style={[s.ring, s.ringSeen]}>
      <View style={s.inner}>{children}</View>
    </View>
  )
}

export function StoriesRow() {
  useLang()
  const router = useRouter()
  const [candidates, setCandidates] = useState<Kandida[]>([])
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())
  const [anyFresh, setAnyFresh] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/kandida`).then((r) => r.json()),
      fetch(`${API_URL}/api/feed`).then((r) => r.json()),
    ])
      .then(([kands, feed]: [Kandida[], FeedLite[]]) => {
        const fresh = feed.filter(
          (p) => Date.now() - new Date(p.createdAt).getTime() < FRESH_MS
        )
        setAnyFresh(fresh.length > 0)
        setFreshIds(
          new Set(
            fresh
              .map((p) => p.candidateId)
              .filter((x): x is string => Boolean(x))
          )
        )
        setCandidates(kands)
      })
      .catch(() => null)
  }, [])

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.wrap}
      contentContainerStyle={s.row}
    >
      <Pressable style={s.item} onPress={() => router.push("/poste")}>
        <View style={s.meWrap}>
          <View style={s.meCircle}>
            <SymbolView name="person.fill" size={26} tintColor="#A8A8A8" />
          </View>
          <View style={s.plus}>
            <SymbolView name="plus" size={11} tintColor="#fff" />
          </View>
        </View>
        <Text style={s.label} numberOfLines={1}>
          {t("postTitle")}
        </Text>
      </Pressable>

      <Pressable
        style={s.item}
        onPress={() => anyFresh && router.push("/story/ayiti")}
      >
        <Ring fresh={anyFresh}>
          <Text style={{ fontSize: 26 }}>🇭🇹</Text>
        </Ring>
        <Text style={s.label} numberOfLines={1}>
          {t("allHaiti")}
        </Text>
      </Pressable>

      {candidates.map((k) => {
        const fresh = freshIds.has(k.id)
        return (
          <Pressable
            key={k.id}
            style={s.item}
            onPress={() =>
              router.push(fresh ? `/story/${k.id}` : `/kandidat/${k.id}`)
            }
          >
            <Ring fresh={fresh}>
              <Text style={s.initials}>{initials(k.name)}</Text>
            </Ring>
            <Text style={s.label} numberOfLines={1}>
              {k.name.split(" ")[0]}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: L_LINE,
  },
  row: { gap: 14, paddingHorizontal: 14, paddingVertical: 10 },
  item: { alignItems: "center", width: 72 },
  meWrap: { width: 68, height: 68 },
  meCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: L_LINE,
  },
  plus: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0095F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  ring: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSeen: {
    borderWidth: 1.5,
    borderColor: "#C7C7CC",
  },
  inner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8EDF6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  initials: { color: "#41537B", fontWeight: "800", fontSize: 17 },
  label: { color: L_TXT, fontSize: 11, marginTop: 5, maxWidth: 72 },
})
