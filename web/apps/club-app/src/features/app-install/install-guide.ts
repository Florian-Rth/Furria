import type { InstallTarget } from './install-browser';

export type InstallStepKey =
  | 'safari-page-menu'
  | 'safari-more'
  | 'safari-share'
  | 'share-bar'
  | 'share-top'
  | 'address-share'
  | 'home-screen'
  | 'add'
  | 'add-web-app'
  | 'home-screen-list'
  | 'web-app-add'
  | 'chrome-menu'
  | 'chrome-install'
  | 'chrome-confirm'
  | 'samsung-menu'
  | 'samsung-add-page'
  | 'samsung-home'
  | 'firefox-menu'
  | 'firefox-add'
  | 'firefox-confirm'
  | 'in-app-menu'
  | 'open-in-safari'
  | 'open-in-browser';

export type InstallExit = 'safari' | 'chrome';

export type InstallGuide =
  | { kind: 'prompt' }
  | { kind: 'steps'; steps: readonly InstallStepKey[] }
  | {
      kind: 'escape';
      exit: InstallExit;
      steps: readonly InstallStepKey[];
    };

const SAFARI_MORE_MENU_MAJOR = 26;
const SAFARI_PAGE_MENU_MAJOR = 27;

const stepsOf = (steps: readonly InstallStepKey[]): InstallGuide => ({ kind: 'steps', steps });

const safariGuideOf = ({ device, safariMajor }: InstallTarget): InstallGuide => {
  if (device === 'tablet') {
    return stepsOf(['share-top', 'home-screen', 'add']);
  }
  if (safariMajor !== null && safariMajor >= SAFARI_PAGE_MENU_MAJOR) {
    return stepsOf(['safari-page-menu', 'safari-share', 'home-screen-list', 'web-app-add']);
  }
  if (safariMajor !== null && safariMajor >= SAFARI_MORE_MENU_MAJOR) {
    return stepsOf(['safari-more', 'safari-share', 'home-screen', 'add-web-app']);
  }
  return stepsOf(['share-bar', 'home-screen', 'add']);
};

const inAppGuideOf = ({ system }: InstallTarget): InstallGuide =>
  system === 'ios'
    ? {
        kind: 'escape',
        exit: 'safari',
        steps: ['in-app-menu', 'open-in-safari'],
      }
    : {
        kind: 'escape',
        exit: 'chrome',
        steps: ['in-app-menu', 'open-in-browser'],
      };

export const installGuideOf = (target: InstallTarget, canPrompt: boolean): InstallGuide => {
  if (target.browser === 'in-app') {
    return inAppGuideOf(target);
  }
  if (canPrompt) {
    return { kind: 'prompt' };
  }

  switch (target.browser) {
    case 'ios-safari':
      return safariGuideOf(target);
    case 'ios-other':
      return stepsOf(['address-share', 'home-screen', 'add']);
    case 'android-chrome':
      return stepsOf(['chrome-menu', 'chrome-install', 'chrome-confirm']);
    case 'android-samsung':
      return stepsOf(['samsung-menu', 'samsung-add-page', 'samsung-home']);
    case 'android-firefox':
      return stepsOf(['firefox-menu', 'firefox-add', 'firefox-confirm']);
    case 'android-other':
    case 'desktop':
      return { kind: 'escape', exit: 'chrome', steps: [] };
  }
};
