import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Pressable, ScrollView,
} from 'react-native';
import { type, radius, space } from '../theme/theme';
import LeagueBadge from '../components/LeagueBadge';
import ProgressDots from '../components/ProgressDots';
import MultipleChoice from '../components/MultipleChoice';
import TypedAnswer from '../components/TypedAnswer';

export default function QuizScreen({ questions, pools, streak, theme, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState(questions.map(() => null));
  const [picks, setPicks] = useState(questions.map(() => null));
  const [locked, setLocked] = useState(false);

  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const q = questions[idx];

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

  const next = () => {
    const last = idx === questions.length - 1;
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slide, { toValue: -40, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      if (last) {
        const score = results.filter((r) => r === 'correct').length;
        onFinish(score);
        return;
      }
      setIdx((i) => i + 1);
      setLocked(false);
      slide.setValue(40);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: theme.accent }]}>
            <Text style={[styles.logoText, { color: theme.onAccent }]}>SD</Text>
          </View>
          <Text style={[styles.brandName, { color: theme.text }]}>Daily Drop</Text>
        </View>
        <View style={[styles.streak, { backgroundColor: theme.streakSoft }]}>
          <Text style={[styles.streakText, { color: theme.streakText }]}>
            {streak} day streak
          </Text>
        </View>
      </View>

      <ProgressDots
        questions={questions}
        results={results}
        current={idx}
        theme={theme}
      />

      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
          { opacity: fade, transform: [{ translateX: slide }] },
        ]}
      >
        <LeagueBadge league={q.league} index={idx} />
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
      </Animated.View>

      {locked && (
        <Pressable
          onPress={next}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: theme.text, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={[styles.nextText, { color: theme.bg }]}>
            {idx === questions.length - 1 ? 'See results' : 'Next'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(5), paddingTop: space(14) },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space(4),
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  logo: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: type.sizes.sm, ...type.display },
  brandName: { fontSize: type.sizes.lg, ...type.heavy },
  streak: { paddingHorizontal: space(3), paddingVertical: space(1.5), borderRadius: radius.pill },
  streakText: { fontSize: type.sizes.xs, ...type.heavy },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space(5),
  },
  prompt: {
    fontSize: type.sizes.xl,
    ...type.display,
    lineHeight: 30,
    marginTop: space(3),
    marginBottom: space(5),
  },
  nextBtn: {
    marginTop: space(5),
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { fontSize: type.sizes.md, ...type.heavy, letterSpacing: 0.3 },
});
