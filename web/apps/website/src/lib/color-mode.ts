export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = 'light' | 'dark';

export const resolveColorMode = (
  mode: ColorMode | undefined,
  systemMode: ResolvedColorMode | undefined,
): ResolvedColorMode => {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return systemMode ?? 'light';
};
