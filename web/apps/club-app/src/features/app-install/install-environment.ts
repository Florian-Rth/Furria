import type { BrowserTraits, InstallTarget } from './install-browser';
import { installTargetOf } from './install-browser';

const readBrowserTraits = (): BrowserTraits => ({
  userAgent: navigator.userAgent,
  maxTouchPoints: navigator.maxTouchPoints,
  mobileHint: navigator.userAgentData?.mobile ?? null,
});

export const readInstallTarget = (): InstallTarget => installTargetOf(readBrowserTraits());
