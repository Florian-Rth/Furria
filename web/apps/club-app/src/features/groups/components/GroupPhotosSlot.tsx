import { KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '../groups-labels';
import { GroupSection } from './GroupSection';

const PHOTOS_TITLE = 'NOCH KEINE BILDER';
const PHOTOS_BADGE = 'reserviert';
const PHOTOS_NOTE =
  'Platz für ein paar Bilder aus vergangenen Sessions. Die Galerie liefert sie später automatisch — hier wird nichts hochgeladen.';

export const GroupPhotosSlot: FC = () => (
  <GroupSection title={GROUP_SECTION_TITLES.photos}>
    <KkReservedSlot
      icon="gallery"
      title={PHOTOS_TITLE}
      description={PHOTOS_NOTE}
      badge={PHOTOS_BADGE}
    />
  </GroupSection>
);
