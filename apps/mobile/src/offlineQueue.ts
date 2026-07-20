import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "little-better:offline-queue";
const TIMER_KEY = "little-better:active-timer";

export type QueueItem =
  | { createdAt: number; id: string; payload: any; type: "addTask" }
  | { createdAt: number; id: string; payload: any; type: "addExpense" }
  | { createdAt: number; id: string; payload: any; type: "addManualFocus" }
  | { createdAt: number; id: string; payload: any; type: "addReflection" };

export type LocalTimer = {
  categoryName: string;
  elapsedSeconds: number;
  startedAt: number;
  status: "running" | "paused";
};

async function readQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as QueueItem[]) : [];
}

async function writeQueue(items: QueueItem[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function enqueueOffline(type: QueueItem["type"], payload: any) {
  const items = await readQueue();
  items.push({ createdAt: Date.now(), id: `${Date.now()}-${Math.random()}`, payload, type } as QueueItem);
  await writeQueue(items);
}

export async function flushOfflineQueue(handlers: Record<QueueItem["type"], (payload: any) => Promise<unknown>>) {
  const items = await readQueue();
  const remaining: QueueItem[] = [];
  for (const item of items) {
    try {
      await handlers[item.type](item.payload);
    } catch {
      remaining.push(item);
    }
  }
  await writeQueue(remaining);
  return remaining.length;
}

export async function saveLocalTimer(timer: LocalTimer | null) {
  if (!timer) await AsyncStorage.removeItem(TIMER_KEY);
  else await AsyncStorage.setItem(TIMER_KEY, JSON.stringify(timer));
}

export async function readLocalTimer() {
  const raw = await AsyncStorage.getItem(TIMER_KEY);
  return raw ? (JSON.parse(raw) as LocalTimer) : null;
}
