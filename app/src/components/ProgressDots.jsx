import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LEAGUES, radius } from '../theme/theme';

// results: array same length as questions; each is 'correct' | 'wrong' | null (unanswered)
export default function ProgressDots({ questions, results, current, theme }) {
  return (
    <View style={styles.row}>
      {questions.map((q, i) => {
        let color;
        const r = results[i];
        if (r === 'correct') color = theme.correct;
        else if (r === 'wrong') color = theme.wrong;
        else if (i === current) color = (LEAGUES[q.league] || LEAGUES.MLB).color;
        else color = theme.border;
        return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { flex: 1, height: 6, borderRadius: radius.sm },
});
