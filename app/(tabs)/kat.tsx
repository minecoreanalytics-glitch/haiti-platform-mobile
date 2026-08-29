import { useEffect, useMemo, useState } from "react"
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg"
import { SymbolView } from "expo-symbols"
import { GEO_COMMUNES, GEO_VIEWBOX } from "@/lib/haiti-geo"
import {
  CHILD_RATIO,
  DEMOGRAPHICS_SOURCE,
  DEPT_POPULATION,
  FEMALE_RATIO,
  VOTER_RATIO,
} from "@/lib/haiti-demographics"
import { setZone } from "@/lib/zone"
import { API_URL, FLAG_RED, INK, LINE, MUTED, PAPER, SHEET } from "@/constants/theme"

type DeptInfo = {
  communes: number
  candidates: number
  posts: number
  projects: number
  topCommune: string | null
  topProject: { title: string; pct: number } | null
}

type MapData = {
  national: DeptInfo
  depts: Record<string, DeptInfo>
  communes: { id: string; name: string; dept: string; postCount: number }[]
}

const DEPT_COLORS: Record<string, string> = {
  Ouest: "#7C6CFF",
  Nord: "#FF4D8D",
  "Nord-Est": "#B8E64A",
  "Nord-Ouest": "#B07CFF",
  Artibonite: "#3EC1F5",
  Centre: "#2FE0C0",
  Sud: "#33D999",
  "Sud-Est": "#FF8A3D",
  "Grand'Anse": "#12B981",
  Nippes: "#FFC53D",
}
const FALLBACK = "#5A6B85"
const NATIONAL_POP = Object.values(DEPT_POPULATION).reduce((a, b) => a + b, 0)
const [, , VB_W, VB_H] = GEO_VIEWBOX.split(" ").map(Number)

function fmt(n: number) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return (m >= 10 ? m.toFixed(1) : m.toFixed(2)).replace(".", ",") + " M"
  }
  if (n >= 10_000) return Math.round(n / 1000).toLocaleString("fr-FR") + " k"
  return Math.round(n).toLocaleString("fr-FR")
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ width: "30%" }}>
      <Text style={[s.statVal, accent && { color: FLAG_RED }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  )
}

