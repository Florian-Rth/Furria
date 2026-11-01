import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useUploadLinksQuery } from '../api';
import { hubMetaOf } from '../upload-link-copy';
import { inboxCountOf, linkSectionsOf } from '../upload-link-view';

export interface UploadLinksHubEntry {
  meta: string | undefined;
}

export const useUploadLinksHubEntry = (): UploadLinksHubEntry | null => {
  const { has } = usePermissions();
  const permitted = has(PERMISSION_KEYS.galleryManage);
  const query = useUploadLinksQuery(permitted);

  if (!permitted) {
    return null;
  }
  if (query.data === undefined) {
    return { meta: undefined };
  }

  const links = query.data.links;
  const waiting = links.reduce((sum, link) => sum + inboxCountOf(link), 0);

  return { meta: hubMetaOf(linkSectionsOf(links).open.length, waiting) };
};
