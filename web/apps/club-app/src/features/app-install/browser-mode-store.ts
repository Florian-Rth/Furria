import { browserModeIntentOf, searchWithoutBrowserMode } from './browser-mode';

const BROWSER_MODE_KEY = 'furria.browser-mode';
const BROWSER_MODE_ON = 'on';
const CHANGE_EVENT = 'furria:browser-mode';

const announce = (): void => {
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const readBrowserMode = (): boolean => {
  try {
    return window.localStorage.getItem(BROWSER_MODE_KEY) === BROWSER_MODE_ON;
  } catch {
    return false;
  }
};

const storeBrowserMode = (isOn: boolean): void => {
  try {
    if (isOn) {
      window.localStorage.setItem(BROWSER_MODE_KEY, BROWSER_MODE_ON);
    } else {
      window.localStorage.removeItem(BROWSER_MODE_KEY);
    }
  } catch {}
  announce();
};

export const enterBrowserMode = (): void => {
  storeBrowserMode(true);
};

export const leaveBrowserMode = (): void => {
  storeBrowserMode(false);
};

export const subscribeToBrowserMode = (onChange: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

export const applyBrowserModeParam = (): void => {
  const { pathname, search, hash } = window.location;
  const intent = browserModeIntentOf(search);

  if (intent === null) {
    return;
  }
  storeBrowserMode(intent === 'enter');
  window.history.replaceState(
    window.history.state,
    '',
    `${pathname}${searchWithoutBrowserMode(search)}${hash}`,
  );
};
