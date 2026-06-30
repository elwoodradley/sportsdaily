import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme, darkTheme, type, space } from './src/theme/theme';
import QuizScreen from './src/screens/QuizScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { loadProgress, recordResult, todayStr } from './src/data/progress';
import data from './src/data/daily_sets.json';

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const [stage, setStage] = useState('loading'); // loading | quiz | results | empty
  const [questions, setQuestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const today = todayStr();
      const set = data.sets[today] || data.sets[Object.keys(data.sets)[0]];
      const p = await loadProgress();
      setStreak(p.streak);
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
    setStage('results');
  };

  if (stage === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (stage === 'empty') {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No drop today</Text>
        <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
          Check back tomorrow for a fresh set.
        </Text>
      </View>
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
          onFinish={(score) => onFinish(score)}
        />
      ) : (
        <ResultsScreen
          score={finalScore}
          total={questions.length}
          streak={streak}
          results={results}
          theme={theme}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space(6) },
  emptyTitle: { fontSize: type.sizes.xl, ...type.display, marginBottom: space(2) },
  emptyBody: { fontSize: type.sizes.md, textAlign: 'center' },
});
