import { useSyncExternalStore } from 'react';
import type { UploadSnapshot } from '@/features/gallery/upload/create-upload-store';
import { readLinkUploads, subscribeToLinkUploads } from '../link-upload-store';

export const useLinkUploads = (): UploadSnapshot =>
  useSyncExternalStore(subscribeToLinkUploads, readLinkUploads, readLinkUploads);
