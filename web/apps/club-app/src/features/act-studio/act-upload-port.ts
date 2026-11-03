import type { StudioUploadPort } from '@furria/studio/studio-uploads';
import { startUpload } from '@/lib/media/start-upload';

export const actUploadPortOf = <TAdded>(
  actId: number,
  add: (mediaItemId: number) => Promise<TAdded>,
): StudioUploadPort => ({
  start: (file) => startUpload({ file, owner: { kind: 'act', id: actId } }),
  add: async (mediaItemId) => {
    await add(mediaItemId);
  },
});
