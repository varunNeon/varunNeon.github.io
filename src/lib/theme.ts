export type Theme = 'light' | 'dark';
const KEY = 'theme';

export function getInitialTheme(storage: Storage | null, prefersDark: boolean): Theme {
  let stored: string | null = null;
  try {
    stored = storage?.getItem(KEY) ?? null;
  } catch {
    stored = null;
  }
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function saveTheme(storage: Storage | null, theme: Theme): void {
  try {
    storage?.setItem(KEY, theme);
  } catch {
    /* storage unavailable (private mode etc.): theme still applies for this visit */
  }
}

export function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
