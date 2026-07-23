import type { FC } from 'react';
import { useThemeColorMeta } from './internal/use-theme-color-meta';

export const ThemeColorMeta: FC = () => {
  useThemeColorMeta();
  return null;
};
