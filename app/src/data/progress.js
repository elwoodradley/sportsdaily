import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sportsdaily_progress_v1';

// shape: { streak, maxStreak, lastPlayed (ISO date), history: { [date]: {score, total} } }
const empty = () => ({ streak: 0, maxStreak: 0, lastPlayed: null, history: {} });

export async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export async function recordResult(dateStr, score, total) {
  const p = await loadProgress();
  if (p.history[dateStr]) {
    // already played today; don't double-count the streak
    p.history[dateStr] = { score, total };
  } else {
    const yesterday = new Date(dateStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    p.streak = p.lastPlayed === yStr ? p.streak + 1 : 1;
    p.lastPlayed = dateStr;
    p.history[dateStr] = { score, total };
  }
  p.maxStreak = Math.max(p.maxStreak || 0, p.streak);
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
  return p;
}

// Dev-only: wipe progress so the day's set can be replayed during testing.
// Never called in production builds.
export async function resetProgress() {
  await AsyncStorage.removeItem(KEY);
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Roll up the saved history into the numbers the stats screen shows.
export function computeStats(p) {
  const days = Object.values(p.history || {});
  const played = days.length;
  const totalRight = days.reduce((s, d) => s + (d.score || 0), 0);
  const totalQ = days.reduce((s, d) => s + (d.total || 0), 0);
  const maxTotal = days.reduce((m, d) => Math.max(m, d.total || 0), 7) || 7;
  return {
    played,
    avg: played ? totalRight / played : 0,
    accuracy: totalQ ? totalRight / totalQ : 0,
    perfect: days.filter((d) => d.total && d.score === d.total).length,
    currentStreak: p.streak || 0,
    maxStreak: p.maxStreak || 0,
    maxTotal,
    // count of games ending on each possible score 0..maxTotal
    dist: Array.from({ length: maxTotal + 1 }, (_, i) => days.filter((d) => d.score === i).length),
  };
}
