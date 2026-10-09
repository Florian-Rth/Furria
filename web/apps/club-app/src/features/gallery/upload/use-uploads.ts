import { useSyncExternalStore } from 'react';
import type { UploadSnapshot } from './upload-store';
import { readUploads, subscribeToUploads } from './upload-store';

export const useUploads = (): UploadSnapshot =>
  useSyncExternalStore(subscribeToUploads, readUploads, readUploads);
