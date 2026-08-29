import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Stack, useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { getZone, setZone, subscribeZone } from "@/lib/zone"
import { CARD, FLAG_RED, INK, LINE, MUTED, PAPER } from "@/constants/theme"

export default function PwofilScreen() {
  const router = useRouter()
  const [zone, setZoneState] = useState(getZone())

  useEffect(() => subscribeZone(() => setZoneState(getZone())), [])

  return (
    <View style={{ flex: 1, backgroundColor: INK, padding: 20 }}>
      <Stack.Screen
        options={{
          title: "Mwen",
          headerStyle: { backgroundColor: INK },
          headerTitleStyle: { color: PAPER },
          headerTintColor: PAPER,
        }}
      />

      <View style={s.card}>
        <View style={s.avatar}>
          <SymbolView name="person.fill" size={30} tintColor="#9DB4E8" />
        </View>
        <Text style={s.name}>Vizitè</Text>
        <Text style={s.meta}>
          Ou ka gade tout bagay san kont. Kont lan ap vin nesesè sèlman lè w ap
          bay lajan oswa poze kesyon ak non w.
        </Text>
      </View>

      <View style={s.row}>
        <SymbolView name="mappin.circle.fill" size={20} tintColor={FLAG_RED} />
        <Text style={s.rowTxt}>Zòn mwen</Text>
        <Text style={s.rowVal}>{zone?.name ?? "Tout Ayiti"}</Text>
      </View>
      {zone && (
        <Pressable style={s.row} onPress={() => setZone(null)}>
          <SymbolView name="xmark.circle" size={20} tintColor={MUTED} />
          <Text style={s.rowTxt}>Retounen sou Tout Ayiti</Text>
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
        <Text style={s.rowTxt}>Chanje zòn sou kat la</Text>
      </Pressable>

      <Text style={s.version}>Platfòm Sivik Ayiti · vèsyon demo</Text>
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
    paddingVertical: 14,
    marginBottom: 10,
  },
  rowTxt: { color: PAPER, fontSize: 14, fontWeight: "600" },
  rowVal: { color: MUTED, fontSize: 13, marginLeft: "auto" },
  version: { color: "#55627A", fontSize: 11, textAlign: "center", marginTop: "auto" },
})
