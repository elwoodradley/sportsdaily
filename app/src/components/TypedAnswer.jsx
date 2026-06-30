import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { type, radius, space, leagueTones } from '../theme/theme';

function norm(s) {
  return (s || '').trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
}

export default function TypedAnswer({ question, pool, locked, selected, onSelect, theme }) {
  const [value, setValue] = useState(selected || '');
  const [focused, setFocused] = useState(false);
  const league = leagueTones(question.league, theme);

  const suggestions = useMemo(() => {
    const v = norm(value);
    if (!v || locked) return [];
    return pool.filter((c) => norm(c).includes(v)).slice(0, 4);
  }, [value, pool, locked]);

  const submit = (text) => {
    if (locked || !norm(text)) return;
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

  const borderColor = locked
    ? correct ? theme.correct : theme.wrong
    : focused ? league.color : theme.border;

  return (
    <View>
      <View style={styles.inputWrap}>
        <Text style={[styles.inputIcon, { color: focused ? league.color : theme.textMuted }]}>›</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!locked}
          placeholder="Type a name…"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => submit(value)}
          style={[
            styles.input,
            { backgroundColor: theme.surfaceAlt, borderColor, color: theme.text },
          ]}
        />
      </View>

      {!locked && suggestions.length > 0 && (
        <View style={[styles.suggestBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {suggestions.map((s, i) => (
            <Pressable
              key={s}
              onPress={() => submit(s)}
              style={({ pressed }) => [
                styles.suggestRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                pressed && { backgroundColor: theme.surfaceAlt },
              ]}
            >
              <Text style={[styles.suggestText, { color: theme.text }]}>{s}</Text>
              <Text style={[styles.suggestHint, { color: league.color }]}>Pick</Text>
            </Pressable>
          ))}
        </View>
      )}

      {!locked && (
        <Pressable
          onPress={() => submit(value)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: league.color, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={styles.submitText}>Lock it in</Text>
        </Pressable>
      )}

      {locked && (
        <View style={[styles.reveal, { backgroundColor: correct ? theme.correctSoft : theme.wrongSoft }]}>
          <Text style={[styles.revealTag, { color: correct ? theme.correctText : theme.wrongText }]}>
            {correct ? 'CORRECT' : 'ANSWER'}
          </Text>
          <Text style={[styles.revealText, { color: correct ? theme.correctText : theme.wrongText }]}>
            {correct ? 'Nailed it' : question.answer}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: { justifyContent: 'center' },
  inputIcon: {
    position: 'absolute',
    left: space(4),
    zIndex: 1,
    fontSize: 22,
    ...type.display,
  },
  input: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingLeft: space(8),
    paddingRight: space(4),
    fontSize: type.sizes.lg,
    ...type.bodySemi,
  },
  suggestBox: {
    marginTop: space(2),
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space(4),
    paddingVertical: space(3),
  },
  suggestText: { fontSize: type.sizes.md, ...type.bodyMed, flex: 1 },
  suggestHint: { fontSize: type.sizes.xs, ...type.bodyBold, letterSpacing: 0.5 },
  submit: {
    marginTop: space(3),
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: type.sizes.lg,
    ...type.display,
    letterSpacing: 0.5,
  },
  reveal: {
    marginTop: space(3),
    paddingHorizontal: space(4),
    paddingVertical: space(3),
    borderRadius: radius.md,
  },
  revealTag: { fontSize: type.sizes.xs, ...type.bodyBold, letterSpacing: 1.5, marginBottom: 2 },
  revealText: { fontSize: type.sizes.lg, ...type.display },
});
