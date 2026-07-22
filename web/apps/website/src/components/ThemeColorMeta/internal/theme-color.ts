import { kkTokens } from '@furria/ui';
import type { ResolvedColorMode } from '@/lib/color-mode';

export const themeColorForScheme = (resolved: ResolvedColorMode): string =>
  resolved === 'dark' ? kkTokens.color.dark.bg : kkTokens.color.light.bg;
