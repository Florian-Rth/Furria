import { SystemBarsStyle } from '@capacitor/core';
import type { KkResolvedColorScheme } from '@furria/ui';

export const systemBarsStyleFor = (scheme: KkResolvedColorScheme): SystemBarsStyle =>
  scheme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light;
