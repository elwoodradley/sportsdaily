import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { type, radius, space } from '../theme/theme';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Two-up answer board. Each option is a stat-card with a jersey-letter chip.
// On lock the correct cell lights scoreboard-green and a wrong pick goes red —
// a quick, legible color snap rather than a busy animation.
export default function MultipleChoice({ question, locked, selected, onSelect, theme }) {
  const handle = (opt) => {
    if (locked) return;
    const isCorrect = opt === question.answer;
    Haptics.notificationAsync(
      isCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
    onSelect(opt, isCorrect);
  };

  return (
    <View style={styles.grid}>
      {question.options.map((opt, i) => {
        const isAnswer = opt === question.answer;
        const isPicked = opt === selected;
        let bg = theme.surfaceAlt;
        let border = theme.border;
        let txt = theme.text;
        let chipBg = theme.bg;
        let chipTxt = theme.textMuted;
        let tag = null;
        if (locked) {
          if (isAnswer) {
            bg = theme.correctSoft;
            border = theme.correct;
            txt = theme.correctText;
            chipBg = theme.correct;
            chipTxt = '#FFFFFF';
            tag = '✓';
          } else if (isPicked) {
            bg = theme.wrongSoft;
            border = theme.wrong;
            txt = theme.wrongText;
            chipBg = theme.wrong;
            chipTxt = '#FFFFFF';
            tag = '✕';
          } else {
            txt = theme.textMuted;
          }
        }
        return (
          <Pressable
            key={opt}
            disabled={locked}
            accessibilityRole="button"
            accessibilityState={{ disabled: locked, selected: isPicked }}
            onPress={() => handle(opt)}
            style={({ pressed }) => [
              styles.opt,
              {
                backgroundColor: bg,
                borderColor: border,
                transform: [{ scale: pressed && !locked ? 0.97 : 1 }],
              },
            ]}
          >
            <View style={styles.optTop}>
              <View style={[styles.chip, { backgroundColor: chipBg }]}>
                <Text style={[styles.chipText, { color: chipTxt }]}>
                  {tag || LETTERS[i]}
                </Text>
              </View>
            </View>
            <Text style={[styles.optText, { color: txt }]} numberOfLines={3}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2.5) },
  opt: {
    width: '47.5%',
    flexGrow: 1,
    minHeight: 92,
    paddingHorizontal: space(3.5),
    paddingVertical: space(3),
    borderRadius: radius.md,
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  optTop: { flexDirection: 'row', justifyContent: 'flex-start' },
  chip: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: type.sizes.sm, ...type.displaySemi },
  optText: { fontSize: type.sizes.md, ...type.bodySemi, marginTop: space(2.5), lineHeight: 20 },
});
