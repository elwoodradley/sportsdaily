// theme.js — sporty/bold design tokens, with light/dark support.

export const LEAGUES = {
  MLB: {
    label: 'MLB',
    color: '#185FA5', // deep diamond blue
    colorSoft: '#E6F1FB',
    colorText: '#0C447C',
  },
  NFL: {
    label: 'NFL',
    color: '#A32D2D', // gridiron red
    colorSoft: '#FCEBEB',
    colorText: '#791F1F',
  },
};

export const lightTheme = {
  bg: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EFE8',
  border: '#D3D1C7',
  text: '#1B1B19',
  textSecondary: '#5F5E5A',
  textMuted: '#888780',
  correct: '#1D9E75',
  correctSoft: '#E1F5EE',
  correctText: '#0F6E56',
  wrong: '#E24B4A',
  wrongSoft: '#FCEBEB',
  wrongText: '#A32D2D',
  streak: '#EF9F27',
  streakSoft: '#FAEEDA',
  streakText: '#633806',
  accent: '#185FA5',
  onAccent: '#FFFFFF',
};

export const darkTheme = {
  bg: '#16150F',
  surface: '#23221C',
  surfaceAlt: '#2C2C28',
  border: '#444441',
  text: '#F1EFE8',
  textSecondary: '#B4B2A9',
  textMuted: '#888780',
  correct: '#5DCAA5',
  correctSoft: '#085041',
  correctText: '#9FE1CB',
  wrong: '#F09595',
  wrongSoft: '#501313',
  wrongText: '#F7C1C1',
  streak: '#FAC775',
  streakSoft: '#633806',
  streakText: '#FAC775',
  accent: '#85B7EB',
  onAccent: '#042C53',
};

export const type = {
  // Bold, condensed-feeling display for prompts/scores; system body for the rest.
  display: { fontWeight: '800' },
  heavy: { fontWeight: '700' },
  medium: { fontWeight: '600' },
  body: { fontWeight: '400' },
  sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 30, huge: 52 },
};

export const space = (n) => n * 4;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
