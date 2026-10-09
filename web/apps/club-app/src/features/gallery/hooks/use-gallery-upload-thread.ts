import type { KkScreenThread } from '@furria/ui';
import { threadLabelOf } from '../upload/upload-copy';
import { tallyOf } from '../upload/upload-queue';
import { uploadStatusOf } from '../upload/upload-status';
import { useUploads } from '../upload/use-uploads';

export const useGalleryUploadThread = (): KkScreenThread | undefined => {
  const uploads = useUploads();
  const status = uploadStatusOf(tallyOf(uploads.entries), uploads.paused, uploads.bytesPerSecond);

  switch (status.kind) {
    case 'running':
      return { value: status.share, tone: 'accent', label: threadLabelOf(status) };
    case 'paused':
      return { value: status.share, tone: 'gold', label: threadLabelOf(status) };
    case 'empty':
    case 'finished':
      return undefined;
  }
};
