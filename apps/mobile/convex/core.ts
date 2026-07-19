import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

const MS_PER_HOUR = 60 * 60 * 1000;
const DAY_MS = 24 * MS_PER_HOUR;

const targetType = v.union(
  v.literal("sessions_per_week"),
  v.literal("minutes_per_day"),
  v.literal("minutes_per_week"),
  v.literal("binary_days"),
);

const focusCategory = v.object({
  _id: v.id("focusCategories"),
  _creationTime: v.number(),
  name: v.string(),
  preferredHour: v.optional(v.number()),
  targetType,
  targetValue: v.optional(v.number()),
});

const task = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  completedAt: v.optional(v.number()),
  location: v.optional(v.string()),
  meetingLink: v.optional(v.string()),
  note: v.optional(v.string()),
  scheduledAt: v.optional(v.number()),
  status: v.union(v.literal("planned"), v.literal("done")),
  title: v.string(),
});

const transaction = v.object({
  _id: v.id("transactions"),
  _creationTime: v.number(),
  accountId: v.optional(v.id("accounts")),
  amount: v.number(),
  category: v.string(),
  merchant: v.optional(v.string()),
  note: v.optional(v.string()),
  occurredAt: v.number(),
  paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("online"))),
  status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("ignored")),
  type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
});

const account = v.object({
  _id: v.id("accounts"),
  _creationTime: v.number(),
  archived: v.optional(v.boolean()),
  balance: v.number(),
  baseBalance: v.number(),
  name: v.string(),
});

const transactionCategory = v.object({
  _id: v.id("transactionCategories"),
  _creationTime: v.number(),
  name: v.string(),
  type: v.union(v.literal("expense"), v.literal("income")),
});

const activeTimer = v.object({
  _id: v.id("activeTimers"),
  _creationTime: v.number(),
  categoryId: v.id("focusCategories"),
  elapsedSeconds: v.number(),
  startedAt: v.number(),
  status: v.union(v.literal("running"), v.literal("paused")),
});

const settings = v.object({
  _id: v.id("appSettings"),
  _creationTime: v.number(),
  focusCategoryId: v.id("focusCategories"),
  monthlyBudget: v.number(),
  onboardedAt: v.number(),
  reflectionHour: v.number(),
});

const weeklyInsightStatus = v.union(v.literal("new"), v.literal("applied"), v.literal("dismissed"));

const weeklyInsight = v.object({
  _id: v.id("weeklyInsights"),
  _creationTime: v.number(),
  actionHour: v.optional(v.number()),
  actionType: v.optional(v.literal("move_focus_reminder")),
  appliedAt: v.optional(v.number()),
  createdAt: v.number(),
  evidence: v.string(),
  observation: v.string(),
  previousHour: v.optional(v.number()),
  status: weeklyInsightStatus,
  suggestedAction: v.string(),
});

const weeklyInsightPreview = v.object({
  _id: v.optional(v.id("weeklyInsights")),
  actionHour: v.optional(v.number()),
  actionType: v.optional(v.literal("move_focus_reminder")),
  evidence: v.string(),
  observation: v.string(),
  status: weeklyInsightStatus,
  suggestedAction: v.string(),
});

const todayTaskTone = v.union(v.literal("normal"), v.literal("warning"));

const todayItem = v.union(
  v.object({
    kind: v.literal("timer"),
    rank: v.number(),
    reason: v.string(),
    timer: activeTimer,
  }),
  v.object({
    kind: v.literal("task"),
    rank: v.number(),
    reason: v.string(),
    task,
    tone: todayTaskTone,
  }),
  v.object({
    kind: v.literal("focus"),
    progressLabel: v.string(),
    rank: v.number(),
    reason: v.string(),
  }),
);

function startOfDay(value: number) {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

function startOfWeek(value: number) {
  const day = new Date(startOfDay(value));
  const daysSinceMonday = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - daysSinceMonday);
  return day.getTime();
}

