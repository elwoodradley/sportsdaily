import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { type, radius, space, elevate, leagueTones } from '../theme/theme';
import LeagueBadge from '../components/LeagueBadge';
import ProgressDots from '../components/ProgressDots';
import MultipleChoice from '../components/MultipleChoice';
import TypedAnswer from '../components/TypedAnswer';
import useReducedMotion from '../hooks/useReducedMotion';

export default function QuizScreen({ questions, pools, streak, theme, onFinish }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState(questions.map(() => null));
  const [picks, setPicks] = useState(questions.map(() => null));
  const [locked, setLocked] = useState(false);

  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const q = questions[idx];
  const league = leagueTones(q.league, theme);
  const isLast = idx === questions.length - 1;

  const onSelect = (value, isCorrect) => {
    setLocked(true);
    setPicks((p) => {
      const n = [...p];
      n[idx] = value;
      return n;
    });
    setResults((r) => {
      const n = [...r];
      n[idx] = isCorrect ? 'correct' : 'wrong';
      return n;
    });
  };

  const advance = () => {
    if (isLast) {
      const score = results.filter((r) => r === 'correct').length;
      onFinish(score, results);
      return;
    }
    setIdx((i) => i + 1);
    setLocked(false);
  };

  const next = () => {
    if (reduceMotion) {
      advance();
      return;
    }
    // Confident wipe out, swap, wipe in — not a soft fade.
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slide, { toValue: -60, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      if (isLast) {
        const score = results.filter((r) => r === 'correct').length;
        onFinish(score, results);
        return;
      }
      setIdx((i) => i + 1);
      setLocked(false);
      slide.setValue(60);
      Animated.parallel([
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 9, tension: 80 }),
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + space(3) }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: theme.accent }]}>
            <Text style={styles.logoText}>SD</Text>
          </View>
          <View>
            <Text style={[styles.brandName, { color: theme.text }]}>DAILY DROP</Text>
            <Text style={[styles.brandSub, { color: theme.textMuted }]}>MLB · NFL</Text>
          </View>
        </View>
        <View
          style={[
            styles.streak,
            {
              backgroundColor: streak > 0 ? theme.electricSoft : theme.surfaceAlt,
              borderColor: streak > 0 ? theme.electric : theme.border,
            },
          ]}
        >
          <Text style={styles.streakFlame}>{streak > 0 ? '🔥' : '·'}</Text>
          <Text style={[styles.streakNum, { color: streak > 0 ? theme.electricText : theme.textMuted }]}>
            {streak}
          </Text>
        </View>
      </View>

      <ProgressDots questions={questions} results={results} current={idx} theme={theme} />

      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
          elevate(theme, 1),
          { opacity: fade, transform: [{ translateX: slide }] },
        ]}
      >
        <LinearGradient
          colors={league.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHeader}
        >
          <LeagueBadge league={q.league} index={idx} total={questions.length} />
          <Text style={styles.watermark}>{league.emoji}</Text>
        </LinearGradient>

        <View style={styles.cardBody}>
          <Text style={[styles.prompt, { color: theme.text }]}>{q.prompt}</Text>

          {q.type === 'multiple_choice' ? (
            <MultipleChoice
              question={q}
              locked={locked}
              selected={picks[idx]}
              onSelect={onSelect}
              theme={theme}
            />
          ) : (
            <TypedAnswer
              question={q}
              pool={pools[q.autocomplete_pool_ref] || []}
              locked={locked}
              selected={picks[idx]}
              onSelect={onSelect}
              theme={theme}
            />
          )}
        </View>
      </Animated.View>

      {locked && (
        <Pressable
          onPress={next}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: theme.text, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={[styles.nextText, { color: theme.bg }]}>
            {isLast ? 'See results' : 'Next question'}
          </Text>
          <Text style={[styles.nextArrow, { color: theme.bg }]}>→</Text>
        </Pressable>
      )}

      <View style={{ height: insets.bottom + space(6) }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(5) },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space(5),
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space(2.5) },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFFFFF', fontSize: type.sizes.md, ...type.display, letterSpacing: 0.5 },
  brandName: { fontSize: type.sizes.lg, ...type.display, letterSpacing: 1 },
  brandSub: { fontSize: type.sizes.xs, ...type.bodySemi, letterSpacing: 2, marginTop: -2 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
    paddingHorizontal: space(3),
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  streakFlame: { fontSize: 14 },
  streakNum: { fontSize: type.sizes.lg, ...type.display },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: space(5),
    paddingVertical: space(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  watermark: { fontSize: 56, opacity: 0.28, marginRight: -space(2), marginBottom: -space(4) },
  cardBody: { padding: space(5) },
  prompt: {
    fontSize: type.sizes.xxl,
    ...type.display,
    lineHeight: 34,
    marginBottom: space(5),
  },
  nextBtn: {
    marginTop: space(6),
    height: 58,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space(2),
  },
  nextText: { fontSize: type.sizes.lg, ...type.display, letterSpacing: 0.5 },
  nextArrow: { fontSize: type.sizes.lg, ...type.bodyBold },
});
