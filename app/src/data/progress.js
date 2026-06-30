import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sportsdaily_progress_v1';

// shape: { streak, lastPlayed (ISO date), history: { [date]: {score, total} } }
export async function loadProgress() {
  return { streak: 0, lastPlayed: null, history: {} };
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { streak: 0, lastPlayed: null, history: {} };
    return JSON.parse(raw);
  } catch {
    return { streak: 0, lastPlayed: null, history: {} };
  }
}

export async function recordResult(dateStr, score, total) {
  const p = await loadProgress();
  if (p.history[dateStr]) {
    // already played today; don't double-count streak
    p.history[dateStr] = { score, total };
  } else {
    const yesterday = new Date(dateStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    p.streak = p.lastPlayed === yStr ? p.streak + 1 : 1;
    p.lastPlayed = dateStr;
    p.history[dateStr] = { score, total };
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
  return p;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