function localDateKey(value: number) {
  const date = new Date(value);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

function minutesUntil(from: number, to: number) {
  return Math.max(1, Math.ceil((to - from) / (60 * 1000)));
}

function focusProgressLabel(
  focus: Doc<"focusCategories">,
  sessions: { completedAt: number; durationMinutes: number }[],
  now: number,
) {
  const target = Math.max(1, focus.targetValue ?? (focus.targetType === "sessions_per_week" ? 3 : 1));
  if (focus.targetType === "minutes_per_day") {
    const todayStart = startOfDay(now);
    const minutes = sessions
      .filter((session) => session.completedAt >= todayStart)
      .reduce((total, session) => total + session.durationMinutes, 0);
    return { complete: minutes >= target, label: `${minutes} of ${target} minutes today` };
  }
  if (focus.targetType === "minutes_per_week") {
    const minutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
    return { complete: minutes >= target, label: `${minutes} of ${target} minutes this week` };
  }
  if (focus.targetType === "binary_days") {
    const days = new Set(sessions.map((session) => startOfDay(session.completedAt)));
    return { complete: days.size >= target, label: `${days.size} of ${target} days this week` };
  }
  return { complete: sessions.length >= target, label: `${sessions.length} of ${target} sessions this week` };
}

function hourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display} ${suffix}`;
}

function computedFocusTimeInsight(focus: Doc<"focusCategories"> | null, sessions: Doc<"focusSessions">[]) {
  if (!focus || sessions.length < 5) {
    return {
      insight: null,
      requirement: `Record 5 focus sessions in this range; ${sessions.length} recorded.`,
    };
  }

  const counts = new Map<number, number>();
  for (const session of sessions) {
    const hour = new Date(session.completedAt).getHours();
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [topHour, topCount] = ranked[0] ?? [focus.preferredHour ?? 9, 0];
  const secondCount = ranked[1]?.[1] ?? 0;

  if (topCount < 3 || topCount - secondCount < 2 || topHour === focus.preferredHour) {
    return {
      insight: null,
      requirement: "Record 5 sessions with a clear time pattern; the current range is too even.",
    };
  }

  const actionHour = Math.max(0, Math.min(23, topHour));
  return {
    insight: {
      actionHour,
      actionType: "move_focus_reminder" as const,
      evidence: `${topCount} of ${sessions.length} ${focus.name} sessions were around ${hourLabel(topHour)}; the next strongest hour had ${secondCount}.`,
      observation: `Your ${focus.name} sessions cluster around ${hourLabel(topHour)}.`,
      status: "new" as const,
      suggestedAction: `Move the ${focus.name} focus reminder to ${hourLabel(actionHour)}.`,
    },
    requirement: null,
  };
}

async function firstActiveTimer(ctx: QueryCtx | MutationCtx) {
  return (
    (await ctx.db
      .query("activeTimers")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .order("desc")
      .first()) ??
    (await ctx.db
      .query("activeTimers")
      .withIndex("by_status", (q) => q.eq("status", "paused"))
      .order("desc")
      .first())
  );
}

async function firstAccount(ctx: QueryCtx | MutationCtx) {
  return (await ctx.db.query("accounts").take(1))[0] ?? null;
}

export const onboardingStatus = query({
  args: {},
  returns: v.object({ onboarded: v.boolean() }),
  handler: async (ctx) => ({
    onboarded: (await ctx.db.query("appSettings").order("desc").first()) !== null,
  }),
});

export const bootstrap = mutation({
  args: {
    focusName: v.string(),
    monthlyBudget: v.number(),
    preferredHour: v.number(),
    reflectionHour: v.number(),
    targetType,
    targetValue: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (await ctx.db.query("appSettings").order("desc").first()) return null;

    const now = Date.now();
    const categoryId = await ctx.db.insert("focusCategories", {
      name: args.focusName.trim() || "Study",
      preferredHour: Math.max(0, Math.min(23, Math.round(args.preferredHour))),
      targetType: args.targetType,
      targetValue: Math.max(1, Math.min(1000, Math.round(args.targetValue))),
    });
    await ctx.db.insert("appSettings", {
      focusCategoryId: categoryId,
      monthlyBudget: Math.max(0, args.monthlyBudget),
      onboardedAt: now,
      reflectionHour: Math.max(17, Math.min(23, Math.round(args.reflectionHour))),
    });
    await ctx.db.insert("tasks", {
      title: "Plan tomorrow's first task",
      scheduledAt: now + MS_PER_HOUR,
      status: "planned",
    });
    return null;
  },
});

export const today = query({
  args: {},
  returns: v.object({
    activeTimer: v.union(activeTimer, v.null()),
    budgetAlert: v.union(
      v.object({
        budget: v.number(),
        overBy: v.number(),
        spent: v.number(),
      }),
      v.null(),
    ),
    focusCategory: v.union(focusCategory, v.null()),
    focusProgressLabel: v.string(),
    focusSessionsThisWeek: v.number(),
    laterToday: v.array(v.object({ reason: v.string(), task })),
    pendingTransactions: v.array(transaction),
    rankedItems: v.array(todayItem),
    reflectionDue: v.boolean(),
    settings: v.union(settings, v.null()),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const dayStart = startOfDay(now);
    const dayEnd = dayStart + DAY_MS;
    const weekStart = startOfWeek(now);
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    const focus = settingsDoc ? await ctx.db.get(settingsDoc.focusCategoryId) : null;
    const overdueTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status_and_scheduledAt", (q) =>
        q.eq("status", "planned").lt("scheduledAt", now),
      )
      .order("desc")
      .take(20);
    const todayTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status_and_scheduledAt", (q) =>
        q.eq("status", "planned").gte("scheduledAt", now).lt("scheduledAt", dayEnd),
      )
      .take(50);
    const pendingTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(3);
    const [lastReflection] = await ctx.db.query("reflections").order("desc").take(1);
    const dismissal = await ctx.db
      .query("reflectionDismissals")
      .withIndex("by_dateKey", (q) => q.eq("dateKey", localDateKey(now)))
      .order("desc")
      .first();
    const focusSessions = focus
      ? await ctx.db
          .query("focusSessions")
          .withIndex("by_category_and_completedAt", (q) =>
            q.eq("categoryId", focus._id).gte("completedAt", weekStart).lte("completedAt", now),
          )
          .take(200)
      : [];
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const confirmedThisMonth = await ctx.db
      .query("transactions")
      .withIndex("by_status_and_occurredAt", (q) =>
        q.eq("status", "confirmed").gte("occurredAt", monthStart.getTime()).lt("occurredAt", monthEnd.getTime()),
      )
      .take(200);
    const spent = confirmedThisMonth.reduce(
      (total, item) => total + ((item.type ?? "expense") === "expense" ? item.amount : 0),
      0,
    );
    const timer = await firstActiveTimer(ctx);
    const progress = focus ? focusProgressLabel(focus, focusSessions, now) : { complete: true, label: "" };
    const rankedItems: Array<
      | { kind: "timer"; rank: number; reason: string; timer: NonNullable<typeof timer> }
      | { kind: "task"; rank: number; reason: string; task: (typeof todayTasks)[number]; tone: "normal" | "warning" }
      | { kind: "focus"; progressLabel: string; rank: number; reason: string }
    > = [];
    const usedTaskIds = new Set<string>();
    const pushTask = (taskDoc: (typeof todayTasks)[number], reason: string, tone: "normal" | "warning") => {
      if (rankedItems.length >= 3 || usedTaskIds.has(taskDoc._id)) return;
      usedTaskIds.add(taskDoc._id);
      rankedItems.push({ kind: "task", rank: rankedItems.length + 1, reason, task: taskDoc, tone });
    };

    if (timer) rankedItems.push({ kind: "timer", rank: 1, reason: "Active now", timer });
    const overdue = overdueTasks[0];
    if (overdue) pushTask(overdue, "Overdue", "warning");
    const soon = todayTasks.find((item) => (item.scheduledAt ?? dayEnd) <= now + MS_PER_HOUR);
    if (soon) pushTask(soon, `Starts in ${minutesUntil(now, soon.scheduledAt ?? now)} min`, "normal");
    const preferredHour = focus?.preferredHour ?? 9;
    const focusIsDue = new Date(now).getHours() >= preferredHour;
    if (focus && focusIsDue && !progress.complete && rankedItems.length < 3) {
      rankedItems.push({
        kind: "focus",
        progressLabel: progress.label,
        rank: rankedItems.length + 1,
        reason: "Target due",
      });
    }
    const next = todayTasks.find((item) => !usedTaskIds.has(item._id));
    if (next) pushTask(next, "Next up", "normal");
    const laterToday = todayTasks
      .filter((item) => !usedTaskIds.has(item._id))
      .map((item) => ({ reason: item.scheduledAt && item.scheduledAt <= now + MS_PER_HOUR ? `Starts in ${minutesUntil(now, item.scheduledAt)} min` : "Later today", task: item }));

    return {
      activeTimer: timer,
      budgetAlert:
        settingsDoc && settingsDoc.monthlyBudget > 0 && spent > settingsDoc.monthlyBudget
          ? { budget: settingsDoc.monthlyBudget, overBy: spent - settingsDoc.monthlyBudget, spent }
          : null,
      focusCategory: focus,
      focusProgressLabel: progress.label,
      focusSessionsThisWeek: focusSessions.length,
      laterToday,
      pendingTransactions,
      rankedItems,
      reflectionDue:
        !!settingsDoc &&
        new Date(now).getHours() >= settingsDoc.reflectionHour &&
        (!lastReflection || lastReflection.reflectedAt < dayStart) &&
        (!dismissal || (dismissal.action === "snooze" && (dismissal.snoozeUntil ?? 0) <= now)),
      settings: settingsDoc,
    };
  },
});

export const settingsView = query({
  args: {},
  returns: v.object({
    focusCategories: v.array(focusCategory),
    focusCategory: v.union(focusCategory, v.null()),
    settings: v.union(settings, v.null()),
  }),
  handler: async (ctx) => {
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    return {
      focusCategories: await ctx.db.query("focusCategories").take(50),
      focusCategory: settingsDoc ? await ctx.db.get(settingsDoc.focusCategoryId) : null,
      settings: settingsDoc,
    };
  },
});

export const updateSettings = mutation({
  args: {
    focusName: v.string(),
    monthlyBudget: v.number(),
    preferredHour: v.number(),
    reflectionHour: v.number(),
    targetType,
    targetValue: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    if (!settingsDoc) return null;
    const currentFocus = await ctx.db.get(settingsDoc.focusCategoryId);
    const focusName = args.focusName.trim() || currentFocus?.name || "Focus";
    const preferredHour = Math.max(0, Math.min(23, Math.round(args.preferredHour)));
    const targetValue = Math.max(1, Math.min(1000, Math.round(args.targetValue)));
    let focusCategoryId = settingsDoc.focusCategoryId;

    if (!currentFocus || currentFocus.name.trim().toLowerCase() !== focusName.toLowerCase()) {
      focusCategoryId = await ctx.db.insert("focusCategories", {
        name: focusName,
        preferredHour,
        targetType: args.targetType,
        targetValue,
      });
    } else {
      await ctx.db.patch(currentFocus._id, {
        preferredHour,
        targetType: args.targetType,
        targetValue,
      });
    }

    await ctx.db.patch(settingsDoc._id, {
      focusCategoryId,
      monthlyBudget: Math.max(0, Math.round(args.monthlyBudget)),
      reflectionHour: Math.max(17, Math.min(23, Math.round(args.reflectionHour))),
    });
    return null;
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { completedAt: Date.now(), status: "done" });
    return null;
  },
});

export const undoCompleteTask = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { completedAt: undefined, status: "planned" });
    return null;
  },
});

export const insights = query({
  args: { from: v.number(), to: v.number() },
  returns: v.object({
    appliedInsight: v.union(weeklyInsight, v.null()),
    categorySummary: v.array(v.object({ amount: v.number(), category: v.string() })),
    completedTasks: v.number(),
    currentInsight: v.union(weeklyInsightPreview, v.null()),
    focusCategoryName: v.string(),
    focusMinutes: v.number(),
    focusSessions: v.number(),
    insightRequirement: v.union(v.string(), v.null()),
    reflectionSummary: v.array(v.object({ count: v.number(), tag: v.string() })),
    spent: v.number(),
  }),
  handler: async (ctx, args) => {
    const from = Math.max(0, Math.min(args.from, args.to));
    const to = Math.min(Math.max(args.from, args.to), from + 366 * 24 * MS_PER_HOUR);
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    const focus = settingsDoc ? await ctx.db.get(settingsDoc.focusCategoryId) : null;
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_status_and_completedAt", (q) =>
        q.eq("status", "done").gte("completedAt", from).lte("completedAt", to),
      )
      .take(200);
    const sessions = focus
      ? await ctx.db
          .query("focusSessions")
          .withIndex("by_category_and_completedAt", (q) =>
            q.eq("categoryId", focus._id).gte("completedAt", from).lte("completedAt", to),
          )
          .take(200)
      : [];
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_status_and_occurredAt", (q) =>
        q.eq("status", "confirmed").gte("occurredAt", from).lte("occurredAt", to),
      )
      .take(200);
    const reflections = await ctx.db
      .query("reflections")
      .withIndex("by_reflectedAt", (q) => q.gte("reflectedAt", from).lte("reflectedAt", to))
      .take(100);
    const [currentInsight] = await ctx.db
      .query("weeklyInsights")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "new"))
      .order("desc")
      .take(1);
    const [appliedInsight] = await ctx.db
      .query("weeklyInsights")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "applied"))
      .order("desc")
      .take(1);
    const [dismissedInsight] = await ctx.db
      .query("weeklyInsights")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "dismissed"))
      .order("desc")
      .take(1);
    const focusMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
    const expenses = transactions.filter((item) => (item.type ?? "expense") === "expense");
    const categoryTotals = new Map<string, number>();
    for (const item of expenses) categoryTotals.set(item.category, (categoryTotals.get(item.category) ?? 0) + item.amount);
    const tagTotals = new Map<string, number>();
    for (const reflection of reflections) {
      for (const tag of reflection.tags) tagTotals.set(tag, (tagTotals.get(tag) ?? 0) + 1);
    }
    const computed = currentInsight || dismissedInsight ? { insight: null, requirement: null } : computedFocusTimeInsight(focus, sessions);

    return {
      appliedInsight: appliedInsight ?? null,
      categorySummary: [...categoryTotals.entries()]
        .map(([category, amount]) => ({ amount, category }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
      completedTasks: tasks.length,
      currentInsight: currentInsight ?? dismissedInsight ?? computed.insight,
      focusCategoryName: focus?.name ?? "Focus",
      focusMinutes,
      focusSessions: sessions.length,
      insightRequirement: computed.requirement,
      reflectionSummary: [...tagTotals.entries()]
        .map(([tag, count]) => ({ count, tag }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      spent: expenses.reduce((total, item) => total + item.amount, 0),
    };
  },
});

export const setWeeklyInsightStatus = mutation({
  args: { insightId: v.id("weeklyInsights"), status: weeklyInsightStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.insightId, { status: args.status });
    return null;
  },
});

export const applyWeeklyInsight = mutation({
  args: {
    actionHour: v.number(),
    evidence: v.string(),
    insightId: v.optional(v.id("weeklyInsights")),
    observation: v.string(),
    suggestedAction: v.string(),
  },
  returns: v.id("weeklyInsights"),
  handler: async (ctx, args) => {
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    if (!settingsDoc) throw new Error("App settings are required before applying insights.");
    const focus = await ctx.db.get(settingsDoc.focusCategoryId);
    if (!focus) throw new Error("Focus category is required before applying insights.");
    const actionHour = Math.max(0, Math.min(23, Math.round(args.actionHour)));
    const previousHour = focus.preferredHour;
    await ctx.db.patch(focus._id, { preferredHour: actionHour });

    if (args.insightId) {
      await ctx.db.patch(args.insightId, {
        actionHour,
        actionType: "move_focus_reminder",
        appliedAt: Date.now(),
        previousHour,
        status: "applied",
      });
      return args.insightId;
    }

    return await ctx.db.insert("weeklyInsights", {
      actionHour,
      actionType: "move_focus_reminder",
      appliedAt: Date.now(),
      createdAt: Date.now(),
      evidence: args.evidence,
      observation: args.observation,
      previousHour,
      status: "applied",
      suggestedAction: args.suggestedAction,
    });
  },
});

export const dismissWeeklyInsight = mutation({
  args: {
    actionHour: v.optional(v.number()),
    evidence: v.string(),
    insightId: v.optional(v.id("weeklyInsights")),
    observation: v.string(),
    suggestedAction: v.string(),
  },
  returns: v.id("weeklyInsights"),
  handler: async (ctx, args) => {
    if (args.insightId) {
      await ctx.db.patch(args.insightId, { status: "dismissed" });
      return args.insightId;
    }
    return await ctx.db.insert("weeklyInsights", {
      actionHour: args.actionHour,
      actionType: args.actionHour === undefined ? undefined : "move_focus_reminder",
      createdAt: Date.now(),
      evidence: args.evidence,
      observation: args.observation,
      status: "dismissed",
      suggestedAction: args.suggestedAction,
    });
  },
});

export const undoWeeklyInsight = mutation({
  args: { insightId: v.id("weeklyInsights") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const insight = await ctx.db.get(args.insightId);
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    if (!insight || !settingsDoc || insight.actionType !== "move_focus_reminder") return null;
    if (insight.previousHour !== undefined) {
      await ctx.db.patch(settingsDoc.focusCategoryId, { preferredHour: insight.previousHour });
    }
    await ctx.db.patch(args.insightId, {
      appliedAt: undefined,
      status: "new",
    });
    return null;
  },
});

export const addTask = mutation({
  args: {
    location: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    note: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (title) await ctx.db.insert("tasks", {
      location: args.location?.trim() || undefined,
      meetingLink: args.meetingLink?.trim() || undefined,
      note: args.note?.trim() || undefined,
      scheduledAt: args.scheduledAt,
      title,
      status: "planned",
    });
    return null;
  },
});

export const scheduleTask = mutation({
  args: {
    location: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    note: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    taskId: v.id("tasks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      location: args.location?.trim() || undefined,
      meetingLink: args.meetingLink?.trim() || undefined,
      note: args.note?.trim() || undefined,
      scheduledAt: args.scheduledAt,
    });
    return null;
  },
});

export const addReflection = mutation({
  args: { note: v.string(), tags: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!args.note.trim() && args.tags.length === 0) return null;
    await ctx.db.insert("reflections", {
      note: args.note.trim() || undefined,
      reflectedAt: Date.now(),
      tags: args.tags,
    });
    return null;
  },
});

export const dismissReflection = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const dateKey = localDateKey(now);
    const existing = await ctx.db
      .query("reflectionDismissals")
      .withIndex("by_dateKey", (q) => q.eq("dateKey", dateKey))
      .order("desc")
      .first();
    if (existing) await ctx.db.patch(existing._id, { action: "skip", createdAt: now, snoozeUntil: undefined });
    else await ctx.db.insert("reflectionDismissals", { action: "skip", createdAt: now, dateKey });
    return null;
  },
});

export const snoozeReflection = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const dateKey = localDateKey(now);
    const existing = await ctx.db
      .query("reflectionDismissals")
      .withIndex("by_dateKey", (q) => q.eq("dateKey", dateKey))
      .order("desc")
      .first();
    if (existing?.action === "snooze") {
      await ctx.db.patch(existing._id, { action: "skip", createdAt: now, snoozeUntil: undefined });
      return null;
    }
    const snoozeUntil = now + 30 * 60 * 1000;
    if (existing) await ctx.db.patch(existing._id, { action: "snooze", createdAt: now, snoozeUntil });
    else await ctx.db.insert("reflectionDismissals", { action: "snooze", createdAt: now, dateKey, snoozeUntil });
    return null;
  },
});

export const focusState = query({
  args: {},
  returns: v.object({
    activeTimer: v.union(activeTimer, v.null()),
    focusCategory: v.union(focusCategory, v.null()),
  }),
  handler: async (ctx) => {
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    return {
      activeTimer: await firstActiveTimer(ctx),
      focusCategory: settingsDoc ? await ctx.db.get(settingsDoc.focusCategoryId) : null,
    };
  },
});

export const startFocus = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const current = await ctx.db.query("appSettings").order("desc").first();
    if (!current || (await firstActiveTimer(ctx))) return null;
    await ctx.db.insert("activeTimers", {
      categoryId: current.focusCategoryId,
      elapsedSeconds: 0,
      startedAt: Date.now(),
      status: "running",
    });
    return null;
  },
});

export const setFocusPaused = mutation({
  args: { paused: v.boolean(), timerId: v.id("activeTimers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const timer = await ctx.db.get(args.timerId);
    if (!timer) return null;
    const now = Date.now();
    const elapsedSeconds =
      timer.status === "running"
        ? timer.elapsedSeconds + Math.floor((now - timer.startedAt) / 1000)
        : timer.elapsedSeconds;
    await ctx.db.patch(args.timerId, {
      elapsedSeconds,
      startedAt: now,
      status: args.paused ? "paused" : "running",
    });
    return null;
  },
});

export const endFocus = mutation({
  args: { timerId: v.id("activeTimers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const timer = await ctx.db.get(args.timerId);
    if (!timer) return null;
    const now = Date.now();
    const elapsedSeconds =
      timer.status === "running"
        ? timer.elapsedSeconds + Math.floor((now - timer.startedAt) / 1000)
        : timer.elapsedSeconds;
    await ctx.db.insert("focusSessions", {
      categoryId: timer.categoryId,
      completedAt: now,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      source: "timer",
    });
    await ctx.db.delete(args.timerId);
    return null;
  },
});

export const addManualFocus = mutation({
  args: { minutes: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const current = await ctx.db.query("appSettings").order("desc").first();
    if (!current) return null;
    await ctx.db.insert("focusSessions", {
      categoryId: current.focusCategoryId,
      completedAt: Date.now(),
      durationMinutes: Math.max(1, Math.min(600, Math.round(args.minutes))),
      source: "manual",
    });
    return null;
  },
});

export const ensureMoneyDefaults = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    if (!(await firstAccount(ctx))) {
      await ctx.db.insert("accounts", { balance: 0, name: "Wallet" });
    }
    const existingExpenses = await ctx.db
      .query("transactionCategories")
      .withIndex("by_type", (q) => q.eq("type", "expense"))
      .take(1);
    if (!existingExpenses.length) {
      for (const name of ["Food", "Bills", "Travel", "Shopping"]) {
        await ctx.db.insert("transactionCategories", { name, type: "expense" });
      }
      await ctx.db.insert("transactionCategories", { name: "Salary", type: "income" });
    }
    return null;
  },
});

export const addExpense = mutation({
  args: {
    accountId: v.optional(v.id("accounts")),
    amount: v.number(),
    category: v.string(),
    merchant: v.optional(v.string()),
    note: v.optional(v.string()),
    occurredAt: v.optional(v.number()),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("online"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"))),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.amount) || args.amount <= 0) return null;
    const fallbackAccount = args.accountId ? null : await firstAccount(ctx);
    await ctx.db.insert("transactions", {
      accountId: args.accountId ?? fallbackAccount?._id,
      amount: Math.round(args.amount),
      category: args.category.trim() || "General",
      merchant: args.merchant?.trim() || undefined,
      note: args.note?.trim() || undefined,
      occurredAt: args.occurredAt ?? Date.now(),
      paymentMethod: args.paymentMethod ?? "online",
      status: args.status ?? "pending",
      type: args.type ?? "expense",
    });
    return null;
  },
});

export const calendar = query({
  args: { from: v.number(), to: v.number() },
  returns: v.object({
    focusSessions: v.array(v.object({
      _id: v.id("focusSessions"),
      _creationTime: v.number(),
      categoryId: v.id("focusCategories"),
      completedAt: v.number(),
      durationMinutes: v.number(),
      source: v.union(v.literal("timer"), v.literal("manual")),
    })),
    scheduledTasks: v.array(task),
    unscheduledTasks: v.array(task),
  }),
  handler: async (ctx, args) => {
    const from = Math.max(0, Math.min(args.from, args.to));
    const to = Math.min(Math.max(args.from, args.to), from + 31 * 24 * MS_PER_HOUR);
    const scheduledTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status_and_scheduledAt", (q) =>
        q.eq("status", "planned").gte("scheduledAt", from).lte("scheduledAt", to),
      )
      .take(100);
    const focus = await ctx.db.query("appSettings").order("desc").first();
    const focusSessions = focus
      ? (await ctx.db
          .query("focusSessions")
          .withIndex("by_category", (q) => q.eq("categoryId", focus.focusCategoryId))
          .order("desc")
          .take(100)).filter((session) => session.completedAt >= from && session.completedAt <= to)
      : [];
    const unscheduledTasks = (await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "planned"))
      .take(50)).filter((item) => item.scheduledAt === undefined);

    return {
      focusSessions,
      scheduledTasks: scheduledTasks.sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0)),
      unscheduledTasks,
    };
  },
});

export const money = query({
  args: { accountId: v.optional(v.id("accounts")) },
  returns: v.object({
    accounts: v.array(account),
    budget: v.number(),
    categories: v.array(transactionCategory),
    confirmed: v.array(transaction),
    netWorth: v.number(),
    pending: v.array(transaction),
    spent: v.number(),
    summary: v.array(v.object({ amount: v.number(), category: v.string(), type: v.union(v.literal("expense"), v.literal("income")) })),
  }),
  handler: async (ctx, args) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    const accounts = (await ctx.db.query("accounts").take(50)).filter((item) => !item.archived);
    const fallbackAccountId = accounts[0]?._id;
    const confirmed = await ctx.db
      .query("transactions")
      .withIndex("by_status_and_occurredAt", (q) =>
        q.eq("status", "confirmed").gte("occurredAt", monthStart).lt("occurredAt", monthEnd),
      )
      .order("desc")
      .take(50);
    const pending = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(20);
    const visibleConfirmed = args.accountId
      ? confirmed.filter((item) => (item.accountId ?? fallbackAccountId) === args.accountId)
      : confirmed;
    const visiblePending = args.accountId
      ? pending.filter((item) => (item.accountId ?? fallbackAccountId) === args.accountId)
      : pending;
    const byCategory = new Map<string, { amount: number; type: "expense" | "income" }>();
    for (const item of visibleConfirmed) {
      const type = item.type ?? "expense";
      const current = byCategory.get(item.category) ?? { amount: 0, type };
      byCategory.set(item.category, { amount: current.amount + item.amount, type });
    }
    const accountTotals = new Map(accounts.map((item) => [item._id, item.balance]));
    for (const item of confirmed) {
      const accountId = item.accountId ?? fallbackAccountId;
      if (!accountId) continue;
      const signedAmount = (item.type ?? "expense") === "income" ? item.amount : -item.amount;
      accountTotals.set(accountId, (accountTotals.get(accountId) ?? 0) + signedAmount);
    }

    return {
      accounts: accounts.map((item) => ({ ...item, baseBalance: item.balance, balance: accountTotals.get(item._id) ?? item.balance })),
      budget: settingsDoc?.monthlyBudget ?? 0,
      categories: await ctx.db.query("transactionCategories").take(50),
      confirmed: visibleConfirmed,
      netWorth: [...accountTotals.values()].reduce((total, value) => total + value, 0),
      pending: visiblePending,
      spent: visibleConfirmed.reduce((total, item) => total + ((item.type ?? "expense") === "expense" ? item.amount : 0), 0),
      summary: [...byCategory.entries()].map(([category, item]) => ({ amount: item.amount, category, type: item.type })),
    };
  },
});

export const updateTransaction = mutation({
  args: {
    accountId: v.optional(v.id("accounts")),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    merchant: v.optional(v.string()),
    note: v.optional(v.string()),
    occurredAt: v.optional(v.number()),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("online"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("ignored"))),
    transactionId: v.id("transactions"),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: Partial<{
      accountId: typeof args.accountId;
      amount: number;
      category: string;
      merchant: string;
      note: string;
      occurredAt: number;
      paymentMethod: "cash" | "online";
      status: "pending" | "confirmed" | "ignored";
      type: "expense" | "income";
    }> = {};
    if (args.accountId !== undefined) patch.accountId = args.accountId;
    if (args.amount !== undefined && Number.isFinite(args.amount) && args.amount > 0) patch.amount = Math.round(args.amount);
    if (args.category !== undefined && args.category.trim()) patch.category = args.category.trim();
    if (args.merchant !== undefined) patch.merchant = args.merchant.trim();
    if (args.note !== undefined) patch.note = args.note.trim();
    if (args.occurredAt !== undefined && Number.isFinite(args.occurredAt)) patch.occurredAt = args.occurredAt;
    if (args.paymentMethod !== undefined) patch.paymentMethod = args.paymentMethod;
    if (args.status !== undefined) patch.status = args.status;
    if (args.type !== undefined) patch.type = args.type;
    if (Object.keys(patch).length) await ctx.db.patch(args.transactionId, patch);
    return null;
  },
});

export const removeTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.transactionId);
    return null;
  },
});

export const addAccount = mutation({
  args: { balance: v.number(), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (name && Number.isFinite(args.balance)) await ctx.db.insert("accounts", { balance: Math.round(args.balance), name });
    return null;
  },
});

export const updateAccount = mutation({
  args: { accountId: v.id("accounts"), balance: v.optional(v.number()), name: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: Partial<{ balance: number; name: string }> = {};
    if (args.balance !== undefined && Number.isFinite(args.balance)) patch.balance = Math.round(args.balance);
    if (args.name !== undefined && args.name.trim()) patch.name = args.name.trim();
    if (Object.keys(patch).length) await ctx.db.patch(args.accountId, patch);
    return null;
  },
});

export const archiveAccount = mutation({
  args: { accountId: v.id("accounts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, { archived: true });
    return null;
  },
});

export const addCategory = mutation({
  args: { name: v.string(), type: v.union(v.literal("expense"), v.literal("income")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (name) await ctx.db.insert("transactionCategories", { name, type: args.type });
    return null;
  },
});

export const removeCategory = mutation({
  args: { categoryId: v.id("transactionCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.categoryId);
    return null;
  },
});
