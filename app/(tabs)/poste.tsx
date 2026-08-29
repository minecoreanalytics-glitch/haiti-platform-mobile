import { L_BG, L_CARD, L_LINE, L_SUB, L_TXT, VERIFIED } from "@/constants/theme"
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
import { t, useLang } from "@/lib/i18n"
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
  { key: "kesyon", labelKey: "question", icon: "questionmark.bubble.fill", hintKey: "questionHint" },
  { key: "pwoblem", labelKey: "problem", icon: "exclamationmark.triangle.fill", hintKey: "problemHint" },
] as const

export default function PosteScreen() {
  useLang()
  const router = useRouter()
  const [type, setType] = useState<"kesyon" | "pwoblem">("kesyon")
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const zone = getZone()

  const submit = async () => {
    if (body.trim().length < 10) {
      setError(t("minChars"))
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
      setError(e instanceof Error ? e.message : t("connError"))
    } finally {
      setSending(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: L_BG }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.head}>
          <Text style={s.title}>{t("postTitle")}</Text>
          <Text style={s.sub}>
            {zone ? `${t("yourZone")}: ${zone.name}` : t("zoneDefault")}
          </Text>
        </View>

        <View style={s.types}>
          {TYPES.map((ty) => (
            <Pressable
              key={ty.key}
              onPress={() => setType(ty.key)}
              style={[s.type, type === ty.key && s.typeActive]}
            >
              <SymbolView
                name={ty.icon as never}
                size={20}
                tintColor={type === ty.key ? L_TXT : L_SUB}
              />
              <Text style={[s.typeTxt, type === ty.key && { color: L_TXT }]}>
                {t(ty.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.hint}>{t(TYPES.find((ty) => ty.key === type)!.hintKey)}</Text>

        <TextInput
          style={s.name}
          placeholder={t("yourNameOptional")}
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={setName}
          maxLength={60}
        />
        <TextInput
          style={s.input}
          placeholder={
            type === "kesyon" ? t("questionPlaceholder") : t("problemPlaceholder")
          }
          placeholderTextColor="#A0A0A0"
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
              <Text style={s.sendTxt}>{t("publish")}</Text>
            )}
          </Pressable>
          <Text style={s.note}>
            {t("onlyCandidatesNote")}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: L_TXT, fontWeight: "800", fontSize: 20 },
  sub: { color: L_SUB, fontSize: 12, marginTop: 2 },
  types: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  type: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: L_CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L_LINE,
    paddingVertical: 12,
  },
  typeActive: { borderColor: L_TXT },
  typeTxt: { color: L_SUB, fontWeight: "700", fontSize: 14 },
  hint: { color: "#8E8E8E", fontSize: 11, paddingHorizontal: 16, marginTop: 8 },
  name: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: L_CARD,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: L_LINE,
    color: L_TXT,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  input: {
    flex: 1,
    margin: 16,
    marginBottom: 8,
    backgroundColor: L_CARD,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: L_LINE,
    color: L_TXT,
    padding: 14,
    fontSize: 15,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: 16, paddingBottom: 10 },
  error: { color: "#F87171", fontSize: 12, marginBottom: 6 },
  count: { color: "#8E8E8E", fontSize: 11, textAlign: "right", marginBottom: 8 },
  send: {
    backgroundColor: FLAG_RED,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
  },
  sendTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  note: { color: "#8E8E8E", fontSize: 10, textAlign: "center", marginTop: 8 },
})
