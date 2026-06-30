// theme.js — Daily Drop design tokens.
//
// Thesis: broadcast graphics meets a collectible scorecard. Oswald (a condensed
// grotesque) carries prompts, scores and stat-line numbers; Inter keeps options
// and labels crisply legible. Cool "card-stock" light mode and "stadium-dark"
// dark mode — no warm cream. League color dresses each screen; one electric
// scoreboard-amber shows up only on streaks and wins.

// ---------------------------------------------------------------- typefaces
// Keys match the names registered with useFonts() in App.js.
export const FONTS = {
  display: 'Oswald_700Bold',      // prompts, scores, big numerals
  displaySemi: 'Oswald_600SemiBold',
  displayMed: 'Oswald_500Medium',
  body: 'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  bodyHeavy: 'Inter_800ExtraBold',
};

// ---------------------------------------------------------------- leagues
// Each league is "dressed" via a gradient + deep secondary so MLB vs NFL reads
// instantly, like switching channels.
export const LEAGUES = {
  MLB: {
    label: 'MLB',
    emoji: '⚾',
    color: '#1657C7',          // vivid diamond blue
    colorDeep: '#0A2A66',      // dugout navy
    gradient: ['#2A6BE4', '#0C2F73'],
    colorSoft: '#E4EDFB',
    colorSoftDark: '#10254E',
    colorText: '#0E3E96',
    colorTextDark: '#9FC2FF',
    onColor: '#FFFFFF',
  },
  NFL: {
    label: 'NFL',
    emoji: '🏈',
    color: '#D22730',          // rich gridiron red
    colorDeep: '#6E0E14',      // end-zone maroon
    gradient: ['#E83C40', '#7A1117'],
    colorSoft: '#FBE6E6',
    colorSoftDark: '#3E1316',
    colorText: '#A31D24',
    colorTextDark: '#FBADB0',
    onColor: '#FFFFFF',
  },
};

// ---------------------------------------------------------------- light (card-stock)
export const lightTheme = {
  dark: false,
  bg: '#EEF1F6',            // cool paper
  bgElevated: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#E9EDF3',
  border: '#D5DBE4',
  borderStrong: '#BCC5D2',
  text: '#0F141B',
  textSecondary: '#566072',
  textMuted: '#8A93A3',

  correct: '#10B981',
  correctSoft: '#DBF6EC',
  correctText: '#08715C',

  wrong: '#E5484D',
  wrongSoft: '#FBE3E4',
  wrongText: '#B22228',

  // electric scoreboard-amber — streaks + wins only
  electric: '#F5A300',
  electricSoft: '#FBEFD2',
  electricText: '#7A4E00',
  // legacy aliases (kept so older refs resolve)
  streak: '#F5A300',
  streakSoft: '#FBEFD2',
  streakText: '#7A4E00',

  accent: '#1657C7',
  onAccent: '#FFFFFF',

  foil: ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)'],
  shadow: '#1A2A4A',
  shadowOpacity: 0.16,
};

// ---------------------------------------------------------------- dark (stadium-night)
export const darkTheme = {
  dark: true,
  bg: '#0C0F14',           // stadium night
  bgElevated: '#11151B',
  surface: '#161B22',
  surfaceAlt: '#1E242E',
  border: '#2B313C',
  borderStrong: '#3A4250',
  text: '#F2F5F9',
  textSecondary: '#9BA6B6',
  textMuted: '#646E7E',

  correct: '#2DD4A0',
  correctSoft: '#0C3D31',
  correctText: '#7BEFC9',

  wrong: '#F2696D',
  wrongSoft: '#43161A',
  wrongText: '#F7B4B6',

  electric: '#FFC02E',
  electricSoft: '#3A2A05',
  electricText: '#FFD66B',
  streak: '#FFC02E',
  streakSoft: '#3A2A05',
  streakText: '#FFD66B',

  accent: '#5B9BFF',
  onAccent: '#06224F',

  foil: ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0.0)'],
  shadow: '#000000',
  shadowOpacity: 0.45,
};

// Per-league soft/text that respects the active scheme.
export function leagueTones(league, theme) {
  const cfg = LEAGUES[league] || LEAGUES.MLB;
  return {
    ...cfg,
    soft: theme.dark ? cfg.colorSoftDark : cfg.colorSoft,
    onSoft: theme.dark ? cfg.colorTextDark : cfg.colorText,
  };
}

// ---------------------------------------------------------------- scale
export const type = {
  display: { fontFamily: FONTS.display },
  displaySemi: { fontFamily: FONTS.displaySemi },
  displayMed: { fontFamily: FONTS.displayMed },
  body: { fontFamily: FONTS.body },
  bodyMed: { fontFamily: FONTS.bodyMed },
  bodySemi: { fontFamily: FONTS.bodySemi },
  bodyBold: { fontFamily: FONTS.bodyBold },
  bodyHeavy: { fontFamily: FONTS.bodyHeavy },
  // legacy aliases used by older components
  heavy: { fontFamily: FONTS.bodyBold },
  medium: { fontFamily: FONTS.bodyMed },
  sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 23, xxl: 32, huge: 60, mega: 92 },
};

export const space = (n) => n * 4;
export const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

// Reusable elevation for "lifted" cards.
export function elevate(theme, level = 1) {
  return {
    shadowColor: theme.shadow,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: level === 2 ? 28 : 16,
    shadowOffset: { width: 0, height: level === 2 ? 14 : 8 },
    elevation: level === 2 ? 12 : 6,
  };
}
