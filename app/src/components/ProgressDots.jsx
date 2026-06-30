import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LEAGUES, radius, space } from '../theme/theme';

// A chunky scoreboard segment bar. Each question is one segment: green when
// right, red when wrong, league-colored (with a lit cap) for the current one,
// and a quiet track for what's ahead.
// results[i] is 'correct' | 'wrong' | null (unanswered)
export default function ProgressDots({ questions, results, current, theme }) {
  return (
    <View style={styles.row}>
      {questions.map((q, i) => {
        const r = results[i];
        const isCurrent = i === current && r == null;
        const league = (LEAGUES[q.league] || LEAGUES.MLB).color;
        let color = theme.surfaceAlt;
        if (r === 'correct') color = theme.correct;
        else if (r === 'wrong') color = theme.wrong;
        else if (isCurrent) color = league;
        return (
          <View key={i} style={styles.cell}>
            <View
              style={[
                styles.seg,
                { backgroundColor: color },
                isCurrent && styles.segCurrent,
                isCurrent && { shadowColor: league },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, marginBottom: space(6) },
  cell: { flex: 1 },
  seg: { height: 7, borderRadius: radius.xs },
  segCurrent: {
    height: 9,
    marginTop: -1,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
