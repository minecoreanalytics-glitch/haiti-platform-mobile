import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect, useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { getZone } from "@/lib/zone"
import { onFeedScroll } from "@/lib/navbar"
import { t, useLang } from "@/lib/i18n"
import {
  API_URL,
  GREEN,
  L_BG,
  L_LINE,
  L_SUB,
  L_TXT,
  VERIFIED,
} from "@/constants/theme"

type Item = {
  id: string
  purpose: string
  detail: string | null
  category: string
  amountHTG: number
  fundedHTG: number
  spentHTG: number
  contributions: number
  expenses: { label: string; amountHTG: number; vendor: string | null }[]
}

type Budget = {
  candidateId: string
  candidate: string
  party: string | null
  office: string
  commune: string | null
  totalNeededHTG: number
  totalFundedHTG: number
  totalSpentHTG: number
  contributorCount: number
  averageHTG: number
  largestHTG: number
  diasporaShare: number
  items: Item[]
}

const htg = (n: number) => n.toLocaleString("fr-FR")

const CAT_ICON: Record<string, string> = {
  PRINTED_MATERIALS: "doc.on.doc.fill",
  EVENT_LOGISTICS: "person.3.fill",
  TRANSPORT: "car.fill",
  MEDIA_PRODUCTION: "antenna.radiowaves.left.and.right",
  LOCAL_OUTREACH: "figure.walk",
  TRANSLATION: "character.book.closed.fill",
  DIGITAL_COMMUNICATION: "wifi",
  OTHER: "ellipsis.circle.fill",
}

function Line({ item }: { item: Item }) {
  const [open, setOpen] = useState(false)
  const pct = Math.min(100, Math.round((item.fundedHTG / item.amountHTG) * 100))
  const spentPct = Math.min(
    100,
    Math.round((item.spentHTG / item.amountHTG) * 100)
  )
  return (
    <View style={s.line}>
      <Pressable
        style={s.lineHead}
        onPress={() => setOpen((o) => !o)}
        disabled={item.expenses.length === 0}
      >
        <SymbolView
          name={(CAT_ICON[item.category] ?? "ellipsis.circle.fill") as never}
          size={16}
          tintColor="#374151"
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.linePurpose} numberOfLines={1}>
            {item.purpose}
          </Text>
          {item.detail && (
            <Text style={s.lineDetail} numberOfLines={1}>
              {item.detail}
            </Text>
          )}
        </View>
        <Text style={s.linePct}>{pct}%</Text>
      </Pressable>

      <View style={s.track}>
        <View style={[s.fillSpent, { width: `${spentPct}%` }]} />
        <View style={[s.fillFunded, { width: `${pct}%` }]} />
      </View>

      <View style={s.lineFoot}>
        <Text style={s.lineNums}>
          <Text style={{ color: L_TXT, fontWeight: "700" }}>
            {htg(item.fundedHTG)}
          </Text>
          <Text style={{ color: L_SUB }}> / {htg(item.amountHTG)} HTG</Text>
        </Text>
        {item.expenses.length > 0 && (
          <Pressable onPress={() => setOpen((o) => !o)} style={s.proofBtn}>
            <SymbolView
              name={open ? "chevron.up" : "doc.text.magnifyingglass"}
              size={12}
              tintColor="#0B8A5C"
            />
            <Text style={s.proofTxt}>
              {htg(item.spentHTG)} {t("spent")} · {item.expenses.length}{" "}
              {t("proofs")}
            </Text>
          </Pressable>
        )}
      </View>

      {open &&
        item.expenses.map((e, i) => (
          <View key={i} style={s.expense}>
            <Text style={s.expenseLabel} numberOfLines={1}>
              {e.label}
              {e.vendor ? ` · ${e.vendor}` : ""}
            </Text>
            <Text style={s.expenseAmt}>{htg(e.amountHTG)} HTG</Text>
          </View>
        ))}
    </View>
  )
}

