import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Stack, useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { getZone, setZone, subscribeZone } from "@/lib/zone"
import { getLang, setLang, t, useLang } from "@/lib/i18n"
import { CARD, FLAG_RED, INK, LINE, MUTED, PAPER } from "@/constants/theme"

export default function PwofilScreen() {
  useLang()
  const router = useRouter()
  const [zone, setZoneState] = useState(getZone())

  useEffect(() => subscribeZone(() => setZoneState(getZone())), [])

  return (
    <View style={{ flex: 1, backgroundColor: INK, padding: 20 }}>
      <Stack.Screen
        options={{
          title: t("me"),
          headerStyle: { backgroundColor: INK },
          headerTitleStyle: { color: PAPER },
          headerTintColor: PAPER,
        }}
      />

      <View style={s.card}>
        <View style={s.avatar}>
          <SymbolView name="person.fill" size={30} tintColor="#9DB4E8" />
        </View>
        <Text style={s.name}>{t("visitor")}</Text>
        <Text style={s.meta}>{t("visitorNote")}</Text>
      </View>

      <View style={s.row}>
        <SymbolView name="globe" size={20} tintColor={MUTED} />
        <Text style={s.rowTxt}>{t("language")}</Text>
        <View style={s.langSwitch}>
          {(["fr", "ht"] as const).map((l) => (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              style={[s.langBtn, getLang() === l && s.langBtnActive]}
            >
              <Text
                style={[s.langTxt, getLang() === l && { color: INK }]}
              >
                {l === "fr" ? "Français" : "Kreyòl"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.row}>
        <SymbolView name="mappin.circle.fill" size={20} tintColor={FLAG_RED} />
        <Text style={s.rowTxt}>{t("myZone")}</Text>
        <Text style={s.rowVal}>{zone?.name ?? t("allHaiti")}</Text>
      </View>
      {zone && (
        <Pressable style={s.row} onPress={() => setZone(null)}>
          <SymbolView name="xmark.circle" size={20} tintColor={MUTED} />
          <Text style={s.rowTxt}>{t("backToAllHaiti")}</Text>
        </Pressable>
      )}
      <Pressable
        style={s.row}
        onPress={() => {
          router.back()
          router.push("/kat")
        }}
      >
        <SymbolView name="map" size={20} tintColor={MUTED} />
        <Text style={s.rowTxt}>{t("changeZoneOnMap")}</Text>
      </Pressable>

      <Text style={s.version}>{t("demoVersion")}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    padding: 22,
    marginBottom: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#233457",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  name: { color: PAPER, fontWeight: "800", fontSize: 18 },
  meta: { color: MUTED, fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  rowTxt: { color: PAPER, fontSize: 14, fontWeight: "600" },
  rowVal: { color: MUTED, fontSize: 13, marginLeft: "auto" },
  langSwitch: {
    flexDirection: "row",
    marginLeft: "auto",
    backgroundColor: "#1B2740",
    borderRadius: 999,
    padding: 3,
  },
  langBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  langBtnActive: { backgroundColor: PAPER },
  langTxt: { color: MUTED, fontSize: 12, fontWeight: "700" },
  version: { color: "#55627A", fontSize: 11, textAlign: "center", marginTop: "auto" },
})
