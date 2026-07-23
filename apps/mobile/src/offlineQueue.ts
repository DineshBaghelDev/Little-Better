import AsyncStorage from "@react-native-async-storage/async-storage";

const queueKey = (ownerId: string) => `little-better:${ownerId}:offline-queue`;
const timerKey = (ownerId: string) => `little-better:${ownerId}:active-timer`;

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

async function readQueue(ownerId: string) {
  const raw = await AsyncStorage.getItem(queueKey(ownerId));
  return raw ? (JSON.parse(raw) as QueueItem[]) : [];
}

async function writeQueue(ownerId: string, items: QueueItem[]) {
  await AsyncStorage.setItem(queueKey(ownerId), JSON.stringify(items));
}

export async function enqueueOffline(ownerId: string, type: QueueItem["type"], payload: any) {
  const items = await readQueue(ownerId);
  items.push({ createdAt: Date.now(), id: `${Date.now()}-${Math.random()}`, payload, type } as QueueItem);
  await writeQueue(ownerId, items);
}

export async function flushOfflineQueue(ownerId: string, handlers: Record<QueueItem["type"], (payload: any) => Promise<unknown>>) {
  const items = await readQueue(ownerId);
  const remaining: QueueItem[] = [];
  for (const item of items) {
    try {
      await handlers[item.type](item.payload);
    } catch {
      remaining.push(item);
    }
  }
  await writeQueue(ownerId, remaining);
  return remaining.length;
}

export async function saveLocalTimer(ownerId: string, timer: LocalTimer | null) {
  if (!timer) await AsyncStorage.removeItem(timerKey(ownerId));
  else await AsyncStorage.setItem(timerKey(ownerId), JSON.stringify(timer));
}

export async function readLocalTimer(ownerId: string) {
  const raw = await AsyncStorage.getItem(timerKey(ownerId));
  return raw ? (JSON.parse(raw) as LocalTimer) : null;
}
