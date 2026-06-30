import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Share, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { type, radius, space, elevate } from '../theme/theme';
import useReducedMotion from '../hooks/useReducedMotion';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Ticket-style date stamp from a YYYY-MM-DD string (no timezone surprises).
function stampDate(dateStr) {
  const [y, m, d] = (dateStr || '').split('-').map(Number);
  if (!y) return '';
  return `${MONTHS[(m || 1) - 1]} ${d} · ${y}`;
}

// Sports-desk verdict, lower-third register.
function verdict(score, total) {
  if (total && score === total) return 'Perfect card.';
  const r = total ? score / total : 0;
  if (r >= 0.7) return 'Strong showing.';
  if (r >= 0.43) return 'Right in the mix.';
  if (r >= 0.15) return 'Room to run.';
  return 'Shut out. Run it back.';
}

export default function ResultsScreen({ score, total, streak, results, questions, date, theme, onOpenStats }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const cardRef = useRef(null);

  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.85)).current;
  const fade = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const sheen = useRef(new Animated.Value(-1)).current;
  const [shown, setShown] = useState(reduceMotion ? score : 0);

  // Build the cell colors: prefer the real per-question grid, else fall back to
  // score (front-loaded greens) so a replay still renders a sensible card.
  const cells = (results && results.length === total)
    ? results.map((r) => r === 'correct')
    : Array.from({ length: total }, (_, i) => i < score);

  const leagues = (questions || []).map((q) => q.league);

  useEffect(() => {
    if (reduceMotion) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      // One slow foil sweep across the card after it lands.
      Animated.timing(sheen, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    });
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= score) clearInterval(t);
    }, 200);
    return () => clearInterval(t);
  }, [reduceMotion]);

  const emojiGrid = cells.map((c) => (c ? '🟩' : '🟥')).join('');
  const shareText = `Daily Drop ⚾🏈  ${stampDate(date)}\n${score}/${total}  ${emojiGrid}\n🔥 ${streak}-day streak — daily MLB + NFL quiz`;

  // Prefer sharing the rendered scorecard as an image — far more clickable in a
  // feed than text. Falls back to the emoji-grid text (e.g. in Expo Go, where
  // the native capture module isn't available).
  const onShare = async () => {
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Daily Drop',
        });
        return;
      }
    } catch {
      // fall through to text
    }
    Share.share({ message: shareText });
  };

  const sheenX = sheen.interpolate({ inputRange: [-1, 1], outputRange: [-width, width] });

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.body}>
        <Animated.View style={{ width: '100%', opacity: fade, transform: [{ scale }] }}>
          {/* THE SCORECARD — a collectible, screenshot-ready object. */}
          <View ref={cardRef} collapsable={false} style={[styles.card, elevate(theme, 2)]}>
            <LinearGradient
              colors={['#173A6B', '#0C1A30', '#080E1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardFill}
            >
              {/* header: wordmark + ticket date + league marks */}
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.cardBrand}>DAILY DROP</Text>
                  <Text style={styles.cardDate}>{stampDate(date)}</Text>
                </View>
                <View style={styles.marks}>
                  <Text style={styles.markEmoji}>⚾</Text>
                  <Text style={styles.markEmoji}>🏈</Text>
                </View>
              </View>

              {/* the score, stat-line big */}
              <View style={styles.scoreRow}>
                <Text style={styles.score}>{shown}</Text>
                <Text style={styles.scoreTotal}>/{total}</Text>
              </View>
              <Text style={styles.verdict}>{verdict(score, total)}</Text>

              {/* the grid as a designed element */}
              <View style={styles.grid}>
                {cells.map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.gridCell,
                      {
                        backgroundColor: c ? theme.correct : theme.wrong,
                        borderColor: c ? theme.correct : theme.wrong,
                      },
                    ]}
                  >
                    <Text style={styles.gridGlyph}>{c ? '✓' : '✕'}</Text>
                  </View>
                ))}
              </View>

              {/* streak — the electric scoreboard light */}
              <View style={styles.streakStrip}>
                <Text style={styles.streakFlame}>🔥</Text>
                <Text style={styles.streakNum}>{streak}</Text>
                <Text style={styles.streakLabel}>DAY STREAK</Text>
              </View>

              {/* foil sheen sweep */}
              <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { transform: [{ translateX: sheenX }, { rotate: '18deg' }] }]}
              >
                <LinearGradient
                  colors={theme.foil}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sheen}
                />
              </Animated.View>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.shareBtn,
            { backgroundColor: theme.electric, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={styles.shareText}>Share result</Text>
        </Pressable>
        <Pressable
          onPress={onOpenStats}
          accessibilityRole="button"
          style={({ pressed }) => [styles.statsBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.statsText, { color: theme.text }]}>📊  View your stats</Text>
        </Pressable>
        <Text style={[styles.comeBack, { color: theme.textMuted }]}>
          New questions drop tomorrow
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space(6) },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', borderRadius: radius.xl, overflow: 'hidden' },
  cardFill: { padding: space(6), overflow: 'hidden' },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space(6),
  },
  cardBrand: { color: '#FFFFFF', fontSize: type.sizes.lg, ...type.display, letterSpacing: 1.5 },
  cardDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: type.sizes.xs,
    ...type.bodySemi,
    letterSpacing: 2,
    marginTop: 2,
  },
  marks: { flexDirection: 'row', gap: space(1) },
  markEmoji: { fontSize: 22 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end' },
  score: { color: '#FFFFFF', fontSize: type.sizes.mega, ...type.display, lineHeight: type.sizes.mega },
  scoreTotal: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: type.sizes.xxl,
    ...type.display,
    marginBottom: space(3),
    marginLeft: space(1),
  },
  verdict: {
    color: '#FFFFFF',
    fontSize: type.sizes.xl,
    ...type.displaySemi,
    marginTop: space(1),
    marginBottom: space(6),
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginBottom: space(6) },
  gridCell: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridGlyph: { color: '#FFFFFF', fontSize: type.sizes.md, ...type.bodyBold },
  streakStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(2),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: space(3.5),
    paddingVertical: space(2),
    borderRadius: radius.pill,
  },
  streakFlame: { fontSize: 16 },
  streakNum: { color: '#FFC02E', fontSize: type.sizes.xl, ...type.display },
  streakLabel: { color: 'rgba(255,255,255,0.8)', fontSize: type.sizes.xs, ...type.bodyBold, letterSpacing: 1.5 },
  sheen: { width: 90, height: '260%', marginTop: '-30%' },
  footer: { paddingBottom: space(4) },
  shareBtn: {
    height: 58,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { color: '#1A1200', fontSize: type.sizes.lg, ...type.display, letterSpacing: 0.5 },
  statsBtn: { marginTop: space(4), alignSelf: 'center', paddingVertical: space(2) },
  statsText: { fontSize: type.sizes.md, ...type.bodySemi },
  comeBack: { marginTop: space(3), fontSize: type.sizes.sm, ...type.bodyMed, textAlign: 'center' },
});
