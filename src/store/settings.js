import { signal } from '@preact/signals';

// --- Accent color palette ---
export const ACCENT_COLORS = [
  { name: 'Terracotta', light: '#c45d3e', lightHover: '#a84e33', dark: '#e8854a', darkHover: '#d4753d' },
  { name: 'Ocean',      light: '#2d7d9a', lightHover: '#24667d', dark: '#4db8d6', darkHover: '#3da0ba' },
  { name: 'Forest',     light: '#4a8c5c', lightHover: '#3d734c', dark: '#6ab87a', darkHover: '#5aa068' },
  { name: 'Plum',       light: '#7b5ea7', lightHover: '#664d8c', dark: '#a07ed4', darkHover: '#8c6dba' },
  { name: 'Slate',      light: '#5a6a7a', lightHover: '#4a5766', dark: '#8a9aaa', darkHover: '#788898' },
  { name: 'Amber',      light: '#b8860b', lightHover: '#996f09', dark: '#daa520', darkHover: '#c4941c' },
];

// --- Signals ---
export const theme = signal(localStorage.getItem('tab-hoarder-theme') || 'light');
export const accentName = signal(localStorage.getItem('tab-hoarder-accent') || 'Terracotta');
export const jamEnabled = signal(localStorage.getItem('tab-hoarder-jam-enabled') !== 'false');
export const settingsOpen = signal(false);

// --- Theme ---
export function setTheme(value) {
  theme.value = value;
  localStorage.setItem('tab-hoarder-theme', value);
  document.documentElement.setAttribute('data-theme', value);
  applyAccent(accentName.value);
}

// --- Accent ---
function getAccent(name) {
  return ACCENT_COLORS.find(c => c.name === name) || ACCENT_COLORS[0];
}

export function applyAccent(name) {
  const color = getAccent(name);
  const isDark = theme.value === 'dark';
  const accent = isDark ? color.dark : color.light;
  const hover = isDark ? color.darkHover : color.lightHover;
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  const subtle = isDark ? `rgba(${r}, ${g}, ${b}, 0.12)` : `rgba(${r}, ${g}, ${b}, 0.1)`;

  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent-hover', hover);
  document.documentElement.style.setProperty('--accent-subtle', subtle);
  document.documentElement.style.setProperty('--border-active', accent);
}

export function setAccent(name) {
  accentName.value = name;
  localStorage.setItem('tab-hoarder-accent', name);
  applyAccent(name);
}

// --- Jam ---
export function setJamEnabled(value) {
  jamEnabled.value = value;
  localStorage.setItem('tab-hoarder-jam-enabled', value ? 'true' : 'false');
}

// --- Init (call before render) ---
export function initSettings() {
  document.documentElement.setAttribute('data-theme', theme.value);
  applyAccent(accentName.value);
}
