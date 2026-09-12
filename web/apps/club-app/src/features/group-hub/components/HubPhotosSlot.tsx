import { KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { PHOTOS_SLOT_DESCRIPTION, PHOTOS_SLOT_TITLE, RESERVED_BADGE } from '../group-hub-labels';

export const HubPhotosSlot: FC = () => (
  <KkPanelSection title={GROUP_SECTION_TITLES.photos}>
    <KkReservedSlot
      icon="gallery"
      title={PHOTOS_SLOT_TITLE}
      description={PHOTOS_SLOT_DESCRIPTION}
      badge={RESERVED_BADGE}
    />
  </KkPanelSection>
);