function BudgetCard({ b }: { b: Budget }) {
  const router = useRouter()
  const pct = Math.min(
    100,
    Math.round((b.totalFundedHTG / (b.totalNeededHTG || 1)) * 100)
  )
  return (
    <View style={s.card}>
      <Pressable
        style={s.head}
        onPress={() => router.push(`/kandidat/${b.candidateId}`)}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={s.name} numberOfLines={1}>
              {b.candidate}
            </Text>
            <SymbolView
              name="checkmark.seal.fill"
              size={14}
              tintColor={VERIFIED}
            />
          </View>
          <Text style={s.meta} numberOfLines={1}>
            {b.party ? `${b.party} · ` : ""}
            {b.office}
          </Text>
        </View>
        <SymbolView name="chevron.right" size={13} tintColor={L_SUB} />
      </Pressable>

      <View style={s.totalRow}>
        <Text style={s.total}>
          {htg(b.totalFundedHTG)}{" "}
          <Text style={s.totalSub}>/ {htg(b.totalNeededHTG)} HTG</Text>
        </Text>
        <Text style={s.totalPct}>{pct}%</Text>
      </View>

      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={s.statVal}>{b.contributorCount}</Text>
          <Text style={s.statLbl}>{t("contributors")}</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statVal}>{htg(b.averageHTG)}</Text>
          <Text style={s.statLbl}>{t("averageGift")}</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statVal}>{htg(b.largestHTG)}</Text>
          <Text style={s.statLbl}>{t("largestGift")}</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statVal}>{b.diasporaShare}%</Text>
          <Text style={s.statLbl}>{t("diaspora")}</Text>
        </View>
      </View>

      <Text style={s.sectionLabel}>{t("budgetLines")}</Text>
      {b.items.map((i) => (
        <Line key={i.id} item={i} />
      ))}

      <View style={s.closed}>
        <SymbolView name="lock.fill" size={11} tintColor="#8E8E8E" />
        <Text style={s.closedTxt}>{t("fundingClosed")}</Text>
      </View>
    </View>
  )
}

export default function FinansmanScreen() {
  useLang()
  const [budgets, setBudgets] = useState<Budget[] | null>(null)

  const load = useCallback(() => {
    const zone = getZone()
    const qs = zone ? `?zone=${zone.id}` : ""
    fetch(`${API_URL}/api/finansman${qs}`)
      .then((r) => r.json())
      .then(setBudgets)
      .catch(() => setBudgets([]))
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: L_BG }} edges={["top"]}>
      <View style={s.screenHead}>
        <Text style={s.screenTitle}>{t("fundingTitle")}</Text>
        <Text style={s.screenSub}>{t("fundingSub")}</Text>
      </View>
      {budgets === null ? (
        <ActivityIndicator color={L_SUB} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(b) => b.candidateId}
          renderItem={({ item }) => <BudgetCard b={item} />}
          onScroll={(e) => onFeedScroll(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={[s.meta, { textAlign: "center", marginTop: 40 }]}>
              {t("noBudgets")}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screenHead: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  screenTitle: { color: L_TXT, fontWeight: "800", fontSize: 20 },
  screenSub: { color: L_SUB, fontSize: 12, marginTop: 2, lineHeight: 17 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: L_LINE,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff",
  },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: L_TXT, fontWeight: "800", fontSize: 15, flexShrink: 1 },
  meta: { color: L_SUB, fontSize: 12, marginTop: 2 },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 12,
  },
  total: { color: L_TXT, fontWeight: "800", fontSize: 19 },
  totalSub: { color: L_SUB, fontWeight: "400", fontSize: 13 },
  totalPct: { color: "#0B8A5C", fontWeight: "800", fontSize: 16 },
  stats: {
    flexDirection: "row",
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingVertical: 10,
  },
  stat: { flex: 1, alignItems: "center" },
  statVal: { color: L_TXT, fontWeight: "800", fontSize: 14 },
  statLbl: {
    color: L_SUB,
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  sectionLabel: {
    color: L_SUB,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 4,
  },
  line: {
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: L_LINE,
  },
  lineHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  linePurpose: { color: L_TXT, fontWeight: "700", fontSize: 13 },
  lineDetail: { color: L_SUB, fontSize: 11, marginTop: 1 },
  linePct: { color: L_SUB, fontSize: 12, fontWeight: "700" },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EFEFEF",
    overflow: "hidden",
    marginTop: 8,
  },
  fillSpent: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#BFE9D6",
  },
  fillFunded: { height: "100%", backgroundColor: GREEN, borderRadius: 3 },
  lineFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
    gap: 8,
  },
  lineNums: { fontSize: 12, flexShrink: 1 },
  proofBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  proofTxt: { color: "#0B8A5C", fontSize: 11, fontWeight: "700" },
  expense: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 6,
  },
  expenseLabel: { color: "#374151", fontSize: 11, flexShrink: 1 },
  expenseAmt: { color: L_TXT, fontSize: 11, fontWeight: "700" },
  closed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#EFEFEF",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 14,
  },
  closedTxt: { color: "#6B7280", fontSize: 11, fontWeight: "600" },
})
