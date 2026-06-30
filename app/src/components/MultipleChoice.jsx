import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { type, radius, space } from '../theme/theme';

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
      {question.options.map((opt) => {
        const isAnswer = opt === question.answer;
        const isPicked = opt === selected;
        let bg = theme.surfaceAlt;
        let border = theme.border;
        let txt = theme.text;
        if (locked) {
          if (isAnswer) {
            bg = theme.correctSoft;
            border = theme.correct;
            txt = theme.correctText;
          } else if (isPicked) {
            bg = theme.wrongSoft;
            border = theme.wrong;
            txt = theme.wrongText;
          }
        }
        return (
          <Pressable
            key={opt}
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
            <Text style={[styles.optText, { color: txt }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  opt: {
    width: '48%',
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: space(3),
    paddingVertical: space(3),
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  optText: { fontSize: type.sizes.sm, ...type.medium },
});
