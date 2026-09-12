import { KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

const PHOTOS_TITLE = 'Noch keine Bilder';
const PHOTOS_NOTE =
  'Platz für Bilder aus euren Sessions. Die Bildergalerie liefert sie später automatisch — hier wird nichts hochgeladen.';
const PHOTOS_BADGE = 'bald';

export const HubPhotosSlot: FC = () => (
  <KkPanelSection title={GROUP_SECTION_TITLES.photos}>
    <KkReservedSlot
      icon="gallery"
      title={PHOTOS_TITLE}
      description={PHOTOS_NOTE}
      badge={PHOTOS_BADGE}
    />
  </KkPanelSection>
);
