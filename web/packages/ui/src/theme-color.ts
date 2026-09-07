import { kkTokens } from './tokens';

export type KkColorSchemeMode = 'light' | 'dark' | 'system';
export type KkResolvedColorScheme = 'light' | 'dark';

export const resolveKkColorScheme = (
  mode: KkColorSchemeMode | undefined,
  systemMode: KkResolvedColorScheme | undefined,
): KkResolvedColorScheme => {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return systemMode ?? 'light';
};

export const kkThemeColorForScheme = (resolved: KkResolvedColorScheme): string =>
  resolved === 'dark' ? kkTokens.color.dark.bg : kkTokens.color.light.bg;
