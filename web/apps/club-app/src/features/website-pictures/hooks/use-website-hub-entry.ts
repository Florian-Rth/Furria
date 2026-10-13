import { WEBSITE_PAGES, WEBSITE_PICTURE_SLOTS } from '@furria/website-pictures';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useWebsitePicturesQuery } from '../api';
import { websiteBoardOf } from '../website-board';
import { summaryLineOf } from '../website-copy';

export interface WebsiteHubEntry {
  meta: string | undefined;
}

export const useWebsiteHubEntry = (): WebsiteHubEntry | null => {
  const { has } = usePermissions();
  const permitted = has(PERMISSION_KEYS.galleryPublish);
  const query = useWebsitePicturesQuery(permitted);

  if (!permitted) {
    return null;
  }
  if (query.data === undefined) {
    return { meta: undefined };
  }

  const board = websiteBoardOf(WEBSITE_PAGES, WEBSITE_PICTURE_SLOTS, query.data.pictures);

  return { meta: summaryLineOf(board.summary) };
};