export default function KatScreen() {
  const router = useRouter()
  const [data, setData] = useState<MapData | null>(null)
  const [dept, setDept] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/map`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  const byId = useMemo(
    () => new Map((data?.communes ?? []).map((c) => [c.id, c])),
    [data]
  )
  const departments = useMemo(
    () =>
      [...new Set(GEO_COMMUNES.map((g) => g.dept).filter(Boolean))].sort() as string[],
    []
  )
  const selectedGeo = selectedId
    ? GEO_COMMUNES.find((g) => g.id === selectedId) ?? null
    : null
  const selectedDb = selectedId ? byId.get(selectedId) : null

  const { transform, scale } = useMemo(() => {
    if (!dept) return { transform: undefined, scale: 1 }
    const boxes = GEO_COMMUNES.filter((g) => g.dept === dept).map((g) => g.b)
    const x0 = Math.min(...boxes.map((b) => b[0]))
    const y0 = Math.min(...boxes.map((b) => b[1]))
    const x1 = Math.max(...boxes.map((b) => b[2]))
    const y1 = Math.max(...boxes.map((b) => b[3]))
    const sc = Math.min(VB_W / (x1 - x0), VB_H / (y1 - y0)) * 0.82
    const tx = VB_W / 2 - ((x0 + x1) / 2) * sc
    const ty = VB_H / 2 - ((y0 + y1) / 2) * sc
    return { transform: `translate(${tx}, ${ty}) scale(${sc})`, scale: sc }
  }, [dept])

  const colorOf = (d: string | null) => (d ? DEPT_COLORS[d] ?? FALLBACK : FALLBACK)

  const openDept = (d: string | null) => {
    setSelectedId(null)
    setDept(d)
    setExpanded(false)
  }

  const onShape = (g: (typeof GEO_COMMUNES)[number]) => {
    if (!dept || g.dept !== dept) {
      if (g.dept) openDept(g.dept)
      return
    }
    if (g.id) setSelectedId(g.id)
  }

  const chooseZone = () => {
    if (!selectedGeo?.id) return
    setZone({ id: selectedGeo.id, name: selectedGeo.name })
    router.push("/")
  }

  const info: DeptInfo | null = data
    ? dept
      ? data.depts[dept] ?? data.national
      : data.national
    : null
  const pop = dept ? DEPT_POPULATION[dept] ?? NATIONAL_POP : NATIONAL_POP
  const title = dept ?? "Ayiti"

  const W = Dimensions.get("window").width

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <View style={s.head}>
        {dept ? (
          <Pressable onPress={() => openDept(null)} style={s.backBtn}>
            <SymbolView name="chevron.left" size={15} tintColor={MUTED} />
            <Text style={{ color: MUTED, fontWeight: "600" }}>Ayiti</Text>
          </Pressable>
        ) : (
          <Text style={s.title}>Ki kote w ye?</Text>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.chips}
      >
        {departments.map((d) => (
          <Pressable
            key={d}
            onPress={() => openDept(dept === d ? null : d)}
            style={[
              s.chip,
              dept === d && { backgroundColor: colorOf(d) },
            ]}
          >
            <Text
              style={[s.chipTxt, dept === d && { color: INK, fontWeight: "800" }]}
            >
              {d}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>
        <Svg
          width={W}
          height="100%"
          viewBox={GEO_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
        >
          <G transform={transform}>
            {GEO_COMMUNES.map((g, i) => {
              const dimmed = dept !== null && g.dept !== dept
              const isSel = g.id !== null && g.id === selectedId
              return (
                <Path
                  key={g.id ?? `x${i}`}
                  d={g.d}
                  fill={colorOf(g.dept)}
                  fillOpacity={dimmed ? 0.05 : isSel ? 1 : 0.75}
                  stroke={isSel ? PAPER : INK}
                  strokeWidth={(isSel ? 1.4 : 0.7) / scale}
                  onPress={() => onShape(g)}
                />
              )
            })}
            {GEO_COMMUNES.map((g) => {
              const db = g.id ? byId.get(g.id) : null
              if (!db || db.postCount === 0) return null
              if (dept !== null && g.dept !== dept) return null
              const r = 7 / scale
              return (
                <G key={`b-${g.id}`} onPress={() => onShape(g)}>
                  <Circle
                    cx={g.cx}
                    cy={g.cy}
                    r={r}
                    fill={PAPER}
                    stroke={INK}
                    strokeWidth={1.2 / scale}
                  />
                  <SvgText
                    x={g.cx}
                    y={g.cy + 3 / scale}
                    textAnchor="middle"
                    fill={INK}
                    fontSize={9 / scale}
                    fontWeight="800"
                  >
                    {String(db.postCount)}
                  </SvgText>
                </G>
              )
            })}
          </G>
        </Svg>
      </View>

      <View style={s.sheet}>
        <Pressable onPress={() => setExpanded(!expanded)} style={s.grab}>
          <View style={s.handle} />
        </Pressable>

        {selectedGeo ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
            <View style={s.rowBetween}>
              <View>
                <Text style={s.communeName}>{selectedGeo.name}</Text>
                <Text style={s.meta}>
                  {selectedGeo.dept} ·{" "}
                  {selectedDb && selectedDb.postCount > 0
                    ? `${selectedDb.postCount} pòs`
                    : "poko gen pòs"}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedId(null)}>
                <SymbolView name="xmark" size={17} tintColor={MUTED} />
              </Pressable>
            </View>
            <Pressable style={s.cta} onPress={chooseZone}>
              <Text style={s.ctaTxt}>Wè fil {selectedGeo.name}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
            <View style={s.rowBetween}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={[s.sheetTitle, dept ? { color: colorOf(dept) } : null]}>
                  {title}
                </Text>
                <Text style={s.metaCaps}>{info ? `${info.communes} KOMIN` : ""}</Text>
              </View>
              <Text style={s.meta}>{expanded ? "fèmen" : "plis"}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 18, marginTop: 8 }}>
              <Text style={s.keyNum}>
                {fmt(pop)} <Text style={s.meta}>moun</Text>
              </Text>
              <Text style={[s.keyNum, { color: FLAG_RED }]}>
                {fmt(pop * VOTER_RATIO)} <Text style={s.meta}>votan</Text>
              </Text>
              <Text style={s.keyNum}>
                {info?.posts ?? 0} <Text style={s.meta}>pòs</Text>
              </Text>
            </View>
            {expanded && info && (
              <View style={{ marginTop: 16 }}>
                <View style={s.grid}>
                  <Stat label="FANM" value={fmt(pop * FEMALE_RATIO)} />
                  <Stat label="GASON" value={fmt(pop * (1 - FEMALE_RATIO))} />
                  <Stat label="TIMOUN -18" value={fmt(pop * CHILD_RATIO)} />
                  <Stat label="KANDIDA" value={String(info.candidates)} />
                  <Stat label="PWOJÈ" value={String(info.projects)} />
                  <Stat label="KOMIN" value={String(info.communes)} />
                </View>
                {info.topCommune && (
                  <View style={s.hlRow}>
                    <SymbolView name="flame.fill" size={15} tintColor="#FB923C" />
                    <Text style={s.meta}>Komin ki pi aktif</Text>
                    <Text style={[s.hlVal, { marginLeft: "auto" }]}>
                      {info.topCommune}
                    </Text>
                  </View>
                )}
                {info.topProject && (
                  <View style={s.hlRow}>
                    <SymbolView name="banknote.fill" size={15} tintColor="#34D399" />
                    <Text style={s.hlVal} numberOfLines={1}>
                      {info.topProject.title}
                    </Text>
                    <Text style={[s.hlVal, { marginLeft: "auto", color: "#34D399" }]}>
                      {info.topProject.pct}%
                    </Text>
                  </View>
                )}
                <Text style={s.source}>
                  {DEMOGRAPHICS_SOURCE} · rapò nasyonal aplike pa depatman
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 8 },
  title: { color: PAPER, fontWeight: "800", fontSize: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  chips: { gap: 7, paddingHorizontal: 20, paddingVertical: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#141E32",
  },
  chipTxt: { color: MUTED, fontSize: 12, fontWeight: "600" },
  sheet: {
    backgroundColor: SHEET,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
  },
  grab: { alignItems: "center", paddingVertical: 9 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#2C3B57" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { color: PAPER, fontWeight: "800", fontSize: 24 },
  metaCaps: { color: MUTED, fontSize: 10, letterSpacing: 1.5 },
  meta: { color: MUTED, fontSize: 12 },
  keyNum: { color: PAPER, fontWeight: "800", fontSize: 18 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    columnGap: "5%" as unknown as number,
  },
  statVal: { color: PAPER, fontWeight: "800", fontSize: 20 },
  statLabel: { color: MUTED, fontSize: 9, letterSpacing: 1.2, marginTop: 2 },
  hlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#182339",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 12,
  },
  hlVal: { color: PAPER, fontSize: 12, fontWeight: "700", flexShrink: 1 },
  source: { color: "#55627A", fontSize: 10, marginTop: 12 },
  communeName: { color: PAPER, fontWeight: "800", fontSize: 18 },
  cta: {
    backgroundColor: FLAG_RED,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },
})
