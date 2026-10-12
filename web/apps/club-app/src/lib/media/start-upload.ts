import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import type { MediaUpload, UploadHandle } from './media-upload';
import { uploadVia } from './media-upload';
import { tusTransport } from './tus-transport';

const running = new Set<UploadHandle>();

export const startUpload = (upload: MediaUpload): UploadHandle => {
  const handle = uploadVia(tusTransport, upload);

  running.add(handle);
  void handle.done.then(() => {
    running.delete(handle);
  });

  return handle;
};

subscribeToSessionEnd(() => {
  for (const handle of running) {
    handle.pause();
  }
});
