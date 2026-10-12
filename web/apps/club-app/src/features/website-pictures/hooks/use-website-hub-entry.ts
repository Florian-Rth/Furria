import type { KkContactStripFrame } from '@furria/ui';
import { vacancyToneOf, WEBSITE_PAGES, WEBSITE_PICTURE_SLOTS } from '@furria/website-pictures';
import { useNavigate } from '@tanstack/react-router';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useWebsitePicturesQuery } from '../api';
import { hubPositionsOf, websiteBoardOf } from '../website-board';
import { positionLabelOf, summaryLineOf, WEBSITE_PATH } from '../website-copy';

export interface WebsiteHubEntry {
  meta: string;
  frames: KkContactStripFrame[];
  open: () => void;
}

export const useWebsiteHubEntry = (): WebsiteHubEntry | null => {
  const { has } = usePermissions();
  const permitted = has(PERMISSION_KEYS.galleryPublish);
  const query = useWebsitePicturesQuery(permitted);
  const navigate = useNavigate();

  if (!permitted || query.data === undefined) {
    return null;
  }

  const board = websiteBoardOf(WEBSITE_PAGES, WEBSITE_PICTURE_SLOTS, query.data.pictures);
  const open = (): void => {
    void navigate({ to: WEBSITE_PATH });
  };
  const frames = hubPositionsOf(board).map((position) => ({
    id: `${position.slot}:${position.position}`,
    label: positionLabelOf(
      position.slotTitle,
      position.position,
      position.count,
      position.aspect,
      position.status,
    ),
    source: position.picture?.picture.picture?.smallUrl ?? undefined,
    vacancy: vacancyToneOf(position.slot, position.position),
  }));

  return { meta: summaryLineOf(board.summary), frames, open };
};
