import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LEAGUES, type, radius, space } from '../theme/theme';

export default function LeagueBadge({ league, index, total }) {
  const cfg = LEAGUES[league] || LEAGUES.MLB;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.color }]}>
      <Text style={styles.text}>
        {cfg.label}
        {index != null ? `  ·  Q${index + 1}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: space(2.5),
    paddingVertical: space(1.5),
    borderRadius: radius.sm,
  },
  text: {
    color: '#FFFFFF',
    fontSize: type.sizes.xs,
    letterSpacing: 0.5,
    ...type.heavy,
  },
});
