import { useSyncExternalStore } from 'react';
import { readDownload, subscribeToDownload } from './download-store';
import type { DownloadJob } from './media-download';

export const useDownload = (): DownloadJob | null =>
  useSyncExternalStore(subscribeToDownload, readDownload, readDownload);
