import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { lightTheme, darkTheme, type, space, radius } from './src/theme/theme';
import QuizScreen from './src/screens/QuizScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { loadProgress, recordResult, todayStr } from './src/data/progress';
import data from './src/data/daily_sets.json';

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  // Direct .ttf requires (not the package index) so Metro bundles only these
  // eight weights instead of every Oswald/Inter cut — keeps the binary lean.
  const [fontsLoaded] = useFonts({
    Oswald_500Medium: require('@expo-google-fonts/oswald/500Medium/Oswald_500Medium.ttf'),
    Oswald_600SemiBold: require('@expo-google-fonts/oswald/600SemiBold/Oswald_600SemiBold.ttf'),
    Oswald_700Bold: require('@expo-google-fonts/oswald/700Bold/Oswald_700Bold.ttf'),
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
    Inter_800ExtraBold: require('@expo-google-fonts/inter/800ExtraBold/Inter_800ExtraBold.ttf'),
  });

  const [stage, setStage] = useState('loading'); // loading | quiz | results | empty
  const [questions, setQuestions] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [streak, setStreak] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const today = todayStr();
      const key = data.sets[today] ? today : Object.keys(data.sets)[0];
      const set = data.sets[key];
      const p = await loadProgress();
      setStreak(p.streak);
      setDate(key);
      if (!set) {
        setStage('empty');
        return;
      }
      setQuestions(set);
      // if already played today, jump to results
      if (p.history[today]) {
        setFinalScore(p.history[today].score);
        setResults(set.map(() => 'correct')); // grid unknown on replay; benign
        setStage('results');
      } else {
        setStage('quiz');
      }
    })();
  }, []);

  const onFinish = async (score, perQuestion) => {
    const today = todayStr();
    const p = await recordResult(today, score, questions.length);
    setStreak(p.streak);
    setFinalScore(score);
    setResults(perQuestion || []);
    setStage('results');
  };

  // Hold on a branded screen until fonts are ready — Oswald is the personality,
  // so flashing system font first would cheapen the cold start.
  if (!fontsLoaded || stage === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <View style={[styles.bootMark, { backgroundColor: theme.accent }]}>
          <Text style={styles.bootMarkText}>SD</Text>
        </View>
        <ActivityIndicator color={theme.textMuted} style={{ marginTop: space(6) }} />
      </View>
    );
  }

  if (stage === 'empty') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
        <SafeAreaView style={[styles.center, { backgroundColor: theme.bg }]}>
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyKicker, { color: theme.electricText, backgroundColor: theme.electricSoft }]}>
              DAILY DROP
            </Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No drop today</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
              The next set is loading up. Come back tomorrow for a fresh seven.
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      {stage === 'quiz' ? (
        <QuizScreen
          questions={questions}
          pools={data.autocomplete_pools}
          streak={streak}
          theme={theme}
          onFinish={onFinish}
        />
      ) : (
        <ResultsScreen
          score={finalScore}
          total={questions.length}
          streak={streak}
          results={results}
          questions={questions}
          date={date}
          theme={theme}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space(6) },
  bootMark: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootMarkText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  emptyCard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: space(7),
    alignItems: 'center',
  },
  emptyKicker: {
    ...type.displaySemi,
    fontSize: type.sizes.xs,
    letterSpacing: 2,
    paddingHorizontal: space(2.5),
    paddingVertical: space(1),
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: space(4),
  },
  emptyTitle: { fontSize: type.sizes.xxl, ...type.display, letterSpacing: 0.5, marginBottom: space(2) },
  emptyBody: { fontSize: type.sizes.md, ...type.body, textAlign: 'center', lineHeight: 22 },
});
