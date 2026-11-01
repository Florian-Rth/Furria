import type { UploadSnapshot } from '@/features/gallery/upload/create-upload-store';
import { createUploadStore } from '@/features/gallery/upload/create-upload-store';
import { linkTusTransport } from '@/lib/media/link-tus-transport';
import { uploadVia } from '@/lib/media/media-upload';

interface LinkUploader {
  token: string;
  name: string | null;
}

let uploader: LinkUploader = { token: '', name: null };

const linkUploads = createUploadStore({
  start: (file) =>
    uploadVia(linkTusTransport(uploader.token), {
      file,
      owner: { kind: 'link', uploaderName: uploader.name },
    }),
  onSent: () => undefined,
});

export const sendThroughLink = (
  files: readonly File[],
  token: string,
  name: string | null,
): void => {
  uploader = { token, name };
  linkUploads.enqueue(files, null);
};

export const retryLinkUpload = linkUploads.retry;
export const retryFailedLinkUploads = linkUploads.retryFailed;
export const subscribeToLinkUploads = linkUploads.subscribe;
export const readLinkUploads = (): UploadSnapshot => linkUploads.read();
