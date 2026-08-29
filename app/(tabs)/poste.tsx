import { useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"
import { getZone } from "@/lib/zone"
import { getPseudonym, setPseudonym } from "@/lib/identity"
import { t, useLang, type StringKey } from "@/lib/i18n"
import {
  CATEGORIES,
  catIcon,
  catLabel,
  type IssueCategory,
} from "@/components/FeedList"
import { API_URL, FLAG_RED, L_BG, L_LINE, L_SUB, L_TXT } from "@/constants/theme"

const TYPES = [
  {
    key: "SIYALMAN" as const,
    labelKey: "problem" as StringKey,
    icon: "exclamationmark.triangle.fill",
    hintKey: "problemHint" as StringKey,
  },
  {
    key: "KESYON" as const,
    labelKey: "question" as StringKey,
    icon: "questionmark.bubble.fill",
    hintKey: "questionHint" as StringKey,
  },
]

export default function PosteScreen() {
  useLang()
  const router = useRouter()
  const [action, setAction] = useState<"SIYALMAN" | "KESYON">("SIYALMAN")
  const [category, setCategory] = useState<IssueCategory | null>(null)
  const [name, setName] = useState(
    getPseudonym() === "sitwayen" ? "" : getPseudonym()
  )
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const zone = getZone()

  const submit = async () => {
    if (action === "SIYALMAN" && !category) {
      setError(t("categoryRequired"))
      return
    }
    if (body.trim().length < 10) {
      setError(t("minChars"))
      return
    }
    setSending(true)
    setError(null)
    if (name.trim()) setPseudonym(name)
    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          category: action === "SIYALMAN" ? category : undefined,
          body: body.trim(),
          communeId: zone?.id,
          pseudonym: getPseudonym(),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error ?? "Erè")
      }
      setBody("")
      setCategory(null)
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
        <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
          <View style={s.head}>
            <Text style={s.title}>{t("postTitle")}</Text>
            <Text style={s.sub}>
              {zone ? `${t("yourZone")} : ${zone.name}` : t("zoneDefault")}
            </Text>
          </View>

          <View style={s.types}>
            {TYPES.map((ty) => (
              <Pressable
                key={ty.key}
                onPress={() => setAction(ty.key)}
                style={[s.type, action === ty.key && s.typeActive]}
              >
                <SymbolView
                  name={ty.icon as never}
                  size={19}
                  tintColor={action === ty.key ? L_TXT : L_SUB}
                />
                <Text style={[s.typeTxt, action === ty.key && { color: L_TXT }]}>
                  {t(ty.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.hint}>
            {t(TYPES.find((ty) => ty.key === action)!.hintKey)}
          </Text>

          {action === "SIYALMAN" && (
            <View style={s.catBlock}>
              <Text style={s.catLabel}>{t("pickCategory")}</Text>
              <View style={s.catGrid}>
                {CATEGORIES.map((c) => {
                  const on = category === c.key
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => {
                        setCategory(c.key)
                        if (error) setError(null)
                      }}
                      style={[s.cat, on && s.catOn]}
                    >
                      <SymbolView
                        name={catIcon(c.key) as never}
                        size={16}
                        tintColor={on ? "#fff" : "#374151"}
                      />
                      <Text style={[s.catTxt, on && { color: "#fff" }]}>
                        {catLabel(c.key)}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          )}

          <TextInput
            style={s.name}
            placeholder={t("yourNameOptional")}
            placeholderTextColor="#A0A0A0"
            value={name}
            onChangeText={setName}
            maxLength={30}
            autoCapitalize="none"
          />
          <TextInput
            style={s.input}
            placeholder={
              action === "KESYON"
                ? t("questionPlaceholder")
                : t("problemPlaceholder")
            }
            placeholderTextColor="#A0A0A0"
            value={body}
            onChangeText={(v) => {
              setBody(v)
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
            <Text style={s.note}>{t("onlyCandidatesNote")}</Text>
          </View>
        </ScrollView>
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
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: L_LINE,
    paddingVertical: 12,
  },
  typeActive: { borderColor: L_TXT, borderWidth: 1.5 },
  typeTxt: { color: L_SUB, fontWeight: "700", fontSize: 14 },
  hint: { color: "#8E8E8E", fontSize: 11, paddingHorizontal: 16, marginTop: 8 },
  catBlock: { paddingHorizontal: 16, marginTop: 16 },
  catLabel: { color: L_TXT, fontSize: 12, fontWeight: "700", marginBottom: 8 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F3F5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catOn: { backgroundColor: L_TXT },
  catTxt: { color: "#374151", fontSize: 12, fontWeight: "700" },
  name: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: L_LINE,
    color: L_TXT,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  input: {
    minHeight: 130,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: L_LINE,
    color: L_TXT,
    padding: 14,
    fontSize: 15,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: 16, marginTop: 10 },
  error: { color: "#DC2626", fontSize: 12, marginBottom: 6 },
  count: { color: "#A0A0A0", fontSize: 11, textAlign: "right", marginBottom: 8 },
  send: {
    backgroundColor: FLAG_RED,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
  },
  sendTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  note: { color: "#8E8E8E", fontSize: 10, textAlign: "center", marginTop: 10 },
})
