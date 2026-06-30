import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type, radius, space, elevate } from '../theme/theme';
import { loadProgress, computeStats } from '../data/progress';

function Tile({ value, label, accent, theme }) {
  return (
    <View style={[styles.tile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.tileValue, { color: accent || theme.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function StatsScreen({ visible, onClose, onReset, theme }) {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!visible) return;
    loadProgress().then((p) => setStats(computeStats(p)));
  }, [visible]);

  const maxBar = stats ? Math.max(1, ...stats.dist) : 1;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: theme.textMuted }]}>YOUR CARD</Text>
            <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close stats"
            style={({ pressed }) => [
              styles.close,
              { backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space(8) }}>
          {!stats || stats.played === 0 ? (
            <View style={[styles.empty, { borderColor: theme.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No games yet</Text>
              <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
                Play today's drop and your streak, average and score history start
                filling in right here.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.tiles}>
                <Tile value={stats.played} label="Played" theme={theme} />
                <Tile value={`${Math.round(stats.accuracy * 100)}%`} label="Accuracy" theme={theme} />
                <Tile value={stats.currentStreak} label="Streak" accent={theme.electricText} theme={theme} />
                <Tile value={stats.maxStreak} label="Best streak" accent={theme.electricText} theme={theme} />
              </View>

              <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }, elevate(theme, 1)]}>
                <Text style={[styles.panelTitle, { color: theme.text }]}>Score distribution</Text>
                {stats.dist.map((count, score) => {
                  const pct = count / maxBar;
                  const isBest = score === stats.maxTotal;
                  return (
                    <View key={score} style={styles.barRow}>
                      <Text style={[styles.barScore, { color: theme.textSecondary }]}>{score}</Text>
                      <View style={[styles.barTrack, { backgroundColor: theme.surfaceAlt }]}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${Math.max(count ? 14 : 0, pct * 100)}%`,
                              backgroundColor: isBest ? theme.correct : theme.accent,
                            },
                          ]}
                        >
                          {count > 0 && <Text style={styles.barCount}>{count}</Text>}
                        </View>
                      </View>
                    </View>
                  );
                })}
                <Text style={[styles.perfect, { color: theme.textMuted }]}>
                  {stats.perfect} perfect {stats.perfect === 1 ? 'card' : 'cards'} ·
                  {' '}avg {stats.avg.toFixed(1)}/{stats.maxTotal}
                </Text>
              </View>
            </>
          )}

          {__DEV__ && onReset && (
            <Pressable
              onPress={onReset}
              style={[styles.devReset, { borderColor: theme.border }]}
            >
              <Text style={[styles.devResetText, { color: theme.textMuted }]}>
                Reset progress (dev)
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space(5) },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: space(2),
    marginBottom: space(6),
  },
  kicker: { fontSize: type.sizes.xs, ...type.bodyBold, letterSpacing: 2 },
  title: { fontSize: type.sizes.xxl, ...type.display, letterSpacing: 0.5 },
  close: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: type.sizes.md, ...type.bodyBold },
  empty: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space(6),
    marginTop: space(4),
  },
  emptyTitle: { fontSize: type.sizes.xl, ...type.display, marginBottom: space(2) },
  emptyBody: { fontSize: type.sizes.md, ...type.body, lineHeight: 22 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3), marginBottom: space(4) },
  tile: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space(4),
    paddingHorizontal: space(4),
  },
  tileValue: { fontSize: type.sizes.huge, ...type.display, lineHeight: type.sizes.huge },
  tileLabel: { fontSize: type.sizes.sm, ...type.bodySemi, marginTop: space(1) },
  panel: { borderWidth: 1, borderRadius: radius.lg, padding: space(5), marginTop: space(2) },
  panelTitle: { fontSize: type.sizes.lg, ...type.displaySemi, marginBottom: space(4) },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space(2.5) },
  barScore: { width: 18, fontSize: type.sizes.md, ...type.display, textAlign: 'center' },
  barTrack: { flex: 1, height: 26, borderRadius: radius.sm, marginLeft: space(3), overflow: 'hidden' },
  barFill: {
    height: '100%',
    borderRadius: radius.sm,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: space(2),
    minWidth: 26,
  },
  barCount: { color: '#FFFFFF', fontSize: type.sizes.xs, ...type.bodyBold },
  perfect: { fontSize: type.sizes.sm, ...type.bodyMed, marginTop: space(4) },
  devReset: {
    marginTop: space(8),
    alignSelf: 'center',
    paddingVertical: space(2),
    paddingHorizontal: space(4),
    borderWidth: 1,
    borderRadius: radius.pill,
    borderStyle: 'dashed',
  },
  devResetText: { fontSize: type.sizes.xs, ...type.bodySemi },
});
