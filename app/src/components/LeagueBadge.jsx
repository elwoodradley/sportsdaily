import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LEAGUES, type, radius, space } from '../theme/theme';

// Broadcast-style league tag: emoji mark + league wordmark + question number,
// like a lower-third score bug. Sits on the league-colored card header.
export default function LeagueBadge({ league, index, total }) {
  const cfg = LEAGUES[league] || LEAGUES.MLB;
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Text style={styles.markEmoji}>{cfg.emoji}</Text>
      </View>
      <Text style={styles.label}>{cfg.label}</Text>
      {index != null && (
        <>
          <View style={styles.divider} />
          <Text style={styles.index}>
            Q{index + 1}
            {total ? <Text style={styles.indexTotal}>/{total}</Text> : null}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  mark: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space(2),
  },
  markEmoji: { fontSize: 14 },
  label: {
    color: '#FFFFFF',
    fontSize: type.sizes.sm,
    letterSpacing: 1.5,
    ...type.display,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: space(2.5),
  },
  index: { color: '#FFFFFF', fontSize: type.sizes.sm, letterSpacing: 1, ...type.displaySemi },
  indexTotal: { color: 'rgba(255,255,255,0.7)' },
});
