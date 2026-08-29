import { useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { getZone } from "@/lib/zone"
import {
  API_URL,
  CARD,
  FLAG_RED,
  INK,
  LINE,
  MUTED,
  PAPER,
} from "@/constants/theme"

const TYPES = [
  { key: "kesyon", label: "Kesyon", icon: "questionmark.bubble.fill", hint: "Poze kandida yo yon kesyon piblik" },
  { key: "pwoblem", label: "Pwoblèm", icon: "exclamationmark.triangle.fill", hint: "Siyale yon pwoblèm nan zòn ou (wout, dlo, fatra…)" },
] as const

export default function PosteScreen() {
  const router = useRouter()
  const [type, setType] = useState<"kesyon" | "pwoblem">("kesyon")
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const zone = getZone()

  const submit = async () => {
    if (body.trim().length < 10) {
      setError("Ekri omwen 10 karaktè.")
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          communeId: zone?.id,
          authorName: name.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error ?? "Erè sèvè")
      }
      setBody("")
      router.push("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erè koneksyon")
    } finally {
      setSending(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.head}>
          <Text style={s.title}>Poste</Text>
          <Text style={s.sub}>
            {zone ? `Zòn ou: ${zone.name}` : "Zòn: Pòtoprens (chwazi zòn ou nan Kat)"}
          </Text>
        </View>

        <View style={s.types}>
          {TYPES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setType(t.key)}
              style={[s.type, type === t.key && s.typeActive]}
            >
              <SymbolView
                name={t.icon as never}
                size={20}
                tintColor={type === t.key ? PAPER : MUTED}
              />
              <Text style={[s.typeTxt, type === t.key && { color: PAPER }]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.hint}>{TYPES.find((t) => t.key === type)?.hint}</Text>

        <TextInput
          style={s.name}
          placeholder="Non ou (opsyonèl)"
          placeholderTextColor="#55627A"
          value={name}
          onChangeText={setName}
          maxLength={60}
        />
        <TextInput
          style={s.input}
          placeholder={
            type === "kesyon"
              ? "Ki kesyon w vle poze kandida yo?"
              : "Dekri pwoblèm nan…"
          }
          placeholderTextColor="#55627A"
          value={body}
          onChangeText={(t) => {
            setBody(t)
            if (error) setError(null)
          }}
          multiline
          maxLength={1000}
        />

        <View style={s.footer}>
          {error && <Text style={s.error}>{error}</Text>}
          <Text style={s.count}>{body.length}/1000</Text>
          <Pressable
            style={[s.send, sending && { opacity: 0.6 }]}
            onPress={submit}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.sendTxt}>Pibliye</Text>
            )}
          </Pressable>
          <Text style={s.note}>
            Sèl kandida verifye ka kreye pwojè, sou platfòm wèb la.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: PAPER, fontWeight: "800", fontSize: 20 },
  sub: { color: MUTED, fontSize: 12, marginTop: 2 },
  types: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  type: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    paddingVertical: 12,
  },
  typeActive: { borderColor: PAPER },
  typeTxt: { color: MUTED, fontWeight: "700", fontSize: 14 },
  hint: { color: "#5E6C86", fontSize: 11, paddingHorizontal: 16, marginTop: 8 },
  name: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    color: PAPER,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  input: {
    flex: 1,
    margin: 16,
    marginBottom: 8,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    color: PAPER,
    padding: 14,
    fontSize: 15,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: 16, paddingBottom: 10 },
  error: { color: "#F87171", fontSize: 12, marginBottom: 6 },
  count: { color: "#55627A", fontSize: 11, textAlign: "right", marginBottom: 8 },
  send: {
    backgroundColor: FLAG_RED,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
  },
  sendTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  note: { color: "#55627A", fontSize: 10, textAlign: "center", marginTop: 8 },
})
