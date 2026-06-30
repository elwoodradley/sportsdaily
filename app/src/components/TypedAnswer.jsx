import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { type, radius, space } from '../theme/theme';

function norm(s) {
  return (s || '').trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
}

export default function TypedAnswer({ question, pool, locked, selected, onSelect, theme }) {
  const [value, setValue] = useState(selected || '');

  const suggestions = useMemo(() => {
    const v = norm(value);
    if (!v || locked) return [];
    return pool.filter((c) => norm(c).includes(v)).slice(0, 4);
  }, [value, pool, locked]);

  const submit = (text) => {
    if (locked) return;
    const accept = question.accept || [question.answer];
    const isCorrect = accept.some((a) => norm(a) === norm(text));
    Haptics.notificationAsync(
      isCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
    setValue(text);
    onSelect(text, isCorrect);
  };

  const correct = !!selected &&
    (question.accept || [question.answer]).some((a) => norm(a) === norm(selected));

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={setValue}
        editable={!locked}
        placeholder="Type your answer"
        placeholderTextColor={theme.textMuted}
        autoCapitalize="words"
        autoCorrect={false}
        onSubmitEditing={() => submit(value)}
        style={[
          styles.input,
          {
            backgroundColor: theme.surfaceAlt,
            borderColor: locked
              ? correct
                ? theme.correct
                : theme.wrong
              : theme.border,
            color: theme.text,
          },
        ]}
      />

      {!locked && suggestions.length > 0 && (
        <View style={[styles.suggestBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {suggestions.map((s) => (
            <Pressable key={s} onPress={() => submit(s)} style={styles.suggestRow}>
              <Text style={[styles.suggestText, { color: theme.text }]}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {!locked && (
        <Pressable
          onPress={() => submit(value)}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={[styles.submitText, { color: theme.onAccent }]}>Submit</Text>
        </Pressable>
      )}

      {locked && (
        <Text style={[styles.reveal, { color: correct ? theme.correctText : theme.wrongText }]}>
          {correct ? 'Correct' : `Answer: ${question.answer}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: space(3.5),
    fontSize: type.sizes.md,
    ...type.medium,
  },
  suggestBox: {
    marginTop: space(1.5),
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestRow: { paddingHorizontal: space(3.5), paddingVertical: space(2.5) },
  suggestText: { fontSize: type.sizes.sm },
  submit: {
    marginTop: space(2.5),
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontSize: type.sizes.md, ...type.heavy, letterSpacing: 0.3 },
  reveal: { marginTop: space(3), fontSize: type.sizes.sm, ...type.medium },
});
