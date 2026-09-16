import { useColorScheme } from '@mui/material/styles';
import type { KkResolvedColorScheme } from './theme-color';
import { resolveKkColorScheme } from './theme-color';

export const useKkColorScheme = (): KkResolvedColorScheme => {
  const { mode, systemMode } = useColorScheme();

  return resolveKkColorScheme(mode, systemMode);
};
