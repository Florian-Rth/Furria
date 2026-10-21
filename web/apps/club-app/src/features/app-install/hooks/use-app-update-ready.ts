import { useSyncExternalStore } from 'react';
import { readAppUpdateReady, subscribeToAppUpdate } from '../app-update-store';

const assumeCurrent = (): boolean => false;

export const useAppUpdateReady = (): boolean =>
  useSyncExternalStore(subscribeToAppUpdate, readAppUpdateReady, assumeCurrent);
