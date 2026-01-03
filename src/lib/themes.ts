export type ThemeKey = 'dark' | 'light' | 'dimmed';

export interface Theme {
  name: string;
  background: string;
  text: string;
  textMuted: string;
  empty: string;
  levels: [string, string, string, string, string];
  border: string;
}

export const themes: Record<ThemeKey, Theme> = {
  dark: {
    name: 'Dark GitHub',
    background: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    empty: '#161b22',
    levels: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    border: '#30363d',
  },
  light: {
    name: 'Light GitHub',
    background: '#ffffff',
    text: '#24292f',
    textMuted: '#57606a',
    empty: '#ebedf0',
    levels: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    border: '#d0d7de',
  },
  dimmed: {
    name: 'Dimmed',
    background: '#22272e',
    text: '#adbac7',
    textMuted: '#768390',
    empty: '#2d333b',
    levels: ['#2d333b', '#26532b', '#3b6f42', '#57ab5a', '#6bc46d'],
    border: '#444c56',
  },
};
