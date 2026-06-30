import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Share } from 'react-native';
import { type, radius, space } from '../theme/theme';

export default function ResultsScreen({ score, total, streak, results, theme }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    // count up
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= score) clearInterval(t);
    }, 220);
    return () => clearInterval(t);
  }, []);

  const grid = (results || []).map((r) => (r === 'correct' ? '🟩' : '🟥')).join('');

  const onShare = () => {
    Share.share({
      message: `Daily Drop ⚾🏈\n${score}/${total}  ${grid}\n🔥 ${streak} day streak`,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center' }}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Today's score</Text>
        <Text style={[styles.score, { color: theme.text }]}>
          {shown}
          <Text style={[styles.scoreTotal, { color: theme.textMuted }]}>/{total}</Text>
        </Text>
      </Animated.View>

      <View style={[styles.streakCard, { backgroundColor: theme.streakSoft }]}>
        <Text style={[styles.streakNum, { color: theme.streakText }]}>{streak}</Text>
        <Text style={[styles.streakLabel, { color: theme.streakText }]}>day streak</Text>
      </View>

      <Text style={[styles.gridText]}>{grid}</Text>

      <Pressable
        onPress={onShare}
        style={({ pressed }) => [
          styles.shareBtn,
          { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Text style={[styles.shareText, { color: theme.onAccent }]}>Share result</Text>
      </Pressable>

      <Text style={[styles.comeBack, { color: theme.textMuted }]}>
        New questions drop tomorrow
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space(6) },
  label: { fontSize: type.sizes.md, ...type.medium, marginBottom: space(2) },
  score: { fontSize: type.sizes.huge, ...type.display },
  scoreTotal: { fontSize: type.sizes.xxl, ...type.heavy },
  streakCard: {
    marginTop: space(8),
    paddingHorizontal: space(8),
    paddingVertical: space(4),
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  streakNum: { fontSize: type.sizes.xxl, ...type.display },
  streakLabel: { fontSize: type.sizes.sm, ...type.medium },
  gridText: { fontSize: 28, letterSpacing: 4, marginTop: space(6) },
  shareBtn: {
    marginTop: space(8),
    paddingHorizontal: space(10),
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { fontSize: type.sizes.md, ...type.heavy },
  comeBack: { marginTop: space(6), fontSize: type.sizes.sm },
});
