const UPDATE_EVENT = 'furria:app-update';

let isUpdateReady = false;
let reloadIntoUpdate: (() => Promise<void>) | null = null;

export const connectAppUpdate = (reload: () => Promise<void>): void => {
  reloadIntoUpdate = reload;
};

export const markAppUpdateReady = (): void => {
  isUpdateReady = true;
  window.dispatchEvent(new Event(UPDATE_EVENT));
};

export const subscribeToAppUpdate = (onChange: () => void): (() => void) => {
  window.addEventListener(UPDATE_EVENT, onChange);
  return () => {
    window.removeEventListener(UPDATE_EVENT, onChange);
  };
};

export const readAppUpdateReady = (): boolean => isUpdateReady;

export const applyAppUpdate = (): void => {
  void reloadIntoUpdate?.();
};
