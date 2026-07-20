export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = 'light' | 'dark';

// Resolves MUI's useColorScheme() state to the scheme actually shown:
// an explicit choice wins, 'system' follows the OS, unknown falls back to light.
export const resolveColorMode = (
  mode: ColorMode | undefined,
  systemMode: ResolvedColorMode | undefined,
): ResolvedColorMode => {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return systemMode ?? 'light';
};
