import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { parseCapture, type ExtractedAction } from "../src/captureParser";
import { CategoryDropdown } from "../src/components/CategoryDropdown";
import { DatePickerField, dateInput } from "../src/components/DatePickerField";
import { Chip, Mascot, PrimaryButton, Surface, useAppearance } from "../src/components/ui";
import { enqueueOffline } from "../src/offlineQueue";
import { paymentNotifications, paymentNotificationsSupported, type PaymentNotification } from "../src/paymentNotifications";
import { colors, radii, spacing } from "../src/theme";

const types = [
  ["Task", "Action or to-do", "checkbox-outline", colors.lavenderSurface],
  ["Expense", "Spend or purchase", "cash-outline", colors.sageSurface],
  ["Payment alert", "Detect pending spend", "receipt-outline", colors.coralSurface],
  ["Focus", "Start or log focus", "timer-outline", colors.lavenderSurface],
  ["Note", "Extract structured actions", "document-text-outline", colors.mustardSurface],
  ["Voice", "Confirm captured words", "mic-outline", colors.coralSurface],
] as const;

export default function QuickAddModal() {
  const ensureMoneyDefaults = useMutation(api.core.ensureMoneyDefaults);
  const addTask = useMutation(api.core.addTask);
  const addExpense = useMutation(api.core.addExpense);
  const detectPaymentNotification = useMutation(api.core.detectPaymentNotification);
  const removeCategory = useMutation(api.core.removeCategory);
  const addManualFocus = useMutation(api.core.addManualFocus);
  const moveUnfinishedTasks = useMutation(api.core.moveUnfinishedTasks);
  const startFocus = useMutation(api.core.startFocus);
  const money = useQuery(api.core.money, {});
  const viewer = useQuery(api.core.viewer);
  const appearance = useAppearance();
  const [selected, setSelected] = useState<string | null>(null);
  const [expense, setExpense] = useState({
    accountId: undefined as Id<"accounts"> | undefined,
    amount: "",
    category: "Food",
    date: dateInput(Date.now()),
    merchant: "",
    note: "",
    paymentMethod: "online" as "cash" | "online",
    type: "expense" as "expense" | "income",
  });
  const [focusDuration, setFocusDuration] = useState({ hours: "", minutes: "30" });
  const [task, setTask] = useState({ location: "", meetingLink: "", note: "", title: "" });
  const [value, setValue] = useState("");
  const [extracted, setExtracted] = useState<ExtractedAction[]>([]);
  const [recognizing, setRecognizing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [notificationAccess, setNotificationAccess] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState<PaymentNotification[]>([]);
  const [selectedAlertKey, setSelectedAlertKey] = useState<string | null>(null);

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setVoiceMessage("Listening...");
  });
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript?.trim() ?? "";
    setValue(transcript);
    setExtracted(parseCapture(transcript));
    if (event.isFinal) setVoiceMessage(`${parseCapture(transcript).length} item${parseCapture(transcript).length === 1 ? "" : "s"} ready`);
  });
  useSpeechRecognitionEvent("error", (event) => {
    setRecognizing(false);
    setVoiceMessage(event.message || "Voice capture is unavailable. Type the words instead.");
  });

  useEffect(() => {
    void ensureMoneyDefaults({});
  }, [ensureMoneyDefaults]);

  useEffect(() => {
    if (selected !== "Payment alert" || !viewer || !paymentNotificationsSupported || !paymentNotifications) return;
    const module = paymentNotifications;
    const ownerId = viewer._id;
    let active = true;
    async function refresh() {
      const allowed = await module.isAccessEnabled();
      const alerts = allowed ? await module.getPending(ownerId) : [];
      if (!active) return;
      setNotificationAccess(allowed);
      setPaymentAlerts(alerts);
      if (alerts[0]) setValue((current) => {
        if (current) return current;
        setSelectedAlertKey(alerts[0].key);
        return alerts[0].text;
      });
    }
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [selected, viewer]);

  function expenseDate() {
    const [year, month, day] = expense.date.split("-").map(Number);
    return year && month && day ? new Date(year, month - 1, day).getTime() : undefined;
  }

  async function saveOrQueue(type: "addTask" | "addExpense" | "addManualFocus", payload: any, saveNow: (payload: any) => Promise<unknown>) {
    try {
      await saveNow(payload);
      return false;
    } catch {
      if (!viewer) return false;
      await enqueueOffline(viewer._id, type, payload);
      setSyncMessage("Saved offline. It will sync when the app reconnects.");
      return true;
    }
  }

  async function startVoiceCapture() {
    const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
    if (!available) {
      setVoiceMessage("Voice capture is unavailable on this device. Type the words instead.");
      return;
    }
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setVoiceMessage("Voice permission denied. Type the words instead.");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      addsPunctuation: true,
      continuous: false,
      contextualStrings: ["expense", "rupees", "focus", "minutes", "tomorrow", "remind me"],
      interimResults: true,
      lang: "en-US",
    });
  }

  async function save() {
    const text = value.trim();
    let queued = false;
    if (selected === "Focus") {
      const minutes = (Number(focusDuration.hours) || 0) * 60 + (Number(focusDuration.minutes) || 0);
      if (minutes > 0) queued = await saveOrQueue("addManualFocus", { minutes }, addManualFocus);
      else await startFocus({});
      if (!queued) router.back();
      return;
    }
    if (selected === "Expense") {
      const amount = Number(expense.amount);
      const accountId = expense.accountId ?? money?.accounts[0]?._id;
      if (!Number.isFinite(amount) || amount <= 0 || !accountId) return;
      queued = await saveOrQueue("addExpense", {
        accountId,
        amount,
        category: expense.category || "General",
        merchant: expense.merchant,
        note: expense.note,
        occurredAt: expenseDate(),
        paymentMethod: expense.paymentMethod,
        source: "manual",
        status: "confirmed",
        type: expense.type,
      }, addExpense);
    } else if (selected === "Task") {
      if (!task.title.trim()) return;
      queued = await saveOrQueue("addTask", {
        location: task.location,
        meetingLink: task.meetingLink,
        note: task.note,
        title: task.title,
      }, addTask);
    } else if (selected === "Payment alert") {
      if (!text) return;
      await detectPaymentNotification({ text });
      if (selectedAlertKey && paymentNotifications) await paymentNotifications.dismiss(selectedAlertKey);
    } else if (selected === "Note" || selected === "Voice") {
      if (!extracted.length) return;
      for (const action of extracted) {
        if (action.type === "expense") {
          const amount = Number(action.amount);
          const accountId = expense.accountId ?? money?.accounts[0]?._id;
          if (Number.isFinite(amount) && amount > 0 && accountId) queued = (await saveOrQueue("addExpense", {
            accountId,
            amount,
            category: action.category || "General",
            merchant: action.merchant,
            note: "",
            paymentMethod: "online",
            source: "text",
            status: "pending",
            type: "expense",
          }, addExpense)) || queued;
        }
        if (action.type === "focus") {
          const minutes = Number(action.minutes);
          if (Number.isFinite(minutes) && minutes > 0) queued = (await saveOrQueue("addManualFocus", { minutes }, addManualFocus)) || queued;
        }
        if (action.type === "task" && action.title.trim()) {
          const scheduledAt = Number(action.scheduledAt);
          const reminderLeadMinutes = Number(action.reminderLeadMinutes);
          queued = (await saveOrQueue("addTask", {
            note: "",
            reminderLeadMinutes: Number.isFinite(reminderLeadMinutes) ? reminderLeadMinutes : undefined,
            scheduledAt: Number.isFinite(scheduledAt) ? scheduledAt : undefined,
            title: action.title,
          }, addTask)) || queued;
        }
        if (action.type === "move") {
          const scheduledAt = Number(action.scheduledAt);
          if (Number.isFinite(scheduledAt)) await moveUnfinishedTasks({ exceptText: action.exceptText, scheduledAt });
        }
      }
    } else {
      if (!text) return;
      queued = await saveOrQueue("addTask", { title: text }, addTask);
    }
    if (!queued) router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
      <Pressable accessibilityLabel="Close quick add" onPress={() => router.back()} style={styles.scrim} />
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
        <View style={styles.handle} />
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>What would you like to add?</Text>
            <Text style={styles.subtitle}>Captured items update Today.</Text>
          </View>
          <Mascot size={84} variant="excited" />
          <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => router.back()} style={styles.close}>
            <Ionicons color={colors.text} name="close" size={22} />
          </Pressable>
        </View>

        {selected ? (
          <View style={styles.confirmation}>
            <Text style={[styles.selectedLabel, { color: appearance.primaryDark }]}>{selected}</Text>
            {selected === "Expense" ? (
              <>
                <View style={styles.chips}>
                  <Chip label="Expense" selected={expense.type === "expense"} onPress={() => setExpense((current) => ({ ...current, category: "Food", type: "expense" }))} />
                  <Chip label="Income" selected={expense.type === "income"} onPress={() => setExpense((current) => ({ ...current, category: "Salary", type: "income" }))} />
                  <Chip label="Online" selected={expense.paymentMethod === "online"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "online" }))} />
                  <Chip label="Cash" selected={expense.paymentMethod === "cash"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "cash" }))} />
                </View>
                <View style={styles.chips}>
                  {(money?.accounts ?? []).map((account) => (
                    <Chip key={account._id} label={account.name} selected={(expense.accountId ?? money?.accounts[0]?._id) === account._id} onPress={() => setExpense((current) => ({ ...current, accountId: account._id }))} />
                  ))}
                </View>
                <TextInput
                  accessibilityLabel="Expense amount"
                  autoFocus
                  keyboardType="decimal-pad"
                  onChangeText={(amount) => setExpense((current) => ({ ...current, amount }))}
                  placeholder="Amount"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={expense.amount}
                />
                <TextInput
                  accessibilityLabel="Merchant"
                  onChangeText={(merchant) => setExpense((current) => ({ ...current, merchant }))}
                  placeholder="Merchant (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={expense.merchant}
                />
                <CategoryDropdown
                  categories={money?.categories.filter((item) => item.type === expense.type) ?? []}
                  onDelete={(categoryId) => removeCategory({ categoryId: categoryId as Id<"transactionCategories"> })}
                  onSelect={(category) => setExpense((current) => ({ ...current, category }))}
                  selected={expense.category}
                />
                <DatePickerField label="Expense date" onChange={(date) => setExpense((current) => ({ ...current, date }))} value={expense.date} />
                <TextInput
                  accessibilityLabel="Expense note"
                  onChangeText={(note) => setExpense((current) => ({ ...current, note }))}
                  placeholder="Note (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={expense.note}
                />
              </>
            ) : selected === "Task" ? (
              <>
                <TextInput
                  accessibilityLabel="Task title"
                  autoFocus
                  onChangeText={(title) => setTask((current) => ({ ...current, title }))}
                  placeholder="Task title"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.title}
                />
                <TextInput
                  accessibilityLabel="Task location"
                  onChangeText={(location) => setTask((current) => ({ ...current, location }))}
                  placeholder="Location (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.location}
                />
                <TextInput
                  accessibilityLabel="Meeting link"
                  autoCapitalize="none"
                  onChangeText={(meetingLink) => setTask((current) => ({ ...current, meetingLink }))}
                  placeholder="Meeting link (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.meetingLink}
                />
                <TextInput
                  accessibilityLabel="Task note"
                  onChangeText={(note) => setTask((current) => ({ ...current, note }))}
                  placeholder="Notes (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.note}
                />
              </>
            ) : selected === "Focus" ? (
              <View style={styles.inline}>
                <TextInput
                  accessibilityLabel="Focus hours"
                  autoFocus
                  keyboardType="number-pad"
                  onChangeText={(hours) => setFocusDuration((current) => ({ ...current, hours }))}
                  placeholder="Hours"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.grow]}
                  value={focusDuration.hours}
                />
                <TextInput
                  accessibilityLabel="Focus minutes"
                  keyboardType="number-pad"
                  onChangeText={(minutes) => setFocusDuration((current) => ({ ...current, minutes }))}
                  placeholder="Minutes"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.grow]}
                  value={focusDuration.minutes}
                />
              </View>
            ) : selected === "Payment alert" ? (
              <>
                {paymentNotificationsSupported && !notificationAccess ? (
                  <Pressable accessibilityRole="button" onPress={() => paymentNotifications?.openSettings()} style={[styles.voiceButton, { backgroundColor: appearance.primary }]}>
                    <Ionicons color={colors.surface} name="notifications-outline" size={22} />
                    <Text style={styles.voiceButtonText}>Enable payment detection</Text>
                  </Pressable>
                ) : null}
                {paymentAlerts.length ? (
                  <Surface>
                    {paymentAlerts.slice(0, 3).map((alert) => (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: selectedAlertKey === alert.key }}
                        key={alert.key}
                        onPress={() => {
                          setSelectedAlertKey(alert.key);
                          setValue(alert.text);
                        }}
                        style={[styles.alertRow, selectedAlertKey === alert.key && { backgroundColor: appearance.surface }]}
                      >
                        <Ionicons color={appearance.primaryDark} name="receipt-outline" size={20} />
                        <View style={styles.grow}>
                          <Text numberOfLines={2} style={styles.alertText}>{alert.text}</Text>
                          <Text style={styles.typeDetail}>{new Date(alert.postedAt).toLocaleString()}</Text>
                        </View>
                        {selectedAlertKey === alert.key ? <Ionicons color={appearance.primaryDark} name="checkmark-circle" size={20} /> : null}
                      </Pressable>
                    ))}
                  </Surface>
                ) : null}
                <TextInput
                  accessibilityLabel="Payment notification text"
                  autoFocus
                  multiline
                  onChangeText={setValue}
                  placeholder={paymentNotificationsSupported ? "Payment notification" : "Paste a UPI or payment notification"}
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.captureInput]}
                  value={value}
                />
                <Text style={styles.typeDetail}>Successful payments save as pending. Failed or refunded payments are ignored.</Text>
              </>
            ) : (
              <>
                {selected === "Voice" ? (
                  <Pressable accessibilityRole="button" onPress={recognizing ? () => ExpoSpeechRecognitionModule.stop() : startVoiceCapture} style={[styles.voiceButton, { backgroundColor: appearance.primary }]}>
                    <Ionicons color={colors.surface} name={recognizing ? "stop" : "mic"} size={22} />
                    <Text style={styles.voiceButtonText}>{recognizing ? "Stop listening" : "Start voice capture"}</Text>
                  </Pressable>
                ) : null}
                {voiceMessage ? <Text style={styles.typeDetail}>{voiceMessage}</Text> : null}
                <TextInput
                  accessibilityLabel={`${selected} details`}
                  autoFocus
                  multiline
                  onChangeText={(text) => {
                    setValue(text);
                    setExtracted(parseCapture(text));
                  }}
                  placeholder={`Describe your ${selected.toLowerCase()}`}
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.captureInput]}
                  value={value}
                />
                {extracted.map((action, index) => (
                  <Surface key={`${action.type}-${index}`} style={styles.preview}>
                    <Text style={styles.typeTitle}>{action.type === "move" ? "Move unfinished tasks" : action.type}</Text>
                    {action.warnings.map((warning) => <Text key={warning} style={styles.warning}>{warning}</Text>)}
                    {action.type === "expense" ? (
                      <>
                        <TextInput accessibilityLabel="Extracted amount" keyboardType="decimal-pad" onChangeText={(amount) => setExtracted((items) => items.map((item, i) => i === index && item.type === "expense" ? { ...item, amount } : item))} placeholder="Amount" placeholderTextColor={colors.muted} style={styles.input} value={action.amount} />
                        <TextInput accessibilityLabel="Extracted category" onChangeText={(category) => setExtracted((items) => items.map((item, i) => i === index && item.type === "expense" ? { ...item, category } : item))} placeholder="Category" placeholderTextColor={colors.muted} style={styles.input} value={action.category} />
                        <Text style={styles.typeDetail}>Saves as pending preview.</Text>
                      </>
                    ) : action.type === "focus" ? (
                      <TextInput accessibilityLabel="Extracted focus minutes" keyboardType="number-pad" onChangeText={(minutes) => setExtracted((items) => items.map((item, i) => i === index && item.type === "focus" ? { ...item, minutes } : item))} placeholder="Minutes" placeholderTextColor={colors.muted} style={styles.input} value={action.minutes} />
                    ) : action.type === "move" ? (
                      <TextInput accessibilityLabel="Except task text" onChangeText={(exceptText) => setExtracted((items) => items.map((item, i) => i === index && item.type === "move" ? { ...item, exceptText } : item))} placeholder="Except text" placeholderTextColor={colors.muted} style={styles.input} value={action.exceptText} />
                    ) : (
                      <>
                        <TextInput accessibilityLabel="Extracted task title" onChangeText={(title) => setExtracted((items) => items.map((item, i) => i === index && item.type === "task" ? { ...item, title } : item))} placeholder="Task title" placeholderTextColor={colors.muted} style={styles.input} value={action.title} />
                        <TextInput accessibilityLabel="Reminder lead minutes" keyboardType="number-pad" onChangeText={(reminderLeadMinutes) => setExtracted((items) => items.map((item, i) => i === index && item.type === "task" ? { ...item, reminderLeadMinutes } : item))} placeholder="Reminder minutes" placeholderTextColor={colors.muted} style={styles.input} value={action.reminderLeadMinutes} />
                      </>
                    )}
                    <Pressable accessibilityRole="button" onPress={() => setExtracted((items) => items.filter((_, i) => i !== index))} style={styles.removePreview}>
                      <Text style={styles.removePreviewText}>Discard row</Text>
                    </Pressable>
                  </Surface>
                ))}
              </>
            )}
            <PrimaryButton label={selected === "Note" || selected === "Voice" ? "Confirm all" : selected === "Payment alert" ? "Detect payment" : selected === "Focus" || selected === "Expense" || selected === "Task" || value.trim() ? `Save ${selected.toLowerCase()}` : "Add details"} onPress={save} />
            {syncMessage ? <Text style={styles.syncText}>{syncMessage}</Text> : null}
            <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={styles.changeType}>
              <Text style={[styles.changeTypeText, { color: appearance.primaryDark }]}>Choose another type</Text>
            </Pressable>
          </View>
        ) : (
          <Surface>
            {types.map(([title, detail, icon, background]) => (
              <Pressable accessibilityRole="button" key={title} onPress={() => setSelected(title)} style={styles.typeRow}>
                <View style={[styles.typeIcon, { backgroundColor: background }]}>
                  <Ionicons color={colors.primaryDark} name={icon} size={22} />
                </View>
                <View style={styles.grow}>
                  <Text style={styles.typeTitle}>{title}</Text>
                  <Text style={styles.typeDetail}>{detail}</Text>
                </View>
                <Ionicons color={colors.muted} name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </Surface>
        )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(47,58,51,0.42)" },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" },
  sheetContent: { padding: spacing.lg },
  handle: { alignSelf: "center", backgroundColor: colors.border, borderRadius: radii.pill, height: 4, marginBottom: spacing.lg, width: 48 },
  headingRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  headingCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  close: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  typeRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.md, minHeight: 68, paddingHorizontal: spacing.md },
  typeIcon: { alignItems: "center", borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  grow: { flex: 1 },
  typeTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  typeDetail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  confirmation: { gap: spacing.md },
  selectedLabel: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: spacing.md },
  captureInput: { minHeight: 88, paddingTop: spacing.md, textAlignVertical: "top" },
  changeType: { alignItems: "center", minHeight: 44, paddingTop: spacing.sm },
  changeTypeText: { color: colors.primaryDark, fontSize: 14, fontWeight: "600" },
  preview: { gap: spacing.sm, padding: spacing.md },
  warning: { color: colors.coral, fontSize: 12, fontWeight: "700" },
  removePreview: { minHeight: 44, justifyContent: "center" },
  removePreviewText: { color: colors.coral, fontSize: 14, fontWeight: "700" },
  syncText: { color: colors.primaryDark, fontSize: 13, fontWeight: "600", textAlign: "center" },
  voiceButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.control, flexDirection: "row", gap: spacing.sm, justifyContent: "center", minHeight: 48 },
  voiceButtonText: { color: colors.surface, fontSize: 15, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  inline: { flexDirection: "row", gap: spacing.sm },
  alertRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 64, padding: spacing.md },
  alertText: { color: colors.text, fontSize: 13, lineHeight: 18 },
});
