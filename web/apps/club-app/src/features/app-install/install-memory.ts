const CONFIRMED_KEY = 'furria.app-install-confirmed';
const CONFIRMED = 'yes';

export const readInstallConfirmed = (): boolean => {
  try {
    return window.localStorage.getItem(CONFIRMED_KEY) === CONFIRMED;
  } catch {
    return false;
  }
};

export const rememberInstallConfirmed = (): void => {
  try {
    window.localStorage.setItem(CONFIRMED_KEY, CONFIRMED);
  } catch {}
};
